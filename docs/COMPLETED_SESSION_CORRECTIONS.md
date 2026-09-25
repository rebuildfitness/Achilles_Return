# Completed-session corrections and coaching context

## Use
After deploying this package, open Progress > Overview, find the saved workout, and choose Edit session. The same editor is available in Plan > Calendar > a saved workout.
Expand an exercise to correct weight, reps, completion, RPE, quality or symptoms. Session notes can clarify per-hand loads, equipment setup or symptom location. Add a short correction reason and save. Cancel discards the draft. Unknown values can remain blank; do not invent missing data.

Charts, session summaries and regenerated AI coaching reports use the corrected record. Previously downloaded/shared reports do not change: export and share a fresh report.

## Record integrity
Each save retains the original session fields, timestamp and correction reason in correctionHistory within the same IndexedDB record. Subsequent corrections append versions without duplicating previous revision histories inside each snapshot. Backup/restore includes these revisions. A single read/write transaction rejects stale edits, including when another tab has saved a newer next-morning response.
Session identity, original prescription, date, timer and next-morning response/status are preserved. This editor does not revise clinical clearance, next-morning questionnaires or sport exposure minutes. Set corrections feed existing strength summaries/rules without changing thresholds. The first-set feedback provenance rules remain in effect.

## AI coaching export
New strength sessions capture the weekly plan at completion, labelled as planned rather than performed work. Reports also include recorded workouts and movement/recovery in the seven calendar days ending on the reviewed session date, using the current corrected records. Older sessions explicitly state that their original weekly plan was not captured; the app does not recreate historical plans from today's settings. Missing activity and missing measurements are unknown, not zero. Movement history that cannot load is labelled unavailable.
No AI account, automatic upload or automatic plan changes have been added. Copy, download or share the freshly generated report manually.

## Upload
This is a cumulative source package. Extract it and copy its contents into the existing cloned GitHub repository, preserving folders and the repository's .git directory. Commit and push with GitHub Desktop. Wait for Test and deploy GitHub Pages to pass, then use Update & reload in the app if offered.

## Changed application files
- src/components/SessionEditor.tsx: reusable saved-session editor and refresh context.
- src/data/sessionCorrections.js: validation, revision snapshots and atomic conflict protection.
- src/App.tsx: shared data refresh and weekly plan capture.
- src/types.ts: optional revision metadata.
- src/screens/History.tsx: calendar editor access.
- src/components/CoachingReview.tsx: history editor access and recorded movement context.
- src/data/coachingReport.js: weekly planned/actual context and correction reasons.
- tests/session-corrections.test.mjs: revision, validation, transaction and export checks.
- scripts/browser-qa.mjs: mobile editing, cancel, reload, report and original-record checks.

Validation results are included in artifacts/session-corrections-tests.txt and artifacts/browser-qa-results.json.

Verified: 111 unit/rule tests and 35 browser checks passed; zero failures. TypeScript and production build passed. Vite retains the existing non-blocking bundle-size advisory.
