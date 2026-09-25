# V2 Final Validation Report

Review candidate: 24 September 2026. Application 1.13.0; IndexedDB schema 3. **Not deployed.**

## 1. Executive summary

The normal application now opens into the user-owned V2 experience. Today, Train, Plan, Progress, Calendar, History, educational Rehab Guide, assessments and Settings share the established visual system. V2 training does not require V1 readiness permission. Research, source metadata, legacy history and compatibility readers remain intact.

Implementation root: `artifacts/illustration-checkout/`. The outer source tree is not the release source. This report covers the final-phase changes over the approved Phase 6 baseline, not all uncommitted changes accumulated since the repository's last commit.

Illustration release patch: the existing shared illustration system now renders compact, expandable references in the V2 Exercise Picker, Workout Builder, active workout and Rehab Guide wherever an exact mapping exists. No artwork, exercise IDs or mappings were changed. Validation results below include this narrow patch. No production personal records were used for tests. No deployment or push was performed.

## 2. Final architecture

`src/main.tsx` loads `FinalApp`; the old `App` is lazy-loaded only for explicit `?legacy=1` compatibility access. Final screens reuse Phase 2 repositories, Phase 3 composition, Phase 4 execution, Phase 5 guidance and Phase 6 planning/history. No database upgrade was introduced.

Added files:

- `src/FinalApp.tsx`, `src/FinalApp.css`
- `src/screens/ProgressV2.tsx`, `RehabGuide.tsx`, `SettingsV2.tsx`, `AssessmentsV2.tsx`
- `src/domain/v2/progress.js`, `rehabGuide.js`
- `scripts/legacy-ui-qa.mjs`, `scripts/v2-final-browser-qa.mjs`
- `tests/v2-final.test.mjs`, `tests/v2-final-backup.test.mjs`
- `tests/fixtures/v2/final-approved-deltas.json`
- this report and generated `artifacts/v2-final/` evidence.
- `docs/V2_FINAL_EXPERIENCE.md` implementation notes.

Modified existing files: `src/main.tsx`; `src/screens/MoreScreen.tsx`, `TrainingRecords.tsx`, `WorkoutBuilder.tsx`; `src/domain/v2/compositionContent.js`, `corrections.js`; `src/persistence/v2Validation.js`; `package.json`; `tests/v2-foundation.test.mjs`.

Intentionally preserved: V1 planner/readiness/clinical rule implementations, exercise catalog and research specifications, evidence and demo sources, illustration mappings, database schema and V1 stores, execution commands and guidance engine semantics. Existing working-tree changes from prior phases must not be mistaken for edits made in this phase.

## 3. Final navigation

Bottom navigation: Today, Train, Plan, Progress, Explore. Explore exposes Calendar, History, Learn / Rehab Guide, Assessments, Guidance history and Settings. Settings is also available from the header. This avoids seven cramped bottom labels. Existing More and Tests hashes have final-screen aliases.

## 4. Today

Shows today's plans, active workouts, completed sessions, missing next-day responses, quick blank/builder actions, Calendar access and relevant existing guidance. Training is available without completing readiness. The branded rotating image remains below functional content. Date updates while the app remains open.

## 5. Train

Primary workout destination with blank composition, builder/templates/starters/custom exercises, resume and recent workouts. Existing full-workout composition and execution remain primary. Targets and actuals remain distinct, direct demos remain available, and mid-session additions/replacements preserve performed work.

Exercise Picker, Builder and active cards now share `components/v2/IllustratedExercise.tsx`, a thin wrapper around `ExerciseIllustration`. A compact 64px thumbnail sits beside exercise identity/demo content, above full-width editing/logging controls. Clicking or pressing Enter opens the existing enlarged dialog. Image interaction does not complete sets, change targets or mutate session records. Missing/custom images retain a fallback and all exercise controls.

## 6. Plan

Reuses Phase 6 persisted user-owned planning, finite local recurrence expansion, independent dated snapshots, move/copy/skip/replace and multiple same-day workouts. No automatic planner authority was reintroduced. Recurrence is explicit local expansion, not a background scheduler.

## 7. Calendar

