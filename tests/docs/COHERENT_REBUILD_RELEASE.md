# Coherent experience rebuild — 1.1.0

## What changed

- Today presents the current session and a prominent next action. Recovery logging opens separately; completed workouts lead to recovery instead of another workout.
- Plan separates Week, Calendar/history and Reschedule.
- Workout keeps the full exercise/set list, previous tolerated values, demos and reviewed substitutions. A sticky session summary counts completed sets and starts a rest timer using the exercise's prescribed rest. The timer survives a reload in the same browser tab and can be extended or cleared.
- Progress has Overview, Strength, Rehab and Sport views. Overview brings saved strength, sport and recovery records together. Strength graphs use actual completed loads, including substituted exercises, with response status retained in the record list.
- Tests presents monthly starting and finishing data in one card. Entry criteria and advanced capacity reviews remain available through disclosure controls.
- More opens a focused destination with a return action instead of keeping the entire settings menu above every page.
- The former large Program screen module is split into destination modules, with shared navigation and history components.

## Verification

Final production build and TypeScript check passed. 71 Node tests passed; 21 isolated browser checks passed; zero failures. Browser verification includes legacy IndexedDB migration, backup/restore, offline logging, service-worker updates, baseline persistence, exercise swaps, rescheduling, 320px layouts, enlarged text, timer persistence and recorded strength/recovery history.

## Upload and preview

Extract `Achilles_Return-Coherent-Rebuild.zip`. Upload its contents to the repository root while preserving folders, including `src`, `public`, `scripts`, `spec`, `docs` and `.github/workflows`. Do not upload just the ZIP or flatten the folders. The existing GitHub Actions workflow tests, builds and deploys the app.

After a successful deployment, reopen the app and use **Update & reload** if shown. Verify **More → About & install → App 1.1.0**. Do not clear site data to refresh: your records are local to the browser. This release package has been tested locally; it has not been uploaded or deployed by the agent.

Local preview: `pnpm install --frozen-lockfile`, `pnpm build`, then `pnpm preview`. Open the URL Vite prints. Run `pnpm test` and `pnpm test:browser` for verification (the browser suite requires an installed supported Playwright browser).

## Assumptions and limits

The approved clinical model, equipment restrictions, exercise prescriptions and next-morning tolerance rules remain in force. This is a product/experience rebuild, not a new rehabilitation protocol. Records, database version, backup schema and clinical ruleset are unchanged. No authentication, backend or social feed was introduced. The hero remains the fresh-launch entrance as previously requested.

Research is summarized and linked in `PRODUCT_REBUILD_RESEARCH.md`. Reddit observations are qualitative, with promotional comments and small sample sizes acknowledged. No paid workout program was copied. External demos still require internet. Rest timing is a convenience and never authorizes progression. Strength charts report observed loads, not estimated clearance or a combined rehabilitation score.

No further approval is required for these changes. Publishing requires uploading the package through the user's existing GitHub workflow.

## Files changed

- Added: docs/COHERENT_REBUILD_RELEASE.md
- Added: docs/PRODUCT_REBUILD_RESEARCH.md
- Added: src/components/RestTimer.tsx
- Added: src/components/SectionSwitch.tsx
- Added: src/components/TrainingOverview.tsx
- Added: src/data/trainingHistory.js
- Added: src/screens/ExposureScreen.tsx
- Added: src/screens/History.tsx
- Added: src/screens/MoreScreen.tsx
- Added: src/screens/PlanScreen.tsx
- Added: src/screens/ProgressScreen.tsx
- Added: src/screens/ResponseScreen.tsx
- Added: src/screens/TestsScreen.tsx
- Added: tests/trainingHistory.test.mjs
- Updated: README.md
- Updated: package.json
- Updated: scripts/browser-qa.mjs
- Updated: src/App.tsx
- Updated: src/components/RecoveryLog.tsx
- Updated: src/persistence/schema.js
- Updated: src/screens/Baseline.tsx
- Updated: src/screens/Program.tsx
- Updated: src/screens/Today.tsx
- Updated: src/screens/Workout.tsx
- Updated: src/styles.css
