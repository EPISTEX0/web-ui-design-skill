// Usage: node render.mjs [id...]
// Renders every built site in results/raw/<id>/site at desktop and mobile widths,
// saves screenshots to results/shots/<id>/ and objective checks to results/metrics/<id>.json.
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const here = import.meta.dirname
const raw = join(here, 'results/raw')
const ids = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(raw)
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
	return { fullH, overflowX, errors: errors.length, errorSamples: errors.slice(0, 3), axe }
}

for (const id of ids) {
	if (!existsSync(join(raw, id, 'site/index.html'))) {
		writeFileSync(join(here, 'results/metrics', `${id}.json`), JSON.stringify({ id, missing: true }, null, 2))
		console.log('missing', id)
		continue
	}
	const desktop = await capture(id, 1440, 900, 'desktop', true)
	const mobile = await capture(id, 390, 844, 'mobile', false)
	mkdirSync(join(here, 'results/metrics'), { recursive: true })
	writeFileSync(join(here, 'results/metrics', `${id}.json`), JSON.stringify({ id, desktop, mobile }, null, 2))
	console.log('rendered', id, `axe serious+critical=${desktop.axe.serious + desktop.axe.critical}`, `mobile overflow=${mobile.overflowX}px`)
}
await browser.close()
