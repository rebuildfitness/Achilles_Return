# Visual Direction Addendum — Approved Hero Reference

The production UI must follow `docs/DESIGN_SYSTEM.md`, `docs/VISUAL_SCREEN_SPEC.md`, and the approved visual reference at `assets/design/achilles-return-hero-reference.png`. These files supersede any vague styling language below. The approved direction is dark navy shell/header, off-white app background, white rounded cards, cobalt blue interaction, green readiness/completion, subtle shadows, generous spacing, and clean athletic/iOS-like typography.

The product logic remains unchanged: do not reproduce any fake time-driven labels from the hero (for example, postoperative week numbers) when they conflict with capability-based progression.

---

# Mobile UI/UX Specification v1.0

## Principle
Keep the clinical logic deep and the daily interface shallow. The user should always know:
1. What should I do today?
2. How do I do it?
3. How am I progressing?
4. What is next?

## Bottom navigation
- Today
- Plan
- Progress
- Tests
- More

## Today
Before readiness:
- current focus
- `Check In` button
- next milestone

After readiness:
- Ready / Modified / Stop status
- full day's workout preview
- `Open Full Workout`
- next milestone

## Morning check-in
20–30 seconds, large tap targets.
- pain: none / mild / moderate / significant
- stiffness vs normal: normal / little more / much more
- swelling vs normal: no / little / a lot
- prior-session response: good / little sore / poor
- overall recovery: good / okay / poor
- unusual symptoms checklist

No visible composite score.

## Full workout — Strong-style
Display the entire session on one scrollable page.
Each exercise card contains:
- exercise name
- sets × reps/time/distance
- target RPE
- rest
- previous successful load
- current target load
- per-set inline fields: weight, reps, complete
- one coaching cue
- visible `Short Demo`
- info button for purpose/evidence/progression

Do not force one-exercise-at-a-time navigation.

## Workout finish
Three quick fields:
- overall difficulty: easy / right / hard / too hard
- Achilles response: good / mild symptoms / worse than expected
- optional notes/voice note

Then status becomes `Waiting for tomorrow's response`.

## Plan
Top: full current week Monday–Sunday.
- each day shows session type or recovery/rest
- expand any future workout to view full planned exercise list
- provisional plan label until baseline is complete

Bottom: monthly workout calendar.
- completed dates visually marked
- tap a date to review actual workout, set logs, difficulty, immediate response, next-day status
- navigate months

## Progress
Simple stage ladder:
- Strength
- Running Readiness
- Running
- Jumping
- Plyometrics
- Speed
- Change of Direction
- Basketball

Show current stage, completed stages, next milestone.
`See requirements` reveals entry/exit criteria.
`Detailed metrics` reveals heel-rise LSI, strength, ATRS, confidence, etc.

## Tests
Only show currently relevant tests as active.
Future tests: visible but locked and labeled `Not needed yet`.

Baseline test wizard:
- Safety & symptoms
- Mobility
- Balance
- Heel raises
- Loaded calf/soleus
- General strength
- Conditioning
- Confidence / sport profile
- Results

Autosave each section.

## More
- workout history
- exercise library
- evidence/research
- equipment
- profile
- basketball goal
- soccer goal
- export/restore data
- settings
- about/disclaimer

## Evidence display
Normal workout card: no citation clutter.
Info panel:
- Why this?
- Evidence strength
- Evidence type
- View sources

## Accessibility
- high contrast
- no color-only meaning
- large tap targets
- readable font size
- captions on videos when available
- works with increased text size
- one-thumb primary controls

## PWA behavior
- app opens to Today after setup
- offline: check-in, plans, logging, progress, tests remain usable
- demos show `Video requires internet` if offline
