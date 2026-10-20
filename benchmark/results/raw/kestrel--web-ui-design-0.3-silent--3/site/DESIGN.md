---
name: Kestrel Physio front desk
mode: operate
page-type: dashboard + list and detail
family: Dense tool, softened for touch (17px body, 44px targets)
stack: plain HTML, CSS, JS; tokens are CSS variables in index.html
colors: { bg: slate-50, surface: "#fff", text: slate-900, text-secondary: slate-600, border: slate-200, accent: blue-600 (oklch 0.46 0.11 250), late: chestnut-600, done: moss-600 }
typography: { body: "system UI stack", scale: [13, 14, 16, 17, 20, 24, 32] }
spacing-base: 4
radius: { sm: 4, md: 6, lg: 10 }
depth: borders
---
# Brief
| Item | Value | Source |
| --- | --- | --- |
| Primary action | Check in the next patient | assumed |
| Audience | Receptionists, desktop or tablet at the desk | assumed |
| Content | Invented sample patients, £ currency, demo clock fixed at 10:42 | assumed |

# Direction
Slate blue from a kestrel's head for actions, chestnut from its back for late and unpaid. Signature: a lane-per-practitioner day view with a live "now" line. Timeline hides under 640px; the arrivals list carries the same information.
