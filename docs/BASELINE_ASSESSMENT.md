# Baseline Assessment Specification v1.0

## UX principle
The assessment should feel guided, not clinical. Split into short sections with autosave. Do not ask the user to calculate LSI or interpret results.

## Section 1 — Safety and current status
Fields:
- repair side: left/right
- surgery date (prefilled 2026-01-07)
- supervised PT end date (prefilled 2026-06)
- current clinician restrictions: free text + none checkbox
- current clearance for exercise: yes/no/unsure
- complications/rerupture since surgery: yes/no + notes
- resting pain 0–10
- walking pain 0–10
- morning stiffness: none / mild / moderate / significant
- stiffness duration in minutes
- swelling: none / mild / moderate / significant
- tendon soreness/tenderness: none / mild / moderate / significant
- gait: normal / slight limp / clear limp
- unusual symptoms checklist: sharp pain, new bruising, rapid swelling, sudden weakness, new limp, suspected gap, other

If a red-flag item is selected, stop dynamic testing and show safety guidance.

## Section 2 — Daily function
For each, answer: no / yes with symptoms / yes normally
- walk 10 min
- walk 30 min
- brisk walk
- stairs up
- stairs down
- walk on tiptoes
- single-leg stand
- bilateral calf raise
- single-leg calf raise
- jog
- jump

## Section 3 — ATRS and confidence
- ATRS questionnaire (licensed/usage requirements should be verified before production distribution)
- confidence 0–10: brisk walk, run, jump, sprint, cut, basketball

## Section 4 — Knee-to-wall mobility
Instructions:
1. Barefoot or consistent shoes.
2. Face wall; heel stays flat.
3. Knee tracks over second toe.
4. Move foot back until knee just touches wall without heel lift.
5. Record distance from great toe to wall in cm.

Record both sides twice; save best valid trial and symptom response.

## Section 5 — Single-leg balance
- max 60 sec per side
- eyes open
- fingertip support allowed only to prevent fall, but record any touch
- record time, touches, pain, confidence

## Section 6 — Bilateral heel-raise screen
10 reps at 2 sec up / 1 sec top / 2 sec down.
Record:
- completed all 10: yes/no
- symmetry: good / mild shift / clear shift
- heel height: normal-looking / reduced / markedly reduced
- pain 0–10

If unsafe or clearly poor, skip maximal single-leg endurance test and assign strength-focused starting work.

## Section 7 — Standardized single-leg heel-rise test
Test uninvolved side first, then repaired side after adequate rest.

Setup:
- straight knee
- flat floor or same step setup every time
- fingertips on wall for balance only
- metronome 30 raises/min
- maximal controlled height each rep

Stop when any occurs:
- unable to keep cadence for 2 consecutive reps
- heel height clearly falls and cannot be restored
- repeated knee bending used to compensate
- substantial upper-body assistance
- limiting pain
- user elects to stop

Record:
- reps
- peak height cm if measurable
- average height cm if measurable
- pain 0–10
- RPE 0–10
- reason stopped
- optional 10–20 sec side-view video

Derived:
- rep LSI = repaired / uninvolved × 100
- height LSI
- work proxy = reps × average height
- work LSI

If height measurement is not practical, store reps + quality + optional video and flag `heightNotMeasured=true` rather than inventing a value.

## Section 8 — Soleus capacity
Preferred home setup: seated on bench with knee near 90°, forefoot on stable plate/slant board as appropriate, external load applied using Smith machine, dumbbell, or cable setup that is reproducible.

Protocol:
- warm-up set
- choose a load expected for 8–15 good reps
- stop with 1–2 reps in reserve rather than absolute failure
- test both sides when setup allows unilateral work

Record load, reps, RPE, heel-rise quality, pain.

## Section 9 — Straight-knee loaded calf capacity
Preferred setup: supported single-leg calf raise using Smith machine or dumbbell while fingertips provide balance.
Protocol: submaximal 6–12 reps, RPE 7–9, consistent ROM.
Record load, reps, RPE, pain, quality.

## Section 10 — General lower-body capacity
Use submaximal training-capacity tests rather than 1RM:
- belt squat: 8–10 reps at RPE 7–8
- DB RDL: 8–10 reps at RPE 7–8
- step-up: 6–10 reps/side at controlled height and RPE 7–8
- optional hip thrust/bridge: 8–12 reps

These establish starting training loads, not RTS clearance.

## Section 11 — Conditioning
Questions:
- longest comfortable walk
- current weekly bike minutes
- current incline treadmill minutes
- any current jogging/running: yes/no; max continuous minutes; symptoms same day/next morning

Do not initiate running inside baseline unless the seven consensus criteria have already been passed.

## Section 12 — Basketball profile
- preinjury frequency: <1/wk, 1/wk, 2/wk, 3+/wk
- typical format: shooting only, half-court pickup, full-court pickup, league/competitive
- target: recreational shooting, half-court, full-court, competitive
- preferred court access frequency
- confidence 0–10 returning to contact/reactive play

## Section 13 — Soccer profile
- enable soccer track: yes/no
- access to ball: yes/no
- field/yard access: yes/no
- objective: basic skills / recreational play

## Starting-phase algorithm
Pseudo-order:
1. red flags -> SAFETY_HOLD
2. significant gait limitation or inability to perform basic bilateral calf raises -> FOUNDATION_STRENGTH
3. can load calf but fails one or more seven running consensus criteria -> RUNNING_READINESS (or FOUNDATION_STRENGTH if basic capacity is very low)
4. passes seven running consensus criteria but has no recent running tolerance -> RUNNING_READINESS with R1 unlocked
5. passes running criteria and demonstrates recent tolerated running -> RUNNING
6. jump/sprint/COD phases require their own objective checkpoints; never infer from surgery date alone

## Results screen
Show only:
- Recommended starting focus
- Top 2–3 limiting capabilities
- What is already going well
- Next milestone
- Start Plan button

Advanced details behind `View measurements`.
