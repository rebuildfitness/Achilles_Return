# Final V2 experience

Application 1.13.0 / IndexedDB 3. Final review candidate; not deployed.

## Routing

`main.tsx` uses `FinalApp.tsx` for normal navigation. Today, Train, Plan and Progress are primary tabs; Explore supplies Calendar, History, Learn, Assessments, Guidance and Settings. `?legacy=1` explicitly loads the retained V1 App for compatibility/testing. V1 eligibility must not control the normal V2 route.

## Reuse boundaries

WorkoutBuilder and WorkoutExecution remain the Phase 3/4 implementations. TrainingRecords remains the Phase 6 Plan/Calendar/History implementation with optional direct record selection. GuidancePanel uses the Phase 5 persisted advisory engine. Settings and Assessments reuse appropriate existing controls. None of these screens changes the database schema.

## Progress

`domain/v2/progress.js` derives actual-only summaries from the unified timeline. Keep linked exposure/materialization identity filtering before counting. Never substitute targets for actuals or missing values for zero. Group strength only by compatible definition, unit, convention, side and setup. Curated metadata can establish calf/soleus/category membership; names and unknown custom definitions cannot establish clinical classification.

## Guide

`domain/v2/rehabGuide.js` organizes nine educational phases and projects existing exposure-ladder content into selectable example definitions. Every phase is browseable. Adding an exercise creates editable intent, not automatic programming or clearance. Evidence and limitations remain attached to preserved sources.

## Corrections

New correction entries with an existing lineage use version 2 and `previousLineageCount`. Their previous aggregate excludes the recursively duplicated lineage, whose exact immutable prefix remains in the enclosing record. `priorCorrectionState(session, index)` reconstructs the prior aggregate. Version-1 snapshots remain supported and are not rewritten. Preserve this reference validation and reconstruction test when changing backups or correction UI.

## Validation

Run `pnpm test`, `pnpm build`, `pnpm test:browser`. The browser command preloads `legacy-ui-qa.mjs` only for existing compatibility scripts; the final script runs normal routing. Use disposable browser profiles and fake-indexeddb. Final evidence is under `artifacts/v2-final/`; the review report is `../../V2_FINAL_VALIDATION_REPORT.md` from the active checkout root.

## Release boundary

Review the final report before deployment. Do not replace source index.html with compiled index.html. GitHub Actions builds and publishes dist. Application rollback does not downgrade IndexedDB. Keep personal exports outside the repository and do not restore synthetic QA backups over personal records.
