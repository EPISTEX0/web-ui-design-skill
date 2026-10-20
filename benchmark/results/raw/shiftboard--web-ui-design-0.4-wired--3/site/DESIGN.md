# Shiftboard design (as found)

- Stack: React + Vite, HashRouter, CSS modules. All values come from `src/styles/tokens.css` (warm neutrals, harbour-blue accent, 4px spacing scale, Hanken Grotesk).
- Shell: dark sidebar + content column (`AppShell`, `Sidebar`, `PageHeader`). Cards and tables are flat with 1px borders; shadows are rare.
- Components: Button (primary/secondary/ghost/danger, sm/md), Badge tones, Card, Table, Modal, Field/Input/Select/Textarea, EmptyState, Skeleton.

## Time off page
- Status filter is a button group (`aria-pressed`) rather than a new tab component. Pending first, sorted by start date.
- Declining requires a reason (the API rejects an empty one), so Decline opens a Modal; Approve is one click.
- Under 760px the table stacks into cards so actions stay reachable.
- Secondary text uses `--color-text-muted`; `--color-text-subtle` fails contrast on surface (existing pages still use it).
