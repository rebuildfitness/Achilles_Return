# Achilles Return — Movement & Recovery Extension
## Final Designer and Implementation Handoff (v3)

## Purpose

Implement a focused **Movement & Recovery extension** for Achilles Return. This work corrects a current product weakness: mobility and core are embedded inside a recovery logger rather than handled as independently selectable, trackable activities.

This is a feature extension—not a broad redesign. Preserve the existing product hierarchy, criteria-based safety model, visual system, navigation, local-first behavior, backup/restore workflow, and React + TypeScript + Vite architecture.

The extension must allow factual logging of movement completed on any day while keeping the existing plan, restrictions, symptom rules, clinician-review logic, and progression rules authoritative.

---

## Non-negotiable principles

1. **Plan and completed activity are separate.** The Plan describes intended programming. Movement records describe what the user actually did.
2. **Mobility, Core & Stability, Balance & Movement Control, Walking, Cycling, Recovery Practice, and Other are distinct activity types.**
3. **The scheduled Achilles prescription is authoritative.** New Movement & Recovery surfaces must not create a duplicate Achilles prescription or a parallel completion status.
4. **Factual recording is always distinct from permission or progression.** The app must allow a user to accurately record an unplanned activity without treating the record as a recommendation, permission, clearance, adherence credit, tolerance evidence, or progression credit.
5. **Routines are the fast path.** A routine is only recommended or selectable as an active routine after its full definition, substitutions, metadata, safety state, and media fallback have been supplied.
6. **Ordinary support work should remain simple.** Standard mobility, core, balance, and recovery-practice records should normally use `Saved` or `Completed`. Do not introduce `Qualified` as a general status.
7. **Response/tolerance states apply only when an existing rule requires them.** `Response pending`, tolerance evaluation, and progression credit must appear only for linked activity types, exercises, or plan rules that specifically require post-activity or next-morning response data.
8. **Category labels never unlock exercises.** Existing restrictions, criteria, clinician-review requirements, plan rules, and equipment rules are authoritative.
9. **One canonical record prevents double counting.** An activity may have tags, but it is counted once in movement totals.
10. **Today remains uncluttered.** Movement Support is compact and secondary to readiness, the planned session, and the next milestone.

---

## Architecture requirement

### Technology target

Implement within the existing:

- **React**
- **TypeScript**
- **Vite**
- Existing routing, storage, application state, local-first patterns, and JSON backup/import/validation workflow

Do not convert to vanilla JavaScript/HTML/CSS.

### Versioning requirement

The existing backup schema is already version 2. Do **not** reuse or redefine it as a movement-record version.

Use explicit independent version fields:

```json
{
  "backupSchemaVersion": 2,
  "movementRecordSchemaVersion": 1
}
```

Requirements:

- Retain the current `backupSchemaVersion: 2` semantics.
- Introduce `movementRecordSchemaVersion: 1` for this extension.
- Use a documented migration function for legacy recovery entries.
- Preserve legacy display labels and history.
- Maintain import compatibility with backups that contain no movement extension data.

---

## Product model

### Planned work, actual activity, and progression are different layers

| Layer | Definition | Authoritative source | Example |
|---|---|---|---|
| Planned session | Intended scheduled session | Existing Plan/session model | Easy aerobic / Recovery; prescribed Achilles loading |
| Actual activity record | What the user completed or reports completing | Movement record model | 8,000-step walk; Morning Reset; outdoor cycle |
| Tolerance/progression evaluation | Whether a record meets an existing rule’s requirements | Existing rules/criteria engine | Required response complete; restriction check passes |

A movement activity record must never create a second independent “completion status” for a linked prescribed session.

### Canonical activity types

Use a single canonical `activityType` for each saved record:

1. `walk`
2. `cycle`
3. `mobility`
4. `core_stability`
5. `balance_movement_control`
6. `recovery_practice`
7. `other`

**Do not create a generic `prescribed_session` movement activity as a parallel source of truth.** Prescribed sessions remain stored and completed through the existing session model.

Movement records can link to a prescribed session for context or rule evaluation, but that link is referential only:

```json
{
  "linkedPlanItemId": "planitem_2026-09-12_easy_aerobic",
  "linkedSessionId": "session_2026-09-12_achilles_capacity"
}
```

The linked session’s completion status remains authoritative in the existing session model.

### Tags

Tags are descriptive and optional. They never create a duplicate record or a second total.

- `conditioning`
- `recovery_support`
- `pre_lift`
- `post_lift`
- `whole_body`
- `lower_leg`
- `desk_reset`
- `outdoor`
- `low_impact`
- `unplanned`

Example: an outdoor walk can be `activityType: "walk"` with `tags: ["conditioning", "recovery_support", "outdoor", "unplanned"]`. It counts once toward walking movement totals.

---

## Movement categories

| Category | Purpose | Data/reporting | Relationship to plan |
|---|---|---|---|
| Achilles & lower leg | Existing prescribed tendon/calf/ankle work and related plan-approved control work | Existing session/test/criteria logic remains authoritative | Opens existing prescribed work; no duplicate generic prescription |
| Whole-body mobility | Movement up and down the kinetic chain | Independently logged/reported | Available on any day; recommendation depends on plan/restrictions |
| Core & stability | Bracing, trunk control, anti-rotation, carries | Independently logged/reported | Available on any day |
| Balance & movement control | Static/dynamic balance and controlled single-leg movement | Independently logged/reported; eligible metrics can feed existing criteria only when rules explicitly define it | Available or gated based on existing rules |
| Walking & conditioning | Walking/cycling volume | Canonical activity totals | Available for factual logging; automatic suggestion is rule/context aware |
| Recovery practices | Breathwork, approved downshift and non-duplicative recovery work | Independently logged/reported | Available on any day |

