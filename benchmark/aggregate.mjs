// Usage: ROUND=round-3 node aggregate.mjs
// Joins build results, render metrics, transcripts and blind judgments into results/<ROUND>/summary.json and
// summary.md. With no ROUND it reads and writes results/, as rounds 1 and 2 did. The builds of a round are the
// ones its keys name. Criteria come from the judgments, so New, Extend and Improve briefs each keep their own.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

const here = import.meta.dirname
const R = join(here, 'results')
const RR = join(R, process.env.ROUND ?? '')
const ARM_ORDER = ['none', 'frontend-design', 'web-ui-design', 'web-ui-design-0.2', 'web-ui-design-0.3', 'web-ui-design-0.3-silent', 'web-ui-design-0.3-wired', 'web-ui-design-0.4', 'web-ui-design-0.4-silent', 'web-ui-design-0.4-wired']
const skillOf = (arm) => arm.replace(/-\d+\.\d+(-silent|-wired)?$/, '')
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const maybe = (p) => (existsSync(p) ? readJson(p) : null)
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN)
const median = (xs) => {
	const s = [...xs].sort((a, b) => a - b)
	return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN
}
const f = (x, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : 'n/a')
const kindOf = (brief) =>
	existsSync(join(here, 'fixtures', brief, 'package.json')) ? 'extend' : existsSync(join(here, 'fixtures', brief)) ? 'improve' : 'new'

function transcriptText(id) {
	const dir = join(R, 'raw', id)
	const parts = readdirSync(dir)
		.filter((f) => /^transcript(-\d+)?\.jsonl(\.gz)?$/.test(f))
		.sort()
	return parts.map((f) => (f.endsWith('.gz') ? gunzipSync(readFileSync(join(dir, f))).toString('utf8') : readFileSync(join(dir, f), 'utf8'))).join('\n')
}

function transcriptSignals(id) {
	const out = { skills: [], rendered: false, checker: false, tools: 0, read: [] }
	for (const line of transcriptText(id).split('\n')) {
		if (!line.trim()) continue
		let ev
		try {
			ev = JSON.parse(line)
		} catch {
			continue
		}
		if (ev.type !== 'assistant') continue
		for (const c of ev.message?.content ?? []) {
			if (c.type !== 'tool_use') continue
			out.tools++
			const cmd = c.input?.command ?? ''
			if (c.name === 'Skill') out.skills.push(c.input?.skill)
			if (c.name === 'Bash' && /chromium|screenshot|playwright|check\.mjs/i.test(cmd)) out.rendered = true
			if (c.name === 'Bash' && /check\.mjs/.test(cmd)) out.checker = true
			const refs = `${c.input?.file_path ?? ''} ${cmd}`.match(/\b(new|extend|improve|patterns)\.md\b/g)
			if (refs) out.read.push(...refs)
		}
	}
	out.read = [...new Set(out.read)]
	return out
}

const keysDir = join(RR, 'keys')
const keyFiles = existsSync(keysDir) ? readdirSync(keysDir) : []
const keys = Object.fromEntries(keyFiles.map((f) => [f.replace('.json', ''), readJson(join(keysDir, f)).key]))
const inRound = new Set(Object.values(keys).flatMap((k) => Object.values(k)))

const builds = [...inRound].map((id) => {
	const [brief, arm, rep] = id.split('--')
	const result = readJson(join(R, 'raw', id, 'result.json'))
	const metrics = maybe(join(R, 'metrics', `${id}.json`)) ?? {}
	const sig = transcriptSignals(id)
	return {
		id,
		brief,
		kind: kindOf(brief),
		arm,
		rep,
		cost: result.total_cost_usd,
		wall_s: result.wall_s,
		turns: result.num_turns,
		clientRounds: result.client_rounds ?? 0,
		delivered: result.delivered ?? true,
		error: result.is_error ?? true,
		armSkillUsed: arm !== 'none' && sig.skills.includes(skillOf(arm)),
		skillsUsed: sig.skills,
		caseFilesRead: sig.read,
		rendered: sig.rendered,
		checker: sig.checker,
		designMd: existsSync(join(R, 'raw', id, 'site/DESIGN.md')),
		axeSeriousCritical: metrics.desktop?.axe ? metrics.desktop.axe.serious + metrics.desktop.axe.critical : null,
		contrastNodes: Number(metrics.desktop?.axe?.rules?.find((r) => r.startsWith('color-contrast:'))?.split(':')[1] ?? 0),
		mobileOverflow: metrics.mobile?.overflowX > 1,
		jsErrors: (metrics.desktop?.errors ?? 0) + (metrics.mobile?.errors ?? 0),
		smallTargets: metrics.mobile?.ux?.smallTargets ?? null,
		focusInvisible: metrics.desktop?.focus?.focusInvisible ?? null,
		cls: metrics.mobile?.ux?.cls ?? null,
		improve: maybe(join(R, 'metrics', `${id}.improve.json`)),
		extend: maybe(join(R, 'metrics', `${id}.extend.json`)),
		scores: {},
	}
})
const byId = Object.fromEntries(builds.map((b) => [b.id, b]))
const ARMS = ARM_ORDER.filter((a) => builds.some((b) => b.arm === a))

