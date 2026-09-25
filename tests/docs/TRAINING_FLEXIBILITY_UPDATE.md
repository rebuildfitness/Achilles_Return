# Training flexibility — user-requested September 12, 2026 extension

This implements the user's nine-item change request. The approved clinical entry criteria, exposure ladders, red-flag precedence, rehab blocks and next-morning strength progression requirements remain in force. The user confirmed a Major Fitness B-52 all-in-one rack with safeties, attachments and cable stacks, 50 lb maximum dumbbells, a 225 lb belt-squat limit and a 45 lb Olympic bar.

## What changed

1. Today and Plan provide a Move an unfinished workout control. Select a missed/recent unfinished strength session and a later date within the next seven days. Later scheduled strength sessions shift as needed to retain a recovery day between strength sessions. Completed workouts cannot be moved or duplicated. A missed workout is not a second workout on a completed day. Check-in and reassessment requirements still apply.
2. Recovery and mobility activity logs appear on Today and beneath the selected date in Plan. They record actual activity independently of strength completion.
3. Activity presets include 5,000 / 8,000 / 10,000 steps and 10 / 15 / 20 / 25 / 30 minutes of indoor cycling. Cycling supports optional distance with explicit miles/km. Mobility/core checkboxes have individual demo links. Free-text details support other activities and symptoms.
4. Every fresh page load opens the approved hero. Get Started continues to Today; the explicit Restore Backup action remains available. Switching tabs or returning to an already open page does not restart onboarding or erase a draft.
5. Workout exercise details show the latest tolerated load, when available. Otherwise they explain how to establish a submaximal starting load with warm-up sets and target RPE, without inventing a pound value or 1RM. Different exercise IDs maintain separate histories.
6. Cadence and the existing double-progression decision are visible on each exercise. Progression requires completed target sets, quality, recorded effort, symptoms and next-morning tolerance. General resistance-training guidance does not grant Achilles clearance.
7. Press and squat progression routes explicitly include Smith and rack-supported Olympic-bar alternatives. Reaching a capacity limit prompts a variation review, not an automatic switch or pound-for-pound conversion. Completion above the known dumbbell/belt capacity is rejected. Band resistance is described as variable; no arbitrary band-to-pound conversion or banded heavy-press prescription is invented.
8. Reviewed alternatives are selectable for presses, rows, hinges, squats, hamstring curls, arm accessories and core. Choices persist to future plans and keep the original slot's sets/reps. A completed exercise cannot be replaced mid-session. Alternatives use owned equipment and retain demos; yellow days still modify the chosen variation. Injury-related choices include stop/restriction guidance and do not diagnose or clear a new injury. Calf/impact progressions remain under their clinical rules.
9. Standing Pallof work and seated core marching have demos and logging. Seated core is added to the expanded Strength C accessory block and is available as a core alternative and recovery activity.

## Storage and architecture

- `src/rules/trainingFlexibility.js`: deterministic rescheduling, reviewed alternatives and load guidance.
- Profile `scheduleMoves` and `exerciseChoices` preserve scheduling and movement choices. Completed session `plannedItems` retain the actual variation.
- Settings records `recovery-YYYY-MM-DD` store recovery entries with IDs, units, notes and timestamps. They are included in existing JSON backups and do not count as strength sessions or confer progression credit.
- Existing IndexedDB stores and schema version are preserved; no data reset or backend.
- The training-break reassessment check now recognizes a recent reassessment for the following make-up day rather than requiring another assessment every day before training resumes.

## Sources and limits

- [Major Fitness B52 manufacturer overview](https://www.majorfitness.com/pages/major-fitness-smith-machine-spirit-b52): rack/safety setup. Model variants differ; no particular stack ratio or effective Smith bar weight is assumed.
- [ACSM resistance-training update](https://acsm.org/resistance-training-guidelines-update-2026/): general strength context. The app retains its approved rehabilitation dose/effort rules.
- [Prehab seated march](https://library.theprehabguys.com/vimeo-video/seated-march/).
- [Prehab seated thoracic mobility](https://library.theprehabguys.com/vimeo-video/seated-mobility-drill-for-your-thoracic-spine/).
- [Barbell bench demo](https://www.muscleandstrength.com/exercises/barbell-bench-press.html) and [back-squat demo](https://www.muscleandstrength.com/exercises/squat.html).

Provider pages were checked September 12, 2026. External playback can change and needs internet. These are exercise demonstrations, not individual medical clearance. Recovery presets are recording shortcuts, not prescribed step or duration targets. Automated injury-specific exercise selection and automatic equipment changes are intentionally not inferred from load alone.

## Files changed

App.tsx; types.ts; components/RecoveryLog.tsx, RescheduleWorkout.tsx, ExerciseGuidance.tsx; screens/Program.tsx, Workout.tsx; data/catalog.js, exerciseLibrary.js; rules/planner.js, response.js, trainingFlexibility.js; tests/exercise-library.test.mjs, training-flexibility.test.mjs; scripts/browser-qa.mjs; README.md; this document and the generated equipment exercise inventory.

Validation: full Node tests, TypeScript/production build and isolated browser QA, including recovery persistence, exercise-swap persistence, next-day make-up access, every-launch hero, offline behavior and existing rehab flows. See artifacts/browser-qa-results.json for the latest completed run.
