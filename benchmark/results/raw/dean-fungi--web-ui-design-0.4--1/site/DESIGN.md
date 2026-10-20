# Dean Fungus Group species guide

## Brief
- Subject: Forest of Dean foray species guide for group members (source: recorder).
- Primary action: look up a find by name, month, habitat or label. Mode: Read. Mostly phones, often poor signal.
- Assets: moss #4a5d23 on cream #f3ecd8 (newsletter). Beech woodcut to come (slot in the header, `#woodcut`).
- Content: 16 species and 4 look-alike pairs from the recorder's notes. Labels, months, habitats and ID text are DRAFT, not yet checked (`REVIEWED = false` in the script shows a banner).

## Rules from the recorder
- Four labels only: Eaten by members, Not worth eating, Poisonous, Deadly. The word "edible" is never used.
- Red #b3261e is for Deadly only. No russet accent.
- Every Poisonous and Deadly entry carries the exact line: "If someone may have eaten this, call 999 or NHS 111 now and keep a piece of the mushroom."
- Every "Eaten by members" entry shows its look-alike beside it.
- No photos, no cartoon toadstools, no emojis. Plain line drawings of general shape, plus "Photo to come" boxes.

## Tokens
Cream #f3ecd8, paper #faf6e8, ink #2b2a1c, muted #5c5a45, moss #4a5d23, moss-deep #34421a, plum #5b3a5e (Poisonous), red #b3261e (Deadly).
Georgia stack for names, system sans for UI. No web fonts. 4px spacing base, radius 3 and 6, flat depth with hairline rules.

## Decisions
- Single file, everything inline, about 29 KB, so it loads on weak signal. `sw.js` keeps an offline copy after one visit over https.
- Label shown as text plus badge shape, never colour alone.
- Fly agaric and Deadly webcap list birch as a habitat, so a Birch filter was added to the recorder's five.
