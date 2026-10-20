---
name: Kestrel Physio front desk
mode: operate
colors:
  bg: "oklch(0.965 0.005 250)"
  surface: "oklch(0.995 0.002 250)"
  text: "oklch(0.22 0.02 255)"
  text-secondary: "oklch(0.40 0.02 255)"
  border: "oklch(0.90 0.006 250)"
  accent: "oklch(0.50 0.13 45)"
typography:
  display: "system-ui stack"
  body: "system-ui stack"
  scale: [12, 13, 14, 16, 20, 24]
spacing-base: 4
radius: { sm: 4, md: 8, lg: 12 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 120, menu: 180, overlay: 220 }
---

# Kestrel Physio front desk design

## Direction
A receptionist's working screen: scan the day, see who is waiting, check people in. Slate neutrals take the grey head of a kestrel; the one accent is its chestnut back and marks only the primary action and focus. Signature element: the day timeline, one column per practitioner on a 1px-per-minute grid, with a live "now" line that the waiting-room queue and late flags are computed from.

## References
- Calendar day views (Google Calendar, Cliniko): practitioner columns, blocks sized by duration.
- Airline gate boards: waiting list sorted by who has waited longest.

## Components
- Button: min-height 36 (44 on touch), radius md, 14/500. Primary filled chestnut (one per view: New booking); others outlined.
- Appointment block: tinted by status with a 3px left bar, plus a status glyph and word, so colour is never the only signal.
- Panels: surface, 1px border, radius lg.

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| System font stack | Runs offline on a clinic PC with no font load; Operate screen needs speed and legibility | 2026-10-20 |
| Borders only | Dense schedule; shadows add noise | 2026-10-20 |
| Demo clock starts 10:42 and runs live | Sample data stays meaningful whenever the file is opened | 2026-10-20 |
| Status = glyph + word + tint | Colour-blind safe | 2026-10-20 |
