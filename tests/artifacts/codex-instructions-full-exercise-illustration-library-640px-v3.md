# Codex Instructions: Full Achilles Return Exercise Illustration Library — v3

## Revision and intended result

This version incorporates the review corrections and the user's clarified goal: **illustrations must appear beside exercises in the Exercise Library**, including its movement-library categories. Generating an asset folder alone does not fulfill the assignment.

This is an implementation brief. When this brief is supplied for review or editing only, do not interpret its implementation instructions as authorization to begin generating assets or modifying the app.

Key revisions:

- Library thumbnails and an accessible enlarged illustration view are required, not optional.
- Thumbnail recognition and detail-view instruction have different readability criteria.
- Final assets must be exactly 640 × 960 PNG, even if generation requires larger working masters.
- Panel classification follows individual exercise mechanics rather than broad category labels.
- Cable-curl anatomical orientation, camera orientation and line of resistance must be resolved together.
- Git/PR access is checked early; missing access must not be concealed by an invented branch or PR.
- All IDs receive an inventory outcome; unresolved assets remain explicit and never block existing library use.

### Final refinements in v3

- Generate and integrate a pilot of 12–20 exercises before scaling the collection. Include cable, dumbbell/barbell, mobility, core, balance and Achilles/lower-leg examples plus a missing-image fallback. Complete internal visual and PWA checks; continue without a separate approval after they pass.
- Import the manifest as bundled JSON or generate a typed lookup during the build. No runtime network request is required to resolve illustration metadata.
- Use structured model-presentation metadata; it describes the intended generated character, not an inference about a real person.
- Apply the 15 MB initial-precache decision threshold defined below.

## Mission

Work in the existing **Achilles Return** repository and create a complete, production-ready library of individual instructional exercise illustrations for every unique canonical exercise used by the active app.

The application is a React + TypeScript + Vite Progressive Web App hosted under a GitHub Pages project subpath. It uses IndexedDB/local-first storage, deterministic clinical/rule modules, external demonstration links, and an existing exercise/movement catalog. This assignment is for **visual illustration assets and required exercise-library presentation only**.

Do not alter clinical rules, safety logic, readiness, restrictions, plan generation, prescribed-session completion, next-morning response logic, progression calculations, backup schema, database migrations, or user records. Store image-path metadata in a separate presentation manifest/adapter; no persistence or clinical-model change is required.

The final result must be a pull request, not a direct push to `main`.

---

## Required first steps

Before creating assets or editing code, read and inspect these active files:

```text
AGENTS.md
README.md
docs/MOVEMENT_RECOVERY_RELEASE.md
docs/MOVEMENT_RECOVERY_HANDOFF_V3.md
docs/DESIGN_SYSTEM.md
docs/UI_UX_SPEC.md
docs/EXERCISE_LIBRARY.md
docs/VIDEO_CATALOG.md

src/App.tsx
src/styles.css
src/types.ts
src/data/catalog.js
src/data/exercises.js
src/data/exerciseLibrary.js
src/data/movement.js
src/data/movementRoutines.js
src/data/movementRoutines.json
src/data/movementMedia.json
src/components/ExerciseLibrary.tsx
src/components/MovementLibrary.tsx
src/components/MovementDemo.tsx
src/components/ui.tsx
src/screens/Movement.tsx

spec/design-tokens-v1.json
tests/exercise-library.test.mjs
tests/movement.test.mjs
tests/demos.test.mjs
```

Inspect active imports and call paths before assuming any file is unused. The repository retains prototype files; do not change root-level prototypes such as `standalone.html` or root-level `styles.css` unless an active production import proves they are used.

---

## Branch and pull-request requirements

1. Inspect Git status, repository identity, remotes and available authenticated GitHub access before implementation. Preserve unrelated local work and verify the source checkout matches the app being enhanced.
2. Use a branch named `feature/full-exercise-illustration-library`. If it already exists, inspect it before reusing it; do not overwrite another person's work.
3. Perform repository changes on that feature branch. Never push directly to `main`, merge the PR, or deploy as part of this assignment.
4. If the supplied folder is a source-only download without Git metadata, establish a separate verified checkout of the correct repository when access is available. Do not silently initialize unrelated Git history or replace the supplied workspace.
5. If GitHub authentication or a verified repository is unavailable, identify that delivery dependency early. Continue independent inventory/asset preparation in the authorized local workspace, record the source snapshot/hash and provide reviewable files. Do not request passwords or tokens in chat. Branch creation and PR publication remain outstanding until access is available; local files are not a completed PR deliverable.
6. Create one pull request after the implementation and verification are complete. Report partial coverage honestly if individual assets remain unresolved.
7. Do not weaken, skip, disable, or delete tests to obtain a passing build.

The pull-request description must include:

