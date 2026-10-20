---
name: MV Gannet loading screen
mode: operate
page-type: List and detail (queue + deck plan + checks), with a sticky action dock
family: Dense tool restraint, scaled up for gloved touch use (17px body, 44px+ targets)
stack: Plain HTML, CSS, JS in one file (index.html). No build step. State in localStorage.
colors:
  bg: "#e4e9ec"
  surface: "#ffffff"
  text: "#0d1a23"
  text-secondary: "#364652"
  border: "#c3ccd2"
  accent: "#14436b"
typography:
  display: "system-ui, 'Segoe UI', Roboto, sans-serif"
  body: "system-ui, 'Segoe UI', Roboto, sans-serif"
  scale: [12, 14, 17, 20, 24, 32]
spacing-base: 4
radius: { sm: 4, md: 8, lg: 12 }
depth: tonal layers + borders (shadow only on dialog and toast)
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 120, menu: 200, overlay: 240 }
---

# MV Gannet loading screen

Read DESIGN.md before any UI work.

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Skerra Ferry Company, vehicle deck of the MV Gannet. Replaces the crew's paper loading clipboard | user |
| Primary action | Place the next waiting vehicle in a lane | inferred from "loads cars onto the MV Gannet" |
| Audience and device | Deck crew and loading master, outdoors, gloves, glare, night sailings. Tablet in landscape, phone as fallback | assumed (left to you) |
| Assets and references | No brand assets given. Livery colours not used; palette taken from the vessel's world | assumed |
| Content and proof | Sample sailing, 26 vehicles, plates and companies invented. Labelled as sample in the UI | user asked for realistic sample data |
| Loading rules | Single stern ramp, 4 lanes, headroom/DG/weight limits, last stop loads last. Invented but plausible | assumed |

## Direction
A working tool, not a brochure. The deck plan is drawn to scale (bow at top, port left, stern ramp at the bottom, outer lanes taper with the hull), so crew see what the clipboard could not: space left per lane, who blocks whom, and trim. Vehicles are coded by the stop they leave at (letter + colour), so colour is never the only signal.

Signature element: the to-scale deck plan with registration-plate chips (yellow UK rear plate) and hatched hull voids.

## References
- Paper stowage plans (ro-ro general arrangement): lanes as columns, bow up, to scale.
- UK rear number plate: yellow chip with a blue edge, the thing crew actually read across a quay.
- Linear's list rows: one selected row, everything else quiet.

## Colour roles and sources
| Token | Role | Source in the subject's world |
| --- | --- | --- |
| accent `#14436b` / `#8cc4f2` night | Primary action, selection, focus | Hull navy |
| deck / track greys | Deck plan ground | Painted steel deck |
| plate yellow `#f6c90e` | Registration plates only | UK rear plate |
| stop R `#b3430f`, C `#0b6e72`, H `#7b3f98` | Which stop a vehicle leaves at | Luggage-tag style destination coding, always with a letter |
| ok / warn / danger | Status, always with an icon | Standard |

## Components
- Button: min-height 44, radius md, 17/600. Primary is filled navy; only the suggested lane in the dock is filled.
- Queue row: full-width button, 64px+, selected = 2px accent border + tint.
- Vehicle block on deck: length is proportional to metres (plus 0.5 m gap).

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| Deck plan vertical at all widths | One layout to maintain, matches how stowage plans are drawn, lane buttons in the dock keep the same left-to-right order | 2026-10-20 |
| Hard blocks: height, dangerous goods lane, room, lane weight. Soft warnings: blocking an earlier stop, trim, standby ahead of booked | Physical impossibilities cannot be overridden; sequencing issues are the loading master's call | 2026-10-20 |
| Only the vehicle nearest the ramp can come off | You cannot pull a car out of the middle of a lane | 2026-10-20 |
| Undo instead of confirm for placing and taking off | Reversible, repeated 30+ times per sailing | 2026-10-20 |
| Confirm only for sign-off and reset | Sign-off is the one record the bridge relies on; reset discards work | 2026-10-20 |
| Night mode toggle, defaults to OS setting | Night crossings; glare in daytime | 2026-10-20 |
| Instant state changes, one 0.7s opacity ring on the placed vehicle | High-frequency action; the ring only bridges the jump from queue to deck | 2026-10-20 |
| Queue sorted in loading order (furthest stop first, standby last) | With one stern ramp the last vehicle on is the first off, so the list itself tells crew what to load next | 2026-10-20 |
| Mid lanes 2.8 m headroom, outer lanes 4.2 m and the only ones for dangerous goods | Invented but plausible mezzanine layout; keeps tall vehicles and DG on the open outer lanes | 2026-10-20 |
