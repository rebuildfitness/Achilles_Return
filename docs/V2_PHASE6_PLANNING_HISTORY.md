# Combined Phase 6: planning, calendar, history and reports

## Entry points and scope

Open **More → Plan, Calendar & History**, **Plan → User-owned Plan, Calendar & History**, or the new compact **Your workouts today** card. The existing five-tab navigation and V1 suggested-plan/logger remain available. This is not the final Dashboard, Rehab Guide or navigation migration.

Active root remains `artifacts/illustration-checkout`, app 1.13.0, IndexedDB schema 3. No stores or indexes were added. No personal history is bulk converted.

## Planning

`domain/v2/planning.js` owns independent dated plan creation and explicit move, skip, restore, archive and replacement commands. Each edit is revisioned and records its previous date/status; replacement retains the old intent in its audit. `planning.version = 1` distinguishes a scheduled plan from a Phase 3 composition draft whose date merely identifies creation day.

`persistence/planningHistory.js` validates and commits those commands through the Phase 2 repositories. Start checks the exact current plan inside the transaction, creates a distinct session with copied original intent and fresh occurrence/set IDs, and does not modify the plan or template. Starting a future/missed plan records the actual start date separately from its original plan relationship.

Sources include blank intent, curated starter, user template and a completed workout copied as intent. The existing builder edits the chosen dated aggregate through its serialized draft writer. Explicit Update Template remains a separate action. Archiving a plan retains its record and referenced history.

## Weekly recurrence

The user selects an inclusive start/end range and weekdays. One explicit save expands the range into independently editable dated plans in one transaction. Each has a series/date identity and copied recurrence name/range/weekdays. There is no background task or cloud scheduler. A maximum one-year expansion bounds one local operation, not training eligibility. Repeating the action in the UI intentionally creates another series; no hidden future replacement occurs. There is no edit-all-series command in this phase.

## Calendar and history read model

`domain/v2/timeline.js` reads V1 sessions through approved adapters and V2 sessions as their own snapshots. Explicit materialization origin gives V2 precedence over the original V1 source. Saved movement/recovery records are adapted read-only; drafts and voided entries are excluded.

Calendar identities include record kind/store and record ID. A mixed-category session is one session event with multiple badges. A dated plan and its real session are different records, visibly distinguished; a started plan says started/recorded. Copied intent, skipped plans and abandoned zero-work sessions are not performed training. Partial work includes only completed/partial set or bout records in the actual-work projection.

Linked V1 exposure IDs remain a single exposure record and are accessible from the parent's report/exposure history rather than displayed as an additional standalone workout calendar event. Explicit observation source-exposure/occurrence links suppress duplicate embedded representations. No fuzzy date/name matching is used to merge unrelated records.

Assessments, dated checkpoints, check-ins and V2 observations have their own calendar identities. Unknown historical dates remain unknown and available in history rather than being assigned today's date.

## Exercise and exposure history

Each session occurrence has an independent exercise-history row, including repeated definitions. Targets, actual metrics, explicit units/load conventions, side, set type, tempo, notes and setup remain separate. No strength-volume aggregation equates assistance, stack reading, per-hand, bar-included, device-specific, wagon or sled loads.

Exposure history preserves recorded quantities and context. User-selected workout categories are context only: a mixed Strength + Running session does not convert calf reps into measured running distance. A context row has no invented quantity and is labeled as not an additional exposure. Completed occurrence actuals remain attached to their own movement. No recorded exposure does not establish that none occurred.

## Delayed responses

The finished-session screen accepts the existing qualitative tendon-response answers and notes, with observation date separate from record-created timestamp. The raw response commits first to `v2Observations`. A subsequent revision stores the existing tolerance classifier's interpretation and rule version separately, then Phase 5 guidance reevaluates.

The workout aggregate/lifecycle is unchanged. If interpretation or guidance fails, the raw response remains saved and the UI reports that refresh needs retry. Additional observations append rather than overwrite prior answers. V1 original response entry remains available; a deliberately materialized record can use the V2 observation workflow.

## Historical corrections

Finished sessions have no generic edit mode. `correctSession` accepts a narrow factual command: a set/bout's actuals and disposition, actual set type, session notes or activity date. A reason, timestamp and correction identity are required. It retains the entire previous aggregate/revision plus command/original values in correction lineage, preserves original intent and targets, and increments once.

The repository recomputes the correction against the actual current aggregate inside its transaction and compares the proposed result. Stale edits fail. Ordinary writes to completed execution or materialized/audited history remain rejected. This does not turn an arbitrary caller-supplied changed snapshot into an authorized correction.

Explicit legacy preparation preserves the original V1 row and uses the existing unique materialization identity. Unified views prefer its corrected V2 representation. The guidance adapter does not use the untouched legacy raw envelope as if it were the corrected actuals.

## Guidance and reports

Phase 5 remains the only guidance engine. Adapter version 1.1.0 adds planned spacing context and corrected-history handling; clinical rule versions/thresholds are unchanged. Planned-only spacing uses the existing scheduling evaluator and is labeled as planned, not performed exposure. Plan cards link to guidance; findings never move or alter plans automatically.

Reports are immediately available from recorded-session detail. Markdown includes original intent, current targets/actuals, additions, replacement relationships, skipped/partial work, symptoms, responses, guidance with revision/source identity, decisions, exposures and correction summaries. Continue Anyway is explicitly not clearance. Older guidance is labeled historical/stale; matching subject revision alone does not establish current context.

## Validation and boundaries

Tests use fake-indexeddb, synthetic records and disposable browser profiles. Existing unit and browser assertions remain intact. The preservation manifest adds only the authorized V1 entry-point and package-script deltas.

No retrospective creation UI, cross-device sync, broad aggregate analytics, series-wide editor, final navigation migration or release package is introduced. Stored history can grow because correction snapshots and guidance inputs prioritize auditability; future retention/compaction requires separate preservation review. Backups already include all V2 records and their additional metadata.
