// Usage: node aggregate.mjs
// Joins build results, render metrics, transcripts and blind judgments into results/summary.json and results/summary.md.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'

const here = import.meta.dirname
const R = join(here, 'results')
const ARMS = ['none', 'frontend-design', 'web-ui-design']
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN)
const median = (xs) => {
	const s = [...xs].sort((a, b) => a - b)
	return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN
}
const f = (x, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : 'n/a')

function transcriptSignals(id) {
	const p = join(R, 'raw', id, 'transcript.jsonl')
	const out = { skills: [], rendered: false, tools: 0 }
	const text = existsSync(p) ? readFileSync(p, 'utf8') : existsSync(`${p}.gz`) ? gunzipSync(readFileSync(`${p}.gz`)).toString('utf8') : ''
	for (const line of text.split('\n')) {
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
			if (c.name === 'Skill') out.skills.push(c.input?.skill)
			if (c.name === 'Bash' && /chromium|screenshot|playwright/i.test(c.input?.command ?? '')) out.rendered = true
		}
	}
	return out
}

const builds = readdirSync(join(R, 'raw'))
	.filter((id) => !id.endsWith('--smoke'))
	.map((id) => {
		const [brief, arm, rep] = id.split('--')
		const result = readJson(join(R, 'raw', id, 'result.json'))
		const mp = join(R, 'metrics', `${id}.json`)
		const metrics = existsSync(mp) ? readJson(mp) : {}
		const sig = transcriptSignals(id)
		return {
			id,
			brief,
			arm,
			rep,
			cost: result.total_cost_usd,
			wall_s: result.wall_s,
			turns: result.num_turns,
			error: result.is_error ?? true,
			armSkillUsed: arm !== 'none' && sig.skills.includes(arm),
			skillsUsed: sig.skills,
			rendered: sig.rendered,
			designMd: existsSync(join(R, 'raw', id, 'site/DESIGN.md')),
			axeSeriousCritical: metrics.desktop?.axe ? metrics.desktop.axe.serious + metrics.desktop.axe.critical : null,
			mobileOverflow: metrics.mobile?.overflowX > 1,
			jsErrors: (metrics.desktop?.errors ?? 0) + (metrics.mobile?.errors ?? 0),
			scores: {},
		}
	})
const byId = Object.fromEntries(builds.map((b) => [b.id, b]))

const judgesDir = join(R, 'judgments')
const judges = existsSync(judgesDir) ? readdirSync(judgesDir) : []
for (const judge of judges) {
	for (const file of readdirSync(join(judgesDir, judge))) {
		const brief = file.replace('.json', '')
		const { key } = readJson(join(R, 'keys', `${brief}.json`))
		const j = readJson(join(judgesDir, judge, file))
		const n = j.ranking.length
		for (const [label, s] of Object.entries(j.scores)) {
			const b = byId[key[label]]
			if (!b) continue
			b.scores[judge] = { ...s, rankPct: 1 - j.ranking.indexOf(label) / (n - 1) }
		}
	}
}

// The panel score of a build is the mean of every judge's score for it.
const realJudges = [...judges]
for (const b of builds) {
	const js = realJudges.filter((j) => b.scores[j])
	if (js.length !== realJudges.length) continue
	b.scores.panel = Object.fromEntries(['craft', 'fit', 'hierarchy', 'mobile', 'overall', 'rankPct'].map((c) => [c, mean(js.map((j) => b.scores[j][c]))]))
}
if (realJudges.length > 1) judges.push('panel')

// Mann-Whitney U, two-sided, normal approximation with tie-averaged ranks.
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
	const p = 2 * (1 - normCdf(Math.abs(z)))
	return { u, z, p }
}
function normCdf(z) {
	const t = 1 / (1 + 0.2316419 * z)
	const d = 0.3989423 * Math.exp((-z * z) / 2)
	return 1 - d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
}

// Within each brief, the share of build pairs where arm A outscores arm B (ties count half).
function winRate(judge, a, b) {
	let wins = 0
	let n = 0
	for (const brief of new Set(builds.map((x) => x.brief))) {
		const A = builds.filter((x) => x.brief === brief && x.arm === a && x.scores[judge])
		const B = builds.filter((x) => x.brief === brief && x.arm === b && x.scores[judge])
		for (const x of A)
			for (const y of B) {
				const d = x.scores[judge].overall - y.scores[judge].overall
				wins += d > 0 ? 1 : d === 0 ? 0.5 : 0
				n++
			}
	}
	return n ? wins / n : NaN
}

