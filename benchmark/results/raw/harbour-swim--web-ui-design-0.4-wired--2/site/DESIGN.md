# Design: Harbour Swim Club

## Brief
- **Subject**: volunteer-run swim club, Falmouth, since 1974. Members check session times; newcomers join.
- **Primary action**: look up the timetable (phone first). Second: join the club.
- **Mode**: Persuade/Read, static page.
- **Scope**: Refresh. Structure, content, logo and brand colours kept; type, spacing, components and responsive layout replaced.
- **Feel**: clean and sporty (user choice).
- **Assumed / sample content** (replace with real): news item dates (Sep-Oct 2026), the four notices in the notice bar, "Last updated" line, news item 3 now about Christmas closure.

## Must keep
Every timetable row, the four plans and prices, news text, contact details, logo and SVG images, the join form checks and thank-you message, plain static HTML/CSS/JS.

## Tokens (style.css `:root`)
- Brand: navy `#1b2a4a`, yellow `#f2c230` (members recognise them). Yellow is used only on navy (nav, table head, hero button, footer heading) and as decoration; it fails contrast on white, so headings on white are navy.
- Text: `#17203a` / `#43506a` / `#596580` on white or `#eef3f8`, all above 4.5:1.
- Type: system font stack (no web fonts, nothing to load). Body 16px, inputs 16px.
- Spacing: 4px scale `--s1..--s8`. Radius 8px (4px small). Depth: flat, 1px borders and tonal surfaces, no shadows.
- Signature: the wave from the logo as the underline of every h2.

## Decisions
- No viewport meta existed; phones rendered at 980px. Layout is now fluid (`max-width: 1080px`, grid).
- Timetable: real table on 760px+; below that each row is a card (labels from CSS, no HTML duplication). Day chips filter rows and open on today; without JS all rows show.
- Ticker removed: scrolling text was unreadable and needed JS. Replaced by a static notice list.
- Nav wraps to a second row on phones with 44px targets rather than a hamburger (five links, no JS).
- Form: visible labels, correct input types, inline errors on blur and submit, focus moves to first error. It still does not send anywhere (as before); wire up `action` when there is a backend.
