# Deep read A: pbakaus/impeccable and Leonxlnx/taste-skill

Read-only research on shallow clones in `clones/`. Nothing from the clones was executed.
Token figures are my estimates (bytes / 4). All paths are relative to each clone's root unless absolute.

Clone roots:
- IMP = `clones/pbakaus_impeccable`
- TASTE = `clones/Leonxlnx_taste-skill`

## Coverage

| | Read in full | Read in part | Skipped |
|---|---|---|---|
| IMP | `skill/SKILL.src.md`, `reference/craft-floor.md`, `new-work.md`, `mode-persuade/operate/read.md`, `routing.md`, `shape.md`, `operate.md`, `typeset.md`, `layout.md`, `polish.md`, `animate.md`, `colorize.md`, `bolder.md`, `PRODUCT.md`, `tests/skill-behavior/README.md`, `activation-cases.mjs` head | `critique.md` (lines 1-120 of 854), `DESIGN.md` (grep), detector `crates/foundation/src/registry.rs` and `constants.rs` (rule ids, descriptions, font list), `README.md` (grep), number-grep over the other references | `live.md`, `live-setup.md`, `generate.md`, `document.md`, `init.md`, `hooks.md`, `doctor.md`, `component-review.md`, `region-map.md`, `visualize.md`, `audit/harden/adapt/optimize/onboard/distill/delight/overdrive/clarify/extract/quieter` bodies, `ios.md`, `android.md`, `skill/agents/*`, Rust crates (about 12K lines in detect alone), browser extension, VS Code extension, `tests/oracle`, most other tests |
| TASTE | `skills/taste-skill/SKILL.md`, `references/tells.md`, `type.md`, `colour.md`, `critique.md`, `research.md` (nearly all), `evals/evals.json`, `CHANGELOG.md` (top 90 lines), `research/laziness/README` and `empirical-results` | `layout.md` (1-100), `motion.md` (1-120), `app-screens.md` (1-140, section 9, section 13), `copy.md` (1-60), `scripts/lib/rules.mjs` (1-80), `lint.mjs` (grep), metadata of `library/directions.json`, `palettes.json`, `type.json`, headers of the classic skills (v1, soft, minimalist, brutalist, gpt-taste, stitch) and v1 sections 1-3 | `imagery.md` (51KB), `scenes.md`, rest of `app-screens.md`, `library/sites|photos|sections|heroes|app|motions.json`, `assets/`, `draw.mjs`, `assets.mjs`, `inspect.mjs`, `probe.mjs`, `taste-skill-v2-experimental/SKILL.md` (1229 lines), other `research/laziness` files, sponsors, README body |

---

# Part 1: Impeccable (pbakaus/impeccable, v4.6.x)

## 1. Architecture

One skill, many commands, backed by a compiled engine.

- **Entry.** `skill/SKILL.src.md` (90 lines source; built `plugin/skills/impeccable/SKILL.md` is 68 lines, 11.9KB, about 3.0K tokens). Frontmatter description is 81 words, about 211 tokens, always loaded (`tests/skill-behavior/README.md`, "Baseline" section).
- **24 commands** in a table (`SKILL.src.md:47-72`): craft(deprecated), shape, init, document, extract, critique, audit, polish, bolder, quieter, distill, harden, onboard, animate, colorize, typeset, layout, delight, overdrive, clarify, adapt, optimize, live, generate. Each is a reference file loaded only when the command runs. No argument shows a context-aware menu (`routing.md`), and it never auto-runs.
- **Four visitor modes** (`SKILL.src.md:34-43`): Persuade, Operate, Read, Experience. The mode is chosen from the requested surface, not the product. Each mode has its own rules file (`mode-persuade.md`, `mode-operate.md`, `mode-read.md`, plus `operate.md` for depth).
- **Project memory.** `PRODUCT.md` (product truth), `DESIGN.md` (visual tokens, generated from the build), per-surface briefs, `.impeccable/config.json`. `impeccable context` prints all of it once per session (`SKILL.src.md:21`).
- **Engine.** A Rust binary (`crates/*`, launcher `skill/scripts/impeccable`) downloaded on first run. It provides: `context`, `detect` (61 deterministic rules), `concept-seed` (random direction dealing), `serve-question` (a local decision web page), `surface-brief`, `critique-storage`, `build-phase` (a gated state machine), `comp-spec`, `comp-diff`, `font-match`, `generate-image`, `live` (browser overlay for element picking and variants), `hooks` (auto-runs the detector after each UI edit), `doctor`.
- **Agents.** Four shipped subagents: `impeccable-finish-reviewer`, `-documenter`, `-asset-producer`, `-manual-edit-applier`.
- **Distribution.** Generated per harness (Claude, Cursor, Codex, Copilot, Grok, others), plus a Chrome extension and VS Code extension.

**Size.** Skill payload `skill/` is 5,389 lines and 426KB of markdown (about 106K tokens), but never loaded together. Largest single files: `new-work.md` 156 lines but 63.5KB (about 16K tokens), `critique.md` 48KB (about 12K), `live.md` 36.6KB, `document.md` 27KB, `visualize.md` 14KB. The repo is about 87K lines including Rust, tests and extension.

**Loaded per invocation (estimate):**
- Always: about 0.2K tokens (description).
- Small refinement ("fix the spacing"): SKILL.md 3.0K + craft-floor 1.8K + one command file 1.3-1.7K, plus `context` output (project PRODUCT.md and DESIGN.md, unbounded). About 6-8K plus project context.
- New page or replacement look: SKILL.md 3.0K + new-work 16K + craft-floor 1.8K + mode file about 1K + `visualize.md` about 3.5K if image generation exists. Then a fresh finish-reviewer subagent and a documenter subagent, each with their own context. About 22-26K in the main thread, plus subagents.
- Critique: about 3K + 12K, and it must spawn two isolated subagents (`critique.md`, Hard Invariants).

