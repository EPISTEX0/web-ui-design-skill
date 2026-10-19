# backoff-kit docs — design contract

Mode: Read (docs). Audience: TS/Node developers scanning for an option or a recipe.
Signature element: a live delay-curve plot in the options section. Sliders for factor, min, max and jitter redraw the per-attempt delay ceiling and jitter band. It shows what the options do, which is the one thing a retry library's docs need.

## Color
- paper `#f6f3ec` — warm page ground, easier on long reading than white
- surface `#fffdf8` — code blocks, cards
- ink `#1d1b17` — body text (contrast > 14:1 on paper)
- muted `#5f5a4f` — secondary text (contrast > 5.5:1)
- line `#ddd6c6` — borders (depth strategy: borders only, no shadows)
- accent `#b4410a` — links, active nav, curve. One accent, burnt orange, the colour of a countdown or warning light.

## Type
- Sans: system UI stack (no font loading). Mono: ui-monospace stack.
- Scale: 13 / 15 / 17 / 22 / 32 px. Body 16px line-height 1.65, measure capped at 70ch.

## Spacing / radius
- 4px base: 4 8 12 16 24 32 48 64. Radius 4 (inputs, code) and 8 (cards).

## Motion
- 150ms ease-out for hover/focus colour. Respects prefers-reduced-motion. No entrance animation.

## Decisions
- Sidebar nav on desktop, collapses to a top list on narrow screens. No JS dependency for navigation.
- Copy buttons on code blocks use a plain button, with text feedback ("Copied").
- The API shown (option names and defaults) is sample and must be checked against the library source before publishing.
