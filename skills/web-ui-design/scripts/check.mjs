#!/usr/bin/env node
// Renders a page at several widths in headless Chrome, audits layout, contrast, fonts, tap targets and wide tables, saves full-page JPEG tiles.
// Extra checks: tap targets (WCAG 2.5.8 24px FAIL unless the spacing exception holds, 44px height WARN under 600px wide) and sideways-scrolling tables run at every width.
// Under 600px a control starting past the right edge of the viewport or of a clipping or scrolling ancestor is a FAIL (out of reach); a sideways-scrolling chip row or scroll-snap carousel is a NOTE.
// Placeholder text (TBC, "dates to confirm", [Bracketed gaps], lorem ipsum) is a WARN, reported once at the narrowest width.
// Keyboard focus (up to 40 Tab presses, FAIL when a focused element shows no visible change) runs at the widest width.
// Performance (LCP, CLS, bytes by type, WARN over budget; --budget landing makes JS over 50 KB or more than 2 font files a FAIL) runs on a cache-free load at the narrowest width.
// Exit codes: 0 no FAIL, 1 any FAIL, 2 setup error. --dark repeats layout checks in dark mode but not focus or performance.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const USAGE = 'Usage: node check.mjs <file-path-or-url> [--widths 390,768,1440] [--out <dir>] [--dark] [--budget landing]';
const TILE = 1600;
const MAX_TABS = 40;
const MAX_H = 9600;
// Over-budget rows are WARN by default; a landing page has tighter JS and font-file limits and going over either is a FAIL (the 250 KB font total stays a WARN).
const BUDGETS = {
	default: { level: 'WARN', js: 300 * 1024, fontFiles: 4 },
	landing: { level: 'FAIL', js: 50 * 1024, fontFiles: 2 },
};
const FONT_BYTES = 250 * 1024;

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

// In-page, also passed to the other in-page functions: names an element for output. label is a readable path, pat is the pattern shared by repeats.
function selectorTools() {
	const LANDMARK = new Set(['HEADER', 'NAV', 'MAIN', 'ASIDE', 'FOOTER', 'SECTION']);
	const classes = el => (el.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 2).map(c => '.' + c).join('');
	const nameOf = el => {
		const cls = classes(el);
		const tag = el.localName === 'div' && (el.id || cls) ? '' : el.localName;
		return tag + (el.id ? '#' + el.id : cls);
	};
	const label = el => {
		for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
			if (p.id || LANDMARK.has(p.tagName)) return nameOf(p) + ' ' + nameOf(el);
		}
		return nameOf(el);
	};
	const role = el => el.getAttribute('role');
	const pat = el => el.localName + (el.localName === 'input' ? `[type=${el.type}]` : role(el) ? `[role=${role(el)}]` : '') + classes(el);
	return { nameOf, label, pat };
}

