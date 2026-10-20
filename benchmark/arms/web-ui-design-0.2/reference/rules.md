# Web UI rules

These values are where at least three independent design skills agree. Where sources disagreed, one side was chosen, and the line says which. The project's `DESIGN.md` and the brief override any line here.

## Tells

These are defaults that read as generated because they appear whatever the subject. Each is legitimate when the brief asks for it. Otherwise replace it with a choice made for this subject. Removing a tell leaves a gap, so fill the gap with a decision from the same world: a bakery that drops cream and terracotta moves to rye crust, flour and enamel tins, not to a SaaS blue.

- Palettes: cream ground (near `#F4F1EA`) with serif display and terracotta accent; near-black with one acid-green or vermilion accent; purple or indigo gradients.
- Structure: identical icon + heading + text card grids; cards nested in cards; one radius and one grey shadow on everything; gradient washes as decoration.
- Chrome: an all-caps tracked eyebrow above every heading; `01 / 02 / 03` markers on content that is not a sequence; one accented word in a headline; `A · B · C` meta strings; `→` appended to every link; monospace as a "technical" costume.
- Motion: fade-and-slide-up on every section; hover animation on every card; glow, glass and gradient text.
- Content: invented stats, logos, testimonials; grey bars standing in for a product screenshot.

## Layout and spacing

- Spacing comes from a 4px scale. Every gap is a scale step.
- Group by proximity. Space above a heading is larger than below it.
- Separate regions with space and tone first, then low-contrast borders.
- Body line length is 45 to 75 characters.
- Nested radius: outer radius = inner radius + padding.
- Full-height layouts use `100dvh`. Horizontal overflow uses `overflow-x: clip`, which keeps `position: sticky` working.
- An app sidebar sits in a grid row that spans the page, with `position: sticky; top: 0; height: 100dvh` on its content, so its background runs to the bottom of a long page.
- Reserve space for images and async content with explicit dimensions or `aspect-ratio`.

## Type

- Use 1 family for Operate screens and at most 2 for Persuade, clearly distinct. Pick the typeface from the subject. A neutral sans is a fine choice for Operate when chosen on purpose.
- Build hierarchy from size, weight and color together. Emphasis is one weight step.
- Body text is 16px or larger, line-height about 1.5. Large headings get tighter tracking (-0.01 to -0.03em). Body tracking stays 0.
- Headings get `text-wrap: balance`, and body gets `text-wrap: pretty`.
- Changing or aligned numbers get `font-variant-numeric: tabular-nums`.
- Use sentence case for headings, buttons and labels.
- Every web font has a fallback stack, and the render loop confirms the font loaded. A page in Times or Arial reads as unstyled.

## Color

- A system is ramps: one neutral ramp, one accent ramp, and only the status ramps the product renders. Use OKLCH for new systems.
- Components reference semantic tokens (`--color-text-secondary`). Primitives (`--blue-600`) are referenced only by tokens.
- Use 3 or 4 text levels (primary, secondary, tertiary, muted) on one neutral hue.
- The accent marks actions and meaning, about 5% of the surface or less. Each view has one filled primary action.
- Contrast: 4.5:1 for body text, 3:1 for large text, icons and control boundaries. The render loop measures it.
- Color is paired with a second signal (icon, text, shape) wherever it carries meaning.

## Surfaces and depth

- Use one depth strategy per product, recorded in `DESIGN.md`.
- Elevation is a 1px translucent ring plus soft layered shadow. In dark mode it collapses to a faint light ring.
- Borders mark structure and input outlines.
- Images get a 1px inset outline in black or white at about 10% opacity.

## Motion

- Decide by frequency first. Actions repeated 100+ times a day, and anything keyboard-initiated, change state instantly. Occasional surfaces (modals, drawers, toasts) get standard motion. Delight belongs to rare moments (onboarding, success).
- Name the purpose before animating: feedback, spatial origin, state change, or bridging a jump. A Persuade page gets one orchestrated moment.
- Animate `transform` and `opacity`, and list the exact properties in `transition`.
- Entering and exiting elements use a strong ease-out such as `cubic-bezier(0.23, 1, 0.32, 1)`. Elements moving on screen use ease-in-out such as `cubic-bezier(0.77, 0, 0.175, 1)`. Constant motion is linear.
- Durations: press 100 to 160ms, hover and menus 150 to 250ms, modals and drawers 200 to 400ms. Exits run about 75% of the enter time. Product UI stays under 300ms where it can.
- Press feedback is `scale(0.97)`. Entrances start from `scale(0.95)` with `opacity: 0`.
- Popovers scale from their trigger (`transform-origin` at the anchor). Modals stay centered.
- Reversible state uses CSS transitions so it can retarget mid-flight. Springs for gestures run with zero bounce in Operate mode.
- Stagger lists by 30 to 80ms per item.
- Hover effects sit inside `@media (hover: hover)`.
- `prefers-reduced-motion: reduce` swaps movement for an opacity change and keeps the feedback.

## States and interaction

- Every control has hover, `:focus-visible`, active and disabled states. The focus ring is visible with 3:1 contrast.
- Every async view has loading (skeleton matching the final layout), empty (with the next action) and error (what happened and how to fix it) states.
- Use native elements or accessible primitives (Radix, Base UI, React Aria) and the project's existing components.
- Hit areas are at least 24px, and 44px on touch. Extend small controls with a pseudo-element.
- Every input has a label. Icon-only buttons have an accessible name. Images have `alt`.

## Mobile

- At 390px every multi-column grid is one column, and every row of controls or tabs either wraps or scrolls with its cut edge visible.
- Wide tables become stacked rows of label and value at 390px. Keep a scrolling table only when its columns must be compared, and then pin the first column.
- Code blocks scroll inside themselves with `overflow-x: auto`. Write example lines under 60 characters so they fit a phone without scrolling.
- Inputs are 16px or larger so iOS keeps the zoom.
- Content respects `env(safe-area-inset-*)`.
- `touch-action: manipulation` removes tap delay. `-webkit-tap-highlight-color: transparent` goes with a designed active state.
- Test on a real phone before calling a touch interaction done.

## Copy

- Name things by what the user manages, not how the system works.
- A button names its action ("Save changes"), and the result keeps the name ("Saved").
- Errors state what happened and the fix, without apology.
- Empty states invite the next action.

## Stress test

Before finishing, feed the UI worst-case data: a 60-character name, a one-letter name, an unbroken email, a count of 1,000,000, zero items, a missing avatar, non-Latin text and emoji. Every case wraps, truncates with a tooltip, or scales without breaking the layout.
