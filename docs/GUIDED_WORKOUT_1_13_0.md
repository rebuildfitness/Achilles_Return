# Guided workout — 1.13.0

Open a workout, expand Session options and select **Guide me through each set**. The full-session view remains the default. Use **View full session** at any time to review or correct earlier sets.

The guide shows one exercise and one set, its existing illustration/demo, prescribed dose, previous logged set and load guidance. Rehab circuits rotate one set per exercise within each block, then begin the next round; unequal set counts are respected. Standard strength sessions finish one exercise's sets before moving on.

Marking the current set complete advances to the next uncompleted set and starts the existing prescribed rest timer. Typing, timers expiring or navigating never completes work. Review copied feedback before confirming it; completed exercises with unconfirmed carried feedback remain available for confirmation. Corrections are available in the full-session view.

**Swap exercise** retains the existing swaps and skip-remaining-sets controls. Skipped sets are not completion. Exercises with unavailable equipment remain visible so the user can resolve them rather than silently skipping them.

Guided mode saves with the dated workout settings. Position is derived from actual saved set logs, so reloads and offline launches resume at the first remaining set in the current prescribed order. Changing Essential/Full or swapping exercises recalculates that order without changing history. The running/sport logger appears after the guided exercise sets; it remains available in the full view.

## Scope
Navigation only: clinical criteria, exercise doses, progression, completed history and database schema versions are unchanged. No load is invented or copied automatically. The existing timers, local persistence and audit records remain in use.

## Changed files
- src/data/guidedWorkout.js — pure next-set and circuit-order helpers.
- src/screens/Workout.tsx — optional compact guided rendering and feedback review.
- src/App.tsx — persisted guided-mode choice.
- package.json; src/persistence/schema.js — app version and browser suite entry.
- tests/guided-workout.test.mjs; scripts/guided-workout-browser-qa.mjs — navigation, persistence, layout and offline checks.
- This release note and generated QA artifacts.

## Upload
Extract the cumulative package into the cloned repository, retain .git, commit and push through GitHub Desktop. This task packages the update; it does not deploy it.

## Verification
175 unit tests and 75 browser checks passed, zero failed. TypeScript, production build and service-worker generation passed. Final compact guided layout was rechecked at 320, 390 and 1280 pixels and offline. The existing large-bundle warning remains non-blocking.
