# Design refinement release

This cumulative package contains the application source, all existing exercise artwork, documentation, tests and GitHub Pages workflow. It replaces the previous session-corrections package. Extract its contents into the cloned repository root, preserve the .git folder, commit the changes in GitHub Desktop and push. Wait for Test and deploy GitHub Pages to succeed before reviewing the live site. Do not upload the ZIP itself as the website.

## Implemented

- Today combines status and next action, separates current symptoms from a previous session awaiting review, and discloses supporting details.
- Workout uses a compact timer/progress area with its first logging row visible at 390 x 844. Demos, swaps, inline entries and first-set feedback carry remain available.
- Library has its own title, search near the top and collapsible categories/filters.
- Shared typography, native fields, tabular figures, surfaces, action hierarchy and opaque navigation use the existing tokens.
- Plan adds recognizable date rows and Today emphasis. Tests shows the assessment month in readable language.
- Progress promotes recorded chart values and monthly comparison tables, distinguishes missing observations from zero, and uses scrolling destination controls.
- Session history shares view, edit and coaching-export controls across Plan and Progress.
- Exercise images open in a native modal; closing restores focus, logging data and timer state.
- Welcome restores the original basketball-shooting hero artwork at the user's request; the updated layout and live controls remain. Today photographs retain their natural aspect ratio with branding below the image.
- Desktop deliberately retains the approved centered 720px shell. No separate desktop data store or application is introduced.
- Existing capability milestone presentation and shared icon set are retained. No clinical thresholds or clearance model were changed for this release.

## Validation

- TypeScript and production build passed.
- Unit tests: 111 passed, 0 failed.
- Application browser checks: 37 passed.
- Illustration browser checks: 20 passed.
- Automated checks include narrow/enlarged-text layouts, desktop reflow, offline behavior, storage/restore, editing, red-state overrides and illustration focus restoration.
- Mobile keyboard behavior on a physical phone is still a recommended post-upload check; desktop browser automation does not fully reproduce an iOS/Android keyboard.
- Vite reports a non-blocking main-bundle size warning. No new image files or framework dependencies were introduced.

## Preview

See artifacts/design-workout-mobile.png and artifacts/design-today-390.png for phone views, and artifacts/design-today-1440.png for desktop. Screenshots contain disposable test records, not the user's stored training history.

## Assumptions and approval

The agreed responsive design uses one local-first app on phone and desktop. Existing source photographs are shown uncropped; this does not recreate anatomy outside the original image frame. Optional animations and new progress rings were not added. No further approval is required for these changes. Publishing has not been performed by this release package.

## Files changed relative to the previous complete package