const criteria = ['craft', 'fit', 'hierarchy', 'mobile', 'overall']
const summary = { builds: builds.length, judges, arms: {}, pairwise: {}, perBrief: {} }
for (const arm of ARMS) {
	const xs = builds.filter((b) => b.arm === arm)
	const s = {
		n: xs.length,
		cost: mean(xs.map((b) => b.cost)),
		wall_s: median(xs.map((b) => b.wall_s)),
		errors: xs.filter((b) => b.error).length,
		armSkillUsed: xs.filter((b) => b.armSkillUsed).length,
		builtinDesignUsed: xs.filter((b) => b.skillsUsed.includes('design')).length,
		rendered: xs.filter((b) => b.rendered).length,
		designMd: xs.filter((b) => b.designMd).length,
		axeSeriousCritical: mean(xs.map((b) => b.axeSeriousCritical ?? 0)),
		mobileOverflow: xs.filter((b) => b.mobileOverflow).length,
		judges: {},
	}
	for (const judge of judges) {
		const sc = xs.filter((b) => b.scores[judge]).map((b) => b.scores[judge])
		s.judges[judge] = Object.fromEntries([...criteria.map((c) => [c, mean(sc.map((x) => x[c]))]), ['rankPct', mean(sc.map((x) => x.rankPct))]])
	}
	summary.arms[arm] = s
}
for (const judge of judges) {
	summary.pairwise[judge] = {}
	for (const [a, b] of [
		['web-ui-design', 'none'],
		['web-ui-design', 'frontend-design'],
		['frontend-design', 'none'],
	]) {
		const A = builds.filter((x) => x.arm === a && x.scores[judge]).map((x) => x.scores[judge].overall)
		const B = builds.filter((x) => x.arm === b && x.scores[judge]).map((x) => x.scores[judge].overall)
		summary.pairwise[judge][`${a} vs ${b}`] = { winRate: winRate(judge, a, b), ...mannWhitney(A, B) }
	}
	summary.perBrief[judge] = {}
	for (const brief of new Set(builds.map((x) => x.brief)))
		summary.perBrief[judge][brief] = Object.fromEntries(
			ARMS.map((arm) => [arm, mean(builds.filter((x) => x.brief === brief && x.arm === arm && x.scores[judge]).map((x) => x.scores[judge].overall))]),
		)
}
summary.judgeAgreementSpearman = {}
for (let x = 0; x < realJudges.length; x++)
	for (let y = x + 1; y < realJudges.length; y++) {
	const [j1, j2] = [realJudges[x], realJudges[y]]
	const both = builds.filter((b) => b.scores[j1] && b.scores[j2])
	const rank = (xs) => {
		const s = xs.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0])
		const r = new Array(xs.length)
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
	summary.judgeAgreementSpearman[`${j1} ~ ${j2}`] = cov / sd
	}
writeFileSync(join(R, 'summary.json'), JSON.stringify({ summary, builds }, null, 2))

const lines = [`# Results`, ``, `${builds.length} builds, judges: ${judges.join(', ') || 'none yet'}.`, ``]
lines.push(`| Arm | n | Mean cost | Median time | Arm skill used | Rendered itself | Axe serious+critical | Mobile overflow |`)
lines.push(`| --- | --- | --- | --- | --- | --- | --- | --- |`)
for (const arm of ARMS) {
	const s = summary.arms[arm]
	lines.push(`| ${arm} | ${s.n} | $${f(s.cost)} | ${f(s.wall_s, 0)}s | ${arm === 'none' ? 'n/a' : `${s.armSkillUsed}/${s.n}`} | ${s.rendered}/${s.n} | ${f(s.axeSeriousCritical, 1)} | ${s.mobileOverflow}/${s.n} |`)
}
for (const judge of judges) {
	lines.push(``, `## Judge: ${judge}`, ``, `| Arm | ${criteria.join(' | ')} | rank percentile |`, `| --- |${' --- |'.repeat(criteria.length + 1)}`)
	for (const arm of ARMS) {
		const j = summary.arms[arm].judges[judge]
		lines.push(`| ${arm} | ${criteria.map((c) => f(j[c])).join(' | ')} | ${f(j.rankPct)} |`)
	}
	lines.push(``, `| Comparison | Win rate (same brief) | Mann-Whitney p |`, `| --- | --- | --- |`)
	for (const [k, v] of Object.entries(summary.pairwise[judge])) lines.push(`| ${k} | ${f(v.winRate)} | ${f(v.p, 3)} |`)
	lines.push(``, `| Brief | ${ARMS.join(' | ')} |`, `| --- |${' --- |'.repeat(ARMS.length)}`)
	for (const [brief, v] of Object.entries(summary.perBrief[judge])) lines.push(`| ${brief} | ${ARMS.map((a) => f(v[a])).join(' | ')} |`)
}
lines.push(``, `Judge agreement on overall scores (Spearman rank correlation):`, ``)
for (const [k, v] of Object.entries(summary.judgeAgreementSpearman)) lines.push(`- ${k}: ${f(v)}`)
writeFileSync(join(R, 'summary.md'), lines.join('\n') + '\n')
console.log(lines.join('\n'))
