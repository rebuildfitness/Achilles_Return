# Unified session update — 1.11.0

## What changed
- The eligible running/sport logger appears beneath the workout exercises. Saving it keeps the workout open and retains logged sets. It still produces a separate, auditable tolerance record.
- Shorter-session selection persists on this device. It hides only untouched optional strength accessories; rehab, primary work and any started exercise stay visible. Full and shorter time estimates are shown in Session options. When no optional accessories exist, there is no time reduction. Running/sport dose is additional to the displayed exercise estimate.
- Exercise path panels show the current prescription, configured next variation/duration, existing decision reason and requirements. These are explanatory views of existing rules, not new progression thresholds.
- The finish screen reviews completed, partial and unperformed work, with previous same-exercise sets. Saving retains original prescriptions and omitted work as uncompleted.
- The saved session records its chosen mode and associated running/sport record IDs. The immediately available coaching report includes these details. Next-morning feedback still determines tolerance.

## Preservation
No clinical rules, exercise doses, progression gates, historical records, database version or source metadata were changed. No additional training day or automatic programming was enabled. No live deployment was performed.

## Verification
168 unit tests and 72 browser checks passed; TypeScript, production build and service-worker generation passed. Browser checks use disposable profiles, including offline save and reload. Vite reports an existing large-bundle warning.

## Preview
Run the app, open today's eligible workout, and expand Session options. The prescribed running/sport block appears below exercises when eligible. Log actual work, select Finish Workout and review the summary. Save Workout makes the coaching report available immediately.

## Upload
This is a cumulative source package. Extract it and copy its contents into the cloned Achilles_Return repository, preserving folder structure. Commit and push in GitHub Desktop; allow the GitHub Actions build and deployment to finish. Do not copy node_modules or dist from local development.