- Total canonical exercise IDs found.
- Total unique image assets generated.
- Number of duplicate appearances deduplicated.
- Number of dynamic Concentric/Eccentric illustrations.
- Number of Setup/Hold and Start/End illustrations.
- Number of generated illustrations with no externally verified demo.
- Number of unresolved/no-image entries.
- Every unresolved exercise name, ID, mechanics, media, or source-metadata issue.
- Exact changed-file inventory.
- Typecheck, Node test, production build, and browser-QA results.
- Total generated-asset size, mean/median image size, largest asset, and number of images above the review threshold.
- Explicit confirmation that clinical rules, restrictions, progression, prescribed-session authority, user records, and `schemaVersion: 2` were not changed.

---

## Scope and safety boundary

This project is a **visual-asset and required library UI-presentation enhancement only**. Illustration availability is optional per exercise at runtime; implementing the library integration is mandatory.

Do not change:

- Current clinical rules or rule priorities.
- Readiness logic.
- Restriction logic.
- Baseline measurements.
- Baseline tests or clinical entry criteria. Existing software-test assertions must be preserved; add targeted tests for this enhancement.
- Tolerance/progression calculations.
- Required next-morning response behavior.
- Plan generation.
- Prescribed-session authority or completion state.
- Movement-record logic.
- `schemaVersion: 2` backup contract.
- IndexedDB structure or migration behavior.
- Existing external demo URLs or demo fallback behavior.

Generated illustrations must be treated as supplemental instruction. They do not provide medical clearance, exercise eligibility, plan adherence, tolerance evidence, progression credit, or a replacement for external demo references.

---

## Canonical inventory rules

Create images for every **unique canonical exercise ID** present in active app collections. Do not rely on display names alone, because names can overlap across sources.

Build the inventory from:

1. `src/data/catalog.js` — prescribed exercise catalog.
2. `src/data/exerciseLibrary.js` — expanded Exercise Library.
3. `src/data/movementRoutines.js` and `src/data/movementRoutines.json` — mobility, core, balance, lower-leg, and recovery-routine exercises.
4. `src/data/exercises.js` — retained foundation data only when currently imported/used by active catalog or planner logic.

### Deduplication rules

- Deduplicate first by canonical `exerciseId` or `id`.
- Record raw appearances and unique IDs per source collection separately. Importing movementRoutines.json through movementRoutines.js is not a new collection appearance by itself. Compute deduplicated collection appearances from distinct (collection, ID) pairs.
- Count only actual exercise definitions. Generic activity records such as an 8,000-step walk are not separate exercise IDs merely because they appear in a logger.
- Inspect active exposure/drill call paths as a coverage check. If a distinct active exercise is outside the named collections, include it when its stable ID and mechanics are clear, or report the coverage gap explicitly. Do not claim complete active-app coverage based solely on scanning four filenames.
- If different collections use different IDs for what appears to be the same movement, do not silently merge them.
- Record ID/name/mechanics conflicts in the unresolved report. A matching ID with conflicting titles or mechanics is a conflict to resolve, not permission to choose whichever title was read last.
- If one canonical exercise appears in multiple collections, generate one physical image asset and map all source collections to the same asset path.
- Use the exact current app display name as the illustration title and manifest `exerciseName`.
- Do not silently correct, simplify, or rename app display names.
- If an exercise has no stable ID, ambiguous mechanics, incomplete setup information, or unresolved title conflict, do not create a misleading image. Mark it `needs_product_review` in the source inventory and report it. For an item without an ID, retain its source location in the unresolved report rather than inventing an app canonical ID.
- Every resolved canonical ID receives a manifest record, even if no image can be produced. Every source item without a resolvable ID receives an unresolved-report entry.
- An absent verified video does not automatically block an illustration when existing setup and credible exercise-specific references establish the mechanics. Record those references and the verification limits. If mechanics remain uncertain, block only that image and report why.
- Do not rename the exercise to fit this brief. The cable-curl title and example filenames below must be reconciled with the actual runtime ID/title before generation.

---

## Required folder structure

Create this structure:

```text
public/assets/exercises/
├── README.md
├── manifests/
│   ├── exercise-illustrations.json
│   ├── exercise-illustration-inventory.csv
│   ├── unresolved-exercise-assets.md
│   └── asset-audit.md
├── prescribed/
├── strength-library/
├── movement-library/
│   ├── mobility/
│   ├── core-stability/
│   ├── balance-movement-control/
│   ├── achilles-lower-leg/
│   └── recovery-practice/
└── shared/
```

### Placement rules

- Store one physical file for each unique canonical exercise ID.
- If an exercise exists in multiple collections, choose its most appropriate primary folder and map all collection references to that one asset path.
- Use `shared/` only when no one collection is an obvious primary home.
- Do not duplicate PNG files because the same exercise appears in both prescribed content and the reference library.

---

## File naming rules

Use stable, lowercase, kebab-case filenames derived from canonical exercise IDs whenever possible:

```text
{canonical-exercise-id}.png
```

Examples:

```text
seated-unilateral-cable-hamstring-curl.png
straight-bar-cable-triceps-extension.png
knee-to-wall-mobility.png
dead-bug.png
supported-single-leg-stance.png
```

