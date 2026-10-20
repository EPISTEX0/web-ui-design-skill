// Usage: node improve-checks.mjs <siteDir> [--json out.json]
// Loads <siteDir>/index.html from file:// and reports, as JSON, which usability defects are still
// present (true = still present), whether content and behaviour survived, and whether brand cues remain.
import { chromium } from 'playwright'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
const jsonIdx = args.indexOf('--json')
const jsonOut = jsonIdx >= 0 ? args[jsonIdx + 1] : null
const siteArg = args.find((a, i) => !a.startsWith('--') && i !== jsonIdx + 1)
if (!siteArg) {
	console.error('usage: node improve-checks.mjs <siteDir> [--json out.json]')
	process.exit(2)
}
const siteDir = resolve(siteArg)
const indexFile = join(siteDir, 'index.html')
if (!existsSync(indexFile)) {
	console.error(`no index.html in ${siteDir}`)
	process.exit(2)
}
const url = pathToFileURL(indexFile).href

const SESSIONS = [
	['Monday', '06:30', 'Early Bird Lengths'],
	['Monday', '17:00', 'Junior Development'],
	['Monday', '18:00', 'Junior Squad'],
	['Monday', '19:30', 'Adult Improvers'],
	['Tuesday', '07:00', 'Masters Early Swim'],
	['Tuesday', '16:30', 'Learn to Swim Stage 1'],
	['Tuesday', '17:30', 'Learn to Swim Stage 2'],
	['Tuesday', '19:00', 'Competition Squad'],
	['Wednesday', '12:30', 'Lunchtime Lanes'],
	['Wednesday', '17:00', 'Junior Development'],
	['Wednesday', '18:00', 'Aqua Fit'],
	['Wednesday', '19:30', 'Masters Evening Swim'],
	['Thursday', '06:30', 'Early Bird Lengths'],
	['Thursday', '10:00', 'Parent and Baby'],
	['Thursday', '16:30', 'Learn to Swim Stage 1'],
	['Thursday', '18:00', 'Junior Squad'],
	['Thursday', '19:30', 'Water Polo Intro'],
	['Friday', '12:30', 'Lunchtime Lanes'],
	['Friday', '17:00', 'Family Fun Swim'],
	['Friday', '18:30', 'Social Swim'],
	['Saturday', '08:00', 'Junior Squad'],
	['Saturday', '09:30', 'Competition Squad'],
	['Saturday', '11:00', 'Learn to Swim Stage 3'],
	['Saturday', '12:00', 'Open Water Prep'],
	['Sunday', '10:00', 'Sunday Family Splash'],
	['Sunday', '11:30', 'Disability Swim'],
	['Sunday', '18:00', 'Adult Beginners'],
]
const PRICES = [['Junior', 18], ['Adult', 32], ['Family', 65], ['Masters', 28]]
const NEWS = [
	'Cornwall County Championships: 14 medals for Harbour',
	'New Masters session on Wednesday evenings',
	'Pool maintenance closure over Easter weekend',
]
const CLUB = 'Harbour Swim Club'
const PHONE_TAIL = '1326555014'
const EMAIL = 'info@harbourswimclub.co.uk'
const NAVY = '#1b2a4a'
const YELLOW = '#f2c230'
const TEST_PERSON = { name: 'Maya Jensen', first: 'Maya', email: 'maya.jensen@example.com', phone: '01326 555 0188' }

