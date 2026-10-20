---
name: Kestrel Physio front desk
mode: operate
page-type: Dashboard (queue plus schedule)
family: Dense tool, softened for touch (16px body, 44px targets)
stack: plain HTML, CSS and JS in index.html, no build, system font stack
colors:
  bg: "oklch(97.4% 0.005 235)"
  surface: "oklch(100% 0 0)"
  text: "oklch(24% 0.025 245)"
  text-secondary: "oklch(40% 0.025 245)"
  border: "oklch(90% 0.008 235)"
  accent: "oklch(45% 0.09 215)"
typography:
  display: "system-ui, Segoe UI, Roboto, Arial"
  body: "system-ui, Segoe UI, Roboto, Arial"
  scale: [12, 14, 16, 20, 24, 28]
spacing-base: 4
radius: { sm: 4, md: 8, lg: 12 }
depth: ring-shadow
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  durations: { press: 120, menu: 160, overlay: 260 }
---

# Kestrel Physio front desk design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Physiotherapy clinic, 4 therapists, rooms 1 to 3 and a gym | user |
| Primary action | Check patients in and send them through | assumed (left to you) |
| Audience and device | Reception staff on a desktop or tablet, all day | assumed |
| Assets and references | None supplied; name and palette invented | assumed |
| Content and proof | Sample patients, labelled "Sample data" | user asked for realistic sample data |

## Direction
Calm and legible from a metre away. The accent is a slate-teal taken from a kestrel's head. Status colours (amber waiting, red late, green in session) always come with an icon and a word. Signature element: the live now-line across every therapist's column, with free gaps of 30 minutes or more marked for walk-ins.

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| Sample clock starts at 10:12 and then runs in real time | Keeps the screen populated whenever it is opened | 2026-10-20 |
| Check in is a tonal button, filled only in the patient drawer | One filled primary action per view | 2026-10-20 |
| Every change applies at once with an Undo toast | Reversible actions; no confirm dialogs | 2026-10-20 |
| System font stack | No build step and no network dependency | 2026-10-20 |
| Therapist filter lives in the URL (`?t=maya`) | Shareable and survives reload | 2026-10-20 |
