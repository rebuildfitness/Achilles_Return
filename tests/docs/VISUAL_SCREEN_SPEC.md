# Achilles Return — Screen-by-Screen Visual Specification v1.0

## Visual source
Reference: `assets/design/achilles-return-hero-reference.png`
Design tokens: `docs/DESIGN_SYSTEM.md`

The goal is not to reproduce fake text from the hero literally. Reproduce the **visual language** while preserving the evidence-based rehab rules.

---

## 1. Onboarding / Welcome
### Purpose
Establish the premium athletic identity and begin setup.

### Layout
- Dark navy/charcoal hero area with basketball athlete image
- Achilles Return logo/name in white
- Headline: **Return to basketball with a smarter rehab plan.**
- Short supporting statement: criteria-based, progressive, built around actual capacity
- Primary blue CTA: `Get Started`
- Secondary: `Restore Backup`

### Important
Do not imply the app medically clears the user for sport.

---

## 2. Today — pre-check-in
### Header
Dark navy app bar with logo + `Achilles Return`.

### Content
Screen title: `Today`
Date below in muted text.

Primary card:
**How is your Achilles today?**
Short one-line explanation.
Blue `Check In` button.

Below:
`Today's Plan` card with session name and compact preview, but Start Workout remains dependent on readiness result.

Bottom:
`Next milestone` card with simple progress toward current capability target.

---

## 3. Today — post-check-in
Matches the central phone in the approved hero.

Top card is one of:
- Green: `Ready to Train`
- Amber: `Workout Adjusted`
- Red: `Stop Achilles Loading`

Below:
### Today's Workout
Card contains:
- workout name
- current capability label (example `Running Readiness`)
- number of exercises
- approximate focus, not fake timing precision
- `Open Workout` action

Below that:
Next milestone / short progress note.

Never expose readiness math.

---

## 4. Check-In
One compact vertical form, not six separate full-screen steps unless accessibility/testing shows that performs better.

Each question uses large segmented controls or radio-card buttons.

Sections:
- pain
- stiffness vs usual
- swelling vs usual
- response to previous session
- overall recovery
- unusual symptoms

Use white cards on off-white background. Red appears only if a red-flag option is selected.

Sticky bottom action: `See Today's Plan`.

---

## 5. Full Workout
This is the most important utility screen.

### Header
Dark app bar. Back + workout title + optional overflow.

### Summary strip
- status (Ready / Modified)
- current focus
- previous comparable session response

### Exercise list
All exercises visible on one scroll, Strong-style.

Each exercise card:
- name
- prescription (`3 × 8–10`)
- RPE + rest in small meta row
- `Short Demo` icon/text action clearly visible
- `Why?` info action
- per-set logging table

Set header:
`SET | PREVIOUS | WEIGHT | REPS | ✓`

Do not navigate away after every set.

### Bottom
Workout finish card/button appears after enough sets are logged; user may still scroll/edit earlier sets.

---

## 6. Plan
Matches the planning/calendar ideas in the approved hero.

### Top: This Week
Seven-day vertical or horizontal day selector plus stacked daily cards.

Each day shows:
- day/date
- workout name / Recovery / Rest
- focus
- readiness-dependent note only for today
- `View full workout`

Future workouts can be expanded but not logged early by default.

### Bottom: Workout Calendar
Full month calendar in a white card.
- selected date blue
- completed green dot
- modified amber dot
- missed gray/red only when semantically appropriate

Tap a historical date -> Workout History Detail.

---

## 7. Workout History Detail
Use same exercise cards as active workout but read-only by default.

Top summary:
- workout name/date
- Completed / Modified
- overall difficulty
- immediate Achilles response
- next-morning result: Tolerated / Borderline / Not Tolerated

Below:
Actual exercises, sets, load, reps, RPE.

Optional `Edit notes` only; avoid casually rewriting historical clinical data without an explicit edit flow/audit marker.

---

## 8. Progress
Matches left/right phone visual style from hero.

### Primary section
`Basketball Return`
Subtitle: structured path back to the game.

Vertical progression list:
1. Foundation / Strength
2. Running
3. Jumping & Plyometrics
4. Speed & Change of Direction
5. Basketball Return
6. Performance

Use clinical source-of-truth phase model underneath; user-facing grouping may be simplified visually.

Completed = green check.
Current = blue active number.
Locked = muted gray.

### Current milestone card
Example:
`Running Readiness`
`4 of 7 criteria complete`
Blue `View requirements`.

### Metrics
A compact `Detailed metrics` entry, not an always-open dashboard.

---

## 9. Milestone Requirements
White card list with simple checks.

Sections:
- Completed
- Still needed
- Supporting metrics (collapsed by default)

Each criterion can open `Why this matters?` and evidence.

Avoid language like `Failed` for ordinary deficits. Prefer `Still needed` / `Needs more capacity`.

---

## 10. Tests
Screen title plus introductory line.

### Due now
Large white cards with icon, test title, estimated effort/time where known, and `Start`.

### Coming later
Muted locked cards labeled `Not needed yet`.

No intimidating test battery shown all at once.

---

## 11. Guided Baseline / Test Wizard
Dark header with progress indicator.
White/off-white content.

Each test step includes:
- test name
- 1–3 concise instructions
- illustration/video action where appropriate
- clear input/control
- `Back` and primary `Continue`

Autosave quietly.

Heel-rise test should offer:
- short setup demo
- reps input
- optional height/work measurement pathway
- side selection
- pain/quality/termination reason

---

## 12. Test Result
Hero-style white result card.

Show only:
- result summary
- trend/status (`Improving`, `Stable`, `Needs attention`)
- plain-language implication
- next action

Detailed measurements are under `See details`.

---

## 13. Basketball Return
Athletic/premium visual treatment may be slightly richer than utility screens.

Stages:
- Stationary skills
- Controlled movement
- Planned basketball movement
- Reactive basketball
- Half-court play
- Full-court play
- Unrestricted candidate

Each stage uses same completed/current/locked language.

Optional small athlete thumbnail/background accent is acceptable, but keep text/cards readable.

---

## 14. Soccer
Hidden until unlocked or enabled.
Same component system; no new visual language.

Stages:
- Ball touches / passing
- Receiving / dribbling
- Shooting
- Movement with ball
- Controlled direction changes
- Recreational practice/play

---

## 15. More
Simple grouped settings list:
- Exercise Library
- Evidence & Research
- Equipment
- Profile
- Basketball goal
- Soccer goal
- Export / Restore
- Settings
- About / Medical disclaimer

No dashboard styling needed.

---

## 16. Exercise Library / Detail
Library: searchable simple list/cards.
Detail:
- exercise title
- `Short Demo`
- purpose / Why this?
- prescription guidance
- coaching cues
- progression/regression
- evidence (collapsed)

Demo action should be visually obvious and exercise-specific.

---

## Responsive behavior
### Phone
Primary target: 360–430px width.

### Tablet
Center the app content; max 720px except calendar/plan may use additional width.

### Desktop
Do not stretch phone-style forms edge-to-edge. Use centered app shell. Marketing/onboarding may be full-width.

## Visual acceptance standard
Before a screen is considered complete, compare it side-by-side with the hero reference. It should share:
- dark navy shell/header
- off-white content background
- white rounded cards
- cobalt blue interactions
- green readiness/completion
- spacious typography
- subtle shadows/borders
- clean five-item bottom navigation
