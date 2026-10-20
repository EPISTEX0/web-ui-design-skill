---
name: Kestrel Physio front desk
mode: operate
page-type: dashboard + list/detail
family: Dense tool, softened for non-expert daily use (16px body, 44px targets)
stack: plain HTML, CSS, JS in index.html
colors: { bg: oklch(0.972 0.004 245), surface: white, text: oklch(0.24 0.025 250), accent: oklch(0.45 0.1 255) slate, now-line: oklch(0.6 0.15 45) rufous }
typography: system sans stack (no web fonts); scale 12/14/16/18/22/24/32
spacing-base: 4
radius: { sm: 6, md: 10, lg: 14 }
depth: borders (drawer only gets a shadow)
---
# Design notes
## Brief (all assumed; user gave no answers)
| Item | Value | Source |
| --- | --- | --- |
| Primary action | Check patients in and send them through | assumed |
| Audience | Reception staff, desktop/tablet at the desk | assumed |
| Content | Sample data, labelled as such; £ and UK insurers | assumed |
## Direction
Kestrel palette: slate (the bird's head) for actions, rufous (its back) reserved for the live "now" line, the signature element of the timeline view. Status always pairs colour with a shape and a label.
## Decisions
- Demo clock starts at 10:42 and runs in real time so queue/late logic stays coherent.
- Filters live in the URL (?view, t, q, done). Every status change has Undo.
- 30-minute timeline blocks are 29px tall (below 44px) because height encodes duration; the list view is the touch-friendly route.