// In-page helpers, installed before any page script runs.
const HELPERS = `(() => {
const W = (window.__chk = {})
const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
ctx.canvas.width = 1
ctx.canvas.height = 1
const cache = new Map()
W.rgba = (s) => {
  if (!s || s === 'transparent' || s === 'none') return [0, 0, 0, 0]
  if (cache.has(s)) return cache.get(s)
  let out
  const m = /^rgba?\\(([^)]+)\\)$/.exec(s)
  if (m && !/[\\/]/.test(m[1])) {
    const p = m[1].split(',').map((x) => parseFloat(x))
    out = [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]
  } else {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = '#000'
    ctx.fillStyle = s
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    out = [d[0], d[1], d[2], d[3] / 255]
  }
  cache.set(s, out)
  return out
}
W.vis = (el) => {
  const r = el.getBoundingClientRect()
  if (r.width <= 0 || r.height <= 0) return false
  const cs = getComputedStyle(el)
  return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0
}
W.opacity = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity); return o }
W.bgOf = (el) => {
  const layers = []
  for (let e = el; e; e = e.parentElement) {
    const cs = getComputedStyle(e)
    const c = W.rgba(cs.backgroundColor)
    if (cs.backgroundImage !== 'none') { if (c[3] >= 1) { layers.push(c); break } return null }
    if (c[3] > 0) layers.push(c)
    if (c[3] >= 1) break
  }
  let base = [255, 255, 255]
  for (let i = layers.length - 1; i >= 0; i--) { const c = layers[i]; base = base.map((v, k) => c[k] * c[3] + v * (1 - c[3])) }
  return base
}
const chan = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
W.lum = (c) => 0.2126 * chan(c[0]) + 0.7152 * chan(c[1]) + 0.0722 * chan(c[2])
W.ratio = (a, b) => { const x = W.lum(a), y = W.lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
W.texts = () => {
  const out = []
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const t = n.nodeValue.replace(/\\s+/g, ' ').trim()
    const p = n.parentElement
    if (!t || !p || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|OPTION)$/.test(p.tagName)) continue
    if (!W.vis(p)) continue
    out.push({ len: t.length, el: p, text: t })
  }
  return out
}
W.norm = (s) => s.toLowerCase().replace(/[\\u2018\\u2019]/g, "'").replace(/[\\u201c\\u201d]/g, '"').replace(/[\\u2013\\u2014]/g, '-').replace(/\\u00a0/g, ' ').replace(/\\s+/g, ' ').trim()
W.desc = (c) => {
  const labels = c.labels ? [...c.labels].map((l) => l.textContent) : []
  const lb = (c.getAttribute('aria-labelledby') || '').split(/\\s+/).map((id) => (document.getElementById(id) || {}).textContent || '')
  return W.norm([...labels, ...lb, c.getAttribute('placeholder') || '', c.name || '', c.id || '', c.getAttribute('aria-label') || '', c.getAttribute('title') || '', c.type || ''].join(' '))
}
W.controls = () => [...document.querySelectorAll('input,select,textarea')].filter((c) => !/^(hidden|submit|button|reset|image)$/.test(c.type))
W.fields = () => {
  const cs = W.controls()
  const text = cs.filter((c) => /^(text|search|)$/.test(c.type) || c.tagName === 'INPUT' && !c.type)
  const email = cs.find((c) => c.type === 'email') || cs.find((c) => /e-?mail/.test(W.desc(c)))
  const phone = cs.find((c) => c.type === 'tel') || cs.find((c) => /phone|mobile|\\btel\\b/.test(W.desc(c)))
  const name = text.find((c) => /name/.test(W.desc(c)) && !/e-?mail|user/.test(W.desc(c))) || text.find((c) => c !== email && c !== phone)
  const sels = cs.filter((c) => c.tagName === 'SELECT')
  const type = sels.find((s) => [...s.options].some((o) => /adult/i.test(o.text))) || sels[0]
  const consent = cs.find((c) => c.type === 'checkbox')
  return { name, email, phone, type, consent }
}
const RX = /\\b(join|submit|sign\\s?up)\\b/i
W.submit = () => {
  const f = W.fields()
  const clickable = (e) => /^(BUTTON|A)$/.test(e.tagName) || (e.tagName === 'INPUT' && /^(submit|button|image)$/.test(e.type)) || e.getAttribute('role') === 'button' || e.hasAttribute('onclick') || getComputedStyle(e).cursor === 'pointer'
  const label = (e) => (e.tagName === 'INPUT' ? e.value : e.textContent || '') + ' ' + (e.getAttribute('aria-label') || '')
  const ok = (e) => clickable(e) && RX.test(label(e)) && !(e.tagName === 'A' && (e.getAttribute('href') || '').startsWith('#')) && W.vis(e)
  const all = [...document.querySelectorAll('button,input,a,div,span,li,[role=button],[onclick]')]
  const cands = all.filter(ok).filter((e) => !all.some((o) => o !== e && e.contains(o) && ok(o)))
  const anchor = f.email || f.name
  for (let c = anchor; c; c = c.parentElement) {
    const hit = cands.find((e) => c.contains(e))
    if (hit) return hit
  }
  return cands[0] || null
}
})()`

