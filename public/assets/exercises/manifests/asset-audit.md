# Exercise illustration asset audit

Status: library integration delivered locally with **72 unresolved illustrations**. Full artwork production is incomplete. No deployment, main-branch push or merge has occurred. PR publication remains incomplete because no authenticated GitHub account is configured in Git Credential Manager.

## Scope and delivery

- Repository: https://github.com/rebuildfitness/Achilles_Return
- Base: f32ce91ab2bb8d92b32e47ba21b9cd743d475920
- Actual local branch: feature/full-exercise-illustration-library
- Implementation checkout: artifacts/illustration-checkout in the source-only workspace. The existing main workspace and localhost:4173 preview were not replaced.
- Approved instruction: codex-instructions-full-exercise-illustration-library-640px-v3.md.
- Built-in image generator used, with individual prompts retained in artifacts/illustration-reviews.json. Pillow only normalized selected masters to monochrome 640 × 960 optimized PNGs.
- Generation stopped on an actual usage_limit_reached response. Tool-reported reset: September 13, 2026, 07:27:59 UTC (03:27:59 America/New_York). No automatic retry or paid API fallback has been scheduled.

## Inventory and coverage

127 canonical IDs: 21 prescribed catalog entries, 93 strength-library appearances (including those 21), and 34 movement-library entries. The 21 repeated appearances share their canonical file. Different IDs with similar names are not merged.

55 unique usable assets; 72 unresolved: 64 not generated because production hit the tool limit, and 8 drafts excluded after visual review. The complete names, IDs, source locations and reasons are in unresolved-exercise-assets.md and the inventory CSV. No fake image paths are supplied.

Motion formats among usable assets: 23 concentric_eccentric, 21 start_end, 11 setup_hold, 0 locomotion_cycle. Fictional adult Black model presentation: 26 women and 29 men.

No active ID/name conflicts were found. Retained legacy definitions are not a second current library. Sport exposure groups, running and speed ladders contain activity/demo descriptions without individual canonical exercise IDs; these are not silently assigned invented exercise IDs. Their rule behavior remains unchanged.

## Quality and bytes

Every delivered PNG was inspected after normalization for title, panel labels, anatomy, equipment, cropping and enlarged-view legibility. The 12-asset pilot passed internal review and testing before expansion. Pilot membership is recorded in the manifest.

- Image bytes: 11,045,200.
- Mean: 200,822 bytes; median: 197,162 bytes.
- Largest: library-chest-supported-dumbbell-row, 240,414 bytes.
- Over 250,000 bytes: 0. Over 400,000 bytes: 0.
- All delivered assets: 640 × 960 PNG, one file per illustrated canonical ID.
- Rejected masters remain outside the shipped asset folder. They do not count toward coverage.

## UI and verification

One shared component provides a left 72–88px thumbnail, readable HTML title and accessible inline enlarged image up to 320px. Close and Escape restore focus to the thumbnail. Missing metadata and failed image requests render a usable fallback. Existing setup, external demos, filters and pagination remain available. Metadata is bundled JSON; it is not fetched at runtime.

Validation on the 55-image build:
- Frozen dependency install: passed.
- Typecheck: passed.
- Node tests: 85 passed, 0 failed, 0 skipped.
- Existing Edge browser checks: 23 passed.
- Illustration Edge checks: 8 passed.
- Production build: passed; Vite reports a non-fatal JavaScript chunk-size warning.
- Emulated 320px and 390px layouts, enlarged text, keyboard close/focus, project subpath, offline image loading and failed requests checked.
- Physical iPhone/Safari testing has not been performed.

Screenshots are in artifacts/illustration-*.png. Detail/card captures temporarily hide fixed navigation only during the capture to avoid overlaying a long element screenshot. Layout and navigation tests run with normal navigation.

## PWA measurement

Baseline production precache payload: 2,265,075 bytes. Current measured payload before this audit document was added: 13,801,659 bytes. Final payload including this document: 13807325 bytes. See artifacts/illustration-audit-results.json for the machine-readable final measurement. This is the sum of precached production file bytes, excluding sw.js itself and HTTP overhead; it is not a claim about compressed network transfer.

The worker still eagerly precaches production assets. UI lazy loading does not reduce installation bytes. Local Edge installation and offline loading succeeded. The current partial collection stays below 15,000,000 bytes. The remaining collection will require a new measurement; if it exceeds the threshold, cache-policy resolution remains a release decision. A suitable proposal is on-demand image caching with the current unavailable fallback, retaining all PNG source assets. No cache or format change was made.

## Preserved behavior

Clinical rules, red flags, restrictions, progression, prescribed-session authority, user records, schemaVersion: 2, backup/import, and existing demo metadata were preserved. Only the two library renderers were wrapped; the rule engine, catalogs, storage and service-worker policy were not changed.

## Resume

Resume the 64 ungenerated IDs and 8 correction items after generation is available. Review each final image, update the review metadata, run inventory generation and tests, measure the complete cache, then publish the prepared branch as a PR using an authenticated GitHub session. Do not represent this partial review package as every exercise illustrated.
