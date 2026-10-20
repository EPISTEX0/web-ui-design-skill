# Blind A/B benchmark

Four rounds, 153 builds, three judges from three model families scoring blind.

**Round 4 (v0.4)** fixed the three gaps round 3 found and checked them against bars set before any build ran, on three fresh New briefs.

- **New sites.** v0.4 scored 6.41 against 2.89 for defaults (win rate 0.89, p = 0.001) and 4.93 for v0.3 (win rate 0.80, p = 0.107). It asked the client in 15 of 15 eligible builds, against 11 of 15 for v0.3 in round 3.
- **A client who declines** still gets a page with no measurable gain over defaults overall (3.15). It is better built, but it cannot know facts nobody gave it. That missed its bar.
- **Phones.** Every wired Extend build kept Approve and Decline in reach at 390 px.

**Round 3 (v0.3)** tested the three cases the skill now routes: a new site, a page added to an existing app, and a redesign. A simulated client answered the builder's questions from private notes, and the judges scored each page against those notes.

- **New sites.** v0.3 scored 6.85 against 4.37 for Claude Code's defaults (win rate 0.81, p = 0.005). The 6 builds where it asked and got answers averaged 7.72, and the 3 where it never asked scored like defaults. The same skill with a client who declined every question scored 4.15. The gain comes from the question round, not from the catalog.
- **Adding a page to an app.** Installed alone, v0.3 never triggered (0 of 3). With the one `CLAUDE.md` line the README asks for, it triggered 3 of 3 and scored 7.22 against 5.11. Its pages were the only ones that worked on a phone.
- **Redesigns.** Every skill arm beat defaults (about 6.6 against 4.33) and fixed all 12 planted defects. v0.3 did no better than v0.2 here.

Rounds 1 to 3 are below the round-4 section.

## Round 4

Run date: 2026-10-20. Builder: Claude Sonnet 5.5 in Claude Code, headless. 48 builds, $34.22 in builder tokens, not counting judging. 36 of them were judged.

Round 3 left three gaps: the question round was skipped on one brief, a client who declined got "to confirm" in place of facts, and a wired Extend build hid its actions on phones. Version 0.4 changes only those three things, and the round was meant to stop the fix-and-retest loop. The pass bars were written down before any build ran, and the skill ships whichever way they fall.

### What changed in 0.4

- **The question round.** "Use sample data" or "make it modern" now answer only the gap they name, and the builder still asks about the rest. A Brief line may say "assumed" only after the user left the choice to the builder.
- **Missing facts.** Facts the user did not give (names, hours, prices, dates) become realistic sample values, listed in the Brief and in the reply for the user to replace. Proof (reviews, ratings, logos, stats) still comes only from the user, so the section is dropped rather than filled.
- **The checker.** `check.mjs` now fails a control that sits out of reach on a phone, inside a clipping parent or off screen. It warns on placeholder text such as "TBC" or "[Price]". The render loop opens the 390 px tiles first.

### What was tested

| Brief | Prompt, in short | What the client's private notes hold |
| --- | --- | --- |
| [le-goff](briefs/le-goff.md) | An online shop page for an oyster farm in Cancale | Shipping Wednesday and Thursday only, orders close Monday 18:00, box prices, slate, kelp ochre and shell white |
| [gannet](briefs/gannet.md) | A car-loading screen for a ferry crew, "use realistic sample data" | A rugged portrait tablet used with gloves, lane 1 headroom 2.1 m, navy and safety yellow |
| [dean-fungi](briefs/dean-fungi.md) | A species guide for a fungus recording group | Never write "edible", four fixed labels, each eaten species shown beside its look-alike, red only for Deadly |

A subagent told not to open `skills/` or `arms/` wrote the three briefs and their notes. Its brief is not archived. The arms were `none`, `web-ui-design-0.3` frozen in [`arms/web-ui-design-0.3`](arms/web-ui-design-0.3), `web-ui-design-0.4`, and `web-ui-design-0.4-silent`, where the client declines every question. The client, the checks, the rubric ([`judge-rubric-new.md`](judge-rubric-new.md)) and the three judges are the same as in round 3.

The other 12 builds tested the three fixes where they had failed before. Three were judged-round builds of `web-ui-design-0.4-wired` on harbour-swim. Nine were tuning builds on round-3 briefs: 0.4 on kestrel, 0.4-silent on salt-and-iron and 0.4-wired on shiftboard.