Rules:

- No spaces.
- No sequence number as the primary naming convention.
- No filename based solely on display name if a canonical ID differs.
- Detect collisions when normalizing IDs into filenames. Preserve the exact canonical ID in the manifest and use a stable ID-derived disambiguator for colliding filenames; never overwrite an image or merge distinct IDs.
- Keep filenames stable after initial generation so later display-name changes do not break asset paths.
- Generate PNGs unless the current app pipeline requires another format.

---

## Image specifications

Every exercise image must be a **separate, finished, reusable portrait asset**.

Do not generate contact sheets, grids, collages, sprite sheets, combined exercise posters, or multi-exercise assets.

### Required output size

Generate every individual image at:

```text
640 × 960 pixels
PNG
2:3 portrait ratio
```

**640 × 960 PNG is the mandatory final deliverable size.** A prompt requesting that size is not proof that a generation tool returned it.

Use the available image-generation/editing workflow and its tool/skill instructions. If the generator produces a larger working master, normalize it to 640 × 960 using the supported image-processing workflow before delivery. Maintain the 2:3 composition; do not stretch anatomy or crop titles/equipment to force the dimensions. Larger working masters may be retained outside the shipped asset folder, but must not be delivered as replacements for the required files.

Inspect the final normalized PNG, not only the master. If clarity fails, revise composition, line weight, title wrapping or panel layout and regenerate. Do not silently change the format or delivered dimensions. Report genuinely unresolved output limitations.

### File-size requirements

Target:

```text
Under 250 KB (250,000 bytes) per PNG where practical
```

Review threshold:

```text
Flag every asset above 400 KB (400,000 bytes) in asset-audit.md.
```

Do not make line work, labels, arrows, body position, or equipment geometry unreadable merely to meet a file-size target.

### Required visual system

- Pure white background.
- Clean high-contrast black-and-white instructional vector/line-art style.
- Palette restricted to black, white, and restrained light-gray shading.
- No color accents.
- No logos, brand marks, watermarks, app UI, advertising treatment, or stock-photo aesthetic.
- No irrelevant gym clutter or background scenery.
- Equipment may appear only when needed to teach safe setup.
- Bold, readable anatomical outlines.
- Simple directional arrows that clarify movement direction.
- Sufficient white space for mobile use.
- Exact current app display name at the top of every image.
- All title and panel-label text correctly spelled and fully inside the canvas.
- Two vertically stacked panels separated by a thin light-gray divider.
- Consistent title placement, panel labels, arrow style, margins, line weight, model scale, and panel proportions across the entire library.
- At compact size, the thumbnail must make the exercise/body position and relevant equipment recognizable. Its raster title and phase labels are not expected to serve as readable instruction at 72–96 CSS px.
- At detail size, the complete title, panel labels, motion arrows and equipment relationships must be readable. Wrap long exact titles without truncating or silently shortening the app name. Preserve readable HTML title and panel-description text alongside/below the image.

---

## Model representation requirements

Use a balanced, intentional variation of:

- Fit adult Black women.
- Fit adult Black men.

Rules:

- All models must clearly be adults.
- Use practical, modest training clothing.
- Vary gender presentation, skin tones, hairstyles, physiques, and clothing silhouettes across the catalog.
- Maintain athletic but realistic body proportions.
- Do not use sexualized poses, exaggerated bodybuilding proportions, stereotypes, or childish/cartoon presentation.
- Do not assign one gender exclusively to strength and another exclusively to mobility/core/balance.
- Include Black women and Black men throughout cable, dumbbell, bodyweight, mobility, core, balance, lower-leg, and conditioning-related assets.
- Use neutral, focused facial expressions.
- Prioritize anatomically plausible movement and safe positioning.

Target an approximately balanced overall distribution across all generated unique assets.

---

## Motion-panel standards

Do not use Concentric/Eccentric labels when they do not accurately apply.

### A. Dynamic resistance movements

Use when the exact exercise contains a meaningful shortening and controlled lengthening phase under resistance, such as many presses, rows, curls, extensions, raises and loaded calf repetitions.

Classify each exercise individually. Do not automatically assign step-downs, balance reaches, carries or all “dynamic” movements to this format. A prescribed lowering-only step-down must not be illustrated as requiring an unprescribed concentric return on the working leg. Identify the loaded joint action, resistance direction and approved return method; use Start/End when that is more accurate, or `needs_review` if the mechanics are unresolved.

```text
TOP PANEL: CONCENTRIC
BOTTOM PANEL: ECCENTRIC
```

Requirements:

- Concentric panel shows the active shortening/effort phase.
- Eccentric panel shows the controlled return/lengthening phase.
- Include one subtle movement arrow in each panel.
- Keep model, camera angle, stance, equipment, and visual scale consistent across panels.
- Show accurate, controlled range of motion.

### B. Isometric and anti-movement exercises

Use for static holds, anti-rotation holds, carries where a static representation is more accurate, bracing, and static balance.

