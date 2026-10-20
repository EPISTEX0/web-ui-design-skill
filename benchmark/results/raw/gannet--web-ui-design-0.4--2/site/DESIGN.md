# MV Gannet loading screen

## Brief
- Subject: Skerra Ferry Company, car-deck loading on the MV Gannet from Port Ailig. Source: user.
- Primary action: find a booking by the last 3 plate characters, assign a lane. Source: user.
- Audience/device: deck crew, rugged tablet in portrait, gloves, rain, low sun. Source: user.
- Mode: Operate. Family: Dense tool, with 18px text, 56-100px targets and 2-3px borders. Source: user.
- Brand: navy #12304a, lifejacket yellow #f2b705, text-only wordmark. Source: user.
- Rules (user's notes): 4 lanes, 22 units (5/6/6/5); car 1, van or car+trailer 2, lorry/island bus 4 (lanes 2-3 only); lane 1 headroom 2.1 m; sailings 07:10 08:30 10:15 12:40 14:30 16:20 18:05; 25 min crossing; Thursday 10:15 = fuel tanker + foot passengers only. No weight limit given, so none is shown.
- Sample data (replace): every booking (plates, vehicles, heights, names), loaded-state seed on first run.

## Tokens
Navy is text and fills; yellow marks the suggested lane, the plate search key, the selected vehicle and Undo. Light ground for glare. Neutrals are one hue (240). System font stack, so no font loading. 4px spacing scale. Depth: borders only. Radius 4/8.

## Decisions
- Deck plan is the signature: lane rows with a cell per unit, sticky at the top so free space is always visible. It unsticks when the viewport is under 760px tall.
- Lane buttons show why they are disabled (too tall, lanes 2 and 3 only, needs N free), so crew need not guess.
- Loading applies at once, with Undo in a toast. No confirm dialogs.
- State is kept in localStorage per date and sailing.
