# Essential and Full rehab sessions — 1.12.0

## Using the update
Open the scheduled Achilles Rehab & Conditioning workout. Choose Essential or Full in the Rehab session choice card. Session options shows estimates for both. Your choice saves on this device and survives reload.

Essential retains the warm-up, prescribed primary calf and soleus work, step-ups, bridge/selected alternative, hamstring work, trunk work, squat/selected BOSU variation, balance/selected pad variation, and prescribed conditioning. The existing impact exposure replaces cycling when assigned. It does not add another finisher.

Full also displays six supplementary entries when eligible: additional bilateral calf strength, Circuit A toe walking, forward/backward balance reach, multidirectional reach, lateral step-ups, and repeated Circuit C toe walking. This classification is a user-approved product arrangement of the documented templates, not a newly validated clinical protocol. It builds on the original dedicated rehab core and retains the later squat and hamstring blocks.

The exact list is versioned in spec/rehab-session-options-v1.json. Unrecognized exercises default to retained. Swaps follow their original slot. Any exercise with entered data remains visible even if supplementary. Full restores all exercises. Switching modes clears display-only block/round filters, without changing logs.

## Doses, time and history
Retained exercises keep their current sets, reps, rest, readiness reductions and progression requirements. Essential is shorter because supplementary exercises are omitted, not because calf loading is rushed. Times remain estimates; running/sport dose is additional where indicated. There is no guaranteed 40-minute duration.

The original plan is retained. Omitted exercises remain uncompleted and contribute no set evidence to progression. Finish review and coaching export record the chosen option and arrangement version. Next-morning tolerance is still required.

The visible order remains the approved warm-up, circuits A/B, balance/control C, then conditioning. Existing round views, rest timer, activity timers and progression explanations remain available.

## Changed files
- spec/rehab-session-options-v1.json — versioned supplementary exercise mapping and source documents.
- src/data/sessionPresentation.js — essential filtering, including original-slot swaps and started-entry preservation.
- src/screens/Workout.tsx — Essential/Full controls, estimates, exercise labels and sequence.
- src/App.tsx; src/types.ts — additive saved option metadata.
- src/components/SessionReview.tsx; src/data/coachingReport.js — readable Essential labels and export metadata.
- package.json; src/persistence/schema.js — app version 1.12.0; database/clinical versions unchanged.
- tests/essential-rehab.test.mjs — core preservation, actual shorter estimate, swaps, readiness and no progression from omission.
- scripts/unified-session-browser-qa.mjs — essential/full switching, count, reload, offline finish and saved omissions.
- This document and generated QA artifacts.

## Upload
The complete 1.12.0 ZIP includes prior updates and illustrations. Extract into the cloned repository, preserving its .git folder, then commit and push through GitHub Desktop. GitHub Actions builds and deploys the site. This task does not publish the update or change live user data.

## Verification
171 unit tests and 72 browser checks passed, zero failures. TypeScript, production build and service-worker generation passed. The existing large JavaScript bundle advisory remains. The tested raw template estimates Full at 80–100 minutes and Essential at 55–75 minutes; the live equipment/readiness/exposure-adjusted estimate may differ.