function deltaE(hexA, rgbB) {
	const lab = (rgb) => {
		const lin = rgb.map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 })
		const x = (0.4124 * lin[0] + 0.3576 * lin[1] + 0.1805 * lin[2]) / 0.95047
		const y = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
		const z = (0.0193 * lin[0] + 0.1192 * lin[1] + 0.9505 * lin[2]) / 1.08883
		const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
		return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
	}
	const hex = hexA.replace('#', '')
	const a = lab([0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)))
	const b = lab(rgbB)
	return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}

async function launch() {
	const envPath = process.env.CHROME_PATH
	if (envPath) return chromium.launch({ executablePath: envPath })
	try {
		return await chromium.launch()
	} catch {
		const root = join(homedir(), '.cache/ms-playwright')
		const dirs = existsSync(root) ? readdirSync(root).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse() : []
		for (const d of dirs) {
			const p = join(root, d, 'chrome-linux64/chrome')
			if (existsSync(p)) return chromium.launch({ executablePath: p })
		}
		throw new Error('no Chromium found; set CHROME_PATH')
	}
}

const browser = await launch()

async function open(width, height, opts = {}) {
	const context = await browser.newContext({ viewport: { width, height }, ...opts })
	await context.addInitScript({ content: HELPERS })
	const page = await context.newPage()
	const errors = []
	page.on('pageerror', (e) => errors.push(String(e)))
	page.on('dialog', (d) => d.accept().catch(() => {}))
	await page.goto(url, { waitUntil: 'load', timeout: 30000 })
	await page.waitForTimeout(500)
	return { context, page, errors }
}

// ---------- defect measurements ----------

