# Workflow clarity and equipment update — 1.3.1

## Four approved improvements

1. **Library entry and empty states.** With no prescribed exercises, the library opens to All exercises. Favorites, an empty plan and unmatched filters explain their own empty state. The library subtitle now describes its purpose.
2. **Measurements and assessments.** Tests explains that journal entries are observations, not automatic criteria updates. Review results in assessment opens the existing assessment flow. In Optional tests (or the heel-rise/balance sections of the detailed assessment), review saved measurements. Copying a heel-rise repetition count or balance duration requires explicit date/side/setup confirmation and an exact assessment-date match. Zero is preserved. The source journal record stays intact, only the draft is filled, and quality/safety answers are never inferred. Other measurements remain available as references for manual entry because their setup needs additional details. Save the complete assessment before its results affect the plan.
3. **Workout comparison.** Today’s dose and the date/status of the last recorded session are visible above set fields. Prior completed set values are shown even when their next-day response is pending, clearly labeled as such; the clinical progression engine is unchanged. Today/future and unfinished sets are excluded from the comparison. Machine, dumbbell, Smith, Olympic-bar and landmine load conventions are explicit.
4. **Guided daily review.** When a response is outstanding, Check In opens that review first and then today’s check-in. The forms save separate records, without copying answers or presuming tolerance. Check today’s symptoms first remains available immediately. Leaving after the response keeps that saved response but does not fabricate a daily check-in. Today’s baseline prompt now matches its primary action.

## Equipment and exercise library

User-confirmed equipment: landmine station and Major Fitness rack-mounted leg extension/multifunctional pad. Existing profiles receive these once, additively; later deselection is respected. New profiles include them in the equipment list.

New reference exercises, each with a demo link:

- Half-kneeling landmine shoulder press
- Landmine squat
- Landmine Meadows row
- Rack-mounted cable leg extension
- Rack-mounted chest-supported cable row
- Rack-mounted seated lat pulldown

These are library references, not automatic additions to prescribed sessions or new rehabilitation clearance criteria. Existing reviewed swap families are unchanged. The rack attachment is not treated as a standalone leg-extension machine or a leg press. No attachment load capacity or additional unconfirmed handles have been assumed. New illustrations have not been generated for these six entries; their demos remain available. All 134 existing illustrations are retained.

## Sources and setup

- [Major Fitness product and compatibility](https://www.majorfitness.com/products/rack-mounted-leg-extension): B52 compatibility, supported pad uses, and the instruction to counterweight the rear of the rack. This requirement is included in each rack exercise setup.
- The rack entries link to the manufacturer’s short attachment demonstration embedded on that product page. It covers multiple supported uses, rather than three separately filmed clips.
- [Landmine shoulder press](https://library.theprehabguys.com/vimeo-video/half-kneeling-landmine-shoulder-press/)
- [Landmine squat](https://library.theprehabguys.com/vimeo-video/squat-landmine/)
- [Landmine Meadows row](https://library.theprehabguys.com/vimeo-video/landmine-meadow-row/)

Provider pages and the manufacturer media URL were checked; playback/access can change. No proprietary videos were downloaded into this app. Landmine loads are added plates at the free end with bar/setup noted, not interchangeable with barbell load. Cable loads are the machine’s stack setting.

## Validation and release

TypeScript and Vite production build pass. Unit tests: 115 passed, 0 failed. Browser checks: 37 existing checks plus 5 focused workflow checks passed. The focused checks cover populated default library, equipment migration/deselection, separate response/check-in records and explicit zero-value measurement transfer without assessment mutation. The first logging row still fits at 390 x 844. CI now runs both browser suites.

The build retains the existing non-blocking JavaScript bundle-size warning. Physical-phone keyboard behavior and external-video playback remain device-dependent checks. No clinical thresholds were changed. No additional approval is required. This is a cumulative source package for your existing GitHub Pages workflow; it has not been pushed or deployed.

Preview images: artifacts/workflow-new-equipment.png, artifacts/workflow-guided-checkin.png and artifacts/design-workout-mobile.png. They use disposable test data.

Upload: extract the complete package into your cloned repository root, preserve .git, commit and push through GitHub Desktop. Wait for the GitHub Actions deployment to pass, then use the app’s Update & reload prompt. Do not clear site data.

## Files changed from the preceding complete package

- `AGENTS.md`
- `README.md`
- `artifacts/companion-measurements.png`
- `artifacts/design-workout-mobile.png`
- `artifacts/illustration-audit-results.json`
- `artifacts/workflow-browser-results.json`
- `artifacts/workflow-browser.txt`
- `artifacts/workflow-guided-checkin.png`
- `artifacts/workflow-illustration-audit.txt`
- `artifacts/workflow-new-browser.txt`
- `artifacts/workflow-new-equipment.png`
- `artifacts/workflow-tests.txt`
- `artifacts/workout-feedback.png`
- `artifacts/workout-illustration.png`
- `artifacts/workout-swap.png`
- `artifacts/workout-thumbnail.png`
- `docs/EQUIPMENT_EXERCISE_LIBRARY.md`
- `docs/FULL_BODY_STRENGTH_UPDATE.md`
- `docs/VIDEO_CATALOG.md`
- `docs/WORKFLOW_AND_EQUIPMENT_UPDATE.md`
- `package.json`
- `public/assets/exercises/manifests/exercise-illustration-inventory.csv`
- `public/assets/exercises/manifests/exercise-illustrations.json`
- `public/assets/exercises/manifests/unresolved-exercise-assets.md`
- `scripts/browser-qa.mjs`
- `scripts/workflow-browser-qa.mjs`
- `spec/rehab-plan-v1.json`
- `src/App.tsx`
- `src/components/AssessmentMeasurementReview.tsx`
- `src/components/ExerciseLibrary.tsx`
- `src/components/MeasurementJournal.tsx`
- `src/components/ui.tsx`
- `src/data/catalog.js`
- `src/data/equipmentUpdate.js`
- `src/data/exerciseLibrary.js`
- `src/data/measurementReview.js`
- `src/data/newEquipmentExercises.js`
- `src/data/workflowClarity.js`
- `src/persistence/repository.ts`
- `src/persistence/schema.js`
- `src/screens/Baseline.tsx`
- `src/screens/CheckIn.tsx`
- `src/screens/MoreScreen.tsx`
- `src/screens/ResponseScreen.tsx`
- `src/screens/SimpleBaseline.tsx`
- `src/screens/TestsScreen.tsx`
- `src/screens/Today.tsx`
- `src/screens/Workout.tsx`
- `src/types.ts`
- `tests/exercise-library.test.mjs`
- `tests/workflow-clarity.test.mjs`
