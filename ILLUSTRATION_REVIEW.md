# Illustration batch 4 — complete source package

September 13, 2026. This package supersedes prior upload packages and contains the complete app, all previous artwork and the mobile-thumbnail optimization.

## New illustrations

| Exercise | Fictional model brief |
|---|---|
| Band pull-apart | East Asian woman |
| Side plank | South Asian / Indian man |
| Stability-ball wall squat | Middle Eastern woman |
| Bent-over dumbbell reverse fly | White man |
| Lying floor leg raise | Latino man |

Each model is consistent across the two panels. The five final 640 × 960 PNGs were individually visually inspected. Each also has a 192 × 288 thumbnail; browser screenshots verify their card and enlarged views. Built-in generation prompts and master paths are recorded in artifacts/illustration-reviews.json. Pillow only normalizes/resizes the reviewed artwork.

## Coverage and sizes

70 of 127 canonical IDs illustrated; 57 unresolved (49 ungenerated and 8 rejected drafts). Thumbnails do not count as additional exercises. There are 21 shared collection appearances; each canonical ID shares one original and one thumbnail. Full unresolved IDs, names, sources and reasons remain in public/assets/exercises/manifests/unresolved-exercise-assets.md.

Full artwork totals 14,077,290 bytes. Mean 201,104; median 201,007.5; largest library-supine-band-clam.png at 248,392 bytes. No original exceeds 250 KB or 400 KB. Thumbnails total 1,326,053 bytes and average 18,944 bytes, about 91% smaller.

Motion formats: 37 concentric/eccentric, 21 start/end, 12 setup/hold. Fictional model presentation: 33 women and 37 men; Black 61, White 2, East Asian 2, South Asian/Indian 2, Middle Eastern 2, Latino 1. These reflect the creative briefs, not inferred identities of real people.

Initial offline download remains approximately 2.8 MB. Exact final measurements are in artifacts/illustration-audit-results.json. Both image sizes cache on demand: thumbnails as cards are browsed, originals after Enlarge. Offline availability depends on which size has loaded; each offers its own retry. App updates or browser cache eviction may require downloading again. External demos are not cached. Total source ZIP size is not the initial app download.

## Validation

87 Node tests passed; 0 failed or skipped. 39 browser checks passed: 23 existing app checks and 16 illustration checks. TypeScript and build passed. The preexisting Vite large-chunk warning is nonfatal. Existing dependencies and lockfile were unchanged.

Checks include all five new thumbnails and enlarged images, original demos, card/full-image request separation, offline loading/retries, narrow layouts, keyboard interaction, update behavior and record preservation. The side-plank and wall-squat mobile screenshots were visually inspected. Tests use disposable Edge profiles. Physical iPhone and live Pages deployment were not tested.

## Upload and preview

Extract the latest ZIP and upload its contents into the repository root, preserving folders including .github and replacing matching files. Do not upload the ZIP itself or nest the files inside another folder. Skip older packages; this one includes them. Wait for the deployment workflow to pass, then accept Update & reload in the app if shown. Do not clear your browser data.

Local preview: pnpm build, then pnpm preview --port 4180. Open http://127.0.0.1:4180/ → Get Started → More → Exercise library. Search any new exercise and select Enlarge.

No remote push, deployment or PR was performed. Prepared on feature/full-exercise-illustration-library; GitHub authentication remains unavailable for PR publication.

## Changed files and preserved behavior

- Five new full PNGs in public/assets/exercises/strength-library/ and five matching files in thumbnails/.
- Regenerated manifest, inventory CSV and unresolved list.
- artifacts/illustration-reviews.json: prompts, source paths, representation and visual review.
- scripts/illustration-browser-qa.mjs: checks all five additions and uses another unresolved exercise for fallback coverage.
- artifacts/illustration-batch4-*.png and result/audit JSON: review evidence.
- This guide and the current asset audit: coverage, validation and complete-upload instructions.

Source inventory remains src/data/catalog.js, src/data/exerciseLibrary.js and src/data/movementRoutines.json: 21 prescribed, 93 strength appearances including those 21, and 34 movement entries. Illustrated primary ownership is 15 prescribed, 26 strength-library, 29 movement-library. Sport groups without canonical exercise IDs remain unresolved scope boundaries.

Clinical rules, restrictions, progression, prescribed-session authority, original demo metadata, IndexedDB records and backup schemaVersion 2 were unchanged. Thumbnail dimensions and approved on-demand caching behavior were preserved. Earlier batch documents are historical; this guide and the current machine-readable audit describe the latest package.