---

## Today screen

### Fixed hierarchy

Use this location consistently:

1. Readiness state.
2. Update check-in.
3. Today’s planned session.
4. Next milestone.
5. **Movement Support** compact card.

Movement Support goes **after the Next milestone card**. This preserves the current primary hierarchy: readiness, plan, and objective progression milestone come first. It prevents the support layer from competing with the planned session.

### Compact Movement Support card

```text
Movement support                                      View all ›

[ Mobility ] [ Core ] [ Balance ] [ Walk ]

Optional support work. Choose what fits today.
```

Requirements:

- No more than four visible first-level quick actions in collapsed state.
- Use contextual ordering based on day type, active restrictions, completed session state, and user history.
- `View all` opens Movement & Recovery.
- Do not add a generic Achilles Capacity quick action that could duplicate prescribed loading.
- If prescribed Achilles work is scheduled and incomplete, show **Continue today’s Achilles plan** inside the planned-session area or as a clearly plan-linked action—not as a generic support tile.
- If prescribed Achilles work is completed, do not recommend it again as a separate activity.

### Contextual recommendations

| Planned context | Compact support options |
|---|---|
| Strength day, session incomplete | Pre-Lift Mobility, Core & Bracing, Balance, Walk |
| Strength day, session complete | Post-Lift Reset, Mobility, easy Walk, Recovery Practice |
| Easy aerobic / Recovery day | Walk, Cycle, Mobility, Core |
| Rest / Mobility day | Morning Reset, Undo the Chair, Whole-Body Mobility, Walk |
| Existing Achilles session scheduled/incomplete | Existing **Continue today’s Achilles plan** action; do not duplicate it in support tiles |
| Existing Achilles session completed | Only permitted low-demand support actions; no duplicate Achilles loading |

### Repeat-last activity

Provide a compatible **Repeat last** shortcut when permitted by current plan and restrictions:

```text
Repeat last
Walk · 8,000 steps                                      Add
```

Rules:

- Starts a **draft**, never an automatically saved record.
- Prepopulates prior values.
- Is available only when no current restriction/rule prevents the activity from being suggested.
- If an activity may be recorded factually but is not suggested, expose it through `View all` / `Log unplanned activity`, not Repeat last.
- If an existing linked rule requires a response for tolerance/progression, show that requirement only after saving and only in the relevant context.

---

## Movement & Recovery page

### Title

**Movement & Recovery**

### Subtitle

**Log walking, conditioning, mobility, core, balance, and recovery work.**

### Primary card title

**Today’s movement**

### Support copy

**Log what you did—not what you planned.**

Use an expandable **How logging works** disclosure for the longer safety text: factual logging does not equal permission, medical clearance, adherence credit, tolerance evidence, or progression credit.

### Top-level activity tiles

```text
What supported your movement today?

[ Mobility ]               [ Core & stability ]
[ Balance & control ]      [ Walk ]
[ Cycle ]                  [ Recovery practice ]
[ Log other activity ]
```

Do not place a generic Achilles Capacity tile in this group. Existing planned Achilles work is entered through its current prescribed-session flow.

### Draft-first daily summary

```text
Today’s movement

Saved today
Walk · 8,000 steps                                      Edit

Drafts
Morning Reset · 8 min                                    Edit
Rehab Core · 3 of 4 exercises                            Edit

+ Add activity

[ Save 2 activities ]
```

Definitions:

| State | Meaning | Counted in movement totals? | Can affect tolerance/progression? |
|---|---|---:|---:|
| Draft | Local autosaved work not committed as a completed activity record | No | No |
| Saved | Persisted factual activity record | Yes | Only if an existing linked rule evaluates it |
| Completed | Saved routine/activity with its applicable required completion information | Yes | Only if an existing linked rule evaluates it |
| Response pending | Only shown when an existing linked rule requires post-activity/next-morning response | Yes | No, until required response is complete |
| Tolerance evaluated | Result of existing rule engine, where applicable | N/A | Yes/no according to existing rule logic |
| Modified | Actual work differs from a routine/template/default; factual record remains valid | Yes | Evaluated only by relevant existing rules |

Do not use `Qualified` as an ordinary user-facing status for general mobility, core, balance, walking, cycling, or recovery practices.

---

## Draft, edit, save, undo, and deletion rules

### Draft behavior

- Drafts autosave locally after a brief debounce and before navigation away.
- Drafts survive refresh and offline restart.
- Drafts are visually labeled `Draft`.
- Drafts do not enter movement totals, planned adherence, tolerance, or progression evaluation.
- Users can edit or remove drafts freely.

### Save behavior

- `Save today’s activities` commits all displayed drafts to saved movement records.
- A successful save updates movement totals immediately.
- The app must evaluate only applicable existing tolerance/progression dependencies.
- Saved records are editable from Today, Plan date detail, and Progress recent activity.

### Edit behavior

When a saved activity is edited:

1. Preserve the stable activity ID.
2. Create an audit/revision entry with prior values, timestamp, and edit reason if a rule-linked record is affected.
3. Recalculate all affected movement totals.
4. Reevaluate only the dependent rule outcomes tied to that activity, linked plan item, or linked criteria measure.
5. Update UI states, including `Response pending`, modified status, and any dependent “attention needed” state.
6. Do not alter baseline measurements unless the user is editing a baseline/reassessment record in its existing dedicated workflow.
7. Do not alter unrelated activities or unrelated plan/session completion statuses.

