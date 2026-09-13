# Mobile illustration thumbnails

This complete source package supersedes the prior Batch 3 package. Upload only this latest package, preserving folders and replacing matching files.

All 65 reviewed illustrations now have a separate 192 × 288 grayscale PNG thumbnail. The existing 640 × 960 PNG loads only after Enlarge is selected. Thumbnails average 19,008 bytes versus 201,367 bytes for full-size artwork: approximately 91% less image data while browsing. Across the library, thumbnails total 1,235,506 bytes. Full artwork totals 13,088,860 bytes. Coverage remains 65 of 127 canonical exercises, with 62 unresolved; thumbnails are not counted as new exercise coverage.

Both sizes cache on demand. A cached thumbnail does not imply the full image is available offline. When a larger image has not been downloaded, its fallback keeps the thumbnail and offers Retry larger image. App updates or browser eviction can clear either cached size. External demos remain internet-dependent.

Initial core download is approximately 2.80 MB. The complete upload ZIP is larger because it includes both image sizes and source/review files; ZIP size is not the app installation download. Exact measurements are in artifacts/illustration-audit-results.json.

## Validation

87 Node tests and 38 browser checks passed (23 existing, 15 illustration checks). TypeScript and production build passed. Browser tests verify no full-size request before Enlarge, separate 192px and 640px dimensions, offline use, independent full-image retry, layout, demos and record preservation. Strength and movement card screenshots were visually inspected. Original full-size images were preserved without edits. Physical iPhone/live deployment remain untested. The existing Vite chunk-size warning is nonfatal.

## Files and maintenance

- public/assets/exercises/thumbnails/: 65 derived PNGs, sharing the original exercise IDs.
- scripts/build-illustration-thumbnails.py: reproducibly derives thumbnails from reviewed full-size PNGs using Pillow; it does not generate new artwork.
- scripts/inventory-illustrations.mjs: records separate thumbnail path, dimensions and bytes.
- src/data/illustrationPaths.js and src/components/ExerciseIllustration.tsx: separate card/detail sources and failures.
- scripts/build-sw.mjs: excludes both sizes from initial caching and allowlists both for on-demand caching.
- scripts/audit-illustrations.mjs: reports core, full-size and thumbnail bytes separately.
- tests/illustrations.test.mjs and scripts/illustration-browser-qa.mjs: verify both sizes and network behavior.

For future artwork, normalize reviewed masters, run python scripts/build-illustration-thumbnails.py, then node scripts/inventory-illustrations.mjs before building. Keep one thumbnail per illustrated canonical ID. No clinical rules, prescribed workouts, demo metadata, IndexedDB records or backup formats changed.

Preview: pnpm build, then pnpm preview --port 4180. Open http://127.0.0.1:4180/ → Get Started → More → Exercise library. Tap Enlarge on an illustrated card. Do not clear live browser storage when installing an update.
