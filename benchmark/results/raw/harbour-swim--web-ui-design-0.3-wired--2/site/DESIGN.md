# Harbour Swim Club: design notes

## Brief
- **Case:** Improve, scope Refresh. Structure and content kept, visual style and layout rebuilt mobile-first.
- **Page type:** Local business, single page. Style family: Soft and friendly, kept clean (white and navy, yellow as accent only).
- **Primary action:** check the timetable (user chose this). Secondary: join.
- **Users and device:** parents and older members, mostly on phones poolside, checking timetable and prices.
- **Feel:** clean and fresh (user's choice).
- **Constraints (user):** plain HTML, CSS and JS, no build step or framework, volunteers edit by hand. Keep navy, yellow and the logo. Keep every session, price, the join form and the news.
- **Assumed:** the join form stays client-side only (shows a thank-you, sends nothing). No backend was invented.

## Survival list (all confirmed)
27 sessions (every cell identical to the original), 4 plan prices, join form with the original 5 validations, 3 news items, contact details, all 4 images, logo, the 4 ticker notices (now "Club notices").

## Tokens (top of `style.css`)
- Colour: navy `#1b2a4a` (brand), yellow `#f2c230` (brand), link `#14608a`, tint `#f1f5f9`, line `#d3dbe6`. Text ramp: `#1b2a4a` / `#3f4b66` / `#566179`.
- Yellow is used for fills, rules and buttons, never as text on white (it was 1.6:1 before). Text on yellow is navy.
- Type: system font stack (no web fonts, nothing to load). Body 18px, line-height 1.55, for older readers. Headings 700.
- Spacing: rem values on a 4px scale. Radius: 12 (cards, images), 8 (controls).
- Depth: tonal layers (white and tint sections) plus 1px borders. No shadows.
- Touch: every control is at least 44px tall, form fields 48px, inputs 16px+.
- Breakpoints: base is phone, `48rem` (tablet) shows the timetable as a real table, `64rem` puts the header and hero on one row and the plans in 4 columns.

## Decisions
- **Timetable is one table per day** (the original was one 6-column, 940px table). On phones each row stacks as time, session, then Lane/Level/Coach. Labels come from `data-label` attributes. A row of day buttons sticks to the top while scrolling the timetable, and JS marks today's day.
- **Section order:** hero, notices, timetable, membership, welcome, join, news, contact. Welcome moved after membership so the timetable and prices come first.
- **Ticker replaced by a static "Club notices" list.** A scrolling marquee is hard to read, can't be paused and hides notices off-screen.
- **Join form:** real labels, `type=email/tel`, autocomplete, inline errors on blur and submit, focus moves to the first error, real submit button. Same rules and wording as the old `alert()` messages.
- **News dates are left as 2013.** They are the club's own content. See the open question in the reply.

## Editing by hand
- New session: copy a `<tr>` inside the right day's `<tbody>`, keep the order Time, Session, Lane, Level, Coach.
- New notice: add or delete an `<li>` in the notices list.
- New news item: copy an `<article class="item">` block.
