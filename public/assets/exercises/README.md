Current batch 5: each of the 75 full-size illustrations has a separate 192 x 288 PNG preview. Cards load previews; Enlarge loads the 640 x 960 original. Thumbnails average 19 KB (91% smaller). Both sizes cache on demand. See ILLUSTRATION_REVIEW.md and the current machine-readable audit. Validation: 87 Node tests and 40 browser checks passed.

# Exercise illustrations

Supplemental artwork appears beside exercise names in both the strength and movement libraries. It does not change exercise eligibility, prescriptions, clinical rules, progression, logging or existing Short Demo links.

Each canonical exercise ID has one record in `manifests/exercise-illustrations.json`. Repeated appearances in several collections use the same asset. Similar names with different IDs remain distinct. `not_generated` and `needs_product_review` records have no image path; both libraries show the same usable unavailable state. Failed requests also remove the image without disabling other actions.

## Assets and display

- Individual monochrome PNGs are exactly 640 × 960. Target below 250,000 bytes; review anything above 400,000 bytes.
- Folders identify primary ownership: `prescribed/`, `strength-library/`, and `movement-library/`. Each filename is its canonical ID plus `.png`.
- Concentric/Eccentric panels describe resistance phases. Setup/Hold describes static positioning; Start/End describes mobility and other movement endpoints. These labels never prescribe a dose or grant clearance.
- Generated adult women and men represent diverse backgrounds, including Black, White, East Asian, South Asian/Indian and Middle Eastern models. Metadata describes intended fictional characters, following the user's expanded brief.
- The shared `ExerciseIllustration` component renders a 72–88px left thumbnail and accessible inline enlarged view up to 320px wide. HTML names, setup and demos remain available. Escape or Close returns focus to the thumbnail.
- The JSON manifest is bundled with the application, not fetched at runtime. `illustrationUrl` joins `/assets/...` paths to Vite's base URL; relative deployment and `/Achilles_Return/` work.
- Images reserve their aspect ratio and load lazily in the UI. The user-approved service worker caches bundled illustrations on first request rather than at installation. Viewed images work offline until an app update or browser eviction clears the cache. Unviewed images need internet and offer Retry after a failed request. External demos require internet and are not cached.

## Maintenance

Resolve the exact active ID/title and mechanics before generating an individual image. Save the final PNG under its primary folder, record its production metadata, regenerate the inventory, visually inspect the normalized file and run tests. Do not create a path for missing artwork. Update the audit with byte measurements and exceptions. A total initial precache over 15,000,000 bytes needs an explicit cache-policy decision before release; do not silently switch formats or cache behavior.

The inventory CSV and unresolved report account for coverage. `asset-audit.md` records actual generation, validation and delivery status. A placeholder never counts as an exercise illustration.
