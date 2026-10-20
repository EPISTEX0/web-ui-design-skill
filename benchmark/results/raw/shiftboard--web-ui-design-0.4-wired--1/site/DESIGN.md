# Shiftboard design notes (as found, plus Time off)

- Tokens: `src/styles/tokens.css` (warm neutrals, harbour-blue accent, status colours, 4px spacing, radius, type scale). Components use CSS modules and `var(--...)` only.
- Shell: fixed dark sidebar (232px) + content max 1160px; top bar nav below 760px. Font: Hanken Grotesk Variable.
- Components: Button (primary/secondary/ghost/danger, sm/md, loading), Badge tones, Card (flush), Table, Select/Input/Textarea via Field, Modal, EmptyState, Skeleton.

## Time off page (`src/pages/TimeOff.tsx`)
- Defaults to the Pending filter, sorted by start date (soonest first) so urgent requests surface.
- Approve is one click; Decline opens a modal because the API requires a reason.
- Pending badge uses the `accent` tone: `warning` text on `warning-soft` is 4.3:1, below AA.
- Below 1100px the table stacks into cards so Approve/Decline stay reachable; the shared Table stays unchanged.
- Secondary text uses `--color-text-muted` (the `-subtle` token is 3.9:1 on the surface).

## Inconsistencies noted, not fixed
- `--color-text-subtle` fails contrast on surfaces (used by Staff/Schedule).
- `warning` badge tone fails contrast.
