# Design notes: Harbour Swim Club

## Brief
- Case: Improve, scope Refresh (content, brand and logo kept; layout and style rebuilt).
- Primary action: join the club. Timetable and prices must be one tap away on a phone.
- Audience: club members and parents, mostly on phones.
- Feel: clean and bright, generous spacing. Navy and yellow kept; sea-blue is an accent only.
- Form: front-end only; on submit it opens a `mailto:` to info@harbourswimclub.co.uk (no backend).

## Stack
Hand-edited static site: `index.html`, `style.css`, `script.js`, `images/`. No build step.

## Tokens (see `:root` in style.css)
- Navy `#1b2a4a`, yellow `#f2c230` (brand, unchanged), sea `#0b6580` for links/accents.
- Yellow is never used as text on white (1.6:1); it sits on navy, or as fills and rules.
- Text ramp: ink `#1b2535`, `#404b5e`, `#566275`. All pass 4.5:1.
- System font stack, no web fonts. Body 17px. 4px spacing scale. Radius 8px.
- Depth: 1px ring plus soft shadow on cards only.

## Decisions
- Header is sticky with `top: -64px`: the logo bar scrolls away on phones and the nav row stays.
- Mobile nav scrolls sideways (cut edge visible) rather than hiding behind a menu button.
- Timetable keeps one `<table>`. Under 760px rows become stacked cards; day chips jump to each day.
- Notices replace the JS ticker with a static list (readable, no motion). Ticker text is unchanged.
- Membership cards link to the form and preselect the type.
- News dates and copyright still say 2013, as supplied. Update them with real content.
