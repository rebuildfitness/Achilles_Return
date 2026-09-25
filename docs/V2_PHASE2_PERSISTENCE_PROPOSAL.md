# Phase 2 additive persistence proposal — not implemented

Phase 1 establishes pure models/adapters only. This proposal requires separate review before implementation. It does not change the database or authorize Phase 2.

## Storage boundary

Keep `achilles-return-db` and all seven existing stores. Propose a single additive IndexedDB version upgrade after validation, with new stores rather than changing the meaning of existing `sessions` or `settings` rows:

| Proposed store | Key and purpose |
|---|---|
| `v2ExerciseDefinitions` | Stable custom-definition ID; archived rather than deleted when referenced. Researched static definitions remain static source content. |
| `v2WorkoutTemplates` | Template ID, revision, independent intent snapshot, curated/user origin. |
| `v2PlannedWorkouts` | Plan ID, revision, date, status, copied template intent and optional template version reference. |
| `v2WorkoutSessions` | Session ID, revision, lifecycle, target snapshot, nested occurrence/set actuals and source links. Drafts use session IDs, not dates. |
| `v2Observations` | Observation ID and kind: symptom, delayed response, exposure or phase/benchmark interpretation; optional session/occurrence link. Preserve raw input separately from derived evaluation. |
| `v2GuidanceEvents` | Event ID, subject ID/revision, rule/source versions, inputs, finding and explanation. No implicit workout mutation. |
| `v2GuidanceDecisions` | User action/override ID, event link, timestamp and subject revision. Acknowledgment is not clearance. |

Proposed database version 3 is only a candidate: confirm the actual highest shipped schema before coding. Do not make this version change as part of Phase 1.

Avoid a store per set: nested session aggregates allow atomic edits of order, targets and actuals. Index session date, lifecycle and plan reference; index planned date/status and observation subject/date. Add indexes only for demonstrated local queries. There is no sync queue, account identifier, server API or HealthKit infrastructure.

## Legacy compatibility

- Continue reading V1 through pure adapters. Do not rewrite all old sessions or research records on upgrade.
- Keep source IDs and complete raw envelopes. Do not normalize missing units from a current catalog lookup.
- A deliberate edit of a legacy session can create a V2 materialization linked to the original store/ID/revision. Specify whether the read model prefers that materialization; never count both.
- Persist occurrence/set IDs once materialized. Phase 1 positional legacy IDs are stable for unchanged source structure, not a substitute for persistent identities after reordering.
- Handle active V1 drafts explicitly: preserve them in place until a reviewed conversion can capture their structure. Do not reconstruct a missing draft prescription and silently label it original intent.
- Never repurpose the old tolerance `status` as a training lifecycle. Missing historical lifecycle remains unknown.

## Transactions and revision checks

Repository commands should read the current revision and write the new aggregate in one transaction. Reject stale revisions rather than replacing later logs or next-morning responses. A multi-record save (finish + response link + draft state) commits atomically. Failed commits must not show successful-save UI.

Generate new IDs and timestamps at the command boundary; keep projection and analysis functions pure. Copying template → plan → session deep-copies snapshots. Template edits must never follow references into active/history records. Avoid read methods with profile-migration side effects in the new repository.

## Backup, restore and rollback

Extend the backup schema independently of the database version. Include original stores, new stores, schema/content/rule versions and legacy provenance. Validate all incoming rows before writing; retain support for versions 1 and 2. Explicitly distinguish missing fields, zero, blank and not applicable in V2 serialization.

Restore needs a documented same-ID policy (preview conflicts; reject or explicitly select replace) before implementation. The current V1 upsert behavior must not silently overwrite a newer V2 revision. Keep unsupported future-schema rejection. Import should be idempotent and not duplicate materialized legacy sessions.

Before upgrading a user's database, offer a verified export path and test migration on fixtures. An old bundle cannot simply reopen an upgraded IndexedDB version; do not describe code rollback as database rollback. Handle blocked upgrades and `versionchange` closure across tabs; protect in-progress drafts during service-worker updates.

## Required Phase 2 validation

Use `fake-indexeddb` and disposable browser profiles, never personal data:

1. Upgrade V1/V2 fixture databases without altering any old record.
2. Preserve all Phase 1 identities, unknowns, raw provenance and correction lineage after serialization/reopen.
3. Atomic writes, failure rollback, optimistic revisions and duplicate-save idempotence.
4. Multiple drafts on the same date and resume across midnight.
5. Template/plan/session snapshot isolation after storage and reload.
6. Backup round trips and unsupported/corrupt backup rejection before writes.
7. Explicit same-ID restore conflicts and legacy-materialization de-duplication.
8. Cross-tab schema upgrade, offline save/reopen and service-worker update recovery.

No new UI, navigation, planner behavior or clinical rules are implied by this persistence proposal. Those remain separate approved implementation phases.
