# Evidence: which design skills / rule packs actually improve agent-built web UI

Compiled 2026-10-19. Labels: **[measured]** = a run with stated conditions and scores (still check sample size/judge), **[anecdotal]** = practitioner opinion or single informal run, **[vendor]** = claim by the skill's author or model vendor, **[inferred]** = reasoning from other evidence, not tested.

Short answer: there is almost no rigorous, independent, multi-sample evidence for any named skill. The measured items are small (single runs, 3 tasks, AI judges) or from a general paper where front-end skills were roughly neutral. Practitioner judgment converges more strongly on method (references, written design system, render-and-critique loop, human direction) than on any specific skill.

---

## 1. Cross-skill evaluations (the closest thing to head-to-heads)

### 1a. OpenSkillEval (arXiv 2605.23657v2, 28 May 2026) [measured, AI judge]
- Source: https://arxiv.org/abs/2605.23657 (full text read at https://arxiv.org/html/2605.23657v2)
- 677 task instances, 30 community skills, 5 task categories incl. front-end web design (targets reverse-engineered from Awwwards / SaaS Landing Page sites). Agent-as-Judge (Pearson 0.855 with humans per the paper). Front-end skills tested: ui-ux-pro-max, ui-styling, web-design-expert, loom, seo-local-business, web-frameworks, superdesign, frontend-design-ultimate. Anthropic's frontend-design, impeccable, taste-skill, Emil, Vercel guidelines were NOT in the set (checked the readable text).
- Result for front-end web design (Table 2): no-skills baseline 4.65 / 4.32 / 4.91 on the three visual metrics. ui-ux-pro-max 4.67 / 4.41 / 4.88, ui-styling 4.66 / 4.39 / 4.88, web-design-expert 4.66 / 4.35 / 4.90, superdesign 4.55 / 4.19 / 4.84, frontend-design-ultimate 4.54 / 4.24 / 4.80. That is, web-design skills were statistically indistinguishable from, or slightly below, no skill. Paper text: skills raised visual-design scores in "roughly half" of poster and web design settings, and always for presentations; gains scale with the richness of design priors in the skill.
- Other relevant findings: agents actually read the provided skill only ~48% of the time (94% when forced); stronger models (Claude 4.6) often skipped skills entirely in default mode; token use 3-5x baseline; "many popular skills do not consistently outperform base agents"; skills can slightly hurt completeness/fidelity because of added instructions; stylistic diversity effect on web design was < 0.02 (negligible). MUST/NEVER-heavy skills constrain style (clearer in posters).
- Caveat: the baseline was already high (4.65/5) on this task, which leaves little headroom, and the judge is an LLM scoring against reverse-engineered target sites, not "taste".

### 1b. Paralect "Top design skills for Claude Code, tested side by side" (Oct 2026) [anecdotal, single runs]
- https://www.paralect.com/skills/top-design-skills
- Same brief ("landing page for Hourglass, a time tracker for freelance designers") in a fresh session per pack; model not named; one run each; no rubric.
- frontend-design (Anthropic): moved the page away from the default look, fixed a broken headline and mobile overflow; 3 min vs 2.5 min baseline. Verdict: use for new pages.
- ui-ux-pro-max: accessible but "the most conventional page in the test".
- taste-skill: strong type, common layout, random stock photo.
- Impeccable: `/audit` scored the baseline page 10/20; `/polish` fixed mobile overflow, contrast, tap targets; left fake logos/testimonials flagged "needs your input" rather than inventing proof.
- Emil Kowalski's skills: 21 interaction changes each with a reason; found a background-tab timer bug. "Use when a page works but feels flat."
- Hallmark: most restrained page, only one with no invented stats/testimonials.
- huashu-design: 8.5 min and ~$4.20 vs ~$1 for the others; three directions, one original.
- designer-skills `critique`: 16 prioritized issues, caught that an italic font was never loaded.
- Reading: build skills (frontend-design, ui-ux-pro-max, taste) were compared by eye; review skills (impeccable, designer-skills, Emil) were run on the baseline page and found concrete defects. That is a useful asymmetry: review/polish skills produce checkable findings, build skills produce taste claims.