**Dependency on scripts.** Heavy. The setup step runs the binary and the skill says "follow its directives and do not rerun it" (`SKILL.src.md:21`). New-work cannot proceed without `concept-seed` ("No substitute, no skip", `new-work.md:48`). A fallback exists only for "launcher unavailable" (`SKILL.src.md:25`), and it says to read PRODUCT.md and DESIGN.md directly.

## 2. Method

Workflow for new surfaces (`new-work.md`, quoted section titles):
1. **Decide what is already true** (`:7-16`): redesign vs established world vs incomplete brand vs no authority. "A section, component, feature, or state inside an established surface inherits that surface. Never turn a local addition into a new identity exercise."
2. **Ask what will change the work** (`:18-27`): 2-3 questions by mode. "Never ask for CSS values or canned aesthetic lanes."
3. **Choose the amount of invention** (`:29-61`). For a new world: name the product's mechanism, list seven concrete visual systems from the audience's cultural world, run `concept-seed` which "assigns the direction to build and deals catalog challengers", weigh challengers on two axes (audience identification, product clarity), present one committed direction plus alternates on a local decision page, with a "standing exit" for the category-standard look.
4. **Commit the world** (`:63-73`): pick a colour strategy (Restrained / Committed / Full palette / Drenched) and a physical scene for light vs dark; avoid the reflex font list; self-check against saturated AI looks.
5. **Record the decision** (`:75-95`): write a "Direction contract" (THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM, FINISH) to the surface brief before code. DESIGN.md is written at the end from the build, not before.
6. **Build with full commitment** (`:97-136`): "Build the assigned direction, not a safer interpretation of it." Comp-led (image-generation comps measured by `comp-diff` through a phase gate: comps, spec, plates, hero, sections, motion, responsive) or code-led. The comp-led path says it is "a frontier-tier job" and tells smaller models to take code-led (`:110`).
7. **Inspect and finish** (`:138-156`): one batched screenshot round at desktop and mobile, "two rounds is the ceiling", run `detect --json` once, spawn a fresh `impeccable-finish-reviewer` with no forked history, act on one of four dispositions (recapture / rebuild / ship / fix), then a documenter writes DESIGN.md.

Design-quality gating is a separate **craft floor** (`craft-floor.md`), loaded "immediately before any UI edit, including small refinements" (`SKILL.src.md:23`): a Verify checklist plus a Refuse list.

Review commands (`critique`, `typeset`, `layout`) run "two isolated assessments": an LLM design review and a detector scan, kept apart so the detector does not anchor the design judgment (`typeset.md:13-30`, `critique.md` Hard Invariants).

Key principle lines:
- "Verify by looking at the rendered result at the sizes it ships at, and batch the checks: fix what one look shows before looking again" (`SKILL.src.md:16`).
- "A clean scan is a floor, not proof of good typography" (`typeset.md:30`).
- "Missing DESIGN.md alone does not make a project greenfield" (`SKILL.src.md:32`).

## 3. Concrete rules (most load-bearing)

Impeccable keeps most numeric thresholds in the detector, not in prompt text. The prompt text is mostly questions and checklists.

| # | Rule | Source |
|---|---|---|
| 1 | "The brief wins." Honour pinned aesthetics, eras, fonts, palettes even against the saturated-pattern warnings. | `skill/SKILL.src.md:29` |
| 2 | Refinement preserves incumbent identity and copy; redesign replaces the look. Never "split the difference into polish on the discarded look". | `SKILL.src.md:30` |
| 3 | Pick one of four modes from the requested surface, not the product. A tool's landing page is Persuade. | `SKILL.src.md:36-43` |
| 4 | Contrast: body and placeholder text at least 4.5:1, large text at least 3:1. On coloured surfaces tint secondary text from that hue, "never gray". | `skill/reference/craft-floor.md:9` |
| 5 | Shadows carry an offset and a soft blur. A zero-offset coloured halo is decoration. | `craft-floor.md:10` |
| 6 | More space above a heading than below it; tight groups, generous separation. | `craft-floor.md:11` |
| 7 | Type floor: body measure 65-75ch, display max 6rem, tracking floor -0.04em (-0.02 to -0.03em "usually reads better"), balanced headings. | `craft-floor.md:12`, `:45` |
| 8 | Motion: one authored moment, exponential ease-out from an already-visible default, not one identical entrance on every section. Use blur, clip-path, mask and shadow when smooth. | `craft-floor.md:13` |
| 9 | Durations: 100-150ms feedback, 150-300ms state, 300-500ms layout or overlay, 500-800ms authored entrance. Exit faster than entrance. `cubic-bezier(0.16, 1, 0.3, 1)`. No bounce or elastic. Every animation needs a `prefers-reduced-motion` path that keeps meaningful feedback. | `animate.md:56-61`, `:77` |
| 10 | Ship hover, disabled, loading, error, empty, keyboard focus. | `craft-floor.md:14` |
| 11 | Theme the browser surfaces: text selection, caret, scrollbars, focus rings, underline offset, tabular numerals. "The cheapest signal that a page was built rather than assembled." | `craft-floor.md:15` |
| 12 | Refuse as page structure: same-size icon+heading+text cards (nested cards "always wrong"), the hero-metric template, section numbers 01/02/03 unless sequence matters, modal for non-interruptive tasks. | `craft-floor.md:25,26,28,29` |
| 13 | Eyebrow or kicker above a heading is a flat ban: "no brief earns it back". | `craft-floor.md:27` |
| 14 | Refuse: gradient text, decorative glass, coloured `border-left`/`right` above 1px, hard offset shadows outside neobrutalism, mono as "technical" costume, emoji/glyphs as icons, geometric masks faking organic contours. | `craft-floor.md:33-41` |
| 15 | Light vs dark chosen from a physical scene (who, where, under what light), never by category habit. | `craft-floor.md:42`, `new-work.md:65` |
| 16 | Card radii 12-16px, pills only for small controls. Declare elevation once: border or shadow, never a 1px border under a wide soft shadow. No stripe or grid backgrounds without a real canvas/map/blueprint behind them. | `craft-floor.md:46,48` |
| 17 | Colour strategy before colours: Restrained, Committed (one colour carries 30-60%), Full palette (3-4 roles), Drenched. Prefer OKLCH; reduce chroma near white and black. | `new-work.md:65`, `colorize.md:38,65` |
| 18 | Font reflex list: Fraunces, Playfair, Cormorant, Lora, Crimson, Newsreader, Syne, Space Grotesk, Space Mono, IBM Plex, Inter-as-display, DM Sans/Serif, Outfit, Plus Jakarta, Instrument Sans. Detector also flags Inter, Roboto, Open Sans, Lato, Montserrat, Arial, Helvetica, Geist, Mona Sans, Recoleta. | `new-work.md:67`, `crates/foundation/src/constants.rs:85-102` |
| 19 | Operate surfaces: one family is often right; fixed rem scale, not fluid; scale ratio 1.125-1.2; accent only for action, selection and state; Restrained colour floor; second neutral layer for rails and panels. | `skill/reference/operate.md:13-15,20,24` |
| 20 | Operate motion: 150-250ms, no page-load choreography, skeletons not spinners, empty states that teach, "Modals are usually laziness". | `operate.md:34-35,41,52` |
| 21 | Web body floor 1rem/16px, prose 45-75ch, `text-wrap: balance` on headings, `pretty` on body; light-on-dark needs slightly more leading, tracking and one weight step. | `typeset.md:46-48,63` |
| 22 | Spacing: documented scale, "a 4-unit base usually provides the useful middle steps that an 8-only scale misses"; `gap` for sibling rhythm; squint test. | `layout.md:18,49,54` |
| 23 | Touch targets at least 44x44px; breakpoints content-driven, usually 640/768/1024; `clamp()` for fluid values. | `adapt.md:46,213`, `audit.md:50` |
| 24 | Detector thresholds: body text under 12px, line height under 1.3x, lines over about 80 chars, body tracking over 0.05em, padding under 8px in bordered containers, heading steps all under 1.25x. | `crates/foundation/src/registry.rs:494,434,404,524,414,64` |
| 25 | "Truth binds claims": author demo data at full fidelity and label it synthetic, never invent prices, customers, benchmarks. Refusing a bold direction because demo data does not exist yet is "the timidity reflex". | `new-work.md:59`, `PRODUCT.md` |

