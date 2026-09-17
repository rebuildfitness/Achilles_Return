import {writeFileSync} from 'node:fs';
import {RESEARCH_EXERCISES} from '../src/data/researchExercises.js';
import {EQUIPMENT_REFERENCE_EXERCISES} from '../src/data/equipmentContext.js';
const entries=[...RESEARCH_EXERCISES,...EQUIPMENT_REFERENCE_EXERCISES];
const rows=entries.map(ex=>{
 const d=ex.demoVerification||ex.relatedDemo;
 return `| ${ex.name} | ${ex.videoUrl?'Playback reviewed':d?'Related clip only; different equipment':'Unresolved'} | ${d?`[${d.provider}](${d.url})`: 'None accepted'} | ${d?`${Math.floor(d.seconds/60)}:${String(d.seconds%60).padStart(2,'0')}`:'—'} | ${d?.note||'No suitable device-specific clip verified. ProForm PFTL39715.1 backward-walking authorization remains unverified.'} |`;
});
const text=`# Reference demo review — September 17, 2026

Release 1.6.1. All 25 entries previously labeled “Demo pending verification · Reference only” were reviewed: **22 playable movement demos, 2 related-equipment clips, 1 unresolved entry**.

Video playback was opened and movement/setup inspected in the browser. Durations are rounded up for provider clips. The slant-board tutorial lasts 3:37 and opens directly to the demonstration at 1:05. Availability may change; no media was downloaded or redistributed. Demos need an internet connection.

These are educational references, not clinical approvals. All 25 remain reference-only, unavailable for workout swaps and automatic programming. No clinical thresholds, doses, range permissions, equipment ownership or completed records were changed. Original research claims and demo records remain intact. Previous guide-review metadata is retained separately from the new video review.

| Exercise | Result | Provider / link | Full duration | Match and limitations |
|---|---|---|---|---|
${rows.join('\n')}

## Unresolved setup details

- Mammoth belt-squat calf raise: related clip uses another machine and a raised foot surface. Exact compatible Mammoth attachment, support and clearance still need review; it is not presented as a Short Demo for the owned setup.
- Mammoth belt-squat isometric: related clip demonstrates a hold on another machine. Entry, exit, lever stop and hold position on the Mammoth remain unresolved; video timing is not adopted as a dose.
- Backward treadmill walk: searches returned manual/ATG, underwater, band-resisted and generic treadmill variants. None establishes a suitable setup for the user's ProForm PFTL39715.1. The pending label is retained.

## Examples rejected or qualified during review

- A band-assisted ankle mobilization was not substituted for resisted dorsiflexion.
- Fast cable knee drives were not adopted as a speed prescription; the chosen clip retains a controlled-march limitation.
- A low-pulley rotating row was rejected in favor of a torso-height standing single-arm row.
- Foam-pad balance was not substituted for the round inflatable-cushion exercise.
- The seated hold demo adds dumbbells; load remains subject to individual review.
- Provider instructions for plantar fasciitis, sports performance or general strength do not become postoperative Achilles progression rules.

## Files and validation

Curated source: src/data/referenceDemos.js. Integration: src/data/researchExercises.js, src/data/equipmentContext.js and src/components/ExerciseLibrary.tsx. The research generator preserves the curated overlay. Regression tests verify demo metadata, unchanged research claims, no automatic scheduling, no swap eligibility, and visible equipment caveats.

Final validation: 141 unit tests passed; 57 browser checks passed; TypeScript and production/PWA builds passed. The existing large-bundle advisory remains non-blocking.

## Upload

Use the complete 1.6.1 ZIP in place of the previous package. Extract it, copy its contents into the cloned GitHub repository, commit and push in GitHub Desktop, then wait for the deployment workflow to succeed. This package has not been pushed or deployed by the assistant.
`;
writeFileSync('docs/REFERENCE_DEMO_REVIEW_2026-09-17.md',text);
console.log(`Audited ${entries.length} reference entries.`);
