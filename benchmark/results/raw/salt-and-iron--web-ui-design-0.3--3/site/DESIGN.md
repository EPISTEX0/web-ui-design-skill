# Design: Salt and Iron gallery guide

## Brief
- Subject: online guide for the exhibition Salt and Iron, Harwick Maritime Museum, 14 March – 2 November 2027 (source: user).
- Primary action: step through the 12 stops in gallery order (user). Audience: visitors on phones inside the galleries, often with poor signal (user).
- Mode: Read. Family: Editorial (user).
- Assets: rust #9c3d1f, off-black, warm white, serif headings like the printed labels (user). No logo.
- Content: only the name, museum and dates are real. The 12 stop titles and all text are sample (assumed; user holds the real titles and has not sent them yet).

## Tokens (in index.html `:root`)
- Colour: `--rust #9c3d1f` (accent, stop numerals, primary button); `--ink #1f1b18` (text); `--paper #f7f2e9` (ground); `--paper-deep`, `--ink-soft`, `--rule` are tints of those three.
- Type: system serif stack for headings and body (printed-label feel, no font download, works offline); system sans for small labels and buttons. Body 18px.
- Spacing 4px base; radius 2px; depth by hairline rules only; tap target 48px; motion is a single short fade-up, off under reduced motion.

## Decisions
- Single file, hash routes `#stop-N`; stop content is the `STOPS` array at the top of the script.
- Signature: a 12-segment chain strip, where the segments are done, current and to-come, with a very large rust numeral like a printed label.
- Fixed Previous/Next bar at the bottom, in thumb reach; arrow keys also work. The last visited stop is saved in localStorage for a "Continue" button.
- Known checker FAIL: "Iowan Old Style not loaded". This is the checker machine lacking that system font. On visitors' devices the stack falls back to Palatino or Georgia, which is intended. Add a webfont only if the brand serif is supplied.