### 1c. Happycapy "Skill Arena: frontend-design" (undated, "v1.0 July 2026") [measured-ish, 3 tasks, single run, AI judges]
- https://happycapy.ai/skill-arena/frontend-design
- Base model held constant (Claude Sonnet 5); 3 tasks (SaaS landing, designer portfolio, analytics dashboard); screenshots anonymized and scored 1-10 by two blind AI judges on 5 axes. Self-described as "directional".
- Overall: frontend-design 8.0, design-taste-frontend 8.0, superdesign 8.0, Vercel web-design-guidelines 6.8, ui-ux-pro-max 6.7, high-end-visual-design 6.5. Per-task: frontend-design won portfolio and dashboard (8.5), superdesign won landing (8.5); ui-ux-pro-max slipped on portfolio/dashboard (6.0). Conclusion on the page: no single best skill, depends on the job.
- Cost: summed context tokens across 3 tasks: superdesign ~65K, frontend-design ~320K, high-end-visual ~365K, web-design-guidelines ~493K, ui-ux-pro-max ~748K, design-taste-frontend ~1.9M (its SKILL.md is ~87K chars and re-read each turn). Quality did not track context cost.
- Caveat: no no-skill baseline in this arena; the site is a skill marketplace.

### 1d. dani-z/frontend-design-skill-benchmark (undated, 24 stars) [measured but weak]
- https://github.com/dani-z/frontend-design-skill-benchmark
- Three tasks with and without Anthropic's frontend-design; six binary assertions (no Inter/Roboto, no purple gradient, non-standard layout, CSS variables, a @keyframes animation, intentional aesthetic). With skill 18/18, without 5/18 (28%).
- The assertions restate the skill's own rules, so this measures instruction-following of the skill, not whether the result is better looking. Grader and model not stated. Treat as evidence that the skill changes the default look, not that it improves it.

### 1e. note.com "Claude Skill Encyclopedia #1" ui-ux-pro-max vs frontend-design (3 May 2026) [anecdotal, single runs]
- https://note.com/ai_smallbiz_lab/n/n64e2c6f8de5a
- Opus 4.7 xHigh, Claude Code 2.1.126; same prompts for a SaaS LP, a hot-spring inn, a Michelin sushi counter; judged by a non-designer.
- SaaS: frontend-design preferred (precise Linear/Vercel look; ui-ux-pro-max felt like a generic startup LP). Inn: slight edge frontend-design. Sushi: slight edge ui-ux-pro-max (restrained, no photos). Author hypothesis: pre-defined rules/palettes (ui-ux-pro-max) vs model judgment (frontend-design) win in different industries; value of OSS skills may be shrinking as models improve (untested). Advice: compare on your own use case, not by stars.

### 1f. whichai.dev and qingye-lab/design-skill-arena [galleries, no verdicts]
- https://www.whichai.dev/ shows ~20 models with / without Anthropic's design skill / taste skill on one "second brain" landing-page brief, with generation cost; no ratings. Cost effect of the skill varied by model (Opus 5.5 cheaper with skill, $3.30 vs $6.46; Haiku 5.5 and Fable 5.1 more expensive); taste-skill runs generally cost more (Opus 5.5 $19.12).
- https://github.com/qingye-lab/design-skill-arena: showcase of the same brief across models and skill chains (balanced-chain, product-polish-chain, standard-impeccable, etc.). Explicitly "a showcase, not a benchmark". Useful to eyeball, not to cite.