const judgesDir = join(RR, 'judgments')
const judges = existsSync(judgesDir) ? readdirSync(judgesDir) : []
const criteriaOf = {}
for (const judge of judges) {
	for (const file of readdirSync(join(judgesDir, judge))) {
		const brief = file.replace('.json', '')
		const j = readJson(join(judgesDir, judge, file))
		const n = j.ranking.length
		for (const [label, s] of Object.entries(j.scores)) {
			const b = byId[keys[brief]?.[label]]
			if (!b) continue
			criteriaOf[b.kind] ??= Object.keys(s).filter((k) => typeof s[k] === 'number')
			b.scores[judge] = { ...s, rankPct: 1 - j.ranking.indexOf(label) / (n - 1) }
		}
	}
}

// The panel score of a build is the mean of every judge's score for it.
const realJudges = [...judges]
for (const b of builds) {
	const js = realJudges.filter((j) => b.scores[j])
	if (!js.length || js.length !== realJudges.length) continue
	b.scores.panel = Object.fromEntries([...criteriaOf[b.kind], 'rankPct'].map((c) => [c, mean(js.map((j) => b.scores[j][c]))]))
}
if (realJudges.length > 1) judges.push('panel')

// Mann-Whitney U, two-sided, with tie-averaged ranks. Exact over every split of the pooled ranks when that is
// cheap, which covers every comparison here; the normal approximation understates p badly at 3 against 3.
function mannWhitney(a, b) {
	const all = [...a.map((v) => [v, 0]), ...b.map((v) => [v, 1])].sort((x, y) => x[0] - y[0])
	const ranks = new Array(all.length)
	for (let i = 0; i < all.length; ) {
		let j = i
		while (j < all.length && all[j][0] === all[i][0]) j++
		for (let k = i; k < j; k++) ranks[k] = (i + j + 1) / 2
		i = j
	}
	const r1 = all.reduce((s, x, i) => s + (x[1] === 0 ? ranks[i] : 0), 0)
	const n1 = a.length
	const n2 = b.length
	const u = r1 - (n1 * (n1 + 1)) / 2
	const mu = (n1 * n2) / 2
	const sigma = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12)
	const z = (u - mu) / sigma
	const p = binomial(n1 + n2, n1) <= 200000 ? exactP(ranks, n1, Math.abs(u - mu)) : 2 * (1 - normCdf(Math.abs(z)))
	return { u, z, p }
}
function binomial(n, k) {
	let c = 1
	for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i
	return c
}
function exactP(ranks, n1, observed) {
	const n = ranks.length
	const mu = (n1 * (n - n1)) / 2
	let hits = 0
	let total = 0
	const walk = (start, left, sum) => {
		if (left === 0) {
			total++
			if (Math.abs(sum - (n1 * (n1 + 1)) / 2 - mu) >= observed - 1e-9) hits++
			return
		}
		for (let i = start; i <= n - left; i++) walk(i + 1, left - 1, sum + ranks[i])
	}
	walk(0, n1, 0)
	return hits / total
}
function normCdf(z) {
	const t = 1 / (1 + 0.2316419 * z)
	const d = 0.3989423 * Math.exp((-z * z) / 2)
	return 1 - d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
}

// Within each brief, the share of build pairs where arm A outscores arm B (ties count half).
function winRate(xs, judge, a, b) {
	let wins = 0
	let n = 0
	for (const brief of new Set(xs.map((x) => x.brief))) {
		const A = xs.filter((x) => x.brief === brief && x.arm === a && x.scores[judge])
		const B = xs.filter((x) => x.brief === brief && x.arm === b && x.scores[judge])
		for (const x of A)
			for (const y of B) {
				const d = x.scores[judge].overall - y.scores[judge].overall
				wins += d > 0 ? 1 : d === 0 ? 0.5 : 0
				n++
			}
	}
	return n ? wins / n : NaN
}

