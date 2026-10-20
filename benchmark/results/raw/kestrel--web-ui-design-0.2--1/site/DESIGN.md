# Kestrel Physio front desk: design contract

**Subject**: Physiotherapy clinic. Audience: reception staff, on a desk monitor all day and sometimes a tablet.
**Mode**: Operate. Quiet, dense, conventional. The job is to see who is here, who is late, and what to do next.
**Signature element**: the day timeline, one row per practitioner on an 8:00 to 17:30 axis, with a live "now" line. It is how a front desk thinks about the day.

## Color (OKLCH, semantic tokens in CSS)
- Neutral ramp on hue 250 (cool slate): ground, surface, line, four text levels.
- Accent: rufous (kestrel plumage), hue 45. Used only for the one filled primary action, focus ring and the now line.
- Status, always paired with a word and a glyph: waiting = amber, in treatment = teal, completed = grey, late and no-show = red.

## Type
System UI stack, one family. No web font, so nothing can fail to load on a clinic PC. Scale 12 / 13 / 14 / 16 / 20 / 28. Numbers use tabular-nums.

## Spacing, radius, depth
4px base. Radius 4 (chips), 8 (controls, blocks), 12 (panels). Depth: tonal layers plus 1px borders. The only shadow is on dialogs and toast.

## Motion
Ease-out `cubic-bezier(0.23, 1, 0.32, 1)`. Press 120ms scale(0.97), dialog and toast 200ms. Check-in and status changes are instant because they repeat all day. Reduced motion drops movement.

## Decisions
- Clock starts at 10:42 on the sample day and then runs in real time, so the screen always has a live mid-morning state to show. The footer says so.
- The timeline scrolls sideways at every width with the practitioner column pinned, because rows must be compared against one time axis.
- Currency is left out of the sample data ("Payment due") because the clinic's currency is not known.
