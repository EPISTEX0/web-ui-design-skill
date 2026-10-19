# Deep read B: ui-ux-pro-max, hallmark, Vercel web-design-guidelines, userinterface-wiki, frontend-design (baseline)

Method notes. All reading was static; no clone code was run (I did not run `search.py`, so the `--design-system` output was inferred from `design_system.py` and the CSVs, not sampled live). CSV statistics were computed with `python3 -I` reading the data files only. The Vercel rules were pulled raw with `curl` (not WebFetch) so line numbers are exact; saved at `fetched/vercel-command.md`. Token estimates use ~4 bytes per token.
Path shorthand: UXPM = `nextlevelbuilder_ui-ux-pro-max-skill/.claude/skills/ui-ux-pro-max`; HM = `nutlope_hallmark/skills/hallmark`; WIKI = `raphaelsalaja_userinterface-wiki/skills`; FD = the local frontend-design SKILL.md; VC = `fetched/vercel-command.md`.

---

## 1. nextlevelbuilder/ui-ux-pro-max-skill (data-backed CSV + BM25 CLI)

### Architecture and context cost
- On trigger: `UXPM/SKILL.md`, 214 lines / 16 KB (~4k tokens). Frontmatter description is long (lists counts), so the description itself costs catalog tokens in every session.
- On demand: `references/quick-reference.md` (256 lines, 24.5 KB, ~6k tokens, full rule list for 10 categories), `references/pro-rules.md` (117 lines, 11 KB, ~2.7k tokens), and the Python CLI `scripts/search.py` (BM25 over CSVs, stdlib only, needs `python`/`python3` and `${CLAUDE_PLUGIN_ROOT}`). Data never loads into context unless a query returns rows (default `MAX_RESULTS = 3`, `core.py:16`).
- Data on disk: styles.csv 88 rows (50 active, 29 supplemental, 9 deprecated), colors.csv 192, typography.csv 74, ux-guidelines.csv 119, products.csv 192, ui-reasoning.csv 192, landing.csv 34, motion.csv 17 (GSAP), charts 25, icons 105, google-fonts 1,934, plus 22 stack CSVs (1,294 rows total). About 2.5 MB, 0 tokens until queried.
- Realistic per-task cost: ~4k always + 2-4 CLI calls (~1-3k tokens each) = roughly 8-14k tokens. Cheap, but costs tool-call round trips and a Python dependency. The repo is also a large product (npm CLI, gallery Next app, 7 other skills such as `ui-styling`, `banner-design`, `slides`, `brand`), all irrelevant to a design-quality install.

### Method it imposes
Query-driven. Quoted steps:
- "Choose the smallest search mode that fits the request: 1. **New project/page or system-wide visual direction** → use `--design-system`. 2. **Targeted concern** → one explicit `--domain`. 3. **Known implementation stack** → use `--stack`" (SKILL.md:51-55).
- "Build each query around **one dominant intent**, using **2-5 meaningful terms** ... **Retry once** ... If that retry fails, state that no verified match was found ... **Do not persist unverified output.**" (SKILL.md:57).
- Step 1 analyze (product type, audience, style keywords, stack; "**Never assume a stack**", :71). Step 2 "Generate Design System (REQUIRED for new pages/projects)" (:73). Step 2b persist `design-system/<slug>/MASTER.md` plus per-page overrides (:88-109). Step 2c three 1-10 dials `--variance --motion --density` (:111-127). Step 3 supplementary domain searches, Step 4 stack guidelines, then "synthesize the design system + detailed searches and implement" (:189).
- There is no visual verification step, no screenshot critique, no "does this look generic" check. Only the app-UI pre-delivery checklist (`pro-rules.md:78-117`), and that file's own scope notice (line 3) says it targets native/mobile app UI, so web has no checklist.

### Most load-bearing rules and values
1. Priority order: Accessibility, Touch, Performance, Style, Layout, Typography/Color, Animation, Forms, Navigation, Charts (SKILL.md:20-31).
2. Contrast 4.5:1 normal text, 3:1 large (`references/quick-reference.md:9`).
3. Touch target 44x44pt / 48x48dp, 8px gaps (qr:37-38); web pointer target 24x24 CSS px per WCAG 2.2 (qr:28).
4. Focus ring 2-4px visible (qr:10); focus must not be obscured by sticky UI (qr:~25).
5. Body 16px, line-height 1.5-1.75, line length 65-75 chars (qr:117-118, qr:98-99).
6. Type scale example 12/14/16/18/24/32; weights bold headings 600-700, body 400, labels 500 (qr:~121-123).
7. Spacing 4pt/8dp scale (qr:101); z-index scale 0/10/20/40/100/1000 (qr:~104); breakpoints 375/768/1024/1440 (qr:~97).
8. Semantic color tokens, no raw hex in components (qr:~124); dark mode uses desaturated tonal variants, not inverted (qr:~125).
9. Animation: transform/opacity only (qr:137), 1-2 animated elements per view (qr:139), exit ~60-70% of enter duration (qr:146), stagger 30-50ms (qr:147), press scale 0.95-1.05 (qr:~154), tap feedback under 100ms.
10. Forms: visible labels, validate on blur, error below field with `aria-describedby`, focus error summary after failed submit (qr:171-190).
11. Charts: no pie above 5 categories, tabular alternative, direct labeling, gridlines low contrast (qr:~233-255).
12. `motion.csv` row 1: hover micro-interaction 150-200ms, `power1.out`, displacement under 2px; row 6: pin at most 1-2 sections.
13. `styles.csv` rows carry usable tokens, e.g. Minimalism: `--spacing: 2rem, --border-radius: 0px, --shadow: none`; Vibrant: 48px+ gaps, 32px+ type, 7:1 contrast.
14. `--density` dial remaps spacing: spacious 24-96px, standard 16-64px, dense 8-32px (SKILL.md:119-123).
15. Retrieval discipline: 0-result searches must be labeled as fallback, never presented as data (SKILL.md:167-172).
16. Pre-delivery checklist items: 375px test, reduced motion, dark mode contrast checked independently (pro-rules.md:78-117).

