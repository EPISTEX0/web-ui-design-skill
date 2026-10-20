---
name: Salt and Iron visitor guide
mode: read
page-type: Article/long read, as a 12-stop phone companion (hash routes #1 to #12)
family: Editorial, pushed to high contrast
stack: Plain HTML, CSS and JS in index.html; sw.js for offline
colors:
  bg: "#fbf7ef"
  surface: "#f1eadc"
  text: "#1c1917"
  text-secondary: "#4a433c"
  border: "#8a8176"
  accent: "#9c3d1f"
typography:
  display: "ui-serif, Georgia, 'Iowan Old Style', Cambria, serif"
  body: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
  scale: "rem-based; html is 100%, 112.5% or 125% (text size control); body 1.25rem"
spacing-base: 4
radius: { control: 2 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  durations: { press: 120 }
---

# Salt and Iron guide design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Exhibition guide, Harwick Maritime Museum, 14 March to 2 November 2027 | user |
| Primary action | Move to the next stop; play the stop audio | user |
| Audience and device | Visitors, many over 60, on phones, some stops outdoors in bright light, patchy signal | user |
| Assets | Rust #9c3d1f, off-black, warm white, serif headings like the printed labels; no sea-blue; no external dependencies | user |
| Content | 12 stop titles in order; ~120 words and a 1 to 3 minute clip per stop | user (texts are sample) |

## Direction
Reads like the museum's printed gallery labels: serif headings, heavy ink rules, no cards. Contrast is maxed for sunlight (ink on warm white above 15:1, rust above 6:1). Signature element: the stop number on a rust plate with four rivets, with a 12-segment strip above it that doubles as navigation.

## Decisions
| Decision | Rationale |
| --- | --- |
| Body 20px, text size control to 25px, stored in localStorage | Over-60 audience |
| 72px-tall previous/next bar fixed to the bottom, next in rust | One thumb, both directions, always reachable |
| Audio is `preload=none`, saved through the Cache API and sw.js | Patchy signal and mobile data; sw.js answers range requests from saved files |
| Stop 1 shows "All stops" instead of a disabled Previous; stop 12 shows "Back to all stops" | No dead controls |
| Light only, no dark mode | Bright outdoor light |
| Texts live in one JSON block; a stop without `text` shows labelled sample text | Easy hand-over of real labels |
| System fonts only | No external dependency |
