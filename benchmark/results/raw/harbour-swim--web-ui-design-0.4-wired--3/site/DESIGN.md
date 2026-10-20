# Harbour Swim Club: design notes

Plain HTML, CSS and JS. No build step, no framework, no web fonts. Volunteers edit by hand.

## Brief

| Item | Value | Source |
| --- | --- | --- |
| Case | Improve, scope Refresh | user |
| Main job | Check the timetable (and prices) poolside on a phone | user |
| Users | Parents and older members, on phones | user |
| Feel | Clean and bright, still recognisably the club | user |
| Must keep | Navy and yellow, logo, all content, form behaviour | user |
| Old dates (2013 news, ticker dates, footer) | Left as is, listed for the club to update | user |

## Tokens (top of `style.css`)

- Brand: navy `#1b2a4a`, yellow `#f2c230`. Neutrals are a navy-tinted ramp in OKLCH.
- Yellow is a fill (buttons, rules, marks) or text on navy only. It is 1.6:1 on white, so it is never text on white.
- Type: one system font stack. Body 17px, line-height 1.55. Headings tight (-0.02em) and balanced.
- Spacing: 4px scale (`--s1` to `--s16`). Radius 12px cards, 8px inputs, pill for day buttons.
- Depth: borders and tone only (white, pale blue tint, navy footer). No shadows.

## Decisions

- **Timetable stays a real `<table>`.** Adding a session is copy-and-paste of one `<tr>`. On phones (under 720px) CSS turns each row into a card, with Lane, Level and Coach labels added by `td:nth-child(n)::before`. If you add or remove a column, update those rules.
- **Day picker** is built by `script.js` and defaults to today. `?day=thursday` in the URL selects a day. Without JavaScript the whole table shows.
- **Notices** replace the scrolling ticker (it could not be read or paused on a phone). They sit directly above the timetable, where poolside visitors look. Edit them in the `.notices` list.
- **Header:** the logo row scrolls away on phones and the nav row stays pinned. Join is a pill beside the logo on phones.
- **Form:** same checks and same thank-you message as before. Nothing is sent anywhere yet. To go live, replace the message in the `submit` handler in `script.js`, or point the form `action` at a form service.
- One filled yellow button per view: "See the timetable" in the hero, "Join now" in the form.
