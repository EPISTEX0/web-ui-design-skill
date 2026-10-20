# web-ui-design

A skill that makes coding agents design web UI that looks deliberate, not generated.

We read 34 design skills for Claude Code, Cursor and Codex, and every public benchmark of them we could find. The public studies found little or no gain over an agent with no skill. What the sources do agree on is a process: real references, a written design contract, a render-and-critique loop, and a stress test. This skill is that process, plus the rules three or more skills agree on, in about 400 lines split so each case loads only its own steps.

Version 0.3 names the case first (a new site, a page added to an existing app, or a redesign), asks the user about the gaps that would change the design, and picks from a catalog of page types and style families instead of guessing. We tested it in three blind A/B rounds, 105 builds in all, scored by GPT, Gemini and Claude judges.

## Benchmark

Round 3 gave every build a simulated client with private notes (brand colors, prices, audience, device) and judged each page against those notes. Panel score, 1 to 10:

| Case | Claude Code defaults | `web-ui-design` 0.2 | `web-ui-design` 0.3 |
| --- | --- | --- | --- |
| New site, 3 briefs, 9 builds per arm | 4.37 | 4.41 | **6.85** (win rate 0.81 vs defaults, p = 0.005), 7.72 in the 6 builds where it asked and got answers |
| New site, the client declines every question | n/a | n/a | 4.15 |
| Add a page to a React app, 3 builds per arm | 5.11 | 5.22 | 3.78 unwired (never triggered), **7.22** with the `CLAUDE.md` line |
| Redesign a dated site, 3 builds per arm | 4.33 | **6.78** | 6.44 (6.67 wired) |

- **New sites gain only when the user answers.** 0.3 asks up to 4 questions before it builds. With answers it led every arm with all three judges. With a client who declined, it tied defaults, and on the exhibition brief it shipped pages full of "to confirm".
- **Adding to an app needs the install line.** Without it the skill did not trigger once. With it, 2 of 3 Time off pages were the only ones a manager could use on a phone. At 3 builds per arm this is a strong hint, not a significant result. Every arm matched the app's look and broke no existing page.
- **Redesigns.** Both skill versions fixed all 12 planted defects (defaults left 1 to 3) and kept the club's brand. 0.3 is no better than 0.2 here and costs more.
- 0.3 costs $0.51 per new site against $0.35 for 0.2 and $0.16 for defaults, and takes about 3 minutes.

Rounds 1 and 2 (36 builds, briefs without a client) found every design skill about 2 points above defaults, with 0.2 ahead on measurable defects: 0 contrast failures against 6 of 9 for 0.1.

