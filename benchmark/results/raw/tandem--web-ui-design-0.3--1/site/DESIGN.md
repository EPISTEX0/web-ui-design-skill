---
name: Tandem
mode: persuade
page-type: Local business or service
family: Soft and friendly
stack: plain HTML, CSS, JS in index.html, no build
colors:
  bg: "#eef5f0"
  surface: "#ffffff"
  text: "#10261d"
  text-secondary: "#3a5448"
  border: "rgba(16,38,29,.14)"
  brand: "#1f4d3a"
  accent: "#ff6b35"
typography:
  display: "ui-rounded, SF Pro Rounded, Segoe UI, system-ui, sans-serif"
  body: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
  scale: [14, 16, 17, 20, 24, 28, 44, 68]
spacing-base: 4
radius: { sm: 12, md: 16, lg: 24, pill: 999 }
depth: ring-shadow
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 140, menu: 200, overlay: 420 }
---

# Tandem design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Cargo bike shop, Oudegracht 112, Utrecht | user |
| Primary action | Book a free 30-minute test ride | user |
| Audience and device | Families, mostly phones | assumed |
| Assets | Green #1f4d3a, orange #ff6b35, text wordmark | user |
| Content and proof | 3 models and prices, lease from €89/month, hours, 4.8 stars / 310 Google reviews. No quotes | user |
| Language | English | assumed (left to us) |
| Phone, email | Placeholders (+31 30 000 0000, hello@example.com) | user had none |

## Direction
Warm and trustworthy, not techy. Brand green grounds the page and tints the neutrals. Orange marks actions only. The signature element is the loadable bakfiets: tick "two kids" and "a week of groceries" and they appear in the box.

## Decisions
| Decision | Rationale |
| --- | --- |
| Dark green text on orange buttons | White on #ff6b35 is about 2.8:1. Dark green passes 4.5:1 |
| System font stacks, no web fonts | No font files to load and no layout shift. Swap in a rounded face later if wanted |
| Models as rows, not a card grid | Prices line up for comparison and it avoids an identical-card grid |
| Form opens a mailto: link | The page has no backend. Replace SHOP_EMAIL in the script, or POST to a form service |
| Photos are labelled placeholders | No real photography yet |
