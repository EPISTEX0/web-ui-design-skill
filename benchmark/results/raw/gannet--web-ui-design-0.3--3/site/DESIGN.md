---
name: MV Gannet car deck loading
mode: operate
page-type: dashboard / list-and-detail hybrid (queue + deck plan)
family: Dense tool restraint with 17px text and 44px+ targets (touch, gloves, daylight)
stack: single index.html, plain HTML/CSS/JS, no build, state in localStorage
depth: borders and tonal layers; shadow only on toast, menu, dialog
---
# Design notes

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Car deck loading on the MV Gannet (fictional vessel, 4 lanes x 32 m) | user |
| Primary action | Put the next waiting vehicle into a lane | inferred from "replace the clipboard" |
| Audience, device | Deck crew, tablet in a bracket (landscape first), phone usable | assumed |
| Content | Sample data, labelled in the UI | user ("realistic sample data") |

## Decisions
- Plan view: bow at right, port at top (stern ramp left, where the queue is). Narrow containers rotate it: bow at top, port at left.
- Palette from the vessel: hull navy header, deck-paint yellow lane lines and UK number plates, lifebuoy orange for the single filled action (the best-fit lane). Skerra vehicles navy, Holm vehicles teal, each with a text label.
- Rules modelled: lane height (outer lanes under mezzanine, 2.1 m), dangerous goods in lanes 2-3, reefers in lane 3, lane length, 85 t deck limit (hard blocks, reason shown on the button); Holm vehicle blocked by a Skerra vehicle, blue badge outside lanes 1/4, list over 0.5 m, trim over 3 m once 75% full (warnings).
- Place applies at once with Undo; only the last vehicle in a lane can come off, as on a real deck.
- Simulated clock starts at 14:02 on reset; sailing 14:30, ramp up 14:20.