### Undo behavior

Undo reverses only the most recent affected save transaction.

Requirements:

- Undo is available immediately after save and for a short defined period in the confirmation UI.
- Undo removes/reverts only activity records created by that save transaction.
- Undo preserves unrelated saved activities from the same date.
- Undo does **not** delete, alter, or uncomplete a linked prescribed workout/session.
- Undo recalculates only affected movement totals and reevaluates only rule outcomes dependent on the undone record.
- If the record was used by an existing progression/tolerance rule, restore the prior evaluation and explain that relevant activity evidence was removed.
- If the app needs a durable historical record rather than destructive removal, implement a reversible `voided`/`undone` state excluded from totals, instead of hard deletion.

---

## Activity editors

### Walk

Use a canonical `walk` record.

```text
Walk

Quick steps
[ 2,500 ] [ 5,000 ] [ 8,000 ] [ 10,000 ]

[ Custom steps ]

Optional details
Duration
Distance
Surface / incline
Effort: [ Easy ] [ Moderate ] [ Hard ]

[ Add to today ]
```

Requirements:

- Preserve the existing **8,000-step shortcut**.
- Store steps, duration, distance, and unit as structured fields.
- Walking may be logged factually even when it is unplanned; show `Unplanned activity` tag/copy where appropriate.
- Do not create a second “recovery walk” record. Use tags only.
- Do not automatically set next-morning response to required for every walk. That requirement must come from an existing matching rule, plan linkage, or user-specific rule configuration.

### Cycle

Outdoor cycling is **new functionality**. Treat it as a new field and new UI state, not as an existing preserved feature.

```text
Cycle

Type
[ Indoor ] [ Outdoor ]

Duration
[ 10 min ] [ 15 min ] [ 20 min ] [ 25 min ] [ 30 min ]
[ Custom duration ]

Distance
[ Optional ]
Unit: [ mi ] [ km ]

Effort: [ Easy ] [ Moderate ] [ Hard ]

[ Add to today ]
```

Requirements:

- Preserve existing cycle duration logging behavior.
- Add outdoor cycling and distance as new functionality.
- Support miles and kilometers.
- Outdoor cycling must not appear as an automatic suggestion unless the relevant plan/restriction logic separately permits it.

### Mobility

Use routines first:

```text
Mobility

Choose a routine
[ Morning Reset ]
[ Undo the Chair ]
[ Whole-Body Mobility ]
[ Lower-Body Mobility ]
[ Upper-Body Mobility ]

[ Build a custom mobility session ]
```

### Core & Stability

```text
Core & stability

Choose a routine
[ Rehab Core ]
[ Standing Stability ]
[ Pre-Lift Core ]

[ Build a custom core session ]
```

### Balance & Movement Control

```text
Balance & movement control

Choose a routine
[ Balance Basics ]
[ Single-Leg Control ]
[ Dynamic Control ]

[ Build a custom balance session ]
```

### Recovery Practice

```text
Recovery practice

[ Breathwork ]
[ Evening Downshift ]
[ Approved gentle movement ]
[ Other recovery practice ]
```

Do not use this category to create duplicate walk/cycle records.

### Other / unplanned activity

```text
Log other activity

What did you do?
[ Activity name ]

Duration / quantity
[ Optional ]

How did it feel?
[ Optional unless a linked rule applies ]

[ Save activity ]
```

The app must allow factual recording. If the activity is not currently recommended/permitted by plan logic, it should be recorded as `unplanned` and must not be displayed as plan adherence, tolerance evidence, or progression credit unless existing rule logic later determines otherwise.

---

## Routine definitions — required before activation

No routine may be automatically recommended, shown as a default active option, or marked completable without a full definition record.

### Required routine definition fields

```json
{
  "routineId": "morning_reset",
  "routineVersion": "1.0.0",
  "name": "Morning Reset",
  "category": "mobility",
  "intendedContexts": ["any_day", "rest_mobility", "desk_reset"],
  "estimatedDurationMinutes": 8,
  "recommendationRules": ["mobility_support_general"],
  "restrictions": [],
  "sourceMetadata": {
    "definitionOwner": "Achilles Return",
    "reviewStatus": "content_complete",
    "lastReviewedAt": "2026-09-12",
    "evidenceOrRationaleIds": []
  },
  "steps": [
    {
      "order": 1,
      "exerciseId": "diaphragmatic_breathing",
      "defaultDose": {"type": "duration", "seconds": 60},
      "required": true,
      "substitutions": [],
      "setupCues": ["Comfortable position", "Slow controlled breath"],
      "safetyNotes": []
    }
  ]
}
```

### Required exercise step data

Every routine step must include:

- Stable `exerciseId`
- Display order
- Default dose: sets/reps, repetitions per side, hold time, distance, or duration
- Required versus optional designation
- Setup/technique cues
- At least one substitution when a substitute is appropriate
- Position and equipment requirements
- Impact and Achilles-demand metadata where relevant
- Availability/restriction rule reference when applicable
- Source metadata / rationale reference
- Demo status: embed supported, external only, or no media
- Offline written guidance

### Initial complete routine definitions

The following routines must be fully defined before they appear as active recommendations. The listed steps are the initial version-1 content.

