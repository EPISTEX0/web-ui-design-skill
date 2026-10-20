---
name: Kestrel Physio front desk
mode: operate
colors:
  bg: "oklch(0.965 0.005 250)"
  surface: "#ffffff"
  text: "oklch(0.24 0.02 250)"
  text-secondary: "oklch(0.42 0.02 250)"
  border: "oklch(0.9 0.006 250)"
  accent: "oklch(0.46 0.09 235)"
typography:
  display: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
  body: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
  scale: [12, 13, 14, 16, 20, 24]
spacing-base: 4
radius: { sm: 4, md: 8, lg: 12 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 120, menu: 180, overlay: 240 }
---

# Kestrel Physio front desk design

## Direction
Reception staff run this screen all day, one-handed, between phone calls. It is quiet and dense: cool slate neutrals (the grey of a kestrel's head) and a single deep blue-teal accent for the one primary action. Status colour is reserved for patient state. Signature element: a therapist-by-time timeline with a live "now" line, so the desk sees at a glance who is free, running late, or about to collide.

## References
- Google Calendar day view: time-positioned blocks and the now line.
- Linear: dense rows, quiet chrome, keyboard-first (`/` to search).
- Airport arrivals boards: the waiting list ordered by who has waited longest.

## Components
- Button: height 36 (44 on coarse pointers), radius md, 14/500. One filled primary per view ("New booking").
- Appointment block: radius sm, 1px border, status tint plus a text label and symbol (never colour alone).
- Rail rows: separated by borders, no nested cards.

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| Borders only, no shadows (dialog excepted) | Dense operational screen; shadows add noise | 2026-10-20 |
| System font stack | Operate screen on reception PCs; nothing to load, no fallback flash | 2026-10-20 |
| 14px UI text instead of 16px | Deliberate exception for density; inputs stay 16px for iOS | 2026-10-20 |
| Simulated clock starting 10:20 | Sample data must always show a meaningful now line | 2026-10-20 |
| Queue above timeline on mobile | The desk's urgent job is checking people in | 2026-10-20 |
| Frequent actions are instant | Check-in is repeated hundreds of times a day | 2026-10-20 |
