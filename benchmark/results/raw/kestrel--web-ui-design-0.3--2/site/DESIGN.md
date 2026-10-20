---
name: Kestrel Physio front desk
mode: operate
page-type: Dashboard (with list and detail actions)
family: Dense tool, softened for a shared desk screen
stack: plain HTML, CSS and JS in index.html, no build
colors:
  bg: "#f1f4f7"
  surface: "#ffffff"
  text: "#18212b"
  text-secondary: "#36424e"
  border: "#d3dbe3"
  accent: "#a8431b"
typography:
  body: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
  scale: [13, 14, 16, 18, 24, 32]
spacing-base: 4
radius: { sm: 4, md: 8, lg: 12 }
depth: ring-shadow
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  durations: { press: 120, hover: 160, overlay: 220 }
---

# Kestrel Physio front desk

## Brief
| Item | Value | Source |
| --- | --- | --- |
| Subject | Physiotherapy clinic, 4 therapists | user |
| Primary action | Check in a patient who has arrived (walk-in button is the one filled action) | assumed |
| Audience and device | Receptionist, desktop or tablet, sometimes a phone | assumed |
| Assets | None given. Palette from kestrel plumage (slate head, rufous back) | assumed |
| Content | Sample patients, therapists and amounts, labelled as sample | user asked for realistic sample data |

## Decisions
| Decision | Rationale |
| --- | --- |
| Simulated clock starts at 10:42 am on 20 Oct 2026 | Sample data stays consistent with "now" |
| Queue sorted by urgency (waiting, late, in treatment, payment due, booked, finished) | First screen answers "what needs me now" |
| Status always has icon + text, never colour alone | Accessibility |
| Row actions are outlined, only walk-in is filled | One primary action per view |
| Filters live in the URL hash; every action has Undo | Rules: shareable state, reversible changes |
| System font stack | No font load on a desk machine; Operate uses one family |
| Signature: therapist timeline with a live "now" line | Shows who is free before you send someone in |
