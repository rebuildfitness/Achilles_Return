# Training companion update — 1.3.0

Approved product update, September 14, 2026. Clinical thresholds and database schema remain unchanged.

## Included

- First-use Welcome; returning launches open Today. Replay the hero from More.
- Today has one primary next action, with secondary access to permitted training or recovery when a response is due.
- 31 distinct branded photos, selected by local calendar day (1–31). Refresh preserves the daily selection. Mobile WebP files total less than 1 MB and load on demand.
- Today separates current loading guidance, session prescription and progression. Running entry criteria are identified as activity-specific.
- Six additional calf reference variations with equipment, setup, easier/next-step descriptions, provider demo links, reviewed 640 × 960 illustrations and 192 × 288 thumbnails.
- Exercise load guidance identifies the latest recorded session, completed sets and tolerance status.
- Tests accepts independent dated measurements, including real zero values, side, setup and notes. Results also appear in Progress. These observations do not silently replace assessments or grant clearance.
- Estimated session duration and optional accessory labels. Shorter-session view retains rehab, primary work and any entered sets. Hidden exercises remain uncompleted in the original prescription; the toggle resets when reopening the workout.
- Schedule changes preview affected dates; existing substitution explanations and separate starting-load guidance remain in place.
- Combined chronological strength and recovery history can reveal earlier records.
- Strength/reference library opens with In your plan, with Favorites and All exercises options. Search spans the library; Achilles shows calf/ankle references. Movement-library favorites are not added in this release.
- More shows app/build identity, backup reminder, last backup download request and an update check. The browser cannot confirm a download was saved successfully.

## Limits and assumptions

- Calendar day selects an image; no automatic slideshow or background timer. Daily selection updates when the component renders or the app refreshes.
- All 133 exercise entries now have illustrations, including the six calf references. They are not automatically prescribed, and equipment ownership does not unlock them.
- Independent measurement plots show observations, not clearance or standardized load equivalence. Compare setup and repetitions before interpreting changes.
- No automatic migration between lifting variations based on a single load milestone. Existing criteria and next-morning response requirements remain authoritative.
- Local-first storage remains specific to the browser and site address. Export a backup before installing changes. No accounts or cloud sync were added.
- The production build emits a nonfatal bundle-size warning; imagery is loaded on demand.

## Validation

92 automated tests; production TypeScript/Vite/service-worker build; 28 app browser checks and 20 illustration browser checks. Coverage includes offline logging, red overrides, next-morning tolerance, existing-record update/restore, responsive layout, first-use/returning welcome behavior, measurement persistence without changing assessments, favorites and daily branding.

## Upload

Extract the complete release ZIP. Copy its contents into the cloned Achilles_Return repository while preserving its .git directory. Review changes in GitHub Desktop, commit and push. GitHub Pages must use the existing GitHub Actions deployment workflow. Wait for both build and deploy to succeed, then use the app update prompt. Do not clear browser site data.

Screenshots in artifacts/companion-today.png and artifacts/companion-measurements.png use disposable test data, not personal records.

## Calf artwork addendum

The six missing illustrations are included in the with-calf-illustrations upload archive. Built-in image generation was used; prompts and review records are in artifacts/calf-illustration-generation.json. Artwork lives under public/assets/exercises/strength-library/calf-*.png, with mobile copies under public/assets/exercises/thumbnails/. Smith safety-stop placement was corrected during visual review. No prescription, exercise demo, or clinical criterion changed.

## Workout illustration update

Workout cards now reuse the same exercise thumbnails and expandable illustrations as the library. The image is selected using the actual current exercise ID, including substitutions. The thumbnail appears beside the name, prescription, Short Demo and Why. Set logging stays full width below it. Enlarged artwork is collapsed by default; Close illustration and Escape restore focus to the thumbnail without navigating away or modifying recorded sets. Offline image fallback and on-demand caching are inherited from the shared illustration component. No protocol or clinical rule was changed.
