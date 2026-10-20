---
name: MV Gannet loading screen
mode: operate
page-type: List and detail (with a deck plan)
family: Dense tool, scaled up for gloves and glare
stack: single index.html, plain CSS and JS, no build, system fonts, localStorage
colors:
  bg: "#f1f5f8"
  surface: "#ffffff"
  text: "#081826"
  text-secondary: "#2c4760"
  border: "#6a859c"
  accent: "#f2b705"
  brand: "#12304a"
typography:
  body: "system-ui, Roboto, Segoe UI, Helvetica Neue, Arial, sans-serif"
  scale: [15, 16, 18, 20, 24, 34, 56]
spacing-base: 4
radius: { sm: 6, md: 10, lg: 16 }
depth: borders
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  durations: { press: 120, sheet: 220 }
---

# MV Gannet loading design

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Loading cars onto MV Gannet, Skerra Ferry Company | user |
| Primary action | Find a booking by the last 3 plate characters, mark it loaded, give it a lane; always see deck space left | user |
| Audience and device | Deck crew, rugged Android tablet in portrait, outdoors, rain, low sun, thick gloves, patchy signal | user |
| Assets | Navy #12304a, lifejacket yellow #f2b705, no logo | user |
| Content | Sample data only (labelled in the UI). Lane lengths, plates, people are invented | user (no real data) |
| Boarding order | Priority, then other bookings, then standby; by check-in time within each | user |

## Direction
Light, very high contrast for glare: navy ink on white, navy chrome, yellow only for the one primary action per view and for key numbers. Everything touchable is 56px or more. Signature: number plates drawn with the last 3 characters large, because that is how the crew find and recognise vehicles; the same 3 characters label each vehicle in the deck plan.

## Decisions
| Decision | Rationale |
| --- | --- |
| Light theme only, no dark mode | Glare and rain outdoors; contrast is worth more than night styling |
| System font stack | No web font to fail to load offline; Roboto on Android |
| Sticky header holds sync state and the 3 numbers (space left, on deck, room for standby) | Space left must be visible while working the list |
| Custom on-screen keypad (A-Z, 0-9, 64px keys) | Gloves on the Android keyboard are unreliable; keypad stays open between searches |
| Room for standby = free metres minus metres still needed by waiting priority and booked vehicles | Tells the crew whether standby will fit; approximate, ignores lane fragmentation |
| Lane suggestion = first lane in number order with room | Lanes fill in order; crew can pick any lane that fits |
| Changes apply at once with a 9s Undo toast, no confirm dialogs | Reversible actions; only Reset asks first, naming the consequence |
| Offline: state in localStorage, a pending list per booking, sync stub `pushToServer` | No backend exists yet; replace the stub with the real API |