## 4. Evidence

Does it test anything? Yes, but not design quality.

- `tests/skill-behavior/` (`README.md`, `scenarios.test.mjs`, `harness.mjs`): LLM-backed scenarios on Anthropic, OpenAI and Google models that check the agent follows the loading contract (runs `context` once, loads the right reference, reads craft-floor before edits). Explicitly "They do not claim that a page was built or reviewed."
- `activation.eval.mjs` and `activation-cases.mjs`: 54 cases (34 positive, 20 negative) against 11 fake neighbour skills, measuring whether the frontmatter description triggers the skill. Results reported in the README (2026-10-16, 3 samples): Sonnet recall 35% (old description) -> 55% (current), Gemini 76% -> 89%, 0 false positives on near neighbours. It also found "Sonnet decides at the first step... almost never loads the skill afterwards" and that polish, accessibility review, empty states, responsive fixes and edge-case hardening "miss on Sonnet under every description tried". This is honest, useful, and a real adoption risk for Claude users.
- `tests/skill-workflow/full-build.test.mjs`: provider-backed attended workflow (init, redesign, refinement) with a browser and screenshots. Asserts completion and artefacts, not aesthetic quality.
- `tests/oracle/` (frozen-behaviour goldens for every CLI verb), `live-e2e*`, build, release and plugin-manifest tests: software engineering tests of the engine.
- `docs/COMP-FIDELITY.md` and `docs/comp-fidelity-review-*.json`: fidelity of build vs comp; I only saw filenames.

No blind A/B showing that output made with impeccable looks better than output without it. The README cites a single before/after case study (Neo Mirai) on an external site, not read.

## 5. Weaknesses

- **Context bloat and ceremony.** A new page triggers about 22-26K tokens in the main thread, a decision web page server, up to 7 comp-led phase gates, a fresh reviewer subagent and a documenter subagent. `new-work.md` alone is a 63KB run-on file with paragraphs of 600+ words (for example `:49-55`). Over-engineered for "ship a usable internal tool".
- **Engine dependence.** Direction cannot be chosen without `concept-seed`; downloads a binary on first run; per-harness hook installs. Without it, the skill degrades to "read PRODUCT.md".
- **Internal contradictions.**
  - `SKILL.src.md:29` "The brief wins... even when they conflict" vs `craft-floor.md:27` "This one is a ban, not a default: no brief earns it back" (eyebrows). Same file says refusals "are not bans: the brief's own words can earn any of them" (`:21`), then declares exceptions.
  - README anti-pattern list says "Don't use overused fonts (Arial, Inter, system defaults)" (`README.md:87`) while `operate.md:58` says Product "can afford... system fonts and familiar sans defaults" and `new-work.md:67` says Operate surfaces are "well served by system stacks".
  - Craft floor says "display max 6rem" and "tracking floor -0.04em", the Codex block repeats the tracking floor at a different value.
  - Body measure 65-75ch (`craft-floor.md:12`, `operate.md:16`) vs 45-75ch (`typeset.md:21,47`).
  - The detector's cream/italic-serif/Fraunces list is itself a fashion list; new-work admits the font list is "training-data defaults" while the same list is encoded as a Rust constant that will age.
