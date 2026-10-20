# Dean Fungus Group species guide

Single file `index.html`, no build. Page type: Read (searchable reference). Family: Editorial.

## Brief (all assumed, user said "go with what you think is best")
- Primary action: look up a species found on a foray. Audience: members, mostly on phones.
- Content: 47 species drafted from general knowledge. **The recorder must check them before publishing.** No photos (none licensed).
- Edibility shown as a label, with a standing "names fungi, not what is safe to eat" notice and a 999/111 line.

## Tokens (CSS variables at top of file)
- Colour: lichen ground, bark-green ink, moss accent (actions, season strip), fly agaric red for danger only, bracken amber for "edible with care".
- Type: serif system stack for display (Iowan/Palatino/Charter/Georgia), system sans for body. No web fonts. The checker's font FAIL is expected, since the first font is not installed on the test machine.
- Depth: hairline rules, no shadows. Radius 2px.

## Decisions
- Signature element: 12-month season strip per species with a tick on the current month.
- Safety badges pair colour with an icon and a text label.
- Filter state is stored in the URL query (q, month, form, hab, safe).
- To add a species, append an object to `SPECIES` in the script (fields documented above it).
