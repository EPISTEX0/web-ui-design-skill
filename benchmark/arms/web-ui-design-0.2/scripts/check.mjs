#!/usr/bin/env node
// Renders a page at several widths in headless Chrome, audits layout, contrast and fonts, saves full-page JPEG tiles.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const USAGE = 'Usage: node check.mjs <file-path-or-url> [--widths 390,768,1440] [--out <dir>] [--dark]';
const TILE = 1600;
const MAX_H = 9600;

class SetupError extends Error {}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// In-page: scroll through the page so reveals and lazy images fire, then settle.
async function settle() {
	const sleep = ms => new Promise(r => setTimeout(r, ms));
	const root = document.documentElement;
	await document.fonts.ready;
	for (let y = 0, n = 0; y < root.scrollHeight && n < 80; y += innerHeight, n++) {
		scrollTo({ top: y, behavior: 'instant' });
		await sleep(100);
	}
	scrollTo({ top: root.scrollHeight, behavior: 'instant' });
	await sleep(100);
	await Promise.race([Promise.all([...document.images].map(i => i.decode().catch(() => {}))), sleep(2000)]);
	await document.fonts.ready;
	scrollTo({ top: 0, behavior: 'instant' });
	await sleep(400);
}

// In-page: returns { vw, pageH, pageOverflow, offenders, clipped, scrollers, contrast, unknown, fonts }.
// offenders {sel,right}; clipped/scrollers {sel,content,box}; contrast {sel,text,fg,bg,ratio,need}; unknown {sel,text}; fonts [name].
function audit() {
	const vw = innerWidth;
	const root = document.documentElement;
	const styles = new Map();
	const cs = el => styles.get(el) ?? (styles.set(el, getComputedStyle(el)), styles.get(el));
	const rect = el => el.getBoundingClientRect();
	const tiny = r => r.width <= 1 || r.height <= 1;
	const visible = el => {
		const r = rect(el), s = cs(el);
		return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
	};
	const LANDMARK = new Set(['HEADER', 'NAV', 'MAIN', 'ASIDE', 'FOOTER', 'SECTION']);
	const nameOf = el => {
		const cls = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 2).map(c => '.' + c).join('');
		const tag = el.localName === 'div' && (el.id || cls) ? '' : el.localName;
		return tag + (el.id ? '#' + el.id : cls);
	};
	const label = el => {
		for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
			if (p.id || LANDMARK.has(p.tagName)) return nameOf(p) + ' ' + nameOf(el);
		}
		return nameOf(el);
	};
	const directText = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.nodeValue).join(' ').replace(/\s+/g, ' ').trim();

	const canvas = Object.assign(document.createElement('canvas'), { width: 1, height: 1 });
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	const pixel = () => [...ctx.getImageData(0, 0, 1, 1).data];
	const alphaOf = c => {
		ctx.globalAlpha = 1;
		ctx.clearRect(0, 0, 1, 1);
		ctx.fillStyle = c;
		ctx.fillRect(0, 0, 1, 1);
		return pixel()[3];
	};
	const darkCanvas = /dark/.test(cs(root).colorScheme) && (!/light/.test(cs(root).colorScheme) || matchMedia('(prefers-color-scheme: dark)').matches);
	const compose = (base, bgs, fill, opacity) => {
		ctx.globalAlpha = 1;
		for (const c of [base, ...bgs]) { ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); }
		const bg = pixel();
		ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
		ctx.fillRect(0, 0, 1, 1);
		ctx.globalAlpha = opacity;
		ctx.fillStyle = fill;
		ctx.fillRect(0, 0, 1, 1);
		return [pixel(), bg];
	};
	const lum = c => {
		const f = v => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
		return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
	};
	const hex = c => '#' + c.slice(0, 3).map(v => v.toString(16).padStart(2, '0')).join('');

	const hits = (k, r) => {
		const m = rect(k);
		return m.left <= (r.left + r.right) / 2 && m.right >= (r.left + r.right) / 2 && m.top <= (r.top + r.bottom) / 2 && m.bottom >= (r.top + r.bottom) / 2;
	};
	const mediaKids = new Map();
	const mediaOver = (n, r, el) => {
		if (!mediaKids.has(n)) mediaKids.set(n, [...n.children].filter(k => k.matches('img,video,canvas') && /absolute|fixed/.test(cs(k).position)));
		return mediaKids.get(n).some(k => {
			const m = rect(k);
			return !k.contains(el) && m.left < r.right && m.right > r.left && m.top < r.bottom && m.bottom > r.top;
		});
	};
	const contrastCache = new Map();
	// Returns null to skip, 'unknown' when a background cannot be resolved, else the measured colors.
	const measure = (el, s, r) => {
		if (el.closest(':disabled,[aria-disabled="true"]')) return null;
		let opacity = 1, unknown = false, done = false;
		const bgs = [];
		for (let n = el; n; n = n.parentElement) {
			const ns = cs(n);
			opacity *= +ns.opacity;
			if (n !== el && ns.overflowX !== 'visible' && tiny(rect(n))) return null;
			if (done) continue;
			if (n.matches('svg,img,video,canvas') || mediaOver(n, r, el)) { unknown = done = true; continue; }
			// an out-of-flow element paints over its in-flow siblings, so their backgrounds sit behind it
			const layers = [n, ...(/absolute|fixed/.test(ns.position) ? [...n.parentElement?.children ?? []].filter(k => k !== n && !k.contains(el) && hits(k, r)) : [])];
			for (const k of layers) {
				if (done) break;
				const ks = cs(k);
				if (ks.backgroundImage !== 'none') { unknown = done = true; break; }
				const a = alphaOf(ks.backgroundColor);
				if (a) bgs.unshift(ks.backgroundColor);
				if (a === 255) done = true;
			}
		}
		if (opacity < 0.05) return null;
		const fill = s.webkitTextFillColor || s.color;
		if (alphaOf(fill) === 0) return (s.backgroundClip === 'text' || s.webkitBackgroundClip === 'text') ? 'unknown' : null;
		if (unknown) return 'unknown';
		const key = [fill, opacity, darkCanvas, ...bgs].join('|');
		if (!contrastCache.has(key)) {
			const [fg, bg] = compose(darkCanvas ? '#121212' : '#fff', bgs, fill, opacity);
			const [a, b] = [lum(fg), lum(bg)];
			contrastCache.set(key, { fg: hex(fg), bg: hex(bg), ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) });
		}
		return contrastCache.get(key);
	};

	const over = el => visible(el) && rect(el).right > vw + 1;
	const insideClip = el => {
		for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
			if (cs(p).overflowX !== 'visible' || cs(p).position === 'fixed') return true;
		}
		return false;
	};
	const MEDIA = 'img,video,canvas,picture,iframe,input,select,textarea,button,table,svg';
	const GENERIC = /^(serif|sans-serif|monospace|system-ui|ui-[\w-]+|cursive|fantasy|-apple-system|blinkmacsystemfont|emoji|math|fangsong|inherit|initial)$/i;
	const SYSTEM = /^(helvetica( neue)?|arial|georgia|times( new roman)?|segoe[\w ]*|sf pro[\w ]*|san francisco|menlo|monaco|consolas|courier( new)?|verdana|tahoma|trebuchet ms|palatino[\w ]*|cambria|calibri|avenir[\w ]*|optima|gill sans|baskerville|didot|futura|lucida[\w ]*|impact|ubuntu|cantarell|noto[\w ]*|droid[\w ]*)$/i;
	const clean = f => f.trim().replace(/^["']|["']$/g, '');

	const res = { vw, viewportMeta: !!document.querySelector('meta[name=viewport]'), pageH: root.scrollHeight, pageOverflow: root.scrollWidth - vw, offenders: [], clipped: [], scrollers: [], contrast: [], unknown: [], fonts: [] };
	const families = new Set();
	for (const el of document.body.querySelectorAll('*')) {
		if (!visible(el)) continue;
		const s = cs(el), r = rect(el);
		if (over(el) && s.position !== 'fixed' && !insideClip(el) && !(el.parentElement !== document.body && over(el.parentElement))) {
			const decor = !el.textContent.trim() && !el.matches(MEDIA) && !el.querySelector(MEDIA);
			if (!decor) res.offenders.push({ sel: label(el), right: Math.round(rect(el).right) });
		}
		const wide = el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0 && !tiny(r);
		const box = { sel: label(el), content: el.scrollWidth, box: el.clientWidth };
		if (wide && /hidden|clip/.test(s.overflowX) && s.textOverflow !== 'ellipsis') res.clipped.push(box);
		if (wide && /auto|scroll/.test(s.overflowX)) res.scrollers.push(box);

		const text = directText(el);
		if (!text || tiny(r)) continue;
		families.add(clean(s.fontFamily.split(',')[0]));
		const m = measure(el, s, r);
		if (!m) continue;
		const sel = label(el), shown = text.slice(0, 40);
		if (m === 'unknown') { res.unknown.push({ sel, text: shown }); continue; }
		const large = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && parseInt(s.fontWeight) >= 700);
		const need = large ? 3 : 4.5;
		if (m.ratio < need) res.contrast.push({ sel, text: shown, fg: m.fg, bg: m.bg, ratio: Math.floor(m.ratio * 10) / 10, need });
	}

	const declared = new Set(), errored = new Set();
	document.fonts.forEach(f => {
		declared.add(clean(f.family));
		if (f.status === 'error') errored.add(clean(f.family));
	});
	const probe = document.createElement('canvas').getContext('2d');
	const widthOf = font => { probe.font = `72px ${font}`; return probe.measureText('mmmmmmmmmmlli WwQq 0123456789').width; };
	const unavailable = f => widthOf(`"${f}", monospace`) === widthOf('monospace') && widthOf(`"${f}", serif`) === widthOf('serif');
	for (const f of families) {
		if (!f || GENERIC.test(f) || (!declared.has(f) && SYSTEM.test(f))) continue;
		if (unavailable(f)) errored.add(f);
	}
	res.fonts = [...errored];
	return res;
}