function spearman(xs, j1, j2) {
	const both = xs.filter((b) => b.scores[j1] && b.scores[j2])
	const rank = (vs) => {
		const s = vs.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0])
		const r = new Array(vs.length)
		for (let i = 0; i < s.length; ) {
			let j = i
			while (j < s.length && s[j][0] === s[i][0]) j++
			for (let k = i; k < j; k++) r[s[k][1]] = (i + j + 1) / 2
			i = j
		}
		return r
	}
	const a = rank(both.map((b) => b.scores[j1].overall))
	const c = rank(both.map((b) => b.scores[j2].overall))
	const ma = mean(a)
	const mc = mean(c)
	const cov = a.reduce((s, v, i) => s + (v - ma) * (c[i] - mc), 0)
	const sd = Math.sqrt(a.reduce((s, v) => s + (v - ma) ** 2, 0) * c.reduce((s, v) => s + (v - mc) ** 2, 0))
	return cov / sd
}

const count = (xs, pred) => xs.filter(pred).length
const summary = { builds: builds.length, judges, kinds: {}, judgeAgreementSpearman: {} }
for (const kind of ['new', 'extend', 'improve']) {
	const kb = builds.filter((b) => b.kind === kind)
	if (!kb.length) continue
	const arms = ARMS.filter((a) => kb.some((b) => b.arm === a))
	const criteria = criteriaOf[kind] ?? []
	const K = { briefs: [...new Set(kb.map((b) => b.brief))], criteria, arms: {}, pairwise: {}, perBrief: {} }
	for (const arm of arms) {
		const xs = kb.filter((b) => b.arm === arm)
		const s = {
			n: xs.length,
			cost: mean(xs.map((b) => b.cost)),
			wall_s: median(xs.map((b) => b.wall_s)),
			errors: count(xs, (b) => b.error),
			undelivered: count(xs, (b) => !b.delivered),
			asked: count(xs, (b) => b.clientRounds > 0),
			armSkillUsed: count(xs, (b) => b.armSkillUsed),
			builtinDesignUsed: count(xs, (b) => b.skillsUsed.includes('design')),
			rendered: count(xs, (b) => b.rendered),
			checker: count(xs, (b) => b.checker),
			designMd: count(xs, (b) => b.designMd),
			contrastFailBuilds: count(xs, (b) => b.contrastNodes > 0),
			axeSeriousCritical: median(xs.map((b) => b.axeSeriousCritical ?? 0)),
			mobileOverflow: count(xs, (b) => b.extend?.mobileOverflow ?? b.mobileOverflow),
			smallTargets: median(xs.map((b) => b.smallTargets ?? 0)),
			focusInvisible: median(xs.map((b) => b.focusInvisible ?? 0)),
			judges: {},
		}
		if (kind === 'improve') {
			s.defectsLeft = mean(xs.map((b) => b.improve?.defectsLeft ?? NaN))
			s.functionalPass = count(xs, (b) => b.improve?.functionalPass)
			s.brandKept = count(xs, (b) => b.improve?.brandKept)
		}
		if (kind === 'extend') {
			s.buildPass = count(xs, (b) => b.extend?.build)
			s.colorLiterals = median(xs.map((b) => b.extend?.newColorLiterals ?? NaN))
			s.reusesComponents = count(xs, (b) => b.extend?.reusesComponents)
			s.collateral = count(xs, (b) => b.extend?.collateralChanged)
			s.functionalPass = count(xs, (b) => b.extend?.functionalPass)
			s.actionsReachable = count(xs, (b) => b.extend?.actionsReachableMobile)
		}
		for (const judge of judges) {
			const sc = xs.filter((b) => b.scores[judge]).map((b) => b.scores[judge])
			s.judges[judge] = Object.fromEntries([...criteria.map((c) => [c, mean(sc.map((x) => x[c]))]), ['rankPct', mean(sc.map((x) => x.rankPct))]])
		}
		K.arms[arm] = s
	}
	for (const judge of judges) {
		K.pairwise[judge] = {}
		for (let j = 1; j < arms.length; j++)
			for (let i = 0; i < j; i++) {
				const [a, b] = [arms[j], arms[i]]
				const A = kb.filter((x) => x.arm === a && x.scores[judge]).map((x) => x.scores[judge].overall)
				const B = kb.filter((x) => x.arm === b && x.scores[judge]).map((x) => x.scores[judge].overall)
				K.pairwise[judge][`${a} vs ${b}`] = { winRate: winRate(kb, judge, a, b), ...mannWhitney(A, B) }
			}
		K.perBrief[judge] = {}
		for (const brief of K.briefs)
			K.perBrief[judge][brief] = Object.fromEntries(
				arms.map((arm) => [arm, mean(kb.filter((x) => x.brief === brief && x.arm === arm && x.scores[judge]).map((x) => x.scores[judge].overall))]),
			)
	}
	summary.kinds[kind] = K
}
for (let x = 0; x < realJudges.length; x++)
	for (let y = x + 1; y < realJudges.length; y++) summary.judgeAgreementSpearman[`${realJudges[x]} ~ ${realJudges[y]}`] = spearman(builds, realJudges[x], realJudges[y])
