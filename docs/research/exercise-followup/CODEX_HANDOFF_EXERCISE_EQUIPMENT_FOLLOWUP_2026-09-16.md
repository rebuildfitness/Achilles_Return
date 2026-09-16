# CODEX HANDOFF — Exercise Catalog Follow-Up
**Project:** Achilles Return to Basketball App  
**Date:** September 16, 2026  
**Status:** Developer implementation handoff after exercise-research review and equipment clarification

## Purpose

This handoff supersedes only the wagon/treadmill portions of the prior exercise developer review. All other review findings, clinical safeguards, existing histories, approved criteria, and progression exclusions remain unchanged unless explicitly stated below.

The goal is to let Codex continue implementation without waiting on more wagon or treadmill photos.

---

## 1. Preserve existing clinical and data rules

Do **not** change the following as part of this handoff:

- Do not enable any new exercise for automatic scheduling solely because it is added to the reference catalog.
- Preserve all approved Achilles rehab criteria and progression gates.
- Preserve all completed workout/history data.
- Preserve source metadata and next-morning response requirements.
- Do not reinterpret missing values as zero.
- Do not add educational doses as progression evidence.
- Do not create active demo buttons unless the exact exercise/setup/access has been verified.
- Do not use a general resistance-training source as proof of exercise-specific Achilles eligibility.
- Keep optional movement-support content separate from active rehab progression logic unless specifically approved.

---

## 2. Treadmill identification — resolved

### User-owned device
The user supplied photos of the treadmill and product label.

**Confirmed device:**
- Brand: ProForm
- Product line: Performance 300i
- Model: **PFTL39715.1**
- Electrical label: 120 V, 60 Hz, 11 A
- Maximum user weight on label: 300 lb / 136 kg

### Implementation decision
The exact treadmill model uncertainty is now resolved.

However, **backward treadmill walking is still not approved for automatic programming**.

Reason:
- The exact user device is now known.
- The prior research did not establish manufacturer-supported backward-walking use for this model/revision.
- A same-family manual for a different revision is not sufficient to treat backward walking as manufacturer-authorized use.
- This is a device-use authorization issue, not a conclusion that backward walking is clinically inappropriate in all contexts.

### Codex action
1. Update the owned-equipment record to identify the treadmill as:
   - `ProForm Performance 300i`
   - model `PFTL39715.1`
2. Keep any backward-treadmill-walking candidate:
   - deferred from automatic programming
   - excluded from default plans
   - clearly marked as requiring separate device/use verification
3. Do not infer approval from same-family manuals.
4. Do not remove the exercise concept from research/reference content if it is otherwise useful; keep the distinction between:
   - movement evidence
   - clinical readiness
   - device-specific authorization

No additional treadmill photos are required for the current development decision.

---

## 3. Wagon clarification — architecture change

### User intent
The user's folding utility wagon is **not purpose-built exercise equipment**.

The user may personally use it for rehab/exercise because pushing and pulling a loaded wagon creates a meaningful training effect, but that personal use should not define the app's general equipment model.

### Approved architecture
Use **purpose-built training sled equipment** as the canonical equipment category for sled-based movements.

The user's wagon should be treated as a **personal substitute**, not as the app's reference implementation.

### Canonical equipment concept
Create or use an equipment category equivalent to:

`push/pull training sled compatible with external load`

Do not tie the app to one manufacturer or one product.

A purpose-built sled such as the example the user shared is an acceptable example of the intended equipment class, but it should not become a hard dependency or required brand/model.

### Wagon status
Retain the user's wagon in owned equipment, but tag it as something equivalent to:

- `personal-substitute`
- `not-general-app-equipment`

Do not use the wagon's cargo-capacity claim as:
- exercise resistance capacity
- towing rating
- push-handle exercise rating
- clinical loading guidance
- automatic progression guidance

### Important consequence
The wagon itself should **no longer block development of sled exercises**.

Missing wagon-specific exercise ratings may still limit the user's personal substitution guidance, but they should not delay the canonical sled exercise records.

---

## 4. Exercise-record changes

### Existing wagon-based backward drag
If the current catalog contains an exercise such as:

`weighted-wagon-backward-drag`

migrate the concept toward a canonical sled record such as:

`backward-sled-drag`

### Migration rules
- Preserve all existing completed history.
- Do not delete or rewrite historical sessions.
- If needed, map the legacy wagon record to the new canonical movement for display/search/reference while retaining original logged equipment metadata.
- Do not silently relabel past completed workouts as if a sled had been used when the wagon was actually used.

### Forward push / forward drag or march
Previously deferred wagon-specific candidates should now be reconsidered as **sled exercises**, not wagon exercises.

Examples:
- sled push
- forward sled drag / resisted march
- backward sled drag

