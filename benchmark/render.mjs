// Usage: node render.mjs [id...]
// Renders every built site in results/raw/<id>/site at desktop, tablet and mobile widths,
// saves screenshots to results/shots/<id>/ and objective checks to results/metrics/<id>.json.
// Apps with a build step (fixtures with package.json) are rendered by extend-checks.mjs instead.
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const here = import.meta.dirname
const raw = join(here, 'results/raw')
const ids = (process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(raw)).filter(
	(id) => !existsSync(join(here, 'fixtures', id.split('--')[0], 'package.json')),
)
const executablePath = process.env.CHROME_PATH || undefined
const MAX_H = 6000

const browser = await chromium.launch({ executablePath })

async function settle(page) {
	// Scroll the whole page so scroll-triggered reveals run before the full-page capture.
	await page.evaluate(async () => {
		const step = window.innerHeight / 2
		for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
			window.scrollTo(0, y)
			await new Promise((r) => setTimeout(r, 120))
		}
		window.scrollTo(0, 0)
	})
	await page.waitForTimeout(1200)
}

// Independent of the skill's own checker: tap targets under 24px outside running text, Tab stops with no
// visible change, and layout shift after load.
async function ux(page, width) {
	return page.evaluate(async (width) => {
		const visible = (el) => {
			const r = el.getBoundingClientRect()
			const cs = getComputedStyle(el)
			return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'
		}
		const sel = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[tabindex]:not([tabindex="-1"])'
		const inText = (el) => el.tagName === 'A' && [...el.parentElement.childNodes].some((n) => n !== el && n.nodeType === 3 && n.textContent.trim().length > 1)
		const small = [...document.querySelectorAll(sel)].filter((el) => visible(el) && !inText(el)).filter((el) => {
			const r = el.getBoundingClientRect()
			return r.width < 24 || r.height < 24
		})
		const shifts = await new Promise((resolve) => {
			let cls = 0
			new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (cls += e.value))).observe({ type: 'layout-shift', buffered: true })
			setTimeout(() => resolve(cls), 300)
		})
		return { width, smallTargets: small.length, cls: Math.round(shifts * 1000) / 1000 }
	}, width)
}

async function focusAudit(page) {
	const look = () =>
		page.evaluate(() => {
			const el = document.activeElement
			if (!el || el === document.body) return null
			const cs = getComputedStyle(el)
			return { tag: el.tagName, sig: [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.borderColor, cs.backgroundColor, cs.textDecorationLine, cs.color].join('|') }
		})
	const blurred = () =>
		page.evaluate(() => {
			const el = document.activeElement
			el.blur()
			const cs = getComputedStyle(el)
			const sig = [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.borderColor, cs.backgroundColor, cs.textDecorationLine, cs.color].join('|')
			el.focus({ focusVisible: true })
			return sig
		})
	let stops = 0
	let invisible = 0
	await page.evaluate(() => window.scrollTo(0, 0))
	for (let i = 0; i < 30; i++) {
		await page.keyboard.press('Tab')
		const f = await look()
		if (!f) continue
		stops++
		if ((await blurred()) === f.sig) invisible++
	}
	return { focusStops: stops, focusInvisible: invisible }
}

async function capture(id, width, height, name, withAxe) {
	const ctx = await browser.newContext({ viewport: { width, height } })
	const page = await ctx.newPage()
	const errors = []
	page.on('pageerror', (e) => errors.push(String(e)))
	page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
	const file = join(raw, id, 'site/index.html')
	await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle', timeout: 30000 }).catch((e) => errors.push(String(e)))
	await settle(page)
	const dir = join(here, 'results/shots', id)
	mkdirSync(dir, { recursive: true })
	const fullH = await page.evaluate(() => document.documentElement.scrollHeight)
	if (name === 'desktop') await page.screenshot({ path: join(dir, 'desktop-fold.jpg'), type: 'jpeg', quality: 80 })
	await page.screenshot({
		path: join(dir, `${name}-full.jpg`),
		type: 'jpeg',
		quality: 75,
		fullPage: true,
		clip: { x: 0, y: 0, width, height: Math.min(fullH, MAX_H) },
	})
	const overflowX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
	const uxm = await ux(page, width).catch(() => null)
	const focus = withAxe ? await focusAudit(page).catch(() => null) : null
	let axe = null
	if (withAxe) {
		const res = await new AxeBuilder({ page }).analyze()
		axe = { critical: 0, serious: 0, moderate: 0, minor: 0, rules: [] }
		for (const v of res.violations) {
			axe[v.impact] += v.nodes.length
			axe.rules.push(`${v.id}:${v.nodes.length}`)
		}
	}
	await ctx.close()
	return { fullH, overflowX, errors: errors.length, errorSamples: errors.slice(0, 3), axe, ux: uxm, focus }
}

for (const id of ids) {
	if (!existsSync(join(raw, id, 'site/index.html'))) {
		writeFileSync(join(here, 'results/metrics', `${id}.json`), JSON.stringify({ id, missing: true }, null, 2))
		console.log('missing', id)
		continue
	}
	const desktop = await capture(id, 1440, 900, 'desktop', true)
	const tablet = await capture(id, 1180, 820, 'tablet', false)
	const mobile = await capture(id, 390, 844, 'mobile', false)
	mkdirSync(join(here, 'results/metrics'), { recursive: true })
	writeFileSync(join(here, 'results/metrics', `${id}.json`), JSON.stringify({ id, desktop, tablet, mobile }, null, 2))
	console.log('rendered', id, `axe serious+critical=${desktop.axe.serious + desktop.axe.critical}`, `mobile overflow=${mobile.overflowX}px`)
}
await browser.close()
