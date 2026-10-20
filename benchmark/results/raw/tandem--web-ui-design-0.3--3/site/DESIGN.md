---
name: Tandem
mode: persuade
page-type: Local business or service
family: Soft and friendly
stack: plain HTML, CSS custom properties, vanilla JS (no build)
colors:
  bg: "#f3f7f4"
  surface: "#ffffff"
  text: "#12261d"
  text-secondary: "#3b5246"
  border: "#d3e1d8"
  brand: "#1f4d3a"
  accent: "#ff6b35"
typography:
  display: "Nunito, ui-rounded, system-ui, sans-serif"
  body: "Nunito, ui-rounded, system-ui, sans-serif"
  scale: [14, 15, 17, 19, 22, 30, 44, 72]
spacing-base: 4
radius: { sm: 8, md: 16, lg: 24, pill: 999 }
depth: ring-shadow
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 140, menu: 200, overlay: 300 }
---

# Tandem design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Cargo bike shop, Oudegracht 112, Utrecht | user |
| Primary action | Book a free 30-minute test ride | user |
| Audience and device | Families deciding on a first cargo bike; phone first | assumed |
| Assets | Deep green #1f4d3a, signal orange #ff6b35; wordmark exists but was not supplied | user |
| Content and proof | Tue-Sat 9-18; Classic €2,890, Longtail €3,450, e-Bakfiets €4,990; lease from €89/month; 4.8 stars from 310 Google reviews. No quotes, no photos | user |
| Feel | Warm, family, trustworthy, not techy | user |

## Direction
Soft and friendly, built on the two brand colours. Green carries structure and trust; orange is only the action. The signature element is the box packer: toggle two kids, a week of groceries and school bags into a bakfiets box, which answers the question every parent asks.

## Decisions
| Decision | Rationale |
| --- | --- |
| Dark green text (#12261d) on orange buttons | White on #ff6b35 is about 2.8:1; dark ink gives about 5.4:1 |
| Orange never used for text on light grounds | Fails contrast |
| Ground is a green-tinted off-white, not cream | Ties to brand green |
| Text wordmark in header | Real wordmark not supplied; swap the `.logo` content |
| Packer shows no capacity numbers | Real litres/kg not supplied; caption says illustrative |
| No testimonials section | No real quotes; only the Google rating the user gave |
| Booking form posts to `BOOKING_ENDPOINT` (empty) | No backend or email supplied; it says plainly nothing was sent |
| Phone/email omitted | Not supplied |
