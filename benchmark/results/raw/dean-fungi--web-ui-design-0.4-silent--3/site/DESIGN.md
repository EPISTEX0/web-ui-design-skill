---
name: Dean Fungus Group species guide
mode: read
page-type: Help center (search first, client-side filtering)
family: Editorial, tailored (hairline rules, serif headings, no cards)
stack: single index.html, plain HTML/CSS/JS, system fonts
colors:
  bg: "oklch(0.96 0.014 115)"      # lichen-pale ground
  text: "oklch(0.24 0.03 60)"      # leaf-litter brown ink
  accent: "oklch(0.4 0.09 150)"    # holly green: selected filters, season bars
  deadly: "oklch(0.38 0.14 25)"
  poison: "oklch(0.47 0.12 55)"
typography:
  display: "ui-serif, Iowan Old Style, Palatino, Georgia, serif"
  body: "system-ui, sans-serif"
spacing-base: 4
radius: { sm: 4, md: 8 }
depth: borders
---

# Design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Species guide for the Dean Fungus Group, Forest of Dean | user |
| Primary action | Identify what was found on a foray (search + filters) | assumed (left to me) |
| Audience and device | Members, phone in the field first | assumed |
| Assets | None supplied; no logo, colours or photos | user gave none |
| Content | 38 common UK species written from standard references | assumed |

## Decisions
| Decision | Rationale |
| --- | --- |
| Filters by underside, substrate, habitat, month, safety | Members identify from what they see, not from a name |
| Safety labels always text, never colour alone; "Edible" is outlined, not green | Green must not read as "safe to eat" |
| Month strip on every entry | Seasonal fruiting is the quickest narrowing step; marks the current month |
| Drawn schematic sketches instead of photos | No photos available; labelled as not photographs |
| System fonts only | No build step, offline-friendly, fast on woodland mobile signal |
| Filters and open species live in the URL | Shareable links, and Back works |

## To maintain
Add species by appending to the `SPECIES` array in index.html (fields as in existing entries).
