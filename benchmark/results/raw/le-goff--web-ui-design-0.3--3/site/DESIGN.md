---
name: Parc Le Goff
mode: persuade
page-type: Local business or service (with an order-request form)
family: Editorial
stack: plain HTML, CSS and JS in one file (index.html), no build step, system fonts
colors:
  bg: "#f4efe6"        # shell white (user)
  surface: "#ebe4d6"   # shell, one step darker (tonal layer)
  text: "#1f2b34"      # slate darkened (never pure black)
  text-secondary: "#4a5b68"
  border: "rgba(31,43,52,.18)"
  slate: "#3e5363"     # user: slate blue, used for the dark bands
  accent: "#c8a24a"    # user: kelp ochre, fills for the primary action only
  accent-text: "#7a5f16"  # ochre darkened so it reads as text on shell (5.2:1)
  error: "#9b2c2c"
typography:
  display: "Iowan Old Style, Palatino Linotype, Palatino, Book Antiqua, Georgia, serif"
  body: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
  scale: [14, 17, 20, 28, 44, 76]
spacing-base: 4
radius: { sm: 2, md: 4 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  durations: { press: 140, menu: 200, overlay: 300 }
---

# Parc Le Goff design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Family oyster farm in Cancale, third generation on the same beds since 1961 | user |
| Primary action | Send an order request for an oyster box (email or WhatsApp; the farm confirms and takes payment) | user |
| Audience and device | Customers in mainland France, Belgium, Luxembourg, mostly on phones | user |
| Assets and references | Colors #3e5363, #c8a24a, #f4efe6; no black-and-gold; logo is a hand drawing by the grandfather, to come (placeholder wordmark); no photos yet (labelled slots) | user |
| Content and proof | Boxes, prices, delivery, hours, keeping advice as given. Proof: since 1961, supplies Le Bistrot du Port and two other Saint-Malo restaurants. No reviews, none invented | user |

## Direction
A printed menu from the harbour: serif headlines on shell white, slate blue bands, ochre kept for the one action on each view. Hairline rules instead of cards. The signature element is the weekly boat strip: Monday close, Wednesday and Thursday shipping, today marked, with a live countdown. It is the rule that governs every order, so it sits where the customer decides.

## References
- Oyster-bar printed menus: price lists on rules with no boxes around items.
- Restaurant booking forms: one column, labels above fields, a running total beside it.

## Components
- Button primary: min-height 52, ochre fill, ink text 17/700, radius 2.
- Stepper: 48px targets, native number input at 17px.
- Panels: border 1px, no shadow.

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| Ochre is a fill with dark ink text, never text on shell | #c8a24a on shell is about 2:1 | 2026-10-20 |
| System fonts, no font files | Fastest on phones, nothing to fail to load | 2026-10-20 |
| Order = pre-filled email/WhatsApp message + copy fallback | No backend; farm takes payment itself | 2026-10-20 |
| Contact details live in `CONFIG` at the top of the script | Not supplied yet; buttons explain when empty | 2026-10-20 |
| Shipping dates computed in Europe/Paris time from the Monday 18:00 cutoff | Rule given by the farm | 2026-10-20 |
| Flat oysters (plates) disabled for dates outside September to April | Season given by the farm | 2026-10-20 |