Reuses Phase 6 month/day read model and record identity. Planned and completed records remain distinct; materialized legacy sources are deduplicated. Today links directly to Calendar. Historical records open review/correction actions rather than ordinary mutable plan editing.

## 8. History

Reuses unified V1/V2 history, exercise/exposure/observation views, delayed responses, audited corrections and reports. Direct record opening is supported from Today. Repeated occurrences stay separate. New correction entries avoid recursive copies of the entire prior lineage; every prior state remains reconstructible and older entries are retained unchanged.

## 9. Progress Dashboard

Pure read-model calculations use recorded completed work, including performed portions of partial sessions. Plans, drafts, copied intent and zero-work abandoned sessions do not contribute training. Multi-category workouts count once for frequency and may appear in several category summaries.

Views: Overview, Strength, Achilles, Cardio & sport, Symptoms & responses, Benchmarks. Ranges include this week, four weeks and three months. Weekly frequency bars and detailed chronological performance tables show available data without unsupported trend claims.

Strength rows retain exercise, side, setup, units and load convention. Incompatible loads are not pooled. Load × reps is only shown where meaningful; unknown conventions do not become tonnage. Achilles summaries use curated metadata and explicit preserved family/classification mappings, not exercise-name searches. Custom classifications remain unknown.

Cardio/exposure quantities retain units and coverage. Linked aggregate exposure is not counted again as embedded quantity. Missing distance/contacts/duration remain missing. Saved legacy movement activities can contribute recorded activity without inventing a completed lifecycle or exact quantities from text. Raw symptoms and derived interpretations remain separate. There is no universal rehab score.

## 10. Rehab Guide

All nine phases are freely browseable: Re-entry / Baseline; Foundational Strength; Running Readiness; Running; Jumping & Landing; Plyometrics; Acceleration & Sprinting; Deceleration & Change of Direction; Basketball Re-entry.

Pages combine purpose, physical qualities, focus/cautions, available benchmark/checkpoint context, exposure and response coverage, relevant exercises, existing ladder examples, evidence links/limitations and related phases. Advanced examples project existing exposure content into selectable definitions with source provenance. They are not new clinical thresholds or automatic prescriptions.

Add to workout creates independent editable intent with no fabricated actuals. Phase association never grants or denies permission. Assessment, Progress, exposure and guidance links connect the educational material to recorded context.

The same illustration wrapper renders each phase's exercise options using exact IDs only. Existing mapped options in Baseline (3), Foundational Strength (4) and Running Readiness (3) display images. Seven example definitions across Running, Jumping & Landing, Plyometrics (2), Acceleration & Sprinting, Deceleration/COD and Basketball have no manifest mapping and display an explicit fallback. They retain demos and Add to workout. No approximate image aliases or new artwork were introduced.

## 11. Guidance integration

Uses the approved Phase 5 engine and persisted events/decisions. Builder, execution, plans and review retain nonblocking guidance. Today exposes relevant subject guidance; Progress and Guide link to guidance/history. Priority and limited visible findings remain managed by the existing panel. Historical details retain sources and revision provenance. Continue Anyway is a recorded decision, never clearance or warning resolution.

## 12. Settings

Organizes profile/equipment, backup/restore, Data Health and application/research information using existing functions. Workout tools are removed from the settings-mode More menu. Owned equipment is not silently converted into available-today or preferred equipment; management of those latter concepts is explicitly not complete. Custom exercise management links to Train.

## 13. V1 compatibility/retirement strategy

| Entry point | Final treatment |
|---|---|
| Old Today / generated Plan / V1 workout logger | Hidden from normal navigation; retained at explicit compatibility URL |
| V1 timers, readiness locks, canOpenWorkout | Retained for compatibility; do not control V2 |
| Old Progress | Replaced in primary navigation by actual-only unified Progress |
| More workout-builder entry | Replaced by primary Train |
| Existing baseline/checkpoint screens | Retained under Assessments with educational context |
| V1 history/data/adapters/research | Retained and used by unified readers |
| Old welcome routing | Compatibility-only; normal launch opens Today with branding |

No V1 history bulk conversion or deletion was performed.

## 14. Data integrity

