# Codex Build Order — after planning freeze

## Source of truth
Read in this order:
1. `AGENTS.md`
2. `docs/MASTER_PLAN.md`
3. `docs/BASELINE_ASSESSMENT.md`
4. `docs/WORKOUT_TEMPLATES.md`
5. `docs/EXERCISE_LIBRARY.md`
6. `docs/DESIGN_SYSTEM.md`
7. `docs/VISUAL_SCREEN_SPEC.md`
8. `docs/UI_UX_SPEC.md`
9. `docs/DATA_AND_RULES.md`
10. `docs/TEST_PLAN.md`
11. `docs/VIDEO_CATALOG.md`
12. `spec/design-tokens-v1.json`

Do not invent new clinical criteria. If a requirement is ambiguous, preserve existing conservative behavior and leave a clearly documented TODO for product/clinical review.


## Sprint A0 — design system foundation
Before feature migration, implement the frozen visual system from `docs/DESIGN_SYSTEM.md`, `docs/VISUAL_SCREEN_SPEC.md`, `spec/design-tokens-v1.json`, and `assets/design/achilles-return-hero-reference.png`.
- create reusable AppShell, AppHeader, BottomNav, Card, StatusCard, PrimaryButton, ProgressStage, CalendarCard, ExerciseCard, SetRow, TestCard components
- establish CSS variables/tokens exactly from `spec/design-tokens-v1.json`
- implement the high-fidelity `Today` screen first
- compare Today side-by-side with the central phone in the approved hero
- obtain product approval on the visual system before mass-producing the remaining screens
- preserve capability-based labels; do not copy fake week-based progression from the hero

## Sprint A — production foundation
- migrate prototype to React + TypeScript + Vite
- preserve IndexedDB/local-first behavior
- preserve PWA/GitHub Pages support
- create rule modules separate from UI
- port all existing tests first
- create schema/version migration framework

## Sprint B — interactive baseline
- implement baseline wizard
- autosave each section
- implement heel-rise calculations
- implement starting-phase algorithm
- show simple results screen
- add tests 30–36 from test plan

## Sprint C — plan generator
- implement capability-aware weekly plan creation
- home-equipment whitelist hard guard
- Strength A/B/C templates
- yellow-day modifications
- Strength progression engine
- weekly Plan + calendar using generated schedule

## Sprint D — running/jump modules
- seven return-to-running consensus gate
- run ladder R1–R9
- jump ladder J0–J5
- next-day progression/regression
- metrics/history

## Sprint E — speed/COD
- sprint ladder S1–S6
- deceleration/COD D1–D7
- high-risk gates
- clinician-review prompts

## Sprint F — basketball/soccer
- B1–B8 court progression
- court minutes/intensity logging
- soccer SC1–SC6 optional pathway
- full basketball candidate screen

## Sprint G — polish / QA
- verify all short demos
- evidence detail screens
- accessibility
- backup/restore
- offline tests
- mobile QA
- GitHub Pages deployment

## Definition of done
- all tests pass
- no unowned equipment appears
- no active exercise lacks an acceptable short demo
- no AI-generated rehab plan logic
- all progression decisions are explainable by rule ID
- baseline must be completed before personalized plan is considered active
