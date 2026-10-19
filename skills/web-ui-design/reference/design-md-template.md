# DESIGN.md template

Copy into the repo root as `DESIGN.md`. Fill every value. Add `Read DESIGN.md before any UI work.` to the project's `CLAUDE.md` or `AGENTS.md` so the contract loads even when no design skill triggers.

```markdown
---
name: <product>
mode: operate | persuade | read
colors:
  bg: "#..."
  surface: "#..."
  text: "#..."
  text-secondary: "#..."
  border: "#..."
  accent: "#..."
typography:
  display: "<family>, <fallback>"
  body: "<family>, <fallback>"
  scale: [12, 14, 16, 20, 24, 32, 48]
spacing-base: 4
radius: { sm: 4, md: 8, lg: 12 }
depth: borders | ring-shadow | tonal
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 140, menu: 200, overlay: 300 }
---

# <Product> design

## Direction
One paragraph: subject, audience, the feeling, and the signature element.

## References
- <product>: <the specific thing taken from it>

## Components
- Button primary: height 36, padding 12/16, radius md, 14/500
- Card: padding 16, radius lg, depth per `depth`

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| Borders only, no shadows | Dense data tables; shadows add noise | YYYY-MM-DD |
```

If the project already has a styling system, record what exists instead of inventing values. Tokens in code stay the source of truth, and this file explains them.
