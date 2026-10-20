# Harbour Swim Club: design notes

Plain HTML, CSS and JS. No build step, no framework, no web fonts. Volunteers edit by hand.

## Brief
- Case: Improve, scope Refresh (kept content, sections, navy and yellow, logo; replaced layout and style).
- Primary action: check session times and prices, often poolside on a phone. Timetable comes first.
- Feel: clean and sporty, still recognisably the club. System font stack.
- Source: all of this came from the club's answers; the 2013 content was left as it was (assumed, see below).

## Tokens (top of style.css)
- Navy `#1b2a4a`, yellow `#f2c230`, water blue `#16678f` (links, focus), pale yellow `#fff6d6` (notices).
- Text levels on one navy-grey hue: `--text`, `--text-2`, `--text-3`. All pass 4.5:1 on white.
- 4px spacing scale, radius 12px (cards) and 8px (controls), body 17px, line-height 1.55.
- Depth: tone and 1px borders only. No shadows.

## Decisions
- Yellow is never text on white (1.6:1). It is a fill, a card top bar, or text on navy.
- Timetable is still a real `<table>`; each row is edited in index.html as before. Below 760px CSS turns rows into cards
  ("Lane", "Coach" labels come from CSS, so no extra attributes per cell).
- Day filter chips are built by script.js from the first cell of each row. They start on today and are kept in `?day=`.
  Without JS the whole table shows.
- The scrolling ticker became a static "Club notices" list (same four notices). It was unreadable on phones and moved constantly.
- Menu is a button on phones; without JS the links just show.
- Join form: real labels, email/tel types, errors beside each field, focus goes to the first error. It still does not send
  anything anywhere (as before): it only shows the thank-you message. A real submit target must be added by the club.
- Welcome text moved below Join (timetable and prices first).

## Open
- News, notices and footer still say 2013 (left untouched; club to update).
