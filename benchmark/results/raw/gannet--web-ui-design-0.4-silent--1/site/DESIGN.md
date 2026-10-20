---
name: MV Gannet loading screen
mode: operate
page-type: Dashboard with a working plan view (queue, deck, selected vehicle)
family: Dense tool, sized up for gloves and glare (17px body, 48px+ targets)
stack: Plain HTML, CSS and JS in index.html. No build step. State in localStorage.
colors:
  bg: "#e6ebf0"
  surface: "#ffffff"
  text: "#0b1f33"
  text-secondary: "#2d4156"
  border: "#c3cdd8"
  accent: "#b7410e"
typography:
  display: "system-ui stack"
  body: "system-ui stack"
  scale: [12, 13, 15, 17, 20, 24, 28]
spacing-base: 4
radius: { sm: 4, md: 6, lg: 10 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  durations: { press: 120, gauge: 240, toast: 200 }
---

# MV Gannet design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Car-deck loading for the MV Gannet, Skerra Ferry Company | user |
| Primary action | Place the next vehicle in a lane | assumed (user left it to me) |
| Audience and device | Deck crew, outdoors, tablet or phone, often gloved | assumed |
| Assets | None supplied. Navy ink and rust-orange accent are mine | assumed |
| Content | Route (Skerra to Port Calder), ship layout (4 lanes x 22 positions, 28 t per lane, 190 people), vehicles, names, weights: all invented sample data | assumed, user asked for realistic samples |

## Direction
An operations board that can be read at arm's length in glare. The signature element is the hull-shaped deck plan: vehicles stack from the bow in four lanes, dashed ghosts show where the selected vehicle would land in each lane, and the side-balance and fore/aft gauges move as vehicles are placed. Day view is high contrast; Night view is low glare.

## Decisions
| Decision | Rationale |
| --- | --- |
| Placement is "append to a lane", not free dragging | Matches how vehicles are actually driven on; works with a single tap and gloves |
| Only the last vehicle in a lane can come off | Mirrors the physical deck |
| Hard blocks: no room, over 28 t lane limit, dangerous goods in inner lanes. Soft warnings: access vehicles in inner lanes, heavy vehicles in outer lanes | Safety rules block; preferences warn |
| "Best fit" lane is the one that leaves side balance most level, shown as the one filled button | One primary action per view |
| Fore/aft gauge reads "Still filling" until 70% of the deck is used | A part-loaded deck is always bow-heavy; alerting would be noise |
| Every placement shows an Undo toast | Reversible changes apply at once |
| System font stack | Nothing to load on a quay with poor signal |
| Status uses colour plus a symbol and a word | Colour alone fails in glare |

## Invented values to replace
Departure time (set to about 47 min after first load), route name, lane count and size, lane weight limit, people limit, the 10-minute loading cut-off, the 10 t "heavy" threshold, all 32 bookings.
