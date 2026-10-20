---
name: Kestrel Physio front desk
mode: operate
page-type: Dashboard (with list and detail)
family: Dense tool
stack: plain HTML, CSS custom properties, vanilla JS, no build step
colors:
  bg: "oklch(0.972 0.006 235)"
  surface: "#ffffff"
  text: "oklch(0.24 0.025 245)"
  text-secondary: "oklch(0.42 0.025 245)"
  text-tertiary: "oklch(0.5 0.022 245)"
  border: "oklch(0.9 0.01 240)"
  accent: "oklch(0.45 0.09 235)"
  waiting: "oklch(0.5 0.12 58)"
  late: "oklch(0.5 0.17 27)"
typography:
  display: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
  body: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
  scale: [12, 13, 14, 16, 20, 24]
spacing-base: 4
radius: { sm: 4, md: 6, lg: 8 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 120, menu: 180, overlay: 240 }
---

# Kestrel Physio front desk design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Physiotherapy clinic, 5 practitioners, 5 treatment rooms | user |
| Primary action | Check arriving patients in and move them to their practitioner | assumed (left to you) |
| Audience and device | Receptionist on a desktop or tablet all day; phone as fallback | assumed |
| Assets and references | None supplied; name and bird taken as the brand | assumed |
| Content and proof | Realistic sample data, labelled as sample on screen | user |

## Direction
A calm, dense working screen. The signature element is the "perch line": one lane per practitioner across the day with a live now-line, so a glance shows who is free, who is running over and who is waiting. Colours come from the kestrel itself: slate-blue head for the accent, chestnut back for "waiting".

## References
- Cliniko / Jane App: practitioner lanes as the main view of a clinic day.
- Linear: compact rows and quiet status chips.

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| 14px body, 13px table | Dense tool family; staff are expert daily users | 2026-10-20 |
| System font stack | One neutral family, no font loading | 2026-10-20 |
| Light only | Reception desks are lit; keeps scope tight | 2026-10-20 |
| Clock starts at 10:42 and ticks | Sample data stays coherent whenever it is opened | 2026-10-20 |
| Status = icon + label + tint | Colour is never the only signal | 2026-10-20 |
| One filled button: Check in on the next arrival | Single primary action per view | 2026-10-20 |
| Reversible actions apply at once with Undo toast | Rules: confirm only for irreversible | 2026-10-20 |
