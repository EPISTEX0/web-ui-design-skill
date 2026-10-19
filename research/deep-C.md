# Deep read C: emilkowalski, jakubkrehel, ibelick, Dammyjay93, stitch design-md, petergyang

Scope: shallow clones under `clones/`, read only (nothing executed). All `file:line` cites are relative to that clones dir. Token figures are bytes/4, a rough estimate, not a tokenizer count. "Always loaded" means the frontmatter `description` sits in every session's skill list; "on trigger" means the SKILL.md body loads; "on demand" means a linked sibling file the body tells the agent to open.

Not read: `jakubkrehel/make-interfaces-feel-better` (the separate 3,720-star repo in the inventory) is not among my clones. `jakubkrehel_skills` appears to be its successor (same topics: concentric radius, shadow rings, image outlines, scale-on-press), but that is an inference, not verified.

Headline finding up front: `petergyang/no-ai-slop` is a prose-editing skill (banned words, em dashes, "binary contrasts"). It has nothing to do with visual UI. The inventory row calling it "visual and copy tells" is wrong for visual. Drop it from the UI shortlist.

---

## 0. The persistence question (DESIGN.md / system.md)

There are three different mechanisms across my repos. They share one property: **none of them is automatic.** No hook, no CLAUDE.md import, no CI gate ships with any of them. Each is "a markdown file in the repo that a skill tells the agent to read and, sometimes, write." Cross-session consistency therefore depends on (a) the skill triggering at all, (b) the agent obeying the read instruction, and (c) the user saying yes to a save prompt.

### 0.1 Dammyjay93 `.interface-design/system.md`

What the file is. A hand-authored markdown design-decision record, not a spec. Template at `Dammyjay93_interface-design/reference/system-template.md:1-56`: `## Direction` (personality enum, foundation warm/cool/neutral/tinted, depth borders-only/subtle-shadows/layered), `## Tokens` (spacing base + scale, 5 color vars, radius scale, type scale + weights), `## Patterns` (component specs, e.g. "Button Primary: Height 36px, Padding 12px 16px, Radius 6px, Font 14px/500"), `## Decisions` (table: Decision / Rationale / Date). A filled example: `reference/examples/system-precision.md:1-62` (4px base, slate neutrals, borders-only, 32px buttons, 0.5px faint card border).

Write path. After building, the skill says: "Always offer to save: 'Want me to save these patterns for future sessions?' If yes, write to `.interface-design/system.md`" and lists what to record: direction, depth strategy and spacing base, hierarchy decisions, component patterns "when a component is used 2+ times... Record the values" (`.claude/skills/interface-design/SKILL.md:301-311`). The save is user-gated. Nothing writes it unprompted.

Read path. `SKILL.md:267` ("Inspect the existing app, design tokens, component patterns, and `.interface-design/system.md` if present") and the build flow: "If `.interface-design/system.md` exists: read it and apply — decisions are made. If not: explore domain... propose... confirm... build... run the checks... offer to save" (`SKILL.md:287-289`). Then "Consistency checks. If system.md defines values, hold to them: spacing on the grid, the declared depth strategy throughout, colors from the palette, documented patterns reused not reinvented" (`SKILL.md:311`). `commands/design-review.md:29` reads it as the review's frame of reference ("You review against the design's own intent") and `design-review.md:~85` plus `design-deslop.md:~57` filter out anything "ratified by system.md" as a decision rather than a defect.

What makes it weak.
- The read is an instruction inside a skill body. If the skill's description doesn't match the prompt, system.md is never read. The README's "✓ Loads .interface-design/system.md" (README:164-170) is a description of intended agent behavior, not tooling.
- The template (`reference/system-template.md`) is never linked from SKILL.md (grep for `system-template`/`reference/` under `.claude/` returns nothing). The agent writes the file from the bullet list at SKILL.md:303-309 and never sees the template.
- No schema, no linter, no staleness check. Values live in prose; drift detection is "check UI files against it" in natural language only (`SKILL.md:320`).
- The skill instructs silence about it: "Never say 'I'm in ESTABLISH MODE' or 'Let me check system.md'" (`SKILL.md:262`). Good for UX, bad for auditability.

What is good. The file captures exactly the right granularity for a coding agent: base unit, depth strategy, concrete component dimensions, and a rationale column. That rationale column is the part tokens-only formats lack, and it lets the agent distinguish "decision" from "accident".

### 0.2 Google Stitch `DESIGN.md` (two skills, two formats)

`design-md` (`google-labs-code_stitch-skills/plugins/stitch-utilities/skills/design-md/SKILL.md`)
- Purpose, in its own words: a "source of truth for prompting Stitch to generate new screens that align perfectly with existing design language" (`:17`, `:27`).
- Input is a Stitch project, fetched through the Stitch MCP: `list_tools`, `list_projects`, `list_screens`, `get_screen`, download `htmlCode.downloadUrl`, `get_project` for `designTheme` (`:29-62`). Without the Stitch MCP the retrieval half is unusable.
- Synthesis rules (`:64-86`): atmosphere adjectives; colors as "descriptive name + hex + role"; "Translate Geometry & Shape" into words ("`rounded-full` as 'Pill-shaped'"; "`rounded-lg` as 'Subtly rounded corners'"); depth in words ("Whisper-soft diffused shadows").
- Output: prose with 5 sections (Atmosphere, Color Palette & Roles, Typography Rules, Component Stylings, Layout Principles; `:95-117`). The example adds a 6th, "Design System Notes for Stitch Generation", whose purpose is to be copy-pasted into prompts, and which says to say "Subtly rounded corners (not 'rounded-md' or '8px')" (`examples/DESIGN.md:129-148`).
- No YAML, no linter. The example does keep real values in parentheses (`#294056`, `8px/0.5rem`, `0 2px 8px rgba(0,0,0,0.06)`, `1440px` max width; `examples/DESIGN.md:59-113`).

`extract-design-md` (`plugins/stitch-design/skills/extract-design-md/SKILL.md`, 365 lines)
- Reads frontend source (Tailwind config, CSS vars, theme files) with no render and no Stitch MCP needed for the extraction itself (`:44-47`). Framework reference files per stack (`references/react-tailwind.md`, `vue.md`, `svelte.md`).
- Writes `.stitch/DESIGN.md` and **requires YAML frontmatter**: "You **MUST** include the YAML frontmatter at the top of the file with `name` and `colors` mapping... required for other skills to parse the design system" (`:279-281`). Example frontmatter is a Material-style token set (`surface`, `on-surface`, `primary`, ... `examples/DESIGN.md:1-40`).
- This is a better fit for a coding agent: structured tokens plus prose. It dedupes near-duplicate colors, and tells the agent to read comments and theme files first.

How the file persists and propagates inside the Stitch family.
1. File on disk: `.stitch/DESIGN.md` (extract-design-md, manage-design-system; `manage-design-system/SKILL.md:53,121`). `design-md` itself says "Create `DESIGN.md` in the project directory" (`:145`).
2. Consumers read it by instruction. `enhance-prompt` Step 2: "Look for a `DESIGN.md`... Read the file... Format as a 'DESIGN SYSTEM (REQUIRED)' section" (`enhance-prompt/SKILL.md:44-61`). `stitch-loop` reads `.stitch/DESIGN.md` and `.stitch/SITE.md` every iteration and requires the design block be copied into the baton prompt (`stitch-loop/SKILL.md:35-79`). `react-vite-dashboard` maps `colors.*`, `typography.*`, `spacing.*` into CSS vars (`react-vite-dashboard/SKILL.md:27,43-56`).
3. A second memory file: `.stitch/SITE.md`, called "the project's 'Long-Term Memory'" (`site-md/SKILL.md:9`; `stitch-loop/examples/SITE.md:4`), holds identity, sitemap, roadmap. And a baton file `.stitch/next-prompt.md` relays state between loop iterations (`stitch-loop/resources/baton-schema.md`). The loop is built for cross-iteration consistency.
4. Server-side persistence, the only real one in my set: `manage-design-system` uploads DESIGN.md then calls `create_design_system_from_design_md`, after which "Stitch holds the design tokens at the project level — you do NOT need to repeat them in generation prompts" (`manage-design-system/SKILL.md:60-90`). That only helps if you generate in Stitch.
5. A user-confirmation gate before upload (`:60-64`), which is a good pattern.