```text
TOP PANEL: SETUP
BOTTOM PANEL: HOLD
```

Requirements:

- Setup shows safe body/equipment position before the effort.
- Hold shows the stable working position.
- Use arrows only if needed to clarify entry into the position.
- Do not imply a false repetitive contraction cycle.

### C. Mobility, stretching, and breathing

Use for stretches, breathing, mobility drills without meaningful concentric/eccentric distinction, and controlled range-of-motion exercises.

Use either:

```text
TOP PANEL: SETUP
BOTTOM PANEL: HOLD
```

or:

```text
TOP PANEL: START
BOTTOM PANEL: END
```

Requirements:

- Use comfortable, controlled therapeutic range.
- Do not depict forced ankle, spine, hip, shoulder, or neck end range.
- Use a small movement arrow where it improves clarity.

### D. Locomotion/conditioning

If an exercise is classified as locomotion or conditioning rather than a generic activity record, use a mechanically accurate pair such as:

```text
TOP PANEL: DRIVE / WORK
BOTTOM PANEL: RETURN / RECOVERY
```

Do not invent eccentric/concentric language where it does not correctly describe the exercise.

---

## Exercise-specific setup requirements

### Cable exercises

For every cable exercise:

- Show correct pulley height: low, mid, or high.
- Show a taut, visible cable path.
- Use the correct attachment: straight bar, rope, D-handle, ankle cuff, etc.
- Show stable, safe stance/orientation relative to cable tower.
- Do not place body or bench unrealistically against the cable tower.
- Make the overall line of pull recognizable at thumbnail size and the exact attachment/pulley relationship readable in the enlarged view.

### Required correction: Seated Unilateral Cable Hamstring Curl

For the exercise whose exact app title is **Seated Unilateral Cable Hamstring Curl**:

- Preserve the intended seated unilateral exercise on a flat adjustable bench, with the right ankle cuff connected to a low pulley.
- Resolve the exact runtime title and ID first. Do not create a renamed duplicate if the title differs from the wording above.
- Define “right” as the model's **anatomical right**, not automatically the viewer's right. Record the camera angle separately in the asset notes and use the same view in both panels.
- Show the bench separated from the tower by clear floor space, representing the requested approximately **5–6 feet**. Treat this as the requested depiction, not a universal equipment setup rule or dosing instruction.
- The tower must be placed with a fore/aft relationship that produces resistance to the depicted knee-flexion action, not merely pulled sideways because it appears to the model's right. Validate this geometry against the exercise's setup and a credible exercise-specific reference before rendering.
- If the right-side placement, requested spacing or “sideways on the bench” description conflicts with the verified exercise mechanics, report that specific conflict and mark this asset `needs_product_review`. Do not silently override the constraint or render an implausible setup.
- Show a continuous, unobstructed, taut cable from low pulley to the right ankle cuff. Keep the ankle attachment, cable path and body/bench separation visible in the enlarged view and recognizable in the thumbnail.
- Concentric: depict the specified right knee-flexion/heel-curl action against the cable resistance.
- Eccentric: depict its controlled forward return through knee extension, with the same model, camera, equipment and attachment.
- Do not show the bench touching, immediately adjacent to, merged with the tower or intersected by the cable.

### Dumbbell and barbell exercises

- Show realistic equipment paths.
- Use neutral, controlled joint positions.
- Keep bench angle, grip, stance, and limb position faithful to the precise exercise name.
- Do not introduce equipment not supported by the exercise setup.
- Do not show unsafe loading or exaggerated range.

### Mobility, core, and balance exercises

- Use support such as a wall, rack, stable bench, chair, or floor when appropriate.
- Make setup and alignment easy to understand.
- Show left/right side clearly for unilateral exercises.
- Do not exaggerate ankle dorsiflexion, spinal rotation, hip range, or unstable balance positions.
- For anti-rotation/bracing work, emphasize stable trunk, cable/band direction, and lower-body position.

### Achilles-sensitive exercises

- Follow current app exercise definitions and existing restrictions/labels.
- Do not use imagery that implies universal readiness for impact, running, jumping, or high-load work.
- Illustrations are instructional only and must not influence eligibility, plan, or progression logic.

---

## Required inventory process

### Step 1: Create machine-readable inventory

Create:

```text
public/assets/exercises/manifests/exercise-illustration-inventory.csv
```

Required columns:

```csv
canonical_exercise_id,exact_app_display_name,source_collections,primary_collection,primary_category,body_region,position,equipment,motion_format,requires_clinical_or_rule_review,existing_demo_status,asset_status,asset_filename,notes
```

Allowed `motion_format` values:

```text
concentric_eccentric
setup_hold
start_end
locomotion_cycle
needs_review
```

Allowed `asset_status` values:

```text
pending_generation
generated
needs_product_review
not_generated
```

### Step 2: Resolve each item

For every unique exercise:

