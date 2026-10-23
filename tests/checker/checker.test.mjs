// Run with: node --test tests/checker/
// Drives skills/web-ui-design/scripts/check.mjs end to end in a real headless browser, one at a time.
// The browser is CHROME_PATH, or the first Chrome, Chromium or Brave found in the usual places; without one the tests skip.
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHECK = path.join(HERE, '..', '..', 'skills', 'web-ui-design', 'scripts', 'check.mjs');
const FIXTURES = path.join(HERE, 'fixtures');

const CANDIDATES = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/brave', '/opt/brave-bin/brave',
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'];
const executable = p => { try { fs.accessSync(p, fs.constants.X_OK); return fs.statSync(p).isFile(); } catch { return false; } };
const CHROME = process.env.CHROME_PATH || CANDIDATES.find(executable);
const skip = CHROME ? false : 'no Chrome, Chromium or Brave found';

let root;
before(() => { root = fs.mkdtempSync(path.join(os.tmpdir(), 'checker-test-')); });
after(() => { fs.rmSync(root, { recursive: true, force: true }); });

// Each case gets its own TMPDIR so default output dirs and browser profiles never touch the real /tmp/ui-check.
function run(args, { env = {} } = {}) {
	const tmp = fs.mkdtempSync(path.join(root, 'tmp-'));
	const r = spawnSync(process.execPath, [CHECK, ...args], { encoding: 'utf8', env: { ...process.env, CHROME_PATH: CHROME, TMPDIR: tmp, ...env }, timeout: 120000 });
	return { code: r.status, out: r.stdout, err: r.stderr, tmp };
}