writeFileSync(join(RR, 'summary.json'), JSON.stringify({ summary, builds }, null, 2))

const lines = [`# Results`, ``, `${builds.length} builds, judges: ${judges.join(', ') || 'none yet'}.`]
for (const [kind, K] of Object.entries(summary.kinds)) {
	const arms = Object.keys(K.arms)
	lines.push(``, `## ${kind}: ${K.briefs.join(', ')}`, ``)
	const extra =
		kind === 'improve'
			? [['Defects left, mean', (s) => f(s.defectsLeft, 1)], ['Content and flows kept', (s) => `${s.functionalPass}/${s.n}`], ['Brand kept', (s) => `${s.brandKept}/${s.n}`]]
			: kind === 'extend'
				? [['App builds', (s) => `${s.buildPass}/${s.n}`], ['New color literals, median', (s) => f(s.colorLiterals, 0)], ['Reuses components', (s) => `${s.reusesComponents}/${s.n}`], ['Changed existing pages', (s) => `${s.collateral}/${s.n}`], ['Flow works', (s) => `${s.functionalPass}/${s.n}`], ['Actions reachable at 390 px', (s) => `${s.actionsReachable}/${s.n}`]]
				: []
	// Extend builds are scored by extend-checks.mjs, not render.mjs, so the render-only columns would read as zeros.
	const RENDER_ONLY = ['Contrast failures', 'Targets under 24px, median', 'Tab stops without focus style, median']
	const cols = [
		['n', (s) => s.n],
		['Mean cost', (s) => `$${f(s.cost)}`],
		['Median time', (s) => `${f(s.wall_s, 0)}s`],
		['Asked the client', (s) => `${s.asked}/${s.n}`],
		['Delivered', (s) => `${s.n - s.undelivered}/${s.n}`],
		['Arm skill used', (s) => `${s.armSkillUsed}/${s.n}`],
		['Ran check.mjs', (s) => `${s.checker}/${s.n}`],
		['DESIGN.md', (s) => `${s.designMd}/${s.n}`],
		['Contrast failures', (s) => `${s.contrastFailBuilds}/${s.n}`],
		['Mobile overflow', (s) => `${s.mobileOverflow}/${s.n}`],
		['Targets under 24px, median', (s) => f(s.smallTargets, 0)],
		['Tab stops without focus style, median', (s) => f(s.focusInvisible, 0)],
		...extra,
	].filter(([name]) => kind !== 'extend' || !RENDER_ONLY.includes(name))
	lines.push(`| Arm | ${cols.map((c) => c[0]).join(' | ')} |`, `| --- |${' --- |'.repeat(cols.length)}`)
	for (const arm of arms) lines.push(`| ${arm} | ${cols.map((c) => c[1](K.arms[arm])).join(' | ')} |`)
	for (const judge of judges) {
		lines.push(``, `### ${kind}, judge: ${judge}`, ``, `| Arm | ${K.criteria.join(' | ')} | rank percentile |`, `| --- |${' --- |'.repeat(K.criteria.length + 1)}`)
		for (const arm of arms) {
			const j = K.arms[arm].judges[judge]
			lines.push(`| ${arm} | ${K.criteria.map((c) => f(j[c])).join(' | ')} | ${f(j.rankPct)} |`)
		}
		lines.push(``, `| Comparison | Win rate (same brief) | Mann-Whitney p |`, `| --- | --- | --- |`)
		for (const [k, v] of Object.entries(K.pairwise[judge])) lines.push(`| ${k} | ${f(v.winRate)} | ${f(v.p, 3)} |`)
		if (K.briefs.length > 1) {
			lines.push(``, `| Brief | ${arms.join(' | ')} |`, `| --- |${' --- |'.repeat(arms.length)}`)
			for (const [brief, v] of Object.entries(K.perBrief[judge])) lines.push(`| ${brief} | ${arms.map((a) => f(v[a])).join(' | ')} |`)
		}
	}
}
lines.push(``, `Judge agreement on overall scores (Spearman rank correlation):`, ``)
for (const [k, v] of Object.entries(summary.judgeAgreementSpearman)) lines.push(`- ${k}: ${f(v)}`)
writeFileSync(join(RR, 'summary.md'), lines.join('\n') + '\n')
console.log(lines.join('\n'))