async function measureLayout(width) {
	const { context, page } = await open(width, 844)
	const r = await page.evaluate((vw) => {
		const W = window.__chk
		const out = {}
		const doc = document.documentElement
		out.docScrollWidth = doc.scrollWidth
		const clipped = []
		for (const el of document.body.querySelectorAll('*')) {
			if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim())) continue
			if (!W.vis(el) || W.opacity(el) === 0) continue
			const r = el.getBoundingClientRect()
			if (r.right <= vw + 1) continue
			let skip = false
			for (let e = el; e && e !== document.body && e !== doc; e = e.parentElement) {
				const cs = getComputedStyle(e)
				if (cs.overflowX !== 'visible' || cs.position === 'fixed' || e.hasAttribute('hidden') || e.getAttribute('aria-hidden') === 'true') { skip = true; break }
			}
			if (!skip) clipped.push(el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + ':' + Math.round(r.right))
		}
		out.overflow = doc.scrollWidth > vw + 1 || clipped.length > 0
		out.overflowDetail = { scrollWidth: doc.scrollWidth, viewport: vw, clippedByViewport: clipped.slice(0, 5) }

		const texts = W.texts()
		const sizes = texts.map((t) => ({ w: t.len, s: parseFloat(getComputedStyle(t.el).fontSize) })).sort((a, b) => a.s - b.s)
		const total = sizes.reduce((a, b) => a + b.w, 0)
		let acc = 0, median = 0
		for (const s of sizes) { acc += s.w; if (acc >= total / 2) { median = s.s; break } }
		out.medianFontPx = median
		out.bodyFontPx = parseFloat(getComputedStyle(document.body).fontSize)

		let failChars = 0, measured = 0, skipped = 0
		const worst = []
		for (const t of texts) {
			const cs = getComputedStyle(t.el)
			const bg = W.bgOf(t.el)
			if (!bg) { skipped += t.len; continue }
			const fg = W.rgba(cs.color)
			const a = fg[3] * W.opacity(t.el)
			const blended = [0, 1, 2].map((k) => fg[k] * a + bg[k] * (1 - a))
			const cr = W.ratio(blended, bg)
			measured += t.len
			if (cr < 4.5) { failChars += t.len; worst.push({ el: t.el.tagName.toLowerCase(), ratio: +cr.toFixed(2), text: t.text.slice(0, 24) }) }
		}
		out.contrast = { failShare: measured ? failChars / measured : 0, measuredChars: measured, skippedChars: skipped, examples: worst.slice(0, 4) }

		const navRx = /^(timetable|membership|join|news|contact)/i
		const navLinks = [...document.querySelectorAll('a[href^="#"]')].filter((a) => W.vis(a) && (navRx.test(a.textContent.trim()) || a.closest('nav,[role=navigation]')))
		const toggles = [...document.querySelectorAll('[aria-expanded],[aria-controls]')].filter((b) => W.vis(b) && b.closest('nav,header,[role=navigation]'))
		const small = []
		for (const a of [...navLinks, ...toggles]) {
			const r = a.getBoundingClientRect()
			if (Math.min(r.width, r.height) < 24) small.push(`${a.textContent.trim().slice(0, 14) || a.tagName}:${Math.round(r.width)}x${Math.round(r.height)}`)
		}
		out.nav = { checked: navLinks.length + toggles.length, small: small.slice(0, 6) }

		const imgs = [...document.querySelectorAll('img')]
		const bad = imgs.filter((i) => getComputedStyle(i).aspectRatio === 'auto' && !(i.hasAttribute('width') && i.hasAttribute('height')))
		out.images = { total: imgs.length, withoutDimensions: bad.length, examples: bad.slice(0, 3).map((i) => i.getAttribute('src')) }

		const tables = [...document.querySelectorAll('table,[role=table],[role=grid]')].filter((t) => W.vis(t))
		const over = []
		for (const t of tables) {
			const r = t.getBoundingClientRect()
			if (r.right <= vw + 1 && r.left >= -1) continue
			let scroller = false
			for (let e = t.parentElement; e && e !== document.body; e = e.parentElement) {
				const cs = getComputedStyle(e)
				if (/auto|scroll/.test(cs.overflowX) && e.getBoundingClientRect().right <= vw + 1) { scroller = true; break }
			}
			if (!scroller) over.push(Math.round(r.width))
		}
		out.tables = { total: tables.length, overflowingWidths: over }

		const body = document.body.textContent
		const hrefs = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href').toLowerCase())
		const digitsOf = (s) => s.replace(/\D/g, '').slice(-10)
		out.links = {
			tel: hrefs.filter((h) => h.startsWith('tel:')).map(digitsOf),
			mailto: hrefs.filter((h) => h.startsWith('mailto:')),
			bodyHasEmail: /@/.test(body),
		}

		const ctl = W.controls().filter((c) => W.vis(c) || c.type === 'checkbox' || c.type === 'radio')
		const unnamed = []
		for (const c of ctl) {
			const labels = c.labels ? [...c.labels].map((l) => l.textContent.trim()).join('') : ''
			const lb = (c.getAttribute('aria-labelledby') || '').split(/\s+/).map((id) => ((document.getElementById(id) || {}).textContent || '').trim()).join('')
			const name = (c.getAttribute('aria-label') || '').trim() || lb || labels || (c.getAttribute('title') || '').trim()
			if (!name) unnamed.push(c.tagName.toLowerCase() + '[' + (c.type || '') + ']#' + (c.id || c.name || ''))
		}
		out.labels = { controls: ctl.length, unnamed }
		out.viewportMeta = (document.querySelector('meta[name=viewport]') || {}).content || null
		return out
	}, width)
	await context.close()
	return r
}

