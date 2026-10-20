---
name: Parc Le Goff
mode: persuade
page-type: product / order page
family: coastal, artisanal
stack: plain HTML, CSS, JS in index.html (no build)
colors: { bg: "#EEF2F0", surface: "#FFFFFF", text: "#10303A", text-secondary: "#3F5A63", border: "#C5D2CE", accent: "#0B5563", lemon: "#F2C94C", deep: "#10303A" }
typography: { display: "Avenir Next / Segoe UI / system sans, 700", body: "system-ui, 17px/1.55" }
spacing-base: 4
radius: { sm: 6, md: 12, lg: 20 }
depth: ring-shadow
---

# Parc Le Goff design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Family oyster farm, Cancale | user |
| Primary action | Order a box online | user |
| Audience | Locals and visitors, mostly on phones | assumed (user left it to me) |
| Ordering | Request by email, pay on collection | assumed |
| Delivery | Market, farm, delivery to 3 nearby postcodes | assumed |
| Content | Sample boxes, prices, hours, email, phone, calibre weights | assumed, to be replaced |
| Proof | None used (no reviews or stats invented) | n/a |

## Direction
Cool shell-white and bay-teal with a lemon accent, the colour of what sits on the plate. Signature: the calibre picker, where oyster size is drawn to scale and drives the prices.

## Decisions
| Decision | Rationale |
| --- | --- |
| No payment backend | Plain HTML only; the page builds an email request the family confirms |
| System fonts | No font loading, no network dependency |
| Dates generated per mode | Customers can only choose valid days |