function parseArgs(argv) {
	const o = { widths: [390, 768, 1440], dark: false };
	const rest = [];
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--dark') o.dark = true;
		else if (a === '--widths') o.widths = (argv[++i] ?? '').split(',').map(Number);
		else if (a === '--out') { o.out = argv[++i]; if (!o.out) throw new SetupError(`--out needs a directory. ${USAGE}`); }
		else if (a.startsWith('--')) throw new SetupError(`Unknown option ${a}. ${USAGE}`);
		else rest.push(a);
	}
	if (rest.length !== 1) throw new SetupError(USAGE);
	if (o.widths.some(w => !Number.isInteger(w) || w < 200 || w > 4000)) throw new SetupError('--widths takes comma-separated integers from 200 to 4000, e.g. 390,768,1440.');
	const t = rest[0];
	if (/^(https?|file|data):/i.test(t)) {
		const u = new URL(t);
		o.url = t;
		o.name = path.basename(u.pathname, path.extname(u.pathname)) || u.hostname;
	} else {
		const abs = path.resolve(t);
		if (!fs.existsSync(abs)) throw new SetupError(`File not found: ${t}`);
		o.url = pathToFileURL(abs).href;
		o.name = path.basename(abs, path.extname(abs));
	}
	o.out ??= path.join(os.tmpdir(), 'ui-check', o.name.replace(/[^\w.-]/g, '_'));
	return o;
}

