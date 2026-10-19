# Blind A/B benchmark

We built 36 pages and had three judges from three model families score them blind.

- Every design skill beats Claude Code's defaults by 1.6 to 2.0 points out of 10, with p ≤ 0.012.
- `web-ui-design` 0.2 scores highest overall (7.22), but its lead over 0.1 (6.96) and Anthropic's `frontend-design` (6.89) is within noise.
- The measurable gains are objective. In 0.2, no build failed contrast, against 6 of 9 in 0.1, and no build overflowed on mobile. It also has the best mobile score with all three judges.

Run dates: 2026-10-19, two rounds. Builder: Claude Sonnet 5.5 in Claude Code, headless.

## Results

Panel score is the mean of the three judges. Scores run from 1 to 10. Each arm has 9 builds, 3 per brief. All 36 builds were judged together in round 2, so every arm sits on one scale.

| Arm | Overall | Craft | Fit | Hierarchy | Mobile | Rank percentile |
| --- | --- | --- | --- | --- | --- | --- |
| Claude Code defaults | 5.26 | 5.78 | 5.48 | 6.44 | 5.15 | 0.16 |
| `frontend-design` | 6.89 | 7.33 | **7.78** | 7.70 | 5.52 | 0.55 |
| `web-ui-design` 0.1 | 6.96 | 7.44 | 7.63 | 7.67 | 6.41 | 0.62 |
| `web-ui-design` 0.2 | **7.22** | **7.48** | 7.67 | **7.81** | **6.70** | **0.67** |

| Comparison | Panel win rate, same brief | Mann-Whitney p |
| --- | --- | --- |
| 0.2 vs defaults | 0.96 | 0.001 |
| 0.1 vs defaults | 0.89 | 0.009 |
| `frontend-design` vs defaults | 0.93 | 0.012 |
| 0.2 vs `frontend-design` | 0.65 | 0.40 |
| 0.2 vs 0.1 | 0.48 | 1.00 |

A win rate of 0.96 means a 0.2 page outscored a defaults page built from the same brief in 96% of pairs.

Per judge, overall score:

| Judge | Defaults | `frontend-design` | 0.1 | 0.2 |
| --- | --- | --- | --- | --- |
| Gemini 4 Argon | 4.78 | 6.44 | **6.89** | **6.89** |
| GPT-6.1 Sol | 5.89 | 7.22 | 7.11 | **7.67** |
| Claude Opus 5.5 | 5.11 | 7.00 | 6.89 | **7.11** |

Judges agree with each other on overall scores at a Spearman correlation of 0.70 to 0.74. Round 2 re-judged the 27 round-1 builds under new labels and moved no arm by more than 0.15, which suggests the panel is stable.

Per brief, panel overall:

| Brief | Defaults | `frontend-design` | 0.1 | 0.2 |
| --- | --- | --- | --- | --- |
| Slow Clay, a pottery studio landing page | 5.11 | 6.78 | **7.78** | 7.00 |
| Roastline, a roastery dashboard | 5.22 | 7.11 | 6.67 | **7.22** |
| backoff-kit, a library docs page | 5.44 | 6.78 | 6.44 | **7.44** |

Process and objective checks:

| Arm | Mean cost | Median time | Skill triggered | Ran `check.mjs` | Wrote `DESIGN.md` | Builds with contrast failures | Mobile horizontal overflow | Axe serious and critical, median |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Defaults | $0.21 | 74 s | n/a | n/a | 0/9 | 5/9 | 1/9 | 3 |
| `frontend-design` | $0.24 | 73 s | 6/9 | n/a | 0/9 | 5/9 | 3/9 | 1 |
| 0.1 | $0.32 | 87 s | 8/9 | n/a | 0/9 | 6/9 | 1/9 | 2 |
| 0.2 | $0.34 | 103 s | 9/9 | 9/9 | 7/9 | **0/9** | **0/9** | **0** |

The full tables are in [`results/summary.md`](results/summary.md). Every build, score and judge note is in [`results/summary.json`](results/summary.json). Round 1 is kept in [`results/round-1/`](results/round-1/).

## What changed from 0.1 to 0.2, and what it did

Round 1 found four gaps. The transcripts showed the cause of each.

| Gap in 0.1 | Cause found in transcripts | Change in 0.2 | Result |
| --- | --- | --- | --- |
| 6 of 9 builds shipped contrast failures | The rules said "measure contrast", and no build did | [`scripts/check.mjs`](../skills/web-ui-design/scripts/check.mjs), a zero-dependency checker that reports contrast by color pair | 0 of 9 |
| Mobile defects the judges kept naming: clipped tables, grids that did not stack, a 345 px overflow | Builds screenshotted with a fixed window height, so content below 1,000 to 2,600 px was never seen | The checker captures full pages in tiles and flags overflow and squeezed columns. The step is done only when the run after the last edit is clean | Overflow 0 of 9, mobile score up 0.29 |
| `DESIGN.md` written 0 of 9 times | The step came last, after the page was done | `DESIGN.md` is written at step 4 as the token plan, before building | 7 of 9 |
| The docs build that ignored the skill was its worst page | The description did not name docs pages | The description lists landing page, app, dashboard, docs and form | Triggered 9 of 9. Docs score up 1.0 |

