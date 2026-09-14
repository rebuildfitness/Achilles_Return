# Illustration batch 5 — complete source package

This package includes the complete app, all prior illustrations and the mobile-thumbnail optimization.

## New illustrations
| Exercise | Fictional model brief |
|---|---|
| Dead bug | Middle Eastern man |
| Superman | White woman |
| Stability-ball plank | South Asian / Indian woman |
| Single-leg foam-pad balance | East Asian man |
| Straight-arm cable pulldown | Black woman |

All five final 640 × 960 PNGs were individually visually inspected. The dead-bug draft was corrected to show opposite arm and leg extension. Each original has a 192 × 288 thumbnail. Generation prompts, master paths and review notes are recorded in artifacts/illustration-reviews.json. Pillow only normalizes and resizes the generated artwork.

## Coverage and download sizes
75 of 127 canonical exercises illustrated; 52 remaining: 44 ungenerated and 8 rejected drafts. Thumbnails are not additional exercises. The 21 shared collection appearances reuse their canonical assets.

Originals total 15,085,895 bytes; mean 201,145 and median 200,968 bytes. Largest is library-supine-band-clam at 248,392 bytes; none exceed 250 KB. Thumbnails total 1,422,344 bytes, averaging 18,965 bytes (91% smaller).

Motion formats: 39 concentric/eccentric, 22 start/end and 14 setup/hold. Model briefs: 36 women and 39 men; Black 62, White 3, Middle Eastern 3, East Asian 3, South Asian/Indian 3 and Latino 1. These describe fictional creative briefs, not identities inferred from real people.

Initial offline download remains approximately 2.8 MB. Exact final measurements are in artifacts/illustration-audit-results.json. Thumbnails download as cards are viewed; originals download on Enlarge. Each size caches independently for offline use after loading. Updates or browser cache eviction can require another download. External demos require internet. ZIP size is not the initial app download.

## Validation
87 Node tests passed; 0 failed or skipped. 40 browser checks passed: 23 existing app checks and 17 illustration checks. TypeScript and production build passed. The existing Vite large-chunk warning remains nonfatal.

Checks cover all five new thumbnails and enlarged images, existing demo links, offline retries, separate image requests, narrow layouts, keyboard behavior and record preservation. Dead-bug and cable-pulldown mobile screenshots were visually inspected. Tests use disposable Edge profiles. Physical iPhone and live Pages deployment were not tested for this package.

## Upload and preview
Extract this complete ZIP and copy its contents into your cloned repository root, replacing matching files and preserving folders including .github. Keep the repository's .git folder. In GitHub Desktop, review changes, commit and Push origin. Upload the extracted contents, not the ZIP or an enclosing folder. Older packages can be skipped.

Keep Settings → Pages → Source set to GitHub Actions. Wait for Test and deploy GitHub Pages to succeed, then accept Update & reload if offered. Do not clear browser data.

Local preview: pnpm build, then pnpm preview --port 4180. Open http://127.0.0.1:4180/ → Get Started → More → Exercise library. Search any new exercise and select Enlarge.

This package was prepared locally on feature/full-exercise-illustration-library. No remote push, deployment or PR was performed.

## Files changed
- Five originals in public/assets/exercises/strength-library/ and five matching thumbnails.
- Updated illustration manifest, inventory CSV and unresolved report.
- artifacts/illustration-reviews.json: prompts, master paths and visual reviews.
- scripts/illustration-browser-qa.mjs: coverage of the five additions.
- Batch 5 screenshots and test/audit results; Batch 4 screenshots are also included as review evidence.
- This guide, the public asset audit and asset README.

Clinical rules, restrictions, progression, prescriptions, demo metadata, IndexedDB records and backup schemaVersion 2 remain unchanged. Source inventory remains 21 prescribed, 93 strength appearances including those 21, and 34 movement entries. Illustrated primary ownership is 15 prescribed, 31 strength-library and 29 movement-library. Sport groups without canonical exercise IDs remain outside this inventory. Earlier batch documents are historical.
