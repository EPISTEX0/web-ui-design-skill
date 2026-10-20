# Harbour Swim Club: design

Static site: `index.html`, `style.css`, `script.js`, no build step. Hand-editable.

## Brief
- Primary action: join the club (header button, hero button, form).
- Users: members and parents, mostly on phones, checking the timetable.
- Scope: Refresh (same content and brand, rebuilt layout). Assumed, not confirmed with the club.

## Tokens (see `:root` in style.css)
- Navy `#1b2a4a` and yellow `#f2c230` come from the logo. Yellow only as a fill with navy text, or as text on navy. Never as text on white (1.6:1).
- Text `#1f2a3d`, secondary text `#4a566b`, tint `#eef3f8`.
- System font stack, 16px body, 4px-based spacing, 8px radius, flat surfaces with 1px borders.

## Decisions
- Timetable is a real table on desktop. Below 640px each row becomes a card, using `data-label` on every `td`. When adding a row, copy an existing one so the labels and `data-day` come along.
- Day filter buttons are built by script.js. Without JS the full table shows.
- The scrolling ticker became a static notices list: moving text can't be read or tapped on a phone.
- The join form uses native labels, `type=email` and `type=tel`, inline errors, and focus moves to the first error. It still has no back end: submitting only shows the thank-you message.