- Resolve canonical active ID.
- Resolve exact app display name.
- Identify all source collections.
- Identify primary collection/folder.
- Identify primary category.
- Identify body region, position, and required equipment.
- Select correct image motion format.
- Identify whether an existing clinical/restriction/rule reference affects how the exercise should be represented.
- Identify existing demo status without changing any existing demo media.

### Step 3: Create unresolved-items report

For unresolved entries, create:

```text
public/assets/exercises/manifests/unresolved-exercise-assets.md
```

For each item include:

- Source file(s).
- Canonical ID/name issue.
- Why mechanics/setup/media cannot be represented confidently.
- Which asset(s) the issue blocks and which routines reference them. Missing artwork must not disable those routines or change existing exercise eligibility.
- Recommended product/content decision.

Do not fabricate a misleading asset for an unresolved exercise.

---

## Required illustration manifest

Create:

```text
public/assets/exercises/manifests/exercise-illustrations.json
```

Include one record for every unique canonical exercise ID, including unresolved/no-image records.

The following is an illustrative schema example, **not an authoritative ID, title, equipment list or generated record**. Replace example identifiers and collection membership with inspected runtime values; never copy an invented ID into production. Use the actual app ID even if its filename uses a normalized kebab-case form.

Use this shape:

```json
[
  {
    "exerciseId": "seated_unilateral_cable_hamstring_curl",
    "exerciseName": "Seated Unilateral Cable Hamstring Curl",
    "sourceCollections": ["prescribed", "strength-library"],
    "primaryCollection": "strength-library",
    "primaryCategory": "strength",
    "bodyRegions": ["hamstrings", "knee"],
    "position": "seated",
    "equipment": ["adjustable_bench", "cable_station", "ankle_cuff"],
    "motionFormat": "concentric_eccentric",
    "assetStatus": "generated",
    "assetPath": "/assets/exercises/strength-library/seated-unilateral-cable-hamstring-curl.png",
    "assetDimensions": {
      "width": 640,
      "height": 960
    },
    "assetFormat": "png",
    "assetFileSizeBytes": 0,
    "optimizedFor": ["mobile_library_thumbnail", "exercise_detail_view"],
    "altText": "Seated Unilateral Cable Hamstring Curl illustration showing a concentric heel curl and controlled eccentric return.",
    "modelRepresentation": {
      "raceEthnicityPresentation": "Black",
      "genderPresentation": "woman",
      "ageGroup": "adult"
    },
    "illustrationVersion": "1.0.0",
    "existingDemoStatus": "external_reference",
    "clinicalRuleReference": null,
    "notes": "Bench positioned approximately five to six feet from low cable tower; long taut cable to right ankle cuff."
  }
]
```

Rules:

- Replace `assetFileSizeBytes: 0` with the actual final image size in bytes.
- For `generated` records, `assetPath` must start with `/assets/`, and dimensions/format/size must match the final file.
- For `needs_product_review` or `not_generated`, use `assetPath: null`, `assetDimensions: null` and `assetFileSizeBytes: null`. Do not create nonexistent file paths or claim generated dimensions.
- `pending_generation` is permitted in the work-in-progress CSV. Before delivery, resolve it to `generated`, `needs_product_review` or `not_generated`; do not hide pending work inside final counts.
- Record exercise-mechanics reference URLs/source locations and how they were checked in an additional `mechanicsSources` field or linked audit entry. Generated artwork is never classified as externally verified demo media.
- Use the app’s existing Vite/GitHub Pages base-path handling when rendering paths; do not assume `/assets/` works unchanged at a project subpath.
- Include a record even when `assetStatus` is `needs_product_review` or `not_generated`.
- Do not change existing demo URLs.
- Do not label generated illustrations as verified clinical videos or external demonstrations.
- For exercises in several collections, list all `sourceCollections` but use one physical `assetPath`.

---

## Asset README

Create:

```text
public/assets/exercises/README.md
```

It must explain:

1. Purpose of the illustration library.
2. Folder structure.
3. Canonical-ID and filename rules.
4. Image dimensions: 640 × 960 PNG.
5. Target/review file-size rules.
6. Panel-label conventions: Concentric/Eccentric, Setup/Hold, Start/End.
7. That images are instructional illustrations—not medical clearance, clinical eligibility, or a replacement for existing external demos.
8. Model-representation approach using varied fit adult Black men and women.
9. How the required library UI maps an illustration to an exercise ID, with optional per-record availability.
10. Graceful behavior when an exercise has no illustration.
11. GitHub Pages/Vite base-path convention.
12. Offline behavior: local image assets may be cacheable with the PWA; external demos require internet unless separately bundled.
13. How to add a future asset without breaking stable mappings.

---

## Required Exercise Library UI integration

**The user must see an illustration beside the exercise in the library.** Do not deliver only asset files, hide all images in a disclosure, or stop at an unused lookup module.

Implement this in both:

- `src/components/ExerciseLibrary.tsx` — expanded/prescribed reference entries.
- `src/components/MovementLibrary.tsx` — movement category entries.