#### 1. Morning Reset — Mobility — Version 1.0.0

**Estimated duration:** 8 minutes  
**Intended contexts:** Any day, Rest/Mobility, desk reset  
**Recommendation status:** General support; no automatic progression credit  
**Substitution principle:** Use the listed substitute only if equipment/position/tolerance requires it.

| Order | Exercise | Default dose | Substitute | Notes |
|---:|---|---|---|---|
| 1 | Diaphragmatic breathing with brace | 60 seconds | 90/90 breathing | Comfortable position; no pain-focused requirement |
| 2 | Ankle circles | 30 seconds each direction/side | Ankle alphabet | Gentle controlled range |
| 3 | 90/90 hip switches | 8 reps/side | Seated 90/90 hip rotation | Use support as needed |
| 4 | Open-book thoracic rotation | 6 reps/side | Seated thoracic rotation | Controlled range; do not force rotation |
| 5 | Wall slides | 10 reps | Scapular wall slides | Use pain-free range |

#### 2. Undo the Chair — Mobility — Version 1.0.0

**Estimated duration:** 10 minutes  
**Intended contexts:** Desk-work, recovery support, rest/mobility day  
**Recommendation status:** General support; no automatic progression credit.

| Order | Exercise | Default dose | Substitute | Notes |
|---:|---|---|---|---|
| 1 | Seated thoracic extension over chair back | 8 slow reps | Cat-cow | Use stable chair; avoid neck strain |
| 2 | Half-kneeling hip-flexor stretch | 30 seconds/side | Standing hip-flexor stretch | Pad knee if needed; controlled pelvic position |
| 3 | Open-book thoracic rotation | 6 reps/side | Thread-the-needle | Controlled range |
| 4 | Band pull-aparts | 2 sets × 10 | Scapular wall slides | Requires rehab band; omit if shoulder symptoms |
| 5 | Chin tucks | 8 reps with 3-second hold | Controlled neck rotations | Gentle, no forced range |

#### 3. Whole-Body Mobility — Mobility — Version 1.0.0

**Estimated duration:** 12 minutes  
**Intended contexts:** Any day, Rest/Mobility, post-lift reset  
**Recommendation status:** General support; no automatic progression credit.

| Order | Exercise | Default dose | Substitute | Notes |
|---:|---|---|---|---|
| 1 | Ankle circles | 30 seconds each direction/side | Ankle alphabet | Controlled range |
| 2 | Knee-to-wall dorsiflexion mobility | 2 sets × 8/side | Seated ankle dorsiflexion | Must honor active Achilles restrictions |
| 3 | 90/90 hip switches | 8 reps/side | Seated 90/90 rotation | Use hand support as needed |
| 4 | Adductor rock-back | 8 reps/side | Quadruped rock-back | Controlled, no forced depth |
| 5 | Open-book thoracic rotation | 6 reps/side | Seated thoracic rotation | Controlled range |
| 6 | Wall slides | 10 reps | Scapular wall slides | Pain-free range |

#### 4. Lower-Body Rebuild — Mobility/Control — Version 1.0.0

**Estimated duration:** 12 minutes  
**Intended contexts:** Strength preparation, recovery support  
**Recommendation status:** General support; no automatic progression credit. Individual exercise restrictions still apply.

| Order | Exercise | Default dose | Substitute | Notes |
|---:|---|---|---|---|
| 1 | Pelvic tilts | 10 reps | 90/90 breathing | Controlled lumbar/pelvic movement |
| 2 | Glute bridge with reach | 2 sets × 8 | Standard glute bridge | Keep controlled trunk position |
| 3 | Banded lateral walk | 2 sets × 8 steps/side | Side-lying clamshell with brace | Requires band; avoid if gait/ankle response is poor |
| 4 | Supported hip airplane | 2 sets × 5/side | Supported single-leg stance | Use wall/rack; prioritize control |
| 5 | Box squat pattern | 2 sets × 8 | Sit-to-stand with symmetrical loading | Must comply with active lower-body restrictions |

#### 5. Rehab Core — Core & Stability — Version 1.0.0

**Estimated duration:** 10 minutes  
**Intended contexts:** Any day, recovery support, post-lift when tolerated  
**Recommendation status:** General support; no automatic progression credit.

| Order | Exercise | Default dose | Substitute | Notes |
|---:|---|---|---|---|
| 1 | 90/90 breathing | 5 breaths | Diaphragmatic breathing with brace | Controlled breathing/bracing |
| 2 | Dead bug | 2 sets × 6/side | Dead-bug heel tap | Maintain trunk control |
| 3 | Seated core march | 2 sets × 8/side | Seated alternating knee lift | Use upright controlled posture |
| 4 | Seated Pallof hold | 2 sets × 15 sec/side | Seated Pallof press × 8/side | Requires cable/band; low rotation |
| 5 | Side plank from knees | 2 sets × 15 sec/side | Side-lying clamshell with brace | Use comfortable shoulder position |

#### 6. Standing Stability — Core & Stability — Version 1.0.0

**Estimated duration:** 12 minutes  
**Intended contexts:** Strength day, active recovery support  
**Recommendation status:** General support; individual standing/carry work follows active restrictions.