- `artifacts/browser-qa-results.json`
- `artifacts/calf-assisted-library.png`
- `artifacts/calf-bent-standing-library.png`
- `artifacts/calf-dumbbell-single-library.png`
- `artifacts/calf-isometric-single-library.png`
- `artifacts/calf-seated-single-library.png`
- `artifacts/calf-smith-library.png`
- `artifacts/coaching-review.png`
- `artifacts/companion-measurements.png`
- `artifacts/companion-today.png`
- `artifacts/completed-session-editor.png`
- `artifacts/design-browser.txt`
- `artifacts/design-illustrations.txt`
- `artifacts/design-tests.txt`
- `artifacts/design-today-1440.png`
- `artifacts/design-today-320.png`
- `artifacts/design-today-390.png`
- `artifacts/design-workout-mobile.png`
- `artifacts/illustration-batch2-hamstring.png`
- `artifacts/illustration-batch3-library-barbell-shrug.png`
- `artifacts/illustration-batch3-library-bent-over-dumbbell-triceps-kickback.png`
- `artifacts/illustration-batch3-library-dumbbell-goblet-squat.png`
- `artifacts/illustration-batch3-library-dumbbell-squat.png`
- `artifacts/illustration-batch3-library-supine-band-clam.png`
- `artifacts/illustration-batch4-library-band-pull-apart.png`
- `artifacts/illustration-batch4-library-bent-over-dumbbell-reverse-fly.png`
- `artifacts/illustration-batch4-library-lying-floor-leg-raise.png`
- `artifacts/illustration-batch4-library-side-plank.png`
- `artifacts/illustration-batch4-library-stability-ball-wall-squat.png`
- `artifacts/illustration-batch5-library-dead-bug.png`
- `artifacts/illustration-batch5-library-single-leg-foam-pad-balance.png`
- `artifacts/illustration-batch5-library-stability-ball-plank.png`
- `artifacts/illustration-batch5-library-straight-arm-cable-pulldown.png`
- `artifacts/illustration-batch5-library-superman.png`
- `artifacts/illustration-batch6-library-barbell-glute-bridge.png`
- `artifacts/illustration-batch6-library-foam-pad-balance-with-head-turns.png`
- `artifacts/illustration-batch6-library-seated-band-knee-extension.png`
- `artifacts/illustration-batch6-library-smith-shrug.png`
- `artifacts/illustration-batch6-library-treadmill-walking.png`
- `artifacts/illustration-final-90-90-hip-switches.png`
- `artifacts/illustration-final-band-hamstring.png`
- `artifacts/illustration-final-belt-squat.png`
- `artifacts/illustration-final-bench-step-up.png`
- `artifacts/illustration-final-bridge.png`
- `artifacts/illustration-final-cable-pallof-press.png`
- `artifacts/illustration-final-controlled-step-down.png`
- `artifacts/illustration-final-knee-to-wall-dorsiflexion-mobility.png`
- `artifacts/illustration-final-library-barbell-back-squat.png`
- `artifacts/illustration-final-library-barbell-bench-press.png`
- `artifacts/illustration-final-library-barbell-deadlift.png`
- `artifacts/illustration-final-library-barbell-hip-thrust.png`
- `artifacts/illustration-final-library-bosu-tall-plank-circles.png`
- `artifacts/illustration-final-library-bosu-tall-plank.png`
- `artifacts/illustration-final-library-cable-external-rotation.png`
- `artifacts/illustration-final-library-cable-face-pull.png`
- `artifacts/illustration-final-library-cable-hip-abduction.png`
- `artifacts/illustration-final-library-cable-reverse-fly.png`
- `artifacts/illustration-final-library-cable-wood-chop.png`
- `artifacts/illustration-final-library-chest-dip.png`
- `artifacts/illustration-final-library-close-grip-dumbbell-press.png`
- `artifacts/illustration-final-library-dumbbell-bulgarian-split-squat.png`
- `artifacts/illustration-final-library-dumbbell-fly.png`
- `artifacts/illustration-final-library-dumbbell-pullover.png`
- `artifacts/illustration-final-library-dumbbell-reverse-lunge.png`
- `artifacts/illustration-final-library-kneeling-cable-crunch.png`
- `artifacts/illustration-final-library-lying-dumbbell-triceps-extension.png`
- `artifacts/illustration-final-library-overhead-rope-cable-triceps-extension.png`
- `artifacts/illustration-final-library-seated-band-ankle-eversion.png`
- `artifacts/illustration-final-library-seated-band-ankle-inversion.png`
- `artifacts/illustration-final-library-smith-bent-over-row.png`
- `artifacts/illustration-final-library-smith-deadlift.png`
- `artifacts/illustration-final-library-smith-incline-bench-press.png`
- `artifacts/illustration-final-library-smith-seated-shoulder-press.png`
- `artifacts/illustration-final-library-smith-wide-stance-squat.png`
- `artifacts/illustration-final-library-stability-ball-crunch.png`
- `artifacts/illustration-final-library-stability-ball-dead-bug.png`
- `artifacts/illustration-final-library-stability-ball-hamstring-curl.png`
- `artifacts/illustration-final-library-stability-ball-stir-the-pot.png`
- `artifacts/illustration-final-library-standing-cable-fly.png`
- `artifacts/illustration-final-library-standing-cable-hamstring-curl.png`
- `artifacts/illustration-final-library-stationary-cycling.png`
- `artifacts/illustration-final-library-trap-bar-deadlift.png`
- `artifacts/illustration-final-library-two-arm-cable-lateral-raise.png`
- `artifacts/illustration-final-suitcase-carry.png`
- `artifacts/illustration-final-supported-hip-airplane.png`
- `artifacts/illustration-final-weighted-wagon-backward-drag.png`
- `artifacts/illustration-large-text.png`
- `artifacts/illustration-mobility-detail.png`
- `artifacts/illustration-strength-detail.png`
- `artifacts/illustration-strength-thumbnail.png`
- `artifacts/readable-coaching-review.png`
- `artifacts/readable-next-morning.png`
- `artifacts/workout-duration.png`
- `artifacts/workout-feedback.png`
- `artifacts/workout-illustration.png`
- `artifacts/workout-swap.png`
- `artifacts/workout-thumbnail.png`
- `docs/DESIGN_REFINEMENT_RELEASE.md`
- `scripts/browser-qa.mjs`
- `scripts/illustration-browser-qa.mjs`
- `src/components/AssessmentProgress.tsx`
- `src/components/CoachingReview.tsx`
- `src/components/DailyBrand.tsx`
- `src/components/ExerciseIllustration.tsx`
- `src/components/ExerciseLibrary.tsx`
- `src/components/TrainingOverview.tsx`
- `src/data/displayDates.js`
- `src/design-refinement.css`
- `src/main.tsx`
- `src/screens/History.tsx`
- `src/screens/MoreScreen.tsx`
- `src/screens/PlanScreen.tsx`
- `src/screens/TestsScreen.tsx`
- `src/screens/Today.tsx`
- `src/screens/Welcome.tsx`
- `src/screens/Workout.tsx`
- `src/styles.css`

## Welcome image preference update

Restored public/assets/hero-reference.png in src/screens/Welcome.tsx. The original artwork includes its own branding and phone mockups; this user preference supersedes the prior photograph-only treatment. TypeScript and production build passed after this one-image change. The full regression results above apply to the preceding design release.
