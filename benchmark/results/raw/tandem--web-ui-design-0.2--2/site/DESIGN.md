# Tandem design contract

Subject: cargo bike shop, Utrecht. Mode: Persuade. Audience: families and tradespeople deciding whether a cargo bike can replace a car. Primary job: book a test ride.
References: Dutch cycle-path signage (red asphalt, white line markings), CROW street furniture, Utrecht brick.
Signature element: the "What are you carrying?" chooser, which maps load to bike type.

## Color (OKLCH)
- ground `oklch(0.965 0.004 250)` cool light grey, like pale concrete (not cream)
- surface `oklch(1 0 0)`
- ink `oklch(0.22 0.02 250)`; secondary `0.42`; tertiary `0.5` same hue
- asphalt `oklch(0.25 0.015 250)` dark band
- accent "fietspad red" `oklch(0.5 0.17 32)`: actions and the one hero block only

## Type
System stack only (no build, no font loading). Display: 800 weight, -0.03em, tight. Body 17px/1.55.
Scale: 14 / 17 / 22 / clamp(32,5vw,52) / clamp(44,9vw,104).

## Space, radius, depth
4px base. Radius 4 (controls) / 12 (panels). Depth: borders only (1px ink at ~14%), no shadows.

## Motion
ease-out `cubic-bezier(0.23,1,0.32,1)`; 160ms hover, 200ms state; one orchestrated moment: bike rolling in on load. Reduced motion: no movement.

## Decisions
- No invented stats, reviews, prices, address or hours; placeholders are marked `[…]` in the page and must be replaced.
- Booking form builds a mailto: set `SHOP_EMAIL` in the script.
- Lane-marking dashes are the only decoration.
