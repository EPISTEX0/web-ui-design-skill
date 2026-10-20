---
name: Parc Le Goff
mode: persuade
page-type: Store listing (boxes + basket) with local-business sections
family: Editorial
stack: Plain HTML, CSS and JS in index.html; self-hosted fonts in fonts/
colors:
  bg: "#f4efe6"        # shell white (brand)
  surface: "#ebe4d6"
  text: "#1f2b33"
  text-secondary: "#3e5363"   # slate blue (brand)
  border: "rgb(62 83 99 / .28)"
  accent: "#c8a24a"    # kelp ochre (brand)
typography:
  display: "Newsreader, Iowan Old Style, Palatino Linotype, Georgia, serif"
  body: "Hanken Grotesk, Segoe UI, system-ui, sans-serif"
  scale: [14, 15, 17, 19, 26, 36, 56, 72]
spacing-base: 4
radius: { r: 2 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 120, menu: 200, overlay: 300 }
---

# Parc Le Goff design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Family oyster farm, Cancale. Online boxes, farm shop at Port de la Houle, tide-flat visits | user |
| Primary action | Pre-order a box (basket and form) | user |
| Audience and device | Customers in France, Belgium, Luxembourg; mostly phones | assumed |
| Assets | Brand colours slate #3e5363, ochre #c8a24a, shell #f4efe6. Logo pending (placeholder SVG). No photos | user |
| Content | Boxes, prices, delivery rules, shop hours, 2027 visit dates | user |
| Proof | None supplied, so no reviews section | user |
| Language | English only | assumed |
| Pickup | Free collection at the farm shop on a chosen day, Wed to Sun | assumed (user: "your call") |
| Ordering | Pre-order by email (mailto or ENDPOINT), payment arranged after confirmation | user chose "form with basket"; payment flow assumed |

## Direction
A printed fishmonger's menu: serif headlines, hairline rules instead of cards, shell-white paper. Ochre is used as a mark (selected rows, the low-water line, buttons on slate), never as small text, because it fails contrast on shell white. Signature element: tide lines across the hero with one ochre "low water" line, next to a live "this week at the farm" ticket (next shipping days, order cut-off countdown, shop open or closed in Cancale time).

## References
- Fishmongers' and farm-shop printed price lists: ruled rows, price at right.
- Browser-less order forms (Formspree-style): mailto fallback with copyable order text.

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| Brand shell white as ground | User's brand colour; the terracotta accent usually paired with it is avoided | 2026-10-20 |
| Fonts self-hosted in fonts/ | No third-party requests (privacy), works without build step | 2026-10-20 |
| Order week computed in Europe/Paris time | Cut-off is Monday 18:00 in Cancale, whatever the visitor's timezone | 2026-10-20 |
| 12 plates locked outside September to April, by chosen date | Seasonal rule from the user | 2026-10-20 |
| French postcodes 20xxx, 97xxx, 98xxx rejected | Delivery is mainland France only | 2026-10-20 |
| Orders sent by mailto unless ENDPOINT is set | No backend available; the page says plainly the order is only received once the email is sent | 2026-10-20 |