// In-page: returns { vw, pageH, pageOverflow, offenders, clipped, scrollers, contrast, unknown, taps, tables, fonts }.
// offenders {sel,right}; clipped/scrollers {sel,content,box}; contrast {sel,text,fg,bg,ratio,need}; unknown {sel,text};
// taps {sel,pat,text,w,h,fail}; tables {sel,content,box,sticky} and reach {sel,text,left,by,edge,chip} (phone widths only); fonts [name].
function audit(selectorTools) {
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
	const { nameOf, label, pat } = selectorTools();
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

	const res = { vw, viewportMeta: !!document.querySelector('meta[name=viewport]'), pageH: root.scrollHeight, pageOverflow: root.scrollWidth - vw, offenders: [], clipped: [], scrollers: [], contrast: [], unknown: [], taps: [], tables: [], reach: [], fonts: [] };
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

	const NATIVE = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link]';
	const proseCache = new Map();
	// Letters and digits in a block outside its own links and buttons. A link inside real sentence text is exempt from the 24px minimum.
	const prose = block => {
		if (!proseCache.has(block)) {
			let n = 0;
			const walk = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
			for (let t; (t = walk.nextNode());) {
				const c = t.parentElement?.closest('a,button,script,style,noscript');
				if (!c || !block.contains(c)) n += (t.nodeValue.match(/[\p{L}\p{N}]/gu) ?? []).length;
			}
			proseCache.set(block, n);
		}
		return proseCache.get(block);
	};
	const inlineLink = el => {
		if (el.localName !== 'a' || cs(el).display !== 'inline') return false;
		let block = el.parentElement;
		while (block && cs(block).display === 'inline') block = block.parentElement;
		return !!block && prose(block) >= 3;
	};
	const clippedAway = el => {
		for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
			if ((cs(p).overflowX !== 'visible' || cs(p).overflowY !== 'visible') && tiny(rect(p))) return true;
		}
		return false;
	};
	const textOf = el => (el.getAttribute('aria-label') || el.innerText || el.value || el.title || el.getAttribute('placeholder') || '').replace(/\s+/g, ' ').trim().slice(0, 30);
	const targets = [];
	for (const el of document.body.querySelectorAll(`${NATIVE},[tabindex]`)) {
		if (el.matches(':disabled') || el.closest('[inert]')) continue;
		if (!el.matches(NATIVE) && el.tabIndex < 0) continue;
		if (!visible(el) || !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) || clippedAway(el)) continue;
		let r = rect(el);
		// a native checkbox or radio is clicked through its label
		if (el.matches('input[type=checkbox],input[type=radio]')) for (const l of el.labels) { const m = rect(l); if (m.width * m.height > r.width * r.height) r = m; }
		if (tiny(r) || r.right <= 0 || r.bottom <= 0) continue;
		const [w, h] = [Math.round(r.width), Math.round(r.height)];
		targets.push({ el, r, w, h, small: w < 24 || h < 24, exempt: inlineLink(el) });
	}
	// WCAG 2.5.8 spacing exception: a 24px circle centred on an undersized target must not meet another target or the circle of another undersized one.
	// A target and the targets nested in it do not count against each other.
	const EPS = 0.01;
	const crowded = t => {
		const [x, y] = [(t.r.left + t.r.right) / 2, (t.r.top + t.r.bottom) / 2];
		return targets.some(o => {
			if (o === t || o.el.contains(t.el) || t.el.contains(o.el)) return false;
			if (Math.hypot(Math.max(o.r.left - x, x - o.r.right, 0), Math.max(o.r.top - y, y - o.r.bottom, 0)) < 12 - EPS) return true;
			return o.small && Math.hypot(x - (o.r.left + o.r.right) / 2, y - (o.r.top + o.r.bottom) / 2) < 24 - EPS;
		});
	};
	for (const t of targets) {
		if (t.exempt) continue;
		const fail = t.small && crowded(t);
		if (!fail && !(vw < 600 && t.h < 44)) continue;
		res.taps.push({ sel: label(t.el), pat: pat(t.el), text: textOf(t.el), w: t.w, h: t.h, fail });
	}

	if (vw < 600) {
		const FIRST = 'tr > :first-child,[role=row] > :first-child';
		for (const t of document.body.querySelectorAll('table,[role=table],[role=grid]')) {
			if (!visible(t)) continue;
			const own = cs(t).display !== 'table' && /auto|scroll|hidden|clip/.test(cs(t).overflowX);
			let box = own ? t : t.parentElement;
			while (box && box !== root && box !== document.body && !/auto|scroll|hidden|clip/.test(cs(box).overflowX)) box = box.parentElement;
			const boxW = box && box !== root && box !== document.body ? box.clientWidth : vw;
			const content = Math.max(rect(t).width, t.scrollWidth);
			if (content <= boxW + 1) continue;
			const firsts = [...t.querySelectorAll(FIRST)].filter(c => c.closest('table,[role=table],[role=grid]') === t).slice(0, 8);
			res.tables.push({ sel: label(t), content: Math.round(content), box: boxW, sticky: firsts.length > 0 && firsts.every(c => cs(c).position === 'sticky') });
		}
	}

	if (vw < 600) {
		const CONTROL = 'button,[role=button],a[href],input:not([type=hidden]),select,textarea';
		const closedDetails = el => {
			for (let d = el.closest('details:not([open])'); d; d = d.parentElement?.closest('details:not([open])')) {
				if (!d.querySelector(':scope > summary')?.contains(el)) return true;
			}
			return false;
		};
		// an off-canvas drawer or a skip link parked past the right edge on purpose
		const parked = el => {
			for (let p = el; p && p !== document.body; p = p.parentElement) if (/absolute|fixed/.test(cs(p).position) && rect(p).left >= vw) return true;
			return false;
		};
		// a scroller whose children are all small controls in one row, like a filter bar
		const chipRow = scroller => {
			let row = scroller;
			while (row.children.length === 1 && !row.firstElementChild.matches(CONTROL)) row = row.firstElementChild;
			const kids = [...row.children].filter(visible);
			if (kids.length < 2) return false;
			const first = rect(kids[0]);
			return kids.every(k => {
				const r = rect(k);
				const own = k.matches(CONTROL) ? k : k.querySelectorAll(CONTROL).length === 1 ? k.querySelector(CONTROL) : null;
				return own && own.textContent.trim() === k.textContent.trim() && r.height <= 56 && r.width <= 240 && r.top < first.bottom && r.bottom > first.top;
			});
		};
		for (const el of document.body.querySelectorAll(CONTROL)) {
			if (!visible(el) || !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) || clippedAway(el) || el.closest('[hidden],[aria-hidden="true"],[inert]') || closedDetails(el)) continue;
			const r = rect(el);
			if (tiny(r)) continue;
			// walk the containing blocks: a fixed box ignores ancestors' clipping and an absolute one ignores those it is not inside of
			const cuts = [];
			let mode = cs(el).position;
			for (let p = el.parentElement; p && p !== document.body && p !== root; p = p.parentElement) {
				const ps = cs(p);
				const skip = mode === 'fixed' ? ps.transform === 'none' : mode === 'absolute' && ps.position === 'static' && ps.transform === 'none';
				if (skip) continue;
				const edge = Math.round(rect(p).left + p.clientLeft + p.clientWidth);
				if (ps.overflowX !== 'visible' && r.left >= edge) cuts.push({ p, edge });
				mode = /absolute|fixed/.test(ps.position) ? ps.position : 'flow';
			}
			const pastViewport = r.left >= vw;
			if ((!cuts.length && !pastViewport) || parked(el)) continue;
			const by = cuts[0];
			const inside = !!by && (!pastViewport || by.edge <= vw + 1);
			const chip = inside && chipRow(by.p);
			// a scroll-snap carousel is a swipe pattern people know, unlike a table that hides its last columns
			const carousel = inside && !chip && cs(by.p).scrollSnapType !== 'none';
			res.reach.push({ sel: label(el), text: textOf(el) || pat(el), left: Math.round(r.left), by: by ? label(by.p) : null, edge: by?.edge, chip, carousel });
		}
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
	const PLACEHOLDER = /\b(?:TBC|TBD|TBA|to be (?:confirmed|announced)|lorem ipsum|(?:dates?|times?|prices?|details?|hours?|address) (?:to|coming) (?:confirm|come|soon))\b|\[(?:[A-Z][a-z]+(?: [a-z]+){0,3}|\.\.\.|…)\]/gi;
	res.placeholders = [...new Set(document.body.innerText.match(PLACEHOLDER) ?? [])];
	return res;
}