async function focusAudit(width) {
	const { context, page } = await open(width, 900)
	await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' })
	await page.evaluate(() => {
		const F = (window.__focus = { prev: null, prevSnap: null, tabbed: [], results: [] })
		const props = ['outlineStyle', 'outlineWidth', 'outlineColor', 'boxShadow', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'borderTopWidth', 'borderBottomWidth', 'backgroundColor', 'backgroundImage', 'color', 'textDecorationLine', 'textDecorationColor', 'textDecorationThickness', 'transform', 'filter', 'opacity', 'fontWeight']
		F.snap = (el) => {
			const parts = []
			let e = el
			for (let i = 0; i < 4 && e && e !== document.body; i++, e = e.parentElement) {
				const cs = getComputedStyle(e)
				const outline = cs.outlineStyle === 'none' || parseFloat(cs.outlineWidth) === 0 ? 'none' : cs.outlineStyle + cs.outlineWidth + cs.outlineColor
				parts.push(outline + '|' + props.slice(3).map((p) => cs[p]).join('|'))
			}
			return parts.join('||')
		}
		F.name = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + ((el.textContent || el.value || '').trim().slice(0, 14) ? ':' + (el.textContent || el.value).trim().slice(0, 14) : '')
		if (document.activeElement) document.activeElement.blur()
		window.scrollTo(0, 0)
	})
	for (let i = 0; i < 250; i++) {
		await page.keyboard.press('Tab')
		const stop = await page.evaluate(() => {
			const F = window.__focus
			if (F.prev) {
				const blurred = F.snap(F.prev)
				F.results.push({ name: F.name(F.prev), changed: blurred !== F.prevSnap })
				F.prev = null
			}
			const a = document.activeElement
			if (!a || a === document.body || a === document.documentElement || F.tabbed.includes(a)) return true
			F.tabbed.push(a)
			F.prev = a
			F.prevSnap = F.snap(a)
			return false
		})
		if (stop) break
	}
	const r = await page.evaluate(() => {
		const F = window.__focus
		const W = window.__chk
		const s = W.submit()
		const tabbableTag = (t) => /^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(t.tagName) || t.hasAttribute('tabindex') || t.getAttribute('role') === 'button'
		const reachable = !!s && F.tabbed.some((t) => t === s || s.contains(t) || (t.contains(s) && tabbableTag(t)))
		return {
			tabStops: F.tabbed.length,
			noChange: F.results.filter((x) => !x.changed).map((x) => x.name),
			submitFound: !!s,
			submitText: s ? (s.value || s.textContent || '').trim().slice(0, 20) : null,
			submitReachable: reachable,
		}
	})
	await context.close()
	return r
}

async function measureMotion(width) {
	const { context, page } = await open(width, 844, { reducedMotion: 'reduce' })
	await page.waitForTimeout(800)
	const sample = () => page.evaluate(() => {
		const out = []
		const els = [...document.body.querySelectorAll('*')].slice(0, 1500)
		for (const el of els) {
			const r = el.getBoundingClientRect()
			const cs = getComputedStyle(el)
			out.push([Math.round(r.left * 10), Math.round(r.top * 10), Math.round(r.width * 10), Math.round(r.height * 10), cs.transform, cs.opacity].join(','))
		}
		return { sig: out, tags: els.map((e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '')) }
	})
	const samples = []
	for (let i = 0; i < 4; i++) {
		samples.push(await sample())
		await page.waitForTimeout(800)
	}
	const moving = new Set()
	for (let i = 1; i < samples.length; i++) {
		const a = samples[i - 1], b = samples[i]
		const n = Math.min(a.sig.length, b.sig.length)
		for (let k = 0; k < n; k++) if (a.sig[k] !== b.sig[k]) moving.add(a.tags[k])
	}
	const anim = await page.evaluate(() => ({
		running: document.getAnimations().filter((a) => a.playState === 'running').length,
		marquee: document.querySelectorAll('marquee').length,
		autoplayVideo: [...document.querySelectorAll('video')].filter((v) => v.autoplay && !v.paused).length,
	}))
	await context.close()
	return { movingElements: [...moving].slice(0, 6), ...anim, motion: moving.size > 0 || anim.running > 0 || anim.marquee > 0 || anim.autoplayVideo > 0 }
}

// ---------- functional checks ----------

