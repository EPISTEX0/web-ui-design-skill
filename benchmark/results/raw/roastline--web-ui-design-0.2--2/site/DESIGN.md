# Roastline design contract

Mode: Operate (internal tool, quiet, dense, conventional). Audience: roast master, ops lead, wholesale coordinator. Primary job: at a glance, what must I roast, reorder or ship today.

Signature element: the live roast curve (bean temp vs time, first-crack marker, "now" cursor) for the batch on the drum.

## Color
- paper `#F5EFE6` page; card `#FCF9F4` surfaces; line `#E3D8C8` borders
- ink `#2A1D16` text; muted `#6B5B4F` secondary text (4.5:1+ on paper)
- accent ember `#B4411B`: the only accent. Used for the curve, low stock, primary action focus.
- status: ok `#3B7A4B`, warn `#9A6412`, bad `#B4411B` (shared with accent: ember means "needs attention"). Always paired with a text label.
- bean `#CDB89B` neutral bar fill for healthy stock.

## Type
System UI stack for text; ui-monospace-free: numbers use tabular-nums. Scale: 12 / 13 / 14 / 20 / 28. No web fonts (no build, no network).

## Space, radius, depth
4px base. Radius 6 (controls) / 10 (cards). Depth: borders only, no shadows.

## Motion
150ms ease-out for hover/focus; disabled under prefers-reduced-motion.
