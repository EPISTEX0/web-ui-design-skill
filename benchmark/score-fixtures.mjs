// Usage: node score-fixtures.mjs [id...]
// Runs the Improve and Extend checks on builds of fixture briefs. Writes the raw report to
// results/metrics/<id>.<kind>.raw.json and the fields aggregate.mjs reads to results/metrics/<id>.<kind>.json.
// Extend builds also get their screenshots here, named like render.mjs names them.
// An id whose arm is "original" scores the untouched fixture, the REFERENCE judges compare against.
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const here = import.meta.dirname
const raw = join(here, 'results/raw')
const metrics = join(here, 'results/metrics')
mkdirSync(metrics, { recursive: true })
const ids = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(raw).filter((id) => !id.endsWith('--smoke'))

for (const id of ids) {
	const brief = id.split('--')[0]
	const fixture = join(here, 'fixtures', brief)
	if (!existsSync(fixture)) continue
	const site = join(raw, id, 'site')
	const kind = existsSync(join(fixture, 'package.json')) ? 'extend' : 'improve'
	const rawOut = join(metrics, `${id}.${kind}.raw.json`)
	if (kind === 'improve') {
		try {
			execFileSync('node', [join(here, 'improve-checks.mjs'), site, '--json', rawOut], { stdio: 'ignore', timeout: 180000 })
		} catch {}
		const r = existsSync(rawOut) ? JSON.parse(readFileSync(rawOut, 'utf8')) : null
		const out = r && {
			defectsLeft: r.score.total - r.score.fixed,
			defectsTotal: r.score.total,
			functionalPass: r.score.functionalPassed === r.score.functionalTotal,
			functionalPassed: r.score.functionalPassed,
			brandKept: Boolean(r.brand.navy.used && r.brand.yellow.used && r.brand.logoPresent),
		}
		writeFileSync(join(metrics, `${id}.improve.json`), JSON.stringify(out, null, 2))
		console.log(id, JSON.stringify(out))
		continue
	}
	const shots = join(here, 'results/shots', id)
	rmSync(shots, { recursive: true, force: true })
	mkdirSync(shots, { recursive: true })
	// Builds keep dist/ but not node_modules, so a build that needs rebuilding borrows the fixture's.
	if (!existsSync(join(site, 'node_modules'))) cpSync(join(fixture, 'node_modules'), join(site, 'node_modules'), { recursive: true, verbatimSymlinks: true })
	try {
		execFileSync('node', [join(here, 'extend-checks.mjs'), site, '--baseline', fixture, '--out', shots, '--json', rawOut], { stdio: 'ignore', timeout: 600000 })
	} catch {}
	rmSync(join(site, 'node_modules'), { recursive: true, force: true })
	const r = existsSync(rawOut) ? JSON.parse(readFileSync(rawOut, 'utf8')) : null
	const original = id.split('--')[1] === 'original'
	const names = original
		? { 'schedule-desktop.jpg': 'desktop-full.jpg', 'schedule-mobile.jpg': 'mobile-full.jpg' }
		: { 'timeoff-desktop.jpg': 'desktop-full.jpg', 'timeoff-mobile.jpg': 'mobile-full.jpg' }
	for (const [from, to] of Object.entries(names)) if (existsSync(join(shots, from))) renameSync(join(shots, from), join(shots, to))
	for (const f of readdirSync(shots)) if (!Object.values(names).includes(f)) rmSync(join(shots, f))
	const out = r && {
		build: Boolean(r.build?.passed),
		pageFound: Boolean(r.page?.found),
		newColorLiterals: (r.tokens?.newColorLiterals?.count ?? 0) + (r.tokens?.newNamedColorKeywords?.count ?? 0),
		newRawPx: r.tokens?.newRawPx?.count ?? 0,
		newCustomProperties: r.tokens?.newCustomProperties?.count ?? 0,
		reusesComponents: Boolean(r.tokens?.importsExistingComponents),
		newComponentFiles: r.tokens?.newComponentFiles?.count ?? 0,
		dependenciesAdded: r.tokens?.dependenciesAdded ?? [],
		collateralChanged: (r.collateral?.maxRatioIgnoringNav ?? 1) > 0.001,
		mobileOverflow: Boolean(r.page?.mobileOverflowX),
		functionalPass: Boolean(r.functional?.passed),
	}
	writeFileSync(join(metrics, `${id}.extend.json`), JSON.stringify(out, null, 2))
	console.log(id, JSON.stringify(out))
}
