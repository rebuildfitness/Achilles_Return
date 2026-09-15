# Workout experience changed files

Compared with Achilles_Return-workout-swaps-complete.zip: 33 new or changed files, including verification output and previews.

| File | Purpose |
| --- | --- |
| `README.md` | Point to the latest release instructions. |
| `artifacts/browser-qa-results.json` | Verification results and production asset audit. |
| `artifacts/coaching-review.png` | Regenerated mobile preview using disposable test data. |
| `artifacts/companion-measurements.png` | Regenerated mobile preview using disposable test data. |
| `artifacts/companion-today.png` | Regenerated mobile preview using disposable test data. |
| `artifacts/experience-tests.txt` | Verification results and production asset audit. |
| `artifacts/illustration-audit-results.json` | Verification results and production asset audit. |
| `artifacts/workout-duration.png` | Regenerated mobile preview using disposable test data. |
| `artifacts/workout-feedback.png` | Regenerated mobile preview using disposable test data. |
| `artifacts/workout-illustration.png` | Regenerated mobile preview using disposable test data. |
| `artifacts/workout-swap.png` | Regenerated mobile preview using disposable test data. |
| `artifacts/workout-thumbnail.png` | Regenerated mobile preview using disposable test data. |
| `docs/FULL_BODY_STRENGTH_UPDATE.md` | Append user-approved naming clarification while retaining the original programming specification. |
| `docs/WORKOUT_EXPERIENCE_CHANGED_FILES.md` | Release instructions and inventory. |
| `docs/WORKOUT_EXPERIENCE_UPDATE.md` | Release instructions and inventory. |
| `scripts/browser-qa.mjs` | Expanded timer, carried-feedback, persistence, history and export browser verification. |
| `src/App.tsx` | Persist bulk feedback; capture duration, original prescription and coaching context on finish; show saved-session report. |
| `src/components/CoachingReview.tsx` | Preview, copy, Markdown download and optional native share with no automatic external transmission. |
| `src/components/TrainingOverview.tsx` | Add duration and regenerating coaching reports to Progress history. |
| `src/components/WorkoutTimer.tsx` | Timestamp-based persistent timer with start/pause/resume and error handling. |
| `src/components/ui.tsx` | Display copied-feedback status and accessible quality/symptom controls. |
| `src/data/coachingReport.js` | Build the provider-independent coaching report from saved context, prescriptions and actual history. |
| `src/data/evidence.js` | Align explanatory wording with the hybrid-program name. |
| `src/data/workoutExperience.js` | Pure timer transitions and carried-feedback provenance/confirmation helpers. |
| `src/persistence/repository.ts` | Save stopped timer and finished session in the same IndexedDB transaction. |
| `src/rules/planner.js` | Rename hybrid style and workout titles without changing doses. |
| `src/rules/progression.js` | Exclude unconfirmed copied feedback from positive progression evidence; preserve existing thresholds. |
| `src/screens/History.tsx` | Show duration and feedback provenance in calendar history. |
| `src/screens/MoreScreen.tsx` | Clarify hybrid-program naming and scope. |
| `src/screens/Workout.tsx` | Expose timer and first-set feedback shortcuts alongside the existing workout flow. |
| `src/styles.css` | Shared-token layout for timer and coaching review. |
| `src/types.ts` | Optional timer, coaching-context and feedback-provenance fields; old records remain compatible. |
| `tests/workout-experience.test.mjs` | Six focused rule, timer, feedback and report tests. |