// In-page: returns { start, step, done } for the Tab walk. Only changes that paint count: an outline, border or underline that is off in both states cannot differ visibly.
function focusKit(selectorTools) {
	const { label, pat } = selectorTools();
	const CHAIN = 3;
	const stops = [];
	const snapshot = el => {
		const s = getComputedStyle(el);
		const out = [s.backgroundColor, s.boxShadow];
		out.push(s.outlineStyle === 'none' || parseFloat(s.outlineWidth) === 0 ? 'no outline' : [s.outlineStyle, s.outlineWidth, s.outlineColor].join(' '));
		for (const side of ['Top', 'Right', 'Bottom', 'Left']) out.push(s[`border${side}Style`] === 'none' || parseFloat(s[`border${side}Width`]) === 0 ? 'no border' : s[`border${side}Color`]);
		out.push(s.textDecorationLine === 'none' ? 'no underline' : [s.textDecorationLine, s.textDecorationStyle, s.textDecorationColor].join(' '));
		return out;
	};
	// Before the first Tab: stop transitions from skewing the focused-versus-blurred comparison and start from the top.
	const start = () => {
		document.head.append(Object.assign(document.createElement('style'), { textContent: '*,*::before,*::after{transition:none!important}' }));
		document.activeElement?.blur();
		scrollTo({ top: 0, behavior: 'instant' });
	};
	// After each Tab: records the focused element, whether it can be seen, and its styles, and those of its nearest ancestors for :focus-within rings.
	const step = () => {
		const el = document.activeElement;
		if (!el || el === document.body || el === document.documentElement) return { end: 'focus left the page' };
		if (stops.some(s => s.el === el)) return { end: 'focus wrapped around' };
		const chain = [el];
		for (let p = el.parentElement; p && p !== document.body && chain.length <= CHAIN; p = p.parentElement) chain.push(p);
		const r = el.getBoundingClientRect();
		const x = r.left + scrollX, y = r.top + scrollY;
		let hidden = null;
		if (r.width <= 1 || r.height <= 1) hidden = 'zero size';
		else if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) hidden = 'display, visibility or opacity hides it';
		else if (x + r.width <= 0 || y + r.height <= 0 || x >= document.documentElement.scrollWidth) hidden = 'off-screen';
		stops.push({ el, chain, hidden, focused: chain.map(snapshot) });
		return { n: stops.length };
	};
	// After the last Tab: blurs, then reports each stop as visible or not and whether anything about it changed.
	const done = () => {
		document.activeElement?.blur();
		return stops.map(({ el, chain, hidden, focused }) => {
			const blurred = chain.map(snapshot);
			const changed = chain.some((_, i) => focused[i].some((v, j) => v !== blurred[i][j]));
			const text = (el.getAttribute('aria-label') || el.innerText || el.value || el.title || '').replace(/\s+/g, ' ').trim().slice(0, 30);
			return { sel: label(el), pat: pat(el), text, hidden, changed };
		});
	};
	return { start, step, done };
}

