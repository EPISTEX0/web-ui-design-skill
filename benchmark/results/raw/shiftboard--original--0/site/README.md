# Shiftboard

Internal scheduling tool for our three restaurants: Quayside, Market Hall and Northgate. Managers use it to see who is working where and to keep staff records tidy.

## Running it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check, then bundle into dist/
```

The build uses relative asset paths and a hash router, so `dist/index.html` also opens straight from disk.

## Layout

```
src/
  api/           mock API clients (in-memory, simulated latency)
  components/    shared UI: AppShell, Sidebar, PageHeader, Button, Badge, Card, Table, Field/Input/Select/Textarea, Modal, EmptyState, Spinner, Skeleton
  data/          sample locations, staff and shifts
  lib/           small helpers (dates, class names)
  pages/         one file per route, with its own CSS module
  styles/        tokens.css (design tokens) and global.css (reset and base)
```

Routes live in `src/App.tsx`. Sidebar links are listed in `src/components/Sidebar.tsx`.

## Styling

All values come from `src/styles/tokens.css`: the warm neutral ramp, the harbour-blue accent, status colours, the 4px spacing scale, radii, type scale and shadows. Components use CSS modules and read tokens through `var(--...)`. Fonts are self-hosted through `@fontsource-variable/hanken-grotesk`, so the app makes no network requests for assets.

## Mock API

`src/api/timeOff.ts` is the stand-in for the time-off service the backend team is building. It exposes `getTimeOffRequests()`, `approveRequest(id)` and `declineRequest(id, reason)`. Declining requires a non-empty reason and rejects otherwise. State lives in memory and resets on reload.
