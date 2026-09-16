# Equipment follow-up — app 1.4.1

## Implemented

- Added a canonical training-sled equipment option independent of ownership. It is not selected by default and is not inferred from wagon ownership.
- Added searchable reference records for backward sled drag, sled push, forward sled drag/resisted march and backward treadmill walking. These are review-only records, separate from the established demo/illustration catalog. They cannot enter automatic workouts or exercise swaps and have no unverified demo buttons.
- Existing owners retain the utility wagon as a personal substitute. It is omitted from general equipment choices for profiles that do not already own it. New-profile defaults no longer assume wagon ownership.
- Preserved `weighted-wagon-backward-drag`, its original name, equipment, demo/source metadata, historical logs and existing eligibility behavior. Added a canonical movement reference to `backward-sled-drag` for search/normalization. Sled ownership cannot satisfy the wagon requirement, and wagon ownership cannot satisfy a sled requirement.
- History explicitly identifies legacy wagon entries as utility-wagon use. No historical records are rewritten or relabeled as sled sessions.
- Existing treadmill owners receive the confirmed ProForm Performance 300i model PFTL39715.1 in profile equipment details. Label specifications and provenance are retained. Backward-use authorization remains unverified; same-family manuals are not treated as approval.
- Profile context migration is additive and runs once. Existing ownership, unrelated metadata and later equipment deselection are preserved. Neither cargo capacity nor new device metadata is used as an exercise-load limit.

## Research follow-up

Original supplied research files and the follow-up handoff are preserved in `docs/research/exercise-followup/`. `NORMALIZED_RESEARCH_DRAFT.json` is a separately marked research document, not runtime data or an import file.

It reframes candidates 10–11 as canonical sled movements; records the exact treadmill model; separates band TKE from a future cable variant; specifies seated soleus isometric, floor push-up and standing single-arm row positions; withholds conflicting belt-squat calf instructions and illustration briefs; retains cushion/device verification as unresolved; corrects Revak authors and the Cheng title; quarantines the unverified Bohm citation; and scopes ACSM claims to general training context.

Provisional logging requirements are documented in the research draft with explicit missing-versus-zero and no-progression-evidence semantics. They do not create new runnable forms. Other candidate exercises still need exact setup/demo review before publication; no missing demos or illustrations were fabricated. Sled content work is no longer blocked by missing wagon specifications.

## Preserved boundaries

Clinical rule thresholds, running/sport progression gates, next-morning requirements, completed sessions and source metadata remain unchanged. Ruleset remains 1.1.0 and database version remains 2. Existing authorized wagon programming remains available only through the legacy owned-wagon path; no new forward-wagon substitution is permitted. Reference sled entries are not a general recommendation to exercise with a utility wagon.

## Files changed

- `src/data/equipmentContext.js` — canonical references, legacy mapping, exact device metadata and additive migration.
- `src/data/catalog.js` — equipment choices/defaults, labels and legacy movement metadata.
- `src/data/equipmentUpdate.js` — migration integration.
- `src/data/exerciseLibrary.js` — searchable pending references.
- `src/components/ExerciseLibrary.tsx` — personal substitution copy and honest demo availability.
- `src/screens/MoreScreen.tsx` — equipment choices and device/substitution information.
- `src/screens/History.tsx` — original wagon equipment display.
- `src/persistence/repository.ts`, `src/App.tsx`, `src/rules/planner.js` — new-profile equipment fallback; clinical decisions unchanged.
- `src/rules/trainingFlexibility.js` — exclude pending reference records from swaps.
- `src/persistence/schema.js`, `package.json` — app version and browser checks.
- `tests/equipment-followup.test.mjs`, `scripts/equipment-followup-browser-qa.mjs` — migration, ownership, scheduling exclusions and UI verification.
- This document, README and archived/normalized research documents.

## Preview and upload

In More → Profile & schedule, confirm treadmill PFTL39715.1 and the personal-wagon label. In Exercise library, search “sled” or “backward treadmill”: reference entries show pending verification and no demo link. In history, legacy wagon logs continue to identify wagon use.

Use the complete equipment-follow-up ZIP, copying its extracted contents into the cloned repository while preserving `.git`. Commit and push; wait for the deployment workflow to succeed. In the app, use Update & reload and verify version 1.4.1. Do not clear site data. This release is prepared locally, not deployed.

## Validation

- 131 unit/regression tests passed; zero failed.
- 51 browser checks passed: 37 application, 5 workflow, 5 automatic progression, 4 equipment follow-up; zero failed.
- TypeScript and production build passed. Existing non-blocking large-bundle warning remains.
- Screenshots: artifacts/equipment-followup-profile.png and artifacts/equipment-followup-sled.png.
- No deployment performed and no additional user approval required for this implementation. Exact demo/device verification still limits publication of pending content.