### Data quality (sampled)
- **colors.csv (192 palettes) is generic and mostly mechanical.** Distinct values: Primary 50, Accent 33, Background 33, Foreground 34. `Muted Foreground` is `#475569` in 148 of 192 rows (77%) and `#94A3B8` in 42 more, so 99% of palettes share two muted values. Destructive is `#DC2626` in 172 rows. Primary `#2563EB` appears 17 times, `#7C3AED` 16 times. Backgrounds are Tailwind 50-shades (`#F8FAFC` in 32 rows). These are Tailwind-token palettes keyed by industry name ("Trust blue + orange CTA"), not designed palettes.
- Errors: 6 rows have Primary equal to Accent (Dental Practice, Bakery/Cafe, Sports Team/Club, Museum/Gallery, Spatial Computing OS, Sustainable Energy). Notes disagree with values: Sports Team/Club says "Team red + championship gold" but Accent is `#DC2626` (same as Primary). Many accents are tagged "[Accent adjusted from #CA8A04]", i.e. auto-adjusted for contrast, which leaves a gold that is now `#A16207` brown. Border column mixes `rgba()` and hex.
- **typography.csv (74 pairings) is the strongest dataset.** Each row has heading/body, mood keywords, best-for, Google Fonts URL, CSS import and Tailwind config, so it is directly pasteable. Pairings are mostly well-known (Playfair+Inter, JetBrains Mono+IBM Plex Sans, Crimson Pro+Atkinson Hyperlegible, Barlow Condensed+Barlow). But Inter is the body font in 7 rows and heading in 5; Space Grotesk, Outfit and Plus Jakarta Sans repeat. Some rows embed whole type scales (Material You row: Display Large 56/400/64).
- **styles.csv (88 rows) is rich per row**: 29 columns incl. do-not-use-for, CSS keywords, implementation checklist, design-system variables, light/dark support, accessibility risk flags, status/deprecation with replacement IDs. The style catalogue is trend-labelled (Glassmorphism, Claymorphism, Bento, Brutalism, "Interactive Cursor Design") and each style's prompt text is keyword-soup ("Use: white space, geometric layouts, sans-serif fonts, high contrast...").
- **ui-reasoning.csv (192)** drives `--design-system`. Only 31 of 192 rows have a `Reasoning` and `Confidence` filled; the rest are empty. Style priority is skewed: first-choice style is Minimalism & Swiss in 40 rows, Vibrant & Block 26, Flat 21, Dark OLED 19. The SaaS default is "Glassmorphism + Flat Design" with anti-pattern "Excessive animation + Dark mode by default". Decision rules are JSON like `{"if_ux_focused":["style:minimalism-and-swiss-style"]}`, a real mechanism but mostly one-liners.
- **ux-guidelines.csv (119)**: good Do/Don't/code-good/code-bad columns. Severity is inflated: Critical 4, High 44, Medium 62, Low 9; "Smooth Scroll" is High. Accessibility (20 rows) is current to WCAG 2.2.
- **Provenance and tests are unusually serious**: `data-provenance.json`, `validate_data.py`, relevance metrics, 148 Python tests, journals admitting "green was not enough" (`docs/journals/260813-1800-...md`). The relevance gate is called "provisional" and the second human judgment review has not happened.
- Verdict on data: the structure (CSV with do/don't, code, flags) is good engineering; the aesthetic content (palettes, product-to-style mapping) is generic and mean-regressing. Use typography.csv, ux-guidelines.csv, motion.csv and the a11y rules; do not take palettes or style recommendations as design direction.

### Weaknesses
- Palettes and product-to-style map reproduce the default look: slate/blue/emerald, Minimalism or Glassmorphism for SaaS. For "beautiful" this is the generic baseline, not an escape from it.
- Search by BM25 on keyword columns; the skill itself has to warn that auto-routing misroutes ("font" hits two domains, SKILL.md:155) and spends ~25 lines on query craft (:49-63, accessibility and text-layout special cases). That is tool friction the agent pays on every use.
- 22 stacks, SwiftUI/WPF/WinUI/Flutter, GSAP presets, mobile-first Apple/Material rules (44pt, safe areas, bottom nav max 5, tab bars) dilute a web-only goal. `pro-rules.md` is native-app-only.
- Dependency chain: Python, `${CLAUDE_PLUGIN_ROOT}` path convention (breaks if installed outside plugin), and the plugin ships 8 skills.
- No taste mechanism: nothing says "reject the generic result", no self-critique, no screenshots.

### Scores (0-10)
Concreteness 6 | Method quality 5 | Breadth 9 | Context cost 7 | Style neutrality 5

**Verdict.** It is the best lookup table in the field and the worst designer. It is excellent as a reference for a11y, forms, charts, stack-specific gotchas and ready-to-paste font pairings, and the engineering around data quality is real. But the aesthetic output (palettes, style picks) is the average of Tailwind defaults and trend names, and the method is "query, synthesize, implement" with no critique step. Mine it for typography.csv, ux-guidelines.csv and quick-reference.md; do not install it as the design brain.

---

## 2. nutlope/hallmark (anti-slop design skill)

### Architecture and context cost
- On trigger: `HM/SKILL.md`, 558 lines / 67 KB (~17k tokens). This is the largest single trigger payload in my set (4x ui-ux-pro-max, 7x frontend-design).
- Reference set: 100+ files, 190 KB for the universal ones plus ~690 KB total. SKILL.md instructs index-then-pick loading (SKILL.md:348-391). A typical page build loads: SKILL.md 67K + typography 18K + color 4K + layout 7K + motion 4K + copy 12K + anti-patterns 26K + genre 5K + macro index 12K + one macro 2K + cookbook "slim index" 31K + 5-7 component files ~10K + microinteractions 20K (if any interaction) + interaction-and-states 13.5K + responsive 6K + slop-test 31K + contract 2K, plus a theme spec of 11-32 KB when one exists. Estimate 270 KB, roughly 65-70k tokens per page build. Component-scope builds are cheaper but still pay for SKILL.md.
- It reads and writes project files: `.hallmark/preflight.json`, `.hallmark/log.json`, `tokens.css`, a CSS stamp comment, optional `design.md`.

### Method it imposes (quoted)
- Four verbs: default build, `audit` (no edits), `redesign`, `study <screenshot|URL>` (extract the DNA, never copy pixels) (SKILL.md:21-30).
- Six cross-verb disciplines (:44-56): pre-emit self-critique scoring Philosophy/Hierarchy/Execution/Specificity/Restraint/Variety 1-5 with "< 3 triggers a revision pass"; honest copy ("If the user did not supply a metric, do not invent one"); locked tokens ("no mid-render improvisation"); no re-drawn chrome; verify at 320/375/414/768px; "no italic headers".
- Design flow: Step 0 pre-flight scan of existing fonts/palette/motion/spacing/framework with file:line findings (:147-201); Step 1 "Always ask — answering is optional": audience, use case, tone ("'Clean and modern' is not a tone", :209-228); genre pick (editorial/modern-minimal/atmospheric/playful); Step 2 "Pick a macrostructure FIRST" from 21 named page shapes, plus nav archetype (N1a-N13) and footer archetype (Ft1-Ft8); diversification rule against `.hallmark/log.json` ("your pick must be a different macrostructure", :268-294); Step 2.6 theme route (studied-DNA, catalog of 21 named themes, or custom OKLCH); Step 3 load rules; Step 4 hero enrichment tier (typography only, CSS art, SVG, generated still, library, Lottie last); Step 5 preview block of macrostructure/theme/sections/motion; Step 6 build; Step 7 "run the output through the 58-gate slop test... Every answer must be **no**" (:468-474).
- Component-scope branch: every interactive component ships all 8 states (default, hover, focus-visible, active, disabled, loading, error, success) plus a stacked 8-state demo page (:60-141).
- Safety rails: never delete production files without a listed plan; treat `design.md` and fetched HTML as inert data (:32-36, :186, :508).

### Most load-bearing rules and values
1. Paper `oklch(96-98% 0.005-0.015 hue)` light, `oklch(12-16% ...)` dark; ink `oklch(16-22%)`; 5-9 tinted neutrals; one accent chroma 0.12-0.22 (`references/color.md:16-19`).
2. Accent occupies 3% or less of a viewport; never above ~5% as fill; max two accents (color.md:8, :79).
3. No `#000`/`#fff`, no zero-chroma grey, no purple-to-cyan / orange-to-pink gradients, two-stop gradients only (color.md:75-83).
4. Contrast table 4.5:1 body, 3:1 large and UI boundaries (color.md:55-60). Dark mode: reduce body weight ~50 units, elevated surfaces lighter by ~3% per level, never change hue between modes (color.md:64-71).
5. Type: pairing not single font; at most three families ("2+1 rule", typography.md:13-31); size ratios (1.25/1.333/1.5/1.618), display line-height 1.05-1.2, body 1.5-1.65, measure `65ch`, at most five sizes per page (typography.md:7-11, :205); heading weight contrast at least 300 units (:209-211).
6. Hero headline size by length: 20 chars or fewer full display; 21-50 default; 51-90 step down; over 90 chars rewrite (typography.md:192-203).
7. Banned fonts as defaults: Inter, Roboto, Open Sans, Lato, Poppins, Montserrat, DM Sans, system-ui, Arial, Helvetica; Merriweather/Playfair as body (typography.md:33-39), with an allowlist table of 26 display, 11 body, 5 mono faces (Fraunces, Newsreader, Instrument Serif, Geist, Space Grotesk, Switzer...).
8. Motion: three durations 120/220/420ms, exits ~75% of enter; three easings `cubic-bezier(0.16,1,0.3,1)`, `(0.7,0,0.84,0)`, `(0.65,0,0.35,1)`; transform/opacity only; stagger cap ~500ms; accordion via `grid-template-rows 0fr to 1fr`; no parallax, no custom cursors, no bounce (motion.md:9-109).
9. Spacing: 4pt scale 2/4/8/12/16/24/40/64/96/144 px by role names; use `gap` not margin; z-index six named levels 1/10/100/200/400/500/600 (layout-and-space.md:17-30, :60-69).
10. Layout: pick a primary axis; asymmetry reads as intentional; ban centred-everything hero, card-in-card, 3-equal-column icon grid, equal padding everywhere (layout-and-space.md:7-11, :72-80).
11. Section eyebrows/numbered tags default OFF; tag-left/heading-right pattern banned (SKILL.md:450; anti-patterns.md:145-153).
12. Copy: specific verbs, error = what happened + why + what to do, empty state in three beats, bans "Oops!", "Click here" (copy.md:5-50).
13. Hard floor: `overflow-x: clip` on html and body, never hidden; `minmax(0,1fr)`; no two-line buttons; focus ring at least 3:1 and never animated (SKILL.md:54, :458; layout-and-space.md:88-102).
14. Microinteractions: silent success over toasts; optimistic update plus Undo over confirm dialogs; tooltip hover delay 800ms, focus 0ms; at most three animation primitives per page (microinteractions.md:11-12, :34-37).
15. Honest content: no invented metrics, testimonials or logos; placeholders instead (SKILL.md:48).
16. Locked tokens: every colour and `font-family` must be a `var(--token)`; always emit `tokens.css` (SKILL.md:50, :464).

### Data quality
Not a dataset; it is prose rules plus 21 theme token blocks (`site/css/tokens.css`) and 13 demo builds. The 58 gates and named anti-patterns (about 40) are specific and checkable. No automated evaluation exists (only manual `site/_tests` builds and a live demo); the ROADMAP lists "Live preview as an MCP server... feed the screenshot back for self-critique" as future work, so the skill currently does not close the loop with real rendering.

### Weaknesses
- **Context bloat**: ~17k always plus ~50k per build; the skill itself warns "over-eager loading is the largest avoidable cost" (:350) and "Loading the cookbook end-to-end... is the single biggest token waste" (:358). The "slim index" `component-cookbook.md` is 31 KB.
- **House-style monoculture, ironically.** The default genre is editorial (serif display on warm paper), and the catalog defaults are warm cream plus orange/coral/terracotta: Specimen `oklch(96% 0.018 80)` + `#FC4C02` (tokens.css:16,25), Garden oat cream, Studio, a "warm cream" theme with coral `oklch(60% 0.160 35)` (tokens.css:872-881), a terracotta-coral theme (:665-674). That is the exact "cream background with terracotta accent" cluster the Anthropic baseline names as a generated-design tell (FD:39). Geist appears as display in at least 5 themes, with Inter/Inter Tight as listed fallbacks despite the Inter ban. Playfair Display is the display face in two themes despite "banned as body".
- Forced rotation and ask-always gate (:211-228, "There is no 'the brief looks complete' exception") add friction; it also mandates different macrostructure and nav from the last build, which actively conflicts with brand consistency in a multi-page product (acknowledged in ROADMAP "Multi-page coherence"; `design.md` inverts it).
- Optimized for marketing/landing pages and editorial sites. Product UI, dashboards and charts get little (ROADMAP: "Hallmark currently has nothing to say about [charts]").
- Rule inflation: 58 gates, stamps in CSS, `.hallmark/log.json` bookkeeping, "stamp lies" audit. A lot of ceremony for outcomes the model can judge from screenshots.
- Some bans are taste dogma presented as fact: all parallax, all custom cursors, all italic headings, all hanging headers, all shadow stacking.
- Credibility: claims "57" gates (README) vs "58" (SKILL), "Powered by Together AI" branding in the skill body.

### Scores
Concreteness 8 | Method quality 7 | Breadth 6 | Context cost 2 | Style neutrality 3

**Verdict.** The most thoughtful anti-slop method of the set: ask for audience/use/tone, commit to a named structure before styling, state picks aloud, build from locked tokens, self-critique, run a gate list. Its rules on colour, type, motion and spacing are specific and mostly right. The price is a heavy, opinionated machine (65k+ tokens, rotation bookkeeping) and a recognizable house style that drifts toward the cream-and-coral editorial look it claims to avoid. Steal its principles, its numbers and its anti-pattern list; do not run the full workflow as-is.

---

## 3. vercel-labs/agent-skills `web-design-guidelines` (+ fetched rules)

### Architecture and context cost
- `skills/web-design-guidelines/SKILL.md` is 39 lines / 1.2 KB (~300 tokens). It only says: "Fetch fresh guidelines before each review" from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` using WebFetch, read the user's files, apply all rules, output `file:line` findings (SKILL.md:14-39).
- The fetched `command.md` is 191 lines / 8 KB (~2k tokens) with ~100 rule bullets; total cost ~2.5k tokens, the cheapest of the set, but it needs a network call every time, pulls instructions from a mutable `main` branch (supply-chain/prompt-injection surface, mitigated only by trusting Vercel), and WebFetch passes the page through a summarizing model unless the prompt asks for verbatim output, so the agent may apply a lossy summary of the rules. Same pattern ships for `writing-guidelines`.
- It is a reviewer, not a designer. Nothing in it helps decide how the UI should look.

### Method
Review only: "1. Fetch the latest guidelines 2. Read the specified files 3. Check against all rules 4. Output findings in the terse `file:line` format" (SKILL.md:16-19). Output spec: "Group by file. Use `file:line` format... State issue + location. Skip explanation unless fix non-obvious. No preamble." (VC:171-191). "Sacrifice grammar for brevity. High signal-to-noise." (VC:10).

### Most load-bearing rules (VC = fetched command.md)
1. Icon-only buttons need `aria-label`; decorative icons `aria-hidden="true"` (VC:16, :21).
2. `<button>` for actions, `<a>`/`<Link>` for navigation, never `<div onClick>` (VC:19, :158-159).
3. Never `outline: none` without a focus replacement; use `:focus-visible`; sticky UI must not cover focus (VC:32-35).
4. Animate `transform`/`opacity` only; never `transition: all`; honor `prefers-reduced-motion`; animations interruptible (VC:53-58).
5. Forms: correct `type` and `inputmode`, never block paste, labels clickable, errors inline and focus first error, submit stays enabled until request starts (VC:40-46).
6. Placeholders end with `…` and show an example pattern; loading text ends with `…` (VC:47, :67).
7. Typography: `…` not `...`, curly quotes, `&nbsp;` in `10 MB` and `⌘ K`, `tabular-nums`, `text-wrap: balance` on headings (VC:64-69).
8. Content handling: flex children `min-w-0`, `truncate`/`line-clamp`, handle empty strings/arrays, anticipate short/average/very long user content (VC:73-76).
9. Images: explicit `width`/`height`, below-fold `loading="lazy"`, hero `fetchpriority="high"` (VC:80-82).
10. Performance: virtualize lists over 50 items, no layout reads in render, preload critical fonts with `font-display: swap`, video over GIF (VC:86-92).
11. URL reflects state (filters, tabs, pagination); deep-link stateful UI; destructive actions need confirm or undo window (VC:97-100).
12. Touch: `touch-action: manipulation`, `overscroll-behavior: contain` in modals, gesture actions need keyboard alternatives (VC:104-109).
13. `env(safe-area-inset-*)` for full-bleed, `color-scheme: dark`, `<meta name="theme-color">` matching background (VC:114, :120-121).
14. i18n: `Intl.DateTimeFormat`/`Intl.NumberFormat`, language from `Accept-Language` not IP, `translate="no"` on brand/code tokens (VC:126-129).
15. Hydration safety: `value` needs `onChange`, guard date rendering, limited `suppressHydrationWarning` (VC:133-135).
16. Copy: active voice, "Title Case for headings/buttons (Chicago style)", numerals for counts, specific labels ("Save API Key" not "Continue"), errors include next step, second person (VC:144-150).
17. Anti-pattern list: `user-scalable=no`, `onPaste` preventDefault, `transition: all`, images without dimensions, `.map()` over large arrays, `autoFocus` without justification (VC:152-167).

### Data quality
Short, checkable, mostly correct. Internal inconsistencies: "Inputs need `autocomplete` and meaningful `name`" (VC:39) versus "`autocomplete="off"` on non-auth fields to avoid password manager triggers" (VC:48), which fights autofill and WCAG 1.3.5; "`overflow-x-hidden` on containers" (VC:115) versus the better `overflow-x: clip` (HM layout-and-space.md:95-98); "Buttons/links need `hover:` state" (VC:139) conflicts with touch-first practice. React/Next/Tailwind assumptions throughout (`onKeyDown`, `htmlFor`, `focus-visible:ring-*`, `nuqs`, `virtua`, `priority`).

### Weaknesses
- No aesthetic guidance at all: no palette, type scale, spacing, hierarchy, layout composition. It will pass an ugly page.
- Runtime network dependency and mutable-main risk; no version pin.
- No method for building, only for review.
- Title Case buttons is a Vercel house style.

### Scores
Concreteness 9 | Method quality 5 | Breadth 3 | Context cost 9 | Style neutrality 8

**Verdict.** A cheap, precise code-hygiene linter. It stops the mechanical failures an agent makes (div buttons, outline none, missing alt, transition all, hardcoded date formats) and the format is good for review output. It does nothing for beauty. Best use is to copy the 100 bullets into a local, pinned `references/` file of a review pass instead of fetching at runtime.

---

## 4. raphaelsalaja/userinterface-wiki

### Architecture and context cost
- `WIKI/SKILL.md`: 253 lines / 14 KB (~3.5k tokens), a rule index of 152 one-line bullets across 12 priority categories (SKILL.md:30-233). Description says "11 categories" (:3) while the body says 12 (:12, :30-43); the inventory said ~104 rules; `rules/` actually has 154 files (~85 KB total, avg ~550 bytes). Counts are inconsistent.
- On demand: each `rules/<id>.md` has frontmatter (title, impact, tags), one explanation, Incorrect code, Correct code, sometimes a reference. `AGENTS.md` (87 KB, ~22k tokens) is the compiled full text; avoid loading.
- Realistic cost: 3.5k always + a few small rule files = 4-6k tokens. The rest of the repo is a Next.js docs site (not part of the skill).

### Method
Review/reference only. "Read individual rule files for detailed explanations and code examples" (:237-244); outputs `file:line` findings. Priority order: Animation Principles (CRITICAL), Timing Functions, Exit Animations, Pseudo Elements, Audio, Sound Synthesis, Morphing Icons, Container Animation, Laws of UX, Prefetching, Typography, Visual Design (:30-43). No build workflow, no design-system step.

### Most load-bearing rules and values
1. User animations complete within 300ms (`timing-under-300ms`, SKILL.md:49; `duration-max-300ms`, :75).
2. Press/hover 120-180ms; small state change 180-260ms (:73-74); fix slow feel by shortening duration, not the curve (:76).
3. No animation for high-frequency interactions or keyboard navigation; context menus have no entrance, exit only (:77-79).
4. Springs for gesture-driven and interruptible motion; easing for system state changes; ease-out entrance, ease-in exit (:64-70).
5. `:active` scale on interactive elements, squash/stretch within 0.95-1.05 (:54-55; `physics-subtle-deformation.md` shows 0.98 not 0.8).
6. Stagger under 50ms per item, one focal animation at a time, dim modal backdrops (:57-59).
7. Exit animation mechanics for Motion/Framer: AnimatePresence wrapper, exit prop, `mode="wait"` doubles duration (:83-94).
8. Container bounds animation: two-div pattern, ResizeObserver, `overflow: hidden` while animating (:161-167).
9. Fitts: targets minimum 32px, expand hit area with pseudo-elements; Doherty: respond within 400ms, skeletons/optimistic UI (:171-176).
10. Typography: tabular nums for data, oldstyle for prose, `text-wrap: balance` headings and `pretty` body, `font-synthesis: none`, `font-display: swap`, letter-spacing on uppercase (:206-221).
11. Visual: concentric radius = outer radius minus padding (`visual-concentric-radius.md`); layered shadows with single light direction, never pure black; consistent spacing scale; semi-transparent borders; six-layer button shadow anatomy (`visual-button-shadow-anatomy.md`: 0.5px outer cut, 1px inset highlights, 3+ external shadows) (:225-233).
12. Audio feedback rules with numbers: default volume 0.3, click 5-15ms, filter 3000-6000Hz, Q 2-5, exponential ramps target 0.001 (:126, :142-145, :137).
13. Predictive prefetch by cursor trajectory, not viewport, with touch and keyboard fallbacks (:197-201).
14. Morphing icon spec: exactly 3 SVG lines, 14x14 viewBox (:149-151).
15. Laws of UX bullets (Hick, Miller 5-9 chunks, Jakob, Tesler, Peak-End) (:173-193).

### Data quality
Good for what it covers: bite-size, one-claim-per-file rules with before/after code and usually a primary reference. Many rules are trivial or tautological (`pseudo-content-required`, `exit-key-required`), and some are generic psychology slogans with a tiny code example (`ux-pragnanz-simplify`). Heavy tilt to React + Motion (Framer) APIs. Audio synthesis and morphing-icon categories (about 36 rules) are niche for "beautiful web UI".

### Weaknesses
- No coverage of colour, layout composition, hierarchy, imagery, copy, or page-level direction. Cannot make something beautiful from nothing.
- Counts mismatched (11/12 categories, 152/154/104 rules), so the index is not mechanically verified.
- Niche categories inflate the index (sound, morphing icons, prefetching).
- Some numbers are asserted without nuance ("user animations under 300ms" ignores modals/page transitions).
- Perfect-polish rules such as six-layer shadows lead to over-engineered buttons if applied literally.

### Scores
Concreteness 8 | Method quality 4 | Breadth 4 | Context cost 7 | Style neutrality 7

**Verdict.** A solid micro-polish and motion reference with unusually precise, tested-looking values and a clean per-rule format. As a design skill it is incomplete: it improves how things move, how type is set and how shadows and radii nest, not how the page is composed or colored. Worth cherry-picking the animation, typography and visual rules into a polish pass; do not install it as the main skill.

---

## 5. Baseline: Anthropic frontend-design (local plugin ea10b213686c)

### Architecture and context cost
One file, 71 lines / 9.4 KB (~2.3k tokens), no references, no scripts, no data. Loads fully on trigger. Cheapest creative skill in the set.

### Method (quoted)
- Role framing: "Approach this as the design lead at a design studio known for giving every client a distinct visual identity... take aesthetic risk if justified." (FD:9)
- Ground in subject: "identify [the product] yourself... and confirm with the client... one concrete subject, the design's audience, and the design's primary job" (FD:13).
- "Work in two passes. First, brainstorm a short design plan ... 4-6 named hex values [color]; typefaces and their roles; layout concept with one-sentence prose and ASCII wireframes; principles. Then review that plan against the brief before building: if any part ... reads like the generic default ... revise that part, say what you changed and why." (FD:47-53)
- Build, then "Critique your own work as you build, taking screenshots to review if your environment supports it" and "remove one accessory" (FD:59).
- Priority rule: "Where the brief pins down a visual direction, follow it exactly — the brief's own words always win" (FD:45).

### Most load-bearing rules
1. Open the hero with the most characteristic thing in the subject's world; the big-number-small-label-plus-gradient hero is the default, so use it only if truly best (FD:17).
2. One typeface family or two, and if two, clearly distinct; avoid the default families you would reach for on any project; scale per Elements of Typographic Style (FD:19-21).
3. Line length under 80 characters; serif body gets slightly more line-height (FD:23).
4. Avoid: accenting one word of a headline, all-caps labels, unnecessary labels above content (FD:25-28).
5. Structural devices encode information; numbered markers only for real sequences (FD:30).
6. Motion: "one orchestrated moment"; fade-and-slide-up per section and hover transitions on every card "read as AI-generated"; motion answering an action is welcome (FD:32).
7. Calibration list of five generated-design clusters (cream + serif + terracotta `#D97757`; near-black + acid green/vermilion; broadsheet hairline rules; SaaS card kit with identical rounded cards and `rgba(0,0,0,.1)` shadows and gradient washes; template chrome such as ALL-CAPS eyebrows, middle-dot meta strings, `WORD — fragment` labels, tinted near-black `#0B0B0B/#111`, mono data labels, `→` on links) (FD:38-45).
8. Spend boldness in one place; quality floor: responsive, visible keyboard focus, reduced motion, accessible, harmonious palettes (FD:59).
9. Be careful with CSS specificity between `.section` and element selectors (FD:55).
10. Copy rules: active voice, "Save changes" not "Submit", same name through the flow, errors never apologize, sentence case, one job per element (FD:63-71).

### Data quality
No data; the values it gives are the five hex-level calibration examples and the 80-char measure. Concrete about what to avoid, silent on what to do (no scale, spacing, motion durations, contrast thresholds).

### Weaknesses
- Almost no numeric guidance, so output quality depends on the model's taste and the quality of its own critique.
- The calibration list is tied to current model tendencies, will age, and encodes Anthropic's own palette as a tell.
- "Take aesthetic risk" can push fabricated boldness into products that need sobriety (tools, dashboards); the quality floor is one sentence.
- No treatment of product UI (states, forms, data density).

### Scores
Concreteness 4 | Method quality 8 | Breadth 4 | Context cost 10 | Style neutrality 7

**Verdict.** The best method-per-token in the set: plan with tokens, review against the generic default, then build and look at screenshots. It is weak on numbers and silent on product UI. It makes an ideal backbone to which a small rules reference (a11y, motion, type, spacing values) can be attached.

---

## Score table

| Skill | Concreteness | Method | Breadth | Context cost (10 = cheap) | Style neutrality |
|---|---|---|---|---|---|
| ui-ux-pro-max | 6 | 5 | 9 | 7 | 5 |
| hallmark | 8 | 7 | 6 | 2 | 3 |
| Vercel web-design-guidelines | 9 | 5 | 3 | 9 | 8 |
| userinterface-wiki | 8 | 4 | 4 | 7 | 7 |
| frontend-design (baseline) | 4 | 8 | 4 | 10 | 7 |

---

## Shared knowledge (rules 3 or more of the five agree on)

- **Animate only `transform` and `opacity`**, never width/height/top/left: hallmark (motion.md:9), Vercel (VC:54), ui-ux-pro-max (qr:137). The wiki's container-animation rules implicitly treat width/height as a special measured case.
- **Respect `prefers-reduced-motion`**: all five (FD:59, HM motion.md:83-97, VC:53, UXPM qr:20, WIKI `a11y-reduced-motion-check`).
- **Visible `:focus-visible` focus, never remove the outline, sticky UI must not hide focus**: hallmark (SKILL.md:458), Vercel (VC:31-35), ui-ux-pro-max (qr:10, :25), FD:59. Ring at 3:1 contrast is stated by hallmark and ui-ux-pro-max.
- **Never `transition: all`** and do not use one duration for everything: hallmark (anti-patterns "transition-all", slop gate 10), Vercel (VC:55), ui-ux-pro-max (SKILL.md:28).
- **Micro-interaction duration lands around 100-300ms** with exits shorter than entrances: hallmark 120/220/420ms with exit ~75% (motion.md:10), wiki 120-180ms press and under 300ms (SKILL.md:73-75), ui-ux-pro-max 150-200ms hover, exit 60-70% (motion.csv row 1, qr:146).
- **Restraint in motion: one focal or orchestrated moment, no fade-up on everything, cut decoration**: FD:32, hallmark (motion.md:3, microinteractions.md:34-37), ui-ux-pro-max `excessive-motion` 1-2 elements (qr:139), wiki `staging-one-focal-point` (:58).
- **Tabular numbers for data columns**: hallmark (typography.md:217), Vercel (VC:68), wiki (:206), ui-ux-pro-max (qr:129).
- **`text-wrap: balance` on headings**: Vercel (VC:69), wiki (:213), ui-ux-pro-max `heading-line-balance` (qr:~131).
- **Measure around 65-75 characters** (FD says under 80): hallmark `65ch`, ui-ux-pro-max 65-75, FD:23.
- **A named spacing scale (4pt/8dp), no arbitrary values**: hallmark (layout-and-space.md:15-30), ui-ux-pro-max (qr:101), wiki `visual-consistent-spacing-scale` (:231).
- **Specific, active-voice copy; errors say how to fix**: hallmark copy.md, Vercel (VC:144-148), FD:63-71, ui-ux-pro-max `error-clarity` (qr:~187).
- **Contrast 4.5:1 for body text, 3:1 large text/UI components**: hallmark (color.md:55-60), ui-ux-pro-max (qr:9, :~122), FD ("visually accessible").
- **Labels on every input, icon-only buttons need an accessible name, `alt` text, real `<button>` elements**: Vercel (VC:16-20), ui-ux-pro-max (qr:11-12), hallmark (interaction-and-states, a11y gates), wiki (`morphing-aria-hidden`).
- **Do not rely on hover alone / do not convey meaning by colour alone**: hallmark (anti-patterns "Hover-only affordances", color.md:81), ui-ux-pro-max (qr:~38, :14), Vercel (VC:109 gesture alternatives).
- **Reserve space for images/async content (CLS)**: Vercel (VC:80), ui-ux-pro-max (qr:~63), hallmark (responsive and font fallback metrics, typography.md:216).
- **Do not animate or show bounce-style decoration on every control; avoid emoji as icons; consistent icon set**: hallmark (anti-patterns "Mismatched icon sets", "Generic emoji as feature icon"), ui-ux-pro-max (`no-emoji-icons`, qr:81), wiki (`morphing` consistency).

## Contradictions (both sides)

1. **Fonts.** Hallmark bans Inter, Roboto, Poppins, DM Sans, Open Sans, Montserrat, system-ui as defaults (typography.md:33-39). ui-ux-pro-max recommends them constantly: Inter is the body font in 7 of 74 pairings and heading in 5; Roboto/DM Sans/Poppins appear too; and its `html-tailwind` stack leans on defaults. FD says "not the default families you would reach for" without naming any. Hallmark itself falls back to Inter in several themes and uses Geist as display in at least five.
2. **Shadows and depth.** Wiki: layered multi-shadow depth, single light direction, a six-layer button shadow, 3+ external shadows (`visual-layered-shadows`, `visual-button-shadow-anatomy`). Hallmark: "Depth is weight and scale, not shadow... use one... never stack multiple shadows" (layout-and-space.md:53-57). FD: the same soft grey shadow under every card is a tell. ui-ux-pro-max: consistent elevation scale. Wiki and hallmark are directly opposed.
3. **Motion style.** Hallmark bans bounce/elastic/overshoot, parallax, custom cursors, scroll-scrubbed motion (motion.md:99-109). Wiki says springs for gestures and for "overshoot-and-settle" (`physics-spring-for-overshoot`), and ui-ux-pro-max prefers spring/physics (`spring-physics`, qr:~145), ships GSAP pinned scroll scrubbing (`motion.csv` row 6) and a "Interactive Cursor Design" style (`styles.csv` No 62).
4. **Duration ceiling.** Wiki: user animations max 300ms, strictly (`timing-under-300ms`). Hallmark: modal/drawer/accordion 420ms, "major" bucket 300-500ms (motion.md:34, :10). ui-ux-pro-max says avoid treating any single range as universal (qr:~136).
5. **Touch target size.** ui-ux-pro-max: 44pt / 48dp (qr:37) and 24 CSS px for web (qr:28). Wiki: min 32px (`ux-fitts-target-size`). Vercel: none stated. Same repo carries two numbers.
6. **Autofill.** Vercel: inputs need `autocomplete` (VC:39) and also `autocomplete="off"` on non-auth fields (VC:48). ui-ux-pro-max: `autofill-support`, allow password managers and paste (qr:177, pro-rules).
7. **Overflow.** Vercel: `overflow-x-hidden` on containers (VC:115). Hallmark: `overflow-x: clip`, "never `hidden`" because it breaks sticky and traps focus (SKILL.md:54; layout-and-space.md:95-98).
8. **Copy casing.** Vercel: Title Case for headings and buttons, Chicago style (VC:145). FD: sentence case (FD:71). Hallmark specifies verbs but not case.
9. **Process stance: ask vs go.** Hallmark always asks audience/use/tone before building and has "no exception" (SKILL.md:211-228). FD: identify the subject yourself and confirm, but build a plan first. ui-ux-pro-max: never asks except for undetectable stack. Vercel and wiki: n/a.
10. **Variety vs consistency.** Hallmark forces a different macrostructure, theme and nav on each build (SKILL.md:268-294). ui-ux-pro-max: "Use same style across all pages" (`consistency`, qr:~82) and persisted `MASTER.md` as source of truth. Hallmark concedes this in its own design.md mode and ROADMAP.
11. **Glassmorphism.** ui-ux-pro-max makes "Glassmorphism + Flat Design" the SaaS default (`ui-reasoning.csv` No 1, `products.csv` No 1). Hallmark lists "Glassmorphism without purpose" as a major anti-pattern (anti-patterns.md:169) and FD lists gradient washes as card-kit slop. ui-ux-pro-max's own `blur-purpose` rule limits blur to dismissal.
12. **Near-black.** Hallmark requires tinted near-black / tinted neutrals and bans `#000` (color.md:75). FD lists "tinted near-black (#0B0B0B, #111) standing in for black" as a template-chrome tell (FD:43). Both are fighting default dark-mode sameness from different angles; the net advice depends on the brief.
13. **Warm cream + terracotta.** FD calls out cream `#F4F1EA` + serif + terracotta as the first generated-design cluster (FD:39). Hallmark's flagship Specimen theme (`oklch(96% 0.018 80)` + `#FC4C02`, color.md:25, tokens.css:16-25) and its color.md warm-oat example are in that cluster.
14. **Gradients and saturation.** Hallmark: two-stop only, no purple-cyan, accent under 3% (color.md). ui-ux-pro-max's Vibrant & Block style: neon green `#39FF14`, electric purple `#BF00FF`, 4-6 vibrant colors, animated patterns (`styles.csv` No 6).
15. **Hover requirement.** Vercel: every button/link needs a `hover:` state (VC:139). FD: hover transitions on every card are the generic default. Hallmark: motion-cut default and "hover-only affordances" banned.

---

## 10-bullet summary

1. ui-ux-pro-max is a strong lookup table but not a design brain: its palettes are mechanical (Muted Foreground is one of two values in 99% of 192 rows; 6 rows have Primary equal to Accent; notes and accents disagree), and its style mapping defaults to Minimalism/Glassmorphism/Flat.
2. Use from ui-ux-pro-max: `typography.csv` (74 ready-to-paste pairings with CSS imports), `ux-guidelines.csv` / `quick-reference.md` (WCAG 2.2-current a11y, forms, charts rules), and `motion.csv`. Skip palettes, product-to-style recommendations, 22 stacks, and the native-only pro-rules.
3. Hallmark has the best method and the sharpest rules (OKLCH palette ranges, accent at most 3%, 3 easings, 120/220/420ms durations, 8 component states, honest copy, 58-gate slop test), but costs about 17k tokens on trigger and 65-70k per page build.
4. Hallmark's biggest flaw is a house style: editorial/serif and warm-cream-plus-coral defaults, Geist everywhere, forced structure rotation, and bans stated as dogma (all parallax, all italic headers). Its flagship palette sits inside the cluster the Anthropic baseline calls a tell.
5. Vercel web-design-guidelines is a 300-token wrapper that fetches a 191-line rule list at run time; the rules are precise and checkable (`aria-label`, focus, `transition: all`, `Intl.*`, CLS) but there is zero aesthetic guidance, a network and mutable-main dependency, and internal inconsistencies (autocomplete on vs off, Title Case).
6. userinterface-wiki is a polished micro-motion/type/shadow reference (150+ one-claim rule files with before/after code; ~85 KB on demand), mostly React + Motion flavored, with no colour/layout/hierarchy and sloppy counts (11 vs 12 categories; 104 vs 152 vs 154 rules).
7. Anthropic frontend-design is the best method-per-token: 2.3k tokens, plan tokens in two passes, audit the plan against a named list of generic defaults, build, screenshot-critique. It has almost no numbers and nothing for product UI.
8. Shared across 3+ sources: transform/opacity only; reduced motion; visible `:focus-visible`; no `transition: all`; ~100-300ms micro durations with shorter exits; one orchestrated motion moment; tabular-nums; `text-wrap: balance`; 4pt spacing scale; 65-75ch measure; 4.5:1 contrast; specific active-voice copy with fix-it errors.
9. Hard contradictions to resolve by choosing a side: shadow strategy (wiki layered vs hallmark minimal), Inter and friends (ui-ux-pro-max vs hallmark), springs/overshoot/parallax (wiki, ui-ux-pro-max vs hallmark), 300ms ceiling (wiki vs hallmark 420ms), target size 24/32/44, Title Case vs sentence case, `overflow-x` hidden vs clip, autocomplete off vs on.
10. Recommended composition from this set: frontend-design as the cheap backbone method, plus a distilled local rules file (hallmark's color/type/motion/spacing numbers and anti-patterns, Vercel's checkable a11y/forms list, ui-ux-pro-max's WCAG 2.2 and chart rules, wiki's polish rules as an optional pass), not any of the four heavy installs.
