# Exercise library and artwork update — 1.6.0

## What changed

Added the 21 researched candidates to the searchable exercise library, including tibialis raises, foot control, dorsiflexion, eccentric calf work, TKE, hip cable work, carries, hinges and upper-body options. They support search, equipment filtering, favorites, setup guidance and enlarged illustrations.

These are **reference-only additions**: they are not available as workout swaps and are not automatically programmed. No doses, progression thresholds or clinical clearance have been invented. Exact video playback remains unverified; checked written guides are labeled Exercise guide rather than Short Demo. Original research and source metadata remain in docs/research/exercise-followup and spec/exercise-additions-sources-v1.json.

Added 31 images and 31 thumbnails: 21 new candidates, six existing landmine/rack exercises, and four equipment references. The complete manifest now covers 165 IDs. The two belt-squat additions and three sled references use clearly labeled movement concepts pending setup review. Backward treadmill walking has an equipment-only image; it remains deferred. Illustrations do not verify manufacturer setup or clinical readiness.

Images are 640 × 960 PNGs; list thumbnails are 192 × 288. They download on demand and become available offline after loading. Built-in imagegen was used. Selected asset filenames and generation briefs are recorded in ARTWORK_BATCH_2026-09-16.json alongside the research handoff. Rejected hardware drawings were excluded.

## Find the additions

Open More → Exercise library → All exercises. Search for “tibialis”, “toe yoga”, “cable hip adduction” or another exercise. Tap Enlarge to inspect the image. Your existing prescribed plan is unchanged.

## Validation

- 139 unit tests passed; zero failed.
- 57 browser checks passed; zero failed.
- TypeScript check, Vite production build and service-worker generation passed.
- Vite reports a non-blocking bundle-size warning.
- Browser checks use disposable profiles, not your stored workout history.

## Files changed in this update

- src/data/researchExercises.js: the 21 reference entries and research provenance.
- src/data/exerciseLibrary.js: include entries and search aliases.
- src/components/ExerciseLibrary.tsx: written-guide links and clear reference/setup status.
- src/components/ExerciseIllustration.tsx: guidance appropriate to active and reference content.
- public/assets/exercises/manifests/exercise-illustrations.json: artwork records and review status.
- public/assets/exercises/strength-library and thumbnails: 62 new PNG files.
- spec/exercise-additions-sources-v1.json: preserved source records.
- scripts/prepare-research-library.mjs and import-research-artwork.py: reproducible content preparation and selected-image import.
- tests/exercise-library.test.mjs, illustrations.test.mjs, research-library.test.mjs: library, coverage and safety regression checks.
- scripts/browser-qa.mjs and equipment-followup-browser-qa.mjs: pagination, images, guides and favorites checks.
- package.json and src/persistence/schema.js: app 1.6.0, library 1.2.0; database and clinical ruleset versions unchanged.
- This release note and the artwork audit JSON.

## Upload

This is a full cumulative source package. Extract it, copy its contents into your cloned Achilles_Return repository, replacing matching files, then commit and push using GitHub Desktop. Do not delete the repository’s .git folder. Do not upload the ZIP itself, node_modules or dist. Wait for Test and deploy GitHub Pages to succeed. Reload the site and accept the update if prompted; More should report app version 1.6.0.

No further approval is needed to upload this library update. Enabling these references in prescribed workouts remains separate from this release.
