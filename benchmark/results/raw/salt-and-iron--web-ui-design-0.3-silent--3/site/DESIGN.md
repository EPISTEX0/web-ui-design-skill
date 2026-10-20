---
name: Salt and Iron – online guide
mode: persuade
page-type: Visitor guide (Local business/service structure, trimmed to what content can fill)
family: Editorial
stack: plain HTML, CSS, JS in one file (index.html), no build
colors:
  salt: "#ECEFEE"
  surface: "#F7F9F8"
  ink: "#171C1F"
  text-secondary: "#465157"
  border: "#C4CCCF"
  iron: "#1E2428"
  accent: "#9A3A18"
  accent-on-iron: "#E58E66"
typography:
  display: "Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
  body: "same stack at body sizes; UI labels use system-ui"
  scale: [14, 16, 18, 22, 32, 48, 88]
spacing-base: 4
radius: { sm: 2, md: 2, lg: 2 }
depth: borders (hairline rules, no shadows)
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  durations: { press: 140, menu: 200, overlay: 300 }
---

# Salt and Iron design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Exhibition "Salt and Iron" at Harwick Maritime Museum | user |
| Primary action | Plan your visit / book tickets | assumed (user left it to me) |
| Audience and device | Visitors, mostly phones, before and during the visit | assumed |
| Assets and references | None supplied: no logo, colors, fonts or images | user supplied none |
| Content and proof | None supplied. Every fact is a "To confirm" placeholder; no stats, quotes or logos | user supplied none |

## Direction
A printed exhibition catalogue on the web. Ground is sea-salt white, ink is wrought-iron black, and the single accent is rust, which is what salt does to iron. The hero is an iron-dark band with a waterline rule. Signature element: the **route**, a vertical line down the page with one stop per gallery that lights up as you scroll, so the page reads like a walk through the show.

## References
- Tate Modern exhibition pages: plain practical info (dates, tickets, access) kept in one clear block.
- Printed museum catalogues: hairline rules and large serif titles in place of cards.

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| No web fonts, serif system stack | No network dependency, fast, nothing to fail to load | 2026-10-20 |
| Placeholders marked `.tbc` (dashed underline + "to confirm") | The brief had no facts; inventing dates or prices would mislead visitors | 2026-10-20 |
| Gallery names "Salt", "Iron", "Where they meet" are working titles | Derived from the exhibition title only; flagged to confirm | 2026-10-20 |
| Config object at top of script (booking URL, hours) | Museum fills one place; "open now" and the Book button switch on automatically | 2026-10-20 |
| No FAQ, objects or gallery images sections | No content to fill them honestly | 2026-10-20 |