Automated coverage verifies session/materialization and linked-exposure deduplication; no target-to-actual inference; unknown versus zero; delayed response separate from lifecycle; custom unknown demand; nonblocking phase context; override not clearance; wagon versus sled identity; distinct load conventions; template/plan/session independence; correction reconstruction; recurrence independence; pure guidance without mutation.

The preservation suite continues checking the approved research/assets baseline (596 files), with explicit phase delta manifests for intentional application changes. It does not exempt clinical research assertions merely because navigation changed.

## 15. Accessibility

Uses labeled controls, navigation landmarks, visible focus, disclosure buttons, practical touch targets and non-drag reorder/move controls inherited from the approved workflows. Keyboard skip-link and older workflow coverage remain. New mobile journey uses accessible role/label selectors. This is an engineering review, not formal WCAG certification or a complete screen-reader audit.

Illustration patch coverage verifies meaningful thumbnail names/alt text, a named enlarged dialog with visible exercise heading, visible focus, Enter to open, Escape and Close to dismiss, focus return, and nested picker dialog preservation. Failed assets retain a named Retry control; unmapped images do not create dead image buttons.

## 16. Mobile

Browser review covers 320, 390, 768 and 1280 px primary routes and the full mixed-workout journey at 390 px. Whole-workout scrolling remains primary. Tables scroll within their containers rather than widening the page. Screenshots include viewport and full-page variants. Physical iPhone/Safari validation is still a post-review device check.

The illustration-specific run checks all four affected surfaces at all four widths. Thumbnails remain compact; controls are not placed in a narrow column beneath the image. A visual review corrected inherited button padding that initially wrapped the Enlarge label.

## 17. Offline/PWA

Production service worker precaches 31 core production files; 379 exercise/branding image assets cache when requested. Final journey restores data, reloads offline and opens Today, Train, Plan, Calendar, History, Progress, Learn and Settings. Existing suite covers interrupted/reopened work and service-worker recovery. Update UI activates the waiting worker through the existing message protocol; database records are not cleared.

Remote videos and external evidence need connectivity. Initial assets must have been available online; this report does not claim every remote asset is cached.

Illustration patch: startup requests no exercise PNGs; thumbnails remain lazy and larger images load on opening. Request-based service-worker caching is unchanged. Dedicated browser coverage verifies cached thumbnails across all four V2 surfaces and cached enlarged views after offline reload, plus failed-image fallback in a fresh uncached context. The service-worker log's 379 lazy images comprise 348 exercise PNGs (174 thumbnail/detail pairs) and 31 daily-brand images; it does not mean 379 separately illustrated exercises.

## 18. Backup/restore

Combined disposable backup covers V1 unknown fields, custom definitions, templates, recurring plans, session actuals, corrections, delayed response, guidance and decisions. Round trip, repeated idempotent import, reopen and newer-local conflict rejection pass. Browser export/import and offline reopen use the real UI. Corrupt/future schema and atomic conflict behavior remain covered by Phase 2 tests.

V2 conflicting same-ID data is rejected rather than silently overwriting newer state. Identical imports are no-ops; established legacy merge semantics remain. The existing UI import cap is 25 MB; very large historical backups remain a documented limitation, not silently truncated data.

## 19. Storage review

Synthetic measurement found recursive correction snapshots grew a small record to roughly 15 MB after ten corrections. New version-2 correction entries retain the prior aggregate without recursively embedding the already-preserved lineage; they reference its immutable prefix. The first/older version-1 payloads remain untouched. Twelve new corrections occupied about 203 KB in the tested fixture, and exact reconstruction of every earlier state passes. Backup/restore verifies the new form. No destructive retention or migration was introduced. Guidance context and legitimate audit history still grow; quota depends on the browser/device.

## 20. Performance/bundle sizes

Vite output, decimal kB:

| Chunk | Minified | gzip |
|---|---:|---:|
| Main | 933.41 | 206.42 |
| Workout Builder | 16.71 | 5.44 |
| Workout Execution | 16.46 | 5.25 |
| Progress | 7.36 | 2.59 |
| Rehab Guide | 4.19 | 1.66 |
| Calendar/History/Plan shared records | 21.30 | 6.37 |
| Settings wrapper | 1.10 | 0.68 |
| Shared settings content | 27.59 | 8.48 |
| Compatibility App | 136.11 | 42.31 |

