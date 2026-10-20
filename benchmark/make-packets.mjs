// Usage: ROUND=round-3 BRIEFS=tandem,kestrel node make-packets.mjs
// Copies screenshots into results/<ROUND>/judging/<brief>/<label>/ under random labels.
// The label-to-arm key goes to results/<ROUND>/keys/<brief>.json, outside the folder judges read.
// A build whose arm is "original" is the starting point of an Improve or Extend brief. It goes to a folder
// named REFERENCE instead of a label, together with the client's notes when the brief has them.
// With no ROUND, it writes to results/ as rounds 1 and 2 did.
import { cpSync, mkdirSync, readdirSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { randomInt } from 'node:crypto'

const here = import.meta.dirname
const shots = join(here, 'results/shots')
const base = join(here, 'results', process.env.ROUND ?? '')
const only = process.env.BRIEFS?.split(',')
const ids = readdirSync(shots).filter((id) => !id.endsWith('--smoke') && (!only || only.includes(id.split('--')[0])))
const briefs = [...new Set(ids.map((id) => id.split('--')[0]))]
const letters = 'ABCDEFGHJKMNPQRSTUVWXYZ'
const files = ['desktop-fold.jpg', 'desktop-full.jpg', 'tablet-full.jpg', 'mobile-full.jpg']

for (const brief of briefs) {
	rmSync(join(base, 'judging', brief), { recursive: true, force: true })
	const mine = ids.filter((id) => id.startsWith(`${brief}--`) && id.split('--')[1] !== 'original')
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
		const dest = join(base, 'judging', brief, label)
		mkdirSync(dest, { recursive: true })
		for (const f of files) if (existsSync(join(shots, id, f))) cpSync(join(shots, id, f), join(dest, f))
	}
	const original = ids.find((id) => id.startsWith(`${brief}--original--`))
	if (original) {
		const dest = join(base, 'judging', brief, 'REFERENCE')
		mkdirSync(dest, { recursive: true })
		for (const f of files) if (existsSync(join(shots, original, f))) cpSync(join(shots, original, f), join(dest, f))
	}
	const notes = join(here, 'profiles', `${brief}.md`)
	if (existsSync(notes)) cpSync(notes, join(base, 'judging', brief, 'client-notes.md'))
	cpSync(join(here, 'briefs', `${brief}.md`), join(base, 'judging', brief, 'request.md'))
	mkdirSync(join(base, 'keys'), { recursive: true })
	writeFileSync(join(base, 'keys', `${brief}.json`), JSON.stringify({ order: Object.keys(key), key }, null, 2))
	console.log(brief, Object.keys(key).join(' '))
}