### Results

Panel score, 1 to 10, 9 builds per arm:

| Arm | craft | fit | hierarchy | mobile | overall | Asked the client | Mean cost |
| --- | --- | --- | --- | --- | --- | --- | --- |
| none | 5.22 | 2.56 | 5.70 | 4.78 | 2.89 | 0/9 | $0.30 |
| web-ui-design-0.3 | 6.59 | 4.74 | 6.74 | 6.15 | 4.93 | 6/9 | $0.98 |
| web-ui-design-0.4 | **7.00** | **6.74** | **7.56** | **6.70** | **6.41** | 9/9 | $0.95 |
| web-ui-design-0.4-silent | 6.15 | 2.41 | 6.33 | 5.52 | 3.15 | 9/9 | $0.82 |

- **0.4 beat defaults** with a win rate of 0.89 (p = 0.001). It also led 0.3 with a win rate of 0.80 (p = 0.107 for the panel, p = 0.028 for Opus alone). It had the top brief mean in 8 of 9 judge and brief pairs. The exception was GPT on le-goff, which put 0.3 ahead, 7.33 to 7.00.
- **The gain is fit.** 0.4 asked in every build. 0.3 asked in 6 of 9, and those 6 averaged 5.50 against 3.78 for the 3 that skipped the round.
- **A client who declines still gets little.** 0.4-silent beat defaults on craft (+0.93), hierarchy (+0.63) and mobile (+0.74). On fit and overall it showed no measurable difference (win rate 0.54, p = 0.59). These briefs hide the deciding facts in the client's notes, so a builder who gets no answers cannot know them.
- **Almost no placeholder text.** One of the 36 judged builds showed "to be confirmed", a 0.4 fungus guide whose client had asked for exactly that wording on the fields the notes left out. This was checked with the checker's own pattern on the rendered text at 390 px.
- Judges agree on overall scores at a Spearman correlation of 0.68 to 0.88.

### The pre-registered bars

| # | Bar | Result |
| --- | --- | --- |
| C1 | 0.4 runs the question round in at least 13 of 15 eligible builds | **Met, 15 of 15.** 9 fresh New builds, 3 kestrel builds (0 of 3 in round 3), 3 wired harbour-swim builds |
| C2 | 0.4-silent scores at least 1.0 above defaults on the fresh briefs | **Missed.** +0.26 (3.15 against 2.89) |
| C3 | No wired shiftboard build leaves Approve or Decline out of reach at 390 px | **Met, 0 of 3.** 0.3-wired had 1 of 3 |
| C4 | 0.4 is not more than 0.5 below 0.3 on the fresh briefs | **Met, 1.48 above** |

The tuning builds also showed the other two fixes on the briefs where the gaps first appeared. On salt-and-iron, 0.4-silent raised the placeholder warning in 0 of 3 builds, against 2 of 3 for 0.3-silent. Every shiftboard 0.4-wired build reused the app's components and changed no existing page.

### Redesign side effect

All 3 wired harbour-swim builds fixed the 12 planted defects and kept the brand. One of them failed the content check. The client had approved "refresh the 2013 dates", and the builder went further. It moved the Easter closure to Christmas and invented four notices for the notice bar. It listed every change in its reply. The sample-value rule was written for missing facts, and here it reached into existing content. This goes to the next version.

### Integrity notes

- **The fixes were tuned on round-3 briefs.** One tuning pass ran on kestrel, salt-and-iron and shiftboard. The skill text was frozen after it, so the kestrel and shiftboard builds count toward C1 and C3 as built. C2 and C4 rest only on the fresh briefs.
- **The checker additions target the diagnosed gaps.** The reach failure and the placeholder warning were written after seeing round-3 failures. They are part of the skill under test, and the judges never saw checker output.
- **Earlier rounds' metrics were overwritten and restored.** `render.mjs` and `score-fixtures.mjs` re-scored every build on disk and rewrote 68 metrics files from rounds 1 to 3. Those files were restored from git. Only the new `actionsReachableMobile` field on shiftboard was kept, and its diff adds that one field.
- **The Extend reach metric is coarse.** `actionsReachableMobile` passes when at least one Approve or Decline button sits inside the 390 px viewport. It would not catch a page that hides every Decline button.
- The decision log, with every bar, diagnosis and result, is in [`results/round-4/decisions.tsv`](results/round-4/decisions.tsv).

