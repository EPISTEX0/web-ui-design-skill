# Shiftboard design notes

Recorded "as found" plus decisions for the Time off page. Tokens live in `src/styles/tokens.css`; shared components in `src/components`, each with a CSS module.

## Decisions
- **Time off** (`src/pages/TimeOff.tsx`): pending requests first by start date, other statuses newest first. Default filter is Pending.
- Decline requires a reason (the API rejects an empty one), collected in a Modal with a Textarea. Approve is one click.
- Status badges: pending `accent`, approved `success`, declined `danger`. Pending avoids `warning` because the warning badge colours fail 4.5:1 contrast.
- Secondary text on this page uses `--color-text-muted`, not `--color-text-subtle` (3.9:1 on the surface).
- Below 760px the table is restyled in `TimeOff.module.css` as stacked blocks so Approve and Decline stay on screen.

## Inconsistencies noted, not fixed
- `--color-text-subtle` fails contrast on surfaces (Staff emails use it).
- `warning` badge fails contrast (Schedule uses it).
- Staff and Schedule tables scroll sideways on phones.
