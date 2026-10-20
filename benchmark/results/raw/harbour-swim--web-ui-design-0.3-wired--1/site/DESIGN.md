---
name: Harbour Swim Club
mode: persuade
page-type: Local business or service (one page)
family: Soft and friendly
stack: Plain HTML, CSS and JS. No build step, no framework, no web fonts. Volunteers edit by hand.
colors:
  bg: "#eef3f8"
  surface: "#ffffff"
  text: "#1b2a4a"
  text-secondary: "#44546f"
  border: "#d6dfe9"
  accent: "#f2c230"
typography:
  display: "system sans stack (Avenir Next, Segoe UI, Roboto), 800 for prices, 700 for headings"
  body: "same stack, 17px / 1.55"
  scale: [15, 17, 20, 28, 36, 40]
spacing-base: 4
radius: { sm: 8, md: 12, lg: 20 }
depth: ring-shadow
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  durations: { press: 140, hover: 150 }
---

# Harbour Swim Club design

All tokens live in `:root` at the top of `style.css`. That file is the source of truth. This file explains it.

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Volunteer-run swim club, Falmouth, about 240 members, toddlers to masters | existing site |
| Primary action | Check the timetable, with joining second | user (2a) |
| Audience and device | Members and parents, mostly on phones | user (members find it hard to use on phones) |
| Assets | Navy `#1b2a4a`, yellow `#f2c230`, logo, 3 SVG illustrations | user (keep) |
| Content | All 27 sessions, 4 prices, join form, 3 news items, 4 notices | user (keep all) |
| Scope | Refresh: same structure and content, new visual style and responsive layout | user (1a) |

## Direction
Friendly and clear, like a good poolside noticeboard. The brand navy carries text and the footer. Yellow marks actions and meaning only: buttons, the "today" dot, the lane-rope under headings. Yellow is never used as text on white (1.6:1 contrast).

Signature element: the **lane rope** under every section heading, a line of yellow floats echoing the lane ropes in the hero. The timetable opens on **today's sessions**.

## Decisions
| Decision | Rationale |
| --- | --- |
| Viewport meta, fluid layout, container max 1080px | The old fixed 980px layout shrank to a tiny desktop page on phones |
| Timetable rows become cards under 760px | A 6-column table cannot fit 390px. Cards need no `data-label` attributes. Labels come from CSS `::before`, so volunteers edit plain `<td>` rows |
| Day filter built by `script.js` from the Day column | Adding a session needs no JS change. With JS off, every row shows |
| Filter state in `?day=` | Shareable link to a day |
| Scrolling ticker replaced by a "Club notices" list in a `<details>` | The ticker could not be read or paused, and it ran off-screen. Content kept word for word |
| Join form: visible labels, `type=email` and `tel`, `autocomplete`, real submit button, inline errors, focus on first error | Replaces `alert()` popups and a clickable `div`. Still front-end only, as before |
| Membership cards link to the form and pre-select the type | One tap from price to joining |
| Body text 17px, targets at least 44px, muted text at least 5:1 | Phone use and older members |
| Dates, copyright and news left as they were | The user will update them |
| System fonts only | No build step, no font files, no layout shift |
| Header Join button is separate from the nav | Primary action stays in view on a phone while the nav scrolls |

## Editing notes
- Add a session: copy a `<tr>` in the timetable. Keep the 6 cells in order: Day, Time, Session, Lane, Level, Coach. Use the full day name, such as "Monday".
- Notices: edit the `<li>` items under "Club notices". Delete the whole `<details>` block when there are none.
- Change a colour: edit the variable in `:root`.