These can proceed through content review using a purpose-built training sled as the reference equipment.

They are **not automatically cleared for rehab scheduling** merely because the equipment issue is resolved.

---

## 5. Equipment filtering and substitutions

Codex should separate these concepts:

### Canonical equipment
Purpose-built equipment used to define the exercise safely and consistently.

Example:
- training sled

### Owned equipment
Equipment the user actually has.

Example:
- utility wagon

### Personal substitute
User-specific equipment that may approximate the movement but is not the canonical app standard.

Example:
- utility wagon used as a sled substitute

### Expected behavior
If a workout requires a sled exercise and the user does not own a purpose-built sled:
- the app may surface the user's wagon as a personal substitution **only where specifically permitted**
- it should not imply that the wagon is manufacturer-rated for exercise
- the substitution should remain user-specific
- the app should not expose the wagon as a general recommendation to other users

---

## 6. Remaining exercise-research corrections still required

The following items from the prior developer review remain active and are not superseded by this handoff:

1. **Terminal knee extension**
   - Split band and cable variants or model alternative equipment sets correctly.
   - Clarify anchor direction, contact point, and attachment.
   - Never illustrate a bare cable contacting the knee.

2. **Bent-knee soleus isometric**
   - Choose one canonical position per record.
   - Seated and supported-standing versions should not share one ambiguous setup.

3. **Belt-squat calf raise**
   - Resolve the actual attachment/configuration before naming, illustrating, or linking a demo.

4. **Balance cushion**
   - Verify the actual device/surface match.
   - Replace vague inflation language with manufacturer-supported wording when available.

5. **Single-arm row**
   - Select a canonical position.
   - Treat seated/standing alternatives separately where setup materially differs.

6. **Push-up**
   - Select canonical position(s).
   - Incline, floor, and kneeling versions should be treated as distinct reviewed variations where appropriate.

7. **Bibliography**
   - Correct Revak author metadata.
   - Reconcile the Cheng citation.
   - Keep the Bohm 2022 citation quarantined until the title/PMID pairing is verified.
   - Continue marking unavailable PubMed records as unverified rather than disproven.

8. **Claim scope**
   - Do not use ACSM general resistance-training evidence as exercise-specific proof.

9. **Demo verification**
   - Keep page/text verification separate from playback verification.
   - No dead demo buttons.
   - No generic “Short Demo” labels for missing/uncertain links.

10. **Logging**
    - Explicitly define:
      - required fields
      - units
      - laterality
      - missing-versus-zero behavior
    - Preserve completed logs unchanged.

---

## 7. Codex implementation priorities

### Priority A — equipment/data model
- Add/confirm canonical `training sled` equipment type.
- Add/confirm user-owned wagon as a personal substitute.
- Add exact treadmill model `PFTL39715.1`.
- Preserve all existing owned-equipment records and historical workout references.

### Priority B — exercise normalization
- Normalize wagon-based sled movements to canonical sled exercise records.
- Keep legacy aliases/mappings where needed for backward compatibility.
- Do not rewrite historical equipment usage.

### Priority C — planner protections
Confirm:
- none of the newly researched exercises become automatically scheduled by default
- backward treadmill walking remains excluded/deferred
- personal-substitute equipment does not bypass clinical gates
- sled availability does not bypass Achilles readiness criteria

### Priority D — UI behavior
Where applicable:
- show canonical exercise name
- show actual equipment used in history
- show substitution status when the user uses a personal substitute
- avoid presenting a utility wagon as generally recommended training equipment

---

## 8. Acceptance criteria

Implementation is acceptable when all of the following are true:

- [ ] User treadmill is stored as ProForm Performance 300i, model PFTL39715.1.
- [ ] Backward treadmill walking remains deferred from automatic programming.
- [ ] A purpose-built training sled is the canonical equipment for sled push/pull/drag movements.
- [ ] The user's wagon remains available only as a user-specific substitute.
- [ ] Wagon cargo ratings are not used as exercise-loading limits.
- [ ] Legacy wagon workout history is preserved.
- [ ] Existing backward-wagon-drag history is not falsely relabeled as sled use.
- [ ] New sled records can be developed without waiting for more wagon specifications.
- [ ] Existing Achilles progression/clinical rules remain unchanged.
- [ ] New exercise records do not become automatically scheduled simply because they exist in the catalog.
- [ ] Demo and citation verification flags remain distinct and accurate.
- [ ] No completed history or logged data is lost or rewritten.

---

## 9. Developer note

The key product decision is:

> **The app should be designed around purpose-built exercise equipment. User-specific improvised substitutes may be supported when appropriate, but they should not define the canonical exercise, safety assumptions, equipment requirements, or general recommendations.**

This decision resolves the wagon architecture question and allows the sled exercise work to proceed independently of the user's utility-wagon specifications.
