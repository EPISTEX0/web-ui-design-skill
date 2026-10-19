# Blind A/B benchmark

We built 27 pages and had three judges from three model families score them blind.

- Both design skills beat Claude Code's defaults by about 1.7 points out of 10, with p ≈ 0.02.
- `web-ui-design` and Anthropic's `frontend-design` tie on overall quality (7.04 against 7.04).
- `web-ui-design` scores higher on mobile, renders and inspects its own output far more often, and costs about a third more per build.

Run date: 2026-10-19. Builder: Claude Sonnet 5.5 in Claude Code, headless.

## Results

Panel score is the mean of the three judges. Scores run from 1 to 10. Each arm has 9 builds, 3 per brief.

| Arm | Overall | Craft | Fit | Hierarchy | Mobile | Rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| Claude Code defaults | 5.30 | 5.63 | 5.63 | 6.59 | 5.44 | 0.25 |
| `frontend-design` | **7.04** | **7.52** | **8.07** | **7.89** | 5.85 | **0.64** |
| `web-ui-design` | **7.04** | 7.48 | 7.74 | **7.89** | **6.41** | 0.62 |

| Comparison | Panel win rate, same brief | Mann-Whitney p |
| --- | --- | --- |
| `web-ui-design` vs defaults | 0.83 | 0.019 |
| `frontend-design` vs defaults | 0.89 | 0.022 |
| `web-ui-design` vs `frontend-design` | 0.52 | 0.860 |

A win rate of 0.83 means a `web-ui-design` page outscored a defaults page built from the same brief in 83% of pairs.

Per judge, overall score:

| Judge | Defaults | `frontend-design` | `web-ui-design` |
| --- | --- | --- | --- |
| Gemini 4 Argon | 4.89 | 6.89 | **7.33** |
| GPT-6.1 Sol | 6.00 | **7.56** | 6.89 |
| Claude Opus 5.5 | 5.00 | 6.67 | **6.89** |

All three judges put both skills above the defaults. They split on which skill is better, and with 9 builds per arm that split is within noise. Judges agree with each other on overall scores at a Spearman correlation of 0.65 to 0.80.

Per brief, panel overall:

| Brief | Defaults | `frontend-design` | `web-ui-design` |
| --- | --- | --- | --- |
| Slow Clay, a pottery studio landing page | 4.78 | 7.33 | **7.67** |
| Roastline, a roastery dashboard | 5.33 | **7.22** | 7.11 |
| backoff-kit, a library docs page | 5.78 | **6.56** | 6.33 |

Process and objective checks:

| Arm | Mean cost | Median time | Skill triggered | Rendered its own page | Mobile horizontal overflow | Axe serious and critical, median |
| --- | --- | --- | --- | --- | --- | --- |
| Defaults | $0.21 | 74 s | n/a | 3/9 | 1/9 | 3 |
| `frontend-design` | $0.24 | 73 s | 6/9 | 2/9 | 3/9 | 1 |
| `web-ui-design` | $0.32 | 87 s | 8/9 | 7/9 | 1/9 | 2 |

The full tables, including every criterion per judge, are in [`results/summary.md`](results/summary.md). Every build, score and note is in [`results/summary.json`](results/summary.json).

## What we learned

- **A skill only helps when it triggers.** `frontend-design` never triggered on the docs brief (0/3), so its docs pages ran under the same conditions as the defaults. They still scored 6.56 against 5.78, which shows how much noise 3 builds per cell carry. The one `web-ui-design` build that did not trigger was its worst page, with a 345 px horizontal overflow on mobile.
- **Without a skill, the agent converges.** All three defaults builds of the pottery page share one template: cream ground, centered serif headline, terracotta buttons. That is the first cluster on the skill's list of generated-design tells.
- **The render loop runs, the contract step does not.** `web-ui-design` builds opened their own screenshots in 7 of 9 runs. None wrote a `DESIGN.md` (0/9). In a one-shot build in an empty folder, step 7 gets skipped. The next version needs a better trigger for that step, or should drop it from one-shot work.
- **Accessibility did not move.** Every arm shipped `color-contrast` failures in 5 or 6 of its 9 builds. The rules say to measure contrast, but no build ran a contrast check.

## Method

**Arms.** Each build ran in a fresh `CLAUDE_CONFIG_DIR` that held only credentials, plus the arm's skill in `skills/`. No user settings, hooks, plugins or `CLAUDE.md` were loaded. All arms kept Claude Code's built-in skills, including its own `design` skill, which no build invoked. One local hooks mod, `mem-notice`, loaded in every arm.

- `none`: Claude Code defaults.
- `frontend-design`: Anthropic's skill, copied from the official plugin into [`arms/frontend-design`](arms/frontend-design) under its Apache 2.0 license.
- `web-ui-design`: this repo's skill at the benchmark commit.

**Briefs.** Three organic prompts, one per mode, in [`briefs/`](briefs): a landing page (*Persuade*), a dashboard (*Operate*) and a docs page (*Read*). The prompts say nothing about design quality, skills or testing.

**Builds.** [`build.sh`](build.sh) runs `claude -p` with Sonnet 5.5 in an empty folder named after the client. Each build runs inside `bwrap` with a private `/tmp`, so parallel builds cannot see each other's files. Every arm has the same headless Chromium on `PATH`. [`run-all.sh`](run-all.sh) interleaves arms and briefs, 3 reps each, 5 at a time.

**Rendering.** [`render.mjs`](render.mjs) loads each page in Playwright, scrolls it to trigger reveal animations, and captures the first desktop viewport and full pages at 1440 and 390 px. It also runs axe-core and measures horizontal overflow.

**Judging.** [`make-packets.mjs`](make-packets.mjs) copies screenshots under random labels, such as `D3`, and keeps the key outside the judged folder. Three judges scored each brief separately against [`judge-rubric.md`](judge-rubric.md): GPT-6.1 Sol, Gemini 4 Argon and Claude Opus 5.5. Each judge saw the labels in a different order. Every judge first passed an image-reading check on a screenshot whose source file had been deleted.

## Limits

- 9 builds per arm. The skills-vs-defaults gap is significant. The gap between the two skills is not.
- One builder model, Sonnet 5.5. Results may differ on Opus or other agents.
- Judges are models, not people. Human preference may differ, so vote in the [blind gallery](results/gallery/index.html) and open an issue with your picks.
- Single-file static pages only. Real projects have existing code, components and a `DESIGN.md`, which is the case the skill is built for and this benchmark does not cover.
- The skill's author ran the benchmark. Everything needed to rerun it is in this folder.

## Rerun it

```bash
cd benchmark
npm install
REPS=3 JOBS=5 ./run-all.sh
CHROME_PATH=/path/to/chrome node render.mjs
node make-packets.mjs
# score each results/judging/<brief>/ with judge-rubric.md into results/judgments/<judge>/<brief>.json
node aggregate.mjs
node gallery.mjs
```

`build.sh` needs `claude`, `bwrap`, `jq` and `rsync`, and reads credentials from `~/.claude/.credentials.json`. Our run cost $6.97 in builder tokens and took about 9 minutes at 5 jobs, not counting judging.