Phase 6 main baseline: 1035.25 / 234.75 kB. Screens remain lazy. Main exceeds Vite's 500 kB advisory; shared repository static/dynamic import warning also remains nonblocking. Future content splitting can be measured separately; broad optimization was not mixed into release work.

Illustration patch versus the reviewed final candidate: main +0.21 kB minified / +0.06 kB gzip. Existing image assets are not embedded into JavaScript or eagerly fetched.

## 21. Unit-test results

**464 passed, 0 failed, 0 skipped.** Includes all V1 and Phases 1–6 tests, final progress/preservation/backup coverage and three new illustration mapping/identity/fallback tests. All 174 canonical mappings and 348 existing PNG assets are validated. Existing asset-integrity tests and research hashes remain enforced. Evidence: `artifacts/illustration-checkout/artifacts/v2-illustration-unit-results.txt`. No old clinical or integrity assertion was weakened.

## 22. Browser-test results

**169 passing browser checkpoints: 150 retained compatibility/Phase 1–6 checks, 11 final journey checks and 8 grouped illustration checks.** The complete suite was rerun against the final illustration-patch build; all passed. Evidence: `artifacts/illustration-checkout/artifacts/v2-illustration-full-browser-results.txt` and `artifacts/illustration-checkout/artifacts/v2-illustrations/browser-results.json` (zero illustration browser runtime errors). Earlier final-phase logs below are retained as baseline evidence.

**PASS:** complete compatibility and V2 browser suite, including all 11 final end-to-end checkpoints; final journey recorded no browser runtime errors. Evidence log: `artifacts/illustration-checkout/artifacts/v2-final-full-browser-results.txt`; final journey JSON: `artifacts/illustration-checkout/artifacts/v2-final/browser-results.json`. Final mobile flow includes a persisted Strong Warning continuation, actual strength/cardio logging, additions, partial finish, response, correction, report, Progress, Guide, responsive routes, repeat restore and offline reopen.

Existing browser scripts are explicitly run against `?legacy=1` using a preload harness (including persistent contexts). Their assertions are unchanged. This preserves compatibility coverage while the separate final journey verifies replacement primary routing. Scripts: browser-qa, workflow-browser-qa, automatic-plan, equipment-followup, exercise-path, rehab-conditioning, rehab-block, advanced-rehab, unified-session, guided-workout, v2-persistence, v2-composition, v2-execution, v2-guidance, v2-planning-history (all `scripts/*-browser-qa.mjs` except the named base browser-qa).

The intentionally obsolete normal-route expectations are first-use Get Started/old five-tab navigation/More→Builder/generated-workout primary entry. Equivalent final coverage opens Today directly, reaches Train, builds/plans/executes mixed work, reviews Calendar/History/Progress, enters response/correction, uses Guide without locks, backs up/restores and reopens offline. Compatibility assertions remain available rather than being deleted.

## 23. Production-build result

**PASS:** TypeScript, Vite production build and service-worker generation. Illustration patch evidence: `artifacts/illustration-checkout/artifacts/v2-illustration-build-results.txt`. Build output is local `dist/`; it has not been deployed.

## 24. Known limitations

- **Resolved: V2 illustration rendering omission.** All four affected surfaces now use existing thumbnails and enlarged views. Remaining content gaps are limited to unmapped definitions: the seven advanced Guide examples described in section 10 and user-created custom exercises have no existing canonical illustration. They remain usable with explicit fallback and demo links where available. No new artwork or guessed mapping was authorized or added.
- Local-first single-device storage only; no accounts/cloud/health integrations.
- Available-today/preferred equipment management is not complete; ownership remains separate.
- Recurrence expands a selected local range; no automatic background scheduling or edit-all-series redesign.
- Sparse legacy metadata limits analytics; unknown values are shown honestly, not backfilled from current assumptions.
- Strength and symptom review uses tables alongside frequency bars; no unsupported statistical trend claims.
- Remote demos/evidence require internet; external playback availability is not certified by this phase.
- Existing 25 MB UI import limit and browser quota remain relevant for unusually large old audit histories.
- Desktop Edge disposable-profile QA is not a substitute for physical iOS/Safari testing or formal accessibility certification.
- Existing main bundle warning remains nonblocking.

