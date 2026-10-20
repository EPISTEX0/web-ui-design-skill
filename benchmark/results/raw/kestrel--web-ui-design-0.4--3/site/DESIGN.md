---
name: Kestrel Physio front desk
mode: operate
page-type: List and detail (queue plus schedule)
family: Soft and friendly, scaled up for a 10-inch landscape touch tablet
stack: plain HTML, CSS and JS in index.html, no build
colors:
  bg: "oklch(0.972 0.008 200)"
  surface: "#fff"
  text: "oklch(0.25 0.02 230)"
  text-secondary: "oklch(0.4 0.02 230)"
  border: "oklch(0.88 0.012 215)"
  accent: "#2a7f7a"
typography:
  display: "Avenir Next, Segoe UI, Noto Sans, system-ui, sans-serif"
  body: "same single stack"
  scale: [19, 22, 26, 28, 30, 38]
spacing-base: 4
radius: { md: 14, lg: 20, pill: 999 }
depth: ring-shadow
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  durations: { press: 140, overlay: 220 }
---

# Kestrel Physio front desk design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Physiotherapy clinic, 4 physios | user |
| Primary action | Check people in with one tap; see who has waited longest; add a walk-in; mark late or no-show | user |
| Audience and device | Two receptionists in their 50s and 60s, 10-inch touch tablet, landscape | user |
| Feel | Calm and light, light mode only | user |
| Assets | Teal #2a7f7a; no logo or font | user; wordmark and bird mark are my choice |
| Content | Patients, physios, times, rooms are sample data | assumed, to be replaced |

## Direction
Calm, soft and large. Body text is 22px, minimum text 19px and every button 64px tall, bigger than the catalog's 17-18px/44px because the user asked for big over fitting more on screen. Teal marks actions and "arrived" only. Amber marks long waits, and every status also carries an icon and words. The signature element is the waiting queue: sorted longest wait first, with a big minute count and a bar, turning amber at 15 minutes.

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| Arrived, in-session and finished rows are collapsed in the schedule | They already show in the waiting panel; keeps Check in buttons at the top | 2026-10-20 |
| "Not here" opens a sheet with late (10/20/30 min) and no-show | Keeps the row to two big buttons | 2026-10-20 |
| Every change shows a 9s Undo toast | Reversible, no confirm dialogs | 2026-10-20 |
| Desk clock starts at 10:20 then runs live | Makes the sample data coherent; replace with the real clock when wired to data | 2026-10-20 |
| System font stack, no web fonts | No network dependency at the desk | 2026-10-20 |
