Current mobile-thumbnail update: each of the 65 full-size illustrations has a separate 192 x 288 PNG preview. Cards load previews; Enlarge loads the 640 x 960 original. Thumbnails average 19 KB (91% smaller). Both sizes cache on demand. See MOBILE_THUMBNAILS.md and the current machine-readable audit. Validation: 87 Node tests and 38 browser checks passed.

# Exercise illustration asset audit — batch 3

Created September 13, 2026. Local branch: feature/full-exercise-illustration-library; preceding commit 017408b. Repository: https://github.com/rebuildfitness/Achilles_Return. No remote push, deployment or PR publication was performed.

## Inventory and quality

Sources: src/data/catalog.js, src/data/exerciseLibrary.js, src/data/movementRoutines.json and existing media metadata. 127 unique canonical IDs: 21 prescribed, 93 strength appearances (including those 21), 34 movement entries. Repeated appearances share one physical asset. Sport exposure groups without individual IDs remain outside this mapping.

65 usable assets: 15 prescribed, 21 strength-library and 29 movement-library. 62 unresolved: 54 ungenerated and 8 rejected drafts. Full names, IDs, sources and reasons are in unresolved-exercise-assets.md and the CSV. Exact titles and source metadata are retained; illustrations do not upgrade demo verification.

All final PNGs were individually inspected for title, anatomy, equipment, phase labels, cropping and readability. Built-in image generation was used; Pillow only normalized masters to 640 × 960 grayscale optimized PNG. Prompts and master paths are retained in artifacts/illustration-reviews.json. The original pilot passed before expansion.

33 concentric/eccentric, 21 start/end, 11 setup/hold assets. Fictional model briefs: 31 women, 34 men; Black 61, White 1, East Asian 1, South Asian/Indian 1, Middle Eastern 1. Diverse representation supersedes the earlier Black-only brief per the user's request.

Image bytes: 13,088,860. Mean: 201,367. Median: 201,426. Largest: library-supine-band-clam.png, 248,392 bytes. None above 250,000 or 400,000 bytes.

## Approved caching decision

The user approved on-demand illustration caching after the eager payload reached 15,854,059 bytes. The worker now installs the app core without illustration PNGs. Successful allowlisted local PNG responses are cached on first request. Viewed images remain available offline until an app update or browser cache eviction. Unviewed images show a fallback with Retry; original setup/demo actions remain. External videos are never cached.

Initial precache is approximately 2.80 MB, below 15,000,000 bytes. See artifacts/illustration-audit-results.json for exact final core, on-demand and total production bytes. The pre-illustration baseline was 2,265,075 bytes. Measurements sum unique production files, exclude sw.js and HTTP overhead, and do not claim compressed transfer sizes.

## Validation and preserved behavior

Frozen install, TypeScript and production build passed. Node: 87 passed, 0 failed/skipped. Existing Edge browser checks: 23 passed. Illustration checks: 15 passed. This includes first installation with zero PNGs cached, viewed images offline, unviewed images/retry, responsive layout, keyboard closure, project subpath and failed requests. Existing update and local-data preservation checks pass. Physical iPhone and live Pages deployment are untested. Vite reports its existing nonfatal chunk-size warning.

The shared thumbnail/detail remains beside exercise content. Screenshot artifacts include all five batch-3 images. Detail captures hide fixed navigation during capture only.

Clinical rules, eligibility, restrictions, progression, prescribed-session authority, IndexedDB records, backup schemaVersion 2 and original demo metadata were preserved. Only the explicitly approved illustration cache policy changed.
