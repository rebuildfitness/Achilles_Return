# Phase 3 workout composition

Open **More → Workout Builder**. This is an additive composition workspace. It saves targets and templates; it does not execute a workout, start timers or replace the current logger.

## Architecture

- `domain/v2/composition.js`: intent-only factories and commands. No readiness/profile input, database writes or automatic planner mutations. Exercise definitions, occurrences, sets and interval bouts have separate identities.
- `domain/v2/compositionContent.js`: a read-only projection of the existing catalog, reference library, equipment references and movement routines. Canonical IDs, raw evidence, demo verification and illustration mappings survive. Existing Strength A/B/C, Full/Essential, base Achilles conditioning and nine movement routines are projected into editable starters. No new doses or clinical classifications are invented.
- `components/v2/ExercisePicker.tsx`: shared dialog with name/text search and nine independent metadata filters. Phase association is descriptive. No readiness/ownership gate is called. Missing metadata appears as Unspecified.
- `components/v2/TargetEditor.tsx`: adaptive set targets, explicit units/load convention, rest, side, four-part tempo and ordered interval bouts.
- `screens/WorkoutBuilder.tsx`: full-workout composition, drafts, starter/user templates, history-as-intent copying and custom exercise management. Lazy-loaded from More.
- `persistence/compositionDraft.js`: serialized revision-checked autosave, atomic template-plus-draft-link saves, explicit template updates and archive commands over Phase 2 repositories.

## Storage and independence

Schema remains **3**. A composition draft is a `v2PlannedWorkouts` aggregate with `composition: {version: 1, archived: false}` and an independent template-shaped snapshot. Its stable UUID, not its date, identifies it. The date is the draft's creation day; no calendar or recurring schedule is implemented. Crossing midnight does not change identity or make a new draft.

Templates live in `v2WorkoutTemplates`, custom definitions in `v2ExerciseDefinitions`. No new session is created. Template saves and explicit updates commit the reusable template and draft relationship atomically. Other workouts retain copied snapshots. Archiving templates/custom definitions/drafts preserves referenced content.

The default edit scope is **This workout only**. Rename the workout, then use **Update Template** to intentionally rename/update its source. **Save as template** creates another reusable template. Neither silently updates other plans or history.

Each valid composition change is queued immediately, without a long debounce. “Saved on this device” is shown only after commit. Leaving through the builder's Back waits for the queue. Pending writes or errors trigger the browser's unload warning. Failed writes show an error and Retry. Storage failure cannot be described as successful saving.

A cross-tab stale draft edit does not overwrite the newer record. The rejected edit is saved to a **separate recovery draft**, linked through `recoveredFrom`, and a visible notice explains this. Template conflicts reject the atomic action rather than overriding another editor; reload the current template or save a new template intentionally.

## Editing rules

- Add/duplicate/replace creates fresh occurrence/set identities while retaining canonical definition identity. Duplicate targets are deep copies. Reordering retains identities.
- Replacement resets the replaced exercise's targets and sets; it retains its group assignment. No actual workout data exists in this composition path.
- All seven tracking types are supported: weighted reps, reps, time, distance + time, reps + time, intervals and free-form.
- Definitions without enough tracking metadata offer Source metrics / unspecified and a user-selectable Target format. This is a workout-level editing choice; it does not reclassify the researched definition.
- Changing target format never conceals already entered numeric targets. They remain visible until cleared. Blank and zero remain distinct.
- Four-part tempo is `lower-pause-lift-pause`, using seconds or X for explosive. Incomplete tempo shows an error and is not committed. Historical tempo is not inferred.
- Intervals store an ordered bout array plus repeatCount on the set. Work/recovery bouts have independent IDs and typed duration/distance targets.
- Groups are optional template metadata: id, name, superset/circuit kind and rounds. Occurrences reference group IDs. Group assignment does not duplicate or silently change sets. Exercise order remains explicit; execution/round traversal belongs to Phase 4.
- Custom definitions store categories, equipment, tracking type, notes, tags and optional http/https demo URL. Origin remains custom, media unverified, clinical demand unknown. Archive removes them from new selection without rewriting snapshots.

## Historical copy

Copying completed work passes through the Phase 1 adapters and an intent-only projection. New IDs are assigned. Actuals, completion, symptoms, quality, RPE, delayed responses, interpretations and historical decisions are not copied. Only reusable original-intent notes are carried forward, not finish notes. Missing legacy metadata/ranged doses remain unspecified/text; current catalog values are not substituted into history. Ambiguous legacy duplicate placements retain the Phase 1 adapter's documented limitations.

## Accessibility and visual scope

Existing app shell, tokens and five navigation tabs remain. The whole workout appears in one scroll. Forms use visible labels, explicit accessible select names, minimum 44px controls and visible focus. Exercise/set reorder uses buttons, not drag-only gestures. The native picker dialog handles keyboard focus/Escape and restores focus when closed. Optional detail sections hold secondary targets/source information, while main targets and direct demos remain visible.

## Phase 4 integration proposal — not implemented

1. Add an explicit Start action that snapshots a chosen composition into a session-owned aggregate. Do not execute or continuously read the mutable draft.
2. Preserve occurrence/set/bout relationships and group metadata while establishing session identity; keep target and actual separate.
3. Define exactly how group rounds and per-exercise set counts are reconciled at execution. The composer currently records both without fabricating additional sets.
4. Execute interval repeatCount as repeated ordered bouts with actual performance recorded separately; do not overwrite the intent sequence.
5. Keep this picker and command layer reusable for future in-session editing, but add policies to retain already-performed sets during replacements.
6. Introduce session-keyed timers, partial completion and finish handling only in Phase 4. Retain V1 compatibility until parity is demonstrated.
7. Evolve advisory guidance in its own approved phase. Never call V1 eligibility functions to prevent selection in this builder.

No Phase 4 behavior is wired to the live application by this work.
