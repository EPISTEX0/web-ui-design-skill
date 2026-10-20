---
name: MV Gannet loading screen
mode: operate
page-type: Dashboard (list and detail, one-screen app)
family: Dense tool, scaled up for gloves and glare
stack: plain HTML, CSS and JS in one file, localStorage, optional sw.js for offline reload
colors:
  navy: "#12304a"
  yellow: "#f2b705"
  bg: "#e9eef2"
  surface: "#ffffff"
  text: "#0c2236"
  text-secondary: "#34495c"
  border: "#7f95a8"
  danger: "#a8201a"
typography:
  display: "Roboto, system-ui, sans-serif"
  body: "Roboto, system-ui, sans-serif"
  scale: [15, 18, 22, 28, 40, 56]
spacing-base: 4
radius: { sm: 6, md: 10, lg: 14 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  durations: { press: 0 }
---

# MV Gannet loading screen design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Skerra Ferry Company, MV Gannet, Port Ailig to Skerra, 25 min | user |
| Primary action | Find a booking by the last 3 plate characters, give it a lane, mark it loaded; see deck space left | user |
| Audience and device | Loading master and two deckhands, rugged Android tablet, portrait, outdoors, thick gloves, rain, low sun, patchy signal | user |
| Assets | Navy #12304a, lifejacket yellow #f2b705, no logo | user |
| Rules | 4 lanes (5/6/6/5 units); car 1, van or car+trailer 2, lorry or island bus 4 (lanes 2-3 only); lane 1 limit 2.1 m, roof boxes never in lane 1; boarding order priority > booked > standby; no-shows released at T-10 | user |
| Timetable | 07:10 08:30 10:15 12:40 14:30 16:20 18:05; Thursday 10:15 fuel tanker + foot passengers only | user |
| Content | Bookings, plates, names, vehicles are generated sample data | assumed (sample data requested) |

## Direction
A working tool for the slipway, not a dashboard. Everything is large and high contrast. The three-character plate entry is drawn as the end of a yellow number plate, which is where the brand yellow and the subject meet. The keypad is on screen so the OS keyboard never covers the deck. The deck diagram is always visible at the top and shows the exact lane, units and the pending ghost placement.

## References
- Airline gate/boarding apps: boarding groups called in order, with the next group shown first.
- Ro-ro ferry stowage plans: lane-by-lane plan from above, bow at top.
- Payment-terminal keypads: oversized keys, one tap one character.

## Decisions
| Decision | Rationale |
| --- | --- |
| Custom on-screen keypad, 3 slots only | Gloves, no OS keyboard covering deck, no full plates |
| Lookalike folding in search (O/0, I/1, S/5, B/8, Z/2) | Glare and rain misreads |
| Lane buttons carry the reason when disabled | Crew can see why lane 1 is refused |
| Best-fit lane highlighted and previewed on deck | Keeps big gaps in lanes 2-3 for lorries |
| Events log + outbox, state replayed from events | Works offline, catches up, conflicts surface instead of silently overwriting |
| Light default, night theme, auto from system | Glare by day, dark departures at 07:10 and 18:05 |
| Bounded undo toast and Take off deck | Wet screens mis-tap |
| Min 44 px targets, keys 52-72 px, primary 72 px | Thick gloves |