Also provide an accessible enlarged view from each available thumbnail, using a shared detail/disclosure/modal component where appropriate. Integration into workout logging or other unrelated screens is not required by this assignment.

### Required row/card arrangement

- Place a compact portrait thumbnail on the **left**, directly beside the exercise's text block, not as a large banner above the exercise.
- Keep the exact exercise name as normal, readable HTML text on the right. Show the existing equipment/category information and existing actions without replacing them with text embedded in the PNG.
- Provide a labeled control such as “View illustration for [exercise name]” to open the larger view. The thumbnail may be that control; avoid nested buttons or making the whole row hijack existing links.
- The enlarged view must show the complete image and retain access to setup text, panel descriptions and existing Short Demo links. If using a modal, provide keyboard opening/closing, Escape dismissal, focus management and focus restoration; an accessible inline disclosure is also acceptable.
- Use the current design tokens, navy/off-white/card system and existing spacing. The monochrome artwork does not replace the app's approved color scheme.
- Preserve search, filters, sorting, pagination, categories and existing actions. Every visible result with a generated asset must show its own mapped thumbnail, including after filtering and pagination.

### Missing-image behavior

- Runtime image availability remains optional, even though implementing the UI is required.
- For absent metadata, unresolved assets or a failed image request, keep the row usable and suppress broken-image icons. Use a neutral reserved frame labeled “Illustration unavailable” or the existing text-only layout; apply one consistent fallback across both libraries.
- A neutral placeholder is not counted as an exercise illustration and must not masquerade as the movement's technique.
- Missing illustrations never disable browsing, logging, routines, guidance, external demos, criteria or progression. Do not make an image required to complete an exercise.
- Retain every existing external demo URL and written fallback. A generated illustration does not replace an external demonstration.

### Recommended isolated asset adapter

Prefer a separate asset lookup module rather than rewriting clinical/catalog models broadly:

```ts
export type ExerciseIllustration = {
  exerciseId: string;
  exerciseName: string;
  assetPath?: string | null;
  assetStatus: 'generated' | 'needs_product_review' | 'not_generated';
  altText?: string;
  motionFormat?: 'concentric_eccentric' | 'setup_hold' | 'start_end' | 'locomotion_cycle';
};
```

Import the manifest as bundled JSON, or generate a typed TypeScript lookup module from it during build. Do not fetch the manifest at runtime; metadata resolution must not depend on a network request or delay initial library mapping.

Look up illustration metadata by canonical `exerciseId`. Keep image paths in this isolated presentation layer; do not make them mandatory fields of clinical exercise definitions, even after inventory completion.

### Responsive display rules

Use the same 640 × 960 source in these display contexts:

| Context | Rendered width | Behavior |
|---|---:|---|
| Compact library row/card | 72–96 CSS px | Left-side 2:3 frame with `object-fit: contain`; readable HTML exercise text beside it; no instructional cropping |
| Enlarged illustration view | Up to 240–320 CSS px, constrained by available width | Preserve complete 2:3 image; title, phase labels and mechanics readable; no clipping or cropping |

Requirements:

- Use `loading="lazy"` for offscreen library assets.
- Reserve image ratio/dimensions to prevent layout shift.
- Do not normally upscale a 640 × 960 source beyond approximately 320 CSS px.
- Keep text instructions, safety cues, setup guidance, and demo links available even when an image is displayed.
- At 320 CSS-pixel viewport width, use a 72-pixel thumbnail and flexible text column with `min-width: 0`; wrap long HTML names and put actions on the next line when needed. Preserve the side-by-side thumbnail/text relationship at normal text size.
- At enlarged text/zoom, allow safe reflow if necessary rather than clipping content to preserve a rigid row. Do not reduce text size to force a fit.
- Do not require the PNG's internal title/phase text to be legible in a 72–96-pixel thumbnail. Recognition comes from the silhouette/equipment; readable identification comes from adjacent HTML. Enlarge for instructional detail.

### GitHub Pages requirement

The project deploys under a GitHub Pages project subpath. Confirm the rendering helper uses the project’s existing Vite base-path convention, for example `import.meta.env.BASE_URL` where appropriate.

Do not hard-code an image URL that fails under `/Achilles_Return/`.

---

## Accessibility requirements

- Every displayed non-decorative image needs meaningful alt text. If a thumbnail is an interactive control, its accessible name must identify both the exercise and the action of opening the illustration.
- Alt text must name the exercise and describe its panel format, not say only “exercise image.”
- Images must not be the sole source of setup or safety information.
- Preserve text instructions, equipment guidance, and current external-demo links.
- Do not rely on arrows, shading, or visual state alone for safety-critical instruction.
- Prevent horizontal overflow, overlapping controls, or text clipping at large text sizes.
- Maintain clear black/white/gray contrast.
- Use empty alt text only for a purely decorative duplicate image next to an already accessible equivalent label; otherwise use manifest alt text.

---

## Performance and PWA requirements