function findChrome() {
	const fail = () => new SetupError('No Chrome or Chromium found. Set CHROME_PATH, or render with your own browser tool.');
	const ok = p => { try { fs.accessSync(p, fs.constants.X_OK); return fs.statSync(p).isFile(); } catch { return false; } };
	if (process.env.CHROME_PATH) {
		if (ok(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
		throw new SetupError(`CHROME_PATH is not an executable file: ${process.env.CHROME_PATH}`);
	}
	const names = ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable', 'chrome', 'microsoft-edge'];
	for (const dir of (process.env.PATH ?? '').split(path.delimiter)) {
		for (const n of names) if (dir && ok(path.join(dir, n))) return path.join(dir, n);
	}
	const mac = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'];
	const found = mac.find(ok);
	if (found) return found;
	const pw = path.join(os.homedir(), '.cache', 'ms-playwright');
	const dirs = fs.existsSync(pw) ? fs.readdirSync(pw).sort().reverse() : [];
	for (const d of dirs) {
		const base = path.join(pw, d);
		const subs = fs.readdirSync(base);
		if (d.startsWith('chromium-')) for (const s of subs.filter(s => s.startsWith('chrome-linux'))) if (ok(path.join(base, s, 'chrome'))) return path.join(base, s, 'chrome');
		if (d.startsWith('chromium_headless_shell-')) for (const s of subs) if (ok(path.join(base, s, 'chrome-headless-shell'))) return path.join(base, s, 'chrome-headless-shell');
	}
	throw fail();
}

async function launch(exe, profile, extra = []) {
	const args = ['--headless', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio', '--disable-gpu', ...extra, 'about:blank'];
	const child = spawn(exe, args, { stdio: ['ignore', 'ignore', 'pipe'], detached: true });
	let exited = false, tail = '';
	const gone = new Promise(r => { child.once('exit', () => { exited = true; r(); }); child.once('error', e => { tail = e.message; exited = true; r(); }); });
	const wsUrl = await new Promise(res => {
		const t = setTimeout(() => res(null), 20000);
		let seen = false;
		child.stderr.on('data', d => {
			if (seen) return;
			tail = (tail + d).slice(-500);
			const m = tail.match(/DevTools listening on (ws:\/\/\S+)/);
			if (m) { seen = true; clearTimeout(t); res(m[1]); }
		});
		gone.then(() => { clearTimeout(t); res(null); });
	});
	const kill = async () => {
		if (!exited) { try { process.kill(-child.pid, 'SIGKILL'); } catch { /* already gone */ } }
		await Promise.race([gone, sleep(2000)]);
	};
	return { wsUrl, kill, tail: tail.trim().split('\n').pop() };
}

async function connect(wsUrl) {
	const ws = new WebSocket(wsUrl);
	await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new SetupError('Could not connect to the browser DevTools socket.')); });
	let id = 0;
	const pending = new Map(), handlers = new Map();
	ws.onmessage = ({ data }) => {
		const m = JSON.parse(data);
		if (m.id) {
			const p = pending.get(m.id);
			pending.delete(m.id);
			if (m.error) p.rej(new Error(`${p.method}: ${m.error.message}`)); else p.res(m.result);
		} else for (const h of [...(handlers.get(m.method) ?? [])]) h(m.params);
	};
	ws.onclose = () => { for (const p of pending.values()) p.rej(new Error('Browser closed the connection.')); pending.clear(); };
	const send = (method, params = {}) => new Promise((res, rej) => { pending.set(++id, { res, rej, method }); ws.send(JSON.stringify({ id, method, params })); });
	const on = (method, h) => { if (!handlers.has(method)) handlers.set(method, new Set()); handlers.get(method).add(h); return () => handlers.get(method).delete(h); };
	const once = (method, ms = 30000) => new Promise(res => { const off = on(method, () => { off(); res(); }); setTimeout(() => { off(); res(); }, ms); });
	return { send, on, once, close: () => ws.close() };
}