## 25. Deployment readiness

Local validation candidate for release review. The release-blocking V2 illustration-rendering omission is corrected; genuine unmapped-content fallbacks are documented in section 24. Application version stays 1.13.0 and schema stays 3. No deploy/push has occurred. Review this report and screenshots before authorizing release. An application rollback is **not** a database rollback: a DB2 bundle may fail to open schema 3 and must not be offered as a safe rollback.

## 26. Exact deployment steps

After separate release approval:

1. Export a personal backup from the currently installed app; keep it outside the repository. Do not use the synthetic test backup as personal data.
2. Use `artifacts/illustration-checkout/`, verify remote `https://github.com/rebuildfitness/Achilles_Return.git`, and review all intended source changes. The checkout contains accumulated prior-phase work; do not blindly stage unrelated artifacts or copy the stale outer source tree.
3. Use Node 24 / pnpm 11.19.0. Run `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm build`, and `pnpm test:browser` from that root. CI installs Chromium and sets `BROWSER_CHANNEL=chromium`; local QA uses Edge by default.
4. Commit the reviewed source/config/tests and required public assets. Exclude personal backups, disposable profiles and debug failure screenshots. Push the reviewed commit to main only when release is authorized; the existing workflow deploys on main pushes.
5. GitHub Settings → Pages must use GitHub Actions. The existing workflow tests/builds and uploads **dist**, not source index.html, as the Pages artifact. Do not manually upload only index.html.
6. Wait for both build and deploy jobs to succeed. Open the deployed Pages URL and complete the smoke test below. Accept the app's update/reload action if offered; do not clear site storage to update.

## 27. Post-deployment smoke-test checklist

- Today opens; Train/Plan/Progress/Explore destinations work on desktop and phone.
- Existing personal history and owned equipment remain visible without duplicate legacy sessions.
- Create a disposable blank workout; add strength, rehab and cardio; template/plan edits remain independent.
- Start, log actuals, add work, finish partial; Calendar/History/Progress agree on one session.
- Guidance is visible, evidence-linked and nonblocking; Continue Anyway is not clearance.
- Record delayed response and verify it remains separate from completion.
- Browse all Guide phases; add advanced exercise without a stage lock.
- Review direct demos online and core screens offline after caching.
- Export a backup. Test restore only in a disposable profile, not by overwriting personal history.
- Confirm service-worker update preserves records. Investigate errors without deleting storage.

## 28. Future roadmap

Physical-device accessibility/browser review, measured bundle splitting, richer charts when data supports them, explicit available/preferred equipment controls, and large-backup UX can be considered separately. Cloud sync, accounts, native iOS, Apple Health/HealthKit/Watch and AI programming remain future unimplemented scope. No automatic medical clearance is planned by this release.

## Browser evidence index

[Open the clickable screenshot gallery](artifacts/illustration-checkout/artifacts/v2-final/EVIDENCE.md).

All paths below are relative to `artifacts/illustration-checkout/artifacts/v2-final/`; each has a full-page PNG and `-viewport.png` companion:

| Requested evidence | File |
|---|---|
| Today desktop | today-desktop-final.png |
| Today mobile | today-mobile.png |
| Train home | train-home.png |
| Workout Builder | workout-builder.png |
| Active workout | active-workout.png |
| Plan | plan.png |
| Calendar | calendar.png |
| Unified History | unified-history.png |
| Progress overview | progress-overview.png |
| Strength progress | strength-progress.png |
| Achilles progress | achilles-progress.png |
| Running/cardio | running-cardio-progress.png |
| Symptoms/response | symptom-response-trends.png |
| Guide overview | rehab-guide-overview.png |
| Foundational Strength | foundational-strength-guide.png |
| Running Readiness | running-readiness-guide.png |
| Plyometrics | plyometrics-guide.png |
| Basketball | basketball-guide.png |
| Advanced without lock | advanced-without-lock.png |
| Added from guide | guide-exercise-added.png |
| Settings | settings.png |
| Mobile navigation | mobile-navigation.png |
| Completed record chain | completed-calendar.png; unified-history.png; progress-overview.png |
| Offline app | offline-final-app.png |