- Target image size under 250 KB per PNG where practical.
- Flag every image above 400 KB in the audit.
- Use lazy loading below the fold.
- Reserve fixed image aspect ratio to prevent layout shift.
- Inspect the current worker build script before integration: it currently enumerates production files. Confirm that generated assets are listed and that the larger cache installs successfully.
- Lazy loading reduces rendering/fetch demand in the library but does not reduce a worker's eager precache. Measure and report initial cache download size and offline availability separately. Do not silently change the PWA cache strategy to hide the added library size.
- Record actual observations for development, preview, subpath simulation, deployed Pages and physical iPhone testing separately. An emulated viewport is not an installed iPhone PWA test; if a deployment/device is unavailable, report it as not tested.
- Do not cache or claim to cache external demonstration/video URLs.
- Verify asset loading in:
  - Local Vite development.
  - Production preview.
  - GitHub Pages project-subpath deployment.
  - Installed iPhone PWA where feasible.
  - Offline mode for locally bundled/cached assets.
- If PNGs cannot meet size/clarity requirements, document the issue and propose an optimized format only if it is compatible with the existing browser/build pipeline. Do not silently change all files to another format.

---

### Initial precache budget

Use **15 MB = 15,000,000 bytes** as the review threshold for the full initial precache payload after illustrations are added. Measure the existing precache, the incremental illustration contribution and the resulting total separately, without double-counting repeated manifest URLs. Also report observed transfer/install behavior where testable.

If the resulting initial payload exceeds 15 MB, do not silently ship all illustrations in the eager cache. Document the measurements and propose a selectively cached core set, runtime caching with a clear offline fallback, or an explicitly reviewed optimized format that preserves quality. Complete independent generation and UI validation, but mark cache-policy resolution as an outstanding release decision. Do not silently change the established cache policy or PNG requirement to pass the threshold.

## Asset audit

Create:

```text
public/assets/exercises/manifests/asset-audit.md
```

Include:

- Creation date.
- Branch name and commit used to extract inventory. If repository access was unavailable during preparation, record that limitation and the source-snapshot hash; do not fabricate a commit or branch.
- Exact source files scanned.
- Number of IDs discovered per source collection.
- Number of unique IDs after deduplication.
- Number of duplicate collection appearances mapped to shared assets.
- Number of generated assets by primary category.
- Number of images grouped by the structured modelRepresentation fields (raceEthnicityPresentation, genderPresentation and ageGroup).
- Number by motion format.
- Number of external-demo references compared with generated illustrations.
- Number of unresolved/no-image records.
- Total image-library size in bytes and decimal MB (1 MB = 1,000,000 bytes).
- Mean and median image size.
- Largest asset filename and size.
- Count of files above 250 KB.
- Count of files above 400 KB.
- Confirmation that every generated image is 640 × 960 PNG.
- Pilot membership and internal review results; manifest bundling checks; baseline, added and total precache bytes and the 15 MB decision outcome.
- Known limitations.
- Confirmation that generated illustrations are supplemental visuals and do not change eligibility, prescription, clinical rules, tolerance, progression, or demo metadata.

---

## Mandatory quality-control process

### Inventory validation

Before opening a pull request, confirm:

1. Total source inventory count.
2. Total unique canonical ID count.
3. Generated asset count equals manifest records with `assetStatus: generated`.
4. Every generated manifest path exists.
5. Every manifest ID maps to an active exercise definition.
6. No duplicate physical asset exists solely due to a multi-collection appearance.
7. Every generated image title exactly matches active app display name.
8. Concentric/Eccentric labels are used only when the exact resistance mechanics support both phases; lowering-only and dynamic balance actions receive individual review.
9. Mobility, stretches, breathing, static balance, and isometric exercises use Setup/Hold or Start/End panels.
10. Every image is 640 × 960 PNG.
11. Every image has a white background and consistent black/white/light-gray style.
12. Representation varies across fit adult Black women and Black men.
13. Cable tower, pulley height, attachment, cable line, bench distance, and body position are mechanically accurate.
14. At thumbnail scale, body position and relevant equipment are recognizable and adjacent HTML labels are readable. In the enlarged view, the complete image title, phase labels, arrows and equipment connections are readable.

### Required visual spot check

Inspect at both card and detail size:

1. One cable exercise.
2. One dumbbell or barbell exercise.
3. One mobility exercise.
4. One core exercise.
5. One static balance or isometric hold.

Review **every generated final asset** for exact title, anatomy, equipment, cable geometry, phase correctness and final dimensions. Automated dimensions/path checks are not a substitute for visual review. Begin with 12–20 representative exercise illustrations, integrate them in both libraries and test the missing-image fallback. Cover cable, dumbbell/barbell, mobility, core, balance and Achilles/lower-leg content. Complete internal visual and PWA checks on this pilot before generating the remainder. No separate user approval is needed to continue once the pilot passes.