- **Vague advice in refinement commands.** `typeset`, `layout`, `colorize`, `animate`, `polish` are process checklists ("Answer every question with a file, selector, or computed value") with few numbers. Good for review, weak as a spec for what to build.
- **Monoculture risk.** Lower than taste-skill. The dice (`concept-seed`) and "standing exit" are designed against one house style, and the Operate mode explicitly keeps layout, nav and controls standard. Still has a recognisable house taste: no eyebrows, no numbered sections, no cream, no italic serif display, "when torn between refined and committed, commit" (`craft-floor.md:52`), and a bias toward saturated Drenched colour for Persuade. A Claude-specific block says "treat that first palette as already spent" (`new-work.md:71-73`).
- **Overlap with Anthropic frontend-design (local copy).** Anthropic's "calibration" list (cream + serif + terracotta, near-black + acid accent, broadsheet hairlines, SaaS card kit, eyebrow chrome) is almost verbatim what impeccable's `calibration` paragraph (`new-work.md:69`) and detector (`cream-palette`, `italic-serif-display`, `kicker-above-heading`, `icon-tile-stack`) encode; impeccable is the superset. Both say the brief wins. Differences: impeccable demands a separate persistent PRODUCT.md/DESIGN.md system, separate reviewer subagents and a binary; Anthropic is one 70-line prompt (about 1.4K tokens). Installing both double-triggers on the same requests. The impeccable detector even labels the "Anthropic-skill / Vercel / GitHub default wave" fonts as monoculture (`constants.rs:94`).
- **Sonnet activation weakness** (recall 55% by its own eval) and the comp-led path being declared too hard for "smaller or faster models" (`new-work.md:110`).
- **Image-generation assumptions.** Several steps assume an image-gen tool; absent it, cards fall back to HTML sketches.

## 6. Verdict (Impeccable)

| Dimension | Score /10 | Note |
|---|---|---|
| Concreteness | 5 | Numbers live in the Rust detector and a few reference tables. Prompt text is mostly questions and checklists. |
| Method quality | 8 | Mode taxonomy, brief-wins/refine-vs-redesign semantics, direction contract, isolated reviewer, batched screenshot loop, detector-as-floor are all strong. Over-engineered for small jobs. |
| Breadth | 9 | New work, critique, audit, polish, harden, adapt, animate, copy, onboarding, native iOS/Android, design-system capture, live variants. |
| Context cost (10 = cheap) | 3 | 6-8K for a tweak, 22-26K+ for new work, plus subagents and an engine. |
| Style neutrality | 7 | Mode-aware, dice-driven and "brief wins"; still bans a specific set of 2025-26 looks and leans toward bold. |

**Verdict.** Impeccable is the most complete process system here and the one most worth borrowing ideas from: the four-mode split (especially Operate: standard controls, one family, restrained colour, four states), the brief-wins rule, the "refinement preserves / redesign replaces" semantics, the separate reviewer with no forked history, and the detector idea (deterministic slop checks you can run without an LLM). Installed whole, it costs too much context and process for a "ship a usable product fast" goal, depends on a downloaded binary, and its own activation eval shows Sonnet often never loads it. For a Claude Code user the best use is to take the craft floor, the Operate/Read mode rules and optionally the `detect` CLI as a linter, not the full new-work pipeline.

---

# Part 2: taste-skill (Leonxlnx/taste-skill, v2.1.2, install name `design-taste-frontend`)

## 1. Architecture

A repo of 13 skills; one is the default, the rest are "classics" disabled for auto-invocation (`CHANGELOG.md` 2.1.1: `disable-model-invocation: true`).

- **Default skill** `skills/taste-skill/`: `SKILL.md` (529 lines, 38.5KB, about 9.6K tokens), 11 reference files (about 290KB, about 72K tokens), 4 zero-dependency Node scripts plus a CDP library, `assets/` (base.css, base.js, app.css, charts.js, scroll scene stage), `library/` (9 JSON files, about 1.5MB, never to be read directly: "Do not read it whole; use the script", `SKILL.md:529`), `evals/evals.json` (10 prompts).
- **Page vs app screen** (`SKILL.md:44-70`): two different runs. Pages follow the 10-step run in SKILL.md. App screens follow `references/app-screens.md` (85KB, about 21K tokens, "Read that file whole").
- **Scripts:** `draw.mjs` (deals 3 of 20 "directions", then a type system from 44, a palette from 56, hero, sections, photos, scenes), `assets.mjs` (searches Openverse, Wikimedia, Art Institute of Chicago, the Met for real pictures; needs network), `lint.mjs` (source grep for banned patterns and copy tells), `inspect.mjs` (real Chrome via CDP at 1440, 768 and 390; measures; screenshots; FAIL/WARN), `scenes.mjs` (scroll-scene photographer).
- **Classic skills (opt-in):** v1 (the original 227-line "DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY" dial prompt), soft, minimalist, brutalist, gpt-taste, stitch, v2-experimental (1229 lines), plus pointers to image-gen skills moved to another repo.
- **Research.** `references/research.md` (study of 247 gallery sites, 100 more Awwwards sites, 23 app screens) and `research/laziness/` (generic LLM-truncation notes, not about design).

**Loaded per invocation (estimate):**
- Always: about 0.2K tokens description (long, enumerates triggers).
- Page build: SKILL.md 9.6K, then per its Files table: copy 2.4K, type 2.1K, colour 1.7K, layout 4.6K, critique 2.8K, motion 14K, imagery 13K, scenes 2.5K. Plus the printed direction sheet (size unknown, I did not run it). Realistic total 30-50K tokens for a full page. Minimal total (SKILL.md + draw output) about 12K.
- App screen: 9.6K + 21K = about 31K before any other reference.
- Review/redesign: SKILL.md + critique + before/after inspect output.

