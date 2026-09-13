# Illustration review package — partial artwork coverage

This source package adds matching exercise thumbnails and an enlarged view to both libraries. It contains **55 reviewed illustrations out of 127 canonical exercises**, with 72 explicitly unresolved. It is not the completed full illustration library. No live site has been changed by this work.

## Preview

From this folder, using Node.js and the package manager specified in package.json:

```powershell
pnpm install --frozen-lockfile
pnpm build
pnpm preview --port 4180
```

Open http://127.0.0.1:4180/, then Get Started → More → Exercise library. Search for Dumbbell Biceps Curl or Flat dumbbell bench press. Select Mobility for the movement library. Tap Enlarge. Seated unilateral cable hamstring curl currently demonstrates the unavailable-image fallback while keeping its existing demo and setup.

The preview uses a separate browser origin from localhost:4173 and the live GitHub Pages site; existing records will not appear automatically. Do not clear the live site's storage. Use your existing backup/export workflow if you choose to move records.

## Files added and changed

- src/components/ExerciseIllustration.tsx and .css: shared thumbnail, accessible inline detail, failed-image fallback and responsive layout.
- src/data/illustrationPaths.js: joins asset paths to Vite's deployment base path.
- src/components/ExerciseLibrary.tsx and MovementLibrary.tsx: wrap existing cards with the shared visual component.
- public/assets/exercises/prescribed, strength-library, movement-library: 55 individual 640 × 960 PNGs.
- public/assets/exercises/manifests/exercise-illustrations.json: bundled ID-to-image metadata for all 127 IDs.
- exercise-illustration-inventory.csv, unresolved-exercise-assets.md, asset-audit.md in that manifests folder: inventory, full exception list, measurements and validation.
- public/assets/exercises/README.md: asset/UI conventions and maintenance.
- scripts/inventory-illustrations.mjs, normalize-illustrations.py, audit-illustrations.mjs: inventory regeneration, Pillow normalization of reviewed masters, and measured byte audit.
- scripts/illustration-browser-qa.mjs and tests/illustrations.test.mjs: targeted browser and inventory/path checks.
- artifacts/illustration-reviews.json: original prompts, selected local master paths, representation and review notes. Masters themselves are not required to run/build this package.
- artifacts/illustration-*.png and results JSON: review screenshots and test/audit evidence.
- artifacts/codex-instructions-full-exercise-illustration-library-640px-v3.md: approved implementation brief.

Clinical rules, restrictions, progression, prescribed sessions, user data, backup schemaVersion 2, service-worker policy and existing demo metadata remain unchanged. Existing project files are included to preserve the working source tree. node_modules, dist, local test backups and rejected image masters are excluded.

## Tests and outstanding work

Typecheck and build passed. Node tests: 85 passed, none failed/skipped. Existing browser checks: 23 passed. Illustration browser checks: 8 passed. Initial precache: 13,807,325 bytes; image files: 11,045,200 bytes. See the audit for model/motion counts, limits and screenshots. Browser QA uses disposable Edge profiles; physical iPhone/Safari remains untested.

The built-in image tool hit its usage limit. It reported reset at September 13, 2026, 03:27:59 Eastern. Remaining: 64 ungenerated images and 8 drafts needing correction. No API fallback or automatic retry was started. Re-measure the full cache after continuing generation; exceeding 15 MB requires the specified cache-policy decision.

Local Git branch: feature/full-exercise-illustration-library, based on f32ce91ab2bb8d92b32e47ba21b9cd743d475920 in rebuildfitness/Achilles_Return. PR publication is incomplete because GitHub authentication is unavailable. Do not upload this as an assertion that the full library is finished. Review the prepared changes on a feature branch; do not merge directly to main.
