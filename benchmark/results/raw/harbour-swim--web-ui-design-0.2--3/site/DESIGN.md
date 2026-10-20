---
name: Harbour Swim Club
mode: persuade
colors:
  bg: "#eef3f7"
  surface: "#ffffff"
  text: "#1c2638"
  text-secondary: "#4a566b"
  border: "#d3dce6"
  accent: "#f2c230"
  navy: "#14264a"
  pool: "#135b80"
typography:
  display: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
  body: "same stack"
  scale: [14, 15, 16, 18, 24, 28, 40]
spacing-base: 4
radius: { sm: 4, md: 8, lg: 12 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  durations: { press: 140, hover: 180 }
---

# Harbour Swim Club design

Friendly volunteer club site, used mostly on phones by members checking the timetable. Navy and yellow come from the logo; yellow is only ever a fill behind navy text, never text on white. Signature element: the timetable opens on today's sessions, with day tabs.

## Decisions
| Decision | Rationale |
| --- | --- |
| System fonts | No font loading, fast on poor mobile signal |
| Timetable becomes stacked cards under 760px | Six columns cannot fit a phone |
| Static notices replace scrolling ticker | Moving text is hard to read and fails reduced-motion |
| Menu button only when JS is on (`.js`) | Nav stays visible if scripting fails |
| Inline form errors replace alert() | Usable on phones and by screen readers |
