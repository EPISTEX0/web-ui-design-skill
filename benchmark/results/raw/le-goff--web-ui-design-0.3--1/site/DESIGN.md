---
name: Parc Le Goff
mode: persuade
page-type: Local business or service (with an order form)
family: Editorial, tailored (hairline rules, no cards, market-price-board order sheet)
stack: Plain HTML, CSS and JS in one index.html, no build step, no external requests
colors:
  bg: "#f4efe6"          # shell white (brand)
  surface: "#fbf8f2"     # raised paper, inputs
  surface-sunken: "#ebe4d6"
  text: "#1f2b33"
  text-secondary: "#44525d"
  text-tertiary: "#5b6872"
  border: "rgba(62,83,99,.22)"
  border-control: "#738390"
  slate: "#3e5363"       # brand
  slate-deep: "#2a3a46"
  accent: "#c8a24a"      # kelp ochre (brand)
  accent-text: "#7a5c14" # ochre dark enough for text on shell
  error: "#a3361f"
typography:
  display: "Charter, 'Iowan Old Style', 'Palatino Linotype', Georgia, serif"
  body: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
  scale: [14, 16, 17, 20, 24, 32, 44, 60]
spacing-base: 4
radius: { sm: 2, md: 4, lg: 8 }
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
| Subject | Third-generation oyster farm, Cancale (Brittany), selling oyster boxes online | user |
| Primary action | Pick a box and send the order by email; the farm confirms and sends a payment link by hand | user |
| Audience and device | Home customers in mainland France, Belgium, Luxembourg; mostly phones | inferred from delivery area |
| Language | English now, French later | user |
| Assets | Slate #3e5363, ochre #c8a24a, shell white #f4efe6. Logo (grandfather's hand drawing) and photos not available yet: placeholders | user |
| Products | 24 creuses No. 3 EUR 32; 48 creuses No. 3 EUR 58; 12 plates EUR 39 (Sept to April only) | user |
| Delivery | Mainland France, Belgium, Luxembourg; no pickup for online orders; EUR 12, free over EUR 80; ships Wed and Thu; orders close Monday 18:00 for that week; keeps 7 days in the fridge, flat side up | user |
| Visit | Farm shop, Port de la Houle, Cancale, Wed to Sun 10:00 to 13:00; also the Saturday market | user |
| Proof | Third generation on the same beds since 1961; supplies Le Bistrot du Port and two other restaurants in Saint-Malo. No reviews exist, none shown | user |
| Order email and phone | Not available: placeholder constant `ORDER_EMAIL` in the script | user |

## Direction
A working farm on the tide line, not a boutique. Shell-white ground, slate ink and surfaces from the shell/slate of the beds, kelp ochre for the one action colour. Hairline rules and a price-board order sheet instead of product cards. Signature element: the "tide line" of the order week, computed from today's date in Paris time (Monday 18:00 cutoff, Wednesday and Thursday shipping, 7 days in the fridge).

## References
- Fishmonger chalk price boards: name, short line, price on the right, as the order sheet.
- Tide tables: the order-week line with dated marks.
- Printed market-stall leaflets: serif headings in a system serif, no web font.

## Components
- Button primary: min-height 48, ochre fill, ink text (slate on ochre only reaches ~3:1), radius md, 17/600
- Button secondary: transparent, 1px slate border
- Stepper: 44px buttons, number input 16px+
- Placeholder (.ph): sunken tone, dashed outline, caption saying what will go there

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| System fonts, no external requests | Fast on phones, nothing to break; Charter-class serif suits the print feel | 2026-10-20 |
| Ochre never used as text on shell white | Contrast ~2.3:1; `accent-text` darker value for text | 2026-10-20 |
| Order by `mailto:` plus "copy order text" | No server; owner confirms and sends payment link by hand | 2026-10-20 |
| Season check uses the ship date, not today | A late-April order could ship in May | 2026-10-20 |
| Mainland France only: reject postcodes 20xxx, 97xxx, 98xxx | User delivers to mainland France only | 2026-10-20 |
| Free delivery when subtotal is strictly over EUR 80 | Literal reading of "free over 80"; no box combination hits exactly 80 | 2026-10-20 |
| Copy kept in one place per area (static HTML plus `T` object for script text) | French version later | 2026-10-20 |