function page(name, html, dir = root) {
	const file = path.join(dir, name);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>t</title>${html}`);
	return file;
}

const lines = (out, level, kind) => out.split('\n').filter(l => l.startsWith(`  ${level} ${kind}`));

describe('checker', { skip }, () => {
	test('a) two index.html files in different dirs get different default out dirs and keep their own tiles', () => {
		const one = page('one/index.html', '</head><body><h1>One</h1></body></html>');
		const two = page('two/index.html', '</head><body><h1>Two</h1></body></html>');
		const tmp = fs.mkdtempSync(path.join(root, 'shared-tmp-'));
		const first = run([one, '--widths', '390'], { env: { TMPDIR: tmp } });
		const tilesOne = [...first.out.matchAll(/^ {2}390 {2}(\S+)$/gm)].map(m => m[1]);
		assert.equal(tilesOne.length, 1, first.out);
		assert.ok(fs.existsSync(tilesOne[0]));
		const second = run([two, '--widths', '390'], { env: { TMPDIR: tmp } });
		const tilesTwo = [...second.out.matchAll(/^ {2}390 {2}(\S+)$/gm)].map(m => m[1]);
		assert.notEqual(path.dirname(tilesOne[0]), path.dirname(tilesTwo[0]));
		assert.match(path.basename(path.dirname(tilesOne[0])), /^index-[0-9a-f]{8}$/);
		assert.ok(fs.existsSync(tilesOne[0]), 'second run deleted the first run\'s tile');
		assert.ok(fs.existsSync(tilesTwo[0]));
	});

	test('a) an explicit --out is used as given', () => {
		const file = page('out/index.html', '</head><body><h1>Out</h1></body></html>');
		const dir = path.join(root, 'explicit-out');
		const r = run([file, '--widths', '390', '--out', dir]);
		assert.ok(fs.existsSync(path.join(dir, '390-1.jpg')), r.out);
	});

	describe('tap targets (WCAG 2.2 SC 2.5.8)', () => {
		const btn = (w, h, style = '') => `<button style="display:block;width:${w}px;height:${h}px;padding:0;${style}" aria-label="x"></button>`;

		test('b) an isolated 16x16 button passes', () => {
			const r = run([page('tap-alone.html', `</head><body><main style="padding:100px">${btn(16, 16)}</main></body></html>`), '--widths', '390']);
			assert.deepEqual(lines(r.out, 'FAIL', 'tap'), [], r.out);
		});

		test('b) two 16x16 buttons 4px apart fail', () => {
			const r = run([page('tap-pair.html', `</head><body><main style="padding:100px;display:flex;gap:4px">${btn(16, 16)}${btn(16, 16)}</main></body></html>`), '--widths', '390']);
			assert.equal(lines(r.out, 'FAIL', 'tap').length, 1, r.out);
			assert.match(r.out, /FAIL tap {7}button {2}16x16px, WCAG 2\.5\.8 needs at least 24x24/);
			assert.equal(r.code, 1);
		});

		// Centres are 24px apart for 20px targets 4px apart: the circles touch but do not intersect, as in the W3C toolbar example.
		const cases = [
			['20px targets 4px apart pass', `<div style="display:flex;gap:4px">${btn(20, 20)}${btn(20, 20)}</div>`, false],
			['20px targets 3px apart fail', `<div style="display:flex;gap:3px">${btn(20, 20)}${btn(20, 20)}</div>`, true],
			['16px target touching a large target fails', `<div style="display:flex">${btn(16, 16)}${btn(120, 48)}</div>`, true],
			['16px target 4px from a large target passes', `<div style="display:flex;gap:4px">${btn(16, 16)}${btn(120, 48)}</div>`, false],
			['16px target 3px from a large target fails', `<div style="display:flex;gap:3px">${btn(16, 16)}${btn(120, 48)}</div>`, true],
			['16px target next to an inline link in prose fails', `<p>Some words around <a href="#x" style="font-size:12px">tiny</a><button style="width:16px;height:16px;padding:0;margin-left:2px;vertical-align:top" aria-label="x"></button> more words to make this a sentence.</p>`, true],
			['wide but short targets stacked 1px apart fail', `${btn(120, 16, 'margin-bottom:1px')}${btn(120, 16)}`, true],
		];
		for (const [name, html, fails] of cases) {
			test(name, () => {
				const r = run([page(`tap-${name.replace(/\W+/g, '-')}.html`, `</head><body><main style="padding:100px">${html}</main></body></html>`), '--widths', '390']);
				const rows = lines(r.out, 'FAIL', 'tap');
				// the large button is always at least 24px so only the undersized ones can be listed
				assert.equal(rows.length > 0, fails, r.out);
			});
		}

		test('b) undersized is decided from unrounded sizes: 16x16 beside 23.6x24 four px apart fails', () => {
			const html = `<div style="display:flex;align-items:center;gap:4px">${btn(16, 16)}${btn(23.6, 24)}</div>`;
			const r = run([page('tap-unrounded.html', `</head><body><main style="padding:100px">${html}</main></body></html>`), '--widths', '390']);
			assert.ok(lines(r.out, 'FAIL', 'tap').length > 0, `expected a FAIL tap line, got exit ${r.code}:\n${r.out}`);
			assert.equal(r.code, 1);
		});

		test('b) a link nested in a native summary still counts the summary as a neighbour', () => {
			const html = `<details open><summary style="display:flex;align-items:center;justify-content:center;width:120px;height:48px;padding:0"><a href="#x" style="display:block;width:16px;height:16px" aria-label="x"></a></summary></details>`;
			const r = run([page('tap-in-summary.html', `</head><body><main style="padding:100px">${html}</main></body></html>`), '--widths', '390']);
			assert.equal(lines(r.out, 'FAIL', 'tap').length, 1, `expected the nested link to FAIL, got exit ${r.code}:\n${r.out}`);
			assert.equal(r.code, 1);
		});

		test('b) a link nested in an ARIA button still counts that button as a neighbour', () => {
			const html = `<div role="button" tabindex="0" style="display:flex;align-items:center;justify-content:center;width:120px;height:48px"><a href="#x" style="display:block;width:16px;height:16px" aria-label="x"></a></div>`;
			const r = run([page('tap-in-role.html', `</head><body><main style="padding:100px">${html}</main></body></html>`), '--widths', '390']);
			assert.equal(lines(r.out, 'FAIL', 'tap').length, 1, `expected the nested link to FAIL, got exit ${r.code}:\n${r.out}`);
		});

		test('b) a button nested in a generic tabindex container passes', () => {
			const html = `<div tabindex="0" style="display:flex;align-items:center;justify-content:center;width:120px;height:48px">${btn(16, 16)}</div>`;
			const r = run([page('tap-in-tabindex.html', `</head><body><main style="padding:100px">${html}</main></body></html>`), '--widths', '390']);
			assert.deepEqual(lines(r.out, 'FAIL', 'tap'), [], r.out);
			assert.equal(r.code, 0);
		});

		test('a dimension under 24 that rounds to 24 prints with one decimal, other sizes print as before', () => {
			const html = `<div style="display:flex;align-items:center;gap:4px">${btn(16, 16)}${btn(23.6, 24)}</div>`;
			const r = run([page('tap-decimal.html', `</head><body><main style="padding:100px">${html}</main></body></html>`), '--widths', '390']);
			assert.match(r.out, /^ {2}FAIL tap {7}button {2}23\.6x24px, WCAG 2\.5\.8 needs at least 24x24, e\.g\. /m, r.out);
			assert.match(r.out, /^ {2}FAIL tap {7}button {2}16x16px, WCAG 2\.5\.8 needs at least 24x24, e\.g\. /m, r.out);
		});

		test('a dimension that would round up to 24.0 under one decimal is cut, not rounded up', () => {
			const html = `<div style="display:flex;align-items:center;gap:4px">${btn(16, 16)}${btn(23.96, 30)}</div>`;
			const r = run([page('tap-decimal-edge.html', `</head><body><main style="padding:100px">${html}</main></body></html>`), '--widths', '390']);
			assert.match(r.out, /^ {2}FAIL tap {7}button {2}23\.9x30px, WCAG 2\.5\.8 needs at least 24x24, e\.g\. /m, r.out);
		});

		test('a link nested in a gridcell still counts the gridcell as a neighbour', () => {
			const html = `<div role="gridcell" tabindex="0" style="display:flex;align-items:center;justify-content:center;width:120px;height:48px"><a href="#x" style="display:block;width:16px;height:16px" aria-label="x"></a></div>`;
			const r = run([page('tap-in-gridcell.html', `</head><body><main style="padding:100px">${html}</main></body></html>`), '--widths', '390']);
			assert.equal(lines(r.out, 'FAIL', 'tap').length, 1, `expected the nested link to FAIL, got exit ${r.code}:\n${r.out}`);
		});

		test('a link nested in a roving-tabindex tab (tabindex -1) fails', () => {
			const html = `<div role="tab" tabindex="-1" style="display:flex;align-items:center;justify-content:center;width:120px;height:48px"><a href="#x" style="display:block;width:16px;height:16px" aria-label="x"></a></div>`;
			const r = run([page('tap-in-tab.html', `</head><body><main style="padding:100px">${html}</main></body></html>`), '--widths', '390']);
			assert.equal(lines(r.out, 'FAIL', 'tap').length, 1, `expected the nested link to FAIL, got exit ${r.code}:\n${r.out}`);
			assert.equal(r.code, 1);
		});

		test('a link nested in a gridcell without tabindex fails', () => {
			const html = `<div role="gridcell" style="display:flex;align-items:center;justify-content:center;width:120px;height:48px"><a href="#x" style="display:block;width:16px;height:16px" aria-label="x"></a></div>`;
			const r = run([page('tap-in-gridcell-bare.html', `</head><body><main style="padding:100px">${html}</main></body></html>`), '--widths', '390']);
			assert.equal(lines(r.out, 'FAIL', 'tap').length, 1, `expected the nested link to FAIL, got exit ${r.code}:\n${r.out}`);
		});

		test('an isolated 16x16 role=button div without tabindex is checked like a button', () => {
			const div = `<div role="button" style="width:16px;height:16px"></div>`;
			const alone = run([page('tap-role-button-alone.html', `</head><body><main style="padding:100px">${div}</main></body></html>`), '--widths', '390']);
			assert.deepEqual(lines(alone.out, 'FAIL', 'tap'), [], alone.out);
			assert.match(alone.out, /^ {2}WARN tap {7}div\[role=button\] {2}16px tall, under 44px for phones/m);
			const pair = run([page('tap-role-button-pair.html', `</head><body><main style="padding:100px;display:flex;gap:4px">${div}${div}</main></body></html>`), '--widths', '390']);
			assert.match(pair.out, /^ {2}FAIL tap {7}div\[role=button\] {2}16x16px/m, pair.out);
		});

		test('an isolated 16x16 role=switch div without tabindex is checked like a button', () => {
			const div = `<div role="switch" aria-checked="false" style="width:16px;height:16px"></div>`;
			const alone = run([page('tap-role-switch-alone.html', `</head><body><main style="padding:100px">${div}</main></body></html>`), '--widths', '390']);
			assert.deepEqual(lines(alone.out, 'FAIL', 'tap'), [], alone.out);
			assert.match(alone.out, /^ {2}WARN tap {7}div\[role=switch\] {2}16px tall, under 44px for phones/m);
			const pair = run([page('tap-role-switch-pair.html', `</head><body><main style="padding:100px;display:flex;gap:4px">${div}${div}</main></body></html>`), '--widths', '390']);
			assert.match(pair.out, /^ {2}FAIL tap {7}div\[role=switch\] {2}16x16px/m, pair.out);
		});

		test('a role-only element that is hidden or zero-sized is not a target', () => {
			const html = `<div role="tab" style="display:none;width:16px;height:16px"></div><div role="tab" style="width:0;height:0"></div><div role="tab" style="width:16px;height:16px;visibility:hidden"></div>`;
			const r = run([page('tap-role-hidden.html', `</head><body><main style="padding:100px">${html}</main></body></html>`), '--widths', '390']);
			assert.deepEqual([...lines(r.out, 'FAIL', 'tap'), ...lines(r.out, 'WARN', 'tap')], [], r.out);
		});

		test('an inline link in a sentence stays exempt and the phone height note stays', () => {
			const r = run([page('tap-inline.html', `</head><body><main style="padding:20px"><p>Read the <a href="#x">terms</a> before you sign up for anything here.</p><a href="#y" style="display:inline-block;padding:0;line-height:32px">Thirty-two</a></main></body></html>`), '--widths', '390']);
			assert.deepEqual(lines(r.out, 'FAIL', 'tap'), [], r.out);
			assert.equal(lines(r.out, 'WARN', 'tap').length, 1, r.out);
			assert.match(r.out, /WARN tap {7}a {2}32px tall, under 44px for phones/);
		});
	});

	describe('--budget', () => {
		let dir;
		before(() => {
			dir = path.join(root, 'budget');
			fs.mkdirSync(dir);
			fs.writeFileSync(path.join(dir, 'big.js'), '// ' + 'x'.repeat(100 * 1024) + '\n');
			for (const n of ['a', 'b', 'c']) fs.writeFileSync(path.join(dir, `${n}.woff2`), Buffer.alloc(2048, n));
		});

		const jsPage = () => page('budget/js.html', '<script src="big.js"></script></head><body><h1>JS</h1></body></html>');
		const fontPage = () => page('budget/fonts.html', `<style>${['a', 'b', 'c'].map(n => `@font-face{font-family:F${n};src:url(${n}.woff2) format("woff2")}`).join('')}h1{font-family:Fa,Fb,Fc,sans-serif}h2{font-family:Fb}h3{font-family:Fc}</style></head><body><h1>Fonts</h1><h2>Two</h2><h3>Three</h3></body></html>`);

		test('c) about 100 KB of JS passes by default and fails under --budget landing', () => {
			const byDefault = run([jsPage(), '--widths', '390']);
			assert.deepEqual([...lines(byDefault.out, 'FAIL', 'perf'), ...lines(byDefault.out, 'WARN', 'perf')], [], byDefault.out);
			assert.match(byDefault.out, /JS 100 KB \(1 file\)/);
			assert.equal(byDefault.code, 0, byDefault.out);
			const landing = run([jsPage(), '--widths', '390', '--budget', 'landing']);
			assert.match(landing.out, /^ {2}FAIL perf {6}JS 100 KB, over 50 KB \(landing budget\)$/m);
			assert.equal(landing.code, 1);
		});

		test('c) 3 font files fail under --budget landing and pass by default', () => {
			const byDefault = run([fontPage(), '--widths', '390']);
			assert.deepEqual([...lines(byDefault.out, 'FAIL', 'perf'), ...lines(byDefault.out, 'WARN', 'perf')], [], byDefault.out);
			assert.match(byDefault.out, /fonts [\d.]+ KB \(3 files\)/);
			const landing = run([fontPage(), '--widths', '390', '--budget', 'landing']);
			assert.match(landing.out, /^ {2}FAIL perf {6}3 font files totalling .*, over 2 files or 250 KB \(landing budget\)/m);
			assert.equal(landing.code, 1);
		});

		test('c) a small page passes under --budget landing', () => {
			const r = run([path.join(FIXTURES, 'good.html'), '--widths', '390', '--budget', 'landing']);
			assert.equal(r.code, 0, r.out);
		});

		test('d) an unknown --budget exits 2', () => {
			const r = run([path.join(FIXTURES, 'good.html'), '--budget', 'bogus']);
			assert.equal(r.code, 2);
			assert.match(r.err, /^--budget takes landing/);
			assert.equal(r.out, '');
		});

		test('d) --budget without a value exits 2', () => {
			assert.equal(run([path.join(FIXTURES, 'good.html'), '--budget']).code, 2);
		});
	});

	describe('browser launch', () => {
		// CHROME_PATH is the existing hook: a wrapper that refuses to start without --no-sandbox stands in for a sandbox-less container.
		function wrapper(name, { needsNoSandbox }) {
			const bin = path.join(root, name);
			const log = path.join(root, `${name}.log`);
			fs.writeFileSync(bin, `#!/bin/sh\necho "$@" >> '${log}'\nPATH=/usr/bin:/bin:$PATH\n${needsNoSandbox ? 'case " $* " in *" --no-sandbox "*) ;; *) exit 1;; esac\n' : ''}exec '${CHROME}' "$@"\n`, { mode: 0o755 });
			return { bin, log };
		}

		test('e) falling back to --no-sandbox is announced on stderr', () => {
			const w = wrapper('needs-no-sandbox', { needsNoSandbox: true });
			const r = run([path.join(FIXTURES, 'good.html'), '--widths', '390'], { env: { CHROME_PATH: w.bin } });
			assert.equal(r.code, 0, r.err + r.out);
			assert.match(r.err, /^NOTE: Chrome did not start with the sandbox; retrying with --no-sandbox$/m);
			assert.equal(fs.readFileSync(w.log, 'utf8').trim().split('\n').length, 2);
		});

		test('e) no NOTE when the sandboxed start works', () => {
			const w = wrapper('plain', { needsNoSandbox: false });
			const r = run([path.join(FIXTURES, 'good.html'), '--widths', '390'], { env: { CHROME_PATH: w.bin } });
			assert.equal(r.code, 0, r.err + r.out);
			assert.equal(r.err, '');
		});

		for (const name of ['brave', 'brave-browser']) {
			test(`f) findChrome finds ${name} on PATH`, () => {
				const bin = path.join(root, `path-${name}`);
				fs.mkdirSync(bin);
				const w = wrapper(`${name}-wrapper`, { needsNoSandbox: false });
				fs.symlinkSync(w.bin, path.join(bin, name));
				const home = fs.mkdtempSync(path.join(root, 'home-'));
				const r = run([path.join(FIXTURES, 'good.html'), '--widths', '390'], { env: { CHROME_PATH: '', PATH: bin, HOME: home } });
				assert.equal(r.code, 0, r.err + r.out);
				assert.ok(fs.existsSync(w.log), 'the Brave stand-in was never launched');
			});
		}
	});

	describe('long TMPDIR', () => {
		const profiles = () => fs.readdirSync('/tmp').filter(f => f.startsWith('ui-check-profile-'));

		// Chromium puts its singleton socket under TMPDIR, and a Unix socket path holds about 108 bytes.
		test('h) a TMPDIR of 100+ characters still starts the browser and leaves nothing behind', { skip: process.platform === 'win32' }, () => {
			const deep = path.join(root, ...Array(9).fill('abcdefghi'));
			fs.mkdirSync(deep, { recursive: true });
			assert.ok(deep.length > 100, deep);
			const before = profiles();
			const r = run([path.join(FIXTURES, 'good.html'), '--widths', '390'], { env: { TMPDIR: deep } });
			assert.equal(r.code, 0, r.err + r.out);
			assert.deepEqual(profiles().filter(f => !before.includes(f)), [], 'profile dir left in /tmp');
			assert.deepEqual(fs.readdirSync(deep).filter(f => f.startsWith('org.chromium')), [], 'browser temp dir left in TMPDIR');
		});
	});

	describe('browser search order', () => {
		// Each directory holds a stand-in that logs its own name and then runs the real browser.
		function stub(dir, name) {
			fs.mkdirSync(dir, { recursive: true });
			const log = path.join(dir, `${name}.log`);
			fs.writeFileSync(path.join(dir, name), `#!/bin/sh\necho "$@" >> '${log}'\nPATH=/usr/bin:/bin:$PATH\nexec '${CHROME}' "$@"\n`, { mode: 0o755 });
			return log;
		}
		const pick = (dirs, names) => {
			const base = fs.mkdtempSync(path.join(root, 'order-'));
			const paths = dirs.map(d => path.join(base, d));
			const logs = names.map(([d, n]) => stub(path.join(base, d), n));
			const r = run([path.join(FIXTURES, 'good.html'), '--widths', '390'], { env: { CHROME_PATH: '', PATH: paths.join(path.delimiter), HOME: fs.mkdtempSync(path.join(root, 'home-')) } });
			return { r, used: logs.map(l => fs.existsSync(l)) };
		};

		test('g) chromium later on PATH beats brave in an earlier directory', () => {
			const { r, used } = pick(['a', 'b'], [['a', 'brave'], ['b', 'chromium']]);
			assert.equal(r.code, 0, r.err + r.out);
			assert.deepEqual(used, [false, true], 'brave was launched although chromium is on PATH');
		});

		test('g) brave-browser later on PATH still loses to google-chrome', () => {
			const { r, used } = pick(['a', 'b'], [['a', 'brave-browser'], ['b', 'google-chrome']]);
			assert.equal(r.code, 0, r.err + r.out);
			assert.deepEqual(used, [false, true]);
		});

		test('g) brave is used when it is the only match', () => {
			const { r, used } = pick(['a', 'b'], [['b', 'brave']]);
			assert.equal(r.code, 0, r.err + r.out);
			assert.deepEqual(used, [true]);
		});
	});

	describe('existing behavior', () => {
		test('good fixture: no failures, exit 0', () => {
			const r = run([path.join(FIXTURES, 'good.html'), '--widths', '390']);
			assert.equal(r.code, 0, r.out);
			assert.match(r.out, /\n0 failures, 0 warnings\n/);
		});

		test('bad fixture: viewport, overflow and contrast failures, exit 1', () => {
			const r = run([path.join(FIXTURES, 'bad.html'), '--widths', '390']);
			assert.equal(r.code, 1);
			for (const re of [/FAIL viewport {2}no <meta name="viewport">/, /FAIL overflow {2}page scrolls sideways by 510px/, /FAIL contrast {2}#bbbbbb on #ffffff {2}1\.9:1, needs 4\.5:1/]) assert.match(r.out, re);
			assert.match(r.out, /\n4 failures, 0 warnings\n/);
		});

		test('usage mentions every option', () => {
			const r = run([]);
			assert.equal(r.code, 2);
			assert.match(r.err, /^Usage: node check\.mjs <file-path-or-url> \[--widths 390,768,1440\] \[--out <dir>\] \[--dark\] \[--budget landing\]$/m);
		});
	});
});
