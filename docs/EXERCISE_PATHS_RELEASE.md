# Exercise progression paths — app 1.5.0

## What is implemented

All 21 current prescribed exercise IDs now have an explicit path classification: an equipment route, reviewed alternatives, or existing rehab rules. The paths are visible in each workout under **Exercise path**, and in expanded Plan days under **Exercise progression paths**.

Four equipment routes are connected to actual history:

| Route | Initial review trigger |
|---|---|
| Incline dumbbell press → Smith incline press → barbell bench press | 50 lb per dumbbell plus existing performance/tolerance requirements |
| Belt squat → Smith wide-stance squat → barbell back squat | User's 225 lb added-plate review milestone plus existing requirements |
| Seated Arnold press → Smith seated shoulder press | 50 lb per dumbbell plus existing requirements |
| Dumbbell Romanian deadlift → barbell Romanian deadlift | 50 lb per dumbbell plus existing requirements |

These are optional user/product equipment routes, not a clinical ranking of exercises. The Smith squat reference is specifically the existing wide-stance variant, not a newly invented generic squat record. No band-resistance conversion is included. Later Smith-to-barbell steps have no fabricated pound threshold: eligible performance supports a technique/setup review only.

## How it works

The engine checks the same variation's most recent prior session, matching prescribed sets/reps, recorded effort/quality/symptoms, next-morning tolerance, confirmed copied feedback, today's readiness, equipment and the existing demo metadata. All required sets must reach a defined load milestone; one heavy set is insufficient. Missing and zero loads do not meet weight milestones. Pending responses, modified readiness, mismatched prescriptions and re-entry holds prevent the next-step action. Future-dated sessions are not evidence.

When those checks pass, the workout displays a next-variation review. The athlete confirms technique, setup and safeties within current restrictions and agrees to establish a fresh load. **Use next variation for this and future sessions** then uses the existing reviewed-swap persistence flow. The app rechecks eligibility at save time, retains recorded sets under their original exercise, saves the future choice and records path version/source session/checks with the change event.

This release automatically evaluates the path; it does NOT silently switch equipment. Each transition needs the in-app setup confirmation. Existing weight-increase guidance and running/sport dose automation remain unchanged. No new exercise can become available simply because it appears in the research files.

Other strength movements show reviewed alternatives and easier options where already mapped. Rehab movements continue through their existing assessment/tolerance rules; this release does not turn calf, balance or sport readiness into equipment-weight gates. Paths do not force exercise changes when the current variation remains useful.

## Scope and evidence

Clinical ruleset remains 1.1.0; database version remains 2. No completed history or existing source metadata is rewritten. The 24 research candidates and pending sled/treadmill references are not activated. Existing demo verification metadata is reused; this release does not claim new video playback verification.

ACSM's healthy-adult guidance supports individualized resistance training, not mandatory machine-to-barbell progression or postoperative clearance: https://acsm.org/resistance-training-guidelines-update-2026/

Exact paths and milestones above are transparent product/user preferences. They are not presented as validated clinical thresholds.

## Files changed

- spec/exercise-paths-v1.json — versioned path definitions for current prescribed movements.
- src/rules/exercisePaths.js — deterministic evidence and equipment checks.
- src/components/ExercisePath.tsx — route, unmet requirements, alternatives and confirmed next-step action.
- src/screens/Workout.tsx and src/screens/PlanScreen.tsx — path display.
- src/components/ExerciseGuidance.tsx — remove obsolete duplicated route copy.
- src/App.tsx — save-time path check and transition evidence in change events.
- src/types.ts — existing progressionAllowed field exposed to typed UI.
- package.json and src/persistence/schema.js — version 1.5.0 and browser test script.
- tests/exercise-paths.test.mjs and scripts/exercise-path-browser-qa.mjs — regression coverage.
- README.md and this release note.

## Preview / upload

Open a workout and expand Exercise path. The criteria explain what is missing. Plan offers a read-only overview; transitions are applied from the workout. A qualifying press example is saved in artifacts/exercise-path-review.png using disposable test data.

Copy the complete extracted upload package into the cloned repository, preserve .git, commit and push. Wait for GitHub Actions to pass, then use Update & reload and confirm app 1.5.0. Do not clear site data. This package is prepared locally, not deployed.

## Verification

137 unit/regression tests and 54 browser checks passed, zero failed. TypeScript and production build passed. Existing large-JavaScript-bundle warning remains non-blocking. Browser checks cover the threshold review, confirmation, persistent future selection, unchanged source session, audit metadata and no repeated advancement on reload, plus the existing application, workflow, progression and equipment suites.
