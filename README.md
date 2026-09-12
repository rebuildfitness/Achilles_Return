# Achilles Return to Basketball App — Master Plan v1.0

This repository contains the React + TypeScript + Vite application, the retained legacy prototype, and the frozen rehabilitation/product specification.

The approved Today design now connects to a resumable baseline, Strength A/B/C planning, six independent exposure ladders, next-morning responses, capacity reviews, evidence, history and backup/restore. See `IMPLEMENTATION_B_G.md` for validation, assumptions and remaining release restrictions.

## Planning status
**Complete / frozen for implementation.**

The only major user-specific variable intentionally unresolved is the actual starting phase and individualized first week. Those must be determined from the interactive baseline assessment rather than guessed from time since surgery.

## Source-of-truth files
Read `AGENTS.md`, then the files under `docs/` and `spec/rehab-plan-v1.json`.

Key documents:
- `docs/MASTER_PLAN.md`
- `docs/BASELINE_ASSESSMENT.md`
- `docs/WORKOUT_TEMPLATES.md`
- `docs/EXERCISE_LIBRARY.md`
- `docs/VIDEO_CATALOG.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/VISUAL_SCREEN_SPEC.md`
- `docs/UI_UX_SPEC.md`
- `docs/DATA_AND_RULES.md`
- `docs/TEST_PLAN.md`
- `docs/CODEX_BUILD_ORDER.md`
- `docs/HANDOFF_SUMMARY.md`
- `spec/design-tokens-v1.json`
- `assets/design/achilles-return-hero-reference.png`

## Application features
- four-step baseline with optional tests, monthly comparisons and detailed assessment access
- full-body 5×5 / hypertrophy additions alongside the original rehabilitation work
- mobile-first local PWA prototype
- Today / Plan / Progress / Tests / More
- readiness logic
- full-day Strong-style set logging
- capability-aware weekly plan and calendar/history
- autosaved baseline and reassessment
- running, jumping, speed, COD, basketball and optional soccer ladders
- recorded capacity reviews and auditable progression decisions
- next-morning tolerance and JSON backup/restore
- IndexedDB local storage
- equipment whitelist
- weighted wagon / sled substitute
- no leg press
- exercise-specific demo links

Latest user-approved extensions: `docs/SIMPLE_BASELINE_UPDATE.md` and
`docs/FULL_BODY_STRENGTH_UPDATE.md`. Equipment names reflect the supplied photos.

## Run application
Use Node.js 22.12+ (Node 24 recommended) and pnpm. The lockfile pins dependencies.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite. `pnpm serve` is an alias. Opening the production `index.html` directly as a file is no longer supported.

For the production PWA:

```bash
pnpm build
pnpm preview
```

Offline caching is enabled in the production build, not the development server. Build output is `dist/`, with relative asset paths and a generated `sw.js` for GitHub Pages project subdirectories. Deploy the contents of `dist/`; do not deploy the source service-worker template. The GitHub Actions workflow tests, builds and publishes `dist/` after a push to `main` in a configured GitHub repository.

IndexedDB remains `achilles-return-db` on the same origin. Keep the same protocol, hostname and port to access existing browser data. A new preview origin has a separate database. Export from the old origin before moving between origins; restore it using More → Backup & restore.

`standalone.html` remains the unchanged legacy reference and is not included in the production bundle. The old root `styles.css` and `server.mjs` belong to that prototype, not the React application.

## Test
```bash
pnpm test
pnpm typecheck
pnpm build
pnpm test:browser
```

All 17 original rule tests are retained unchanged. The suite adds baseline, planner, progression, safety, input-validation and IndexedDB migration tests. Browser QA serves the production build at `/achilles-return-app/` in an isolated browser profile, verifies the full assessment-to-workout flow and offline behavior, and writes screenshots to `artifacts/`. It defaults to installed Microsoft Edge; set `BROWSER_CHANNEL=chrome` to use installed Chrome. No browser QA touches your existing browser profile.

## Production target
React + TypeScript + Vite, IndexedDB, offline PWA and GitHub Pages. V1 has no backend, account or cloud sync. The frozen source documents remain unchanged.


## Frozen visual direction
The approved production look is defined by:
- `assets/design/achilles-return-hero-reference.png`
- `docs/DESIGN_SYSTEM.md`
- `docs/VISUAL_SCREEN_SPEC.md`
- `spec/design-tokens-v1.json`

Codex should reproduce the mobile UI language shown in the hero rather than redesigning the product.

## GitHub Pages setup

This local workspace has no Git remote configured yet. Create/select the destination repository, sign in to GitHub through your normal Git credential manager, and push the project to `main`. In the repository Pages settings choose GitHub Actions. No password or access token belongs in the app or source files. The workflow builds and tests before deploying; actual hosting has not been verified until it runs in that repository.

## Expanded home-gym library

Open More > Exercise library for 90 searchable exercises with equipment and muscle filters, individual demo links and setup notes. See docs/EQUIPMENT_EXERCISE_LIBRARY.md for the complete inventory and verification limitations. Reference options do not alter prescribed rehab workouts.

