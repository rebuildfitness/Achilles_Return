# Complete exercise illustration library

All 127 canonical exercises now have artwork. This release adds the final 47 illustrations and 47 mobile previews, including the Mammoth belt squat. It includes all previous application updates and the clearer Profile wording. No earlier upload package is required.

## Assets and performance

Each original is a 640 × 960 monochrome PNG; each preview is 192 × 288. Cards request the small preview, and Enlarge requests the original. The library includes diverse fictional adult women and men. There are 127 originals and 127 previews; shared collection appearances reuse these assets.

Original images total 26,008,401 bytes, averaging 204,791 bytes; the largest is 248,392 bytes. Previews total 2,494,607 bytes, averaging 19,643 bytes (90% smaller). Initial offline precache is 2,850,912 bytes, below the approved 15 MB budget. Images cache on demand, so ZIP size is not the initial download. Previously viewed images may need downloading again after an update or cache eviction. External video demos require internet.

## Validation and review

- 88 Node tests passed, with no failures or skips.
- 42 browser checks passed: 23 application checks and 19 illustration checks.
- TypeScript and production build passed. The existing Vite large-chunk warning remains nonfatal.
- All 47 new previews and enlarged images loaded through their actual library cards. Checks cover offline behavior, missing-image recovery, keyboard access and retained records.
- All final normalized illustrations were visually inspected. Targeted corrections addressed cable routing, ankle movement, step-up positioning, split-squat equipment, bench-press bar position, hip rotation, carry panels and the belt-squat lever.

The illustrations are supplemental exercise references. The Mammoth drawing is a simplified mechanical illustration, not a manufacturer assembly diagram. No physical iPhone or live GitHub Pages deployment was tested for this package. Clinical criteria, prescriptions, logging, IndexedDB and demo links were not changed by this batch.

## Provenance

The built-in image generation tool created the illustrations; Pillow normalized PNGs and made previews. Exact generation prompts, correction prompts, source paths and review notes are preserved in artifacts/illustration-reviews.json. Raw generation drafts are not included in the upload package. Motion formats include resistance phases, movement endpoints, static setup/hold and setup/walk for the suitcase carry.

## Upload and preview

1. Extract the complete ZIP.
2. Copy its contents into your cloned Achilles_Return repository root, replacing matching files. Keep the repository's .git folder. Preserve the package's .github folder and all subfolders.
3. In GitHub Desktop, review Changes, commit, then Push origin.
4. Keep GitHub Pages Source set to GitHub Actions. Wait for Test and deploy GitHub Pages to succeed.
5. Open the site and use Update & reload if offered. Do not clear browser data, which can remove local workout records.

For a local preview, run pnpm build, then pnpm preview --port 4180. Open http://127.0.0.1:4180/, choose Get Started, then More → Exercise library. Final-batch mobile screenshots are in artifacts/illustration-final-*.png.

## Files changed

- 47 new originals in public/assets/exercises/prescribed, strength-library and movement-library; 47 new thumbnails.
- Updated exercise manifest, inventory CSV and unresolved-assets report (zero unresolved).
- Updated canonical review provenance, audit measurements and browser results.
- Extended scripts/illustration-browser-qa.mjs to verify all final additions and retain fallback/offline checks.
- Added 47 library screenshots and refreshed the tracked large-text screenshot.
- Updated this report, the public asset audit and asset README.

No remote push or deployment was performed. No further approval is required for this prepared package.

## Final 47 additions

- bridge
- cable-pallof-press
- weighted-wagon-backward-drag
- band-hamstring
- library-overhead-rope-cable-triceps-extension
- library-cable-face-pull
- library-two-arm-cable-lateral-raise
- library-cable-external-rotation
- library-standing-cable-fly
- library-kneeling-cable-crunch
- library-cable-wood-chop
- library-standing-cable-hamstring-curl
- library-cable-hip-abduction
- library-dumbbell-fly
- library-close-grip-dumbbell-press
- library-dumbbell-pullover
- library-lying-dumbbell-triceps-extension
- library-dumbbell-reverse-lunge
- library-smith-incline-bench-press
- library-smith-seated-shoulder-press
- library-smith-bent-over-row
- library-smith-wide-stance-squat
- library-smith-deadlift
- library-barbell-deadlift
- library-barbell-hip-thrust
- library-trap-bar-deadlift
- library-stability-ball-hamstring-curl
- library-stability-ball-crunch
- library-stability-ball-stir-the-pot
- library-stability-ball-dead-bug
- library-chest-dip
- library-bosu-tall-plank
- library-bosu-tall-plank-circles
- library-barbell-back-squat
- library-stationary-cycling
- knee-to-wall-dorsiflexion-mobility
- controlled-step-down
- bench-step-up
- library-dumbbell-bulgarian-split-squat
- library-seated-band-ankle-eversion
- library-seated-band-ankle-inversion
- 90-90-hip-switches
- supported-hip-airplane
- suitcase-carry
- library-barbell-bench-press
- library-cable-reverse-fly
- belt-squat