function sink() {
	const groups = new Map();
	const add = (level, kind, key, msg, cap = 12) => {
		const g = level + kind;
		if (!groups.has(g)) groups.set(g, { level, kind, cap, rows: new Map(), total: 0 });
		const grp = groups.get(g);
		if (grp.rows.has(key)) { grp.rows.get(key).n++; return; }
		grp.total++;
		grp.rows.set(key, { msg, n: 1 });
	};
	const lines = () => [...groups.values()].flatMap(g => {
		const rows = [...g.rows.values()].slice(0, g.cap).map(r => `  ${g.level} ${g.kind.padEnd(9)} ${r.msg}${r.n > 1 ? ` (x${r.n})` : ''}`);
		if (g.total > g.cap) rows.push(`  ${g.level} ${g.kind.padEnd(9)} ... and ${g.total - g.cap} more`);
		return rows;
	});
	const count = level => [...groups.values()].filter(g => g.level === level).reduce((n, g) => n + g.total, 0);
	return { add, lines, count };
}

async function runWidth(cdp, o, width, dark, errors) {
	// mobile:true would stretch the layout viewport to fit overflowing content, hiding the very overflow we look for
	await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: width < 600 ? 844 : 900, deviceScaleFactor: 1, mobile: false });
	await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }] });
	errors.length = 0;
	const loaded = cdp.once('Page.loadEventFired');
	const nav = await cdp.send('Page.navigate', { url: o.url });
	if (nav.errorText) throw new SetupError(`Could not load ${o.url}: ${nav.errorText}`);
	await loaded;
	const ev = await cdp.send('Runtime.evaluate', { expression: `(async () => { await (${settle})(); return (${audit})(); })()`, awaitPromise: true, returnByValue: true });
	if (ev.exceptionDetails) throw new Error(`Audit failed: ${ev.exceptionDetails.exception?.description ?? ev.exceptionDetails.text}`);
	const a = ev.result.value;
	const rows = sink();
	if (width < 600 && !a.viewportMeta) rows.add('FAIL', 'viewport', 'vp', 'no <meta name="viewport">, phones lay this page out at 980px');
	if (a.pageOverflow > 1) rows.add('FAIL', 'overflow', 'page', `page scrolls sideways by ${a.pageOverflow}px`);
	for (const x of a.offenders) rows.add('FAIL', 'overflow', x.sel + x.right, `${x.sel}  right edge ${x.right}px, viewport ${a.vw}px`);
	for (const x of a.clipped) rows.add('WARN', 'clipped', x.sel + x.content + x.box, `${x.sel}  content ${x.content}px in a ${x.box}px box`);
	for (const x of a.scrollers) {
		if (a.vw < 600 && x.box < a.vw * 0.6) rows.add('WARN', 'narrow', x.sel + x.content + x.box, `${x.sel}  content ${x.content}px squeezed into a ${x.box}px column, a grid that did not stack on phones`);
		else rows.add('NOTE', 'scrolls', x.sel + x.content + x.box, `${x.sel}  content ${x.content}px in a ${x.box}px box, check the cut edge is visible`);
	}
	// One row per color pair: the fix is usually one token, not each element.
	for (const x of a.contrast) rows.add('FAIL', 'contrast', x.fg + x.bg + x.need, `${x.fg} on ${x.bg}  ${x.ratio.toFixed(1)}:1, needs ${x.need}:1, e.g. ${x.sel} "${x.text}"`);
	for (const x of a.unknown) rows.add('NOTE', 'contrast', x.sel, `${x.sel} "${x.text}"  text over image or gradient, check visually`, 5);
	for (const f of a.fonts) rows.add('FAIL', 'font', f, `"${f}" not loaded, text renders in fallback`);
	for (const e of [...new Set(errors)].slice(0, 5)) rows.add('FAIL', 'js', e, e);

	const height = Math.min(a.pageH, MAX_H);
	const tag = `${width}${dark ? '-dark' : ''}`;
	const files = [];
	for (let y = 0, i = 1; y < height; y += TILE, i++) {
		const shot = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 80, captureBeyondViewport: true, clip: { x: 0, y, width, height: Math.min(TILE, height - y), scale: 1 } });
		const file = path.join(o.out, `${tag}-${i}.jpg`);
		fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
		files.push(file);
	}
	const capped = a.pageH > MAX_H ? ` (page is ${a.pageH}px tall, tiles stop at ${MAX_H}px)` : '';
	const span = files.length > 1 ? `${files[0]} … ${path.basename(files.at(-1))}` : files[0];
	return { rows, files, tag, text: [`${width}px${dark ? ' dark' : ''}  page ${width}x${a.pageH}, ${files.length} tile${files.length > 1 ? 's' : ''}${capped}`, ...rows.lines(), `  tiles ${span}`].join('\n') };
}

