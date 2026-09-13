# Sprints B–G implementation report

## Delivered

The React/TypeScript/Vite app now includes all five production navigation screens, first-launch onboarding, a resumable 13-section baseline and reassessment, measured heel-rise calculations, personalized Strength A/B/C scheduling, inline set logging, independently gated R1–R9/J0–J5/S1–S6/D1–D7/B1–B8/SC1–SC6 ladders, exposure logging, explicit next-morning responses, capacity reviews, exercise/evidence libraries, calendar/history, equipment/schedule preferences and JSON backup/restore.

The approved hero image was inspected against Today and copied unchanged to `public/assets/hero-reference.png` for onboarding. The approved design-token JSON is unchanged. Utility screens retain the navy header, off-white surfaces, white cards, cobalt actions and semantic status colors. Screenshots use a disposable, synthetic QA profile; no clinical measurements were seeded into the user's database.

The original clinical/product documents and rehabilitation JSON remain unchanged. The app has no backend, authentication, cloud synchronization or generated rehabilitation logic. IndexedDB keeps its original database name and schema migration path. Historical ruleset versions are retained.

## Validation

- **48 Node tests passed; 0 failed.** All 17 original rule tests remain unchanged, alongside the existing foundation/storage tests and new program tests.
- TypeScript checking and the optimized production build passed.
- **15 production-browser checks passed; 0 failed.** The isolated suite passed assessment save/resume, all baseline sections, six-card strength logging, reload persistence, offline navigation/logging, explicit tolerance responses, actual calendar records, run-exposure draft recovery, backup/restore, red-flag behavior and service-worker update/cache preservation.
- Browser checks cover 320–1280 px workout layouts and all five main screens at 320 px with enlarged text. New-user onboarding is checked separately.
- Browser result details: `artifacts/browser-qa-results.json`.
- The test server serves a GitHub Pages-style `/achilles-return-app/` subdirectory. Tests never use the user's browser profile.

The regression run caught and fixed an exposure-draft hydration race before release. External video playback, native installed Safari/iOS behavior and a live GitHub Actions deployment have not been verified by these Chromium-based checks.

### Test-plan mapping

| Frozen test-plan cases | Verification |
| --- | --- |
| 1–14 safety/readiness | Original rule suite plus production template modifications |
| 15–20 tolerance | Response classifications, blocked advancement, explicit browser response flow |
| 21–29 equipment/demos | Catalog guards, whitelist filtering, separate calf demos, source metadata and visible buttons |
| 30–36 baseline | Wizard/browser flow, required fields, safety skips, missing-height calculations, seven-criterion gate |
| 37–45 strength/running | Quality/RPE/tolerance prerequisites, ladder steps, holds and regression |
| 46–53 jumps/speed/COD | Independent gates, contact-spike hold, audited high-speed count, planned-before-reactive checks |
| 54–61 basketball/soccer | Court log validation, caps, candidate wording and optional/physical soccer prerequisites |
| 62–67 calendar/persistence | Seven days, expansion, saved-set history, month controls, schema migration and reload; native installed restart remains a device check |
| 68–71 interruptions | Reduced re-entry, relevant retest, spacing and no catch-up duplication |
| 72–76 offline/PWA | Production offline flow, video fallback, all tabs and cache update isolation |
| 77–80 mobile | Responsive overflow and enlarged text checks, inline complete/load/reps controls |

These are grouped assertions, not a claim that 80 separate automated tests or clinical validation studies were performed.

## Implementation inventory

New source files:

- `src/data/baseline.js`
- `src/data/catalog.js`
- `src/data/checkpoints.js`
- `src/data/evidence.js`
- `src/data/exposures.js`
- `src/rules/baseline.js`
- `src/rules/planner.js`
- `src/rules/progression.js`
- `src/rules/response.js`
- `src/screens/Baseline.tsx`
- `src/screens/Program.tsx`
- `src/screens/Welcome.tsx`
- `tests/fixtures.mjs`
- `tests/program.test.mjs`
- `public/assets/hero-reference.png` (unchanged copy of the approved image)
- `IMPLEMENTATION_B_G.md`

Updated:

