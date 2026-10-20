---
name: Salt and Iron visitor guide
mode: read
colors:
  bg: "oklch(0.975 0.004 220)"   # salt
  surface: "#fff"
  text: "oklch(0.24 0.03 255)"   # tarred iron
  text-secondary: "oklch(0.38 0.025 250)"
  border: "oklch(0.90 0.01 225)"
  accent: "oklch(0.47 0.14 40)"  # rust, actions and the selected gallery only
typography:
  display: "ui-serif, Georgia, serif"
  body: "system-ui, sans-serif"
  scale: [15, 16, 18, 20, 28, 40, 112]
spacing-base: 4
radius: { sm: 4, md: 8, lg: 12 }
depth: ring-shadow
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 140, hover: 200, overlay: 300 }
---

# Salt and Iron design

Visitors read this on a phone in the galleries. Cool salt-white ground, tarred-iron text, rust as the single accent. Signature element: the tappable floor plan that filters the object list, and the salt-crust-over-rust waterline under the hero.

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| System fonts only | Single file, no network dependency, works on poor gallery wifi | 2026-10-20 |
| Content in a `STOPS` array | Staff can replace sample objects without touching markup | 2026-10-20 |
| Ticks stored in localStorage | No accounts; stays on the device | 2026-10-20 |
| All hours, prices, objects are placeholders | No real exhibition facts were supplied | 2026-10-20 |
