# Upload the tested Achilles Return V2 release

Package: `Achilles-Return-V2-complete-source-61dd89f.zip`
Release commit: `61dd89f8acd9407dee93bb647bbe854d64e34fb5`
Validated: 464 unit tests, 169 browser checkpoints, production build, cached illustrations offline.
Application version: 1.13.0. IndexedDB schema: 3.

This is the complete application source package for the existing GitHub Actions deployment. It includes all 174 mapped exercise illustrations and their thumbnails, the V2 app, tests, research, and build configuration. It does not include node_modules, compiled dist, Git metadata, personal backups or local browser-test artifacts. The validation report's screenshot/log links refer to evidence retained in the development workspace, not this upload ZIP.

## Recommended: GitHub Desktop

1. Export a backup from your current app and keep it somewhere safe outside the repository.
2. In GitHub Desktop, select `rebuildfitness/Achilles_Return`, select `main`, then Fetch origin / Pull origin if offered. Preserve any unrelated local changes before replacing files.
3. Choose **Repository → Show in Explorer** to open the cloned repository.
4. Extract the ZIP into a separate folder. Open the extracted folder containing `package.json`, `index.html`, `src`, `public`, and `.github`.
5. Enable **View → Show → Hidden items** in File Explorer so `.github`, `.gitattributes` and `.gitignore` are included. Copy the extracted folder's CONTENTS into the cloned repository folder. Choose **Replace the files in the destination** for matching files. Do not copy the ZIP itself, a containing folder, or files into `public` alone. Do not delete or replace the repository's `.git` folder.
6. Return to GitHub Desktop and review the changes. Use a summary such as `Release V2 with exercise illustrations`, then **Commit to main** and **Push origin**. Pushing main starts deployment.
7. On GitHub, open **Settings → Pages** and verify **Source: GitHub Actions**. Open **Actions → Test and deploy GitHub Pages** and wait for BOTH build and deploy to succeed.
8. Open https://rebuildfitness.github.io/Achilles_Return/ . Use the app's update/reload button if offered. Close and reopen the app if it still shows an older version. Do not clear site data: that can remove locally stored workout history.

GitHub Desktop avoids the browser uploader's 100-file limit. This ZIP is a complete source package, not a ZIP to upload as one repository file. GitHub Actions builds and publishes `dist`; do not manually substitute compiled files for source files or upload only `index.html`.

## Quick check after deployment

- Today, Train, Plan and Progress are visible; Explore opens Calendar, History, Rehab Guide and Settings.
- Train → Start Blank Workout → Add exercise: find Bilateral Standing Calf Raise, view its thumbnail, enlarge it, then close the image.
- Builder and active exercise cards show the illustration AND Short Demo where mapped/available.
- Existing history remains present. All nine Guide phases remain browseable.
- Seven advanced Guide examples and custom exercises have no existing illustration mapping and deliberately show a fallback.
- Previously loaded local illustrations work offline. Remote videos require internet.

## Important files

- `src/`: app implementation and preserved clinical/advisory rules.
- `public/`: icons, branding and exercise illustrations.
- `spec/` and `docs/`: preserved research, definitions and implementation documentation.
- `tests/` and `scripts/`: regression checks and build/browser tooling.
- `.github/workflows/deploy.yml`: tested build and GitHub Pages deployment workflow.
- `.gitattributes`: preserves exact approved bytes across Windows and Linux; include this file.
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`, `vite.config.ts`, `index.html`, `sw.js`: dependency, build and offline configuration.
- `V2_FINAL_VALIDATION_REPORT.md`: reviewed validation report.

Application rollback does not downgrade IndexedDB. Do not deploy an older schema-2 app as a way to undo schema 3.

No upload or deployment has been performed by this handoff.