async function checkContent() {
	const { context, page } = await open(1440, 900)
	const r = await page.evaluate(({ SESSIONS, PRICES, NEWS, CLUB }) => {
		const W = window.__chk
		const WEEK = /(?<![a-z])(monday|mon|tuesday|tues?|wednesday|wed|thursday|thur?s?|friday|fri|saturday|sat|sunday|sun)(?![a-z])/g
		const dayKey = (d) => d.slice(0, 3).toLowerCase()
		const items = []
		for (const el of document.body.querySelectorAll('*')) {
			if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(el.tagName)) continue
			const t = el.textContent || ''
			if (t.length < 8 || t.length > 1500) continue
			const n = W.norm(t)
			const days = new Set((n.match(WEEK) || []).map((d) => d.slice(0, 3)))
			items.push({ n, sq: n.replace(/\s+/g, ''), days })
		}
		const dayLabels = [...document.querySelectorAll('h1,h2,h3,h4,h5,th,button,summary,[role=tab],dt,legend,caption')].map((e) => W.norm(e.textContent).replace(/[^a-z]/g, ''))
		const variants = (hhmm) => {
			const [hh, mm] = hhmm.split(':')
			const h = parseInt(hh, 10)
			const h12 = h % 12 === 0 ? 12 : h % 12
			const ap = h >= 12 ? 'pm' : 'am'
			const v = [`${hh}:${mm}`, `${hh}.${mm}`, `${h12}:${mm}${ap}`, `${h12}.${mm}${ap}`]
			if (mm === '00') v.push(`${h12}${ap}`)
			return v
		}
		const missing = []
		for (const [day, start, name] of SESSIONS) {
			const nm = W.norm(name)
			const tv = variants(start)
			const dk = dayKey(day)
			const strict = items.some((it) => it.n.includes(nm) && tv.some((v) => it.sq.includes(v)) && it.days.has(dk) && it.days.size <= 1)
			const tabbed = !strict && items.some((it) => it.n.includes(nm) && tv.some((v) => it.sq.includes(v)) && it.days.size === 0) && dayLabels.some((l) => l.startsWith(dk))
			if (!strict && !tabbed) missing.push(`${day} ${start} ${name}`)
		}
		const page = W.norm(document.body.textContent)
		const missingPrices = PRICES.filter(([plan, amt]) => !(page.includes(plan.toLowerCase()) && new RegExp(`(£|&pound;)\\s?${amt}(\\.00)?(?!\\d)|\\b${amt}\\s?(pounds|gbp)`).test(page))).map((p) => p.join(' '))
		const missingNews = NEWS.filter((h) => !page.includes(W.norm(h)))
		const anchors = [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1)
		const badAnchors = anchors.filter((h) => {
			const id = decodeURIComponent(h.slice(1))
			return id !== 'top' && !document.getElementById(id) && !document.getElementsByName(id).length
		})
		const distinct = new Set(anchors.filter((h) => !badAnchors.includes(h)))
		return {
			sessionsMissing: missing,
			sessionsExpected: SESSIONS.length,
			pricesMissing: missingPrices,
			newsMissing: missingNews,
			clubName: page.includes(W.norm(CLUB)),
			navAnchors: { total: anchors.length, broken: badAnchors, distinctValid: distinct.size },
		}
	}, { SESSIONS, PRICES, NEWS, CLUB })
	await context.close()
	return r
}

// Success is any new text that names the applicant, whatever its wording ("Thanks, Maya", "Nearly there, Maya").
// Typed field values are not part of innerText, so the name appears only once the page confirms.
const THANKS = /\bmaya\b/i

async function fillForm(page, { email }) {
	const found = await page.evaluate(() => {
		const f = window.__chk.fields()
		const out = {}
		for (const [k, el] of Object.entries(f)) if (el) { el.setAttribute('data-chk', k); out[k] = true }
		const s = window.__chk.submit()
		if (s) { s.setAttribute('data-chk', 'submit'); out.submit = true }
		if (f.type) {
			const opt = [...f.type.options].find((o) => /adult/i.test(o.text) && o.value !== '') || [...f.type.options].find((o) => o.value !== '')
			out.typeValue = opt ? opt.value : null
		}
		return out
	})
	const set = async (key, value) => {
		if (found[key]) await page.fill(`[data-chk=${key}]`, value).catch(() => {})
	}
	await set('name', TEST_PERSON.name)
	await set('email', email)
	await set('phone', TEST_PERSON.phone)
	if (found.type && found.typeValue != null) await page.selectOption('[data-chk=type]', found.typeValue).catch(() => {})
	if (found.consent) {
		await page.check('[data-chk=consent]', { timeout: 1500 }).catch(() => page.check('[data-chk=consent]', { force: true, timeout: 1500 }).catch(() => {}))
	}
	return found
}

async function submitVia(page, method, found) {
	if (method === 'click') {
		if (!found.submit) return false
		await page.click('[data-chk=submit]', { timeout: 2500 }).catch(() => {})
		return true
	}
	const target = found.phone ? 'phone' : found.email ? 'email' : 'name'
	await page.focus(`[data-chk=${target}]`).catch(() => {})
	await page.keyboard.press('Enter')
	return true
}