Cost per build rose 6%, to $0.34. The median build took 16 seconds longer.

## What 0.2 still gets wrong

- **Mobile tables on dashboards.** Two roastline builds still scored 4.67 and 5.33 on mobile for tables that scroll sideways. The checker reports those as notes, not failures, and those two builds ran it once and never re-ran it after their last edit. Neither wrote `DESIGN.md` either. Both also loaded Claude Code's built-in `dataviz` skill.
- **Avoiding one tell lands on another.** All three 0.2 pottery pages left cream and terracotta for cool mint, celadon or cobalt. Every judge called the palette cold or corporate for a clay studio, and the brief's score fell 0.78 from 0.1. Swapping a tell for its opposite is still not a choice made for the subject.

## Integrity notes

- **A contaminated run was caught and discarded.** The first 0.2 draft used examples that matched two of the three briefs ("a roast curve on a roastery dashboard", a clay studio palette). All 3 roastline builds then drew a roast curve. We stopped the judges, replaced the examples with subjects outside the benchmark (a sailing school, a code review tool, a bakery), deleted those 9 builds and rebuilt. Every reported 0.2 transcript shows the clean skill text. Roast curves still appear in 0.2, and in all 3 round-1 `frontend-design` roastline builds, so the idea comes from the model.
- **0.1 is frozen** in [`arms/web-ui-design-0.1`](arms/web-ui-design-0.1). The 0.2 arm copies [`skills/web-ui-design`](../skills/web-ui-design) at the benchmark commit.

## Method

**Arms.** Each build ran in a fresh `CLAUDE_CONFIG_DIR` that held only credentials, plus the arm's skill in `skills/`. No user settings, hooks, plugins or `CLAUDE.md` were loaded. All arms kept Claude Code's built-in skills. No build invoked the built-in `design` skill. One local hooks mod, `mem-notice`, loaded in every arm.

- `none`: Claude Code defaults.
- `frontend-design`: Anthropic's skill, copied from the official plugin into [`arms/frontend-design`](arms/frontend-design) under its Apache 2.0 license.
- `web-ui-design`: version 0.1, frozen.
- `web-ui-design-0.2`: this repo's skill.

**Briefs.** Three organic prompts, one per mode, in [`briefs/`](briefs): a landing page (*Persuade*), a dashboard (*Operate*) and a docs page (*Read*). The prompts say nothing about design quality, skills or testing.

**Builds.** [`build.sh`](build.sh) runs `claude -p` with Sonnet 5.5 in an empty folder named after the client. Each build runs inside `bwrap` with a private `/tmp`, so parallel builds cannot see each other's files. Every arm has the same headless Chromium on `PATH`. [`run-all.sh`](run-all.sh) interleaves arms and briefs, 3 reps each, and skips builds that already have a result.

**Rendering.** [`render.mjs`](render.mjs) loads each page in Playwright, scrolls it to trigger reveal animations, and captures the first desktop viewport and full pages at 1440 and 390 px. It also runs axe-core and measures horizontal overflow. This is separate from the skill's own checker.

**Judging.** [`make-packets.mjs`](make-packets.mjs) copies screenshots under random labels, such as `D3`, and keeps the key outside the judged folder. Three judges scored each brief separately against [`judge-rubric.md`](judge-rubric.md): GPT-6.1 Sol, Gemini 4 Argon and Claude Opus 5.5. Each judge saw the labels in a different order. Every judge passed an image-reading check before round 1.

## Limits

- 9 builds per arm. The skills-vs-defaults gap is significant. Gaps between the skills are not.
- One builder model, Sonnet 5.5. Results may differ on Opus or other agents.
- Judges are models, not people. Vote in the [blind gallery](https://epistex0.github.io/web-ui-design-skill/benchmark/results/gallery/) and open an issue with your picks.
- Single-file static pages only. Real projects have existing code, components and a `DESIGN.md`, which is the case the skill is built for and this benchmark does not cover.
- The skill's author ran the benchmark and wrote 0.2 after seeing round-1 judge notes. 0.2 was then tested on the same three briefs, so it may fit them better than briefs it has not seen. New briefs are the next test.

## Rerun it

```bash
cd benchmark
npm install
REPS=3 JOBS=4 ./run-all.sh
CHROME_PATH=/path/to/chrome node render.mjs
node make-packets.mjs
# score each results/judging/<brief>/ with judge-rubric.md into results/judgments/<judge>/<brief>.json
node aggregate.mjs
node gallery.mjs
```

`build.sh` needs `claude`, `bwrap`, `jq` and `rsync`, and reads credentials from `~/.claude/.credentials.json`. Round 1 cost $6.97 in builder tokens for 27 builds, and the 0.2 round cost $3.09 for 9, not counting judging.
