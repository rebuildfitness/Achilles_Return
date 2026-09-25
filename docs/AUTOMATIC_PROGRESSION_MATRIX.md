# Automatic plan progression — app 1.4.0

## What now changes automatically

After a saved assessment, capacity review, next-morning response, corrected session, schedule or readiness change, the plan is recalculated from the actual stored evidence. Eligible running, jumping, speed, cutting and sport doses appear on Today and the weekly Plan. No manual level-advance button or rebuild-plan step is required. Opening the prescribed item uses the existing exposure logger and save-time eligibility checks.

Strength exercises that satisfy the existing double-progression rule receive a next-working-load prescription directly above the logging rows and in Plan. The instruction is the smallest practical increment above the recorded load; the app does not know the exact increments of every dumbbell, plate and cable stack and therefore does not invent a numerical increment. Sets, rep range and target effort stay unchanged. The athlete records the actual load used; no performed work is prefilled. Missing, mixed or zero loads, bodyweight/band prescriptions, mismatched prior prescriptions, modified sessions and unconfirmed copied feedback cannot establish an automatic numeric load basis. Equipment limits prompt variation review; they never trigger a pound-for-pound machine conversion.

Existing assessment-driven calf selection remains in place. The 24 proposed reference additions and canonical-library consolidation are separate content work and are not included in this progression release.

## Matrix and authority

`spec/progression-matrix-v1.json` describes the existing rules by domain, their automatic adjustments, sources and limitations. It is bundled into the app and referenced by the planning engine. The executable clinical entry and level criteria remain in `src/rules/progression.js`; they are not duplicated as competing thresholds in the UI. Matrix version 1.0.0 is independent of the retained clinical ruleset 1.1.0.

| Domain | Existing evidence required | Automatic result |
|---|---|---|
| Strength | Prescribed sets at upper rep target, recorded suitable RPE, quality, symptoms, confirmed feedback and next-morning tolerance | Next-load instruction for the same variation; retain sets/reps |
| Running | Seven entry criteria, clearance/restrictions, two qualified tolerated current-level exposures | R1 entry or one next approved R level |
| Jumping | Documented calf and low-elastic capacity; unilateral/reactive reviews at applicable levels | Eligible J dose; retain contact-doubling safeguard |
| Speed | Tolerated running/plyometrics and late-stage review; high-speed criteria before S5 | Eligible S dose |
| Deceleration/COD | Running tolerance, braking review, then planned and reactive prerequisites | Eligible D dose |
| Basketball | Stationary skills review, later running/jumping/COD/speed prerequisites and multi-domain review | Eligible B dose, retaining individual-dose and court-cap requirements |
| Soccer | Explicit enabled track, access, running tolerance and relevant COD capacity | Eligible SC dose, kept distinct from basketball |

All clinical thresholds above are the existing implementation, not new clinical recommendations introduced by this release.

## Scheduling assumptions

- Preserve strength A/B/C and recovery days. Place at most one exposure on a loading day and at most two in a calendar week, retaining a recovery day between exposures.
- Within eligible domains, schedule the least recently performed domain first. Ties use running, jumping, COD, speed, basketball, then optional soccer. This is a transparent product scheduling choice, not a research-validated clinical priority.
- A future slot is a reservation, never completed/tolerated evidence. It cannot unlock another level. Future doses remain conditional on the day's check-in and required responses.
- Pending Achilles-session responses block automatic exposure placement and strength increases. Modified readiness prevents automatic advancement. Existing poor-response regression rules still apply.
- Individualized doses, reduced re-entry prescriptions and missing demos are surfaced for review instead of being invented. These reviews remain visible in the expanded Plan day.
- Current history and original prescriptions are never rewritten. Exercise swaps do not inherit another variation's progression target. Historical corrections recompute future decisions.
- Future-week browsing uses the actual current date for missed-session/re-entry calculations.

## Research audit — 2026-09-16

[Gaspar et al. 2026](https://pubmed.ncbi.nlm.nih.gov/42503592/): verified the seven return-to-running criteria and the authors' warning that prospective validation is still required. These remain the app's approved consensus gate, not a validated automatic clearance test.

[Marrone et al. 2024](https://ijspt.scholasticahq.com/article/122643-rehabilitation-and-return-to-sports-after-achilles-tendon-repair): reviewed the publisher's clinical commentary supporting progressive loading and criterion-based rehabilitation, with surgeon-specific constraints. It does not validate this app's exact ladders or scheduling algorithm.

[ACSM 2026](https://acsm.org/resistance-training-guidelines-update-2026/): general resistance-training guidance is supporting context, not an Achilles-specific clearance rule. Existing rep/effort/tolerance logic is retained rather than replacing it with healthy-adult percentage-of-1RM targets.

[Busà et al. 2026](https://pubmed.ncbi.nlm.nih.gov/41703942/) remains a source already recorded in the frozen master plan. Full source content could not be retrieved in this audit; no new threshold or claim is derived from it.

Exact exposure counts, dose ladders, contact-doubling holds and weekly spacing are explicitly product safeguards. No universal 90% symmetry clearance, date-since-surgery unlock or new maximal-testing requirement has been added.

## Storage and explanation

The next plan is a pure projection of current local evidence, so it updates without rewriting a stale saved program. Content-addressed `AUTOMATIC_PLAN` records in the existing decisions store preserve dated prescriptions, source session IDs/revisions/statuses, assessment ID, checkpoints, readiness and matrix version. Repeated identical renders/reloads do not create duplicate audit records. Existing backup/restore includes these records. No database migration or external service is introduced.

## Changed application files

- spec/progression-matrix-v1.json
- src/rules/automaticPlan.js
- src/rules/planner.js
- src/rules/trainingFlexibility.js
- src/persistence/automaticPlan.js
- src/persistence/schema.js
- src/components/PlannedExposure.tsx
- src/App.tsx
- src/types.ts
- src/screens/Today.tsx
- src/screens/PlanScreen.tsx
- src/screens/Workout.tsx
- tests/automatic-plan.test.mjs
- scripts/automatic-plan-browser-qa.mjs
- package.json
- README.md
- docs/AUTOMATIC_PROGRESSION_MATRIX.md

## Upload and preview

Use the cumulative automatic-progression ZIP. Copy its extracted contents into the existing cloned repository, preserve `.git`, commit and push through GitHub Desktop. Wait for GitHub Actions to pass and use Update & reload. Verify App 1.4.0 in More. Do not clear site data.

Preview: Today and Plan show the automatically selected exposure when eligible. After recording the required second tolerated R1 response, R2 appears without a manual progression step. Qualifying strength targets appear above set logging. Screenshots use disposable test data, not personal history.

This package is prepared locally; it has not been uploaded or deployed. No additional approval is needed for the implemented behavior. Unspecified clinical thresholds and equipment transitions remain review-dependent rather than silently invented.

## Validation — September 16, 2026

- 127 unit/regression tests passed; 0 failed.
- 47 browser checks passed: 37 application, 5 workflow, 5 automatic-plan checks; 0 failed.
- TypeScript check and production build passed. Existing large JavaScript chunk warning remains non-blocking.
- Verified response-save advancement, readiness holds, future previews without fabricated evidence, offline reload and local audit persistence.
- Additional changed rule file: src/rules/progression.js. Scheduling accepts a separate evidence date so future previews do not count future days as missed training; present-day clinical thresholds are unchanged.
- Screenshots: artifacts/automatic-plan-today.png and artifacts/automatic-plan-week.png.
