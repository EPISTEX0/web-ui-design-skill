---
name: Tandem
mode: persuade
colors:
  bg: "oklch(0.97 0.006 200)"
  surface: "#ffffff"
  text: "oklch(0.24 0.04 215)"
  text-secondary: "oklch(0.40 0.03 215)"
  border: "oklch(0.88 0.01 205)"
  accent: "oklch(0.50 0.15 35)"
  canal: "oklch(0.24 0.04 215)"
typography:
  display: "'Avenir Next', 'Segoe UI', system-ui, sans-serif (800)"
  body: "'Avenir Next', 'Segoe UI', system-ui, sans-serif"
  scale: [14, 16, 18, 24, 32, 48, 80]
spacing-base: 4
radius: { sm: 4, md: 8, lg: 16 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 140, menu: 200, overlay: 300 }
---

# Tandem design

## Direction
Cargo bike shop in Utrecht for families and tradespeople deciding what to carry on two or three wheels. Mood: practical, local, a little dry-humoured. Palette comes from the city: canal-water ink, white paint, and the brick red of Dutch bike lanes as the single accent. Signature element: the bike-lane strip (red asphalt, dashed white marking) that runs through the page and carries a bike once on load, plus a "what are you carrying?" finder that recommends a bike type.

## References
- Dutch CROW bike-lane markings: red surface, white dashed edge line.
- Local bike-shop sites: plain opening hours and address up front, test ride as the main action.

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| System font stack, weight 800 for display | No network font dependency, no build step | 2026-10-20 |
| Borders only | Flat like road paint; no glow or shadow | 2026-10-20 |
| Accent only on primary action and lane strip | Keeps red meaning "go" | 2026-10-20 |
| One motion: bike rolls in once | Persuade page gets one orchestrated moment | 2026-10-20 |
| Contact details are placeholders | Real address, hours, email not supplied | 2026-10-20 |