- `src/App.tsx`
- `src/types.ts`
- `src/components/ui.tsx`
- `src/screens/Today.tsx`
- `src/screens/Workout.tsx`
- `src/styles.css`
- `src/persistence/repository.ts`
- `src/persistence/schema.js`
- `scripts/browser-qa.mjs`
- `.github/workflows/deploy.yml`
- `.gitignore`
- `package.json`
- `README.md`
- Generated `dist/` assets and QA artifacts.

Removed the superseded provisional `src/screens/ExistingViews.tsx`. Legacy rule/data fixtures and their original tests are preserved. The earlier foundation changes are documented in `IMPLEMENTATION_A0_A.md`. There is no Git baseline in this workspace, so this inventory records implementation work rather than a Git diff.

## Assumptions and conservative restrictions

1. **No actual baseline was assumed.** A personalized plan is inactive until the user completes assessment. Dates are prefilled from the approved profile, not used as clearance criteria. Reassessment requires renewed exercise-clearance/restriction answers.
2. **Qualitative gates stay qualitative.** The plan does not provide validated numeric cutoffs for every advanced transition. The app requires dated, described assessment evidence and relevant tolerated exposures instead of inventing universal symmetry thresholds. The specific domain-to-ladder prerequisite mappings are conservative implementation choices and remain identifiable by rule ID.
3. **Initial exposure organization stays conservative.** High-rate work is consolidated onto selected loading days, with at most two impact/sport exposures per week and one per day. Automatically increasing to three needs a defined “consistent tolerance” policy; the app does not guess it.
4. **Unspecified doses require a recorded individual prescription.** D2, D7, J5, S6, B6/B7 and later soccer doses do not have complete numerical prescriptions in the frozen files. The exposure form requires the agreed dose/reviewer details. Interrupted exposures use the frozen 20%/30% re-entry guidance and cannot drive immediate ladder advancement.
5. **Contact-count conflict stays conservative.** A next jump rung that would at least double the previous recorded contacts is held. This can affect J0→J1. The source documents do not define an intermediate dose that resolves every such transition; no new clinical dose was invented. Product/clinical review is needed to define that transition before automatic advancement can cover it.
6. **Demo gaps resolved on 2026-09-11.** J5 and SC2–SC6 now have exercise-specific / governing-body demonstrations, and physical baseline sections share the catalog links. Individual-dose and capacity gates remain. See [DEMO_AUDIT.md](DEMO_AUDIT.md) for sources, durations and verification limitations.
7. **ATRS is score entry only.** Previously administered totals can be recorded. The questionnaire itself is not redistributed without verified usage rights. ALR-RSI/Ankle-GO can inform documented professional reviews; embedded questionnaire administration/scoring is not included.
8. **No automatic maximal-performance programming was invented.** The B8 candidate status, S6 review and named performance pathways are represented, while unspecified advanced prescriptions remain individual-review work.

These restrictions are visible or enforced in the app. They are not failed unit tests, and they mean the build should not be described as an unrestricted, clinically validated release.

## Preview and deployment

The current production preview is running at http://127.0.0.1:4173/.

Run `pnpm dev` for development. For offline/PWA testing, run `pnpm build` then `pnpm preview`; open the URL printed by Vite. Keep the same origin to retain existing IndexedDB data. Use More → Backup & restore when changing origins.

Screenshots:

- `artifacts/welcome-mobile.png`
- `artifacts/today-ready-mobile.png`
- `artifacts/today-stop-mobile.png`
- `artifacts/baseline-mobile.png`
- `artifacts/tests-mobile.png`
- `artifacts/workout-mobile.png`
- `artifacts/plan-mobile.png`
- `artifacts/progress-mobile.png`

GitHub Pages configuration now installs dependencies, runs tests, builds `dist/`, runs browser QA and deploys the built artifact. **The site has not been uploaded or published.** This workspace has no Git repository/remote, and no destination repository was provided. Publishing requires the target GitHub repository and normal GitHub authentication on the computer. Passwords/tokens should not be pasted into app code or this report.

No additional approval is requested for the local implementation. The remaining clinical-content restrictions above require defined source material, and hosting needs repository/authentication setup.
