# Sprint A0 / A implementation handoff

## Scope

React 19 + TypeScript + Vite replaces the served inline prototype. Today is the only screen receiving the A0 high-fidelity visual treatment. Shared components also carry the existing utility flows so the migration does not remove check-in, full-day logging, finish, provisional weekly Plan, monthly history, Progress/Tests summaries or JSON export. No baseline wizard, individualized plan generator, new exposure ladders or sport unlocks were added.

The approved hero and `spec/design-tokens-v1.json` remain unchanged. Tokens are loaded directly into CSS variables at startup. Inter uses the specified local/system fallback stack; no runtime font CDN is required. All five navigation destinations remain available. Photo backgrounds are absent from utility screens.

## Architecture and compatibility

- `src/main.tsx`, `src/App.tsx`: React entry, app coordination and existing flows.
- `src/components/ui.tsx`: AppShell, AppHeader, BottomNav, Card, StatusCard, PrimaryButton, ProgressStage, CalendarCard, ExerciseCard, SetRow and TestCard.
- `src/screens/Today.tsx`: high-fidelity Today with check-in, Ready/Modified/Stop, provisional workout preview and baseline milestone.
- `src/screens/CheckIn.tsx`, `Workout.tsx`, `ExistingViews.tsx`: ports of existing utility behavior. Tests honestly states the guided baseline is not yet available.
- `src/design/tokens.ts`, `src/styles.css`: frozen tokens and shared styling.
- Existing `src/rules/readiness.js`, `src/rules/workout.js`, `src/data/exercises.js` and `src/data/workouts.js` are unchanged. They remain JS modules behind the TypeScript application so the original node:test suite runs directly without transpilation. This is an intentional incremental migration boundary.
- `src/rules/tolerance.js`: existing next-day response mapping extracted from the UI, with the mandated RED -> MEDICAL_FLAG safety override. No new symptom thresholds were introduced.
- `src/rules/audit.js`: stable IDs, reason codes, source identifiers and version metadata for new readiness decisions. No progression engine is added.
- `src/data/provisionalWeek.js`: existing served index.html schedule extracted verbatim in substance, not Sprint C's generator.
- `src/db.js`, `src/persistence/schema.js`, `repository.ts`: preserve database name and existing records; additive schema v1 -> v2 adds capabilityStates, decisions and settings. Historical rule versions are retained. Check-in/audit/tolerance writes and session/draft writes use atomic transactions. Errors surface rather than claiming a successful save.
- Backup export includes separate app/database/ruleset/library/evidence versions. Pure backup validation/migration and transactional restore APIs are present; no restore UI was added.
- `vite.config.ts`, `public/`, `scripts/build-sw.mjs`, `sw.js`: relative build assets and generated precache manifest. Service-worker updates wait for an explicit reload action, and only app caches are cleaned. Demos are not cached. IndexedDB remains independent of cache updates.

## Changed files

Modified: `package.json`, `index.html`, `README.md`, `src/db.js`, `sw.js`.

Removed: obsolete `src/app.js` (replaced by React; its case-insensitive name collided with App.tsx on Windows). Root `manifest.webmanifest` moved to `public/manifest.webmanifest` and updated to approved colors.

Added: `.gitignore`, `tsconfig.json`, `vite.config.ts`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, this report; `src/main.tsx`, `src/App.tsx`, `src/types.ts`, `src/styles.css`, `src/components/ui.tsx`, `src/design/tokens.ts`; `src/screens/Today.tsx`, `src/screens/CheckIn.tsx`, `src/screens/Workout.tsx`, `src/screens/ExistingViews.tsx`; `src/persistence/schema.js`, `src/persistence/repository.ts`, `src/rules/audit.js`, `src/rules/tolerance.js`, `src/data/provisionalWeek.js`; `public/assets/icon.svg` (copy of existing icon); `scripts/build-sw.mjs`, `scripts/browser-qa.mjs`; `tests/foundation.test.mjs`, `tests/persistence.test.mjs`; QA screenshots/results in `artifacts/`.

Generated/ignored: `node_modules/`, `dist/`. The folder had no `.git` metadata, so no commit or git diff was created.

## Validation

Final results: **23 node:test tests passed, 0 failed** (including all 17 unchanged original tests); **TypeScript and production build passed**; **11 browser scenarios passed, 0 failed**. Browser results are saved in `artifacts/browser-qa-results.json`.

Run `pnpm test`, `pnpm typecheck`, `pnpm build`, then `pnpm test:browser`. Browser results and screenshots are generated from an isolated test profile, including synthetic legacy data, not the user's records.

Browser coverage includes a GitHub Pages-style subdirectory, real IndexedDB v1 upgrade, retained historical versions, check-in persistence, set autosave/reload, full-day logging/demos, pending session completion, seven-day plan, actual calendar history, production offline reload/all tabs/logging, red-flag blocking, 320–1280px layout, 200% text, and an in-place service-worker upgrade preserving data and unrelated caches.

## Assumptions and remaining review

1. **Visual approval:** Today and the shared app shell require product approval before further screen production, as required by `docs/CODEX_BUILD_ORDER.md` Sprint A0. This is the intended stopping point.
2. The prototype's provisional workout remains loggable after check-in to preserve existing functionality. It is explicitly labeled provisional; no personalized plan or actual starting phase is claimed before baseline. No sample performance scores or week-driven phase labels are used.
3. The original rule/exercise modules are preserved, not replaced with a complete implementation of Master Plan v1.0. Their version is explicitly `prototype-1.4` rather than claiming all frozen-plan rules are implemented.
4. Existing demo URLs and metadata are preserved to satisfy migration parity and original tests. The prototype catalog differs from the newer curated catalog, and the bike has no URL. Full demo verification/metadata and resolution of the documented bike-setup exception versus the global demo requirement remain release work. No new exercise was activated or new demo claimed verified in A0/A.
5. The existing next-day non-red mapping uses the selected prior-session response. Resolving conflicts between that answer and other symptom answers beyond the mandated red override requires the later tolerance implementation/review; no new clinical cutoff was invented here.
6. Dynamic baseline tests remain unavailable. The 80-scenario master test plan is not fully implemented by these foundation sprints. No clinical criteria were rewritten; no deployment or later sprint was performed.