**Dependency on scripts.** High but with explicit fallbacks (`SKILL.md:501-505`): without Node 22/Chrome run `lint.mjs` on Node 18 and use any screenshot tool, "say in the report that the inspector could not run". Without network, draw the pictures. The direction dealing, however, is script-only.

## 2. Method

The run (`SKILL.md:72-372`):
1. **Read the brief and project; inventory the subject.** "eight to twelve things that belong to this client and to no competitor" (`:88-94`).
2. **Write the argument:** page as claims with proof; "Delete any section that has no claim" (`:102-105`).
3. **Draw the direction:** `draw.mjs --sector ... --options 3` deals three of twenty researched directions; "Choose that one, not the most familiar". Then deal the full sheet (type system, palette, hero, section blueprints). "Adopt it. Do not blend it with the layout you would have made anyway." Redraw only for stated brand or asset reasons (`:115-157`).
4. **Find the idea:** one sentence, "On this page, [something that belongs to the subject] becomes [the device]." Competitor test: put the nearest competitor in the sentence; if it still works, it's category. Add "one live thing" the visitor can do (`:159-198`).
5. **Write the words** as a copy deck: headlines two lines or fewer at every width, full content, no invented proof (`:200-222`).
6. **Build it, still:** tokens, hero exactly per blueprint, sections from blueprints with unlike neighbouring layouts, imagery in order (own, generated, real open-collection pictures, drawn, dealt photos, type only), live thing, scroll scenes, "fullness", "the frame", states (`:224-299`).
7. **Gate:** `lint.mjs` + `inspect.mjs`; fix every FAIL, treat each WARN as wrong unless defensible; "Do not argue with the meter and do not hide things from it" (`:304-323`).
8. **Look:** open the screenshots; fourteen-pass critique, Awwwards-weighted score with caps; fix top three; three rounds at most (`:325-333`, `critique.md`).
9. **Move:** motion is last, required, at least 8 elements moving (warn under 16) (`:335-353`).
10. **Report** with a done-checklist ("each one was skipped in a test run that came out badly", `:357`), crediting found pictures.

Redesigns: record the before in a real browser, keep stack and content, order of work "type, colour, the frame, states, then the stock components" (`:470-491`).

## 3. Concrete rules (most load-bearing)