Additional evidence: mid-session-addition.png, audited-correction.png, coaching-report.png. `failure*.png` are diagnostic leftovers from earlier iterations and are not acceptance evidence. `synthetic-backup.json` contains disposable test data only.

## Exercise-illustration release patch

This is a narrowly scoped correction to the reviewed final candidate, not a new implementation phase. No deployment occurred.

### Files changed by this patch

Added:

- `src/components/v2/IllustratedExercise.tsx` — presentation-only wrapper using the exact definition ID.
- `tests/v2-illustrations.test.mjs` — canonical assets, repeated occurrence identity and unmapped selection coverage.
- `scripts/v2-illustrations-browser-qa.mjs` — four-surface interaction, responsiveness, failure and offline checks.

Modified:

- `src/components/ExerciseIllustration.tsx` — optional compact mode, visible dialog heading, nested Escape/cancel isolation and V2 reference wording.
- `src/components/ExerciseIllustration.css` — compact sizing, focus and label/padding treatment.
- `src/components/v2/ExercisePicker.tsx`, `src/screens/WorkoutBuilder.tsx`, `src/screens/WorkoutExecution.tsx`, `src/screens/RehabGuide.tsx` — use the shared illustration presentation around identity/demo content, not set controls.
- `package.json` — append illustration browser QA to the complete suite.
- `tests/fixtures/v2/final-approved-deltas.json` — record explicitly authorized shared presentation/package changes; original asset/research hashes remain enforced.
- `V2_FINAL_VALIDATION_REPORT.md` — results, resolved omission and content gaps.

Untouched: manifest mappings, all existing artwork, canonical exercise IDs, `illustrationPaths.js`, service-worker caching logic, clinical/guidance rules, eligibility, composition/execution commands, persistence schema, backup format, plans, Calendar, History and Progress calculations.

### Remaining unmapped content (not rendering defects)

The static V2 picker contains 181 definitions: 174 have exact existing mappings and seven do not. Unmapped definitions are:

| Stable ID | Example |
|---|---|
| guide-running-R1-0 | Treadmill walk / jog technique |
| guide-jumping-J0-0 | Snap-down / controlled landing |
| guide-plyometrics-J3-0 | Single-leg pogo |
| guide-plyometrics-J3-1 | Jumping and landing |
| guide-speed-S1-0 | Sprint acceleration |
| guide-cod-D1-0 | Controlled deceleration |
| guide-basketball-B1-0 | Stationary shooting |

Custom definitions also have no assigned artwork unless an existing exact mapping is present. A similar exercise name is not used to infer an illustration. All these records remain selectable and usable.

### Illustration evidence

The eight grouped illustration browser checkpoints cover the requested acceptance cases: researched picker thumbnail and enlargement; Builder thumbnail; active thumbnail and enlargement; Guide thumbnail; missing mapping and failed-asset fallback; custom exercise fallback/selection; 320px Builder; 390px execution; keyboard open/close/focus return; offline cached artwork; and direct demo alongside artwork. They additionally check startup requests, all four widths on each surface, repeated occurrence/dialog identity, all nine Guide phases and session-record equality before/after image interaction.

Files under [artifacts/v2-illustrations](artifacts/illustration-checkout/artifacts/v2-illustrations/EVIDENCE.md):

| Requested view | Evidence |
|---|---|
| Picker desktop | picker-desktop.png |
| Picker mobile | picker-mobile.png |
| Builder | builder.png |
| Active workout | active-workout.png |
| Enlarged modal | enlarged-active.png; picker-enlarged.png |
| Guide | rehab-guide.png |
| 320px screen | builder-320.png |
| Custom / unmapped / failed asset | custom-fallback.png; unmapped-guide.png; image-failure.png |
| Offline cached artwork | offline-illustration.png; offline-active.png |

Each ordinary screenshot also has a `-viewport.png` companion. No screenshot contains personal production records. The synthetic Guide examples without mappings are deliberately shown as fallback, not incorrectly matched by name.