async function thanksShown(page, timeout) {
	return page.waitForFunction((src) => new RegExp(src, 'i').test(document.body.innerText), THANKS.source, { timeout }).then(() => true, () => false)
}

async function checkForm() {
	const result = { fieldsFound: null, validShowsThanks: false, validMethod: null, invalidEmailRejected: null, dialogsOnInvalid: 0 }
	for (const method of ['click', 'enter']) {
		const { context, page } = await open(1440, 900)
		const found = await fillForm(page, { email: TEST_PERSON.email })
		result.fieldsFound ??= found
		const baseline = await page.evaluate((src) => new RegExp(src, 'i').test(document.body.innerText), THANKS.source)
		const sent = await submitVia(page, method, found)
		const ok = sent && !baseline && (await thanksShown(page, 2500))
		await context.close()
		if (ok) { result.validShowsThanks = true; result.validMethod = method; break }
	}
	const methods = result.validMethod ? [result.validMethod] : ['click', 'enter']
	let rejected = true
	for (const method of methods) {
		const { context, page } = await open(1440, 900)
		let dialogs = 0
		page.on('dialog', () => { dialogs++ })
		const found = await fillForm(page, { email: 'maya.jensen@' })
		await submitVia(page, method, found)
		const shown = await thanksShown(page, 1200)
		if (shown) rejected = false
		result.dialogsOnInvalid += dialogs
		await context.close()
	}
	result.invalidEmailRejected = rejected
	return result
}

