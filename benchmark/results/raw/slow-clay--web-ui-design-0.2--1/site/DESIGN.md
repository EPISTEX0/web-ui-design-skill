# Slow Clay design contract

Subject: small wheel-throwing studio, Portland OR. Mode: Persuade. Primary job: get a visitor to enquire about the 6-week course or an open-studio membership.

Direction: glaze-bench palette (celadon slip ground, cobalt-oxide accent, stoneware ink) instead of cream/terracotta. Signature element: a live pot profile the visitor "pulls" with two sliders; it rises once on load.

## Color (OKLCH, semantic tokens in :root)
- `--ground` oklch(95% 0.012 165): celadon slip, page background
- `--surface` oklch(98% 0.006 165): raised panels
- `--ink` oklch(24% 0.025 200): primary text; `--ink-2` 42% secondary; `--ink-3` 50% tertiary
- `--line` oklch(82% 0.015 170): borders
- `--accent` oklch(42% 0.15 262): cobalt, actions and the pot's glaze only
- `--clay` oklch(62% 0.07 55): raw stoneware, used on the wheel and seat dots

## Type
- Display: Bricolage Grotesque 600, tight tracking; Body: Instrument Sans 400/500. Both with system fallbacks.
- Scale: 16 / 18 / 22 / 32 / clamp(40-76).

## Spacing, radius, depth
- 4px base. Radius 4 (controls), 12 (panels). Depth: borders only, no shadows.

## Motion
- ease-out `cubic-bezier(0.23,1,0.32,1)`, 150-250ms hovers, press scale(0.97). One orchestrated moment: pot rises on load. Reduced motion: no rise.

## Decisions
- No invented proof (testimonials, stats, dates, address). Only facts from the owner: $340 / 6 weeks / max 8 / Tue or Sat mornings; $120/month incl. 25 lb clay and firing.
- Enquiry form builds a mailto: link; `ENQUIRY_EMAIL` in the script must be set to the studio's real address.
