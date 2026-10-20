---
name: Dean Fungus Group species guide
mode: read
page-type: Help center / lookup (static, client-side list)
family: Editorial
stack: plain HTML, CSS, JS in index.html, no build
colors: { bg: "#f3ecd8", surface: "#e9dfc2", text: "#2a2f1c", text-secondary: "#4a4e38", border: "rgba(42,47,28,.24)", accent: "#4a5d23" }
typography: { display: "Georgia, serif", body: "Georgia, serif", ui: "system-ui, sans-serif" }
spacing-base: 4
radius: { sm: 2 }
depth: borders
---
# Design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Fungi of the Forest of Dean, for group members on forays | user |
| Primary action | Look up a species and its lookalike | inferred from request |
| Colours | Moss #4a5d23 on cream #f3ecd8; red #b3261e for Deadly only | user (newsletter) |
| Content | 16 entries, names and pairings from the user's notes; all other fields "To be confirmed" | user |

## Decisions
| Decision | Rationale |
| --- | --- |
| Only four labels; anything else logs an error and shows "Label to be confirmed" | Group never writes "edible" |
| Red used only on the Deadly chip and its 999 box border | User rule |
| Label shown as colour + glyph + words | Colour never the only signal |
| Poisonous/Deadly entries always show the 999 line (list and detail) | User rule |
| "Eaten by members" without a lookalike shows a visible warning | User rule: dangerous lookalike must sit beside it |
| Filters (month, habitat, spore print) appear only once data exists | Avoid empty controls |
| System fonts only | No font files to load |
