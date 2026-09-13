# Movement & Recovery — app 1.2.0

## Delivery

This release implements the functional Phase 1 of the approved v3 handoff. The copied handoff is `MOVEMENT_RECOVERY_HANDOFF_V3.md`; the implementation corrections below take precedence over its conflicting examples.

- Today keeps readiness, required responses, the prescribed session and milestone in their established order. Compact Movement Support follows the milestone.
- Movement & Recovery separates Walk, Cycle, Mobility, Core & Stability, Balance & Control, Recovery Practice and Other. Plan can open it for a selected past/current date.
- Walking retains 2,500 / 5,000 / 8,000 / 10,000 steps plus custom quantities. Cycling retains duration and distance and adds indoor/outdoor distinction. Distance accepts miles or km; reporting normalizes cycling distance to km.
- Nine versioned routines include exercise checklists, editable actual quantities, substitutions, skips, original definition snapshots, notes and written offline guidance. Checking a step confirms the shown dose; a distance range is retained as the confirmed shown dose until an exact distance is entered. Amounts are descriptive records, not progression evidence.
- Drafts autosave locally and survive offline reloads. They are excluded from totals. Saves commit atomically. Saved edits retain their ID, original creation time and prior values. Deletion is a retained tombstone. Undo is offered for 30 seconds and affects only its save; a subsequent change blocks stale Undo.
- Library categories and movement body-area, position and equipment filters are available. The All view retains the existing strength library and exposes the movement collection through its disclosure. Owned-equipment movements sort first.
- Progress retains Overview, Strength, Rehab and Sport and adds Movement. It shows weekly counts, walking steps, cycling time/distance, the most-used routine, consistency chart and editable activity history.

## Corrections and data behavior

1. Backups retain `schemaVersion: 2`, not the handoff example's `backupSchemaVersion`. The IndexedDB version remains 2. New activity records use `movementRecordSchemaVersion: 1` inside the settings store.
2. Cycling distance and mi/km support existed already. Outdoor cycling is the new distinction; it is factual/unplanned and not an automatic recommendation.
3. Undo reads the current record revisions. Totals are derived again after each mutation; linked response state is read from the current session. No stale clinical decision is restored.
4. Existing Today red-flag and next-morning prompts remain. Routine logging does not replace the workout or its response.
5. Mixed routines have one primary category. Routine snapshots preserve the ordered steps, doses, metadata, original definition and actual completion details.
6. Modification is independent of draft/saved and exercise completion. Changes to amounts, alternatives or skipped steps mark the routine modified.
7. Legacy recovery records are projected into stable canonical IDs without rewriting originals. New overrides and removal tombstones prevent duplication or resurrection. Legacy mobility exercise IDs remain attached, without inventing historical quantities or routine versions.
8. A linked session is a reference only. Movement never writes session completion or clinical stores. The current clinical engines do not consume these new support quantities; consequently no additional clinical decision needs recomputation. Existing prescribed workouts and Sport exposures remain the authoritative evidence paths.

## Assumptions and remaining phases

This follows v3's phased rollout: Phase 2 impact/demand filters, expanded taxonomy and advanced reporting, and Phase 3 supported embedding/formal measurement integration are not part of this release. No new clearance rule, capacity threshold or rehabilitation prescription is introduced. Factual unplanned records remain possible under a hold, while routine recommendations respect existing restrictions and selected equipment.

Media coverage: 17 of 34 movement entries have an exercise-specific external reference; the remaining entries explicitly show demo verification pending and written instructions. No in-app playback is claimed. Every movement has written guidance bundled for offline use. The per-entry status and source URL are recorded in `src/data/movementMedia.json`; some provider pages may require internet or their own access. The existing prescribed exercise demo catalog is unchanged.

Local storage remains specific to this browser and origin. The release does not move local-preview records into the hosted origin and introduces no cloud sync.

## Verification

Final verification: 81 Node tests passed, 23 isolated browser checks passed, zero failures. TypeScript and the production build passed. Mobile screenshots were inspected after correcting nested form styles and the narrow Progress switch. Browser results are recorded in `artifacts/browser-qa-results.json`. Test commands: `pnpm test`, `pnpm build`, `pnpm test:browser`. Browser tests use a disposable Edge profile and do not alter the user's records.

## Upload and preview

Extract `Achilles_Return-Movement-Recovery.zip` and upload its contents to the repository root, preserving folders including `.github/workflows`, `src`, `public`, `scripts`, `docs` and `spec`. Upload the extracted files, not just the ZIP. The existing GitHub workflow tests/builds and deploys `dist`.

After a successful GitHub deployment, use Update & reload if offered and check More → About & install → App 1.2.0. Do not clear site data to refresh. This package has been verified locally; it has not been deployed by the agent.

For local preview, run `pnpm install --frozen-lockfile`, `pnpm build`, then `pnpm preview`. Open the URL Vite prints. Start at Today → Movement support → View all. Screenshots: `artifacts/movement-summary.png`, `artifacts/movement-routine.png`, `artifacts/movement-progress.png`.

No further approval is required for this implementation. Uploading remains through the user's existing GitHub workflow.

## Files changed from the coherent rebuild package

- Updated: README.md
- Added: docs/MOVEMENT_RECOVERY_HANDOFF_V3.md
- Updated: package.json
- Updated: scripts/browser-qa.mjs
- Updated: src/App.tsx
- Updated: src/components/ExerciseLibrary.tsx
- Added: src/components/MovementDemo.tsx
- Added: src/components/MovementLibrary.tsx
- Added: src/components/MovementProgress.tsx
- Updated: src/components/TrainingOverview.tsx
- Added: src/data/movement.js
- Added: src/data/movementMedia.json
- Added: src/data/movementRoutines.js
- Added: src/data/movementRoutines.json
- Added: src/persistence/movement.js
- Updated: src/persistence/schema.js
- Updated: src/screens/MoreScreen.tsx
- Added: src/screens/Movement.tsx
- Updated: src/screens/PlanScreen.tsx
- Updated: src/screens/ProgressScreen.tsx
- Updated: src/screens/Today.tsx
- Updated: src/styles.css
- Added: tests/movement.test.mjs
- Added: docs/MOVEMENT_RECOVERY_RELEASE.md
