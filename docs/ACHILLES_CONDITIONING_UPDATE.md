# Dedicated Achilles Rehab & Conditioning — v1.7.0

## How to activate
After uploading and deploying this full package, open Today and select **Use dedicated rehab schedule** in Rehab & movement support. The selection is stored on that device. It takes effect tomorrow; the next B slot in the existing weekly schedule becomes Achilles Rehab & Conditioning. Today, its drafts and all completed records remain unchanged. The same mode is available in More → Profile & schedule → Strength training style.

This is a replacement loading day, not an extra recovery-day workout. Strength A and C retain the existing strength templates. The existing limit on loading days, recovery spacing, rescheduling and readiness modifiers still applies. With fewer available training days, the usual schedule determines which slots occur.

## Current prescribed session
1. Calf strength: the existing eligible straight-knee calf variation, 3 × 6–12, and loaded seated calf raise, 3 × 8–12.
2. Leg control: step-ups, 3 × 8/side, and bridge/hip thrust, 3 × 8–12. Alternate one set of each per round, taking the prescribed rest or longer as needed.
3. Balance and trunk: single-leg balance, 2 × 30–60 seconds, and Pallof press, 2 × 10/side.
4. Conditioning: 10 minutes comfortable, tolerated stationary cycling, recorded as actual seconds. Do not enter bike resistance as pounds.

These doses reuse approved templates; they are reduced or omitted by existing readiness, equipment and re-entry rules. Full-session estimate is approximately 55–75 minutes with warm-up, recovery and transitions, rather than a guaranteed 40 minutes. Reduced sessions can be shorter. No maximal-effort conditioning target was introduced.

## Impact coordination
An assigned progression exposure uses the existing running/sport dose ladder and logger. Its card appears inside the rehab session. Complete that exposure before saving the rehab session; save each only for work actually performed. The scheduled exposure replaces the bike block. A same-day saved exposure also prevents the bike block from returning when its next-morning response is pending. Both records retain the normal next-morning tolerance checks.

The user's report of recently completing the therapy movements with a normal next morning, and doing backward/crossover jogging on the floor, is source context only. This update does not fabricate assessment results, clinical clearance, exposure history or next-morning records from the conversation.

Backward jogging, carioca, BOSU squats, pistol squats, toe walking and the complete supplied finisher were NOT enabled wholesale. They require an existing reviewed prescription/gate or a separate dose review. Backward treadmill jogging is not prescribed. Original clinical thresholds and progression matrix are unchanged.

## Workout controls
- Full session or individual block view; All sets or a selected round. Filters never mark completion or add/remove dose.
- Overall workout and rest timers; explicit activity countdowns for timed exercises. Countdown expiration never completes a set. Activity countdowns survive same-tab refresh; overall workout timing retains its existing IndexedDB persistence.
- Existing inline logging, first-set feedback carry, reviewed swaps, exercise paths, demos and illustrations.
- Immediate coaching report with session format and template version; later next-morning updates remain supported.
- Existing backup/restore and offline behavior; no database version change.

## Files changed for this release
- src/rules/rehabConditioning.js: deterministic template and conditioning replacement.
- src/rules/planner.js: new schedule style and dated activation.
- src/App.tsx: activation, exposure navigation and saved template metadata.
- src/screens/Today.tsx: visible activation and schedule explanation.
- src/screens/MoreScreen.tsx: profile selector and effective-date persistence.
- src/screens/Workout.tsx: block/round display, activity timers and exposure card.
- src/components/TimedActivity.tsx: countdown without automatic logging.
- src/components/ExerciseGuidance.tsx: bike-specific guidance.
- src/data/coachingReport.js: session-format metadata.
- src/types.ts: optional additive metadata.
- src/persistence/schema.js and package.json: app version 1.7.0; browser suite command.
- tests/rehab-conditioning.test.mjs and scripts/rehab-conditioning-browser-qa.mjs: regression coverage.
- docs/ACHILLES_CONDITIONING_UPDATE.md and docs/WORKOUT_TEMPLATES.md: implementation and usage notes.

## Verification
147 unit/rule tests passed. 61 browser checks passed across the six application suites, including four new dedicated-session checks. TypeScript and production build passed. Existing bundle-size advisory remains non-blocking.

Preview: artifacts/rehab-conditioning-mobile.png. To preview interactively, run the normal Vite development command and activate the schedule on a test profile; completed user data does not need to be reset.

## Upload
Extract the complete ZIP into the cloned repository, replacing matching files while keeping .git. Commit and push with GitHub Desktop and wait for the deployment to succeed. No deployment was performed from this task.
