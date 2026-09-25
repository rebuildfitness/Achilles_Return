# V2 Phase 4 — Session-owned execution

Open **More → Workout Builder**, create/open a composition, and choose **Start Workout**. Resume an active session or view finished V2 sessions from the builder's session list. The existing V1 workout remains available through its existing entry points.

## Boundaries

The new path never calls the V1 planner, canOpenWorkout, progression gates or clinical readiness classifiers. It records the selected workout; recording does not establish tolerance or medical clearance. No Phase 5 advice, final navigation, scheduling or dashboard conversion is included.

Schema remains IndexedDB 3. Execution uses v2WorkoutSessions and the Phase 2 validated, revision-controlled repository. Custom definitions use their existing repository. No existing data is bulk converted.

## Session start and identity

`domain/v2/execution.js:startSession` creates a distinct session ID, independent occurrence/set/bout IDs, an immutable originalIntent snapshot and a mutable session-owned occurrence list. Canonical definition IDs and source snapshots are preserved. Source plan/template relationships survive. Targets are copied; actuals start empty. `persistence/sessionExecution.js:persistStart` waits for the repository transaction before presenting the workout as started.

`createdAt` and `startedAt` are separate fields. The current UI starts now; a retrospective editor is not implemented. A future retrospective command must explicitly distinguish activity time from record creation time.

## Group normalization

Normalization version: **one-set-per-round-v1**.

- One group pass is one set/activity from each member in occurrence order.
- Existing set 1 maps to round 1, set 2 to round 2, and so on.
- If rounds exceed existing sets, the last target is copied for the remaining planned passes. If no set exists, an empty target slot is created.
- If sets exceed rounds, surplus sets remain additional sequential work after group passes.
- Rounds are never multiplied by the full set count.
- The rule is visible before starting and on the active group card. The original intent is preserved unchanged.
- Round controls skip only remaining work. Completed sets retain their identities and observations.

Intervals expand one planned bout sequence into explicitly identified repeats. Each work/recovery bout has independent actuals and disposition. Stopping early leaves later bouts planned/unperformed. Completing the parent cannot silently complete its bouts.

## Actuals and active edits

Actual reps, load, duration, distance, rest, RPE, side, tempo, notes, symptoms, quality and actual set type stay separate from targets. Completing a set is a user assertion of completion, not permission to fill blank amounts from targets. Blank amount is not zero.

Upcoming targets may be edited using the shared target editor. Exercise selection and custom creation reuse Phase 3 components. Adding or duplicating creates fresh identities, empty actuals and an addedDuringSession marker. Duplicate work is ungrouped rather than silently changing group volume.

Replacing retains the old occurrence, its name, definition snapshot, completed work and all existing IDs. Unrecorded remaining sets are skipped, and a linked new occurrence receives blank exercise-specific targets. Loads are not transferred between equipment. Previously recorded but incomplete work remains on the old occurrence for review/partial finish.

Recorded sets cannot be removed. Completed actual entries can be corrected during the active session; audit events retain before/after values. Unperformed removals also retain removed payloads in the session audit. Once finished, the repository rejects ordinary execution-session writes. Historical correction UI is deferred to its reviewed phase.

## Lifecycle and observations

Lifecycle uses existing model terms: in-progress, completed, partial, abandoned (draft remains supported by the foundation). Delayed response is separate. No synthetic next-day answer or tolerance classification is created.

Complete finish requires completed work with no skipped/unfinished sets. Partial finish retains recorded work and all unperformed structure. Zero-work sessions can be abandoned and cannot masquerade as completed training. Notes, symptoms and load setup alone do not create performed volume. The finish review shows actual completion counts, additions, skips, duration, notes and collected set feedback before commit.

## Timers

Elapsed time derives from the session's own startedAt and finishedAt/current time. It survives reload, restart and midnight without date-keyed state. It includes time away from the app; pause-time deduction is not implemented. Rest timers store session ID, set ID and end timestamp on the session. They can be dismissed and never mark work complete.

## Save/recovery

`sessionWriter` serializes edits with optimistic revisions. UI-created IDs are passed with the optimistic snapshot so persistence never regenerates different IDs. Saved is shown only after commit. Leaving through the session Back waits for the queue; pending/error unloads request a browser warning.

A localStorage recovery journal stores pending commands and snapshots by session ID. This is explicitly not another training record and is never included in totals. Canonical sessions always persist through V2 repositories. If journal storage is unavailable, a warning tells the user to keep the page open until commit. A stale write freezes further saving, retains pending edits and presents retry/download/load-saved actions. A conflict never forks a duplicate completed workout or automatically adopts a newer revision to overwrite it. Loading saved work downloads the pending recovery envelope first. Whole-backup export includes committed V2 records; the pending crash journal is a separate downloadable recovery artifact.

No application can guarantee an uncommitted keystroke after OS failure/storage eviction. Committed offline/restart recovery is covered by disposable browser tests.

## Future Phase 5 integration — proposal only

Read session targets and actual observations without mutating them. Produce independently persisted, versioned findings tied to the session revision, missing inputs and research sources. Present proposals and record meaningful user decisions separately. Preserve the ability to save factual work regardless of current readiness. Do not classify acknowledgment as medical clearance. Existing V1 clinical research and policy evaluators remain untouched for this later conversion.