The five categories above are the minimum end-to-end UI spot checks, not permission to skip asset review elsewhere. At thumbnail size, reject confusing silhouettes, hidden equipment or wrong ID mappings; do not reject solely because raster title/phase text is too small. At detail size, regenerate any image with unreadable titles/labels, unclear arrows or implausible mechanics. Missing/unresolved assets must be reported rather than described as completed coverage.

### Commands to run

Run and report results for:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm test:browser
```

Do not report completion if any previously passing test was removed, weakened, skipped, or disabled.

### Required test coverage

Add targeted tests for:

- Every generated manifest entry references an existing canonical exercise ID.
- Every generated asset path maps to a real asset file.
- Multi-collection references share one asset without duplicate files.
- Missing image metadata falls back gracefully in Exercise Library and Movement Library.
- Image paths work with the Vite/GitHub Pages base path.
- Existing external demo links and offline fallback text remain available.
- Existing movement logging, prescribed workout authority, restrictions, safety checks, progression, routine execution, and backup/import behavior are unchanged.

### Browser QA scenarios

Verify:

1. A strength-library exercise renders a generated thumbnail.
2. A movement-library mobility exercise renders a generated thumbnail.
3. An exercise without a generated asset retains the existing UI gracefully.
4. Exercise detail displays the larger illustration and keeps setup/demo guidance visible.
5. Narrow iPhone viewport shows the illustration beside readable HTML exercise text without clipping/overflow or obstructed controls; the enlarged view has readable full image title/panel labels.
6. Large text does not overlap the image, title, controls, or demo links.
7. Offline mode handles local images according to the app cache policy and clearly identifies external demos as internet-dependent.
8. GitHub Pages production base path resolves illustration URLs correctly.
9. Filtering, pagination and category changes retain correct image-to-ID mapping in both libraries.
10. A deliberately failed image request shows the same usable fallback as missing metadata.
11. Keyboard users can open/close the illustration view, return to their original position and still access the external demo.
12. Local asset loading and initial PWA cache installation remain usable with the full generated collection.

---

## Prohibited actions

Do not:

- Generate contact sheets in place of individual assets.
- Use one generic image/silhouette for unrelated exercises.
- Omit the exact app exercise title.
- Apply eccentric/concentric labels inaccurately to static exercises.
- Use impossible cable geometry, pulley placement, attachment choice, or bench location.
- Put the bench against the cable tower for Seated Unilateral Cable Hamstring Curl.
- Use generated imagery as a clinical clearance, restriction, progression, or plan signal.
- Add a duplicate generic Achilles prescription.
- Alter `schemaVersion: 2`, backup/import compatibility, user data, or movement persistence.
- Alter clinical rule logic to accommodate asset metadata.
- Replace external demo links with generated illustrations.
- Claim an illustration is a verified medical/exercise video.
- Remove or weaken tests.
- Merge or push directly to `main`.

---

## Required final response from Codex

Report implementation and delivery status separately. If repository access prevented PR publication, explicitly state that the PR requirement remains incomplete and provide the prepared local artifacts rather than inventing a URL. If any assets remain unresolved, say “library integration delivered with N unresolved illustrations,” not “every exercise illustrated.”

When the branch and pull request are ready, provide:

1. Pull request URL and branch name.
2. Total canonical exercise IDs discovered.
3. Total unique image assets generated.
4. Duplicate-appearance count and how shared assets were mapped.
5. Counts by motion format and model representation.
6. Total image-library size, mean/median size, largest asset, files over 250 KB, and files over 400 KB.
7. Exact locations of:
   - `exercise-illustrations.json`
   - `exercise-illustration-inventory.csv`
   - `unresolved-exercise-assets.md`
   - `asset-audit.md`
   - `README.md`
8. Full list of unresolved name/ID/mechanics/media/source issues, if any.
9. Required library UI summary and screenshots: side-by-side thumbnails in both libraries, an enlarged illustration, and a missing-image fallback.
10. Typecheck, Node test, production build, and browser-QA outcomes.
11. Any intentionally unchanged files.
12. Explicit confirmation that clinical rules, restrictions, progression, prescribed-session authority, user records, backup schema `schemaVersion: 2`, and existing demo metadata were preserved.


---

## Definition of done — user-visible outcome

The feature is ready for review when:

1. Opening the Exercise Library visibly shows a matching illustration beside each exercise with a generated asset, including movement-library categories.
2. Each available thumbnail opens an accessible larger illustration with existing text guidance and demo links retained.
3. The full active exercise inventory has been accounted for by stable ID, with actual generated coverage and unresolved exceptions reported separately.
4. Every shipped image is a visually checked 640 × 960 PNG in the agreed style; no contact sheets or generic substitutes count toward coverage.
5. Missing assets and failed image requests leave all existing actions functional.
6. Inventory/path/base-path/fallback tests and the existing application suites pass without weakening prior coverage.
7. Clinical, persistence and demo behavior remain unchanged.
8. The branch and PR exist, or the external access blocker is explicitly reported as an outstanding delivery item. A source package is not represented as an already-published PR.
