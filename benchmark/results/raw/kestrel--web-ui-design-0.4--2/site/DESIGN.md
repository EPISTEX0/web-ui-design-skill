---
name: Kestrel Physio front desk
mode: operate
page-type: Dashboard + list (single screen)
family: Soft and friendly, with Dense-tool restraint
stack: plain HTML, CSS, JS in index.html
colors: { bg: "#f5f9f8", surface: "#fff", text: "#17302e", text-secondary: "#3f5957", border: "#d3e2e0", accent: "#2a7f7a" }
typography: { body: "Avenir Next, Nunito Sans, Segoe UI, system-ui, sans-serif", scale: [15, 18, 22, 28, 40] }
spacing-base: 4
radius: { sm: 10, md: 16, lg: 20 }
depth: ring-shadow
---
# Kestrel Physio front desk

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Primary action | Check patients in, see who is waiting | user |
| Audience, device | Reception staff, desktop/landscape tablet, all day | user |
| Brand | Teal #2a7f7a; light only, big text and buttons | user |
| Content | Sample patients, clinicians, rooms, prices, clock (10:40 on 20 Oct) | assumed, replace |

## Decisions
- 18px body, 48-52px controls: user asked for big text and buttons.
- Status always has icon + text, never colour alone.
- Day strip (8am-5pm with now marker) is the signature element.
- Every change is instant with Undo toast; URL hash holds clinician and search.
- Text on teal tints uses darker teal #1b5450 for contrast.
