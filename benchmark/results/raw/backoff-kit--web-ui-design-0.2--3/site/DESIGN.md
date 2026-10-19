---
name: backoff-kit docs
mode: read
colors:
  bg: "oklch(0.985 0.004 250)"
  surface: "oklch(0.96 0.007 250)"
  text: "oklch(0.22 0.02 250)"
  text-secondary: "oklch(0.4 0.02 250)"
  text-tertiary: "oklch(0.5 0.02 250)"
  border: "oklch(0.9 0.008 250)"
  accent: "oklch(0.5 0.13 215)"
typography:
  display: "ui-sans-serif, system-ui, sans-serif (one family)"
  body: "ui-sans-serif, system-ui, sans-serif"
  code: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
  scale: [12, 14, 16, 20, 28, 40]
spacing-base: 4
radius: { sm: 4, md: 8 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 120, hover: 160, bars: 240 }
---

# backoff-kit docs design

## Direction
A single-page reference for developers who scan for an option name and copy a snippet. Quiet, dense enough to scan, nothing decorative. The signature element is the backoff explorer: change retries, delays, factor and jitter and see the wait for each retry drawn as a band on a timeline, which is the thing the library actually does.

## References
- Stripe docs: code beside the explanation, a sticky section nav.
- Node.js API docs: each option as a named entry with type and default, no table.
- Timing diagrams (oscilloscope/waterfall): horizontal bands on a shared time axis for the explorer.

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| System font stacks, no web fonts | Docs page must load with no build step and no network; nothing to fail to load | 2026-10-19 |
| Cool blue-grey neutrals, teal-blue accent | Avoids cream/terracotta and near-black/neon defaults; accent only for links, focus, bands | 2026-10-19 |
| Borders only, no shadows | Reading surface; structure comes from space and 1px lines | 2026-10-19 |
| Options as entries, not a table | Reads at 390px without a scrolling table | 2026-10-19 |
| Explorer starts at example values, not defaults | Shows the maxDelay cap; defaults are documented on the option | 2026-10-19 |
| Highlighter is ~15 lines of JS | No dependency; code stays readable if JS fails | 2026-10-19 |