### 1g. claudeskills.info "Frontend Design vs Impeccable vs UI/UX Pro Max" (25 Jul 2026) [inferred / source review]
- https://claudeskills.info/blog/frontend-design-vs-impeccable-vs-ui-ux-pro-max/
- No runs; reads repos and issue trackers. Frames GPT-5.6 vendor claims as reducing the need for creative instructions. Claims: frontend-design is a 55-line brief that "does not itself preserve a design contract across pages, sessions, or agents" (issue #1008 proposes a DESIGN.md); Impeccable has persistent PRODUCT.md/DESIGN.md and 23 commands, with issues about always-loaded description cost (#375), detector gaps (#149), nested DESIGN.md not loading in a monorepo (#367); ui-ux-pro-max has an issue (#428) about contradictory outputs (dark style + light palette) and #263 about text-heavy layout burying key content. Recommendation: lean official skill for greenfield, Impeccable for brownfield, ui-ux-pro-max as a lookup. The author states these are editorial judgments. The site is a skill directory.

---

## 2. Per skill: claims for and against

### Anthropic frontend-design (plugin / skill) and the cookbook prompt
For:
- Vendor claim, 12 Nov 2025: Applied AI team says LLMs "sample from the high-probability center" of design data, hence Inter, purple gradients on white, little motion; a ~400-token skill steering typography, color, motion and backgrounds fixes much of it. Evidence is before/after screenshots only, no metrics. https://claude.com/blog/improving-frontend-design-through-skills [vendor]
- Cookbook "Prompting for frontend aesthetics" (21 Oct 2025): three tactics (steer each dimension, reference outside inspirations, name the defaults to avoid). The prompt itself concedes the model still converges (it names Space Grotesk as a new default) after the Inter ban. https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics [vendor]
- Highest or tied-highest in the Happycapy arena (8.0, §1c) and recommended for new pages by Paralect (§1b) and the note.com test (§1e). Cheap in context vs other packs (§1c). [anecdotal / weak measured]
- Skill vs none changes output in the direction of its rules (18/18 vs 5/18 assertions, §1d). [measured, circular]
Against:
- HN commenters on the cookbook recipe: "Did no one look at these [before/after images] to make sure the skill actually improved the design?" and "I preferred the before shots" (via https://www.developersdigest.tech/blog/claude-cookbook-hn-analysis). Another: prompting frontier models "better" is "laughable". [anecdotal]
- Reddit r/ClaudeAI, Jul 2026 ("Any good Claude frontend-design skills?"): after many artifacts they all look the same; "no skill I've tried makes much difference"; the fix is a real design system. https://reddit.sentinel-team.org/posts/1v1v713/snapshots/2026-07-20T20%3A24%3A21.6759Z [anecdotal]
- HN, Jan 2026 (Show HN interface-design.dev): the official skill also produced warm-cream/terracotta palettes unprompted (user k2so), suggesting a new default. https://news.ycombinator.com/item?id=46699260 [anecdotal]
- No persistent design contract across pages/sessions (§1g). [inferred]
- OpenSkillEval found agents read skills only ~48% of the time and strong Claude models often skipped them (§1a). [measured]

### Impeccable (pbakaus)
For:
- Gives a steering vocabulary (bolder, quieter, denser, polish, critique, audit) plus a deterministic detector (61 rules, no LLM) and PRODUCT.md / DESIGN.md context. Bakaus: "An adjective with nothing behind it is just a nice apostrophe"; designers get much better output than engineers from the same model because of vocabulary; "never a tool for one-shot design"; "there is no auto". https://www.latent.space/p/skill-engineering-design (2 Jul 2026) [vendor]
- Paralect: `/audit` and `/polish` found and fixed real defects (mobile overflow, contrast, tap targets) on a baseline page and refused to invent social proof. [anecdotal]
- Recommended by Reddit commenters as a wrapper around Claude Design output (Jul 2026). [anecdotal]
Against:
- HN launch thread (Jan 2026, 103 pts, 64 comments): many readers judged the "after" examples worse than "before" (less information density, lower contrast, form over function); "SaaS, slop as a service"; Bakaus conceded the case studies were rushed and removed them. https://news.ycombinator.com/item?id=46587284 [anecdotal, but pointed]
- HN, Jul 2026 (Hallmark thread): "tried impeccable, ui-ux-max and others, they all converge on the same design unless the prompt is very explicit" (mstkllah); "you have to keep directing and iterating" (aleksiy123). https://news.ycombinator.com/item?id=49058547 [anecdotal]
- README has no benchmarks and warns "a clean detector run is evidence, not proof of visual or accessibility quality". https://github.com/pbakaus/impeccable [vendor]
- Always-loaded description cost (issue #375), per §1g. [inferred from issues]
- Not in OpenSkillEval; no independent head-to-head found.

### ui-ux-pro-max (nextlevelbuilder)
For: systematic design tokens / palettes / stack guides; best in some product-UI contexts; in OpenSkillEval it scored marginally above baseline on one metric (4.41 vs 4.32) [measured, within noise]; sushi test edge (§1e).
Against: "most conventional page in the test" (Paralect); 6.7 and slipped on portfolio/dashboard in the arena, with ~748K context tokens (§1c); contradictory outputs and hierarchy failures in issues #428 / #263 (§1g); in the note.com test generic-startup look on SaaS. The model (Claude) overrode its "Liquid Glass + Pink" recommendation for the inn. A retrieval/lookup tool rather than a taste source. [anecdotal / weak measured]

### taste-skill / design-taste-frontend (Leonxlnx)
For: ties for top in the arena (8.0) and good typography in Paralect; sells dials (variance / motion / density). [anecdotal]
Against: heaviest context cost found (~87K-character SKILL.md, ~1.9M context tokens over 3 tasks), per Happycapy; generation cost for Opus 5.5 was $19.12 vs $3.30-6.46 for the design skill / no-skill rows (whichai.dev). Common layout and random stock photo (Paralect). No independent quality evidence beyond that. [anecdotal / measured cost]

### Emil Kowalski's skills (emilkowalski/skills, `emil-design-eng`)
For: not a look-generator but a codified-rules skill. Essay "Agents with Taste": "Almost every taste decision has a logical reason if you look close enough"; rules such as scale(0.95) not scale(0) for entrances, ease-out for enter/exit, 100-300ms durations, 44px hit targets, `tabular-nums`, 65ch cap. https://emilkowal.ski/ui/agents-with-taste (HN submission 22 Apr 2026) [vendor/practitioner]. Paralect run: 21 interaction changes each with a reason, found a real timer bug. [anecdotal]
Against: no independent measurement; scope is interaction/motion polish, not layout or visual direction. Its method (write down the reasons, be strict) is the transferable part.

### Vercel web-design-guidelines / Web Interface Guidelines
For: review-only checker (100+ rules, file:line output), the right kind of skill for a gate. Snyk's roundup calls it a "code quality gate" with no measured outcomes. https://snyk.io/articles/top-claude-skills-ui-ux-engineers/ [vendor/anecdotal]
Against: arena 6.8; "a reviewer, not a look-generator" (§1c). Fetches rules from a live URL at run time (dependency, per listings). No before/after evidence found.

### ibelick ui-skills
No evaluation, comparison or practitioner judgment found in any search. Evidence gap.

### Hallmark (Nutlope, Jul 2026)
Claims: 21 themes, 57 "slop-test" gates, per-brief macrostructure, build log that fails runs repeating recent page structure (maintainer opwizardx in HN). No benchmark. HN: "screenshots all look AI-generated" (loopmonster); "ironic that an anti-AI-slop skill is built for an AI slop maker" (torunar); one commenter wants more variety (mondainx). Paralect: most restrained page, no invented stats. https://news.ycombinator.com/item?id=49058547 [vendor/anecdotal]

### interface-design.dev (Dammyjay93, Jan 2026)
Claims prescriptive instructions make UI worse because the model pattern-matches to "safe"; uses evocative principles instead (e.g. "squint test"). HN skepticism ("a vibe that activates a latent space"), request that someone benchmark these skills (F7F7F7). https://news.ycombinator.com/item?id=46699260 [vendor/anecdotal]

### Newer or adjacent: OpenAI frontend-skill for Codex (GPT-5.4 era)
OpenAI's guide: define design system and constraints first, give visual references/mood boards, set hard limits (one H1, max six sections, two typefaces, one accent), use real copy, give the model Playwright, low/medium reasoning "often leads to stronger front-end results" for simpler sites; the Codex `frontend-skill` asks for a visual thesis, content plan and interaction thesis before building. No measured claims on the page. https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4 [vendor]. Other skills named in sources (superdesign, huashu-design, designer-skills, high-end-visual-design, Claude Design `/design`) have only the single-run evidence above.

---

## 3. Criticisms that cut across skills

- **Skills are often not used and cost a lot.** Agents read the skill only ~48% of the time by default; token use 3-5x; stronger models skip them (OpenSkillEval, §1a) [measured]. SkillReducer (arXiv 2603.29919): of 55,315 public skills, >60% of body text is background/examples rather than core rules; compressed skills kept or improved quality for 86% of skills (general, not design-specific) [measured]. https://arxiv.org/html/2603.29919v1
- **Monoculture.** Several people report skills converge on one new look: "all converge on the same design unless the prompt is very explicit" (HN, Jul 2026), warm cream / terracotta from the official skill (HN, Jan 2026), outputs from the cookbook prompt drifting to Space Grotesk (Anthropic's own prompt, Oct 2025). OpenSkillEval measured a small diversity effect for web design (<0.02) and reduced diversity for MUST/NEVER-heavy poster skills. Bakaus himself: skills and models "converge in one direction". [mixed: anecdotal plus a small measured result]. A blog post concludes the same through reasoning: ban lists create new defaults (Anthropic's cookbook caveat shows it directly). I found no article that quantifies "every impeccable site looks the same".
- **Keyword dumps / adjectives.** HN criticism of vocabulary-based skills ("vocabulary is just the surface", can the LLM judge leading if it can't see the render); Bakaus' rebuttal is that vocabulary needs operational meaning plus render access. [anecdotal]
- **Star counts are not evidence.** Different sources list frontend-design at 181K stars and 974K installs, Impeccable 80-83K, ui-ux-pro-max 135K; these are popularity snapshots, and the one test that compared popularity to scores (Happycapy) shows no correlation. Both note.com and Paralect tell readers to test on their own brief.
- **Marketing bias.** Most "best skills" roundups (Medium, composio, Snyk, claudeskills.info, etc.) have SEO or product incentives and no runs. Paralect, note.com and Happycapy are the only ones with stated procedures, and each is single-run.

---

## 4. Methods that work regardless of skill (convergent practices)

Strength of convergence: how many independent source types agree. None of these is measured by a controlled trial; they are consistent practitioner and vendor guidance.

1. **Supply real references, not adjectives.** Screenshots / mood boards / named inspirations as input; saving why each reference works. Sources: OpenAI GPT-5.4 frontend guide [vendor]; Anthropic cookbook "reference design inspirations" [vendor]; Can Dedeoglu "Escaping AI Slop" (26 Jul 2026), build a taste library with the "why" for each reference https://www.candede.com/articles/escaping-ai-slop-in-web-design [anecdotal]; raduan.xyz 2025 (FigJam of section references from Mobbin / 21st.dev, reference images in every prompt) https://raduan.xyz/blog/claude-code-for-landing [anecdotal]; Reddit r/ClaudeAI Jul 2026 ("high-quality reference images", "without good references you get the same default everyone gets") [anecdotal]. HN's sixtyj: sketch by hand / Figma, then prompt a multimodal model [anecdotal].
2. **Write the design system down first (tokens + rules) and make the agent reuse it.** DESIGN.md / style guide with palette, type roles, spacing, components. Sources: OpenAI guide (tokens as CSS variables, hard limits) [vendor]; Luke Wroblewski, "Design Systems for AI Agents" (4 Oct 2026): a design system is a steering layer, agents read docs every time, tokens + AGENTS.md + reusable components + live reference page, code as source of truth https://www.lukew.com/ff/2164/design-systems-for-ai-agents [anecdotal]; Google's design.md spec (alpha; YAML tokens + prose rationale, lint for WCAG AA contrast and broken refs) https://github.com/google-labs-code/design.md [vendor, no benchmarks]; Impeccable's PRODUCT.md / DESIGN.md [vendor]; raduan.xyz (300+ line design README "essential") ; Reddit ("a real in-depth design system rather than a different skill", "spend 1-2 hours on a markdown file first"). Dissent on HN: design belongs in theme config / components, not long-lived docs (brendanmc6) , which is compatible if the tokens live in code.
3. **Close the loop with rendered output.** Give the agent Playwright / browser, screenshots at multiple viewports, and have it critique and revise. Sources: OpenAI guide [vendor]; Playwright-MCP "self-correcting designer" guides (several blogs, e.g. https://claude-codex.fr/en/mcp/workflow-design-playwright/) [anecdotal]; HN on Impeccable (mr_mitm: Playwright lets the agent see output, "works much better with a browser connected"); Impeccable `critique`/`polish` save screenshots; OpenSkillEval used an interaction simulator, and found responsive design the weakest area for models, which a multi-viewport check targets directly [measured]. Hallmark's "pre-emit self-critique" is the same idea in prompt form [vendor].
4. **Diverge, then converge; do not one-shot.** Generate several directions or mockups, pick one, lock style, then vary structure, then polish. Sources: Dedeoglu (explore several art directions, lock winner, vary layout while holding style); OpenAI guide (mood board / several options before assets) ; Reddit (ask for 3-10 directions as an index, merge best parts) ; Bakaus ("never one-shot", AI does ~80%, human owns the last ~20%, "there is no auto") ; raduan.xyz (planning and per-section builds, one week of iteration) ; HN (aleksiy123: "you have to keep directing and iterating"). [anecdotal, broad agreement]
5. **Review/polish passes find concrete defects; build passes are where taste claims live.** Paralect: audit/critique skills on the baseline page found overflow, contrast, tap-target, unloaded-font and fake-proof issues; those are checkable. Vercel guidelines and Impeccable's detector are the same kind of tool. Implication: use a checker (deterministic where possible) as the gate rather than relying on a generation skill. Also Impeccable's own caution: a clean detector run is not proof of quality. [anecdotal]
6. **State concrete constraints and cite the reason; ban lists need maintenance.** Concrete limits (one accent, two typefaces, max sections, easing and duration rules) outperform adjectives (OpenAI; Emil: describe rules and why, "be strict"; Anthropic: use extremes such as 100/200 vs 800/900 weights). But ban lists move the default (Space Grotesk, cream/serif) and MUST/NEVER-heavy skills constrain style (OpenSkillEval). [vendor + one measured]
7. **Real content and a single product intent.** Real copy and product context avoid generic placeholder pages and invented stats (OpenAI guide; Paralect's Hallmark / Impeccable "needs your input" behaviour). [vendor/anecdotal]
8. **Keep context lean; skills only help if loaded and followed.** Prefer short skills, or progressive disclosure with references loaded on demand (Anthropic's blog on ~400-token skill; SkillReducer; Happycapy token table; OpenSkillEval 48% read rate, 94% when forced). If a design rule matters, put it in CLAUDE.md / AGENTS.md or invoke the skill explicitly. [measured + vendor]
9. **A human with taste stays in the loop.** Mollick / Kowalski / Bakaus / Dedeoglu / ssp.sh all frame the model as an execution engine and the human as the source of taste and judgment; Bakaus saw large output differences between a designer and an engineer on the same model. Evidence: anecdotal and vendor, but unanimous. [anecdotal]
10. **Reasoning effort.** OpenAI says low/medium reasoning often gives stronger front-end results on simpler sites. Single vendor claim, not tested elsewhere here. [vendor]

---

## 5. Gaps and caveats

- No independent study compares Anthropic frontend-design, Impeccable, taste-skill, Emil's skills and Vercel guidelines with a no-skill baseline, multi-sample, with blind human raters. Design Arena (designarena.ai) benchmarks models, not skills; I found no skills split there.
- ibelick/ui-skills and Vercel guidelines have no output-quality evidence at all.
- I could not read Reddit directly (blocked) or X; Reddit snapshots came via a third-party mirror (reddit.sentinel-team.org) , and the X/YouTube search yielded nothing usable. I did not locate direct quotes from Rauno or shadcn on method.
- Models differ across sources (Opus 4.7, Sonnet 5, GPT-5.x), and the best skill varies by model (OpenSkillEval says the benefit depends strongly on model and harness).
- Several fetches (Happycapy, Paralect, dani-z repo) were summarized by the fetch tool; numbers were not re-verified against screenshots. The OpenSkillEval table numbers I read from the paper HTML; column labels for the three scores were not confirmed (I report them as the three visual metrics).

## Source index
- https://www.paralect.com/skills/top-design-skills
- https://happycapy.ai/skill-arena/frontend-design
- https://github.com/dani-z/frontend-design-skill-benchmark
- https://note.com/ai_smallbiz_lab/n/n64e2c6f8de5a
- https://claudeskills.info/blog/frontend-design-vs-impeccable-vs-ui-ux-pro-max/
- https://arxiv.org/abs/2605.23657 and https://arxiv.org/html/2603.29919v1
- https://claude.com/blog/improving-frontend-design-through-skills
- https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics
- https://www.developersdigest.tech/blog/claude-cookbook-hn-analysis
- https://emilkowal.ski/ui/agents-with-taste
- https://www.latent.space/p/skill-engineering-design
- https://github.com/pbakaus/impeccable
- https://github.com/Nutlope/hallmark
- https://news.ycombinator.com/item?id=46587284 (Impeccable), 46699260 (interface-design), 49058547 (Hallmark), 47887123 (design.md)
- https://github.com/google-labs-code/design.md
- https://www.lukew.com/ff/2164/design-systems-for-ai-agents
- https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4
- https://www.candede.com/articles/escaping-ai-slop-in-web-design
- https://raduan.xyz/blog/claude-code-for-landing
- https://reddit.sentinel-team.org/posts/1uzhfz7/snapshots/2026-07-20T20%3A24%3A21.6759Z and https://reddit.sentinel-team.org/posts/1v1v713/snapshots/2026-07-20T20%3A24%3A21.6759Z
- https://www.whichai.dev/ , https://github.com/qingye-lab/design-skill-arena
- https://snyk.io/articles/top-claude-skills-ui-ux-engineers/
