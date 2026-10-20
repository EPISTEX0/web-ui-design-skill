---
name: Salt and Iron guide
mode: read
colors:
  bg: "oklch(96% 0.006 220)"      # salt-crusted pale grey
  surface: "oklch(99% 0.003 220)"
  ink: "oklch(22% 0.03 245)"      # iron-blue black, also dark sections
  text-secondary: "oklch(40% 0.025 245)"
  border: "oklch(86% 0.01 230)"
  accent: "oklch(52% 0.15 45)"    # oxide / rust, actions and stop numbers only
typography:
  display: "system sans, heavy weight, tight tracking"
  body: "system sans"
  scale: [14, 16, 18, 22, 32, 56]
spacing-base: 4
radius: { sm: 4, md: 8 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  durations: { press: 140, menu: 200, overlay: 260 }
---
# Direction
Visitor companion for a maritime museum show. Read mode, phone-first. Signature: object entries are stamped like riveted iron tags (stop number in a rust plate), and the gallery plan is a deck-plan strip.
# Decisions
| Decision | Rationale |
| --- | --- |
| Cool salt grey ground, rust accent | Avoids cream/terracotta; rust is the exhibition's subject |
| System fonts | Works offline in galleries with poor signal |
| Borders only | Print-label feel, no glow |
| Sample content | No facts supplied; all object text is placeholder |