Inconsistency inside the repo. `design-md` (the 64K-install one) outputs prose-only; `react-vite-dashboard` expects token paths and tells you to run `npx @google/design.md lint DESIGN.md` (`:53-56`). So the family straddles an older prose format and a newer structured format.

### 0.3 ibelick `create-design-md` (the strict third option)

`ibelick_ui-skills/skills/create-design-md/SKILL.md` (254 lines, 16 KB) writes a root `DESIGN.md` against the official `@google/design.md` format: YAML frontmatter (`version: alpha`, `name`, `colors`, `typography`, `rounded`, `spacing`, `components`), then fixed prose sections in a fixed order (Overview, Colors, Themes, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts; `:183-194`). It then **validates with tooling**: `npx @google/design.md lint`, `export --format css-tailwind|json-tailwind|dtcg`, and `diff` against the previous file on update (`:218-242`). The skill checks the installed spec before encoding themes (`npx @google/design.md spec`, `:111-117`).

Method is an evidence ledger: "role → value → source → scope → recurrence → confidence" (`:45-47`), a three-proof gate for URL-derived values (observation, basis, consequence; `:87-93`), and "Do not turn utility classes, repeated literals, or component values into token scales" (`:99`). In its own words it records "the design language that governs it, not every value that happens to exist" (`:8`). It is a *recorder*, deliberately conservative: it omits anything uncertain. It never invents a direction. It pairs with `improve-ui` (read-only audit; `improve-ui/SKILL.md:51-61` three proofs: contract, runtime, correction; stops at three findings, `:78`).

Caveat: it runs `npx @google/design.md ...`, i.e., it pulls an npm package at run time. The spec is marked `alpha`. The repo also ships a content library of 18 brand DESIGN.md files (`ibelick_ui-skills/src/content/design-md/*.md`), part of the website and not installed with the skills.

### 0.4 Which gives "cross-session consistency"?

- Format with the most machine-checkable guarantees: ibelick `create-design-md` + `@google/design.md` (lint, export to Tailwind/DTCG, diff). Records, does not design.
- Format with the best human-meaning-per-line for an agent building new screens: Dammy's `system.md` (rationale column, concrete component dimensions), and it also comes bundled with a *method that produces the decisions* (domain exploration, signature, checks). Weakest enforcement.
- Format built for a closed loop: Stitch (`DESIGN.md` + `SITE.md` + baton + server-side design system). Strongest persistence, but only inside the Stitch MCP world; `extract-design-md` is the portable piece.
- Neither emil nor jakub produces a persisted artifact. Jakub's `better-interface` *consumes* one: "read what the project has written about its own interface: `CONTRIBUTING.md`, `CODING_STANDARDS.md`, `AGENTS.md`, `CLAUDE.md`, a design-system doc" and "A documented convention settles matters of taste" (`jakubkrehel_skills/skills/better-interface/SKILL.md` "Recon before judgment").
- Recommendation (inference, not verified in any of these repos): the differentiator is not which file format, it is *forcing the read*. Whatever file is chosen, reference it from the project's CLAUDE.md/AGENTS.md so it loads without the skill triggering. Jakub's own `CLAUDE.md` demonstrates the `@AGENTS.md` import pattern (`jakubkrehel_skills/CLAUDE.md:5`). A lint step (only ibelick has one) is the other half.

---

## 1. emilkowalski/skills

### 1.1 Architecture and context cost
- 15 skills in `skills/*/SKILL.md`. Relevant: `emil-design-eng` (the flagship), `review-animations` (+`STANDARDS.md`), `break-ui` (+`CATALOG.md`), `animate` (+`RECIPES.md`), `apple-design`, `mobile-native`, `animation-performance`, `improve-animations` (+`AUDIT.md`, `PLAN-TEMPLATE.md`), `find-animation-opportunities`, `animation-vocabulary`, `prototype`, `pick-ui-library`, `ask-sonner`, `write-swift`, `animate-expo`.
- `emil-design-eng/SKILL.md` is 674 lines / 27 KB, about 6.8K tokens, all loaded on trigger (no reference split). `review-animations` 120 lines (8.4 KB, about 2.1K tokens) + `STANDARDS.md` 187 lines (9.8 KB, about 2.5K tokens, on demand, loaded "whenever a finding needs a precise value", `review-animations/SKILL.md:25`). `break-ui` 175 lines (14.4 KB, about 3.6K) + `CATALOG.md` 135 lines (8.3 KB, about 2.1K, loaded in Phase 2, `break-ui/SKILL.md:60`).
- Heavy duplication: `STANDARDS.md` is a compressed copy of `emil-design-eng`; `animate/SKILL.md` repeats the curves/duration tables (`animate/SKILL.md:98-142`); `review-animations` repeats the same ten rules again (`:27-49`). Loading two skills for one task roughly doubles the same facts.
- Only 3 of 15 are `disable-model-invocation` (`review-animations`, `prototype`, `pick-ui-library`). The other 12 descriptions are long (most 300-600 chars; roughly 6.8 KB total by a rough count), so the always-loaded cost of the full pack is the highest of my six.

### 1.2 Method imposed
- Canned first response: "When this skill is first invoked without a specific question, respond only with: > I'm ready to help you build interfaces that feel right..." (`emil-design-eng/SKILL.md:8-14`; same line in nearly every skill). If the harness loads the skill with no question, the agent emits a greeting and stops.
- Decision framework before code: "Before writing any animation code, answer these questions in order: 1. Should this animate at all? 2. What is the purpose? 3. What easing? 4. How fast?" (`emil-design-eng/SKILL.md:62-135`). `animate` makes it a hard rule: "Steps 1 and 2 gate everything... The gate below exists to produce zero lines of code sometimes. That's a success, not a dodge." (`animate/SKILL.md:25-31`).
- Review posture: "Default to flagging. Approval is earned, not assumed." (`review-animations/SKILL.md:21`), ten non-negotiable standards (`:27-49`), a remedial hierarchy that puts deletion first (`:70-82`), required `Before | After | Why` table (`:84-115`), Block/Approve verdict (`:110-113`).
- `break-ui`: six phases (map surface, build worst-case, wire a Demo/Worst-case toggle, break, report-and-stop, fix on request; `break-ui/SKILL.md:38-137`), "Report before fixing" (`:35`), "Plausible or schema-backed, never random" (`:31`).
- `animate/SKILL.md:30`: "Never present motion options as a menu. Make the call, state the reasoning in one line, write the code."

