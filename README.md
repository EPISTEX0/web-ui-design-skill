# web-ui-design

A skill that makes coding agents design web UI that looks deliberate, not generated.

We read 34 design skills for Claude Code, Cursor and Codex, and every public benchmark of them we could find. No study shows any design skill beating an agent with no skill at all. What the sources do agree on is a process: real references, a written design contract, a render-and-critique loop, and a stress test. This skill is that process, plus the rules three or more skills agree on, in about 200 lines.

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

Then add one line to your project's `CLAUDE.md` or `AGENTS.md`, so the design contract loads even when the skill does not trigger:

```
Read DESIGN.md before any UI work.
```

## What the agent does

The skill runs seven steps in order:

1. **Load the contract.** Read `DESIGN.md` if it exists. Its tokens outrank every default.
2. **Write the brief.** Subject, audience, primary job, and a mode: *Persuade* (landing pages), *Operate* (apps and dashboards) or *Read* (docs).
3. **Gather references.** Real products from the subject's world, each with the specific thing it contributes.
4. **Set the direction.** 2 or 3 directions on a named axis, then one token plan checked against a list of generated-design tells.
5. **Build** with tokens only and every state: loading, empty, error, disabled, hover, focus.
6. **Run the render loop.** Screenshots at 390, 768 and 1440 px, critique against the rules, fix in batches, at most 3 rounds.
7. **Record decisions** with their rationale in `DESIGN.md`, so the next session starts from them.

Ask only for a critique and it runs step 6 alone. It reports a `Location | Before | After | Why` table.

## What's inside

| File | Loaded | Contents |
| --- | --- | --- |
| [`skills/web-ui-design/SKILL.md`](skills/web-ui-design/SKILL.md) | When the skill triggers | The seven steps |
| [`reference/rules.md`](skills/web-ui-design/reference/rules.md) | During steps 4 to 6 | Tells, layout, type, color, depth, motion, states, mobile, copy, stress test |
| [`reference/design-md-template.md`](skills/web-ui-design/reference/design-md-template.md) | At step 7 | A `DESIGN.md` with YAML tokens and a decisions table |
| [`research/`](research/) | Never | The reports this skill was distilled from, with sources |

The whole skill is about 11 KB. The large design skills we read load 17k to 50k tokens per page build.

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

Version 0.1. The skill is not yet A/B tested. If you run it against no skill or another design skill on your own briefs, open an issue with the screenshots. Results either way are welcome and will shape the next version.

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