async function main() {
	if (Number(process.versions.node.split('.')[0]) < 22) throw new SetupError(`Node 22 or newer is required (found ${process.versions.node}).`);
	const o = parseArgs(process.argv.slice(2));
	const exe = findChrome();
	fs.mkdirSync(o.out, { recursive: true });
	for (const f of fs.readdirSync(o.out)) if (/^\d+(-dark)?-\d+\.jpg$/.test(f)) fs.rmSync(path.join(o.out, f));

	const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-check-profile-'));
	let browser, cdp;
	const cleanup = async () => {
		cdp?.close();
		await browser?.kill();
		fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3 });
	};
	for (const sig of ['SIGINT', 'SIGTERM']) process.once(sig, () => cleanup().finally(() => process.exit(2)));
	try {
		browser = await launch(exe, profile);
		if (!browser.wsUrl) {
			await browser.kill();
			browser = await launch(exe, profile, ['--no-sandbox']);
		}
		if (!browser.wsUrl) throw new SetupError(`Chrome failed to start (${exe}): ${browser.tail || 'no output'}. Set CHROME_PATH to a working browser.`);
		const port = new URL(browser.wsUrl).port;
		const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
		cdp = await connect(target.webSocketDebuggerUrl);

		const errors = [];
		const firstLine = s => String(s ?? '').split('\n')[0].slice(0, 160);
		cdp.on('Runtime.exceptionThrown', p => errors.push(firstLine(p.exceptionDetails.exception?.description ?? p.exceptionDetails.exception?.value ?? p.exceptionDetails.text)));
		cdp.on('Runtime.consoleAPICalled', p => { if (p.type === 'error') errors.push(firstLine(p.args.map(a => a.value ?? a.description).join(' '))); });
		cdp.on('Log.entryAdded', p => { if (p.entry.level === 'error' && !/favicon\.ico/.test(p.entry.url ?? '')) errors.push(firstLine(p.entry.text)); });
		await cdp.send('Page.enable');
		await cdp.send('Runtime.enable');
		await cdp.send('Log.enable');

		const blocks = [];
		for (const width of o.widths) {
			for (const dark of o.dark ? [false, true] : [false]) blocks.push(await runWidth(cdp, o, width, dark, errors));
		}
		const fails = blocks.reduce((n, b) => n + b.rows.count('FAIL'), 0);
		const warns = blocks.reduce((n, b) => n + b.rows.count('WARN'), 0);
		console.log([...blocks.map(b => b.text), '', `${fails} failure${fails === 1 ? '' : 's'}, ${warns} warning${warns === 1 ? '' : 's'}`, 'tiles to open:', ...blocks.map(b => `  ${b.tag}  ${b.files.join(' ')}`)].join('\n'));
		return fails ? 1 : 0;
	} finally {
		await cleanup();
	}
}

try {
	process.exit(await main());
} catch (e) {
	console.error(e instanceof SetupError ? e.message : `check.mjs failed: ${e.stack ?? e.message}`);
	process.exit(2);
}