The method, every score, the integrity notes, the limits and a script to rerun it are in [`benchmark/`](benchmark/). Judge for yourself in the blind galleries for [round 3](https://epistex0.github.io/web-ui-design-skill/benchmark/results/round-3/gallery/) and [round 2](https://epistex0.github.io/web-ui-design-skill/benchmark/results/gallery/).

## Install

With the [skills CLI](https://skills.sh) (Claude Code, Cursor, Codex and other agents):

```bash
npx skills@latest add EPISTEX0/web-ui-design-skill
```

As a Claude Code plugin:

```
/plugin marketplace add EPISTEX0/web-ui-design-skill
/plugin install web-ui-design@web-ui-design
```

Then add one line to your project's `CLAUDE.md` or `AGENTS.md`, or to your user-level one:

```
Use the web-ui-design skill for any UI work, and read DESIGN.md first when it exists.
```

Without it, the skill triggers on new pages and redesigns but not on "add a page to this app". In the benchmark it triggered 0 of 3 times there without the line and 3 of 3 with it.

## What the agent does

The skill first names the case, then runs that case's steps:

| Case | When | What changes |
| --- | --- | --- |
| **New** | No UI yet: "build a landing page" | Asks up to 4 multiple-choice questions, then picks a page type and a style family from the catalog and tailors the tokens to the subject |
| **Extend** | An app with UI gets a new page or feature | Reads the design system from the code (or writes it into `DESIGN.md`), reuses components and tokens, and leaves existing pages alone |
| **Improve** | "It looks dated", "it's hard to use on phones" | Audits first, asks the scope (polish, refresh or rebuild) and what must stay, fixes the worst problems first, then confirms every piece of content and every flow survived |
| **Review** | Only a critique | Reports a `Location | Before | After | Why` table |
| **Small edit** | One component or style | Changes only that, with existing tokens |

Every case shares four parts:

1. **The contract.** `DESIGN.md` and the project's stack (framework, styling system, components) outrank the skill's defaults.
2. **The question round.** It asks only about gaps that change a choice: the primary action, the audience and device, existing brand assets, the feel, real content, and for Improve the scope. Each question has a recommended answer, and "your call" is always a valid reply. Answers go into a Brief in `DESIGN.md` with their source.
3. **The pattern catalog.** 12 page types in 3 modes (*Persuade*, *Operate*, *Read*), each with its sections, UX patterns and a rendering and performance budget, and 8 style families with starting tokens.
4. **The render loop.** `scripts/check.mjs` renders the full page at 390, 768 and 1440 px. It reports overflow, clipped content, contrast, unloaded fonts, script errors, tap targets under 24px, Tab stops with no visible focus, tables that scroll sideways on phones, and a performance budget (LCP, CLS, JS, fonts, images). The agent opens every screenshot tile, walks the main flow, and fixes in batches until the run after the last edit is clean.

## What's inside

| File | Loaded | Contents |
| --- | --- | --- |
| [`skills/web-ui-design/SKILL.md`](skills/web-ui-design/SKILL.md) | When the skill triggers | The case router, the contract, the question round, the render loop |
| [`reference/new.md`](skills/web-ui-design/reference/new.md), [`extend.md`](skills/web-ui-design/reference/extend.md), [`improve.md`](skills/web-ui-design/reference/improve.md) | The one matching the case | That case's steps |
| [`reference/patterns.md`](skills/web-ui-design/reference/patterns.md) | When picking patterns | Page types and style families |
| [`reference/rules.md`](skills/web-ui-design/reference/rules.md) | While building and checking | Tells, layout, type, color, depth, motion, states, feedback and flows, performance, mobile, copy, stress test |
| [`reference/design-md-template.md`](skills/web-ui-design/reference/design-md-template.md) | When writing `DESIGN.md` | YAML tokens, the Brief with sources, a decisions table |
| [`scripts/check.mjs`](skills/web-ui-design/scripts/check.mjs) | Run in the render loop, never read | Full-page screenshot tiles plus layout, contrast, font, error, tap target, focus, table and performance checks. Needs Node 22 and Chrome or Chromium, and no npm install |
| [`research/`](research/) | Never | The reports this skill was distilled from, with sources |

A New build reads about 25 KB of instructions (roughly 6k tokens): `SKILL.md`, its case file, the catalog, the rules and the template. Extend and Improve read about the same. The large design skills we read load 17k to 50k tokens per page build.

## What the evidence says

| Finding | Source | Strength |
| --- | --- | --- |
| Front-end skills scored 4.54 to 4.67 against 4.65 with no skill. Agents read the provided skill about 48% of the time | [OpenSkillEval](https://arxiv.org/abs/2605.23657), 677 tasks, 30 skills | Measured, AI judge |
| taste-skill's own blind test: it averaged at or below the no-skill baseline in all 5 rounds | taste-skill `references/research.md`, section 11 | Measured by the author |
| Anthropic's `frontend-design` tied for first (8.0) while using about 6 times less context than taste-skill | [Happycapy Skill Arena](https://happycapy.ai/skill-arena/frontend-design), 3 tasks | Measured, single run |
| Review and audit skills found checkable defects (overflow, contrast, tap targets, an unloaded font). Build skills produced taste claims | [Paralect side-by-side](https://www.paralect.com/skills/top-design-skills) | Anecdotal |
| References, a design system file, a screenshot loop and diverge-then-converge recur across vendors and practitioners | [OpenAI](https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4), [Anthropic](https://claude.com/blog/improving-frontend-design-through-skills), [Luke Wroblewski](https://www.lukew.com/ff/2164/design-systems-for-ai-agents), [Emil Kowalski](https://emilkowal.ski/ui/agents-with-taste) | Vendor and anecdotal |

The full write-up, with every source and its date, is in [`research/evidence.md`](research/evidence.md). The per-skill deep reads are in [`research/deep-A.md`](research/deep-A.md), [`deep-B.md`](research/deep-B.md) and [`deep-C.md`](research/deep-C.md), and the market inventory is in [`research/inventory.md`](research/inventory.md).

## How the rules were chosen

A rule made it into `rules.md` when three or more independent skills agreed on it. When sources contradicted each other, we picked one side and wrote the choice into the rule. Examples:

- `overflow-x: clip`, not `hidden`, because `hidden` breaks `position: sticky`.
- Sentence case for headings and buttons, not Title Case.
- One depth strategy per product (borders, ring plus shadow, or tonal), not a mix.
- No banned-font list. Ban lists only move the default, from Inter to Space Grotesk. The skill asks for a typeface chosen from the subject instead.

Every line can be overridden by your `DESIGN.md` or your brief.

## Status

Version 0.3, benchmarked on 2026-10-20. Known gaps, for the next version:

- **The question round can be skipped.** On the clinic check-in brief it asked 0 of 3 times and wrote every gap as "assumed", once as "left to you" when the user had said nothing.
- **A user who will not answer gets placeholders.** With a declining client, the skill left "to confirm" in place of facts. Plausible sample content, listed for the user to replace, would serve them better.
- **Extend needs the `CLAUDE.md` line** to trigger at all.
- **Redesigns cost 1.7 times 0.2 for no measured gain.**
- **The render loop gets cut short.** One Extend build never opened its 390 px screenshot, and it was the one whose actions were hidden on phones.

If you run the skill against another design skill or no skill on your own briefs, open an issue with the screenshots. Results either way are welcome and will shape the next version.

## Credits

The rules are distilled from the work of these authors. Read their originals:

- [anthropics/skills `frontend-design`](https://github.com/anthropics/skills) for the plan, tells and self-critique method
- [emilkowalski/skills](https://github.com/emilkowalski/skills) for motion values and the worst-case data test
- [jakubkrehel/skills](https://github.com/jakubkrehel/skills) for surface, type and color values
- [pbakaus/impeccable](https://github.com/pbakaus/impeccable) for the Persuade, Operate and Read modes and the craft floor
- [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) for the tells and its honest benchmark
- [Nutlope/hallmark](https://github.com/Nutlope/hallmark), [raphaelsalaja/userinterface-wiki](https://github.com/raphaelsalaja/userinterface-wiki) and [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) for rule packs
- [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) for the web interface guidelines
- [Dammyjay93/interface-design](https://github.com/Dammyjay93/interface-design), [ibelick/ui-skills](https://github.com/ibelick/ui-skills) and [google-labs-code/design.md](https://github.com/google-labs-code/design.md) for the design contract file

## License

MIT
