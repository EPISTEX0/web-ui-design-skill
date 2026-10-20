---
name: Tandem
mode: persuade
colors:
  bg: "oklch(96% 0.008 150)"        # pale canal-mist grey-green
  surface: "oklch(99% 0.004 150)"
  text: "oklch(22% 0.03 190)"       # deep canal green-black
  text-secondary: "oklch(40% 0.03 190)"
  border: "oklch(86% 0.012 170)"
  accent: "oklch(52% 0.17 38)"      # fietspad red, used on actions only
  ink-panel: "oklch(24% 0.04 195)"
typography:
  display: "Bricolage Grotesque, 'Arial Narrow', system-ui, sans-serif"
  body: "Instrument Sans, system-ui, -apple-system, 'Segoe UI', sans-serif"
  scale: [14, 16, 18, 22, 32, 48, 72]
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
Cargo bike shop in Utrecht. Audience: locals deciding whether a cargo bike can replace a car for kids, shopping or work. Feeling: practical, local, unfussy. Signature element: the "What do you carry?" picker in the hero, which recommends a bike type, instead of a stock photo (none supplied).

## References
- Dutch fietspad signage and red asphalt: the single accent colour.
- Utrecht canal-side wharf cellars: deep green-black panel against misty ground.

## Decisions
| Decision | Rationale |
| --- | --- |
| Borders only, no shadows | Flat like road markings; one depth strategy |
| No prices, hours, address, stats, testimonials | None supplied; never invented. Add to the Visit section when known |
| Fonts via Google Fonts with system fallbacks | No build step; page must read fine if fonts fail |
| Bike types are generic categories, not a product catalogue | Stock/models unknown |
