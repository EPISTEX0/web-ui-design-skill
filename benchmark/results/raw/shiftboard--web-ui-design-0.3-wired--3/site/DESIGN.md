# Shiftboard design notes (as found, plus Time off)

- Stack: React 19, react-router (HashRouter), CSS modules, Hanken Grotesk. Tokens in `src/styles/tokens.css`; use `var(--…)` only.
- Look: warm neutral ramp, harbour-blue accent (`--color-accent`), dark sidebar, 8px card radius, flat with `--shadow-sm`.
- Components in `src/components` (Button, Badge, Card flush, Table, Select, Textarea, Modal, EmptyState, Skeleton, PageHeader). Compose these first.
- Page pattern: `PageHeader` → filter row (grid, one column under 760px) → `Card flush` containing a `Table`, or `EmptyState`.

## Time off (`src/pages/TimeOff.tsx`)
- Defaults to the Pending filter, sorted by soonest start date; other filters sort by newest request.
- Approve acts immediately and shows a spinner on that row. Decline opens a modal and requires a reason, because `declineRequest` throws without one.
- Statuses map to Badge tones: pending=warning, approved=success, declined=danger.
- Secondary text uses `--color-text-muted`, not `--color-text-subtle`, which fails contrast (3.9:1).

## Known inconsistencies (not fixed)
- `--color-text-subtle` on surface is 3.9:1, and the warning badge is 4.3:1. Both fail AA and also affect Schedule and Staff.
- Sidebar links and small buttons are under 44px tall on phones.
