---
name: MV Gannet loading screen
mode: operate
page-type: List and detail (queue + deck plan)
family: Dense tool, scaled up for gloved touch use
stack: plain HTML, CSS, JS in one file, no build, no network (system fonts, localStorage)
colors:
  bg: "#eceff3"
  surface: "#ffffff"
  text: "#121c26"
  text-secondary: "#3d4a57"
  border: "#c5cdd6"
  accent: "#1b4f8f"
typography:
  body: "Segoe UI, system-ui, sans-serif (one family, 17px body, 48px targets)"
spacing-base: 4
radius: { sm: 4, md: 6, lg: 8 }
depth: borders
motion: { ease-out: "cubic-bezier(0.23, 1, 0.32, 1)", durations: { press: 120, menu: 200 } }
---

# MV Gannet design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Car deck loading on the MV Gannet, Skerra Ferry Company | user |
| Primary action | Take the next vehicle in the queue, put it in a lane, mark it on deck | assumed (left to me) |
| Audience and device | Deck crew, rugged tablet landscape, gloves, daylight glare | assumed (left to me) |
| Deck layout | Invented 6 lanes, 172 m, height and weight limits per lane | assumed (left to me) |
| Content | All vehicles, drivers, refs, sailing times are sample data | user asked for sample data |

## Direction
A working tool, not a brochure: light high-contrast surfaces for daylight, one ferry-livery blue accent, amber only for dangerous goods and warnings. Signature element: the deck plan drawn to scale, so lane length, vehicle length, taper of the outer lanes and the stern-to-bow loading order match what the crew sees on the deck.

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| System fonts only, no network | A ferry car deck has patchy signal | 2026-10-20 |
| Lane rules (height, DG centre lanes, length, lane and deck weight) block a load with a stated reason | Replaces what the clipboard could not check | 2026-10-20 |
| Only the last vehicle in a lane can come off | Cars behind it are blocked | 2026-10-20 |
| Every change has Undo; state kept in localStorage | Mis-taps with gloves; refresh must not lose the load | 2026-10-20 |
| Plan runs horizontally (bow right) on tablets, vertically (bow up) on phones | Same flex layout, direction swapped | 2026-10-20 |