// In-page: LCP and CLS, read after the page has settled. Resolves after the buffered observers have delivered.
async function perfProbe() {
	const collect = type => new Promise(res => {
		const got = [];
		new PerformanceObserver(list => got.push(...list.getEntries())).observe({ type, buffered: true });
		setTimeout(() => res(got), 120);
	});
	const [lcp, shifts] = await Promise.all([collect('largest-contentful-paint'), collect('layout-shift')]);
	// CLS is the worst session window: shifts less than 1s apart, a window at most 5s long
	let cls = 0, win = 0, first = 0, prev = 0;
	for (const e of shifts) {
		if (e.hadRecentInput) continue;
		if (win && e.startTime - prev < 1000 && e.startTime - first < 5000) win += e.value;
		else { win = e.value; first = e.startTime; }
		prev = e.startTime;
		cls = Math.max(cls, win);
	}
	return { lcp: lcp.length ? Math.round(lcp.at(-1).startTime) : null, cls };
}

function parseArgs(argv) {
	const o = { widths: [390, 768, 1440], dark: false, budget: 'default' };
	const rest = [];
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--dark') o.dark = true;
		else if (a === '--widths') o.widths = (argv[++i] ?? '').split(',').map(Number);
		else if (a === '--budget') {
			o.budget = argv[++i];
			if (o.budget !== 'landing') throw new SetupError('--budget takes landing, e.g. --budget landing.');
		}
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
		o.id = t;
	} else {
		const abs = path.resolve(t);
		if (!fs.existsSync(abs)) throw new SetupError(`File not found: ${t}`);
		o.url = pathToFileURL(abs).href;
		o.name = path.basename(abs, path.extname(abs));
		o.id = abs;
	}
	// Two index.html files must not share tiles, so the folder name carries a short hash of what was checked.
	o.out ??= path.join(os.tmpdir(), 'ui-check', `${o.name.replace(/[^\w.-]/g, '_')}-${createHash('sha1').update(o.id).digest('hex').slice(0, 8)}`);
	return o;
}

