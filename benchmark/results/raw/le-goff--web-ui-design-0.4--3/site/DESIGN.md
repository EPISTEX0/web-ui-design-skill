---
name: Parc Le Goff
mode: persuade
page-type: Local business or service (with a cart from Store listing)
family: Editorial, tuned to the brand colors
stack: plain HTML, CSS and JS in index.html, no build, no web fonts
colors:
  bg: "#f4efe6"        # shell white (brand)
  surface: "#faf7f1"
  text: "#1f2b34"      # deep slate, darkened from brand slate
  text-secondary: "#3e5363"  # slate (brand)
  border: "rgba(62,83,99,.22)"
  accent: "#3e5363"    # slate fills the primary action
  highlight: "#c8a24a" # kelp ochre (brand): rules, cutoff marker, never text on shell white
typography:
  display: "Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
  body: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
  scale: [14, 16, 17, 20, 24, 32, 48, 64]
spacing-base: 4
radius: { sm: 2, md: 4 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 140, menu: 200, overlay: 300 }
---

# Parc Le Goff design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Family oyster farm in Cancale selling boxes online, besides the Saturday market | user |
| Primary action | Choose a box and send an order | user (take the order, make the Monday 18:00 cutoff clear) |
| Audience and device | Home buyers in mainland France, Belgium, Luxembourg; mostly phones | assumed (left to you) |
| Order method | Cart builds an email order request (mailto), with copy-to-clipboard fallback; payment confirmed by reply | assumed (left to you) |
| Shipping | Post, dispatched Wednesday and Thursday; cutoff Monday 18:00 Paris time; EUR 12, free over EUR 80 | user |
| Shop | Port de la Houle, Wed to Sun 10:00 to 13:00, walk-in only, no collection of online orders | user |
| Boxes | 24 creuses No. 3 EUR 32; 48 creuses No. 3 EUR 58; 12 plates EUR 39 (September to April) | user |
| Assets | Slate #3e5363, kelp ochre #c8a24a, shell white #f4efe6. No photos. Logo placeholder | user |
| Content and proof | No reviews, awards or stats; none shown | user gave none |
| Sample values | Order email address, FAQ storage wording, payment-after-reply flow | assumed (left to you) |

## Direction
A printed fishmonger's menu: shell white paper, slate ink, hairline rules, serif headlines. No photos, so oysters are drawn as a small shell mark and each box is shown as a tray with the right number of shells. Signature element: a live week strip that shows Monday 18:00 (order by) and Wednesday and Thursday (we post), with the next real dates computed in Paris time.

## References
- Fishmonger and wine-merchant printed price lists: price rows with hairline rules instead of cards.
- Parcel carriers' "ships by" banners: the cutoff stated as a date and a countdown, not only a rule.

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| Ochre never carries text on shell white | Contrast about 2:1; used for rules and as a fill behind dark text | 2026-10-20 |
| System fonts only | No external requests, nothing to fail to load, fast on mobile | 2026-10-20 |
| mailto order, "ready to send" wording | A static page cannot confirm delivery of an email; the page says the order is not with the farm until sent | 2026-10-20 |
| Plates disabled May to August | User: September to April only; month read in Paris time | 2026-10-20 |
