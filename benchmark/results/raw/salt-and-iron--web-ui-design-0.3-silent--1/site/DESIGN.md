---
name: Salt and Iron visitor guide
mode: read
page-type: local business / visitor guide (single page)
family: Editorial, dark
stack: plain HTML, CSS, JS in index.html; no build, no web fonts
colors: { bg: "#0e1a22", surface: "#15252f", text: "#e6eceb", text-secondary: "#a9b8bd", border: "#2a3d48", accent: "#e0724a" }
typography: { display: "Liberation Serif, Georgia, Iowan Old Style, Palatino, serif", body: "system-ui" }
spacing-base: 4
radius: { sm: 2, md: 4 }
depth: tonal
---

# Design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Exhibition guide, Harwick Maritime Museum | user |
| Primary action | Plan your visit | assumed |
| Audience | Museum visitors, mostly on phones | assumed |
| Content | All placeholders, marked with a dashed underline (`.ph`) | user gave none; nothing invented |

## Direction
Harbour-dark ground (night water), salt-white text, one rust accent (iron). Signature: the title split into Salt (white) over Iron (rust) with a waterline that draws in once on load.

## Content to replace
Placeholders are `.ph` spans in the HTML, plus the `GALLERIES` array at the bottom of index.html (galleries and objects). Add the ticket button in the Opening hours card.