function findChrome() {
	const fail = () => new SetupError('No Chrome or Chromium found. Set CHROME_PATH, or render with your own browser tool.');
	const ok = p => { try { fs.accessSync(p, fs.constants.X_OK); return fs.statSync(p).isFile(); } catch { return false; } };
	if (process.env.CHROME_PATH) {
		if (ok(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
		throw new SetupError(`CHROME_PATH is not an executable file: ${process.env.CHROME_PATH}`);
	}
	const names = ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable', 'chrome', 'microsoft-edge', 'brave', 'brave-browser'];
	for (const dir of (process.env.PATH ?? '').split(path.delimiter)) {
		for (const n of names) if (dir && ok(path.join(dir, n))) return path.join(dir, n);
	}
	const fixed = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/brave', '/opt/brave-bin/brave', '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'];
	const found = fixed.find(ok);
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

async function evalValue(cdp, expression) {
	const ev = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
	if (ev.exceptionDetails) throw new Error(`Audit failed: ${ev.exceptionDetails.exception?.description ?? ev.exceptionDetails.text}`);
	return ev.result.value;
}

const kb = b => `${(b / 1024).toFixed(b < 10240 ? 1 : 0)} KB`;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Presses Tab up to MAX_TABS times and judges every stop.
async function checkFocus(cdp, rows) {
	await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
	await evalValue(cdp, `window.__focus = (${focusKit})(${selectorTools}); window.__focus.start()`);
	let stops = 0, end = `stopped at the ${MAX_TABS} Tab limit`;
	for (let i = 0; i < MAX_TABS; i++) {
		for (const type of ['keyDown', 'keyUp']) await cdp.send('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
		const r = await evalValue(cdp, 'window.__focus.step()');
		if (r.end) { end = r.end; break; }
		stops = r.n;
	}
	for (const x of await evalValue(cdp, 'window.__focus.done()')) {
		if (x.hidden) rows.add('WARN', 'focus', x.pat + x.hidden, `${x.pat}  Tab lands on an element you cannot see (${x.hidden}), e.g. ${x.sel} "${x.text}"`);
		else if (!x.changed) rows.add('FAIL', 'focus', x.pat, `${x.pat}  no visible focus indicator, e.g. ${x.sel} "${x.text}"`);
	}
	rows.add('NOTE', 'focus', 'stops', `Tab reached ${plural(stops, 'stop')} (${end})`);
}

const NET_KINDS = { Script: 'script', Stylesheet: 'stylesheet', Font: 'font', Image: 'image' };

// Resource Timing is empty for file:// subresources, so sizes come from the Network domain. Its byte count
// is unreliable for file://, so a local file is measured on disk. Cache is off so the load is a fresh one.
async function watchNetwork(cdp) {
	const seen = new Map();
	const offs = [
		cdp.on('Network.responseReceived', p => { if (!p.response.url.startsWith('data:')) seen.set(p.requestId, { name: p.response.url, type: p.type, bytes: 0 }); }),
		cdp.on('Network.loadingFinished', p => { if (seen.has(p.requestId)) seen.get(p.requestId).bytes = p.encodedDataLength; }),
	];
	await cdp.send('Network.enable');
	await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
	return async () => {
		for (const off of offs) off();
		await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });
		await cdp.send('Network.disable');
		return [...seen.values()].map(e => {
			if (e.name.startsWith('file:')) { try { e.bytes = fs.statSync(fileURLToPath(e.name)).size; } catch { /* missing file */ } }
			return e;
		});
	};
}

function perfRows(rows, p, budget) {
	const limit = BUDGETS[budget];
	const tag = budget === 'default' ? '' : ` (${budget} budget)`;
	const kinds = { script: [], stylesheet: [], font: [], image: [] };
	const unknown = p.files.filter(e => NET_KINDS[e.type] && !e.bytes);
	for (const e of p.files) if (NET_KINDS[e.type]) kinds[NET_KINDS[e.type]].push({ name: e.name.split(/[?#]/)[0], bytes: e.bytes });
	const sum = list => list.reduce((n, x) => n + x.bytes, 0);
	const doc = p.files.find(e => e.type === 'Document')?.bytes ?? 0;
	const big = kinds.image.reduce((m, x) => Math.max(m, x.bytes), 0);
	const parts = [
		p.lcp === null ? 'LCP none' : `LCP ${p.lcp} ms`,
		`CLS ${p.cls.toFixed(3)}`,
		`JS ${kb(sum(kinds.script))} (${plural(kinds.script.length, 'file')})`,
		`CSS ${kb(sum(kinds.stylesheet))} (${plural(kinds.stylesheet.length, 'file')})`,
		`fonts ${kb(sum(kinds.font))} (${plural(kinds.font.length, 'file')})`,
		`images ${kb(sum(kinds.image))} (${plural(kinds.image.length, 'file')}${big ? `, largest ${kb(big)}` : ''})`,
		`document ${kb(doc)}`,
	];
	rows.add('NOTE', 'perf', 'numbers', parts.join(', ') + (unknown.length ? `; ${plural(unknown.length, 'file')} of unknown size` : ''));
	if (p.cls > 0.1) rows.add('WARN', 'perf', 'cls', `CLS ${p.cls.toFixed(3)}, over 0.1; give images and embeds a width and height, and keep late content from pushing text down`);
	if (p.lcp > 2500) rows.add('WARN', 'perf', 'lcp', `LCP ${p.lcp} ms, over 2500 ms; shrink or preload the largest image or text block`);
	if (sum(kinds.script) > limit.js) rows.add(limit.level, 'perf', 'js', `JS ${kb(sum(kinds.script))}, over ${kb(limit.js)}${tag}`);
	if (kinds.font.length > limit.fontFiles || sum(kinds.font) > FONT_BYTES) rows.add(kinds.font.length > limit.fontFiles ? limit.level : 'WARN', 'perf', 'fonts', `${plural(kinds.font.length, 'font file')} totalling ${kb(sum(kinds.font))}, over ${limit.fontFiles} files or 250 KB${tag}; subset them or drop weights`);
	for (const x of kinds.image) if (x.bytes > 500 * 1024) rows.add('WARN', 'perf', x.name, `image ${path.basename(x.name)} ${kb(x.bytes)}, over 500 KB`);
}

async function runWidth(cdp, o, width, dark, errors, { perf, focus }) {
	// mobile:true would stretch the layout viewport to fit overflowing content, hiding the very overflow we look for
	await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: width < 600 ? 844 : 900, deviceScaleFactor: 1, mobile: false });
	await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }] });
	errors.length = 0;
	const stopNet = perf ? await watchNetwork(cdp) : null;
	const loaded = cdp.once('Page.loadEventFired');
	const nav = await cdp.send('Page.navigate', { url: o.url });
	if (nav.errorText) throw new SetupError(`Could not load ${o.url}: ${nav.errorText}`);
	await loaded;
	const a = await evalValue(cdp, `(async () => { await (${settle})(); return (${audit})(${selectorTools}); })()`);
	const p = perf ? { ...await evalValue(cdp, `(${perfProbe})()`), files: await stopNet() } : null;
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
	for (const x of a.taps) {
		if (x.fail) rows.add('FAIL', 'tap', x.pat + (x.w < 24 ? ` w${x.w}` : '') + (x.h < 24 ? ` h${x.h}` : ''), `${x.pat}  ${x.w}x${x.h}px, WCAG 2.5.8 needs at least 24x24, e.g. ${x.sel} "${x.text}"`);
		else rows.add('WARN', 'tap', x.pat, `${x.pat}  ${x.h}px tall, under 44px for phones; likely fix is padding or an ::after pseudo-element that enlarges the hit area (not measurable here), e.g. ${x.sel} "${x.text}"`);
	}
	for (const x of a.tables) {
		const how = `table scrolls sideways at ${a.vw}px; stack rows as label and value, or pin the first column (content ${x.content}px in a ${x.box}px box)`;
		if (x.sticky) rows.add('NOTE', 'table', x.sel, `${x.sel}  table scrolls sideways at ${a.vw}px with a sticky first column (content ${x.content}px in a ${x.box}px box)`);
		else rows.add('WARN', 'table', x.sel, `${x.sel}  ${how}`);
	}
	for (const x of a.reach) {
		if (x.carousel) rows.add('NOTE', 'reach', x.by, `${x.by}  scroll-snap carousel at ${a.vw}px, "${x.text}" starts past its visible edge ${x.edge}px; check the cut edge shows there is more`);
		else if (x.chip) rows.add('NOTE', 'reach', x.by, `${x.by}  chip row scrolls sideways at ${a.vw}px, "${x.text}" starts at ${x.left}px past its visible edge ${x.edge}px; check the cut edge shows there is more`);
		else rows.add('FAIL', 'reach', x.sel + x.text, `${x.sel} "${x.text}"  control out of reach, starts at ${x.left}px, ${x.by ? `past the visible edge ${x.edge}px of ${x.by}` : `past the viewport edge ${a.vw}px`}; keep it inside the visible area, e.g. stack the row as a card`, 8);
	}
	if (perf && a.placeholders.length) rows.add('WARN', 'placeholder', 'text', `placeholder text on the page: ${a.placeholders.slice(0, 6).map((t) => `"${t}"`).join(', ')}; write the real or sample value and list it for the user`);
	for (const f of a.fonts) rows.add('FAIL', 'font', f, `"${f}" not loaded, text renders in fallback`);
	for (const e of [...new Set(errors)].slice(0, 5)) rows.add('FAIL', 'js', e, e);
	if (p) perfRows(rows, p, o.budget);

	const height = Math.min(a.pageH, MAX_H);
	const tag = `${width}${dark ? '-dark' : ''}`;
	const files = [];
	for (let y = 0, i = 1; y < height; y += TILE, i++) {
		const shot = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 80, captureBeyondViewport: true, clip: { x: 0, y, width, height: Math.min(TILE, height - y), scale: 1 } });
		const file = path.join(o.out, `${tag}-${i}.jpg`);
		fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
		files.push(file);
	}
	if (focus) await checkFocus(cdp, rows);
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
			console.error('NOTE: Chrome did not start with the sandbox; retrying with --no-sandbox');
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
			for (const dark of o.dark ? [false, true] : [false]) {
				const first = !dark;
				blocks.push(await runWidth(cdp, o, width, dark, errors, { perf: first && width === Math.min(...o.widths), focus: first && width === Math.max(...o.widths) }));
			}
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
