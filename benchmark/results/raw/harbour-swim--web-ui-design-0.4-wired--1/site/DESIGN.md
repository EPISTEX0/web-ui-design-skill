# Harbour Swim Club: design notes

## Brief
- Page type: Persuade/Operate mix. A one-page club site; the main job is checking the weekly timetable on a phone, often poolside. Source: user.
- Users: parents and older members, mostly on phones. Source: user.
- Feel: clean and coastal. Keep the navy and yellow and the logo. Source: user.
- Scope: Refresh. Structure and content kept, visual style and mobile behaviour replaced. Source: user.
- Constraint: plain HTML, CSS and JS only, hand-edited by volunteers. No build step, no frameworks, no web fonts. Source: user.
- News: kept verbatim (2013 dates). Source: assumed, user left it to us.

## Tokens (style.css `:root`)
- Navy #1b2a4a, yellow #f2c230 (brand, unchanged). Sea tints #eef5f9 / #dbe8f0 for section bands.
- Yellow never carries text on white (1.6:1). It is for fills, bars and the one primary button, with navy text on it.
- Text ramp: #16233f, #43506a, #5a6781, all above 4.5:1 on white and on the sea tint.
- Type: system font stack, 16px body, 1.55 line height. Sentence case.
- Spacing on a 4px scale. Radius 12px cards, 8px controls.
- Depth: flat bands of tone plus 1px borders. The only shadow is under the sticky nav.

## Decisions
- Timetable is the same `<table>`. Under 720px each row becomes a card (time first, then session, then lane, level, coach) using CSS only, so volunteers still edit plain `<tr>`/`<td>` rows with no extra attributes.
- Day filter is built by script.js from the first cell of each row and opens on today. Without JS every row shows.
- The nav is a sticky strip that scrolls sideways on small phones; the cut-off edge shows there is more.
- The scrolling ticker is now a static "Club notices" list: no motion, readable, nothing to pause.
- Header gets a tap-to-call button, since most visitors are on phones.
- Join form: real labels, 48px fields, inline errors on blur and on submit, focus moves to the first error. Replaces alert() popups.
- Footer: "Last updated 12 March 2013" removed and the copyright year set to 2026.

## Open
- Notices, news and the "Pool closed Bank Holiday Monday 6th May" style dates are all 2013 and need real current content.
- The join form never sent data anywhere (it did not before either). It needs a form service or the club's email before it is useful.
