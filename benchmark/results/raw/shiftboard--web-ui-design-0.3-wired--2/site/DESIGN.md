# Shiftboard design notes

Extracted from the code as found, plus the Time off page decisions.

## Stack
React 19, react-router (HashRouter), Vite, CSS modules. Components live in `src/components`, pages in `src/pages`, all values come from `src/styles/tokens.css`.

## Tokens (src/styles/tokens.css)
- Colour: warm neutral ramp (`--neutral-*`), harbour-blue accent (`--accent-*`), status colours (`--color-success|warning|danger` and `-soft`). Use the semantic `--color-*` roles.
- Type: Hanken Grotesk, `--text-xs` to `--text-2xl`. Spacing: 4px base, `--space-*`. Radius: `--radius-*`. Depth: borders on cards, shadows only on the modal.
- Shell: dark sidebar (232px), content max 1160px, sidebar collapses to a top bar at 760px.

## Components
Button (primary, secondary, ghost, danger; sm, md; loading), Badge (tones), Card, Table parts, Field/Input/Select/Textarea, Modal, EmptyState, Skeleton, Spinner, PageHeader, Icon.

## Time off page (`/time-off`)
- Filter is a Select, matching the Staff page; defaults to Pending because that is the manager's job. Rows sort by start date, soonest first.
- Approve is one click. Decline opens a Modal with a required reason, because `declineRequest` rejects an empty reason.
- Pending badge uses the accent tone, not warning: warning text on its soft background is 4.3:1 and fails contrast.
- Secondary text uses `--color-text-muted`, not `--color-text-subtle` (3.9:1 on the surface).
- Below 1160px the table would clip its action buttons, so rows stack into cards (CSS in `TimeOff.module.css`).

## Inconsistencies noted, not fixed
- `--color-text-subtle` and the warning badge fail contrast (Staff and Schedule use them).
- Nav links and small buttons are under 44px tap height on phones.