### Limits

- 3 builds per arm per brief. 0.4 against defaults is significant. 0.4 against 0.3 is a strong hint (panel p = 0.107), not a significant result.
- One simulated client that answers readily, as in round 3. Judges score against the notes, so a build that follows a client reply the notes do not contain can lose fit.
- Screenshots stop at 6,000 px, which cut the mobile capture of 17 of the 36 pages. Defects further down were invisible to the judges.
- One author wrote the three briefs, and the notes again hold facts that only asking can reach. The fit criterion therefore rewards asking. The silent arm is the floor.
- Judges are models. Vote in the [round-4 blind gallery](https://epistex0.github.io/web-ui-design-skill/benchmark/results/round-4/gallery/).

The full tables, per judge, are in [`results/round-4/summary.md`](results/round-4/summary.md), and every build, score and judge note is in [`results/round-4/summary.json`](results/round-4/summary.json).

## Round 3

Run date: 2026-10-20. Builder: Claude Sonnet 5.5 in Claude Code, headless. 69 builds, $25.49 in builder tokens, not counting judging.

### What was tested

| Brief | Case | Prompt, in short | What the client's private notes hold |
| --- | --- | --- | --- |
| [tandem](briefs/tandem.md) | New, Persuade | A landing page for a bike shop in Utrecht | Test rides are the goal, brand green and orange, prices, 4.8 stars from 310 reviews, the address |
| [kestrel](briefs/kestrel.md) | New, Operate | A check-in screen for a clinic reception | A 10-inch touch tablet, receptionists in their 50s and 60s, one-tap check-in, brand teal |
| [salt-and-iron](briefs/salt-and-iron.md) | New, Read | A guide for a maritime exhibition | Visitors on phones in the gallery, 12 named stops with audio, rust and serif labels |
| [shiftboard](briefs/shiftboard.md) | Extend | "Add a Time off page where managers can review requests and approve or decline them" in a React 19 and Vite app | Pending first, a decline needs a reason, flag overlaps, keep the existing look |
| [harbour-swim](briefs/harbour-swim.md) | Improve | "Our swim club website looks dated and members complain it is hard to use on phones" | Keep the navy, yellow and logo, keep all content, plain HTML, a refresh rather than a rebuild |

The notes in [`profiles/`](profiles/) were written before any v0.3 skill text. [`fixtures/shiftboard`](fixtures/shiftboard) is a working app with tokens, CSS modules, shared components and a mock API. [`fixtures/harbour-swim`](fixtures/harbour-swim) is a 2013-style site with 12 measurable defects (fixed 980 px width, no viewport tag, 13 px grey text, alert-based form errors and others).

**Arms.**

- `none`: Claude Code defaults.
- `frontend-design`: Anthropic's skill, New briefs only.
- `web-ui-design-0.2`: frozen in [`arms/web-ui-design-0.2`](arms/web-ui-design-0.2).
- `web-ui-design-0.3`: this repo's skill.
- `web-ui-design-0.3-silent`: the same skill, but the client declines every question ("go with whatever you think is best"). New briefs only.
- `web-ui-design-0.3-wired`: the same skill plus the README's `CLAUDE.md` line. Extend and Improve only.

**The simulated client.** When a build ends a turn without delivering, [`build.sh`](build.sh) sends the builder's message to a separate Sonnet 5.5 session holding the request and the notes. It answers only what was asked, says "your call" when the notes are silent, and adds nothing. The builder resumes with the reply, at most twice. Every arm gets the same client, so an arm that asks gets answers and an arm that never asks gets none.

**Objective checks.** Static pages go through [`render.mjs`](render.mjs) as before, now with a 1180 px tablet capture, tap targets and a keyboard focus audit. The app runs through [`extend-checks.mjs`](extend-checks.mjs): it builds, finds the new page, diffs tokens and pixel-compares every existing page against the fixture. The redesign runs through [`improve-checks.mjs`](improve-checks.mjs): the 12 defects, 7 content and flow checks (every session, price and headline still present, the join form still works), and the brand. [`score-fixtures.mjs`](score-fixtures.mjs) runs both.

**Judging.** As in round 2, under random labels, by GPT-6.1 Sol, Gemini 4 Argon and Claude Opus 5.5. Each case has its own rubric: [`judge-rubric-new.md`](judge-rubric-new.md) (craft, fit to the notes, hierarchy, mobile), [`judge-rubric-extend.md`](judge-rubric-extend.md) (consistency with the app, craft, usability, mobile) and [`judge-rubric-improve.md`](judge-rubric-improve.md) (improvement, identity kept, craft, mobile). Extend and Improve judges also saw the untouched original as `REFERENCE`. Judges agree on overall scores at a Spearman correlation of 0.76 to 0.87.

### New sites

| Arm | Overall | Craft | Fit | Hierarchy | Mobile | Asked the client | Cost | Median time |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Defaults | 4.37 | 5.67 | 4.15 | 5.89 | 5.33 | 0/9 | $0.16 | 50 s |
| `frontend-design` | 3.59 | 5.33 | 3.11 | 5.37 | 4.93 | 0/9 | $0.23 | 70 s |
| 0.2 | 4.41 | 6.04 | 3.81 | 6.41 | 5.67 | 0/9 | $0.35 | 92 s |
| **0.3** | **6.85** | **6.96** | **7.30** | **7.81** | **7.15** | 6/9 | $0.51 | 178 s |
| 0.3, client declines | 4.15 | 6.00 | 3.70 | 6.37 | 5.22 | 6/9 | $0.51 | 140 s |

| Comparison | Panel win rate, same brief | Mann-Whitney p |
| --- | --- | --- |
| 0.3 vs defaults | 0.81 | 0.005 |
| 0.3 vs `frontend-design` | 0.94 | < 0.001 |
| 0.3 vs 0.2 | 0.76 | 0.008 |
| 0.3 vs 0.3 with the client declining | 0.85 | 0.004 |
| 0.2 vs defaults | 0.54 | 0.81 |

Round-3 p values are exact two-sided Mann-Whitney tests over every split of the builds.

Every judge ranks 0.3 first: Gemini 7.11, Opus 6.89, GPT 6.56, against 3.56 to 4.67 for every other arm.

Per brief, panel overall:

| Brief | Defaults | `frontend-design` | 0.2 | 0.3 | 0.3, client declines |
| --- | --- | --- | --- | --- | --- |
| tandem | 4.89 | 3.33 | 4.56 | **8.22** | 4.89 |
| salt-and-iron | 2.78 | 3.44 | 3.11 | **7.22** | 2.56 |
| kestrel | 5.44 | 4.00 | **5.56** | 5.11 | 5.00 |

**Why.** The score follows the answers. 0.3 asked in all 6 tandem and salt-and-iron builds. It scored 8.0 to 8.7 on tandem, and the best salt-and-iron page had all 12 real stop names, the right dates and the brand rust. On kestrel it asked 0 of 3 times and scored like every other arm. With the client declining, salt-and-iron pages were mostly "to confirm" placeholders, and every judge marked them down for it (1.7 to 3.3). Arms that never ask invent the facts, and the judges, holding the notes, scored the invented facts as misses. A real user answering the same questions gives the builder the same facts, so this is the effect to expect in use. A user who will not answer gets no gain.

**Round 2's lead is gone on these briefs.** 0.2 led defaults by 2 points in round 2 and ties them here (4.41 against 4.37). Two things changed together: briefs the skill had never seen, and a rubric that scores fit against facts the prompt does not give. This round cannot separate the two. 0.2 still shipped 0 contrast failures and 0 mobile overflows, against 7 of 9 and 2 of 9 for defaults.

### Adding a page to an existing app

| Arm | Overall | Consistency | Craft | Usability | Mobile | Skill triggered | Mobile overflow | Cost | Median time |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Defaults | 5.11 | 8.67 | 6.44 | 5.44 | 2.67 | n/a | 2/3 | $0.17 | 35 s |
| 0.2 | 5.22 | 8.89 | 6.89 | 5.56 | 2.33 | 0/3 | 3/3 | $0.17 | 34 s |
| 0.3 | 3.78 | 8.00 | 6.00 | 3.89 | 2.56 | 0/3 | 0/3 | $0.16 | 32 s |
| **0.3 wired** | **7.22** | **9.11** | **7.89** | **6.78** | **6.56** | 3/3 | 0/3 | $0.40 | 358 s |

All 12 builds compile, find the page, reuse the app's components, add 0 color literals, and change no existing page outside the sidebar, where the new link goes. The difference is on the phone. In every unwired build, a manager on a 390 px screen could not reach the Approve and Decline buttons. Two of the 3 wired builds turned the table into cards with the actions in reach, and the third hid them too.

Unwired 0.3 never loaded, so it ran as a second defaults arm. Its gap to defaults (3.78 against 5.11) is the noise between two equivalent arms at 3 builds each. Wired 0.3's lead (2.1 points, win rate 1.00) is larger than that noise, but at 3 against 3 the smallest possible exact p is 0.10, so this result is a strong hint, not a significant one. The wired build that hid its actions on mobile said in its reply that it never opened the 390 px screenshot, a render-loop step the skill requires.

### Redesigning an existing site

| Arm | Overall | Improvement | Identity | Craft | Mobile | Defects left, of 12 | Content and flows kept | Cost |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Defaults | 4.33 | 4.33 | 8.33 | 4.78 | 4.33 | 2.0 | 3/3 | $0.43 |
| **0.2** | **6.78** | **7.22** | 8.22 | **7.00** | **6.67** | 0 | 3/3 | $0.38 |
| 0.3 | 6.44 | 7.00 | 8.22 | 6.33 | 6.11 | 0 | 3/3 | $0.66 |
| 0.3 wired | 6.67 | 6.89 | 8.33 | 7.00 | 6.22 | 0 | 3/3 | $0.86 |

The skill triggered in all 9 skill builds. Every skill build fixed all 12 defects, and every arm kept the brand. Defaults left 1 to 3 defects and made the smallest change ("essentially the old site with better fonts"). 0.3 and 0.2 are tied (win rate 0.44). With 3 builds per arm, the smallest possible p is 0.10, so even 0.2's lead over defaults (win rate 1.00) is a strong hint, not a significant result. 0.3 asked about scope in 5 of 6 builds, and the answers changed little, because the request and the site already implied a refresh.

### Process

- **The router picked the right case every time.** Each of the 27 triggered 0.3 builds read the case file that matched its brief: `new.md` on New, `extend.md` on Extend, `improve.md` on Improve. Two wired Improve builds also opened `new.md`.
- **The question round fired in 11 of 15 eligible builds.** On kestrel the skill wrote "assumed" for every Brief line instead of asking, once labelling it "left to you" when the user had said nothing.
- **Cost.** 0.3 costs about 1.5 times 0.2 on New ($0.51 against $0.35) and 1.7 times on Improve. Wired Extend builds took a median of 6 minutes against 35 seconds for defaults.

### Integrity notes

- **Two smoke-test fixes before the run.** The first 0.3 smoke skipped the question round and marked every gap "assumed", so the round was rewritten to allow "assumed" only after the user leaves it to the builder. The Extend smoke never triggered in 3 tries, even with broader descriptions, which is why the wired arm exists. The smokes ran on scored briefs (tandem, shiftboard, harbour-swim), so the skill was tuned once on the test set. The smoke builds are not reported.
- **The catalog's author chose the briefs.** `patterns.md` was written after the briefs were picked, by the same author. The page types are general (landing, check-in, guide), but the catalog may fit these briefs better than unseen ones.
- **Three checker false negatives were fixed after the builds, before judging.** `improve-checks.mjs` read timetable sessions as missing when a redesign filtered rows by day tab ("Tue (today)") or set day names flush against other text, and it read the join form as broken when the confirmation said "Nearly there, Maya" instead of "Thanks, Maya". After the fixes, 4 builds that had failed pass, across the defaults, 0.2, 0.3 and wired arms. For a timetable filtered by day tabs, the check confirms each session is in the page and its day has a tab, without clicking through every tab.
- **One build record was corrected.** A defaults redesign committed its own change, so `build.sh` read a clean tree as "not delivered" and sent its delivery summary to the simulated client. The summary offered to wire up the join form, the client chose a mailto hand-off, and the builder added it. The record counts it as delivered with 2 client rounds and says so in a `note`. Its `changes.diff` was rebuilt from the fixture, and `build.sh` now counts commits as delivery.
- **The decision log was lost once.** A fixture subagent deleted the scratch folder holding the first decision log. It was rewritten from the session transcript.

### Limits

- 3 builds per arm per brief. The New result (9 against 9) is significant. Extend and Improve are 3 against 3 each, where no result can reach p < 0.10.
- One simulated client, Sonnet 5.5, that answers readily. Real users answer slower, partly, or not at all. The declining arm is the floor.
- The fit criterion rewards facts only the notes hold, which favors any arm that asks. That is the point of the question round, but it also makes round-3 scores incomparable with rounds 1 and 2.
- Judges are models. Vote in the [round-3 blind gallery](https://epistex0.github.io/web-ui-design-skill/benchmark/results/round-3/gallery/).

The full tables, per judge, are in [`results/round-3/summary.md`](results/round-3/summary.md), and every build, score and judge note is in [`results/round-3/summary.json`](results/round-3/summary.json).

## Rounds 1 and 2

We built 36 pages and had three judges from three model families score them blind.

- Every design skill beats Claude Code's defaults by 1.6 to 2.0 points out of 10, with p ≤ 0.012. Rounds 1 and 2 used the normal approximation; the exact test now in `aggregate.mjs` moves the panel p values by at most 0.025 and changes no conclusion.
- `web-ui-design` 0.2 scores highest overall (7.22), but its lead over 0.1 (6.96) and Anthropic's `frontend-design` (6.89) is within noise.
- The measurable gains are objective. In 0.2, no build failed contrast, against 6 of 9 in 0.1, and no build overflowed on mobile. It also has the best mobile score with all three judges.

Run dates: 2026-10-19, two rounds. Builder: Claude Sonnet 5.5 in Claude Code, headless.

### Results

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

### What changed from 0.1 to 0.2, and what it did

Round 1 found four gaps. The transcripts showed the cause of each.

| Gap in 0.1 | Cause found in transcripts | Change in 0.2 | Result |
| --- | --- | --- | --- |
| 6 of 9 builds shipped contrast failures | The rules said "measure contrast", and no build did | [`scripts/check.mjs`](../skills/web-ui-design/scripts/check.mjs), a zero-dependency checker that reports contrast by color pair | 0 of 9 |
| Mobile defects the judges kept naming: clipped tables, grids that did not stack, a 345 px overflow | Builds screenshotted with a fixed window height, so content below 1,000 to 2,600 px was never seen | The checker captures full pages in tiles and flags overflow and squeezed columns. The step is done only when the run after the last edit is clean | Overflow 0 of 9, mobile score up 0.29 |
| `DESIGN.md` written 0 of 9 times | The step came last, after the page was done | `DESIGN.md` is written at step 4 as the token plan, before building | 7 of 9 |
| The docs build that ignored the skill was its worst page | The description did not name docs pages | The description lists landing page, app, dashboard, docs and form | Triggered 9 of 9. Docs score up 1.0 |

Cost per build rose 6%, to $0.34. The median build took 16 seconds longer.

### What 0.2 still gets wrong

- **Mobile tables on dashboards.** Two roastline builds still scored 4.67 and 5.33 on mobile for tables that scroll sideways. The checker reports those as notes, not failures, and those two builds ran it once and never re-ran it after their last edit. Neither wrote `DESIGN.md` either. Both also loaded Claude Code's built-in `dataviz` skill.
- **Avoiding one tell lands on another.** All three 0.2 pottery pages left cream and terracotta for cool mint, celadon or cobalt. Every judge called the palette cold or corporate for a clay studio, and the brief's score fell 0.78 from 0.1. Swapping a tell for its opposite is still not a choice made for the subject.

### Integrity notes

- **A contaminated run was caught and discarded.** The first 0.2 draft used examples that matched two of the three briefs ("a roast curve on a roastery dashboard", a clay studio palette). All 3 roastline builds then drew a roast curve. We stopped the judges, replaced the examples with subjects outside the benchmark (a sailing school, a code review tool, a bakery), deleted those 9 builds and rebuilt. Every reported 0.2 transcript shows the clean skill text. Roast curves still appear in 0.2, and in all 3 round-1 `frontend-design` roastline builds, so the idea comes from the model.
- **0.1 is frozen** in [`arms/web-ui-design-0.1`](arms/web-ui-design-0.1). The 0.2 arm copies [`skills/web-ui-design`](../skills/web-ui-design) at the benchmark commit.

### Method

**Arms.** Each build ran in a fresh `CLAUDE_CONFIG_DIR` that held only credentials, plus the arm's skill in `skills/`. No user settings, hooks, plugins or `CLAUDE.md` were loaded. All arms kept Claude Code's built-in skills. No build invoked the built-in `design` skill. One local hooks mod, `mem-notice`, loaded in every arm.

- `none`: Claude Code defaults.
- `frontend-design`: Anthropic's skill, copied from the official plugin into [`arms/frontend-design`](arms/frontend-design) under its Apache 2.0 license.
- `web-ui-design`: version 0.1, frozen.
- `web-ui-design-0.2`: this repo's skill.

**Briefs.** Three organic prompts, one per mode, in [`briefs/`](briefs): a landing page (*Persuade*), a dashboard (*Operate*) and a docs page (*Read*). The prompts say nothing about design quality, skills or testing.

**Builds.** [`build.sh`](build.sh) runs `claude -p` with Sonnet 5.5 in an empty folder named after the client. Each build runs inside `bwrap` with a private `/tmp`, so parallel builds cannot see each other's files. Every arm has the same headless Chromium on `PATH`. [`run-all.sh`](run-all.sh) interleaves arms and briefs, 3 reps each, and skips builds that already have a result.

**Rendering.** [`render.mjs`](render.mjs) loads each page in Playwright, scrolls it to trigger reveal animations, and captures the first desktop viewport and full pages at 1440 and 390 px. It also runs axe-core and measures horizontal overflow. This is separate from the skill's own checker.

**Judging.** [`make-packets.mjs`](make-packets.mjs) copies screenshots under random labels, such as `D3`, and keeps the key outside the judged folder. Three judges scored each brief separately against [`judge-rubric.md`](judge-rubric.md): GPT-6.1 Sol, Gemini 4 Argon and Claude Opus 5.5. Each judge saw the labels in a different order. Every judge passed an image-reading check before round 1.

### Limits

- 9 builds per arm. The skills-vs-defaults gap is significant. Gaps between the skills are not.
- One builder model, Sonnet 5.5. Results may differ on Opus or other agents.
- Judges are models, not people. Vote in the [blind gallery](https://epistex0.github.io/web-ui-design-skill/benchmark/results/gallery/) and open an issue with your picks.
- Single-file static pages only. Real projects have existing code, components and a `DESIGN.md`, which rounds 1 and 2 do not cover. Round 3 does.
- The skill's author ran the benchmark and wrote 0.2 after seeing round-1 judge notes. 0.2 was then tested on the same three briefs, so it may fit them better than briefs it has not seen. Round 3, above, uses new briefs.

## Rerun it

```bash
cd benchmark
npm install
(cd fixtures/shiftboard && npm install)
REPS=3 JOBS=4 ./run-all.sh                                   # rounds 1 and 2
BRIEFS="tandem kestrel salt-and-iron" ARMS="none frontend-design web-ui-design-0.2 web-ui-design-0.3 web-ui-design-0.3-silent" REPS=3 JOBS=4 ./run-all.sh
BRIEFS="shiftboard harbour-swim" ARMS="none web-ui-design-0.2 web-ui-design-0.3 web-ui-design-0.3-wired" REPS=3 JOBS=4 ./run-all.sh
BRIEFS="le-goff gannet dean-fungi" ARMS="none web-ui-design-0.3 web-ui-design-0.4 web-ui-design-0.4-silent" REPS=3 JOBS=4 ./run-all.sh   # round 4
BRIEFS="harbour-swim" ARMS="web-ui-design-0.4-wired" REPS=3 JOBS=3 ./run-all.sh
export CHROME_PATH=/path/to/chrome
node render.mjs
node score-fixtures.mjs
ROUND=round-3 BRIEFS=tandem,kestrel,salt-and-iron,shiftboard,harbour-swim node make-packets.mjs
# score each results/round-3/judging/<brief>/ with its judging-brief.md into results/round-3/judgments/<judge>/<brief>.json
ROUND=round-3 node aggregate.mjs
ROUND=round-3 node gallery.mjs
# round 4: the same three steps with ROUND=round-4 BRIEFS=le-goff,gannet,dean-fungi
```

`render.mjs` and `score-fixtures.mjs` re-score every build in `results/raw/` unless you pass build ids, such as `node render.mjs le-goff--none--1`. Pass the new round's ids so earlier rounds' metrics stay as judged.

`build.sh` needs `claude`, `bwrap`, `jq` and `rsync`, and reads credentials from `~/.claude/.credentials.json`. Round 1 cost $6.97 in builder tokens for 27 builds, the 0.2 round $3.09 for 9, round 3 $25.49 for 69, and round 4 $34.22 for 48, not counting judging.
