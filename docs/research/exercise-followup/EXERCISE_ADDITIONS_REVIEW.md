# Exercise additions review

Prepared 2026-09-16 for developer review against app context 1.4.0.

## Executive summary

All 24 candidates were checked across the exported active catalog, exercise library, calf pathway and movement-support collection. No exact existing equivalent was found. Twenty-one are content candidates and three are deferred for equipment/clinical feasibility. Every record remains non-automatic: `approvedForAutomaticScheduling` is `false`, and none is implemented, unlocked, scheduled or clinically cleared by this handoff.

Recommendation counts: **21 add**, **3 defer**, **0 existing-equivalent**, **0 enrich-existing**, **0 reject-with-reason**. Totals reconcile to **24**.

The three deferred records are the weighted-wagon forward push (#10), weighted-wagon forward pull/march (#11), and backward treadmill walk (#12). The owned wagon is not a purpose-built sled, and the treadmill model/manual and safe reverse-use setup are unknown.

### Clinical and rule boundary

This is content research only. Existing criteria, readiness states, red flags, symptom thresholds, next-morning checks, missed-session handling, exposure spacing, and progression logic remain unchanged. Calendar time since surgery is not used as clearance. A 90% limb-symmetry value is not presented as universal clearance. Entry criteria, training targets and late-stage return-to-sport targets remain separate. No surgeon-specific protocol is asserted.

The supplied `(1)` copies of `checkpoints.js`, `evidence.js`, `exposures.js`, and `newEquipmentExercises.js` are byte-for-byte identical to the earlier copies. The newly supplied `progression.js`, `automaticPlan.js`, `planner.js`, and `ownedLoads.js` are consistent with the handoff boundaries: pending next-morning responses block relevant progression; red/modified readiness gates loading; and strength progression requires the recorded prescription, quality, effort, symptoms and tolerated status. The 225 lb belt-squat value is a personal transition-review milestone, and the 380 lb value is plate inventory—neither may be inherited as a starting load, readiness target or equipment capacity for candidates 17–18.

`educationalDose` is deliberately `null` for every candidate because no candidate-specific sets, repetitions, duration, rest or starting load can be supported without inventing a prescription.

## Duplicate and decision table

| # | Candidate | Recommendation | Existing IDs checked as closest matches | Material distinction | Proposed placement |
|---:|---|---|---|---|---|
| 1 | Tibialis raise | add | None | No exact or closely named catalog record found. | movement-support candidate |
| 2 | Banded ankle dorsiflexion | add | `knee-to-wall-dorsiflexion-mobility` | Existing item trains mobility; candidate adds external dorsiflexion resistance. | movement-support candidate |
| 3 | Short-foot / arch-dome exercise | add | None | No exact or closely named catalog record found. | movement-support candidate |
| 4 | Toe yoga / independent great-toe control | add | None | No exact or closely named catalog record found. | movement-support candidate |
| 5 | Straight-knee 2-up/1-down calf raise | add | `bilateral-calf`, `single-calf`, `calf-assisted` | Both phases are bilateral in the existing item.; Both phases are unilateral in the existing item.; Assistance differs from bilateral ascent and unilateral lowering. | active-program candidate requiring review |
| 6 | Bent-knee soleus isometric | add | `calf-isometric-single`, `seated-calf`, `calf-bent-standing` | Existing isometric uses a straight-knee single-leg setup.; Existing bent-knee work is dynamic.; Existing bent-knee work is dynamic. | active-program candidate requiring review |
| 7 | Terminal knee extension | add | None | No exact or closely named catalog record found. | movement-support candidate |
| 8 | Cable hip adduction | add | `library-cable-hip-abduction` | Opposite frontal-plane direction; not a duplicate. | library-only |
| 9 | Cable resisted march / hip flexion | add | `seated-march`, `seated-core-march` | Seated and unresisted; lower stance demand.; Trunk-control exercise rather than standing cable hip flexion. | library-only |
| 10 | Weighted-wagon forward push | defer | `weighted-wagon-backward-drag` | Same substitute device but opposite travel direction and different attachment/body position. | library-only |
| 11 | Weighted-wagon forward pull / march | defer | `weighted-wagon-backward-drag` | Same substitute device but different travel direction, attachment and propulsion demand. | library-only |
| 12 | Backward treadmill walk | defer | None | No exact or closely named catalog record found. | library-only |
| 13 | Trap-bar Romanian deadlift | add | `dumbbell-romanian-deadlift`, `library-barbell-romanian-deadlift`, `library-trap-bar-deadlift` | Same hinge family with different implement and load position.; Same named hinge with different bar geometry.; Trap-bar floor-start deadlift is not an RDL. | library-only |
| 14 | Trap-bar farmer carry | add | `suitcase-carry`, `library-trap-bar-deadlift` | Unilateral load and different trunk demand.; Shares pickup equipment but does not include loaded walking. | library-only |
| 15 | Smith Romanian deadlift | add | `library-smith-deadlift`, `library-barbell-romanian-deadlift`, `dumbbell-romanian-deadlift` | Floor-start deadlift differs from standing RDL.; Same hinge family with free bar path.; Different implement and loading geometry. | library-only |
| 16 | Smith hip thrust | add | `bridge`, `library-barbell-hip-thrust`, `library-barbell-glute-bridge` | Movement family overlaps, but equipment and setup are broader/simpler.; Free bar versus fixed Smith path.; Floor bridge has different range and bench setup. | library-only |
| 17 | Belt-squat calf raise | add | `bilateral-calf`, `belt-squat`, `calf-smith` | Same broad joint action without belt-squat resistance.; Same device but different movement.; Loaded calf raise using a different machine path. | active-program candidate requiring review |
| 18 | Belt-squat isometric | add | `belt-squat` | Dynamic repetitions differ from a sustained hold and bailout needs. | library-only |
| 19 | Slant-board squat | add | `box-squat-pattern`, `belt-squat` | Provides a depth target without a slant board.; Loaded squat family but different ankle geometry and equipment. | library-only |
| 20 | Balance-cushion single-leg stance | add | `single-balance`, `library-single-leg-foam-pad-balance`, `supported-single-leg-stance` | Existing floor-based balance lacks the inflatable surface.; Foam pad and inflatable cushion are distinct equipment.; Stable-surface supported option. | active-program candidate requiring review |
| 21 | Push-up | add | None | No exact or closely named catalog record found. | library-only |
| 22 | Chin-up | add | `pull-up` | Pronated versus supinated grip changes the exercise and assistance needs. | library-only |
| 23 | Single-arm cable row | add | `supported-db-row`, `library-rack-chest-supported-row` | Unilateral row with different implement and support.; Cable row family, but supported and not a single-arm standing/seated record. | library-only |
| 24 | Farmer carry | add | `suitcase-carry` | Unilateral carry differs from bilateral dumbbell loading. | library-only |

Relationship labels in the JSON distinguish `related` from `exact`/`equivalent`; all matches here are related only. Proposed IDs were checked against the current export and do not collide with existing IDs.

## Candidate content

### 1. Tibialis raise

**Decision:** `add` — No exact record was found. Add as optional anterior lower-leg reference content, not as an Achilles progression criterion.

**Purpose and placement:** Anterior lower-leg strength and ankle dorsiflexion control. Proposed placement: **movement-support candidate**; automatic scheduling: **not approved**.

**Equipment/feasibility:** Bodyweight/no purchased equipment. Status: `verified-bodyweight`. 

**Setup:** 1. Stand with upper back against a wall and feet slightly forward. 2. Keep heels planted and begin with toes relaxed on the floor.

**Execution cues:** 1. Lift the forefeet toward the shins without rocking onto the heels. 2. Lower under control while the heels stay down.

**Common errors:** 1. Bending the knees to create the motion. 2. Rocking the whole body instead of moving at the ankles. 3. Letting the feet roll outward.

**Logging:** `reps` (count; not side-specific; optional); `load` (lb; not side-specific; optional); `assistance` (text; not side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Bodyweight; record no numeric load unless an independently reviewed resistance setup is used.

**Achilles constraints:** 1. Catalog inclusion does not establish current tolerance for repeated ankle motion. 2. Stop and apply the existing symptom/red-flag process if symptoms change.

**Alternatives requiring their own review:** Seated toe lift — Reduces balance demand while preserving active dorsiflexion; still requires review.; Single-leg tibialis raise — Adds unilateral demand and is not an automatic progression.

**Unresolved before active use:** Current ankle range and symptom response are not supplied.

### 2. Banded ankle dorsiflexion

**Decision:** `add` — Knee-to-wall dorsiflexion mobility exists, but resisted dorsiflexion does not; the resistance intent is materially different.

**Purpose and placement:** Resisted ankle dorsiflexion control. Proposed placement: **movement-support candidate**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `rehab-bands`. Status: `setup-unverified`. Additional setup: Stable low anchor that cannot release; Band with known identifier/condition.

**Setup:** 1. Sit with the working heel supported and the band anchored in front of the foot. 2. Place the band across the forefoot without compressing the toes.

**Execution cues:** 1. Draw the forefoot toward the shin while the heel stays still. 2. Return slowly without letting the band pull the foot inward or outward.

**Common errors:** 1. Moving the whole leg. 2. Band slipping across the toes. 3. Using an unverified anchor or excessive stretch.

**Logging:** `side` (left/right; side-specific; optional); `reps` (count; side-specific; optional); `band` (text; side-specific; optional); `anchor` (text; side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Record the band identifier/color and anchor distance; do not convert band resistance to pounds.

**Achilles constraints:** 1. This is not equivalent to dorsiflexion range clearance. 2. Band tension and ankle range require individual setup review.

**Alternatives requiring their own review:** Active seated dorsiflexion — Removes external resistance; still monitor symptoms and range.; Higher band tension — Changes load and requires separate review rather than automatic progression.

**Unresolved before active use:** Safe anchor, band resistance and permitted ankle range are not confirmed.

### 3. Short-foot / arch-dome exercise

**Decision:** `add` — No exact intrinsic-foot-control drill was found. Evidence is indirect from flat-foot populations, so position it as optional movement support.

**Purpose and placement:** Intrinsic foot control without curling the toes. Proposed placement: **movement-support candidate**; automatic scheduling: **not approved**.

**Equipment/feasibility:** Bodyweight/no purchased equipment. Status: `verified-bodyweight`. 

**Setup:** 1. Sit or stand with heel, base of the great toe and base of the little toe contacting the floor. 2. Relax the toes before beginning.

**Execution cues:** 1. Gently shorten the foot by drawing the ball of the foot toward the heel. 2. Keep all three contact points and the toes long.

**Common errors:** 1. Curling or gripping the toes. 2. Rolling to the outside edge. 3. Lifting the heel or forefoot.

**Logging:** `side` (left/right; side-specific; optional); `reps` (count; side-specific; optional); `durationSeconds` (seconds; side-specific; optional); `position` (seated/standing; side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** No external-load convention proposed.

**Achilles constraints:** 1. Indirect evidence does not establish postoperative need or timing. 2. Standing versions add weight-bearing demand and require their own eligibility check.

**Alternatives requiring their own review:** Seated short-foot — Reduces weight-bearing and balance demand.; Standing short-foot — Adds weight-bearing demand and requires separate review.

**Unresolved before active use:** Whether seated or standing weight-bearing is appropriate is not documented.

### 4. Toe yoga / independent great-toe control

**Decision:** `add` — No exact toe-dissociation exercise was found. Add as optional coordination content with no claim that it advances Achilles readiness.

**Purpose and placement:** Independent great-toe and lesser-toe coordination. Proposed placement: **movement-support candidate**; automatic scheduling: **not approved**.

**Equipment/feasibility:** Bodyweight/no purchased equipment. Status: `verified-bodyweight`. 

**Setup:** 1. Sit or stand with the foot supported and all toes relaxed. 2. Keep the heel and ball of the foot in contact.

**Execution cues:** 1. Lift the great toe while the lesser toes stay down. 2. Then press the great toe down while lifting the lesser toes; move only as far as control allows.

**Common errors:** 1. Rolling the foot to create the motion. 2. Clawing the toes. 3. Forcing motion or cramping through repeated attempts.

**Logging:** `side` (left/right; side-specific; optional); `reps` (count; side-specific; optional); `position` (seated/standing; side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** No external-load convention proposed.

**Achilles constraints:** 1. Foot coordination is not a clearance test or automatic prerequisite. 2. Standing adds weight-bearing demand.

**Alternatives requiring their own review:** Seated assisted toe dissociation — Allows light hand guidance and reduces balance demand.; Standing toe yoga — Adds weight-bearing and must be reviewed separately.

**Unresolved before active use:** Appropriate seated versus standing start is not confirmed.

### 5. Straight-knee 2-up/1-down calf raise

**Decision:** `add` — No exact bilateral-up/unilateral-down record was found. Existing calf raises are related, but this lowering strategy changes tendon demand and must not be auto-unlocked.

**Purpose and placement:** Controlled plantarflexor loading with shared ascent and unilateral lowering. Proposed placement: **active-program candidate requiring review**; automatic scheduling: **not approved**.

**Equipment/feasibility:** Bodyweight/no purchased equipment. Status: `review-required`. 

**Setup:** 1. Use a stable support and stand on a flat floor; keep both feet fully supported. 2. Rise with both legs before shifting only enough to lower on the selected side.

**Execution cues:** 1. Keep the working knee straight but not locked. 2. Lower only to floor level under control; do not drop the heel below the floor.

**Common errors:** 1. Stepping onto an edge or adding below-floor dorsiflexion. 2. Dropping quickly. 3. Pushing primarily through the arms or twisting the pelvis.

**Logging:** `side` (left/right; side-specific; optional); `reps` (count; side-specific; optional); `load` (lb; side-specific; optional); `assistance` (text; side-specific; optional); `range` (floor-level; side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Bodyweight by default; if separately cleared for external load, record total external load without inferring tendon load.

**Achilles constraints:** 1. Floor-level is mandatory in this candidate content unless additional dorsiflexion has specifically been cleared. 2. The floor-level constraint does not establish readiness for eccentric loading. 3. Healthy-adult biomechanics show setup-dependent loading; postoperative eligibility remains a clinical decision.

**Alternatives requiring their own review:** Bilateral calf raise (`bilateral-calf`) — Keeps ascent and descent bilateral; eligibility still follows existing rules.; Loaded 2-up/1-down calf raise — Adds load and requires a separate starting-load assessment.

**Unresolved before active use:** Readiness for unilateral eccentric lowering and acceptable range are not documented.

### 6. Bent-knee soleus isometric

**Decision:** `add` — Existing seated and bent-knee calf exercises are dynamic, and the existing isometric is straight-knee. This is a distinct static bent-knee variation.

**Purpose and placement:** Sustained plantarflexor loading with the knee flexed. Proposed placement: **active-program candidate requiring review**; automatic scheduling: **not approved**.

**Equipment/feasibility:** Bodyweight/no purchased equipment. Status: `review-required`. 

**Setup:** 1. Choose a stable seated or supported standing position reviewed for this exercise. 2. Set the knee in a comfortable bent position and keep the forefoot fully supported.

**Execution cues:** 1. Create a heel-rise effort and hold the chosen static position. 2. Keep pressure centered through the forefoot and avoid bouncing.

**Common errors:** 1. Drifting into a straight-knee position. 2. Bouncing through the hold. 3. Using an unreviewed knee angle, external load or ankle range.

**Logging:** `side` (left/right; side-specific; optional); `durationSeconds` (seconds; side-specific; optional); `load` (lb; side-specific; optional); `position` (text; side-specific; optional); `heelHeight` (text; side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Bodyweight or external load only after setup review; record the external load and setup separately.

**Achilles constraints:** 1. Knee angle, heel height, ankle range and external load all change the task. 2. A clinical commentary depicts flexed-knee plantarflexion isometrics but does not prescribe this candidate's dose or eligibility.

**Alternatives requiring their own review:** Seated calf raise (`seated-calf`) — Existing dynamic bent-knee calf work; not automatically interchangeable with an isometric.; Bent-knee standing calf raise (`calf-bent-standing`) — Existing dynamic alternative with different balance and loading demands.

**Unresolved before active use:** Seated versus standing setup, knee angle, heel height, unilateral status and starting load are unresolved.

### 7. Terminal knee extension

**Decision:** `add` — No exact terminal knee extension record was found. Cable and band versions need separate setup notes even if they share movement intent.

**Purpose and placement:** Controlled final-range knee extension in standing. Proposed placement: **movement-support candidate**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `rehab-bands`, `cable-station`. Status: `setup-unverified`. Additional setup: Stable band anchor or cable position; Hand support.

**Setup:** 1. Anchor a band or cable behind the knee at knee height and use stable hand support. 2. Begin with the working knee slightly flexed and the foot flat.

**Execution cues:** 1. Straighten the knee by tightening the thigh without shifting the trunk. 2. Return to the small bend under control.

**Common errors:** 1. Hyperextending forcefully. 2. Rocking the pelvis or lifting the heel. 3. Treating cable and band resistance as equivalent.

**Logging:** `side` (left/right; side-specific; optional); `reps` (count; side-specific; optional); `resistanceMode` (band/cable; side-specific; optional); `load` (displayed setting; side-specific; optional); `band` (text; side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** For cable, record displayed stack setting and setup; for band, record band identifier and anchor distance. Do not convert between them.

**Achilles constraints:** 1. Standing support and ankle comfort must be checked. 2. This does not establish gait, running or sport readiness.

**Alternatives requiring their own review:** Seated knee extension — Reduces standing demand but is not an exact equivalent and requires review.; Cable terminal knee extension — Adds machine-specific resistance and requires an independent starting-load check.

**Unresolved before active use:** Permitted knee range, preferred band/cable setup and stable anchor are not confirmed.

### 8. Cable hip adduction

**Decision:** `add` — The catalog contains cable hip abduction, not adduction. Add as a distinct frontal-plane direction with cuff setup review.

**Purpose and placement:** Standing hip adduction strength using an ankle cuff. Proposed placement: **library-only**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `cable-station`. Status: `setup-unverified`. Additional setup: Cable ankle cuff; Stable hand support; Pulley low enough for the intended line of pull.

**Setup:** 1. Attach the cuff to the working ankle with the cable coming from the side away from the stance leg. 2. Use stable support and begin with the working leg slightly out to the side.

**Execution cues:** 1. Move the working leg inward without rotating the pelvis. 2. Return under control while the stance foot remains planted.

**Common errors:** 1. Leaning the trunk. 2. Crossing far past neutral. 3. Turning the toes or pelvis to escape the cable line.

**Logging:** `side` (left/right; side-specific; optional); `reps` (count; side-specific; optional); `load` (displayed setting; side-specific; optional); `pulley` (text; side-specific; optional); `assistance` (text; side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Record displayed stack setting, pulley position and cuff setup; pulley ratio is unknown, so do not convert to free-weight pounds.

**Achilles constraints:** 1. The stance leg bears the balance demand; this is not an Achilles clearance test. 2. Cable path and cuff placement must not destabilize the user.

**Alternatives requiring their own review:** Supported side-lying hip adduction — Removes cable and standing-balance demands but is a different setup.; Greater cable resistance — Requires its own starting-load assessment and is not automatic.

**Unresolved before active use:** Cable ratio, lowest pulley geometry, cuff fit, stance tolerance and safe starting resistance are not confirmed.

### 9. Cable resisted march / hip flexion

**Decision:** `add` — Existing seated marches are not standing cable-resisted hip flexion. Add as a distinct cuff exercise pending stance and cable setup review.

**Purpose and placement:** Controlled standing hip flexion against cable resistance. Proposed placement: **library-only**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `cable-station`. Status: `setup-unverified`. Additional setup: Cable ankle cuff; Stable hand support; Low pulley clearance.

**Setup:** 1. Face away from a low pulley with the cuff on the working ankle and use stable hand support. 2. Stand tall with both feet controlled before taking up cable tension.

**Execution cues:** 1. Lift the working knee without leaning back. 2. Lower the foot under control and reset balance before the next repetition.

**Common errors:** 1. Using momentum. 2. Leaning or arching the trunk. 3. Letting the cable pull the stance ankle or crossing the line of support.

**Logging:** `side` (left/right; side-specific; optional); `reps` (count; side-specific; optional); `load` (displayed setting; side-specific; optional); `pulley` (text; side-specific; optional); `assistance` (text; side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Record displayed stack setting, pulley position and cuff setup; do not infer true external force from the stack label.

**Achilles constraints:** 1. The stance leg and lowering step create balance and Achilles demands. 2. Do not treat a seated march as proof of standing cable readiness.

**Alternatives requiring their own review:** Seated march (`seated-march`) — Existing lower-balance-demand hip-flexion pattern; not a resisted equivalent.; Higher cable resistance — Changes stance and cable forces and needs separate review.

**Unresolved before active use:** Stance tolerance, cuff fit, pulley geometry, permitted hip height and starting resistance are unknown.

### 10. Weighted-wagon forward push

**Decision:** `defer` — The owned device is a wagon, not a purpose-built sled. Handle suitability, braking, rolling resistance, stability, terrain and rating are unresolved, so exercise content cannot yet claim a safe setup.

**Purpose and placement:** Potential horizontal pushing and marching task, contingent on equipment feasibility. Proposed placement: **library-only**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `weighted-wagon`. Status: `unverified`. Additional setup: Verified fixed pushing interface; Level non-slip route with wheel clearance; Verified wagon load/stability information.

**Setup:** 1. No setup is approved until the wagon, handle, surface and loading method are verified.

**Execution cues:** 1. Do not perform from this research record.

**Common errors:** 1. Using an unstable or steerable handle as a fixed sled post. 2. Loading a slope or surface with unpredictable rolling resistance. 3. Placing hands or feet near wheels.

**Logging:** `distance` (m; not side-specific; optional); `durationSeconds` (seconds; not side-specific; optional); `load` (lb; not side-specific; optional); `surface` (text; not side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** If ever approved, record payload separately from rolling resistance; payload is not equivalent to sled force.

**Achilles constraints:** 1. Forward pushing can impose substantial ankle and propulsion demands that are not quantified here. 2. Ownership does not establish suitability or readiness.

**Alternatives requiring their own review:** Existing weighted-wagon backward drag (`weighted-wagon-backward-drag`) — Existing content is directionally different and remains governed by its current rules.; Purpose-built sled push — Would require different equipment ownership and an independent review.

**Unresolved before active use:** Manufacturer/model, handle geometry, brake behavior, load rating, wheel containment, surface, slope and clinical eligibility are unknown.

### 11. Weighted-wagon forward pull / march

**Decision:** `defer` — The wagon lacks a verified pulling attachment, braking behavior and stable line of pull. Generic sled demonstrations cannot validate this device.

**Purpose and placement:** Potential forward marching against rearward wagon resistance, contingent on equipment feasibility. Proposed placement: **library-only**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `weighted-wagon`. Status: `unverified`. Additional setup: Rated attachment point; Reviewed tether or belt with release; Level route and roll-away control.

**Setup:** 1. No setup is approved until the wagon, tether/hitch, release method, surface and loading method are verified.

**Execution cues:** 1. Do not perform from this research record.

**Common errors:** 1. Attaching a tether to an unverified point. 2. Allowing the wagon to roll into the user. 3. Using slopes, traffic areas or uneven terrain.

**Logging:** `distance` (m; not side-specific; optional); `durationSeconds` (seconds; not side-specific; optional); `load` (lb; not side-specific; optional); `attachment` (text; not side-specific; optional); `surface` (text; not side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** If ever approved, record payload and attachment separately; neither establishes actual horizontal resistance.

**Achilles constraints:** 1. Marching changes single-leg stance and propulsion demands. 2. No assumption of readiness follows from existing backward-drag use.

**Alternatives requiring their own review:** Existing weighted-wagon backward drag (`weighted-wagon-backward-drag`) — Existing backward task is not equivalent but retains its current reviewed setup.; Unresisted supported march — Removes wagon resistance but remains a different task requiring review.

**Unresolved before active use:** Manufacturer/model, rated hitch point, tether/belt, emergency release, braking, rolling resistance, route and clinical eligibility are unknown.

### 12. Backward treadmill walk

**Decision:** `defer` — Backward walking evidence found was not postoperative Achilles evidence, and the treadmill model/manual, controls and supervision setup are unknown.

**Purpose and placement:** Potential controlled backward gait exposure, pending manufacturer and clinical review. Proposed placement: **library-only**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `incline-treadmill`. Status: `unverified`. 

**Setup:** 1. No setup is approved until the exact treadmill manual and supervised start/stop method are reviewed.

**Execution cues:** 1. Do not perform from this research record.

**Common errors:** 1. Stepping onto a moving belt. 2. Using unverified speed or incline. 3. Relying on handrails without a safe stop plan.

**Logging:** `durationSeconds` (seconds; not side-specific; optional); `speed` (treadmill units; not side-specific; optional); `incline` (treadmill units; not side-specific; optional); `support` (text; not side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Record the treadmill's displayed speed and incline without treating them as equivalent across models.

**Achilles constraints:** 1. Backward gait is not a substitute for a validated Achilles loading progression. 2. No safe speed, incline, dose or entry criterion is established here.

**Alternatives requiring their own review:** Level backward stepping off-treadmill — Different environment and still requires balance/clinical review.; Forward treadmill walk — Different gait direction; follow existing tolerated walking guidance.

**Unresolved before active use:** Treadmill make/model, manual permission, minimum speed, emergency-stop access, supervision and clinical eligibility are unknown.

### 13. Trap-bar Romanian deadlift

**Decision:** `add` — Trap-bar deadlift and dumbbell/barbell RDL records exist, but no exact trap-bar RDL was found; bar path and start position are distinct.

**Purpose and placement:** Hip-hinge strength using a trap/hex bar. Proposed placement: **library-only**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `trap-hex-bar`, `weight-plates`. Status: `setup-unverified`. Additional setup: Verified empty bar weight and handle choice; Clear lifting area.

**Setup:** 1. Stand centered in the trap bar with the selected handles and safeties/space verified. 2. Begin from a controlled standing lockout using a separately reviewed start load.

**Execution cues:** 1. Push the hips back while keeping the bar close to the body's center. 2. Stop the descent at the reviewed range and stand by extending the hips.

**Common errors:** 1. Turning the movement into a squat. 2. Reaching for extra depth by rounding. 3. Using high handles/low handles interchangeably without recording them.

**Logging:** `reps` (count; not side-specific; optional); `load` (lb; not side-specific; optional); `handle` (high/low; not side-specific; optional); `range` (text; not side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Record total external load including the verified empty bar weight; handle height and plate setup remain separate fields. Empty bar weight is currently unknown.

**Achilles constraints:** 1. Loaded hinging adds whole-body load and may change ankle stabilization demands. 2. General RDL technique and strength evidence do not establish postoperative eligibility or starting load.

**Alternatives requiring their own review:** Dumbbell Romanian deadlift (`dumbbell-romanian-deadlift`) — Existing hinge with known dumbbell ownership; load is not equivalent.; Trap-bar deadlift (`library-trap-bar-deadlift`) — Existing floor-start pattern; not an automatic progression from the RDL.

**Unresolved before active use:** Trap-bar empty weight, handle heights, plate clearance, floor protection, start load and permitted hinge range are unknown.

### 14. Trap-bar farmer carry

**Decision:** `add` — No exact loaded trap-bar carry was found. Existing suitcase carry is unilateral and therefore not equivalent.

**Purpose and placement:** Bilateral loaded carry inside a trap bar. Proposed placement: **library-only**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `trap-hex-bar`, `weight-plates`. Status: `setup-unverified`. Additional setup: Level route with adequate bar-width clearance; Verified empty bar weight and handle choice.

**Setup:** 1. Set the trap bar on a level route with verified clearance and a reviewed load. 2. Stand inside, lift to a stable tall position, then confirm the route is clear before walking.

**Execution cues:** 1. Take controlled steps and keep the bar from swinging. 2. Turn only with adequate space and set down under control.

**Common errors:** 1. Walking without route clearance. 2. Fast or pivoting turns. 3. Letting the frame contact the legs or floor.

**Logging:** `distance` (m; not side-specific; optional); `durationSeconds` (seconds; not side-specific; optional); `load` (lb; not side-specific; optional); `turns` (count; not side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Record total external load including verified empty bar weight; do not compare directly with dumbbell carries.

**Achilles constraints:** 1. Loaded walking adds repeated stance and propulsion demands. 2. Carry readiness is separate from static trap-bar lifting readiness.

**Alternatives requiring their own review:** Farmer carry (`library-farmer-carry`) — Dumbbells reduce frame width but create a different load distribution.; Suitcase carry (`suitcase-carry`) — Existing unilateral carry has different trunk and stance demands.

**Unresolved before active use:** Empty bar weight, handle height, route width/length, turning method, floor clearance and starting load are unknown.

### 15. Smith Romanian deadlift

**Decision:** `add` — Smith deadlift and barbell/dumbbell RDL records are related, but no exact Smith RDL exists. Fixed bar path and machine setup require distinct content.

**Purpose and placement:** Hip-hinge strength using the Smith machine. Proposed placement: **library-only**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `smith-machine`. Status: `setup-unverified`. Additional setup: Verified Smith bar path and safety settings.

**Setup:** 1. Set the Smith safeties and bar start height for a reviewed standing setup. 2. Choose foot position relative to the fixed bar path before unracking.

**Execution cues:** 1. Push the hips back while keeping the bar path close to the legs. 2. Stop at the reviewed range and stand without bouncing off the safeties.

**Common errors:** 1. Standing where the fixed path pulls balance forward or backward. 2. Rounding to gain depth. 3. Assuming Smith load equals free-weight load.

**Logging:** `reps` (count; not side-specific; optional); `load` (lb; not side-specific; optional); `barStart` (text; not side-specific; optional); `footPosition` (text; not side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Record added plates plus machine identity/setup. Effective starting resistance is unknown; do not report added plates as equivalent free-weight load.

**Achilles constraints:** 1. Machine path and stance can change balance/ankle demands. 2. A separate start-load and range assessment is required.

**Alternatives requiring their own review:** Dumbbell Romanian deadlift (`dumbbell-romanian-deadlift`) — Existing free-moving implement option; not load-equivalent.; Smith deadlift (`library-smith-deadlift`) — Existing floor-start pattern; not the same range or start position.

**Unresolved before active use:** Smith effective resistance, bar path orientation, safety positions, foot placement, start load and hinge range are unknown.

### 16. Smith hip thrust

**Decision:** `add` — Existing bridge/hip-thrust and barbell hip-thrust records are related, but no exact Smith setup exists. Bench compatibility and fixed path are material differences.

**Purpose and placement:** Hip extension strength using a Smith bar and bench. Proposed placement: **library-only**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `smith-machine`, `adjustable-bench`. Status: `setup-unverified`. Additional setup: Bench secured against movement; Suitable bar pad; Verified Smith safeties and entry/exit.

**Setup:** 1. Secure a compatible bench so it cannot slide and set Smith safeties for entry/exit. 2. Use a reviewed bar pad and foot position; begin only after a no-load setup check.

**Execution cues:** 1. Drive through both feet and extend the hips without overextending the low back. 2. Pause in the reviewed top position and lower under control.

**Common errors:** 1. Unsecured bench. 2. Bar contacting the pelvis without suitable padding. 3. Feet placed where the fixed path shifts pressure unpredictably.

**Logging:** `reps` (count; not side-specific; optional); `load` (lb; not side-specific; optional); `bench` (text; not side-specific; optional); `barStart` (text; not side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Record added plates and the exact Smith/bench setup; effective bar resistance is unknown and not equivalent to barbell loading.

**Achilles constraints:** 1. Foot pressure and entry/exit can load the ankle despite a hip-extension emphasis. 2. Bench, safety and starting-load review are prerequisites.

**Alternatives requiring their own review:** Bridge / Hip Thrust (`bridge`) — Existing simpler setup; its current rules remain authoritative.; Barbell hip thrust (`library-barbell-hip-thrust`) — Free-bar setup differs and is not an automatic substitute.

**Unresolved before active use:** Bench height/capacity, anti-slip method, bar pad, Smith path, safeties, entry/exit and starting resistance are unknown.

### 17. Belt-squat calf raise

**Decision:** `add` — Manufacturer material advertises calf raises, and no exact catalog record exists. The user's exact handle/attachment and stance setup are still unverified.

**Purpose and placement:** Calf raising with belt-squat resistance and reduced hand loading. Proposed placement: **active-program candidate requiring review**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `belt-squat`, `weight-plates`. Status: `partially-verified`. Additional setup: Manufacturer-compatible calf-raise handle or reviewed alternative; Stable hand support; Non-slip flat foot surface.

**Setup:** 1. Use only the verified Mammoth configuration and a stable hand support. 2. Begin on a flat, non-slip foot surface unless another range is specifically reviewed.

**Execution cues:** 1. Rise evenly through both forefeet and lower under control. 2. Keep the belt line centered and avoid contact with the lever path.

**Common errors:** 1. Improvising an unverified handle/attachment. 2. Using a step to add below-floor heel drop without clearance. 3. Treating the user's 225 lb review milestone or available plates as a start load.

**Logging:** `reps` (count; not side-specific; optional); `load` (lb; not side-specific; optional); `setup` (text; not side-specific; optional); `range` (text; not side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Record added plates and exact lever/handle setup; do not equate lever loading with free weights. Neither 225 lb nor 380 lb is a candidate start load or readiness threshold.

**Achilles constraints:** 1. Flat-floor default avoids inventing additional dorsiflexion. 2. Manufacturer compatibility does not establish clinical readiness, load or range.

**Alternatives requiring their own review:** Bilateral calf raise (`bilateral-calf`) — Existing bodyweight pattern with less equipment complexity.; Smith calf raise (`calf-smith`) — Existing loaded machine option with different mechanics and start-load assessment.

**Unresolved before active use:** Exact handle/attachment, hand support, foot surface, lever clearance, start load and clinical eligibility are unresolved.

### 18. Belt-squat isometric

**Decision:** `add` — No exact static belt-squat hold exists. The current belt squat is dynamic; a hold changes bailout, duration and positional demands.

**Purpose and placement:** Static knee/hip loading in a belt-squat position. Proposed placement: **library-only**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `belt-squat`, `weight-plates`. Status: `setup-unverified`. Additional setup: Verified hold position and lever stop; Safe entry/exit and bailout; Stable support.

**Setup:** 1. Set up the belt squat only after a specific hold position, load, support and bailout method are reviewed. 2. Confirm the lever can be safely entered and exited without relying on fatigue tolerance.

**Execution cues:** 1. Hold the reviewed position without bouncing or drifting deeper. 2. End the hold before position or control changes and use the planned bailout.

**Common errors:** 1. Using an arbitrary squat depth. 2. Holding to failure. 3. No safe rerack/bailout plan. 4. Importing the 225 lb milestone or plate inventory as a load target.

**Logging:** `durationSeconds` (seconds; not side-specific; optional); `load` (lb; not side-specific; optional); `position` (text; not side-specific; optional); `support` (text; not side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Record added plates, lever setup and hold position. Do not equate lever load to free weights or use 225/380 lb as a start load.

**Achilles constraints:** 1. Static does not mean low demand; ankle, knee and hip demand depend on depth and stance. 2. No manufacturer or clinical source verified this exact isometric setup.

**Alternatives requiring their own review:** Belt squat (`belt-squat`) — Existing dynamic record; not automatically interchangeable with a hold.; Bodyweight supported squat hold — Removes external load but still requires depth and symptom review.

**Unresolved before active use:** Hold depth, stance, load, duration, support, lever stop/bailout and clinical eligibility are unknown.

### 19. Slant-board squat

**Decision:** `add` — No exact slant-board or heel-elevated squat was found. Existing squat patterns are related, but the board changes ankle/knee geometry.

**Purpose and placement:** Squat pattern with heels supported on a slant board. Proposed placement: **library-only**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `slant-board`. Status: `setup-unverified`. Additional setup: Verified board angle/dimensions/rating; Non-slip floor and optional support.

**Setup:** 1. Place the board on a non-slip surface and verify its angle, width and rating. 2. Stand with both heels fully supported and use external support if reviewed.

**Execution cues:** 1. Descend only through the reviewed range with knees tracking over the feet. 2. Keep the heels supported and stand under control.

**Common errors:** 1. Using an unknown or unstable board angle. 2. Allowing heels to leave the board. 3. Assuming heel elevation reduces Achilles demand for this individual.

**Logging:** `reps` (count; not side-specific; optional); `load` (lb; not side-specific; optional); `boardAngle` (degrees/setting; not side-specific; optional); `range` (text; not side-specific; optional); `assistance` (text; not side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Bodyweight unless external load is separately reviewed; record board angle/setting and load independently.

**Achilles constraints:** 1. Heel elevation changes ankle position and knee/hip mechanics but does not establish a safe range. 2. No direct postoperative Achilles evidence or exact demo was verified.

**Alternatives requiring their own review:** Box squat pattern (`box-squat-pattern`) — Existing depth target without the same heel-elevation geometry.; Belt squat (`belt-squat`) — Existing externally loaded squat pattern with different setup.

**Unresolved before active use:** Board angle, dimensions, rating, non-slip behavior, squat depth, support and eligibility are unknown.

### 20. Balance-cushion single-leg stance

**Decision:** `add` — Single-leg balance on floor and foam pad exists, but the owned inflatable cushion (`dyno-pad`) is a distinct unstable surface.

**Purpose and placement:** Single-leg balance on an inflatable cushion. Proposed placement: **active-program candidate requiring review**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `dyno-pad`. Status: `review-required`. Additional setup: Stable support within reach; Non-slip surface; Documented cushion inflation.

**Setup:** 1. Place the inflatable cushion on a non-slip floor beside stable hand support. 2. Set inflation to a documented, conservative level before stepping on.

**Execution cues:** 1. Stand tall with a soft knee and use support as needed. 2. Step off if the cushion shifts or alignment/control changes.

**Common errors:** 1. Confusing the inflatable cushion with the foam balance pad. 2. Starting without hand support nearby. 3. Changing inflation without recording it.

**Logging:** `side` (left/right; side-specific; optional); `durationSeconds` (seconds; side-specific; optional); `assistance` (text; side-specific; optional); `inflation` (text; side-specific; optional); `contacts` (count; side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Bodyweight; record cushion identity, inflation and support rather than an external load.

**Achilles constraints:** 1. Unstable-surface balance is a capacity task, not an automatic Achilles progression criterion. 2. Floor or foam-pad balance does not prove readiness for an inflatable cushion.

**Alternatives requiring their own review:** Supported single-leg stance (`supported-single-leg-stance`) — Existing stable-surface support option with lower instability.; Single-leg foam-pad balance (`library-single-leg-foam-pad-balance`) — Existing foam surface; mechanically distinct from inflatable cushion.

**Unresolved before active use:** Inflation guidance, non-slip behavior, step-on/off method, support level and current single-leg balance capacity are unknown.

### 21. Push-up

**Decision:** `add` — No push-up record was found. Add as a general upper-body strength option that must not displace rehab volume.

**Purpose and placement:** Horizontal pushing strength using bodyweight. Proposed placement: **library-only**; automatic scheduling: **not approved**.

**Equipment/feasibility:** Bodyweight/no purchased equipment. Status: `verified-bodyweight`. 

**Setup:** 1. Place hands on a stable surface and choose a reviewed body angle. 2. Set a straight line from head through trunk to supported feet or knees.

**Execution cues:** 1. Lower the chest under control with elbows tracking comfortably. 2. Press away while keeping trunk and pelvis together.

**Common errors:** 1. Sagging or piking through the trunk. 2. Hands on an unstable surface. 3. Using floor position when wrist/shoulder tolerance is unknown.

**Logging:** `reps` (count; not side-specific; optional); `variation` (text; not side-specific; optional); `assistance` (text; not side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Bodyweight; record the support height/variation because leverage changes demand.

**Achilles constraints:** 1. Lower-limb loading is usually secondary but foot/ankle support position still matters. 2. Do not let added strength work displace essential rehabilitation or silently increase total volume.

**Alternatives requiring their own review:** Incline push-up — Reduces bodyweight leverage; surface height must be recorded and reviewed.; Floor push-up — Greater leverage demand; not an automatic progression.

**Unresolved before active use:** Preferred entry variation and wrist/shoulder tolerance are not documented.

### 22. Chin-up

**Decision:** `add` — A pull-up exists, but a supinated-grip chin-up is a distinct grip variation. Assistance and bar clearance still need verification.

**Purpose and placement:** Vertical pulling strength with a supinated grip. Proposed placement: **library-only**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `pull-up-bar`. Status: `setup-unverified`. Additional setup: Verified step-up/step-down method; Reviewed assistance setup if used.

**Setup:** 1. Use a verified pull-up bar and supinated grip with clear foot space. 2. Choose a reviewed assistance method before hanging or stepping up.

**Execution cues:** 1. Begin from the approved shoulder position and pull without swinging. 2. Lower under control and use the planned step-down.

**Common errors:** 1. Kipping or using leg drive. 2. Dropping from the bar. 3. Treating existing pull-up performance as automatic chin-up eligibility.

**Logging:** `reps` (count; not side-specific; optional); `assistance` (text; not side-specific; optional); `grip` (text; not side-specific; optional); `load` (lb; not side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Bodyweight plus/minus explicitly recorded assistance or added load; do not convert band assistance to pounds.

**Achilles constraints:** 1. Step-up/step-down and hanging foot clearance may affect the lower limb. 2. Grip change is not an automatic progression from pull-up.

**Alternatives requiring their own review:** Pull-up (`pull-up`) — Existing pronated-grip vertical pull; not an exact equivalent.; Assisted chin-up — May reduce pulling demand but assistance setup needs independent verification.

**Unresolved before active use:** Assistance method, bar height/clearance, shoulder/elbow tolerance and safe mounting/dismounting are not confirmed.

### 23. Single-arm cable row

**Decision:** `add` — The library has several row variations, but no exact unilateral cable row. Unilateral stance/trunk demand and cable setup justify a separate record.

**Purpose and placement:** Unilateral horizontal pulling strength. Proposed placement: **library-only**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `cable-station`. Status: `setup-unverified`. Additional setup: Single handle; Verified pulley height and stable body support.

**Setup:** 1. Set one cable handle near torso height and choose a stable seated or supported stance. 2. Begin with the shoulder controlled and cable slack removed.

**Execution cues:** 1. Pull the handle toward the torso without rotating. 2. Return under control while maintaining the chosen body position.

**Common errors:** 1. Twisting to move the load. 2. Shrugging the shoulder. 3. Using a staggered stance without reviewing lower-limb loading.

**Logging:** `side` (left/right; side-specific; optional); `reps` (count; side-specific; optional); `load` (displayed setting; side-specific; optional); `position` (text; side-specific; optional); `attachment` (text; side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Record displayed stack setting, side, pulley height and handle; cable ratio is unknown and loads are not equivalent to dumbbells.

**Achilles constraints:** 1. Standing/staggered versions can add lower-limb stabilization; a seated supported version may be a different entry option. 2. Upper-body additions must not silently increase total program volume.

**Alternatives requiring their own review:** Supported dumbbell row (`supported-db-row`) — Existing supported unilateral row with different load path.; Seated single-arm cable row — Reduces standing demand but needs bench/cable geometry review.

**Unresolved before active use:** Canonical seated versus standing position, cable ratio, handle, pulley height and starting resistance are unknown.

### 24. Farmer carry

**Decision:** `add` — The catalog has a unilateral suitcase carry, not a bilateral dumbbell farmer carry. Bilateral loading is a meaningful distinction.

**Purpose and placement:** Bilateral loaded carry with dumbbells. Proposed placement: **library-only**; automatic scheduling: **not approved**.

**Equipment/feasibility:** `dumbbells`. Status: `partially-verified`. Additional setup: Two dumbbells of independently selected load; Clear level route.

**Setup:** 1. Choose two dumbbells and a clear, level route with a reviewed pickup method. 2. Stand tall with one dumbbell at each side before walking.

**Execution cues:** 1. Take controlled steps while keeping both weights quiet. 2. Turn deliberately and set both dumbbells down under control.

**Common errors:** 1. Rushing or pivoting turns. 2. Weights swinging into the legs. 3. Assuming two 50 lb dumbbells are an appropriate target because they are owned.

**Logging:** `distance` (m; not side-specific; optional); `durationSeconds` (seconds; not side-specific; optional); `load` (lb; not side-specific; optional); `turns` (count; not side-specific; optional). Zero must remain distinct from missing, and no performed work is prefilled.

**Load convention:** Record load per dumbbell, not combined load, plus distance or duration and turn method. Owned maximum is not a target.

**Achilles constraints:** 1. Loaded walking adds repeated stance and propulsion demands. 2. Bilateral carry is not automatically easier or harder than unilateral suitcase carry; it is different.

**Alternatives requiring their own review:** Suitcase carry (`suitcase-carry`) — Existing unilateral load with different trunk demand.; Shorter bilateral carry — A dose change, not automatic eligibility; requires program review.

**Unresolved before active use:** Clear route, turn method, pickup/set-down strategy, start load and current loaded-walking tolerance are not confirmed.

## Demo verification

A page title, search result or embedded player is not treated as proof of playback or exact movement. No video playback was available through the research interface, so **every playback verification is false**. Exercise pages are references only; reuse/download permission was not assessed.

| # | Provider / title | Page | Playback | Exact movement | Access | Remaining gap |
|---:|---|---|---|---|---|---|
| 1 | [Hinge Health: Tibialis Raises: Exercise Guide](https://www.hingehealth.com/resources/articles/tibialis-raises/) | Yes | No | Yes | public | Public page and exact written wall-raise sequence verified; embedded video playback was not checked. |
| 2 | [Cornell Physical Therapy: Ankle Dorsiflexion with Band](https://www.cornell.edu/video/ankle-dorsiflexion-with-band) | No | No | No | unknown | Exercise-specific result was located, but direct page access returned 403; neither movement nor playback was verified. |
| 3 | No candidate-specific demo accepted | No | No | No | Unknown | Credible exact short demo still required before active-exercise use. |
| 4 | [Sharp HealthCare: Relieving plantar fasciitis pain with toe yoga](https://www.sharp.com/health-news/relieving-plantar-fasciitis-pain-with-toe-yoga-video) | Yes | No | Yes | public | Public page and written toe-yoga sequence verified; embedded video playback was not checked. Page is plantar-fasciitis education, not Achilles evidence. |
| 5 | No candidate-specific demo accepted | No | No | No | Unknown | Credible exact short demo still required before active-exercise use. |
| 6 | No candidate-specific demo accepted | No | No | No | Unknown | Credible exact short demo still required before active-exercise use. |
| 7 | No candidate-specific demo accepted | No | No | No | Unknown | Credible exact short demo still required before active-exercise use. |
| 8 | No candidate-specific demo accepted | No | No | No | Unknown | Credible exact short demo still required before active-exercise use. |
| 9 | No candidate-specific demo accepted | No | No | No | Unknown | Credible exact short demo still required before active-exercise use. |
| 10 | No candidate-specific demo accepted | No | No | No | Unknown | Credible exact short demo still required before active-exercise use. |
| 11 | No candidate-specific demo accepted | No | No | No | Unknown | Credible exact short demo still required before active-exercise use. |
| 12 | No candidate-specific demo accepted | No | No | No | Unknown | Credible exact short demo still required before active-exercise use. |
| 13 | [Muscle & Strength: Trap Bar Romanian Deadlift](https://www.muscleandstrength.com/content/trap-bar-romanian-deadlift) | Yes | No | Yes | public | Public exercise-specific page and written movement match verified; embedded video playback was not checked. Provider is a general fitness source, not clinical evidence. |
| 14 | [Muscle & Strength: Trap Bar Farmer's Carry](https://www.muscleandstrength.com/exercises/trap-bar-farmers-carry) | Yes | No | Yes | public | Public exercise-specific page and written movement match verified; embedded video playback was not checked. Not clinical evidence. |
| 15 | [Zing Coach: Smith Machine Romanian Deadlifts](https://www.zing.coach/exercises/smith-machine-romanian-deadlifts) | Yes | No | Yes | public | Public exercise-specific page and written movement match verified; video playback was not checked. General fitness source, not clinical evidence. |
| 16 | [REP Fitness: How to Do a Smith Machine Hip Thrust](https://repfitness.com/blogs/guides/smith-machine-hip-thrust) | Yes | No | Yes | public | Public exercise-specific page and written movement match verified; embedded video playback was not checked. Equipment-company instruction is not clinical evidence. |
| 17 | [Fringe Sport: Mammoth Belt Squat product page](https://www.fringesport.com/collections/squat-rack-attachments/products/mammoth-belt-squat) | Yes | No | No | public | Page verified and it advertises calf raises by changing the handle attachment. No exact exercise demo or playback was verified, and the user's attachment configuration is unknown. |
| 18 | No candidate-specific demo accepted | No | No | No | Unknown | Credible exact short demo still required before active-exercise use. |
| 19 | No candidate-specific demo accepted | No | No | No | Unknown | Credible exact short demo still required before active-exercise use. |
| 20 | [Physitrack: Single leg balance on a cushion](https://ca.physitrack.com/home-exercise-video/single-leg-balance-on-a-cushion) | Yes | No | Yes | public | Public page and exact written movement match verified; playback was not checked. Generic cushion instruction does not verify the user's Trideer device or clinical readiness. |
| 21 | No candidate-specific demo accepted | No | No | No | Unknown | Credible exact short demo still required before active-exercise use. |
| 22 | No candidate-specific demo accepted | No | No | No | Unknown | Credible exact short demo still required before active-exercise use. |
| 23 | No candidate-specific demo accepted | No | No | No | Unknown | Credible exact short demo still required before active-exercise use. |
| 24 | [BarBend: How to Do the Farmer's Carry](https://barbend.com/farmers-carry/) | Yes | No | Yes | public | Public written bilateral carry instructions were accessible; no video playback was verified. General fitness instruction, not clinical evidence. |

## Evidence bibliography and claim mapping

The source list separates clinical commentary, consensus, biomechanics, systematic reviews, professional education and manufacturer information. Demo pages are not used as clinical clearance evidence.

### `src-marrone-2024` — [Rehabilitation and Return to Sports after Achilles Tendon Repair](https://ijspt.scholasticahq.com/article/122643-rehabilitation-and-return-to-sports-after-achilles-tendon-repair)

Marrone W, Andrews R, Reynolds A, et al. (2024). **Type:** clinical commentary. **Population:** Adults after surgical Achilles tendon repair; recommendations synthesize literature and clinical practice. **Identifier:** doi:10.26603/001c.122643; PMID:39246413. **Limitations:** Not a trial or a surgeon-specific protocol. Exercise timing, loading and return-to-sport decisions still require individual assessment; cited healthy-adult biomechanics are indirect.

### `src-gaspar-2026` — [Return to running after Achilles tendon rupture: an international Delphi consensus](https://pubmed.ncbi.nlm.nih.gov/42503592/)

Gaspar and international Delphi panel (2026). **Type:** expert consensus (Delphi). **Population:** Return-to-running decisions after Achilles tendon rupture. **Identifier:** PMID:42503592. **Limitations:** Consensus criteria require prospective validation and do not make a single exercise, elapsed time or 90% symmetry a universal clearance rule.

### `src-revak-2017` — [Achilles Tendon Loading During Heel-Raising and -Lowering Exercises](https://pubmed.ncbi.nlm.nih.gov/28145739/)

Revak A, Diers K, Kernozek TW, Gheidi N, Olbrantz C (2017). **Type:** laboratory biomechanics study. **Population:** Healthy younger adults performing heel-raise and heel-lowering variations. **Identifier:** doi:10.4085/1062-6050-52.1.04; PMID:28145739. **Limitations:** Estimates relative tendon loading; it does not establish postoperative readiness, safety, dose, range or progression timing.

### `src-bohm-2022` — [Human Achilles tendon adaptation in response to exercise: a systematic review and meta-analysis](https://pubmed.ncbi.nlm.nih.gov/36278501/)

Bohm and colleagues (2022). **Type:** systematic review and meta-analysis. **Population:** Primarily healthy participants in tendon-loading studies. **Identifier:** PMID:36278501. **Limitations:** General tendon adaptation evidence is not a postoperative prescription and does not validate any candidate's starting load or eligibility.

### `src-acsm-2026` — [Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults: An Overview of Reviews](https://pubmed.ncbi.nlm.nih.gov/41843416/)

American College of Sports Medicine; Currier and colleagues (2026). **Type:** position stand / overview of reviews. **Population:** Healthy adults performing resistance training. **Identifier:** doi:10.1249/MSS.0000000000003897; PMID:41843416. **Limitations:** Supports general resistance-training principles only; not Achilles repair clearance, exercise-specific dosing, or equivalence among machines and free weights.

### `src-cheng-2024` — [Effect of short foot exercise on medial longitudinal arch and lower-extremity function in people with flat feet: a systematic review and meta-analysis](https://pubmed.ncbi.nlm.nih.gov/38517769/)

Cheng and colleagues (2024). **Type:** systematic review and meta-analysis. **Population:** People with flat feet; studies varied in symptoms and intervention duration. **Identifier:** doi:10.3233/BMR-230226; PMID:38517769. **Limitations:** Indirect to surgically repaired Achilles tendons; does not show that this drill is required, safe now, or superior to current rehabilitation.

### `src-backward-walk-2025` — [Effects of backward walking exercise on knee osteoarthritis: a systematic review and meta-analysis of randomized trials](https://pubmed.ncbi.nlm.nih.gov/40924430/)

Authors indexed in PubMed (2025). **Type:** systematic review and meta-analysis of randomized trials. **Population:** Adults with knee osteoarthritis. **Identifier:** PMID:40924430. **Limitations:** Wrong clinical population for postoperative Achilles decisions; does not verify treadmill compatibility or establish a safe speed, grade, dose or progression.

### `src-fringe-mammoth-2026` — [Mammoth Belt Squat product page](https://www.fringesport.com/collections/squat-rack-attachments/products/mammoth-belt-squat)

Fringe Sport (2026). **Type:** manufacturer product information. **Population:** Equipment users; not a clinical population. **Identifier:** No DOI/PMID recorded. **Limitations:** Supports only advertised equipment use. It is not clinical evidence, does not confirm the user's exact attachment/configuration, and does not confer readiness.

### `src-aaos-foot-ankle` — [Foot and Ankle Conditioning Program](https://orthoinfo.aaos.org/en/recovery/foot-and-ankle-conditioning-program/)

American Academy of Orthopaedic Surgeons (year not recorded). **Type:** patient education / conditioning guidance. **Population:** General foot and ankle conditioning audience. **Identifier:** No DOI/PMID recorded. **Limitations:** Generic instruction, not a postoperative Achilles protocol, individualized clearance or validation of candidate-specific loading.

### `src-nsca-rdl` — [Romanian Deadlift (RDL)](https://www.nsca.com/education/articles/kinetic-select/romanian-deadlift-rdl/)

National Strength and Conditioning Association (year not recorded). **Type:** professional technique education. **Population:** General strength-training audience. **Identifier:** No DOI/PMID recorded. **Limitations:** Technique reference only; not specific to a trap bar, Smith machine, surgical Achilles rehabilitation, or personalized loading.

### Candidate claim map

| Candidate(s) | Supported finding | Source(s) | What it does not support |
|---|---|---|---|
| #5 | Heel-raise/lowering setup changes estimated Achilles demand in healthy adults. | `src-revak-2017` | Postoperative eligibility, floor range, load, dose or timing. |
| #6 and general postoperative boundary | Progressive loading and flexed-knee plantarflexion isometric examples appear in a repair-rehab clinical commentary. | `src-marrone-2024` | A surgeon-specific protocol, current clearance, exact setup or dose. |
| #3 | Short-foot exercise has been studied in flat-foot populations. | `src-cheng-2024` | Necessity or efficacy after Achilles repair. |
| #12 | Backward walking has evidence in knee osteoarthritis populations. | `src-backward-walk-2025` | Achilles repair readiness, treadmill compatibility or dose. |
| #17 | The manufacturer advertises calf raises with a changed handle attachment. | `src-fringe-mammoth-2026` | The user's attachment, clinical eligibility, range, load or equipment capacity. |
| #13, #15 | RDL technique is described for general strength settings. | `src-nsca-rdl`, `src-acsm-2026` | Trap-bar/Smith equivalence or postoperative starting load. |
| #13–16, #21–24 | General resistance training can develop strength/function in healthy adults. | `src-acsm-2026` | Candidate-specific programming, automatic substitution, or clinical clearance. |
| Future running/RTS integration only | Criteria-based consensus exists for return to running. | `src-gaspar-2026` | Exercise ownership, elapsed time or 90% symmetry as universal clearance. |
| General tendon-loading context | Tendons adapt to loading in studied populations. | `src-bohm-2022` | A postoperative dose or candidate-specific eligibility decision. |
| Generic foot/ankle technique context | General heel-raise conditioning instruction exists. | `src-aaos-foot-ankle` | Postoperative range, readiness or prescription. |

## Proposed placement and developer handoff

The developer can implement the 21 `add` records as **disabled reference content** using the proposed IDs, text, logging shape and illustration briefs, provided unresolved setup text is retained and no record is inserted into an active template. Candidates #1–4 and #7 are movement-support candidates. Candidates #5, #6, #17 and #20 are active-program candidates **requiring clinical and integration review**. The remaining `add` records are library-only. Candidates #10–12 should remain deferred records, not runnable exercise entries.

Do not connect logs from these records to existing progression checkpoints without a separate versioned rule change and evidence review. Do not inherit machine/free-weight loads across variants. Do not use equipment ownership, a verified page, an illustration, or a logged attempt as readiness evidence.

## Grouped review questions

The concise blocking questions are maintained in `OPEN_QUESTIONS.md`. In summary, necessary clinical review concerns calf eccentric/isometric eligibility (#5–6), resisted/standing ankle-foot additions (#1–4, #7–9), loaded walking/locomotion (#10–12, #14, #24), new loaded hinge/hip/squat patterns (#13, #15–19), and unstable-surface balance (#20). Equipment review is required for wagon (#10–11), treadmill (#12), trap bar (#13–14), Smith/bench (#15–16), belt squat (#17–18), slant board (#19), inflatable cushion (#20), pull-up assistance (#22), and cable/cuff geometry (#7–9, #23).

## Verification status

The JSON was generated as strict JSON, contains exactly 24 candidates, uses only current equipment IDs, references only declared source IDs, contains no automatic approvals, and leaves unsupported educational doses null. Automated validation results are recorded separately during generation and should be rerun by the integrating developer.
