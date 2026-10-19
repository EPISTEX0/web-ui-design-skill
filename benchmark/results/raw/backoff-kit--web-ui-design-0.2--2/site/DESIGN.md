---
name: backoff-kit docs
mode: read
colors:
  bg: "oklch(99% 0.003 200)"
  surface: "oklch(96.5% 0.006 205)"
  text: "oklch(22% 0.02 220)"
  text-secondary: "oklch(42% 0.02 220)"
  text-tertiary: "oklch(50% 0.02 220)"
  border: "oklch(90% 0.007 215)"
  accent: "oklch(46% 0.1 195)"
typography:
  display: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
  body: "same family; monospace (ui-monospace stack) only for code and option names"
  scale: [13, 14, 16, 18, 24, 36]
spacing-base: 4
radius: { sm: 4, md: 8, lg: 12 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  ease-in-out: "cubic-bezier(0.77, 0, 0.175, 1)"
  durations: { press: 120, menu: 180, overlay: 280 }
---

# backoff-kit docs design

## Direction
A reference page for developers who arrive with a failing network call and want the option name and a copyable recipe. Quiet, dense enough to scan, one teal accent used for links, focus and the one live element. Signature element: the backoff schedule explorer, which draws the real delay ranges produced by the formula as the reader edits the options.

## References
- Stripe docs: sticky left nav with scrollspy, prose column held to about 70 characters.
- MDN reference pages: each parameter as a row of name, type, default, then description.

## Decisions
| Decision | Rationale | Date |
| --- | --- | --- |
| System font stack, no web fonts | Offline-safe, no loading flash, suits a docs page | 2026-10-19 |
| Borders only | Docs page, no floating surfaces | 2026-10-19 |
| Teal accent, light and dark themes via `prefers-color-scheme` | Avoids indigo and cream defaults; neutral hue 220 matches it | 2026-10-19 |
| Option table as stacked rows | Reads on a phone without horizontal scroll | 2026-10-19 |
| Option set is assumed (retries, minDelay, maxDelay, factor, jitter, signal, shouldRetry, retryAfter, onRetry) | No source existed in the folder; confirm against the library | 2026-10-19 |