### 1.3 Load-bearing rules and values
1. Frequency gate: 100+/day (keyboard shortcuts, command palette) = no animation; tens/day = remove or reduce; occasional = standard; rare = delight (`emil-design-eng/SKILL.md:66-79`; `STANDARDS.md:5-16`).
2. Easing decision: enter/exit `ease-out`; on-screen move `ease-in-out`; hover/color `ease`; constant `linear`; default `ease-out` (`emil-design-eng/SKILL.md:95-106`).
3. Custom curves: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` (`:110-119`). "Never use ease-in for UI animations" (`:121`).
4. Durations: press 100-160ms; tooltip/small popover 125-200ms; dropdown/select 150-250ms; modal/drawer 200-500ms; "UI animations should stay under 300ms" (`:125-135`).
5. Press feedback `transform: scale(0.97)` on `:active`, range 0.95-0.98, `transition: transform 160ms ease-out` (`:199-213`).
6. Never `scale(0)`; start `scale(0.9+)`/`0.95` + `opacity: 0` (`:215-232`).
7. Origin-aware popovers `transform-origin: var(--transform-origin)`; modals stay centered (`:234-243`).
8. Tooltips: delay first, then instant (no animation, `transition-duration: 0ms`) for adjacent ones; 125ms, `scale(0.97)` (`:247-267`).
9. Transitions, not keyframes, for interruptible UI (`:269-288`).
10. Blur to mask a crossfade: `filter: blur(2px)`, keep blur under 20px (`:290-317`).
11. `@starting-style` for entry animation (`:319-336`).
12. Springs: `{ type: "spring", duration: 0.5, bounce: 0.2 }`; bounce 0.1-0.3, "avoid bounce in most UI" (`:177-191`).
13. Stagger 30-80ms between items, 8px translateY, 300ms (`:603-635`).
14. Momentum dismissal at velocity > ~0.11 (`:443-452`).
15. Only `transform`/`opacity`; Framer Motion `x/y/scale` shorthands aren't hardware-accelerated, use the full `transform` string (`:479-505`).
16. `prefers-reduced-motion`: gentler, not zero; gate hover with `@media (hover: hover) and (pointer: fine)` (`:527-555`).
17. Asymmetric timing: slow where user decides (2s linear hold), fast on release (200ms ease-out) (`:587-601`).
18. `break-ui` failure signatures table: `min-width: 0` on flex text, `flex-shrink: 0` on avatars, `overflow-wrap: anywhere`, `Intl.PluralRules`, `tabular-nums`, middle-truncate filenames (`break-ui/SKILL.md:95-125`); worst-case value catalog (`break-ui/CATALOG.md`).
19. `apple-design`: translucent chrome `backdrop-filter: blur(20px) saturate(180%)` with a bright top edge; large text tracking `-0.02em`, `line-height: 1.05`, `clamp(2rem, 5vw, 4rem)` (`apple-design/SKILL.md:190-195,238-245`); default spring `damping 1.0, response 0.3-0.4` (Quick Reference).
20. `mobile-native` baseline: viewport meta incl. `viewport-fit=cover`, `-webkit-tap-highlight-color: transparent`, inputs `16px`, `touch-action: manipulation`, all `:hover` inside a hover media query (`mobile-native/SKILL.md:246-278`).

### 1.4 Weaknesses
- **Almost no static visual design.** README says it: "mostly animation, but also some design advice" (`README.md` Reference list). No type scale, spacing scale, color system, radius, layout. It cannot make a screen *look* good, only *feel* good. The only static values are blur and `apple-design`'s type/material notes.
- Bloat and duplication (see 1.1). Canned greeting can swallow a turn. 12 auto-triggerable skills crowd the skill list.
- "Default to flagging" review posture encourages false positives; it conflicts with Jakub's "evidence, not taste" and Dammy's "taste, not defect" filter.
- Opinionated single-author numbers presented as law (e.g., "never exceed 300ms", "Raycast has no animation"). Reasonable but unvalidated; ibelick caps at 200ms, Jakub allows 300ms enters.
- Heavy Base UI/Motion/Sonner coupling in examples (`var(--transform-origin)`, `data-starting-style`).
- Overlap with others: motion rules duplicate Jakub `better-ui`, Dammy "Polish & Motion", ibelick `fixing-motion-performance`.

### 1.5 Scores (0-10)
| skill/pack | concreteness | method | breadth | context cost (10=cheap) | style neutrality |
| --- | --- | --- | --- | --- | --- |
| emil-design-eng | 9 | 5 | 3 | 3 | 7 |
| review-animations (+STANDARDS) | 8 | 8 | 2 | 6 | 7 |
| break-ui (+CATALOG) | 8 | 9 | 3 | 5 | 10 |
| whole pack (15 skills) | 8 | 7 | 4 | 3 | 7 |

Verdict. Best-in-set source of exact motion numbers, and `break-ui` is a genuinely unique, well-designed robustness workflow (the only skill in my set that stress-tests with realistic worst-case data). It is the wrong tool to make UI beautiful: there is no visual vocabulary. Take `break-ui` and the numbers in `STANDARDS.md` (as a cheap on-demand reference), skip the rest of the 674-line body. Tag line: motion specialist, not a design system.

---

## 2. jakubkrehel/skills (plugin `interfaces`, v1.13.2)

### 2.1 Architecture and context cost
- 14 skills (`skills/*/SKILL.md`, 1,689 lines of SKILL bodies). Two shapes by design: "domain" skills hold knowledge (`better-ui`, `better-typography`, `better-colors`, `better-layout`, `better-accessibility`, `better-writing`) and "verb" skills hold procedure (`better-interface`, `interface-review`, `variant`, `break`, `state-machine`, `explain-interface`, `build-design`; `AGENTS.md:17`). `technical-drawing` is unrelated to UI.
- Strong progressive disclosure: each domain SKILL.md is 7.7-12.3 KB (about 2-3K tokens) with principles + a detection table; recipes live in sibling files linked from the exact principle that needs them (`AGENTS.md:31`: "Link each one from the principle that needs it, so the link sits where the agent lands"). Reference payload on demand: ui 32 KB, typography 29 KB, colors 38 KB, layout 18 KB, a11y 36 KB.
- Descriptions are deliberately short, one or two plain sentences, no trigger lists: "It loads on every turn, so it earns harder pruning than the body" (`AGENTS.md:94`). Total about 2.3 KB for all 14, the cheapest always-loaded cost of the multi-skill packs.
- Worst case: `better-interface` instructs "Load every owning skill below and complete each domain review before consolidation" (6 domains) = about 60 KB of SKILL bodies, about 15K tokens, plus references (`better-interface/SKILL.md` "Use domain skills as the sources of truth"). It is a review mode, not the build path.
- 5 verb skills are user-invoked only (`disable-model-invocation: true`, `AGENTS.md:51`): `interface-review`, `variant`, `break`, `state-machine`, `explain-interface`.

### 2.2 Method imposed
- Calibration first: each skill says how hard to press. "The values below are exact, not ranges to approximate. `cubic-bezier(0.2, 0, 0, 1)` is not `cubic-bezier(0.4, 0, 0.2, 1)`, and `0.96` is not `0.95`" (`better-ui/SKILL.md:12`); "Some values here are exact... Letter-spacing, pairing and scale ratios are heuristics. Report them only where they break the project's own scale" (`better-typography/SKILL.md:14-16`).
- "Evidence, not taste... A trigger is a failure whatever the style guide says. A density, radius or voice you merely disagree with is not a finding." (`better-interface/SKILL.md` "Evidence, not taste").
- Review procedure: resolve scope, recon (framework, tokens, docs), load domain skills in fixed order (a11y, layout, writing, typography, colors, ui "so foundational failures are not hidden by polish"), require `path:line` evidence, severity HIGH/MED/LOW with 13 escalation triggers, "Prefer the cheaper fix: Delete, Use the platform, Reuse what the project has, Correct the value, Add", consolidate to max 15 findings, verify, read-only by default.
- Per-domain "Before you finish" detection tables (grep-able patterns) and a `Reporting` block with Block/Approve verdict.
- `variant`: three different-answer variants behind a picker on one axis (Structure/Density/Emphasis/Type/Voice), each clearing the accessibility floor (`variant/SKILL.md`).
- `build-design`: build from Figma/image mapping onto existing tokens (`build-design/SKILL.md`).
- Convention in the repo itself: no em dashes, no serial comma, "No sentence over 30 words", "A sentence that cannot be restated as an instruction, a fact, or a number is cut" (`AGENTS.md:98-106`).

### 2.3 Load-bearing rules and values
1. Concentric radius: `outerRadius = innerRadius + padding + borderWidth`; stop past 24px padding (`better-ui/SKILL.md:18-20`; `surfaces.md:5-29`).
2. Optical alignment: icon side 2px less padding (`padding-inline: 16px 14px`); play triangle `translateX(2px)` (`surfaces.md:47-82`).
3. Shadow ring tokens, light: `0 0 0 1px oklch(0 0 0/.06), 0 1px 2px -1px oklch(0 0 0/.06), 0 2px 4px 0 oklch(0 0 0/.04)`; hover `.08/.08/.06`; dark: single `0 0 0 1px oklch(1 0 0/.08)`, hover `.13`; keep `border: 1px solid transparent` for forced-colors (`surfaces.md:94-139`; `better-ui/SKILL.md:26-30`).
4. Image outline `1px`, offset `-1px`, `oklch(0 0 0/.1)` light, `oklch(1 0 0/.1)` dark; never tinted (`better-ui/SKILL.md:32-34`; `surfaces.md:141-165`).
5. Press scale `0.96`, `150ms`, `ease-out`, never on disabled (`better-ui/SKILL.md:40-42`).
6. Staged entrance: chunks staggered `100ms`; each `opacity`, `blur(4px)`, `translateY(12px)`, `300ms ease-out`; exit `150ms`, `-12px`, blur 4px (`better-ui/SKILL.md:54-60`; `enter-exit.md:1-50`).
7. Icon swap crossfade: scale `0.25 -> 1`, opacity, blur `4px -> 0`; spring `{duration: 0.3, bounce: 0}`; no-library fallback `300ms cubic-bezier(0.2, 0, 0, 1)` (`better-ui/SKILL.md:66-68`).
8. Icon stroke tracks text weight: 400 -> 1.5px, 500-600 -> 2px, 700 -> 2.5px, as *rendered* pixels (`icons.md:5-12`; `better-ui/SKILL.md:92-94`).
9. Type roles: Display 36px/1.1/600, Title 24px/1.2/600, Heading 18px/1.3/600, Body 16px/1.5/400, Caption 13px/1.4/400; emphasis is one weight step, not size (`better-typography/spacing-and-sizing.md:14-38`).
10. Line-height unitless: display 1.1, headings 1.2-1.3, body 1.5-1.6; wrapping text at least 1.4 (`better-typography/SKILL.md:44-48`). Tracking: headings 24px+ at `-0.01` to `-0.02em`, uppercase labels at `0.05em`, body `0` (`:50-54`). Measure 60-75ch (`:56-58`). Weight 400+ under 18px; 100-300 only at 28px+ (`:20-22`).
11. `text-wrap: balance` headings, `pretty` paragraphs (never balance on paragraphs); `tabular-nums` on changing values; inputs 16px on iOS; font smoothing once on root (`:60-71,91-108`).
12. Size floors: body 16px, inputs/menus 14px, captions 13px, rarely under 12px, in `rem` (`:100-104`).
13. Color: one neutral + one accent + only used status ramps; each step has a role; primitives named by hue never applied in components, semantic tokens by role; hold hue across the ramp in OKLCH; status hue at least 15 degrees from accent; one primary filled action per view with color on the background (`better-colors/SKILL.md:20-48`; `palette-structure.md:5-30`).
14. Contrast thresholds WCAG AA 4.5/3, plus APCA Lc 75 body, 60 labels, 45 large, 30 icons; "Measure the rendered pair" and never estimate (`better-colors/contrast.md:3-30`; `SKILL.md:50-52`).
15. Layout: group with space first, gap between groups at least 2x the gap within; 12px between bordered controls, 24px between borderless glyphs; peek 16-32px for scrollable content; inset buttons 16px; breakpoints from content; `minmax(0,1fr)`, `100dvh` (`better-layout/SKILL.md:14-16,40-50,58-64,72-76`; `spacing-and-adaptivity.md:3-60`).
16. Hit areas: WCAG AA 24px floor; aim 44px touch / 40px desktop where density allows; expand via pseudo-element on the wrapper (`better-accessibility/SKILL.md:46-52`; `hit-areas.md:3-45`).
17. Hover only under `@media (hover: hover)`; `overscroll-behavior: contain` on overlays; transitions name exact properties, never `all`; `will-change` named and temporary (`better-ui/SKILL.md:76-90`).
18. Focus: style `:focus-visible`; custom ring needs 3:1; keep browser default where possible; never `outline: none` without replacement (`better-accessibility/SKILL.md:26-32`).

### 2.4 Weaknesses
- It polishes and audits; it does not generate a design direction. Nothing says which typeface, palette, layout archetype, or personality to pick ("Never propose a new typeface... unless the task asks", `better-typography/SKILL.md:16`). Output will be clean and consistent but can still be bland. Good complement to a direction-giving skill, not a substitute.
- Review-heavy: 7 of 14 skills are review/procedure; the builder-side value is concentrated in the six domain skills.
- Breadth costs tokens when used as designed (about 15K tokens for `better-interface`). The repo is also the most self-documented, so its meta-rules (AGENTS.md) are repo maintenance, not agent value.
- Some numbers are asserted without justification (0.96 vs Emil's 0.97; 100ms stagger). They are presented as "exact", which will conflict with other installed skills.
- `technical-drawing` and `explain-interface` are out of scope noise if the whole pack is installed (about 7 skills' descriptions, small).
- Overlap: motion with Emil; shadows/outlines/concentric radius/tabular-nums/wrap are *identical values* to Dammy's polish section (see 4.3), suggesting a shared lineage.

### 2.5 Scores
| skill/pack | concreteness | method | breadth | context cost | style neutrality |
| --- | --- | --- | --- | --- | --- |
| better-ui | 10 | 8 | 4 | 7 | 8 |
| better-typography | 9 | 8 | 4 | 7 | 8 |
| better-colors | 8 | 8 | 4 | 7 | 9 |
| better-layout | 8 | 8 | 4 | 8 | 9 |
| better-interface (orchestrated) | 8 | 9 | 8 | 3 | 8 |
| whole pack (14) | 9 | 9 | 8 | 6 | 8 |

Verdict. The best-engineered pack in this group and the most reusable: exact values, honest labels on what is exact vs heuristic, progressive disclosure done properly, short descriptions, and a severity/evidence discipline that resists taste-policing. Install `better-ui`, `better-typography`, `better-colors`, `better-layout` (and `better-accessibility`) as the knowledge layer, and run `better-interface` only for review passes. Its gap is aesthetics: it makes UI correct and polished but does not choose a direction, so pair it with something that does.

---

## 3. ibelick/ui-skills

### 3.1 Architecture and context cost
- The repo is an Astro website (registry, CLI `ui-skills`, tests, auth, D1 migrations). Installable content is `skills/` only: 8 SKILL.md, 1,035 lines total. `ui-skills-root` is a router that calls `npx ui-skills start|categories|list|get <slug>` to fetch other skills (`ui-skills-root/SKILL.md:22-39`). `AGENTS.md:19-21` says skills are added to `src/data/registry.ts` pointing at *other publishers' repos*, so the CLI is a registry of third-party skills. Treat `npx ui-skills get` as runtime-fetched, unreviewed instructions (inference from AGENTS.md and the skill text; I did not read `bin/ui-skills.ts`).
- Tiny and cheap: `baseline-ui` 3.4 KB (about 0.85K tokens), `fixing-motion-performance` 5.6 KB, `fixing-accessibility` 4.7 KB, `improve-ui` 7.8 KB + 1 reference, `create-design-md` 16.2 KB. All descriptions short (about 2.1 KB total).
- No reference trees (except `improve-ui/references/plan-template.md`).

### 3.2 Method imposed
- `baseline-ui`: no method, a flat RFC-2119 list: MUST/SHOULD/NEVER (`baseline-ui/SKILL.md:21-85`). Two modes: apply to the conversation, or `/baseline-ui <file>` -> violations (quote the line), why (one sentence), fix (`:10-19`).
- `fixing-motion-performance`: priority table (never patterns, mechanism, measurement, scroll, paint, layers, blur, view transitions, tool boundaries), same quote-line report (`:38-120`). "Do not migrate animation libraries unless explicitly requested" (`:21`).
- `improve-ui`: audit against the product's *own* evidence: three proofs (contract, runtime, correction), falsify each candidate, stop at three findings, then ask which to turn into self-contained plans under `design-plans/`; "Never modify product source" (`improve-ui/SKILL.md:8-16,51-78`).
- `create-design-md`: see 0.3.

### 3.3 Load-bearing rules and values
1. Stack: Tailwind defaults, `motion/react`, `tw-animate-css`, `cn` (clsx + tailwind-merge) (`baseline-ui/SKILL.md:23-26`).
2. Accessible primitives (Base UI, React Aria, Radix) for anything with keyboard/focus; never mix primitive systems per surface; `aria-label` on icon-only buttons; AlertDialog for destructive actions (`:30-39`).
3. `h-dvh` not `h-screen`; respect `safe-area-inset` (`:41-42`).
4. "NEVER add animation unless it is explicitly requested"; "NEVER exceed 200ms for interaction feedback"; "NEVER introduce custom easing curves unless explicitly requested"; compositor props only (`:48-56`).
5. Pause looping animations off-screen; avoid animating large blur/backdrop-filter (`:54,73`).
6. Typography: `text-balance` headings, `text-pretty` body, `tabular-nums` for data, "NEVER modify `letter-spacing`" (`:61-64`).
7. Fixed z-index scale; `size-*` for squares (`:68-69`).
8. "NEVER use gradients unless explicitly requested", no purple/multicolor gradients, no glow as primary affordance, Tailwind default shadow scale, one accent per view, empty states get one clear next action (`:79-84`).
9. Motion perf glossary: composite = transform/opacity; paint = color, borders, gradients, filters; layout = size/position (`fixing-motion-performance/SKILL.md:32-36`); blur animation <= 8px (`:103`); FLIP for layout-like effects (`:75,135-143`).
10. `improve-ui` proof gate: findings only when contract + runtime + one correction exist; "prefer no finding to an unsupported one" (`improve-ui/SKILL.md:8,51-61`).
11. `create-design-md`: flat token names matching `^[a-zA-Z0-9][a-zA-Z0-9-]*$`, typography as named mappings (`fontFamily`, `fontSize`, `lineHeight`, `fontWeight`, `letterSpacing`), export target by Tailwind version, lint + export + diff gates (`create-design-md/SKILL.md:109,125-140,218-242`).

### 3.4 Weaknesses
- `baseline-ui` rules are very blunt and some are actively harmful to "beautiful": "NEVER add animation unless explicitly requested", "NEVER modify letter-spacing", "NEVER use gradients", "NEVER introduce custom easing". These produce a deliberately flat, safe, Tailwind-default UI, the opposite of Emil/Dammy/Apple guidance on tracking and curves.
- Stack-prescriptive (Tailwind + motion/react + Base UI + `cn`) and React-biased.
- No scales, no values for radius, type, color, spacing. It's a lint list, not a design guide.
- `improve-ui` and `create-design-md` are rigorous but conservative by design: they refuse to propose design ("Do not invent brand personality", `create-design-md:203`). Great for governance, not for creating a look.
- The rest of the repo (website, auth, CLI) is irrelevant to an agent install; the registry/CLI indirection adds supply-chain surface.

### 3.5 Scores
| skill | concreteness | method | breadth | context cost | style neutrality |
| --- | --- | --- | --- | --- | --- |
| baseline-ui | 5 | 3 | 3 | 10 | 4 |
| fixing-motion-performance | 7 | 5 | 2 | 9 | 9 |
| improve-ui | 4 | 9 | 3 | 8 | 10 |
| create-design-md | 7 | 9 | 3 | 6 | 9 |
| whole pack | 5 | 6 | 3 | 9 | 6 |

Verdict. Cheap and disciplined, but it is a deslop lint and governance toolkit, not a design source. The single standout is `create-design-md` (+ `improve-ui`): the only validated, tool-checked persistence workflow in my set. Skip `baseline-ui` for a "beautiful" goal because several of its NEVERs fight good design; reconsider only if you want a restrained, accessible default.

---

## 4. Dammyjay93/interface-design

### 4.1 Architecture and context cost
- One skill (`.claude/skills/interface-design/SKILL.md`, 320 lines, 29.6 KB, about 7.4K tokens) loaded whole on trigger, plus two slash commands (`design-review` 132 lines / 10.9 KB, `design-deslop` 64 lines / 7.5 KB, loaded only when invoked). No reference tree inside the skill. `reference/` (template + 2 example systems, 1.3 KB + 2) sits outside the skill dir and is never linked (see 0.1).
- Description is long but single (about 600 chars). Scope is explicit and narrow: "Dashboards, admin panels, SaaS apps, tools, settings pages... Not for: Landing pages, marketing sites" (`SKILL.md:12-14`). Last push 2026-06-20 (inventory).

### 4.2 Method imposed
Phased and heavy. Quotes:
- "You will generate generic output... intent lives in prose, but code generation pulls from patterns" (`:22-24`); "If another AI, given a similar prompt, would produce substantially the same output, you have failed" (`:26`).
- Intent first: who is this human, what must they accomplish, what should it feel like; "'Clean and modern' means nothing" (`:43-53`).
- Domain exploration: "Produce all four before proposing any direction": Domain (5+), Color world (5+), Signature (one element only this product could have), Defaults (3 obvious choices to reject) (`:57-68`).
- Render it when you can: show swatches/type/specimen via a visualize tool if present (`:72-89`).
- "Before Writing Each Component... **Every time** you write UI code — even small additions — state: Intent / Hierarchy / Palette / Depth / Surfaces / Typography / Spacing... This checkpoint is mandatory" (`:156-170`).
- Use What Exists: native -> headless primitive -> hand-roll (`:174-189`).
- Suggest + Ask block, confirm direction, build, run 4 checks (Swap, Squint, Signature, Token tests; `:274-297`), then offer to save system.md (`:301-311`).
- `design-review`: 5-step procedure with lenses A-F, Blocker/Should-fix/Note, false-positive filter ("Taste, not defect"), explicit approval bar and presumptive blockers (`commands/design-review.md`). `design-deslop`: Pass 1 squint (focal point, flat hierarchy, monotone layout, timid color, borders doing the work of space), Pass 2 diff-scoped scan, and an explicit "What is NOT slop" section (`design-deslop.md`).

### 4.3 Load-bearing rules and values
1. One focal point per view; demote the rest (`:97-99`).
2. Type scale is a ratio: ~1.2 dense, ~1.25 most product UI, ~1.333 expressive; 14px base at 1.25: `caption 11, body 14, h4 16, h3 18, h2 22, h1 28, display 44+` (`:103`).
3. Weight and color do more hierarchy work than size; one 14px size holds three tiers: `600/primary`, `500/secondary`, `400/muted` (`:105`). Worked metric: `REVENUE` 11px/500/muted/tracked; `$48,200` 28px/600/tabular-nums; delta 12px/500/success (`:107`).
4. Density is a decision: tool panel 12-16px padding vs 24px brochure (`:111`). Proportions state relationships: 280px sidebar vs 360px (`:119`).
5. 60/30/10; one accent about 10% (`:123-124`). Optical sizing: tighten tracking on large type, body line-height about 1.5 (`:126`).
6. Surface elevation: a few percentage points per level; dark mode base -> +7% -> +9% -> +12%; light mode adds shadow instead (`:136`). Sidebar same background as canvas; popovers one level above parent; inputs slightly *darker* (`:138-140`).
7. Borders low-opacity rgba, dark `rgba(255,255,255,0.06-0.12)`, light slightly higher; progression of standard/soft/emphasis/focus (`:142`).
8. Four-level text ramp (primary, secondary, tertiary, muted); base unit 4 or 8px, multiples only; symmetric padding (`:198-200`).
9. Depth: choose ONE of borders-only / subtle shadows / layered shadows / surface shifts and don't mix (`:201`). Radius as a scale: small inputs/buttons, medium cards, large modals (`:202`). Dark mode: lean on borders, desaturate semantics, one hue (`:204`).
10. Concentric radius, `tabular-nums`, optical alignment (icon side padding about text side - 2px), 44px hit areas (40 min) via pseudo-element, never overlap hit areas (`:214-218`).
11. Light-mode shadow `0 0 0 1px rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06), 0 2px 4px rgba(0,0,0,.04)`; dark `0 0 0 1px rgba(255,255,255,.08)` (`:219`). Image outline `rgba(0,0,0,0.1)` / `rgba(255,255,255,0.1)` never tinted (`:222`). `text-wrap: balance`/`pretty`; `-webkit-font-smoothing: antialiased` (`:220-221`). (These are the same values as Jakub's `surfaces.md`.)
12. Motion: no animation for 100+/day actions; durations 100-160 button, 125-200 tooltip, 150-250 dropdown, 200-500 modal; `cubic-bezier(0.23, 1, 0.32, 1)`; `scale(0.97)` press, never below 0.95; never from `scale(0)`; origin-aware popovers; transform/opacity only; stagger 30-80ms (`:228-236`). (Same numbers as Emil.)
13. Token names should evoke the product's world: `--ink`, `--parchment`, not `--gray-700` (`:37`).
14. Use semantic tokens, not hardcoded literals; extract a component on the second real reuse (`:186-189`).
15. Avoid list incl. "Gradients and color for decoration", multiple accents, mixed depth strategies, "Default typography — system/Inter fonts and size-only hierarchy where a direction was set" (`:240-255`).
16. States: default/hover/active/focus/disabled + loading/empty/error (`:217`).
17. Approval bar and presumptive blockers (no focal point, size-only type, monotone layout, timid palette, harsh surfaces, missing states, structural hacks; `commands/design-review.md` Approval Bar).

### 4.4 Weaknesses
- **Monoculture risk.** Anchors on "Linear, Vercel, Stripe, Apple" (`:8`): subtle low-opacity borders, near-invisible elevation, a single restrained accent, system/Geist/Inter type, small radii. That yields the "tasteful SaaS dashboard" look. It explicitly disclaims marketing/landing/brand work.
- Heavy ceremony: mandatory 7-line checkpoint for *every* component, plus domain/color-world/signature/rejected-defaults before any direction. That is expensive tokens and latency for small edits, and the "Signature test: point to five specific elements" invites decorative fluff.
- Mixed content: about 40% of the body is polish/motion copied from other sources (Emil's curve and durations, Jakub's shadow ring), so overlap is large; the unique value is the Intent / Domain / Signature / Checks method and the system.md loop.
- Persistence is soft (0.1): orphaned template, no schema, no enforcement, user-gated writes.
- Scope disclaimer pushes landing pages elsewhere, so it won't cover marketing UI.
- Several visual claims are asserted as universal (sidebar must share canvas background; inputs must be darker). Fine for dark-mode dashboards, wrong for many light UIs.

### 4.5 Scores
| item | concreteness | method | breadth | context cost | style neutrality |
| --- | --- | --- | --- | --- | --- |
| interface-design skill | 7 | 8 | 6 | 4 | 5 |
| design-review command | 6 | 9 | 5 | 6 | 6 |
| design-deslop command | 6 | 8 | 4 | 7 | 6 |

Verdict. The best *method* in the group for producing a deliberate, product-specific app UI, and the only one that closes the loop from decisions to a reusable system file with rationale. It carries real values (type ratio, tiering, surface lift, borders, shadow, motion) and a strong "decide, don't default" discipline with named tests. Costs: 7.4K tokens whenever it fires, a house style (Linear-ish), and a persistence story that relies on obedience. Strongest candidate here for a "design for beauty and consistency" install if scoped to product UI, provided system.md is also wired into CLAUDE.md.

---

## 5. google-labs-code/stitch-skills (`design-md` and neighbors)

### 5.1 Architecture and context cost
- 16 skills in 3 plugins: `stitch-design` (generate-design, extract-design-md, manage-design-system, code-to-design, extract-static-html, upload-to-stitch), `stitch-build` (react-components, react-native, remotion, shadcn-ui, react-vite-dashboard), `stitch-utilities` (design-md, taste-design, stitch-loop, enhance-prompt, site-md). Descriptions about 5.3 KB total by rough count.
- Most skills need the Stitch MCP and credentials ("These skills require the Stitch MCP server", README Prerequisites). Exceptions usable without Stitch: `extract-design-md` (reads source), `taste-design` (generates a DESIGN.md from rules), `site-md`, `shadcn-ui`.
- `design-md`: 172 lines / 7.7 KB (about 1.9K tokens); `examples/DESIGN.md` 154 lines on demand. `extract-design-md`: 365 lines / 14 KB (about 3.5K tokens) + framework references. `taste-design`: 191 lines / 12.6 KB (about 3.1K) + `resources/DESIGN.md` (124 lines).

### 5.2 Method imposed
- `design-md`: "You are an expert Design Systems Lead" (`:13`). Retrieval via MCP (6 steps), synthesis in 5 steps, "Use descriptive design terminology and natural language exclusively" and "Include exact hex codes for colors while using descriptive names" (`:90-93`), pitfalls list (`:166-172`).
- `extract-design-md`: Phase 1 discovery (detect stack, map tree, read framework reference), Phase 2 deep extraction by dimension with grep targets, Phase 3 write `.stitch/DESIGN.md` with mandatory YAML, Phase 4 optional upload, quality checklist (`:51-343`). Tips: theme files beat component styles; read comments for intent.
- `taste-design`: author-set dials (Creativity 9, Density 5, Variance 8, Motion 6; `:39`) and a long list of bans (see below).
- `stitch-loop`: baton protocol, read `next-prompt.md` -> consult SITE.md/DESIGN.md -> generate -> integrate -> optional Chrome verify -> write next baton (`stitch-loop/SKILL.md:59-120`).

### 5.3 Load-bearing rules and values
1. DESIGN.md sections: Atmosphere, Color Palette & Roles (name + hex + role), Typography Rules, Component Stylings, Layout Principles, (6) Stitch Generation Notes (`design-md/SKILL.md:95-117`; `extract-design-md/SKILL.md:283-317`).
2. Shape vocabulary: `rounded-full` pill; `rounded-lg` subtly rounded; `rounded-none` sharp (`design-md/SKILL.md:79-83`); in `generate-design/references/design-mappings.md`: "Softly rounded = `rounded-xl` (12px) or `rounded-2xl` (16px)"; depth words Flat / Whisper-soft / Floating / Inset.
3. Worked example values: bg `#FCFAFA`, accent `#294056`, text `#2C2C2C`/`#6B6B6B`, Manrope; H1 600 / 0.02em / 2.75-3.5rem, body 1.7 line-height; button radius 8px, card 12px, hover shadow `0 2px 8px rgba(0,0,0,0.06)`, nav uppercase 0.06em, max width 1440px, gutters 24/32px, section margins 5-8rem, 44x44 touch targets, 12-col grid, 4/3/2/1 product-grid columns (`examples/DESIGN.md:21-127`).
4. `taste-design` color rules: max 1 accent, saturation < 80%, AI purple/blue neon banned, no pure `#000000` (use Zinc-950/charcoal), one palette (no warm/cool gray fluctuation) (`taste-design/SKILL.md:44-49`).
5. `taste-design` type: Inter banned for premium contexts (use Geist, Outfit, Cabinet Grotesk, Satoshi); generic serifs banned; serif banned in dashboards; mono for numbers when density > 7; body max 65ch (`:51-57`).
6. `taste-design` layout bans: centered hero when variance > 4, 3-equal-card feature row, `h-screen` (use `min-h-[100dvh]`), `calc()` percentage hacks, text overlapping images (`:59-82`).
7. `taste-design` motion: spring `stiffness 100, damping 20`, "Perpetual Micro-Interactions: Every active component should have an infinite loop state", staggered cascades, transform/opacity only (`:94-98`).
8. `taste-design` anti-pattern list: no emojis, no neon glow, no custom cursors, no generic names ("John Doe", "Acme"), no fake round numbers (`99.99%`), no fabricated metrics, no `LABEL // YEAR` labels, no AI-copy clichés (`:100-120`).
9. `extract-design-md`: dedupe near-duplicates (`#333` vs `#2C2C2C`), group colors by function not hue, consult theme/tokens first (`:163-178`, Tips).
10. Persistence/consumption patterns: see 0.2.

### 5.4 Weaknesses
- `design-md` is Stitch-coupled at both ends: retrieval needs Stitch MCP; the output is written *for Stitch's prompt interpreter* ("Stitch interprets design through 'Visual Descriptions'", `:17`), and the example tells the reader to avoid code values in prompts. For a coding agent writing CSS this is lossy: "Whisper-soft diffused shadow" is not a shadow token. Hex/px survive only as parentheses.
- It captures an existing design; it does not tell an agent how to design well. Almost no rules of craft.
- Two incompatible DESIGN.md dialects in one repo (0.2) plus a third official spec (ibelick).
- `taste-design` is the loudest house style in the whole set (Geist/Satoshi only, anti-Inter, no centered hero, "perpetual" motion), and directly contradicts Emil's frequency rule. Its dials default to Creativity 9 / Variance 8, which biases toward editorial/portfolio output and is wrong for apps ("Serif always BANNED in dashboards" is the only dashboard concession).
- Skill set is vendor-gravity: most value only realized inside Stitch. `allowed-tools: stitch*:*` means tool names will not resolve without the MCP.
- `design-md` has "Common Pitfalls" with emoji marks and cargo-cult adjectives ("Ocean-deep Cerulean"); the example reads like the very AI copy `petergyang/no-ai-slop` would cut.

### 5.5 Scores
| skill | concreteness | method | breadth | context cost | style neutrality |
| --- | --- | --- | --- | --- | --- |
| design-md | 4 | 5 | 2 | 8 | 6 (format neutral, Stitch-coupled) |
| extract-design-md | 6 | 8 | 3 | 5 | 8 |
| taste-design | 7 | 4 | 5 | 6 | 2 |
| stitch-loop + site-md (memory loop) | 5 | 8 | 3 | 7 | 8 |
| whole repo | 5 | 6 | 5 | 4 | 5 |

Verdict. `design-md` is a documentation recipe for Stitch, not a craft guide. The reusable piece is the *format and the loop*, not the skill: pick `extract-design-md` (portable, YAML + prose, source-driven) if you want to bootstrap a DESIGN.md from an existing repo, and treat `stitch-loop`'s baton/SITE.md as an idea, not an install. Don't install `design-md` itself unless using Stitch.

---

## 6. petergyang/no-ai-slop

### 6.1 Architecture and context cost
Single skill `skills/no-ai-slop/SKILL.md` (97 lines / 10.9 KB, about 2.7K tokens) + `eval.md` (43 lines / 3.2 KB, a 25-item pass/fail checklist run after a rewrite, `SKILL.md:95`). Plus Codex plugin packaging.

### 6.2 Method
"You are a sharp human editor. Preserve the user's point and personal voice" (`SKILL.md:8`). Two jobs: Edit (default) or Detect (name each pattern, quote the line, don't rewrite, don't guess AI authorship; `:10-14`). Workflow: read whole draft, identify point and voice traits, minimum effective edit, self-check against `eval.md`, repeat until pass, output draft + "What changed" (`:90-97`).

### 6.3 Rules
It is entirely about writing: banned words (delve, leverage, robust, elevate, seamless-type list; `:46`), empty adverbs and phrases (`:48-50`), 19 pattern types (binary contrasts, colon reveals, faux-insight setups, summary endings, fake-profound kickers; `:52-88`), em-dash policy (`:88`). Zero visual UI rules. The only design-adjacent overlap: Stitch `taste-design` bans AI copy clichés ("Elevate", "Seamless", "Unleash") and Jakub's `better-writing` covers UI copy.

### 6.4 Weaknesses and scores
Not a UI skill. For UI copy use `better-writing`. Concreteness 8 (for prose), method 8, breadth 0 for UI, cost 8, neutrality n/a.

Verdict. Out of scope for "beautiful web UI". Could be useful for README/landing copy, not for layout, type, color or motion.

---

## 7. Overlap map

- Motion numbers: Emil `emil-design-eng`/`STANDARDS.md`/`animate` = Dammy "Motion" section (same curve, same durations, same 0.97, same stagger) ~ Jakub `better-ui` (different numbers, same philosophy) ~ ibelick `fixing-motion-performance` (perf only). Install one motion source.
- Polish values: Dammy `SKILL.md:214-222` = Jakub `better-ui` (shadow ring, image outline, concentric radius, optical alignment, `balance/pretty`, tabular-nums, font smoothing). Identical numbers.
- Review format `Before | After | Why` table: Emil, Jakub, Dammy `design-deslop`, ibelick.
- Persistence: Dammy `system.md`, Stitch `.stitch/DESIGN.md`, ibelick `DESIGN.md` all compete; pick one.
- Anti-slop: Dammy `design-deslop`, ibelick `baseline-ui`, Stitch `taste-design`, plus (outside my repos) taste-skill/impeccable.

---

## 8. Cross-repo scoreboard (best skill from each repo, 0-10)

| repo / best unit | concreteness | method | breadth | context cost (10 = cheap) | style neutrality |
| --- | --- | --- | --- | --- | --- |
| emil / emil-design-eng + break-ui | 9 | 7 | 3 | 3 | 8 |
| jakub / better-* domain skills | 9 | 9 | 8 | 6 | 8 |
| ibelick / create-design-md + improve-ui | 6 | 9 | 3 | 7 | 9 |
| ibelick / baseline-ui | 5 | 3 | 3 | 10 | 4 |
| Dammy / interface-design | 7 | 8 | 6 | 4 | 5 |
| stitch / extract-design-md | 6 | 8 | 3 | 5 | 8 |
| stitch / design-md | 4 | 5 | 2 | 8 | 6 |
| stitch / taste-design | 7 | 4 | 5 | 6 | 2 |
| petergyang / no-ai-slop (for UI) | 0 | 0 | 0 | 8 | n/a |

---

## 9. Shared knowledge (rules where 3 or more of my repos agree)

Motion
- Animate only `transform` and `opacity`; never `transition: all`, name exact properties. Emil, Jakub, ibelick, Dammy, Stitch taste-design.
- Honor `prefers-reduced-motion`; replace movement with an opacity change rather than removing feedback. Emil, Jakub, Dammy, ibelick (SHOULD), Emil's `apple-design`.
- Do not animate high-frequency or keyboard-initiated actions. Emil, Jakub (`better-ui/SKILL.md:44-46`), Dammy (`:228`); ibelick is stricter (never animate unless asked).
- Use CSS transitions (retargetable), not keyframes, for state that can reverse. Emil, Jakub, ibelick (mechanism choice), Dammy (indirectly).
- Press feedback is a small scale-down, about 0.96-0.97, never below 0.95. Emil 0.97, Jakub 0.96, Dammy 0.97.
- No `scale(0)` entrances; start from about 0.95 plus opacity. Emil, Dammy (Jakub's icon swap at 0.25 with blur is the one deliberate exception).
- Gate hover effects with `@media (hover: hover)`. Emil (twice), Jakub, `mobile-native`.
- Enter faster/larger than exit: exits shorter and subtler. Emil, Jakub (150ms vs 300ms), Dammy (`:235`).

Surfaces and shape
- Nested rounded elements: outer radius = inner radius + padding. Jakub, Dammy (and Dammy's `design-review`). Emil does not state it.
- Lift via layered transparent shadow ring (1px ring + soft depths), keep borders for dividers and input outlines; dark mode collapses to a single faint white ring. Jakub, Dammy (identical values), Emil README.
- Image outline 1px, inset, pure black/white at 10% (never tinted). Jakub, Dammy (identical).
- Group with space and tone before lines; borders low-contrast. Dammy, Jakub (`better-layout`), Emil `apple-design` ("scroll edge effects, not hard dividers").
- Inputs and controls must be visually distinct from content; borderless controls need clearance. Dammy, Jakub.

Type
- Hierarchy from weight + color + size together, not size alone; emphasis = one weight step. Dammy, Jakub, `apple-design`.
- Tighten tracking on large headings (`-0.01` to `-0.02em`), body at 0, looser line-height on body (1.5). Dammy, Jakub, `apple-design`.
- `text-wrap: balance` headings, `pretty` body; `tabular-nums` on changing numbers; `-webkit-font-smoothing: antialiased` on root. Dammy, Jakub, ibelick (balance/pretty/tabular-nums), Emil `break-ui` (tabular-nums).
- Inputs at 16px on iOS to avoid zoom. Jakub, Emil `mobile-native`.
- Use `100dvh`, not `100vh`/`h-screen`. ibelick, Jakub, Emil `mobile-native`, Stitch taste-design.

Color
- One accent / one primary filled action per view; color must mean something. Dammy, Jakub, ibelick, Stitch taste-design.
- Semantic role tokens, not hardcoded literals; reuse the project's tokens. Dammy, Jakub, ibelick, Stitch.
- Roughly 4-level text ramp (primary/secondary/tertiary/muted) and one neutral hue held across surfaces. Dammy, Jakub (hold hue across ramp), Stitch taste-design (one gray family).

Process and engineering
- Use native elements / accessible primitives (Radix, Base UI, React Aria) rather than hand-rolling; match the project's existing system. Dammy, ibelick, Jakub, Emil (`pick-ui-library`).
- Real states are mandatory: hover/focus/active/disabled plus loading (skeleton), empty, error. Dammy, ibelick, Jakub, Stitch taste-design.
- Hit areas: extend with a pseudo-element, target 44px (40px desktop), never overlap. Dammy, Jakub, Stitch (44px).
- Review output as a `Before | After` table with `file:line`. Emil, Jakub, Dammy deslop, ibelick.
- Read-only audit first, fix on request. Emil (`break-ui`, `improve-animations`), Jakub, ibelick `improve-ui`, Dammy `design-review`.
- Verify visually in a browser at multiple widths when possible; label what is unverified. Jakub, Dammy, Emil (`break-ui`, `mobile-native`), ibelick.

## 10. Contradictions

| Topic | Positions |
| --- | --- |
| Whether to animate at all | ibelick: "NEVER add animation unless it is explicitly requested" (`baseline-ui:48`). Emil: animate when frequency + purpose justify it. Stitch `taste-design`: "Every active component should have an infinite loop state" (`:96`). |
| Max UI duration | ibelick: never exceed 200ms for feedback (`:53`). Emil: under 300ms, modals up to 500ms (`:135,132`). Jakub: enters 300ms, exits 150ms, icon swap 300ms (`better-ui:54-68`). |
| Custom easing | Emil/Dammy: built-ins are too weak; use `cubic-bezier(0.23, 1, 0.32, 1)` (`emil:108-119`). ibelick: "NEVER introduce custom easing curves unless explicitly requested" (`:56`). Jakub: `ease-out` mostly, `cubic-bezier(0.2, 0, 0, 1)` for icon swaps, and it says the two curves are *not* interchangeable (`better-ui:12`). Taste-design: spring stiffness 100 damping 20, no linear. |
| Press scale | Emil 0.97 @160ms, range 0.95-0.98; Jakub 0.96 @150ms "exact"; Dammy 0.97. |
| Stagger | Emil/Dammy 30-80ms; Jakub 100ms per chunk, 80ms per word. |
| Spring bounce | Emil 0.1-0.3 allowed; Jakub "bounce is always 0". |
| Letter-spacing | ibelick: "NEVER modify `letter-spacing`" (`:64`). Dammy, Jakub, `apple-design`: tighten large headings. |
| Gradients and blur | ibelick: NEVER gradients, avoid animating large blur. Jakub/Emil: blur 2-4px is a recommended transition aid. Emil `apple-design`: `blur(20px) saturate(180%)` glass is a pattern; Stitch design-mappings promotes glassmorphism. |
| Review posture | Emil: "Default to flagging. Approval is earned" (`review-animations:21`). Jakub: "Evidence, not taste"; ibelick: "prefer no finding to an unsupported one"; Dammy: "Taste, not defect... cut it". |
| Font choice | Dammy: default/system/Inter is "default typography"; Taste-design: Inter banned, Geist/Satoshi/Outfit required, generic serifs banned; Jakub: never propose a new typeface unless asked, serif-over-sans is "deliberate"; Apple (Emil): default to system font first. |
| Depth strategy | Dammy: pick ONE of borders-only / shadows / layered / tonal; Jakub: shadows for elevation, borders for structure and inputs (mix is expected). |
| Shape scale | Dammy examples 4/6/8px (technical) vs 8/12/16 (soft); Stitch example 8px buttons / 12px cards; taste-design cards `2.5rem`. No agreed scale. |
| Hit area | Dammy/Stitch: 44px (Dammy 40 min); Jakub: WCAG 24px AA floor, 44/40 only as a heuristic where density permits. |
| Cards | Stitch taste-design: cards only when elevation communicates hierarchy; Dammy: vary card expression, avoid identical metric boxes; Jakub: no stance on cards. |
| Dashboard layout | Dammy: sidebar same canvas color + border. Not echoed elsewhere, contradicted by apple-design's "darker/heavier materials separate structural regions (sidebars)" (`apple-design:182`). |
| Scope assumption | Dammy: product UI only; taste-design: landing/portfolio-biased; Jakub/Emil: scope-agnostic. |

---

## 11. What I would carry forward (opinion, labeled)

- Knowledge layer for polish: Jakub `better-ui`, `better-typography`, `better-colors`, `better-layout`, `better-accessibility`. Only pack with exact values, honest calibration, and low always-on cost.
- Motion numbers: one source only. Emil's `STANDARDS.md` is the most complete on-demand reference; Jakub's `better-ui/animations.md` and `enter-exit.md` are the leaner alternative. Do not load both.
- Direction and consistency: Dammy `interface-design` for the method (intent, domain, signature, checks, system.md), after adding a CLAUDE.md `@` import for system.md, and only for product UI. Or ibelick `create-design-md` if machine validation matters more than a design-thinking method.
- Robustness: Emil `break-ui` (or Jakub `break`), user-invoked.
- Skip: petergyang/no-ai-slop (prose only), Stitch `design-md` (Stitch-bound), `taste-design` (strong house style that conflicts with Emil's frequency rule), ibelick `baseline-ui` (NEVER-list conflicts with good design).