| Order | Exercise | Default dose | Substitute | Notes |
|---:|---|---|---|---|
| 1 | Standing Pallof press | 2 sets × 8/side | Seated Pallof press | Cable/band; stable stance |
| 2 | Cable anti-rotation walkout | 2 sets × 5/side | Standing Pallof hold 15 sec/side | Use controlled steps |
| 3 | Supported single-arm cable press with brace | 2 sets × 8/side | Seated cable/band press | Use support as needed |
| 4 | Suitcase carry | 2 × 20–30 m/side | Seated suitcase hold 20 sec/side | Must comply with gait/Achilles restrictions |
| 5 | Supported single-leg stance | 2 × 20 sec/side | Tandem stance | Quality before duration |

#### 7. Pre-Lift Prep — Mobility/Core — Version 1.0.0

**Estimated duration:** 8 minutes  
**Intended contexts:** Strength day before planned session  
**Recommendation status:** Suggested only when compatible with the scheduled plan; it does not replace formal warm-up requirements.

| Order | Exercise | Default dose | Substitute | Notes |
|---:|---|---|---|---|
| 1 | Cat-cow | 8 reps | Seated thoracic extension | Controlled range |
| 2 | Knee-to-wall dorsiflexion mobility | 1 set × 8/side | Seated ankle dorsiflexion | Respect active restrictions |
| 3 | 90/90 hip switches | 6 reps/side | Seated 90/90 rotations | Controlled range |
| 4 | Dead bug | 1 set × 6/side | Bent-knee fall-out | Brace and control |
| 5 | Standing Pallof press | 1 set × 8/side | Seated Pallof press | Light setup, not fatigue work |

#### 8. Balance Basics — Balance & Movement Control — Version 1.0.0

**Estimated duration:** 8 minutes  
**Intended contexts:** Any day when current rules permit  
**Recommendation status:** General balance support. It does not satisfy a formal entry criterion unless the existing Test/criteria workflow explicitly records that criterion.

| Order | Exercise | Default dose | Substitute | Notes |
|---:|---|---|---|---|
| 1 | Supported weight shifts | 10 reps/side | Lateral weight shifts | Controlled loading |
| 2 | Tandem stance | 2 × 20 sec/side | Wide tandem stance | Use support as needed |
| 3 | Supported single-leg stance | 2 × 20 sec/side | Toe-touch single-leg stance | Document support level |
| 4 | Star reach | 1 set × 3 reaches/direction/side | Single-leg balance with reach | Must meet active balance restrictions |
| 5 | Controlled step-down | 2 sets × 5/side | Supported step-down | Prioritize alignment/control |

#### 9. Evening Downshift — Recovery Practice — Version 1.0.0

**Estimated duration:** 6 minutes  
**Intended contexts:** Rest/recovery support, evening routine  
**Recommendation status:** Recovery support only; no automatic progression credit.

| Order | Exercise/practice | Default dose | Substitute | Notes |
|---:|---|---|---|---|
| 1 | Diaphragmatic breathing | 2 minutes | 90/90 breathing | Comfortable position |
| 2 | Cat-cow | 6 slow reps | Seated thoracic extension | Easy range |
| 3 | Figure-four glute stretch | 30 sec/side | Seated figure-four stretch | Gentle, no force |
| 4 | Open-book rotation | 5 reps/side | Seated thoracic rotation | Controlled |
| 5 | Optional personal recovery note | Optional | None | Factual note only |

### Foam roller routine content

Do not include foam-roller exercises in the active recommended routines above. They may appear in the library only when equipment availability and exercise definition metadata are present. They are not automatically suggested until separately confirmed.

---

## Exercise library

### Category navigation

Retain the existing Exercise Library and add the following top-level category filters:

```text
All   Strength   Achilles   Mobility   Core   Balance
```

### Phased library filter delivery — conflict resolved

| Feature | Release phase | Requirement |
|---|---|---|
| Top-level categories | Phase 1 | Required |
| Body-area filter | Phase 1 | Required when tags are complete for surfaced exercises |
| Equipment filter | Phase 1 | Reuse/retain existing equipment behavior |
| Position filter | Phase 1 | Required for routine/library discovery |
| Impact filter | Phase 2 | Add only after metadata is complete and validated |
| Achilles-demand filter | Phase 2 | Add only after metadata is complete and validated |
| Advanced multi-filter combinations | Phase 2 | Add after performance/usability testing |

Routine versions and exercise-level completion are **Phase 1**, not Phase 2.

### Availability/safety states

Do not use “Clinician-approved” as if approval has already been recorded. Use distinct states:

| UI state | Meaning | Behavior |
|---|---|---|
| Available in current plan | Existing plan/rules permit it | Standard selection available |
| Requires criteria | Existing criteria checks are incomplete | Show missing criteria; category does not unlock it |
| Requires clinician review | Review/confirmation is required but not recorded | Do not imply clearance |
| Clinician review recorded | Relevant review/approval/restriction status is on file | Still subject to existing plan and criteria checks |
| Restricted | Current restriction, response, or plan rule prevents normal use | Prevent normal completion/progression credit |
| Informational / future progression | Visible for education | Not normally selectable as completed work |

### Exercise row

Each movement is one full-width interactive row:

```text
[ ]  Knee-to-wall mobility
     Ankle / lower leg · Low Achilles demand
                                              Demo ›
```

Requirements:

- Main row toggles selection/completion.
- Demo opens detail and never toggles selection.
- Selection/completion state is explicit.
- Parent routine/category displays count, e.g., `3 selected` or `2 of 5 complete`.

---

## Demo requirements

Do not promise that every exercise has a 15–45 second embedded demo.

For every exercise media source, verify:

- A valid demo exists.
- Expected duration.
- Embedding permission and technical support.
- iOS Safari and installed PWA behavior.
- Online requirement.

