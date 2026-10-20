---
name: MV Gannet loading screen
mode: operate
page-type: List and detail (dashboard-style status above a queue)
family: Dense tool, scaled up for gloved touch
stack: single index.html, plain CSS and JS, no build, no web fonts
colors:
  navy: "#12304a"
  yellow: "#f2b705"
  text: "#0b1f31"
  surface: "#ffffff"
  night-surface: "#0d2033"
typography:
  body: "system-ui, Roboto, Segoe UI, sans-serif"
  scale: [15, 17, 20, 26, 40]
spacing-base: 4
radius: { sm: 8, md: 12, lg: 16 }
depth: borders (2px). No shadows, they wash out in glare.
motion: instant for repeated actions; 220ms ease-out for sheets; press scale .97
---

# MV Gannet loading design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Skerra Ferry Company, MV Gannet, Port Ailig to Skerra, 25 min | user |
| Primary action | Find a booking by last 3 plate characters, give it a lane, see space left | user |
| Device | Rugged Android tablet, portrait, slipway, rain, gloves, low sun, patchy signal | user |
| Brand | Navy #12304a, lifejacket yellow #f2b705 | user |
| Deck rules | 4 lanes (5/6/6/5 = 22 units); car 1, van or trailer 2, lorry/bus 4 (lane 2 or 3 only); lane 1 max 2.1 m | user |
| Boarding | Priority (resident, doctor, vet), booked, standby in arrival order; no-shows released 10 min before departure | user |
| Timetable | 07:10 08:30 10:15 12:40 14:30 16:20 18:05; Thursday 10:15 is tanker only | user |
| Vehicles, names, plates | Made-up sample data | assumed (user asked for realistic sample data) |
| Night mode | Auto, with a header toggle | user left it to me |

## Direction
Calm and blunt. Navy chrome with a yellow rule, pale high-contrast day ground, deep navy night ground. The signature element is the UK rear plate: yellow with the last 3 characters set in a black block, because those 3 characters are what the crew type. Yellow means "act here" (selected sailing, suggested lane, primary action); it is never the only signal.

## Decisions
| Decision | Rationale |
| --- | --- |
| On-screen A-Z/0-9 keypad, 64px keys, keys that cannot match are dashed | Android keyboard is unusable in gloves; narrowing helps the crew read the next character |
| One tap on a lane loads; Undo toast for 9s | Fastest path for a repeated action; reversible |
| Lane 1 refuses tall vehicles, no override | "Must never" in the brief |
| Standby locked until booked vehicles are loaded or released | Brief rule; surfaced with reason, not hidden |
| System font only | No network needed for type; loads offline |
| Changes saved to localStorage and queued; sync is simulated in `pushToShore` | Must work without signal at Port Ailig |
| Sample clock (08:02) by default | So the 10-minute release can be seen; switch to Real clock in settings |
