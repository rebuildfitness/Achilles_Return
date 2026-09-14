# Files changed for the workout-swap update

Compared with Achilles_Return-workout-illustrations-complete.zip. 33 new or changed files, including regenerated previews and audit records.

| File | Purpose |
| --- | --- |
| `artifacts/browser-qa-results.json` | Verification results or illustration provenance/review metadata. |
| `artifacts/companion-measurements.png` | Regenerated browser preview using disposable test data. |
| `artifacts/companion-today.png` | Regenerated browser preview using disposable test data. |
| `artifacts/illustration-audit-results.json` | Verification results or illustration provenance/review metadata. |
| `artifacts/illustration-large-text.png` | Regenerated browser preview using disposable test data. |
| `artifacts/illustration-reviews.json` | Verification results or illustration provenance/review metadata. |
| `artifacts/swap-tests.txt` | Verification results or illustration provenance/review metadata. |
| `artifacts/workout-illustration.png` | Regenerated browser preview using disposable test data. |
| `artifacts/workout-swap.png` | Regenerated browser preview using disposable test data. |
| `artifacts/workout-thumbnail.png` | Regenerated browser preview using disposable test data. |
| `docs/TRAINING_COMPANION_CHANGED_FILES.md` | Release explanation, upload instructions or changed-file inventory. |
| `docs/TRAINING_COMPANION_UPDATE.md` | Release explanation, upload instructions or changed-file inventory. |
| `docs/WORKOUT_SWAP_CHANGED_FILES.md` | Release explanation, upload instructions or changed-file inventory. |
| `docs/WORKOUT_SWAP_UPDATE.md` | Release explanation, upload instructions or changed-file inventory. |
| `public/assets/exercises/manifests/exercise-illustration-inventory.csv` | Regenerated illustration inventory including the new lat pulldown. |
| `public/assets/exercises/manifests/exercise-illustrations.json` | Regenerated illustration inventory including the new lat pulldown. |
| `public/assets/exercises/manifests/unresolved-exercise-assets.md` | Regenerated illustration inventory including the new lat pulldown. |
| `public/assets/exercises/strength-library/library-lat-pulldown.png` | Lat-pulldown illustration or mobile thumbnail. |
| `public/assets/exercises/thumbnails/library-lat-pulldown.png` | Lat-pulldown illustration or mobile thumbnail. |
| `scripts/browser-qa.mjs` | Test swaps, saved histories, unavailable equipment, remaining slots and future preferences. |
| `src/App.tsx` | Load dated choices, persist swaps atomically, optionally save future preferences, preserve both exercise histories when finishing. |
| `src/components/ExerciseGuidance.tsx` | Remove the former hidden swap control; retain starting-load and cadence guidance. |
| `src/components/ExerciseSwap.tsx` | Reusable swap/skip control, reason and scope selectors, temporary equipment availability and inline errors. |
| `src/components/TrainingOverview.tsx` | Display saved exercise-change events in training history. |
| `src/components/ui.tsx` | Lock completion toggles while correcting historical entries. |
| `src/data/exerciseLibrary.js` | Add lat pulldown setup, provider demo and source metadata. |
| `src/rules/planner.js` | Honor the effective date of future preferences. |
| `src/rules/sessionChanges.js` | Pure dated session projection, retained entries, remaining slots and history snapshots. |
| `src/rules/trainingFlexibility.js` | Reviewed option families, difficulty regressions, equipment and readiness guards. |
| `src/screens/Workout.tsx` | Show swaps on every active card, preserve old entries, handle skips and remaining-set progress. |
| `src/styles.css` | Mobile swap controls using the existing design tokens. |
| `src/types.ts` | Types for equipment, skip reasons, retained items and saved changes. |
| `tests/session-changes.test.mjs` | Seven focused tests for swap rules, persistence projections, history preservation and safety. |