### Required fallback UI

```text
Demo
[ Play in app ]       // render only when embedding is verified
[ Open external demo ]

Offline guidance
Demo requires internet. Setup and key cues are available below.
```

If embedding is unsupported or unverified, display only the external link fallback plus offline written setup and cues.

---

## Symptoms, tolerance, and progression

### Default rule

Most Mobility, Core & Stability, Balance & Movement Control, Recovery Practice, Walk, and Cycle records should simply be `Saved` or `Completed`.

Do not require a next-morning response for every activity.

### When response is required

Only create `Response pending` if an existing rule explicitly requires response data for one or more of:

- The linked plan item.
- The linked prescribed session.
- The activity type/quantity/effort.
- A specific exercise’s Achilles demand or criteria role.
- An existing user-specific restriction or rule configuration.

### Per-activity symptom capture

Attach symptom/response data to the individual activity record, not only the date.

```text
How did this activity feel?

Effort
[ Easy ] [ Moderate ] [ Hard ]

Pain during
0 1 2 3 4 5 6 7 8 9 10

Pain immediately after
0 1 2 3 4 5 6 7 8 9 10

Notes
[ Optional notes ]
```

### Rule-driven Achilles response

When required by an existing rule, add only the needed fields:

```text
Achilles response required for tolerance review

Stiffness before activity
Pain during activity
Pain after activity
Swelling compared with usual
Confidence, if applicable

[ Save response ]
```

### Next-morning follow-up

Show next-morning follow-up only for records where an existing rule requires it:

```text
How did your Achilles respond to yesterday’s activity?

Morning pain       0–10
Stiffness duration [ None ] [ <5 min ] [ 5–15 min ] [ 15–30 min ] [ >30 min ]
Swelling           [ Less ] [ Same ] [ More ]

[ Save response ]
```

A saved record with required unanswered response data should show `Response pending`. It can count in **movement totals**, but it must not be used as tolerance or progression evidence until the existing rule engine evaluates it.

---

## Record schema

### Core requirements

- Stable activity IDs.
- Explicit movement record schema version.
- Per-activity symptoms.
- Per-exercise completion and actual quantities.
- Routine ID and routine version.
- Draft/saved/completed/response-pending/modified states.
- Referential links to existing sessions and plan items.
- Existing prescribed session remains the sole authority for prescribed-session completion.
- Revisions and undo history for saved activity edits.

### Example movement day record

```json
{
  "movementRecordSchemaVersion": 1,
  "date": "2026-09-12",
  "activities": [
    {
      "id": "act_01J7KQ4D6B2C8X",
      "status": "saved",
      "activityType": "walk",
      "tags": ["conditioning", "recovery_support"],
      "occurredAt": "2026-09-12T15:30:00-04:00",
      "quantity": {
        "steps": 8000,
        "durationMinutes": null,
        "distance": null,
        "distanceUnit": null
      },
      "effort": "easy",
      "linkedPlanItemId": "planitem_2026-09-12_easy_aerobic",
      "linkedSessionId": null,
      "ruleEvaluation": {
        "requiresResponse": false,
        "responseStatus": "not_required",
        "toleranceStatus": "not_applicable"
      },
      "symptoms": {
        "painDuring": 1,
        "painAfter": 1,
        "notes": ""
      },
      "revision": 1,
      "createdAt": "2026-09-12T15:30:00-04:00",
      "updatedAt": "2026-09-12T15:30:00-04:00"
    },
    {
      "id": "draft_01J7KQ6JH37A9M",
      "status": "draft",
      "activityType": "mobility",
      "tags": ["whole_body", "desk_reset"],
      "occurredAt": "2026-09-12T15:35:00-04:00",
      "routineInstance": {
        "id": "ri_01J7KQ77N8V5DT",
        "routineId": "morning_reset",
        "routineVersion": "1.0.0",
        "definitionSnapshotId": "routine_morning_reset_1.0.0",
        "wasModified": false,
        "durationMinutes": 8,
        "exerciseCompletions": [
          {
            "id": "ec_01J7KQ8Y7H5PHB",
            "exerciseId": "diaphragmatic_breathing",
            "status": "completed",
            "actual": {
              "sets": null,
              "reps": null,
              "repsPerSide": null,
              "durationSeconds": 60,
              "distance": null,
              "distanceUnit": null
            },
            "substitutionExerciseId": null,
            "skipReason": null,
            "notes": ""
          },
          {
            "id": "ec_01J7KQ9KZGV4BF",
            "exerciseId": "open_book",
            "status": "completed",
            "actual": {
              "sets": 1,
              "reps": 6,
              "repsPerSide": 6,
              "durationSeconds": null,
              "distance": null,
              "distanceUnit": null
            },
            "substitutionExerciseId": null,
            "skipReason": null,
            "notes": ""
          }
        ]
      },
      "linkedPlanItemId": null,
      "linkedSessionId": null,
      "ruleEvaluation": {
        "requiresResponse": false,
        "responseStatus": "not_required",
        "toleranceStatus": "not_applicable"
      },
      "symptoms": null,
      "revision": 1,
      "createdAt": "2026-09-12T15:35:00-04:00",
      "updatedAt": "2026-09-12T15:36:00-04:00"
    }
  ]
}
```

### Example cycle record

