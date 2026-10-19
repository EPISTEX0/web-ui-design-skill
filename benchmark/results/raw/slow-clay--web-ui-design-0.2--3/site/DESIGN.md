---
name: Slow Clay
mode: persuade
colors:
  bg: "oklch(95.5% 0.008 200)"        # porcelain, a cool unglazed white
  surface: "oklch(98.5% 0.004 200)"
  text: "oklch(24% 0.02 50)"          # iron-brown black
  text-secondary: "oklch(42% 0.02 50)"
  border: "oklch(86% 0.01 200)"
  accent: "oklch(45% 0.17 262)"       # cobalt oxide
  stoneware: "oklch(23% 0.02 50)"     # dark section ground
typography:
  display: "Bricolage Grotesque, Avenir Next, system-ui, sans-serif"
  body: "Instrument Sans, system-ui, sans-serif"
  scale: [14, 16, 18, 22, 28, 40, 64]
spacing-base: 4
radius: { sm: 4, md: 8, lg: 16 }
depth: tonal
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 140, hover: 200, pull: 900 }
---

# Slow Clay design

## Direction
Small Portland pottery studio; audience is adults who want a hands-on, unhurried
craft. Porcelain ground, iron-brown ink, one cobalt accent (blue-and-white ware,
not SaaS blue). Signature element: a pot you shape yourself in the hero with two
sliders. It "pulls up" once on load, the page's single orchestrated motion.

## Decisions
| Decision | Rationale |
| --- | --- |
| Cool porcelain ground instead of cream | Avoids the cream/terracotta pottery cliche; cobalt reads as glaze |
| Tonal depth, no shadows | Clay is matte; section tone changes carry structure |
| Membership on dark stoneware block | Distinguishes the two offers without identical cards |
| Week list is a true sequence, so it is numbered | Numbers only where order matters |
| Form opens a mailto | No backend; CONTACT_EMAIL const in index.html must be set by the owner |