| # | Rule | Source |
|---|---|---|
| 1 | Every headline h1-h6 fits two lines or fewer at 1440, 768 and 390; about 32 characters is safe at a confident size. Cut words, then widen the measure, size last. | `skills/taste-skill/SKILL.md:380`, `:206`; `references/copy.md` section 2 |
| 2 | One supporting sentence 32-48px under the headline, one real primary button, on the first screen. The first screen answers "what is this, for whom, what do I do". | `SKILL.md:207-215` |
| 3 | Argument first: claims with proof per section, delete sections with no claim. Avoid the stock hero-logos-features-testimonial-pricing-CTA order. | `SKILL.md:102-105` |
| 4 | Competitor test and "one live thing" per page. Jurors "named it first". | `SKILL.md:180-192` |
| 5 | Imagery floor: at least 4 real pictures (SVG drawings do not count), usually 6-12; one moving picture where an honest clip exists. Never invent proof (customers, quotes, logos, stats). | `SKILL.md:267-272`, `:222` |
| 6 | House rules table (all measured by the inspector): no eyebrows or pill badges; no monospace outside code; no index numbering; no thin rules or 1px outlined boxes; no gradients (neutral scrim on photo excepted); no shadows or glows on resting elements; no glass; no emoji or gradient blobs; no styled accent word in a headline; max two typefaces; no icon-topped feature cards or identical card rows. | `SKILL.md:378-397` |
| 7 | Type laws: two or three visible sizes ("one very large, one small, nothing in between"), at most five; display tracking -0.02 to -0.05em, leading 0.85-1.05; text 16-20px, leading 1.45-1.6, 45-75 chars; left-aligned by default, centre at most one moment. | `SKILL.md:421-428`; `references/type.md` sections 2-4 |
| 8 | Scale tokens: `--step-body` clamp(1.0625rem..1.1875rem), `--step-head` clamp(2rem..4rem), display at least 4x body; `p { max-width: 62ch; text-wrap: pretty }`; display `max-width: 14ch; text-wrap: balance`. | `type.md:49-54, 76, 99` |
| 9 | Space: one pair of equal outer margins 16-32px (`clamp(1rem, 2.2vw, 2rem)`), large things run to the edges, no reflex `max-width:1200px; margin:auto` wrapper, section gaps 120-240px on desktop, no blank stretch above about half a screen, no section "huddled" with half the width empty. | `SKILL.md:289-297, 431-437`; `layout.md:45-60` |
| 10 | Colour: one ground, one ink, one accent. Ground 70-90% of the page, accent under 5% of any screen. Running text in full ink. Surfaces separated by a 2-6 lightness-point tone step, never a line or shadow. Accent is not for headings, icons, bullets or borders. | `SKILL.md:438-443`; `colour.md:56-58` and section 4 |
| 11 | Banned colour families, measured by HSL in the inspector: cream (hue 22-62, saturation >= 0.16, lightness 0.88-0.995), terracotta (hue 6-30, s 0.38-0.85), violet/indigo (hue 244-295). Warmth instead from low-chroma stone, deep green/brown/oxblood ink, photographs, or a full flat warm field. | `scripts/lib/rules.mjs:9-16`; `colour.md:126-141` |
| 12 | Buttons flat, one fill, either square-cornered or fully round, decided once. The 9-16px "soft" radius is the weak-site default (top sites 52% square, 23% pill, 6% medium). Square media corners. | `SKILL.md:457-460`; `research.md` section 7 |
| 13 | Contrast: body 4.5:1, display and large numerals 3:1, dealt palettes target 7:1. Inspector fails text under 2.6:1 on flat grounds. Dark pages: `color-scheme: dark`, soft light ink not `#fff` on `#000`, lighter weights. | `colour.md` sections 6 and 8 |
| 14 | Motion tokens: `--ease-out cubic-bezier(.22,1,.36,1)`, `--ease-expo (.16,1,.3,1)`, press 140ms, hover 180ms, UI 240ms, reveal 800ms, open 1200ms, stagger line 90ms, item 70ms. Entrances staggered 60-90ms rising 16-32px with opacity, once. Leaving about 70% of arrival time. | `motion.md:103-116`; `SKILL.md:339-347` |
| 15 | Duration by frequency: press 100-160ms, hover 150-200ms, menus 150-250ms, dialogs 250-450ms, reveals 500-900ms. No ease-in ("feels slow"). Hundreds of times per visit (keyboard, typing): no animation. | `motion.md:88-101` |
| 16 | Motion limits: no preloader, no custom cursor, no wheel capture; at most two held (pinned) stages; load sequence over by 1.2s; transform and opacity only; every move has a `prefers-reduced-motion` fallback that keeps content. | `motion.md:80-83,947`; `SKILL.md:349-353` |
| 17 | Micro-typography: curly quotes, tabular-nums, `text-underline-offset: 0.18em`, `::selection` in accent, visible `:focus-visible`, heading space above at least twice space below, no weight change on hover. | `type.md` section 7 |
| 18 | App screens: colour goes on data (median about 3% coloured pixels, 17 of 23 at 5% or less), KPIs are type not tiles (no icon circles, no sparklines), flat surfaces (17 of 23 no card shadow), page title 18-32px, no figure at 48px or more, no hero header, no zebra, right-aligned tabular figures, a sidebar never dark or saturated on a light screen. | `references/app-screens.md:20-45`; section 9.1; section 13 |
| 19 | App type table: title median 24 (14-48), KPI 24 (16-40), card title 16, body/nav/cells 14 (13-16), labels 12, floor 11; clean scales 12/14/18/24, 12/14/16/30; 4-9 sizes, 3 weights. | `app-screens.md` section 9.1 |
| 20 | App colour: borders about 1.1-1.3:1 against ground (#e5e7eb-#ededed), text tiers #111 / #606060 / min #6b6b6b for 4.5:1; dark grounds #000/#111, no navy or slate; status text green #247b50 (5.2:1), pills #dcfae5 on #04250e. Radius bimodal: 4-8px or 16-24px; nested radii step down. | `app-screens.md` sections 9.2-9.4 |
| 21 | App allowed devices, with limits: 1px borders ("a border or a shadow, never both"), row rules, pills 16-24px high inside rows, mono for IDs only, rows of 3-6 peer cards. Banned still: gradients, glows, rainbow charts (more than four hues), left-aligned numbers, emoji greetings. | `app-screens.md:1118-1165` |
| 22 | Gate: `lint.mjs` then `inspect.mjs` at 1440, 768 and 390; 0 FAIL on the final version; open every screenshot after the last change; three critique rounds max; "If a problem is visible in a screenshot, it is real, whatever the code says". | `SKILL.md:304-333, 357-365` |
| 23 | Critique caps override arithmetic: any inspector FAIL caps overall at 6.0; a banned device visible caps at 6.5; fewer than 4 real pictures caps design at 6.5; no live thing caps creativity at 7.5; any placeholder caps content at 5. Score = 0.4 design + 0.3 usability + 0.2 creativity + 0.1 content. | `references/critique.md` sections 2-3 |
| 24 | "Removing ornament leaves space. Never fill it with another ornament." Fill with scale, full content, a picture made for the subject, or a flat colour field. A page with every tell removed and nothing in place is "an empty page with good manners". | `SKILL.md:412-414`; `tells.md` section 8 |
| 25 | Redesign order of work: type, colour, frame, states, then stock components; keep stack and content; prove with before/after inspector measurements; no framework migration. | `SKILL.md:485-491` |

## 4. Evidence

This is the most evidence-forward of the two, and the evidence cuts against the skill.

- **Observational study (inputs to the rules).** `references/research.md`: 248 sites collected 5 Oct 2026 (156 One Page Love + 92 Awwwards Sites of the Day), captured headless at 1440x900 and 390x844 with in-page measurements, scored by 21 model reviewers using Awwwards weights (design 40, usability 30, creativity 20, content 10). A second study of 100 Awwwards sites (motion, frame, imagery). A third of 23 real product screens "measured from their pixels" (screenshots private). Caveats stated in the file: model judges from stills, not humans; single capture; "fashion as much as quality".
- **Honest disclosure of owner taste vs data.** Monospace labels, index numbers and thin rules are *more* common on top-scored sites (mono 44% vs 24%, index numbers 38% vs 21%) but are "banned here regardless, by the owner's decision" (`tells.md` section 4, `research.md` section 6). Tiny tracked caps (16% top vs 57% weak), gradient fills (22% vs 52%), shadows (24% vs 48%) and icon feature cards (1% vs 28%) are data-supported.
- **Own A/B test of the skill** (`research.md` section 11, lines 278-300): six briefs, fresh agent builds each page three ways (no skill, another published skill "atelier", this skill), blind model-judge with the same rubric, screenshots only.

| Round | Briefs | This skill | Baseline (no skill) | Atelier | Wins vs others |
|---|---|---|---|---|---|
| 1 | 4 | 6.6 | 7.7 | 6.8 | 1 of 4 |
| 2 | 3 | 7.1 | 8.0 | - | 0 of 3 |
| 3 | 3 | 7.5 | 7.5 | - | 1 of 3 |
| 4 (unseen) | 3 | 6.9 | 7.9 | 7.5 | 0 of 3 |
| 5 (same 3 as 4) | 3 | 7.7 | 7.8 | 7.2 | 2 of 3 |

  The skill ties or loses to **no skill** in every round, and by round 5 (briefs seen in round 4, after revising against jurors' reasons) is still 0.1 behind. The authors note "single scores carry about half a point of noise" and one juror per brief. What the skill did improve is the inspector count: final builds 0 FAIL, baselines 8-13 FAIL, which is circular because the inspector encodes the skill's own bans. Jurors punished "a quiet page that read as empty", which is why the SKILL.md added "substance" and "fullness" rules.
- **App-screen test:** "four blind rounds of eight, six, five and three builds" (CHANGELOG 2.1.0). The first round: "screens built with this chapter were clean, quiet and correct, and they lost to richer screens built without it" (`app-screens.md`, warning section). No scores are published for these.
- `evals/evals.json`: 10 prompts with expected-output prose (6 pages, 4 app screens) and a `how_to_run` that is the same blind A/B method. No stored results in the repo beyond the table above.
- `tests/frontmatter.mjs` + `check-skills.yml`: only validates YAML frontmatter and manifests (added after a bug where the description failed to parse and the skill silently did not load in Claude Code, CHANGELOG 2.1.2).
- `research/laziness/`: unrelated to design. Cites anecdotal prompt-stimulus effects ("$200 tip" +45%, a seasonal-output claim) with no primary sources inspected. Treat as noise.

## 5. Weaknesses

- **Strong house style presented as law.** The rules table bans gradients, resting shadows, thin rules, outlined boxes, monospace, numbering, glass, styled accent words, 9-16px radii, rounded-card layouts. The positive style that results (flat colour fields, huge left-anchored type, square corners, photographs, no chrome) is a recognisable "Awwwards poster" look. The pipeline additionally draws from a fixed library (20 directions, 56 palettes, 44 type systems), so many outputs will cluster inside that set. The library itself leans on a short list of faces (Switzer 7 uses, Archivo 6, General Sans 4, Hanken Grotesk 4, Work Sans 4, Cabinet Grotesk, Bricolage Grotesque). Impeccable's detector lists several in this neighbourhood as the "newer monoculture" (Geist, Instrument Sans, Plus Jakarta); the v1 classic forces "Geist, Outfit, Cabinet Grotesk, or Satoshi" (`taste-skill-v1/SKILL.md`, Rule 1).
- **Marketing-page bias.** The default run is built for landing pages, portfolios, events (`SKILL.md:48-50`). The app-screen chapter is a late addition (2.1.0). Rules about hero images, scroll scenes, 8+ moving elements, live widget, archival photographs and "find real pictures in open collections" are the wrong default for a product UI used daily.
- **Motion requirement contradicts "ship usable".** Step 9 "is required": the inspector fails a page under 8 moving elements (`SKILL.md:337-339`). Mandatory choreography for every page conflicts with app screens' "no orchestrated page-load" norm (impeccable's rule 20) and with accessibility-first products.
- **Rules conflict by context, needing carve-outs.** The house table bans 1px lines, monospace, numbering, shadows, then `app-screens.md:1118` re-allows 1px borders, row rules, mono IDs, shadows on floating layers, rows of identical cards, and a gradient under a line chart. The `--allow` flag and `data-ui` marker are escape hatches the agent must remember.
- **Evidence contradicts adoption.** Its own test shows 0-1 wins out of 3-4 briefs against no skill in 4 of 5 rounds. The author's remedy was to add "substance" rules rather than demonstrate a win.
- **Circular validation.** The inspector measures the bans, then reports builds as "0 FAIL"; critique caps then reward the same rules. Judges are models viewing stills.
- **Context bloat and variance.** SKILL.md alone is 9.6K tokens; the motion reference is 55KB and imagery 51KB. "Read that file whole" for app screens (85KB). The classic skills (v1 227 lines, v2-experimental 1229 lines) ship in the same repo; only `disable-model-invocation` keeps them from colliding.
- **Dependencies.** Needs Node 22+, Chrome/Edge/Chromium, network for pictures. `assets.mjs` fetches third-party images (licence/credit handling is documented, but this is a supply-chain and attribution burden).
- **Overlap with Anthropic frontend-design.** Strong agreement on bans (cream+terracotta, eyebrows, numbered markers, single accented word, mono labels, fade-and-slide on every section). Differences: Anthropic says "use one family or two" and treats those defaults as defaults where "the brief's own words always win"; taste-skill makes them hard FAILs ("whatever the direction") except for explicit brand assets via `--allow`. Taste-skill demands a dice-rolled direction, Anthropic asks the agent to plan and self-review. Both would trigger on the same requests.
- **Description is very long** and trigger-greedy (names every framework and the phrases "looks generic", "AI-made"), which on a shared machine means it fires broadly.

## 6. Verdict (taste-skill)

| Dimension | Score /10 | Note |
|---|---|---|
| Concreteness | 8 | Real numbers throughout (clamps, ms, ch, proportions, colours, thresholds), most traced to measured data. App-screens chapter is the best numeric spec of the two repos. |
| Method quality | 6 | Good pipeline (argument, idea sentence, competitor test, real browser gate, screenshot critique with caps), but the evidence says the pipeline does not beat a no-skill baseline, and ten mandatory steps plus script dealing is heavy. |
| Breadth | 6 | Pages and app screens plus redesign/review; no component-level, forms, accessibility audit, copy/UX-writing depth, design-system capture or native. |
| Context cost (10 = cheap) | 4 | 10K base, 30-50K for a full page run, 31K+ for an app screen; no trivial-change path. |
| Style neutrality | 3 | Hard-coded house style and a fixed library; owner's taste is declared as rule. |

**Verdict.** Taste-skill is a well-researched art-direction kit with unusually honest evidence notes and the best concrete numbers in this pair, especially `references/app-screens.md` (type table, border and text-tier values, "colour on data not chrome", honest data states) and the motion and type tokens. As a skill to install and run as written it is a poor fit for "a product its users can use well, shipped fast": it is page-first, forces a rolled direction plus mandatory motion and pictures, enforces a narrow flat/no-rules house style as FAIL conditions, and its own A/B data show it does not beat a plain agent. Mine it for numbers and the critique rubric. Do not install the default skill globally alongside Anthropic's frontend-design.

---

# Comparison notes

| | Impeccable | taste-skill |
|---|---|---|
| Core bet | Process and project memory (modes, briefs, contracts, gates) | Researched art-direction library + measurable bans |
| Where the numbers are | Rust detector, few tables | Reference prose, tokens, inspector |
| Anti-monoculture mechanism | `concept-seed` dice, standing exit, "brief wins" | `draw.mjs` dice from fixed library, bans, "adopt it, don't blend" |
| Product UI support | Operate mode, `operate.md` (short, generic) | `app-screens.md` (85KB, measured, very concrete) |
| Evidence | Protocol compliance and activation recall; no output-quality A/B | Gallery studies + blind model-judge A/B that shows no win vs baseline |
| Cost to adopt | Binary + project files + subagents | Node 22 + Chrome + network + library |
| Overlap with Anthropic frontend-design | Superset of its calibration list; same "brief wins" | Superset of its tells; stricter than "brief wins" |

If the user wants to distill rather than install, the highest-value extracts are:
1. Impeccable: modes (esp. Operate), craft-floor Verify and Refuse lists, brief-wins and refine-vs-redesign semantics, isolated reviewer, `detect` as an optional CLI linter.
2. Taste-skill: `app-screens.md` sections 9, 13, 14; `colour.md` proportions; `type.md` section 7; `motion.md` sections 3-4 tokens; `critique.md` passes 1-14 and caps.

---

# Shared knowledge

Rules both repos agree on (and that Anthropic's frontend-design mostly also says):

1. **Brand and brief outrank house bans.** Impeccable `SKILL.src.md:29`; taste-skill `SKILL.md:465-468` (`--keep palette,type`, `--allow`); Anthropic "the brief's own words always win".
2. **No eyebrow or kicker label above headings.** Impeccable `craft-floor.md:27`, detector `kicker-above-heading`; taste `SKILL.md:385`, `tells.md` section 2.
3. **No 01/02/03 section numbering** unless the content is truly a sequence. `craft-floor.md:28`; `SKILL.md:387`.
4. **No gradient text**, and no decorative glow or glass. `craft-floor.md:33-34`, `dark-glow`; `SKILL.md:389-394`.
5. **No identical icon+heading+text card grids as page structure**; nested cards are wrong. `craft-floor.md:25`; `SKILL.md:393`.
6. **No cream ground with terracotta accent and no purple/indigo gradients as defaults**; detector rules `cream-palette`, `ai-color-palette`; taste inspector HSL rules. Both say warmth should come from somewhere deliberate.
7. **Monospace is for code and data, not a "technical" costume.** `craft-floor.md:38`; `SKILL.md:386`.
8. **Don't fake imagery.** Real or authored assets, not chrome standing in (impeccable `new-work.md:130`, `craft-floor.md:41`; taste `SKILL.md:449-452`, no fake grey-bar dashboards).
9. **Don't invent claims.** Prices, customers, logos, stats, quotes are off limits; sample demo content is allowed if labelled. `new-work.md:59`; `SKILL.md:221-222`.
10. **Body measure about 45-75 characters, 16px-ish body floor, balanced headings, tight display tracking (roughly -0.02 to -0.05em), left-aligned prose.** `craft-floor.md:12`, `typeset.md:46-47`; `SKILL.md:421-428`, `type.md`.
11. **Contrast 4.5:1 body, 3:1 large.** `craft-floor.md:9`; `colour.md` section 8.
12. **Exponential ease-out (cubic-bezier .16,1,.3,1 family), no bounce or elastic, one authored moment rather than identical fade-up on every section, always a reduced-motion path, content visible if scripts fail.** `craft-floor.md:13`, `animate.md:56-77`; `motion.md` sections 1, 4, 8, 9.
13. **Feedback durations by frequency: roughly 100-160ms press, 150-250ms hover and menus, 300-500ms overlays, 500-900ms authored reveals; exit faster than enter.** `animate.md:56-61`; `motion.md:88-101`.
14. **Product UI is quiet and conventional:** accent for actions and data only, one type family, tight scale, restrained colour, standard controls, states (loading, empty, error) designed. Impeccable `operate.md`; taste `app-screens.md` section 13.
15. **Group by proximity; space above a heading larger than below; rhythm from tight vs generous.** `craft-floor.md:11`, `layout.md:49,54`; `type.md` section 7.
16. **Colour holds a role; accent used sparingly.** Impeccable Restrained default and "rarity gives an accent force" (`colorize.md:10`); taste accent under 5% (`colour.md:58`).
17. **Verify by looking at rendered screenshots at multiple widths, batch fixes between looks, cap the number of rounds** (impeccable two rounds, `new-work.md:140`; taste three rounds, `critique.md` section 6), and treat a deterministic linter as a floor, not proof of quality. A separate-context reviewer is a plus in impeccable.
18. **The idea must come from the subject, not the category.** Impeccable `new-work.md:45` (rut = "the page this category always ships"), `bolder.md` skeleton test; taste competitor test (`SKILL.md:180-185`).
19. **Design real states, real copy and real content;** controls are named for their action. `craft-floor.md:14,16`; `SKILL.md:216-219, 298`.
20. **Both warn that merely removing tells is not enough** (impeccable "avoidance aesthetic" in the calibration paragraph, `new-work.md:69`; taste `tells.md` section 8). Replace the gap with a decision.

Where they disagree (do not merge blindly): impeccable allows gradients, shadows and rounded cards when the world earns them and sets card radii 12-16px; taste bans resting shadows and gradients and prefers square or fully round. Impeccable pushes Persuade pages toward committed bold colour and imagery generation; taste requires real archival photography and at least 8 moving elements.