```json
{
  "id": "act_01J7CYCLEOUTDOOR",
  "status": "saved",
  "activityType": "cycle",
  "tags": ["conditioning", "outdoor", "unplanned"],
  "cycleType": "outdoor",
  "quantity": {
    "durationMinutes": 30,
    "distance": 5.2,
    "distanceUnit": "mi"
  },
  "ruleEvaluation": {
    "requiresResponse": false,
    "responseStatus": "not_required",
    "toleranceStatus": "not_applicable"
  }
}
```

### Linked prescribed session rule

Movement records may link to existing plan/session IDs. They must not contain a competing prescribed-session completion source.

```json
{
  "linkedPlanItemId": "planitem_2026-09-12_easy_aerobic",
  "linkedSessionId": "session_2026-09-12_achilles_capacity",
  "linkedSessionRelationship": "context_only"
}
```

If a user completes the prescribed Achilles session, the existing session completion object remains authoritative. A related movement record may reference it for display or symptom correlation only.

---

## Progress requirements

### Existing tabs

Retain:

```text
Overview | Strength | Rehab | Sport
```

Add:

```text
Movement
```

### Movement tab

The Movement tab reports actual movement activity and consistency. It does not modify or replace baseline measurements, formal rehab metrics, sports criteria, or strength progression.

```text
Movement

This week
3 mobility sessions · 2 core sessions · 2 balance sessions

Walking
18,450 steps

Cycling
45 min · 6.2 mi

Most used routine
Morning Reset · 3 completions

Follow-up
1 response pending
```

Use **movement totals**, not “baseline totals.”

### Scope by tab

| Tab | Scope |
|---|---|
| Overview | High-level training and movement summary |
| Strength | Loads, reps, setup, progression |
| Rehab | Existing measurements, side-to-side comparison, calf capacity, symptoms/responses, criteria |
| Sport | Existing graded exposure and sport prerequisites |
| Movement | Mobility/core/balance/recovery practice consistency, walk/cycle metrics, routine completion, movement totals |

Canonical activity records are counted once. Tags only affect filters, contextual surfaces, and breakdowns.

---

## Phase plan — final

### Phase 1: Functional Movement & Recovery foundation

Ship all of the following together:

1. Canonical activity types: Walk, Cycle, Mobility, Core & Stability, Balance & Movement Control, Recovery Practice, Other.
2. Canonical tags and no-double-counting totals.
3. Draft/saved/completed/response-pending/modified state model.
4. Local autosave drafts, edit/remove, save transaction, and scoped undo.
5. Recalculation of affected movement totals after save/edit/undo.
6. Re-evaluation of only dependent existing tolerance/progression rules after save/edit/undo.
7. Walk editor with 2,500/5,000/**8,000**/10,000 shortcuts and custom steps.
8. Cycle editor with existing duration behavior plus new outdoor/indoor type, distance, and mi/km.
9. Compact Today Movement Support card positioned after Next milestone.
10. Existing prescribed Achilles session linkage and duplicate-prevention behavior.
11. Routine-first Mobility, Core & Stability, Balance & Movement Control, and Recovery Practice flows.
12. Full, versioned routine definitions for the nine initial routines in this document.
13. Routine versions, definition snapshots, per-exercise completion, actual quantities, substitutions, skips, and modifications.
14. Per-activity symptoms and rule-driven—not universal—response requirements.
15. Exercise Library top-level categories plus body-area, equipment, and position filters where metadata is complete.
16. Full-width accessible exercise rows.
17. Demo external-link fallback and offline written guidance.
18. Movement record schema version 1, migration, and backup-schema-v2 compatibility.
19. Initial Movement Progress tab.

### Phase 2: Taxonomy and advanced discovery

1. Impact and Achilles-demand filters after metadata validation.
2. Advanced multi-filter combinations after usability/performance testing.
3. Expanded exercise content after definitions, substitutions, safety metadata, and source metadata are complete.
4. Enhanced Movement reporting and body-region breakdowns.
5. Additional optional routines only after complete routine definition records exist.

### Phase 3: Media and deeper criteria integration

1. Source-by-source verified in-app demo embedding where technically supported.
2. Retain external-link and offline guidance fallback for unsupported sources.
3. Connect qualifying Balance/Movement measures into existing Tests/criteria only where a formal measurement definition and existing rule supports it.
4. Continue to keep sport exposures under current Sport criteria/restriction logic.

---

## Visual and interaction requirements

### Preserve

- Navy header.
- Pale blue-gray background.
- White rounded cards with soft borders/shadows.
- Bright blue primary CTA.
- High-contrast dark headings.
- Fixed bottom navigation.
- Calm, clinical, athlete-centered tone.

### Apply

- Compact Today support card after milestone.
- Large touch-friendly activity tiles on the Movement & Recovery page.
- Chips for step/duration quick choices.
- Numeric controls for custom quantity.
- Routine cards as the default selection surface.
- Full-width exercise rows.
- Bottom sheets/focused detail screens for exercise guidance and media.
- Sticky CTAs above fixed navigation/safe area.
- Clear visual + text treatment for Draft, Saved, Completed, Response pending, Modified, Restricted, and Requires clinician review.

### Avoid

- Mixed native dropdown/wheel picker for steps, cycling durations, mobility, core, and other activities.
- A generic parallel Achilles Capacity action.
- Combining mobility and core into a single accordion.
- Showing Movement Support before next milestone or allowing it to dominate Today.
- Treating unplanned logged activity as permission or progression.
- Promising embedded video playback without verification.

---

## Accessibility requirements

