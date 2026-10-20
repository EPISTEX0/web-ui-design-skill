---
name: Tandem
mode: persuade
page-type: Local business or service
family: warm Dutch workshop
stack: plain HTML, CSS, JS, no build
colors:
  bg: "#f7f8f4"
  surface: "#ffffff"
  text: "#14231b"
  text-secondary: "#3f5247"
  border: "#d3ddd5"
  accent: "#ff6b35"
  brand: "#1f4d3a"
typography:
  display: "Avenir Next, Segoe UI, Trebuchet MS, system-ui, sans-serif"
  body: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
spacing-base: 4
radius: { sm: 8, md: 16, lg: 24 }
depth: ring-shadow
---

# Tandem design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Cargo bike shop, Oudegracht 112, Utrecht | user |
| Primary action | Book a free 30-minute test ride | user |
| Audience | Young parents in Utrecht, on phones | user |
| Assets | Wordmark, green #1f4d3a, orange #ff6b35 | user |
| Content and proof | 3 bikes with prices, lease from €89/month, 4.8 on Google (310 reviews). No quotes. | user |
| Placeholders | Phone, email (hello@tandem.example), bike photos | assumed |

## Direction
Warm and trustworthy, not techy. Brand green carries the hero and footer. Orange is only for the primary action and the word "free". Signature: an interactive cargo box where visitors load two kids, groceries and school bags.

## Decisions
| Decision | Rationale |
| --- | --- |
| Orange buttons use dark green text (#10291d) | Orange with the brand green only reaches about 3.4:1; dark green gives about 4.9:1 |
| System font stacks, no web fonts | No build step, nothing to load, no layout shift |
| Form opens a mailto link | No backend exists; swap for a real endpoint when there is one |
| No invented specs, quotes or policies | User supplied none; bike descriptions are generic |