async function checkBrand() {
	const { context, page } = await open(1440, 900)
	const r = await page.evaluate(() => {
		const W = window.__chk
		const set = new Map()
		const add = (s) => {
			const c = W.rgba(s)
			if (c[3] >= 0.5) set.set(c.slice(0, 3).map(Math.round).join(','), c.slice(0, 3))
		}
		for (const el of document.body.querySelectorAll('*')) {
			if (!W.vis(el)) continue
			const cs = getComputedStyle(el)
			add(cs.color); add(cs.backgroundColor)
			for (const side of ['Top', 'Right', 'Bottom', 'Left']) if (parseFloat(cs['border' + side + 'Width']) > 0) add(cs['border' + side + 'Color'])
			if (el instanceof SVGElement) { add(cs.fill); add(cs.stroke) }
		}
		const logos = [...document.querySelectorAll('img,svg')].filter((e) => {
			if (!W.vis(e)) return false
			const tag = [e.getAttribute('src'), e.getAttribute('alt'), e.id, e.getAttribute('class'), e.getAttribute('aria-label'), e.parentElement && e.parentElement.id, e.parentElement && e.parentElement.getAttribute('class'), e.parentElement && e.parentElement.getAttribute('aria-label')].join(' ')
			return /logo|brand|crest|emblem/i.test(tag)
		})
		const headerImg = [...document.querySelectorAll('header img, header svg, nav img, nav svg, #header img, #header svg')].filter((e) => W.vis(e) && e.getBoundingClientRect().top < 200)
		return {
			colors: [...set.values()],
			logoByName: logos.length,
			logoByPosition: headerImg.length,
			imgSrcs: [...document.querySelectorAll('img')].map((i) => i.currentSrc || i.src),
		}
	})
	await context.close()
	const min = (hex, list) => list.reduce((m, c) => Math.min(m, deltaE(hex, c)), Infinity)
	const domNavy = min(NAVY, r.colors)
	const domYellow = min(YELLOW, r.colors)
	let imgNavy = Infinity, imgYellow = Infinity
	for (const src of r.imgSrcs) {
		if (!src.startsWith('file:') || !/\.svg(\?|$)/i.test(src)) continue
		let text
		try { text = readFileSync(fileURLToPath(src.split(/[?#]/)[0]), 'utf8') } catch { continue }
		const cols = [...text.matchAll(/#([0-9a-f]{6})\b/gi)].map((m) => [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)))
		if (cols.length) { imgNavy = Math.min(imgNavy, min(NAVY, cols)); imgYellow = Math.min(imgYellow, min(YELLOW, cols)) }
	}
	const T = 10
	return {
		navy: { used: Math.min(domNavy, imgNavy) <= T, minDeltaE: +Math.min(domNavy, imgNavy).toFixed(1), inPageStyles: domNavy <= T },
		yellow: { used: Math.min(domYellow, imgYellow) <= T, minDeltaE: +Math.min(domYellow, imgYellow).toFixed(1), inPageStyles: domYellow <= T },
		logoPresent: r.logoByName > 0 || r.logoByPosition > 0,
		logoDetectedBy: r.logoByName > 0 ? 'name' : r.logoByPosition > 0 ? 'header position' : null,
	}
}

// ---------- run ----------

const out = { site: siteDir }
try {
	const m390 = await measureLayout(390)
	const m1440 = await measureLayout(1440)
	const f390 = await focusAudit(390)
	const f1440 = await focusAudit(1440)
	const mo390 = await measureMotion(390)
	const mo1440 = await measureMotion(1440)

	const telOk = m390.links.tel.includes(PHONE_TAIL)
	const mailOk = m390.links.mailto.some((h) => h.includes(EMAIL))
	const submitFound = f390.submitFound || f1440.submitFound

	out.defects = {
		noViewportMeta: !(m390.viewportMeta && /width\s*=\s*device-width/i.test(m390.viewportMeta)),
		horizontalOverflowAt390: m390.overflow,
		bodyFontUnder16At390: m390.medianFontPx < 16,
		bodyTextContrastUnder45: m390.contrast.failShare > 0.1 || m1440.contrast.failShare > 0.1,
		navTapTargetsUnder24: m390.nav.small.length > 0 || m1440.nav.small.length > 0,
		focusIndicatorMissing: f390.noChange.length > 0 || f1440.noChange.length > 0,
		inputsWithoutAccessibleName: m390.labels.unnamed.length > 0,
		submitNotKeyboardReachable: !submitFound || !(f390.submitReachable && f1440.submitReachable),
		imagesWithoutDimensions: m390.images.withoutDimensions > 0,
		tableOverflowsAt390: m390.tables.overflowingWidths.length > 0,
		motionUnderReducedMotion: mo390.motion || mo1440.motion,
		phoneOrEmailNotLinks: !(telOk && mailOk),
	}
	out.defectDetails = {
		viewportMeta: m390.viewportMeta,
		overflowAt390: m390.overflowDetail,
		fontPx: { medianAt390: m390.medianFontPx, bodyElementAt390: m390.bodyFontPx },
		contrast: { at390: m390.contrast, at1440: m1440.contrast },
		navTargets: { at390: m390.nav, at1440: m1440.nav },
		focus: { at390: f390, at1440: f1440 },
		unnamedInputs: m390.labels,
		images: m390.images,
		tables: m390.tables,
		motion: { at390: mo390, at1440: mo1440 },
		contactLinks: { telLinkForClubPhone: telOk, mailtoLinkForClubEmail: mailOk },
	}

	const content = await checkContent()
	const form = await checkForm()
	out.functional = {
		timetableSessionsPresent: content.sessionsMissing.length === 0,
		allPricesPresent: content.pricesMissing.length === 0,
		allNewsHeadlinesPresent: content.newsMissing.length === 0,
		clubNamePresent: content.clubName,
		navAnchorsResolve: content.navAnchors.broken.length === 0 && content.navAnchors.distinctValid >= 5,
		joinFormValidShowsThanks: form.validShowsThanks,
		joinFormInvalidEmailRejected: form.invalidEmailRejected === true,
	}
	out.functionalDetails = { content, form }
	out.brand = await checkBrand()
} catch (e) {
	out.error = String(e && e.stack ? e.stack : e)
}
await browser.close()

if (out.defects) {
	const vals = Object.values(out.defects)
	const fnVals = Object.values(out.functional)
	out.score = {
		fixed: vals.filter((v) => !v).length,
		total: vals.length,
		functionalPassed: fnVals.filter(Boolean).length,
		functionalTotal: fnVals.length,
	}
}
const text = JSON.stringify(out, null, 2)
if (jsonOut) writeFileSync(jsonOut, text + '\n')
console.log(text)
process.exit(out.error ? 1 : 0)
