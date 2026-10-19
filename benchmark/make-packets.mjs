// Usage: node make-packets.mjs
// Copies screenshots into results/judging/<brief>/<label>/ under random labels.
// The label-to-arm key goes to results/keys/<brief>.json, outside the folder judges read.
import { cpSync, mkdirSync, readdirSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { randomInt } from 'node:crypto'

const here = import.meta.dirname
const shots = join(here, 'results/shots')
const ids = readdirSync(shots).filter((id) => !id.endsWith('--smoke'))
const briefs = [...new Set(ids.map((id) => id.split('--')[0]))]
const letters = 'ABCDEFGHJKMNPQRSTUVWXYZ'
rmSync(join(here, 'results/judging'), { recursive: true, force: true })

for (const brief of briefs) {
	const mine = ids.filter((id) => id.startsWith(`${brief}--`))
	for (let i = mine.length - 1; i > 0; i--) {
		const j = randomInt(i + 1)
		;[mine[i], mine[j]] = [mine[j], mine[i]]
	}
	const used = new Set()
	const key = {}
	for (const id of mine) {
		let label
		do label = letters[randomInt(letters.length)] + randomInt(2, 10)
		while (used.has(label))
		used.add(label)
		key[label] = id
		const dest = join(here, 'results/judging', brief, label)
		mkdirSync(dest, { recursive: true })
		for (const f of ['desktop-fold.jpg', 'desktop-full.jpg', 'mobile-full.jpg']) {
			if (existsSync(join(shots, id, f))) cpSync(join(shots, id, f), join(dest, f))
		}
	}
	mkdirSync(join(here, 'results/keys'), { recursive: true })
	writeFileSync(join(here, 'results/keys', `${brief}.json`), JSON.stringify({ order: Object.keys(key), key }, null, 2))
	console.log(brief, Object.keys(key).join(' '))
}
