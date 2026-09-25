# V2 Phase 1 boundary

This directory is additive and is not imported by the production application. It has no persistence, UI, clinical thresholds, plan generation or permission checks. The existing version remains 1.13.0 and IndexedDB remains schema 2.

- `contracts.ts`: domain types and explicit unknown/blank/not-applicable/known values.
- `adapters.ts`: pure legacy projections and intent copying. No clock, random IDs, storage or external effects.
- `snapshots.ts`: pure template → plan → session copying for contract validation. IDs and timestamps are supplied by the caller. No session is saved or shown in the live app.

## Identity and units

Definition IDs remain canonical. Occurrence IDs identify placements; set IDs identify individual entries. Native V2 can repeat one definition in separate blocks. Legacy IDs derive deterministically from session ID, source exercise identity and source slot; correcting numeric observations does not change them. Legacy source reordering would change positional projections: Phase 2 must persist assigned occurrence IDs rather than recalculate them after structural edits.

V1's `reps` field is projected into duration only with captured `unit: seconds`, and distance only with captured `unit: yards`. Without a captured unit it remains in the raw envelope and no metric is guessed from a current catalog lookup. V1 load is labeled pounds because that is the V1 logger convention; the particular resistance/setup convention remains unknown unless explicitly described. Native V2 has separate reps, load, duration, distance and rest fields with explicit units, tempo, side and set type.

Ranged prescriptions remain target text. Adapters do not calculate a numeric target or copy it into actuals. Side, tempo and set type absent from V1 remain unknown even if an exercise name suggests an answer. Native intervals have ordered work/recovery bouts with separate target and actual values.

## Preservation and uncertainty

Every adapted session/movement/recovery record contains a detached copy of its full original payload in `legacy.raw`; `recoverLegacy` returns another detached copy. Unknown fields, correction history, source versions and raw answers survive. This is lossless preservation of the stored record, not a claim that every old field can be normalized accurately.

The `legacy.limitations` list explains representational gaps. Duplicate V1 exercise IDs share a single keyed log: the adapter does not assign that log to both occurrences and double-count training. Repeated rehab entries with different existing IDs keep those IDs, including separate illustration aliases; no unsupported canonical equivalence is inferred.

Definition fallback from today's catalog is labeled `current-reference`; it is not treated as the historical captured definition and cannot supply missing historical units. Definition adapters preserve all original source metadata. Session snapshot adapters exclude prescription/execution decorations from the definition, keeping them in the occurrence and complete raw record instead.

Exposure `movementQuality` may already have been overwritten by V1's derived analysis. The adapter preserves `storedQuality`, marks original `reportedQuality` unknown, and separates other observations from `interpretation`. It does not reconstruct an original answer. A pending response is not tolerated and is independent of session lifecycle.

Movement routines expose aggregate actual quantities and completion identities without fabricating individual sets. Routine snapshots and aggregate set counts remain in the original record. Old recovery labels stay raw rather than being parsed into invented exact quantities.

Copying to intent uses only targets/structure. New plans and sessions own deep snapshots. Actual performance, symptoms, quality, response, correction lineage, legacy session envelopes and guidance decisions are not copied. Unperformed target slots remain intent; they are not completed sets. These factories are not runtime validation or persistence APIs yet.

## Synthetic fixture coverage

`tests/fixtures/v2/records.mjs` contains 16 V1 scenarios and 9 native V2 scenarios. `native.ts` supplies compile-checked contract examples. All quantities are synthetic test values, not clinical doses or personal data.

| Requested scenario | Fixture |
|---|---|
| Normal strength / rehab | `legacy.normal`, `legacy.rehab` |
| Repeated definition | `native.repeated`; `legacy.repeated` tests ambiguous old attribution |
| Warm-up + working sets | `native.warmupWorking` |
| Left/right / bilateral | `native.leftRight`, `native.repeated` |
| Tempo | `native.tempo` |
| Timed exercise | `legacy.timed` |
| Distance + time | `native.distanceTime`; `legacy.distance` preserves old yards |
| Intervals | `native.interval` |
| Exposure | `legacy.exposure` |
| Partial / skipped / abandoned | `native.partial`, `native.skipped`, `native.abandoned` |
| Swap after recorded sets | `legacy.swapped` |
| Correction lineage | `legacy.corrected` |
| Pending next-morning response | `legacy.pending` |
| Wagon | `legacy.wagon` |
| Movement / recovery | `legacy.movement`, `legacy.routine`, `legacy.recovery` |
| Missing definition snapshot | `legacy.missingSnapshot` |
| Unknown historical information | `legacy.unknown` |
| Repeated rehab movement | `legacy.repeatedRehab` |

The preservation manifest records SHA-256 hashes of 596 pre-existing files. It is a Phase 1 regression baseline, not a permanent rule forbidding future approved edits. A later phase must deliberately revise this test boundary, without disguising changes to clinical data.

## Validation commands

From the active checkout, using Node 24 (also used by existing CI):

```text
node --test tests/v2-foundation.test.mjs
pnpm test
node node_modules/typescript/bin/tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution Bundler --skipLibCheck tests/fixtures/v2/native.ts
pnpm build
pnpm test:browser
node scripts/v2-phase1-examples.mjs
```

Node 24 executes the type-strippable TypeScript adapters in tests; the production build typechecks them but does not bundle unreachable modules. The separate fixture typecheck is necessary because the existing tsconfig includes `src`, not `tests`.
