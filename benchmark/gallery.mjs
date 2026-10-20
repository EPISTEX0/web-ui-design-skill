// Usage: [ROUND=round-3] node gallery.mjs
// Writes results/[<ROUND>/]gallery/index.html: every build under its blind label, with a button that reveals the arms.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const here = import.meta.dirname
const R = process.env.ROUND ? join(here, 'results', process.env.ROUND) : join(here, 'results')
const out = join(R, 'gallery')
mkdirSync(out, { recursive: true })

const titles = {
	'slow-clay': 'Slow Clay pottery studio, landing page',
	roastline: 'Roastline roastery dashboard',
	'backoff-kit': 'backoff-kit library docs',
	tandem: 'New. Tandem bike shop, landing page',
	kestrel: 'New. Kestrel clinic, reception check-in screen',
	'salt-and-iron': 'New. Salt and Iron exhibition guide',
	shiftboard: 'Extend. Shiftboard app, add a Time off page',
	'harbour-swim': 'Improve. Harbour swim club site',
	'le-goff': 'New. Parc Le Goff oyster farm, order page',
	gannet: 'New. MV Gannet ferry loading screen',
	'dean-fungi': 'New. Dean Fungus Group species guide',
}
const md = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const sections = readdirSync(join(R, 'keys')).map((file) => {
	const brief = file.replace('.json', '')
	const { order, key } = JSON.parse(readFileSync(join(R, 'keys', file), 'utf8'))
	const prompt = readFileSync(join(here, 'briefs', `${brief}.md`), 'utf8').trim()
	const dir = join(R, 'judging', brief)
	const card = (label, arm) => {
		const base = `../judging/${brief}/${label}`
		const fold = existsSync(join(dir, label, 'desktop-fold.jpg')) ? 'desktop-fold.jpg' : 'desktop-full.jpg'
		return `<figure>
	<a href="${base}/desktop-full.jpg"><img src="${base}/${fold}" alt="${label} desktop" loading="lazy"></a>
	<figcaption><strong>${label}</strong> <a href="${base}/desktop-full.jpg">desktop</a> <a href="${base}/mobile-full.jpg">mobile</a> <span class="arm" data-arm="${arm}">${arm}</span></figcaption>
</figure>`
	}
	const reference = existsSync(join(dir, 'REFERENCE')) ? `<p class="prompt">Before the change:</p><div class="grid">${card('REFERENCE', 'original').replace('class="arm"', 'class="arm shown"')}</div><p class="prompt">After:</p>` : ''
	const notesFile = join(here, 'profiles', `${brief}.md`)
	const notes = existsSync(notesFile) ? `<details><summary>The simulated client's private notes</summary><pre>${md(readFileSync(notesFile, 'utf8').trim())}</pre></details>` : ''
	const cards = order.map((label) => card(label, key[label].split('--')[1])).join('\n')
	return `<section><h2>${titles[brief] ?? brief}</h2><p class="prompt">${md(prompt)}</p>${notes}${reference}<div class="grid">${cards}</div></section>`
})

writeFileSync(
	join(out, 'index.html'),
	`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>web-ui-design blind gallery</title>
<style>
	body { margin: 0; padding: 32px; font: 15px/1.5 system-ui, sans-serif; background: #f6f6f4; color: #1b1b1a; }
	main { max-width: 1400px; margin: 0 auto; }
	h1 { font-size: 28px; margin: 0 0 8px; }
	.lede { max-width: 70ch; color: #55554f; }
	button { font: inherit; padding: 8px 14px; border-radius: 8px; border: 1px solid #c9c9c3; background: white; cursor: pointer; }
	section { margin-top: 48px; }
	h2 { font-size: 20px; margin: 0 0 4px; }
	.prompt { max-width: 90ch; color: #55554f; font-size: 14px; }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
	figure { margin: 0; background: white; border-radius: 10px; box-shadow: 0 0 0 1px rgb(0 0 0 / 0.08); overflow: hidden; }
	img { display: block; width: 100%; aspect-ratio: 1440 / 900; object-fit: cover; object-position: top; }
	figcaption { display: flex; gap: 12px; align-items: baseline; padding: 10px 14px; }
	.arm { margin-left: auto; font-size: 13px; padding: 2px 8px; border-radius: 99px; background: #ececea; visibility: hidden; }
	body.revealed .arm, .arm.shown { visibility: visible; }
	details { max-width: 90ch; margin: 0 0 16px; font-size: 14px; }
	pre { white-space: pre-wrap; background: white; padding: 12px; border-radius: 8px; }
	.arm[data-arm="web-ui-design"] { background: #dbeafe; }
	.arm[data-arm="frontend-design"] { background: #fef3c7; }
	.arm[data-arm="web-ui-design-0.2"] { background: #dcfce7; }
	.arm[data-arm="web-ui-design-0.3"] { background: #fce7f3; }
	.arm[data-arm="web-ui-design-0.3-silent"] { background: #ede9fe; }
	.arm[data-arm="web-ui-design-0.3-wired"] { background: #ffedd5; }
	.arm[data-arm="web-ui-design-0.4"] { background: #cffafe; }
	.arm[data-arm="web-ui-design-0.4-silent"] { background: #e0e7ff; }
	.arm[data-arm="web-ui-design-0.4-wired"] { background: #fef9c3; }
</style>
</head>
<body>
<main>
	<h1>Blind gallery</h1>
	<p class="lede">Each page was built by Claude Sonnet 5.5 from the same prompt, either with Claude Code's defaults, with Anthropic's frontend-design skill, or with a version of web-ui-design. In round 3 a simulated client answers the builder's questions from private notes; the -silent arm's client declines to answer, and the -wired arm adds the README's CLAUDE.md line. Pick your favorite in each row before you reveal which is which.</p>
	<button onclick="document.body.classList.toggle('revealed')">Reveal arms</button>
	${sections.join('\n')}
</main>
</body>
</html>
`,
)
console.log('wrote', join(out, 'index.html'))
