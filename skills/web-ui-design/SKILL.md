---
name: web-ui-design
description: Design and build web UI that looks deliberate, not generated. Use when creating or restyling any web page, screen or component (landing page, app, dashboard, docs, form), or when critiquing how a UI looks.
---

# Web UI design

The look comes from the process, not from a rule list. Run these steps in order. The rules live in [reference/rules.md](reference/rules.md) and apply during steps 4 to 6.

## 1. Load the contract

Read `DESIGN.md` at the repo root (or `.interface-design/system.md`) if it exists. Its tokens and decisions outrank every default in this skill. The brief outranks both.

Done when you can name the project's colors, type, spacing base, radius scale and depth strategy, or you know there is no contract yet.

## 2. Write the brief

One line each, inferred from the prompt and code. State your assumptions and proceed.

- **Subject**: what the product is and its world (materials, vernacular, industry).
- **Audience** and the **primary job** of this screen.
- **Mode**: *Persuade* (landing, marketing), *Operate* (app, dashboard, settings) or *Read* (docs, articles). Operate is quiet and conventional. Persuade spends boldness in one place.
- **Content**: the real copy, data and states. Write sample data that looks real and label it as sample. Proof (customers, stats, quotes, logos) comes only from the user.

## 3. Gather references

Use the user's references first. With none, name 2 or 3 real products from the subject's world and the specific thing each contributes ("Linear's 13px dense table rows", not "clean like Linear").

## 4. Set the direction

Skip when the contract already decides it.

For a new surface, sketch 2 or 3 directions that differ on a named axis (density, personality, layout model, type voice). Pick one with a one-line reason, or hand the choice to the user with a variant picker. Name the **signature element**: one thing on the screen that only this subject would have, such as a tide chart on a sailing school's booking page or a live diff on a code review tool.

Then write the token plan into `DESIGN.md` at the project root, using [reference/design-md-template.md](reference/design-md-template.md):

- Color: 4 to 6 named values with roles, one accent.
- Type: 1 or 2 families with roles, and a type scale.
- Spacing base (4px) and radius scale.
- One depth strategy: borders only, ring plus soft shadow, or tonal layers.
- Motion tokens: easing curves and durations.

Check the plan against **Tells** in the rules. Any part you would have produced for any similar brief gets revised, with the change and reason stated.

Done when `DESIGN.md` exists and every token in it has a value and a reason tied to the brief.

## 5. Build

Use the tokens from `DESIGN.md` only, never literal values. Build every state the screen can reach: loading, empty, error, disabled, hover, focus, active. Follow the rules section by section.

## 6. Run the render loop

Run the checker on the page:

```bash
node <this skill's directory>/scripts/check.mjs <page file or URL>   # add --dark if the page has dark mode
```

It renders the full page at 390, 768 and 1440 px, reports page overflow, clipped content, contrast, unloaded fonts and script errors, and saves screenshot tiles. Open every tile it lists. Critique the tiles against every section of the rules, fix the failures and findings as one batch, and run the checker again. Stop after 3 rounds, and list any failure still open in your reply.

When the checker cannot start (no Node 22 or no Chrome), use your browser tool instead: full-page screenshots at the same widths, plus measured overflow and contrast.

Done when the run after your last edit reports 0 failures, you opened every tile from that run, and every rule passes or is listed as a deliberate exception with its reason. A clean pass is the floor, not proof of quality, so end with one sentence on what makes this screen belong to its subject.

## 7. Record decisions

Update `DESIGN.md` with the tokens as built and each non-obvious decision from steps 5 and 6, with its rationale. The next session reads it in step 1.

## Review mode

When asked only to critique, run step 6 without building or fixing. Report findings as one table with the columns `Location | Before | After | Why`, most severe first.
