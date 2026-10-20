---
name: Dean Fungus Group species guide
mode: read
page-type: List and detail (searchable species index with detail sheet)
family: Editorial, with ground taken from lichen rather than paper
stack: single index.html, plain CSS and JS, no build, system fonts
colors: { bg: "oklch(95.5% 0.012 125)", surface: "oklch(98.6% 0.006 125)", text: "oklch(24% 0.03 155)", text-secondary: "oklch(39% 0.03 155)", border: "oklch(86% 0.02 135)", accent: "oklch(40% 0.085 155)" }
typography: { display: "ui-serif, Georgia, serif", body: "system-ui, sans-serif" }
spacing-base: 4
radius: { sm: 4, md: 8, lg: 12 }
depth: borders (shadow only on the modal sheet)
---

# Design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Fungi of the Forest of Dean, for group members after a foray | user |
| Primary action | Identify what was found: filter or search, open a species | inferred |
| Audience | Group members on phones in the field and desktops at home | assumed |
| Content | 48 species written from general knowledge; schematic drawings, no photos | assumed |

## Decisions
- Accent is moss green; red is reserved for danger (Deadly) so it never reads as "action".
- Safety status always pairs colour with an icon shape and a word.
- Drawings are generated SVG (cap, underside pattern, ring, volva) and labelled schematic, since no photos were supplied.
- Filter and search state is kept in the query string; an open species is the URL hash.
- No contact details for the recorder are invented; the footer tells people what to record.
