# Exercise illustrations

Supplemental artwork appears beside exercise names in both the strength and movement libraries. It does not change exercise eligibility, prescriptions, clinical rules, progression, logging or existing Short Demo links.

Each canonical exercise ID has one record in `manifests/exercise-illustrations.json`. Repeated appearances in several collections use the same asset. Similar names with different IDs remain distinct. `not_generated` and `needs_product_review` records have no image path; both libraries show the same usable unavailable state. Failed requests also remove the image without disabling other actions.

## Assets and display

- Individual monochrome PNGs are exactly 640 × 960. Target below 250,000 bytes; review anything above 400,000 bytes.
- Folders identify primary ownership: `prescribed/`, `strength-library/`, and `movement-library/`. Each filename is its canonical ID plus `.png`.
- Concentric/Eccentric panels describe resistance phases. Setup/Hold describes static positioning; Start/End describes mobility and other movement endpoints. These labels never prescribe a dose or grant clearance.
- Generated adult Black women and men provide varied representation. Metadata describes intended fictional characters.
- The shared `ExerciseIllustration` component renders a 72–88px left thumbnail and accessible inline enlarged view up to 320px wide. HTML names, setup and demos remain available. Escape or Close returns focus to the thumbnail.
- The JSON manifest is bundled with the application, not fetched at runtime. `illustrationUrl` joins `/assets/...` paths to Vite's base URL; relative deployment and `/Achilles_Return/` work.
- Images reserve their aspect ratio and load lazily in the UI. The existing service worker still precaches all production files; lazy rendering does not reduce that initial cache. External demos require internet and are not cached.

## Maintenance

Resolve the exact active ID/title and mechanics before generating an individual image. Save the final PNG under its primary folder, record its production metadata, regenerate the inventory, visually inspect the normalized file and run tests. Do not create a path for missing artwork. Update the audit with byte measurements and exceptions. A total initial precache over 15,000,000 bytes needs an explicit cache-policy decision before release; do not silently switch formats or cache behavior.

The inventory CSV and unresolved report account for coverage. `asset-audit.md` records actual generation, validation and delivery status. A placeholder never counts as an exercise illustration.
