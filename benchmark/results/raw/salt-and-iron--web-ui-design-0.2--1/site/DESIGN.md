---
name: Salt and Iron online guide
mode: read
colors:
  bg: "#EEF1F0"
  surface: "#F8FAF9"
  text: "#1B2428"
  text-secondary: "#46555B"
  border: "#C9D1D1"
  accent: "#A8421C"
  sea: "#1F3A44"
typography:
  display: "Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
  body: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
  scale: [14, 16, 18, 24, 32, 56]
spacing-base: 4
radius: { sm: 4, md: 8 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 140, menu: 200, overlay: 300 }
---

# Salt and Iron design

## Direction
A visitor guide for a maritime museum exhibition, read on a phone in the galleries. Salt-white ground, iron-ink text, one rust accent (oxidised iron), a deep sea-slate band for the opening. Signature element: the Plimsoll load-line mark, used in the hero and as the stop marker. System fonts only, so there is no font loading to fail offline in a gallery.

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| Borders only, no shadows | Reads like printed gallery labels; low noise | 2026-10-20 |
| System font stacks | Works with poor museum wifi, no build or hosting of fonts | 2026-10-20 |
| All copy lives in static HTML, JS only filters and saves a route | Page is readable without JS | 2026-10-20 |
| Exhibition facts are sample text | No content was supplied; replace before publishing | 2026-10-20 |
