# Slow Clay design

Subject: small Portland pottery studio. 6-week wheel-throwing course ($340, 8 students, Tue or Sat mornings) and open-studio membership ($120/mo, 25 lb clay + firing). Mode: Persuade. Job: get a visitor to enquire about a course seat or membership.

Signature element: a pot that changes shape week by week (course timeline, SVG silhouettes).

## Color (OKLCH)
- `--ground` oklch(0.95 0.008 150): pale stoneware with a faint celadon cast. Avoids cream/terracotta.
- `--surface` oklch(0.98 0.004 150): raised panels.
- `--ink` oklch(0.24 0.015 60): wet-clay dark; text and the dark band.
- `--ink-2` oklch(0.42 0.015 60), `--ink-3` oklch(0.50 0.015 60): secondary/tertiary text (both >= 4.5:1 on ground).
- `--accent` oklch(0.42 0.14 262): cobalt, the oxide potters glaze with. Actions and the pot only.
- `--line` oklch(0.24 0.015 60 / 0.14).

## Type
Bricolage Grotesque (one family, variable weight), fallback system sans. Scale: 16 / 18 / 24 / 36 / 56-88 fluid. Headings 600, tracking -0.02em.

## Space / radius / depth
4px base. Radius 8 (controls), 16 (panels). Depth: borders and tonal layers only, no shadows.

## Motion
ease-out `cubic-bezier(0.23,1,0.32,1)`; 160ms press/hover, 300ms pot crossfade. One moment: pot morph. Reduced motion: no transform.

## Decisions
- Course arc (centering to glazing) is placeholder copy written by the designer; owner should edit.
- No testimonials, stats or address: none supplied.
- Form composes a mailto to `STUDIO_EMAIL` in the script (placeholder).
