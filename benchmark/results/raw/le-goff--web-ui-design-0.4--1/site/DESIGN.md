---
name: Parc Le Goff
mode: persuade
page-type: Local business with a store flow (offer, basket, order request)
family: Editorial
stack: Plain HTML, CSS and JS in index.html; self-hosted fonts in fonts/
colors:
  bg: "#f4efe6"      # shell white (brand)
  surface: "#faf7f1"
  text: "#1f2a32"
  text-secondary: "#44535f"
  border: "#d8cfbd"
  accent: "#3e5363"  # slate blue (brand), actions
  ochre: "#c8a24a"   # kelp ochre (brand), rules and numerals only
typography:
  display: "Fraunces, Georgia, serif"
  body: "Instrument Sans, system-ui, sans-serif"
  scale: [14, 16, 17, 20, 24, 36, 60]
spacing-base: 4
radius: { sm: 2, md: 4 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 120, menu: 200, overlay: 280 }
---

# Parc Le Goff design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Family oyster farm, Cancale | user |
| Primary action | Fill a basket and send an order request | user |
| Audience and device | Home customers in France, Belgium, Luxembourg, mostly on phones | assumed |
| Assets | Colors #3e5363, #c8a24a, #f4efe6; logo is a placeholder; no photos | user |
| Content | 3 boxes and prices, delivery rules, farm shop hours | user |
| Proof | None shown; none supplied | user |

## Direction
Editorial: serif headlines, hairline rules instead of cards, the brand's shell white as the ground. Slate is the action color and the band color; ochre is only a rule, a numeral and a highlight, because it fails contrast as text on shell.
Signature element: the "Next shipment" card, a week strip computed from today's date in Paris time (order cutoff Monday 18:00, delivery Wednesday and Thursday, shop and market days).

## Rules encoded in JS (CONFIG at the top of the script)
Cutoff Monday 18:00; delivery EUR 12, free over EUR 80; plates sold September to April; Corsica rejected; postcodes checked per country. Orders go out by `mailto:` (no backend).

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| mailto order request, honest "send the email" step | No backend or payment provider; owners confirm each order | 2026-10-20 |
| Fonts self-hosted | No third-party request (GDPR), works from file:// | 2026-10-20 |
| English copy | Brief was written in English; French version not yet made | 2026-10-20 |
