# Harbour Swim Club design contract

Mode: Persuade + Read. Audience: parents and members, mostly on phones, checking the timetable.
Signature element: the timetable filters by day, flags today, and becomes stacked session cards on phones.

- Color: navy `--navy-800` (brand, header, footer, table head), gold `--gold-400` (one accent: primary buttons and the Join nav link), neutrals `--ink-*`. Gold never carries text on white (fails contrast); navy does.
- Type: one system sans stack (no web font to load or fail). Scale `--step--1` to `--step-3`, body 16px.
- Spacing: 4px scale `--s1`..`--s16`. Radius 8 / 12 / 16.
- Depth: 1px ring plus soft shadow (`--ring`) on cards, table and form.
- Motion: only press scale(0.97) and 150ms colour transitions; reduced-motion respected. The old scrolling ticker was replaced by a static notices list because moving text is hard to read and can't be paused.
- Mobile: tables become cards under 720px; controls are 44px+; inputs 16px; safe-area insets honoured.
