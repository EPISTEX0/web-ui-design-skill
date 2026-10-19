// Usage: node gallery.mjs
// Writes results/gallery/index.html: every build under its blind label, with a button that reveals the arms.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const here = import.meta.dirname
const R = join(here, 'results')
const out = join(R, 'gallery')
mkdirSync(out, { recursive: true })

const titles = { 'slow-clay': 'Slow Clay pottery studio, landing page', roastline: 'Roastline roastery dashboard', 'backoff-kit': 'backoff-kit library docs' }
const sections = readdirSync(join(R, 'keys')).map((file) => {
	const brief = file.replace('.json', '')
	const { order, key } = JSON.parse(readFileSync(join(R, 'keys', file), 'utf8'))
	const prompt = readFileSync(join(here, 'briefs', `${brief}.md`), 'utf8').trim()
	const cards = order
		.map((label) => {
			const arm = key[label].split('--')[1]
			const base = `../judging/${brief}/${label}`
			return `<figure>
	<a href="${base}/desktop-full.jpg"><img src="${base}/desktop-fold.jpg" alt="${label} desktop" loading="lazy"></a>
	<figcaption><strong>${label}</strong> <a href="${base}/desktop-full.jpg">desktop</a> <a href="${base}/mobile-full.jpg">mobile</a> <span class="arm" data-arm="${arm}">${arm}</span></figcaption>
</figure>`
		})
		.join('\n')
	return `<section><h2>${titles[brief] ?? brief}</h2><p class="prompt">${prompt}</p><div class="grid">${cards}</div></section>`
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
	body.revealed .arm { visibility: visible; }
	.arm[data-arm="web-ui-design"] { background: #dbeafe; }
	.arm[data-arm="frontend-design"] { background: #fef3c7; }
	.arm[data-arm="web-ui-design-0.2"] { background: #dcfce7; }
</style>
</head>
<body>
<main>
	<h1>Blind gallery</h1>
	<p class="lede">Each page was built by Claude Sonnet 5.5 from the same prompt, either with Claude Code's defaults, with Anthropic's frontend-design skill, or with web-ui-design (v0.1 or v0.2). Pick your favorite in each row before you reveal which is which.</p>
	<button onclick="document.body.classList.toggle('revealed')">Reveal arms</button>
	${sections.join('\n')}
</main>
</body>
</html>
`,
)
console.log('wrote', join(out, 'index.html'))
