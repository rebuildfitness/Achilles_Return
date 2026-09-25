# V2 additive local persistence

Implementation root: `artifacts/illustration-checkout/`. Application content remains 1.13.0. This is an internal persistence foundation; no workout-builder integration is enabled.

## Schema and boundaries

IndexedDB `achilles-return-db` upgrades from 2 to 3. All seven original stores remain unchanged: profile, checkins, sessions, assessments, capabilityStates, decisions, settings. Upgrade creates seven empty stores and does not read, convert or rewrite their existing records.

| New store | Contents | Additional indexes |
| --- | --- | --- |
| v2ExerciseDefinitions | Custom definitions only; archive instead of delete | None |
| v2WorkoutTemplates | Reusable intent without actuals | None |
| v2PlannedWorkouts | Independent copied intent | date |
| v2WorkoutSessions | Snapshot, actuals, lifecycle, revision, optional observation links | lifecycle; date.value; unique legacyKey |
| v2Observations | Symptom, delayed response, exposure, benchmark observations | sessionId |
| v2GuidanceEvents | Versioned advisory findings, inputs and missing inputs | None |
| v2GuidanceDecisions | User responses, including continued-anyway | None |

All stores use `id` as primary key. Indexes support future draft/date/link lookup; the unique legacy key enforces one materialization per V1 source. Unknown session dates are unindexed. Multiple sessions on the same date are permitted. Session lifecycle itself represents draft state, so completion and draft resolution are one aggregate write, not competing date-keyed records.

Persisted aggregates add `recordVersion: 1` and a positive integer `revision`. A session's existing `schemaVersion: 2` is its domain contract version, not the IndexedDB database version. These versions must not be conflated.

## Repository API

From `src/persistence/v2Repository.js`:

```js
await saveV2(store, record, null); // create at revision 1
await saveV2(store, { ...record, revision: 2 }, 1); // compare and replace
await atomicV2([
  { store: 'v2WorkoutSessions', record: completedSession, expectedRevision: 2 },
  { store: 'v2Observations', record: response, expectedRevision: null },
]);
await readV2(store, id);
await listV2(store);
await archiveDefinition(id, expectedRevision);
await materializeLegacy(originalV1Session);
const history = mergedHistory(v1Sessions, v2Sessions);
```

These are internal APIs, not new UI controls. Generic V1 `put`/`writeRecords` reject writes to V2 stores. Repository operations clone inputs; validate records; read current revisions inside a read-write transaction; validate graph relationships; put all changes; resolve only on transaction completion. Exceptions, quota errors, stale revisions and constraint errors abort the transaction. A same-ID, structurally identical retry is a no-op. Any changed normal write must match the current revision and increment exactly once.

Custom definitions are always archived, even when unreferenced. Researched definitions stay in curated application content and session snapshots. No research is seeded into IndexedDB.

## Runtime validation

`v2Validation.js` validates store-specific record versions, identities, dates, revisions, lifecycle enums, nested exercise definitions, occurrence/set IDs, typed metrics, explicit units/load conventions, side, tempo, set types, ordered intervals, target/actual separation, embedded observations, provenance and guidance metadata. Template intent rejects completed performance/response fields. Tagged values retain zero, blank, unknown and not-applicable distinctions. Inputs are never coerced.

Unknown extension fields are retained if portable; opaque historical raw observations and correction payloads are preserved rather than assigned invented clinical meaning. Unsupported structured objects, cycles, nonfinite numbers and unsafe prototype keys fail explicitly. Validation is structural; it neither asserts medical correctness nor creates clinical thresholds. Acknowledgment/continued-anyway is not clearance.

Graph validation requires linked observations, guidance subjects/decisions and custom definitions to exist. Guidance writes do not edit workouts. Repositories currently scan the V2 graph within the transaction for correctness; indexed query optimization can follow measured need.

## Legacy compatibility and precedence

V1 reads remain unchanged. `materializeLegacy` is an explicit future integration point, never an upgrade hook. It verifies that the supplied V1 source still matches storage; preserves the full original record; adds origin store, ID and revision; and persists the adapter's stable occurrence/set IDs. Missing V1 revision uses origin revision 0 as an unversioned-source marker, not a fabricated historical revision; `legacy.raw` retains the missing field.

`mergedHistory` gives a materialized V2 record precedence over its linked V1 source. Unmaterialized V1 sessions remain adapter-backed. The original V1 row is retained. The unique origin index and transaction validation prevent duplicate materializations. A source that has changed cannot silently be rematerialized over an existing V2 record. The current V1 History UI is intentionally not switched to this read model.

## Backup and restore policy

`exportAll()` produces backup schema 3 with all 14 stores, application/database/content/evidence/rule versions, export timestamp and provenance. A serialization sidecar preserves undefined fields, sparse array holes and legacy Dates through JSON round trips. Unknown legacy fields remain on their original records. Unsupported values fail rather than silently disappear.

`restoreBackup()` accepts valid schemas 1, 2 and 3. It validates the complete incoming structure before opening a write transaction, then checks conflicts and relationships against current records inside the transaction before any put. Future schema/record versions, corruption, duplicate IDs, inconsistent links and unsafe sidecar paths reject the whole operation.

**Same-ID V2 policy:** identical incoming record is a no-op. Any differing incoming record conflicts, whether older, equal-revision or newer. There is no destructive V2 replacement or automatic merge. A conflict also prevents accompanying V1 writes. Existing V1 upsert compatibility remains, except an incoming source conflicting with an existing V2 materialization is rejected. Repeat import is idempotent. This is an atomic merge restore, not an erase-and-replace reset.

Export is read-only. No backup, import, fixture or browser test touches personal production data. Example JSON files are synthetic and must not be used as a personal-data restore package.

## Upgrade and recovery

Blocked upgrades reject with a useful error and can be retried after the blocking connection closes. `versionchange` closes the cached connection. An older bundle opening a newer database fails with VersionError. **Rolling back application code is not rolling back IndexedDB.** Do not deploy an older database-version bundle as a database recovery mechanism; retain a compatible bundle and validated backup.

The production service-worker activation/cache behavior is unchanged. Browser tests use its generated implementation with test-only build identifiers and a cached synthetic harness, in a disposable browser context. They exercise offline reopen/save and activation while V2 drafts and V1 data survive. This does not guarantee durability under OS storage eviction or physical device failure.

## Proposed Phase 3 integration points (not implemented)

1. Introduce builder commands using the approved domain snapshots and revision-controlled repositories.
2. Create session IDs before logging; resume by ID rather than date. Await transaction completion before showing saved state.
3. Save completion and linked observations together; preserve actuals and historical snapshots during future intent edits.
4. Use explicit legacy materialization only when a user elects to edit a legacy session, and use mergedHistory for de-duplication.
5. Present conflicts to the user; never retry a stale edit by blindly adopting the latest revision.
6. Persist advisory events and decisions independently. Do not turn acknowledgment into clearance or mutate workouts implicitly.
7. Design restore conflict review and indexed queries only when their product interactions are approved.
