Current mobile-thumbnail update: each of the 65 full-size illustrations has a separate 192 x 288 PNG preview. Cards load previews; Enlarge loads the 640 x 960 original. Thumbnails average 19 KB (91% smaller). Both sizes cache on demand. See MOBILE_THUMBNAILS.md and the current machine-readable audit. Validation: 87 Node tests and 38 browser checks passed.

# Illustration batch 3 — complete source upload package

September 13, 2026. This package includes all previous source files and 65 reviewed illustrations for 127 canonical exercise IDs. 62 illustrations remain unresolved (54 ungenerated, 8 rejected drafts).

New artwork: Barbell shrug (White woman), Dumbbell goblet squat (East Asian man), Dumbbell squat (South Asian/Indian woman), Bent-over dumbbell triceps kickback (Middle Eastern man), Supine band clam (Black woman). These are fictional model briefs, following the user's expanded representation request. The same model appears in both panels.

## Approved offline behavior

The user approved downloading illustrations when viewed. The app shell and logging still install for offline use immediately. Only successful bundled PNG responses are cached; external demos are not cached. Viewed images work offline. Unviewed images need internet; the fallback preserves setup/demo actions and offers Retry. App updates replace the build cache, so images may need downloading again after an update; browser storage eviction can also remove them.

The former eager payload was 15,854,059 bytes. The new initial payload is approximately 2.80 MB; exact current measurements are in artifacts/illustration-audit-results.json. All 13,088,860 bytes of PNG assets remain in the source package. Lazy image loading may fetch nearby cards as you scroll.

## Upload

Extract the complete ZIP and upload its contents into the repository root, preserving folders including .github and replacing matching files. Do not upload the ZIP itself or create a nested package folder. Commit and wait for the deployment workflow to pass. After deployment, accept Update & reload if shown. Do not clear app storage or delete your records.

This work has not been deployed or pushed remotely. A PR was not published because GitHub authentication is unavailable.

## Preview and verification

Run pnpm install --frozen-lockfile, pnpm build, then pnpm preview --port 4180. Open http://127.0.0.1:4180/ and navigate Get Started → More → Exercise library. Search one of the new names and tap Enlarge. This preview origin has separate local records.

Frozen install, TypeScript and build passed. 87 Node tests, 23 existing browser checks and 15 illustration browser checks passed. The existing Vite large-chunk warning is nonfatal. Disposable Edge tests covered mobile layout, enlargement, demos, installation without images, viewed images offline, unviewed-image fallback/retry and update/data preservation. Physical iPhone and live Pages deployment remain untested.

## Files and purpose

- public/assets/exercises/: 65 individual 640 × 960 monochrome PNGs plus the full manifest, CSV and unresolved list.
- src/components/ExerciseIllustration.tsx: shared thumbnail/detail, offline explanation and Retry.
- scripts/build-sw.mjs and sw.js: separate initial core assets from allowlisted on-demand illustrations.
- scripts/inventory-illustrations.mjs: per-image fictional model representation metadata.
- scripts/audit-illustrations.mjs: measures actual core manifest bytes separately from all production assets.
- tests/illustration-cache.test.mjs: verifies reuse offline and rejection of failed/non-image responses.
- scripts/illustration-browser-qa.mjs: library and offline behavior checks.
- artifacts/illustration-reviews.json: built-in generation prompts, original master paths and final review notes.
- artifacts/illustration-batch3-*.png: mobile review screenshots.
- artifacts/illustration-audit-results.json: final measured coverage, size and representation counts.

Clinical rules, restrictions, progression, prescribed workouts, original demo metadata, IndexedDB records and backup schemaVersion 2 were preserved.
