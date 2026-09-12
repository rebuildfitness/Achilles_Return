# Achilles Return to Basketball App — Codex Engineering Contract

## Planning status
Clinical/product planning is frozen at **Master Plan v1.0** for implementation. The source of truth is under `docs/` plus `spec/rehab-plan-v1.json`.

Read before coding:
1. `docs/MASTER_PLAN.md`
2. `docs/BASELINE_ASSESSMENT.md`
3. `docs/WORKOUT_TEMPLATES.md`
4. `docs/EXERCISE_LIBRARY.md`
5. `docs/VIDEO_CATALOG.md`
6. `docs/DESIGN_SYSTEM.md`
7. `docs/VISUAL_SCREEN_SPEC.md`
8. `docs/UI_UX_SPEC.md`
9. `docs/DATA_AND_RULES.md`
10. `docs/TEST_PLAN.md`
11. `docs/CODEX_BUILD_ORDER.md`
12. `spec/rehab-plan-v1.json`
13. `spec/design-tokens-v1.json`


## Frozen visual direction
The approved hero image at `assets/design/achilles-return-hero-reference.png` is the visual source of truth for production UI. Read `docs/DESIGN_SYSTEM.md`, `docs/VISUAL_SCREEN_SPEC.md`, and `spec/design-tokens-v1.json` before implementing screens.

Non-negotiable visual rules:
- Reproduce the visual language of the phone mockups in the approved hero: dark navy header/shell, off-white background, white rounded cards, cobalt blue actions, green ready/completed states, subtle borders/shadows, generous spacing, clean athletic typography.
- Bottom navigation remains `Today | Plan | Progress | Tests | More`.
- Build reusable design-system components. Do not independently restyle each page.
- Utility screens must remain clean and functional; do not put large athlete photography behind workout logging, assessments, or safety screens.
- Do not copy time-driven/fake data from the hero when it conflicts with the evidence-based capability model. Use labels such as `Running Readiness`, `Run Level R2`, or criteria counts instead.
- Treat a screen that does not visually feel like it belongs inside the approved hero phone mockups as a design regression.

## Product goal
Build a mobile-first, local-first PWA for post-surgical Achilles rupture rehabilitation and progressive return to basketball. Soccer is secondary and unlocks only after sufficient running/multidirectional capacity.

## Non-negotiable clinical/product rules
- Progression is criteria-based, not time-since-surgery alone.
- The rule engine must be explicit, deterministic, auditable, versioned, and separate from UI.
- Do not use an LLM to invent daily workouts.
- Red flags override all other readiness data.
- A workout is not considered tolerated until the next-morning response is recorded.
- Separate minimum entry criteria from training targets and late-stage RTS targets.
- Do not treat 90% limb symmetry as a universally validated clearance rule.
- Preserve evidence/source metadata for rules and exercises.
- Do not modify clinical criteria without product/clinical approval.

## User profile used by this app
- Male, 47
- Surgically repaired Achilles rupture
- Surgery date: 2026-01-07
- PT ended 2026-06
- Primary goal: basketball
- Secondary: sprinting, serious strength training, athletic performance, beginner soccer

## Owned-equipment whitelist
Only generate home-gym exercises using:
- Smith machine
- Adjustable bench
- Cable station
- Belt squat
- Trap/hex bar
- Dumbbells
- Pull-up bar
- Dip bars
- Exercise bike
- Incline treadmill
- Slant board
- Balance pad
- Rehab bands
- Weighted wagon / sled substitute
- 45 lb Olympic barbell
- Free-weight plates
- BOSU ball
- Inflatable balance cushion (Trideer; previously called dyno pad)
- Stability/yoga ball (Trideer; previously called plyo ball)
- Vibration plate (AXV)

User-approved full-body strength extension: see `docs/FULL_BODY_STRENGTH_UPDATE.md`.
Equipment ownership does not itself unlock balance, impact or sport progressions.

Never add a standalone leg press or other equipment without explicit user update.

## UX contract
- Mobile-first.
- Full day's workout visible at a glance, Strong-style.
- Inline per-set weight/reps/completion logging.
- Visible `Short Demo` on every active exercise card.
- No active exercise may use a long general rehab lecture as its demo.
- Plan tab: full week + expandable future workouts + monthly completed-workout calendar.
- Daily flow: Check-in -> full workout -> log -> finish -> next-morning response.
- Advanced evidence/metrics use progressive disclosure.

## Technical direction
Current prototype is dependency-free HTML/CSS/JS with IndexedDB and node:test. Production target:
- React + TypeScript + Vite
- IndexedDB/local-first
- PWA/offline
- GitHub Pages
- no backend/auth/cloud sync in V1

## Testing contract
All relevant tests in `docs/TEST_PLAN.md` must be implemented over time. Never merge when existing clinical rule tests fail.

## Current implementation milestone
Follow `docs/CODEX_BUILD_ORDER.md` beginning with React/TypeScript/Vite migration and the interactive Baseline Assessment.