- 44 × 44 CSS-pixel touch targets where practical.
- Explicit accessible labels for every control.
- Semantic `fieldset` and `legend` for grouped controls.
- Keyboard/screen-reader accessible exercise rows and action buttons.
- Visible keyboard focus states.
- No clipped content or horizontal scrolling at enlarged text sizes.
- No reliance on color alone for status, severity, permission, or completion.
- `aria-live="polite"` save/undo/status messages.
- Sticky CTA placement above the fixed navigation and device safe area.
- Accessible text for Draft, Saved, Response pending, Modified, Restricted, Requires clinician review, and Clinician review recorded states.

---

## Designer deliverables

Provide high-fidelity mobile-first designs and implementation-ready interaction notes for:

1. Today with Movement Support positioned after Next milestone.
2. Today context variants: strength incomplete/completed, recovery, rest/mobility, scheduled Achilles plan incomplete/completed.
3. Movement & Recovery page with Saved and Draft sections.
4. Top-level activity tile selection including Recovery Practice and Log other activity.
5. Repeat-last compatible activity flow.
6. Walk editor with retained 8,000-step shortcut.
7. Cycle editor with new indoor/outdoor and miles/km fields.
8. Mobility, Core & Stability, Balance & Movement Control, and Recovery Practice routine selection.
9. Existing prescribed Achilles plan continuation state, including complete/incomplete/restricted state.
10. Routine detail, execution, substitutions, skips, modifications, and completion states.
11. Full-width exercise rows.
12. Exercise detail, verified embed state, external-link fallback, and offline guidance state.
13. Daily draft/save summary.
14. Save confirmation, scoped undo, and edit/revision state.
15. Per-activity symptom entry.
16. Rule-driven next-morning response card.
17. Exercise Library category filters and Phase 1 filter controls.
18. Progress → Movement tab.
19. Empty, draft-restored, offline, validation, restricted, and error states.

Also provide:

- Component specifications for activity tiles, chips, activity cards, routine cards, exercise rows, state labels, symptom inputs, sticky footer, and bottom sheets.
- Responsive behavior for small iPhones, standard iPhones, larger iPhones, Safari browser mode, and installed standalone PWA mode.
- Accessibility annotations for semantics, labels, focus behavior, contrast, touch targets, and screen-reader output.
- Handoff notes for React + TypeScript + Vite implementation.

---

## Final acceptance criteria

1. Mobility, Core & Stability, Balance & Movement Control, Walk, Cycle, Recovery Practice, and Other are separate canonical activity types.
2. Recovery Practice is visible in the top-level activity selection.
3. Mobility, core, balance, walking, cycling, and recovery practice can be factually recorded on any day.
4. A factual unplanned record never implies permission, adherence, tolerance, progression credit, or medical clearance.
5. Planned work and actual activity remain separate models.
6. Existing prescribed Achilles sessions remain the sole authoritative completion records.
7. “Continue today’s Achilles plan” opens existing prescription flow and accounts for scheduled/completed/restricted state.
8. No generic Achilles Capacity activity creates duplicate prescribed loading.
9. Movement Support appears after Next milestone and stays compact/secondary.
10. Walk is one canonical record type; cycle is one canonical record type; tags do not duplicate totals.
11. The 8,000-step shortcut is retained.
12. Cycle duration remains supported; outdoor cycling, distance, and miles/km are implemented as explicitly new functionality.
13. Outdoor cycling and foam-roller work are not automatic recommendations unless separately supported by plan/restriction logic.
14. Drafts autosave locally and are visibly distinct from saved records.
15. Drafts do not count in movement totals, adherence, tolerance, or progression.
16. Saved activity edits preserve stable IDs, update movement totals, and reevaluate only affected dependent rules.
17. Undo affects only records from the associated save transaction, preserves unrelated daily activities, and never deletes/changes a linked prescribed session.
18. Routine versions and per-exercise completion/actual quantities ship in Phase 1.
19. No routine is active/recommended until its complete exercise list, doses, substitutions, metadata, source/rationale metadata, safety state, and media fallback are defined.
20. Ordinary mobility/core/balance/recovery activities use Saved/Completed status without artificial qualification barriers.
21. Response pending and tolerance/progression evaluation appear only when existing linked rules require them.
22. The example walk does not require a next-morning response unless an existing matching rule applies.
23. Symptoms are stored per activity and distinguish walk, cycle, mobility, core, balance, and plan-linked Achilles work.
24. Linked sessions are referential only in movement records; session completion remains authoritative in the existing session model.
25. Movement records use `movementRecordSchemaVersion: 1` while preserving `backupSchemaVersion: 2`.
26. Exercise category membership never unlocks an exercise; existing restriction, criteria, clinician-review, plan, and equipment logic remain authoritative.
27. “Requires clinician review” and “Clinician review recorded” are distinct states, and neither independently bypasses plan/criteria checks.
28. Advanced running, hopping, landing, sprinting, deceleration, and change-of-direction activities remain under existing Sport rules.
29. Demo media is verified individually; unsupported media uses external-link and offline-written-guidance fallback.
30. Library categories, body-area, equipment, and position filters ship in Phase 1 only where metadata is complete; impact/Achilles-demand filters ship in Phase 2.
31. Movement totals are distinct from baseline measurements.
32. The app preserves visual language, fixed navigation, local-first behavior, JSON backup/restore compatibility, and React + TypeScript + Vite architecture.
33. Primary actions remain usable above the bottom navigation and safe area.
34. All new controls meet the stated accessibility requirements.
