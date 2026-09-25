# Achilles Return to Basketball — Master Plan v1.0

## Purpose
This document is the authoritative rehabilitation and product specification for the Achilles Return to Basketball app. Codex should implement this plan; it should not invent rehabilitation rules or daily workouts outside these specifications.

## User context
- Male, age 47
- Surgically repaired Achilles rupture
- Surgery date: 2026-01-07
- Supervised PT ended: 2026-06
- No consistent structured rehab since PT ended
- Primary goal: safe progressive return to basketball
- Secondary goals: sprinting, serious strength training, general athletic performance, beginner soccer
- Home-gym equipment only: Smith machine, adjustable bench, cable station, belt squat, trap/hex bar, dumbbells, pull-up bar, dip bars, exercise bike, incline treadmill, slant board, balance pad, rehab bands, weighted wagon used as a sled substitute
- Do not prescribe a standalone leg press or any unowned machine.

## Clinical philosophy
1. Progression is criteria-driven, not calendar-driven.
2. Time after surgery remains biological context, but it does not by itself unlock running, jumping, sprinting, cutting, or basketball.
3. Safety rules outrank readiness scores, motivation, sleep, or performance.
4. Every meaningful progression requires both **capacity** and **tolerance**.
5. A session is not considered tolerated until the next-morning response is recorded.
6. Minimum entry criteria, training targets, and late-stage sport-readiness targets are separate concepts.
7. Limb symmetry is useful but not a universal clearance guarantee.
8. The app must expose why a decision was made, but the normal UI stays simple.
9. AI may explain evidence or assist development; the rehabilitation engine itself is deterministic and versioned.

## Evidence hierarchy used by the app
Each clinical rule and intervention stores both evidence strength and evidence type.

### Evidence strength
- Strong/supportive
- Moderate
- Emerging/conditional
- Limited/uncertain
- Conservative implementation rule

### Evidence type
- Achilles rupture-specific research
- Achilles repair expert consensus
- General tendon research
- Sports-performance evidence
- Extrapolated rehabilitation evidence
- Product/engineering safeguard

## Key evidence anchors
- 2026 international modified Delphi consensus identified seven criteria before return to running after surgical Achilles repair: no pain in daily life; no pain during/after rehabilitation; walk without limp; walk on tiptoes; 10 single-leg heel rises; good single-leg balance; psychological readiness. The authors explicitly state these still require prospective validation.
- 2026 scoping review of return-to-sport clearance after Achilles repair found no validated objective RTS criterion among 34 studies. Therefore the app uses a multi-domain test battery plus progressive sport exposure.
- Contemporary Achilles rehabilitation guidance supports progressive loading, plantar-flexor strength restoration in different joint positions, elastic/reactive loading, running, sprinting, multidirectional work, and criterion-based return to sport.
- Heel-rise work and height can reveal meaningful residual deficits even when repetition counts look relatively recovered.
- Achilles loading increases substantially from walking to running and higher-rate athletic tasks, supporting a graded exposure model.

## User-facing phase labels
1. Re-entry / Baseline
2. Foundational Strength
3. Running Readiness
4. Running
5. Jumping & Landing
6. Plyometrics
7. Speed & Sprinting
8. Deceleration & Change of Direction
9. Basketball Reintroduction
10. Controlled Basketball
11. Full Basketball
12. Basketball Performance

These are presentation labels. The engine also tracks capabilities independently, so low-level activities can overlap safely without forcing perfectly linear progression.

## Capability domains
- Symptoms / tendon status
- Straight-knee plantar-flexor strength
- Bent-knee/soleus strength
- Heel-rise endurance / height / work
- General lower-body strength
- Balance and single-leg control
- Running capacity
- Jump/landing capacity
- Reactive/plyometric capacity
- Acceleration / high-speed running
- Deceleration
- Change of direction
- Basketball exposure tolerance
- Psychological readiness

## Safety hierarchy
### RED — stop Achilles progression
Examples:
- sudden sharp Achilles pain
- new bruising
- rapid or major swelling
- acute loss of plantarflexion strength
- new significant limp
- suspected tendon defect/gap
- sudden inability to perform a previously easy heel raise
- other concerning acute symptoms

Action: do not generate an Achilles-loading workout. Show appropriate medical-evaluation guidance.

### YELLOW — hold or modify
Examples:
- meaningful increase in morning stiffness
- mild new swelling
- increased tendon soreness
- poorer-than-normal response to prior session
- clearly poor overall recovery

Implementation behavior:
- Yellow 1: keep the session structure, reduce Achilles volume about 20–30%, do not progress load.
- Yellow 2: remove impact/high-rate work; reduce Achilles-loading dose by about one tier.
- Yellow 3: recovery-focused day with low-impact conditioning and only tolerated low-load work.

These percentages are conservative implementation rules, not validated Achilles thresholds.

### GREEN — proceed
Symptoms and function are at or near established baseline, no red flags, and prior loading was tolerated.

## Next-morning tolerance rule
Every Achilles-loading workout ends as `PENDING_NEXT_DAY_RESPONSE`.
The next morning it becomes:
- TOLERATED: symptoms/function are at or near baseline; no red flags; no meaningful new gait/strength change.
- BORDERLINE: a meaningful but non-urgent symptom increase is present.
- NOT_TOLERATED: substantial symptom increase, repeated worsening, or significant functional deterioration without a red-flag event.
- MEDICAL_FLAG: red-flag response.

Progression cannot occur while the prior relevant exposure is pending.

## Global progression rules
- Change one primary loading variable at a time when possible.
- Strength: progress reps/quality before adding load; quality and heel-rise height outrank external load.
- Running: progress duration, speed, density, or terrain primarily one at a time.
- Plyometrics: progress contacts, amplitude, direction, unilateral demand, or reactivity primarily one at a time.
- Sprinting: preserve full recovery between reps; sprinting is quality work, not conditioning.
- COD: planned movement precedes reactive movement.
- Basketball: programmed exposure precedes unrestricted pickup.
- Missed sessions are never “made up” by doubling the next dose.
- One poor session regresses the specific exposure, not the entire rehabilitation program.

# Baseline assessment
The baseline should be completed before the app assigns the main program. It may be divided into 2–3 sessions to avoid fatigue.

## A. Intake and safety
Capture:
- repair side
- surgery date
- last PT date
- current medical restrictions/clearance
- postoperative complications or rerupture history
- current pain, morning stiffness duration/severity, swelling, soreness/tenderness
- walking/gait status and walking tolerance
- stairs
- current exercise/conditioning volume
- basketball history and target level
- soccer interest
- available equipment and weekly availability

## B. Patient-reported outcome / confidence
- ATRS periodically
- 0–10 confidence ratings for brisk walking, running, jumping, sprinting, cutting, and basketball
- ALR-RSI later in return-to-sport stages

## C. Mobility
### Knee-to-wall dorsiflexion
Both sides; record centimeters and symptoms.
- heel stays down
- knee tracks over foot
- same setup every retest

Mobility is treated as a functional metric, not a goal to maximize aggressively.

## D. Balance
Single-leg stance, both sides, up to 60 seconds.
Record:
- duration
- touches / loss of balance
- pain
- confidence

## E. Bilateral calf-raise screen
10 slow controlled bilateral heel raises before unilateral testing.
Suggested tempo: 2 sec up / 1 sec hold / 2 sec down.
Observe symmetry, heel height, pain, tremor, compensation.

## F. Standardized single-leg heel-rise test
Both sides under identical conditions.
- straight knee
- fingertips only for balance
- metronome approximately 30 raises/minute
- rise as high as possible every repetition
- stop for meaningful height collapse, repeated knee flexion, strong upper-body assistance, inability to maintain cadence, or limiting pain

Record:
- repetitions
- peak/estimated heel-rise height
- average/estimated height if practical
- work proxy = reps × average height
- pain
- RPE
- termination reason
- video optional for later measurement consistency

Calculate:
- repetition LSI
- height LSI
- heel-rise work LSI

Do not use repetitions alone.

## G. Bent-knee/soleus capacity
Use a reproducible home-gym setup such as loaded seated calf raise using bench + Smith/dumbbell/cable setup.
- submaximal 8–15 rep testing, not a true 1RM
- both sides when practical
- record load, reps, RPE, ROM quality

## H. Straight-knee plantar-flexor strength
Use loaded single-leg standing calf raise or Smith-supported calf raise when safe.
- submaximal 6–12 rep testing
- record load, reps, RPE, heel height/quality

If professional dynamometry/isometric testing is available later, store it as preferred objective strength data.

## I. General lower-body strength
Use safe submaximal tests with owned equipment:
- belt squat 8–10RM estimate
- dumbbell RDL 8–10RM estimate
- step-up controlled 6–10 reps/side
- optional hip thrust/bridge and hamstring curl capacity

No maximal testing is required for V1.

## J. Conditioning
Record current ability and weekly volume for:
- walking
- exercise bike
- incline treadmill walking
- jogging/running, only if already safe and not symptomatic

## K. Dynamic testing
Locked until prerequisites are met.
Progression order:
- snap-down / landing control
- bilateral low pogo
- bilateral jump
- controlled unilateral landing
- single-leg pogo/hop
- repeated/reactive hopping
- running/high-speed/COD tests

# Starting-phase assignment
1. Red flag -> Safety Hold / medical review.
2. Normal walking but important calf/heel-rise deficits or inability to satisfy running consensus -> Foundational Strength or Running Readiness depending on capacity.
3. All seven 2026 running consensus criteria passed, but no recent running exposure -> Running Readiness and begin controlled run/walk.
4. Running already tolerated consistently -> Running phase; unlock jump assessment only if strength/tolerance are adequate.
5. Advanced phase assignment requires demonstrated prior exposure plus current objective testing; the app should not infer advanced readiness from time since surgery.

# Phase rules and weekly templates

## Phase 1 — Foundational Strength
### Goal
Restore calf/soleus force production, heel-rise quality, global lower-body strength, conditioning, and both-leg capacity.

### Default weekly structure
- Mon: Strength A
- Tue: Easy bike / mobility / optional upper body
- Wed: Strength B
- Thu: Recovery or upper body
- Fri: Strength C + wagon conditioning
- Sat: Easy aerobic walk/bike
- Sun: Rest / mobility

Three hard Achilles-strength exposures are not mandatory; if response is borderline, use 2 and maintain low-impact conditioning.

### Strength A
- Straight-knee loaded calf raise: 4 × 6–10, RPE 7–8
- Bent-knee/seated calf raise: 4 × 8–12, RPE 7–8
- Belt squat: 3–4 × 6–10, RPE 7–8
- Dumbbell RDL: 3 × 8–10, RPE 7–8
- Cable row or pull-up module: 3 × 8–12
- Pallof press: 2–3 × 8–12/side

### Strength B
- Seated/unilateral soleus raise: 4 × 10–15
- Assisted or bodyweight single-leg heel raise: 3 × 6–12
- Step-up: 3 × 6–10/side
- Hip thrust/bridge: 3 × 8–12
- Band/cable hamstring curl: 3 × 10–15
- Optional DB bench press: 3 × 6–10

### Strength C
- Heavy calf pattern chosen from current level: 3–4 sets
- Soleus pattern: 3 sets
- Belt squat moderate: 3 × 8–12
- Weighted wagon backward drag: 4–6 × 15–25 yd, RPE 5–7
- Trunk/balance work

### Exit toward Running Readiness
- no red flags
- walking mechanics normal
- daily symptoms stable
- progressive calf loading tolerated
- controlled unilateral plantarflexion established
- objective calf/soleus trend improving
- balance adequate

No single LSI threshold is treated as a universal exit rule.

## Phase 2 — Running Readiness
### Hard minimum running gate — 2026 consensus
All seven required:
1. no pain in daily life
2. no pain during or after rehabilitation sessions
3. walk without limping
4. walk on tiptoes
5. perform 10 single-leg heel rises
6. good single-leg balance
7. psychologically ready to run

These are consensus criteria, not prospectively validated rules.

### Additional supporting information
Display but do not automatically convert to a hard universal cutoff:
- heel-rise work symmetry
- heel-rise height symmetry
- loaded straight-knee strength
- soleus strength
- conditioning

Very large deficits should trigger a caution/review even if the seven criteria are technically passed.

### Weekly template
- Mon: Heavy strength + low elastic prep if eligible
- Tue: Bike / recovery
- Wed: Strength B
- Thu: Brisk walk / incline treadmill / balance
- Fri: Strength + introductory pogo/landing prep if unlocked
- Sat: Easy aerobic
- Sun: Rest

Low-amplitude pogo preparation may overlap with this phase if the engine permits.

## Phase 3 — Running
### Initial frequency
Default 2 run exposures/week with recovery between exposures. Progress to 3/week only after consistent tolerance.

### Conservative run ladder
This is a V1 implementation ladder, not a validated Achilles protocol. The user can start at the highest level objectively demonstrated safe during assessment.
- R0: brisk walk 30 min
- R1: 6 × (1 min easy jog / 2 min walk)
- R2: 8 × (1 min jog / 1 min walk)
- R3: 6 × (2 min jog / 1 min walk)
- R4: 5 × (3 min jog / 1 min walk)
- R5: 4 × (5 min jog / 1 min walk)
- R6: 20 min continuous easy run
- R7: 25 min continuous easy run
- R8: 30 min continuous easy run
- R9: easy run + 4–6 relaxed 20 sec strides at approximately 70%

Progress primarily one variable at a time. Early levels generally require two tolerated exposures before advancing; later levels may advance after 1–2 depending on prior demonstrated capacity.

### Weekly template
- Mon: Strength A + short run (when appropriate)
- Tue: Low-impact conditioning / upper body
- Wed: Strength B
- Thu: Run exposure
- Fri: Strength C / wagon
- Sat: Optional easy aerobic
- Sun: Rest

## Phase 4 — Jumping & Landing
### Entry
Stable running/readiness status plus adequate calf capacity and successful low elastic prep.

### Jump ladder
- J0: snap-down 3 × 5; controlled landing holds
- J1: bilateral pogo 3 × 15; jump-to-stick 3 × 5
- J2: bilateral pogo 3 × 20; countermovement jump 3 × 5; low lateral line hop 2 × 10
- J3: assisted/low single-leg pogo 3 × 8–10/side; forward hop-to-stick 3 × 4/side
- J4: single-leg pogo 3 × 12–15/side; lateral hop-to-stick 3 × 4/side
- J5: repeated hops and more reactive tasks when objective criteria support them

Progression requires good landing quality and next-day tolerance. Approximately ≥80% heel-rise/calf symmetry is a supporting target before meaningful single-leg plyometric advancement, not a validated universal clearance rule.

### Weekly organization
Keep high-rate impact on 2 days/week initially; pair it with strength or running so other days stay relatively low.

## Phase 5 — Plyometrics
### Goal
Restore rapid stretch-shortening-cycle capacity and multidirectional elasticity.

### Progression
- bilateral low amplitude
- bilateral higher amplitude
- unilateral low amplitude
- repeated unilateral
- lateral/diagonal
- reactive

### Performance targets before very high demand
Preferred late-stage supporting targets:
- plantarflexion strength around ≥90% LSI
- heel-rise reps around ≥90% LSI
- heel-rise work around ≥90% LSI
- heel-rise height approaching ≥90%
- selected jump/hop asymmetry preferably <10%

These are clinical/performance targets, not validated reinjury guarantees.

## Phase 6 — Speed & Sprinting
### Entry
- stable running tolerance
- successful plyometric exposure
- no meaningful next-day symptom escalation
- late-stage strength and heel-rise metrics approaching sport targets

### Sprint ladder
Perceived intensity bands are used unless timing data are available.
- S1: 6 × 10 m @ 60–70%
- S2: 6 × 15 m @ 70–80%
- S3: 5 × 20 m @ 80–85%
- S4: 4–6 × 20 m @ 85–90%
- S5: 4 × 20–30 m >90%
- S6: near-maximal performance sprint exposure

Full recovery between reps. Stop the speed portion if mechanics deteriorate substantially.

### High-risk gate before >90%
Preferred:
- plantarflexion strength ≥90% LSI
- heel-rise reps/work near ≥90%
- heel-rise height approaching ≥90%
- jump/hop asymmetry preferably <10%
- multiple successful 80–90% exposures
- high confidence
- no clinical concern

Sports PT / sports medicine / qualified performance assessment is strongly recommended before maximal sprinting if objective testing is limited.

## Phase 7 — Deceleration & Change of Direction
### Progression
- D1: jog-to-controlled-stop, 4–6 reps
- D2: run-to-stop, gradually shorter braking zone
- D3: planned 45° cuts, 3 × 4/side
- D4: planned 90° cuts, 3 × 4/side
- D5: lateral shuffle / crossover / closeout patterns
- D6: reactive cone/visual cuts
- D7: basketball-specific reactive movement

Planned precedes reactive. Speed increases before cutting angle/complexity only if the previous level is tolerated.

## Phase 8 — Basketball Reintroduction
### B1 Stationary skills
20–30 min: shooting, passing, ball handling; minimal locomotion.

### B2 Controlled movement
20–30 min: walk/jog shooting, easy layups, controlled footwork.

### B3 Planned basketball movement
25–40 min: planned cuts, jump stops, controlled closeouts, shooting off movement at submax intensity.

### B4 Higher-speed planned court work
30–45 min: stronger accelerations/decelerations, rebounding, controlled cuts and jump shots.

## Phase 9 — Controlled Basketball
### B5 Reactive non-contact
30–45 min: reactive closeouts, cone/visual cues, controlled 1-on-0 and 1-on-1 movement.

### B6 Controlled half-court
Short, planned bouts; limited minutes and intensity.

### B7 Controlled full-court
Limited possessions/minutes; planned recovery between bouts.

## Phase 10 — Full Basketball
The app should display **Unrestricted Basketball Candidate**, not “medically cleared.”

Preferred profile:
- daily symptoms stable
- plantarflexion and soleus strength around ≥90% LSI
- heel-rise reps/work around ≥90%
- heel-rise height approximately ≥90% target
- jump/hop asymmetry preferably <10%
- high-speed running tolerated
- acceleration, hard deceleration, planned COD, reactive COD tolerated
- controlled basketball exposures tolerated repeatedly
- psychological readiness acceptable

Clinician assessment is recommended before unrestricted competitive play.

### Initial unrestricted return
Use an exposure cap rather than unlimited pickup immediately. Example V1 implementation:
- first unrestricted session: 20–30 min total play exposure
- second: 30–45 min if tolerated
- then expand toward usual participation based on next-day response

These minute caps are conservative implementation rules, not validated Achilles thresholds.

## Phase 11 — Basketball Performance
Shift emphasis from rehabilitation to athletic development:
- maximal strength
- heavy calf/soleus development
- repeated sprint ability
- jump height and repeated jump capacity
- reactive power
- deceleration and COD quality
- conditioning
- both-Achilles preventive strength
- ongoing load monitoring

# Soccer beginner pathway
Soccer remains optional and secondary.

Unlock only after adequate running capacity; multidirectional soccer tasks unlock only after corresponding COD capacity.

- SC1: stationary ball touches and easy passing, 10–15 min
- SC2: receiving + walking dribble, 10–20 min
- SC3: jogging with ball + submax shooting
- SC4: planned changes of direction with ball
- SC5: reactive ball movement at moderate/high intensity
- SC6: limited recreational practice/small-sided play

Soccer uses the same tendon-capacity and response engine as basketball; it does not have a separate medical clearance system.

# Strength progression rules
## Double progression
Typical strength prescription: 3–4 sets in a target rep range, usually 6–15 depending on exercise.
- stay at current load until all prescribed sets reach the upper rep target with acceptable RPE and quality
- if next-day tendon response is tolerated, increase load by the smallest practical increment (often roughly 2–10% depending on exercise/equipment)
- if quality/heel-rise height deteriorates, do not progress even if repetitions are completed

Routine rehab work should rarely require RPE 10.

## Calf-specific priority order
1. full controlled ROM
2. heel-rise height/quality
3. symptom tolerance
4. target reps
5. external load

# High/low weekly organization
As running, plyometrics and basketball are added, consolidate high Achilles stress rather than creating a high-load stimulus every day.

Example late-stage week:
- Mon: high — strength + plyometric/speed
- Tue: low — bike/upper/mobility
- Wed: high — running/COD + strength
- Thu: low — aerobic/upper
- Fri: high — basketball progression + calf strength
- Sat: low or optional skill
- Sun: rest

Exact schedule adapts to availability and response.

# Upper-body strength module
This supports the “serious strength training” goal but does not drive Achilles phase progression.
Choose 2–4 per strength day from owned equipment:
- DB bench press
- incline DB press
- cable row
- pull-up / band-assisted pull-up
- DB overhead press
- cable face pull
- dips if personally appropriate

# Conditioning
Primary low-impact tools:
- exercise bike
- incline treadmill walking
- weighted wagon backward drags

Conditioning progresses independently from impact when possible.

# Adjuncts and recovery
## Sleep
Supportive for recovery/performance. Encourage a consistent sleep opportunity, commonly 7–9 hours for adults, without letting one poor night automatically cancel rehab.

## Nutrition
Foundational priorities:
- adequate energy availability
- adequate protein distributed across the day
- hydration and micronutrient adequacy

Collagen/gelatin + vitamin C before tendon-loading exercise is optional/emerging, not required or represented as proven to accelerate Achilles repair.

## BFR
Optional and conditional. Not required for this plan. If used, clinician screening/training is preferred because Achilles-specific evidence remains limited and adverse events have been reported in small case series.

## Scar massage/manual therapy
Optional symptom/mobility adjunct. Do not claim it “breaks up scar tissue” or drives tendon healing. Evidence is limited/heterogeneous.

## Recovery modalities
Ice, massage guns, compression, etc. may help symptoms but should never replace appropriate loading, sleep, nutrition, and recovery spacing.

## Heel lifts/footwear
Heel lifts can reduce Achilles tensile load biomechanically, but at this late stage they are not a default requirement. Use only as an optional symptom/load-management strategy when appropriate. Favor stable, comfortable athletic footwear; no specific shoe model is mandatory.

# Testing schedule
- daily: symptoms/readiness
- after Achilles-loading sessions: immediate response
- next morning: tolerance classification
- every ~2–4 weeks: heel-rise, mobility, balance as relevant
- every ~3–4 weeks: loaded calf/soleus strength
- phase checkpoints: running, jump, sprint, COD tests
- periodically: ATRS
- later RTS: ALR-RSI and Ankle-GO if feasible

Avoid unnecessary frequent maximal testing because testing itself creates load.

# Load monitoring
Do not use a rigid “10% rule” or acute:chronic workload ratio as a medical clearance rule.
Track:
- session minutes
- session RPE
- high-rate Achilles exposures
- running distance/time
- sprint reps/intensity bands
- plyometric contacts
- basketball minutes/intensity
- next-day response

The app may flag abrupt workload increases for review but should not pretend a single workload formula predicts reinjury.

# Missed-session rules
- ≤3 days missed: resume if readiness is normal
- 4–10 days: reduced re-entry exposure (~20% lower volume as a V1 safeguard)
- >10 days or meaningful detraining: retest the relevant capability and use ~30% lower initial exposure until tolerance is re-established
- never double the next session

These are implementation rules, not validated Achilles-specific cutoffs.

# What the app should show
Normal Today screen:
- Current focus
- Today's status: Ready / Modified / Stop
- Full day's workout at a glance
- Next milestone

Plan screen:
- full weekly schedule
- expandable future workouts
- monthly calendar with completed sessions
- tap prior workout for exercises, loads, reps, RPE, immediate response, and next-day status

Exercise card:
- name
- sets × reps
- prior load + current target
- inline set logging
- one cue
- visible **Short Demo** button
- optional Why / More Tips / Evidence

# Evidence sources
1. Gaspar M, et al. Criteria for Return to Running After Surgical Repair of Acute Achilles Tendon Rupture: A Modified Delphi Consensus Study. Sports Med. 2026. PMID 42503592. https://pubmed.ncbi.nlm.nih.gov/42503592/
2. Busà MF, et al. Which Criteria Are Used to Clear Athletes to Return to Sport After Achilles Tendon Repair? A Scoping Review. Sports Health. 2026. PMID 41703942. https://pubmed.ncbi.nlm.nih.gov/41703942/
3. Marrone W, et al. Rehabilitation and Return to Sports after Achilles Tendon Repair. Int J Sports Phys Ther. 2024. PMID 39246413. https://pmc.ncbi.nlm.nih.gov/articles/PMC11379499/
4. Lopes R, et al. Validation of a Composite Outcome Score for Assessing Return to Sports After Achilles Tendon Repair. Am J Sports Med. 2025. PMID 40263952. https://pubmed.ncbi.nlm.nih.gov/40263952/
5. Silbernagel KG, et al. A new measurement of heel-rise endurance with the ability to detect functional deficits in patients with Achilles tendon rupture. Knee Surg Sports Traumatol Arthrosc. 2010. PMID 19690833. https://pubmed.ncbi.nlm.nih.gov/19690833/
6. Brorsson A, et al. Heel-Rise Height Deficit 1 Year After Achilles Tendon Rupture Relates to Changes in Ankle Biomechanics 6 Years After Injury. Am J Sports Med. 2017. PMID 28783473. https://pubmed.ncbi.nlm.nih.gov/28783473/
7. Bohm S, et al. The load borne by the Achilles tendon during exercise: A systematic review of normative values. Scand J Med Sci Sports. 2022. PMID 36278501. https://pubmed.ncbi.nlm.nih.gov/36278501/
8. Revak A, et al. Achilles Tendon Loading During Heel-Raising and -Lowering Exercises. J Athl Train. 2017. PMID 28145739. https://pubmed.ncbi.nlm.nih.gov/28145739/
9. Wulf M, et al. Effect of an In-shoe Orthotic Heel Lift on Loading of the Achilles Tendon During Shod Walking. JOSPT. 2016. PMID 26755409. https://pubmed.ncbi.nlm.nih.gov/26755409/
10. Scott H, et al. Is massage an effective intervention in the management of post-operative scarring? A scoping review. J Hand Ther. 2022. PMID 35227556. https://pubmed.ncbi.nlm.nih.gov/35227556/
11. Rehabilitation Nutrition for Tendon and Ligament Injuries: From Collagen Remodeling to Return-to-Activity and Sport. 2026. PMID 42512652. https://pubmed.ncbi.nlm.nih.gov/42512652/
12. Collagen Supplementation on Tendon-Related Structural and Performance Outcomes: A Systematic Review. 2026. PMID 41900537. https://pubmed.ncbi.nlm.nih.gov/41900537/
13. Feasibility of Blood Flow Restriction Exercise in Adults with a Non-surgically Treated Achilles Tendon Rupture; a Case Series. PMID 38665686. https://pubmed.ncbi.nlm.nih.gov/38665686/
14. Rehabilitation following operative treatment of acute Achilles tendon ruptures: a systematic review and meta-analysis. 2022. PMID 36287109. https://pubmed.ncbi.nlm.nih.gov/36287109/

## Status
This plan is complete enough to serve as the product/clinical source of truth for implementation. The user still must complete the baseline assessment before the app assigns the individualized starting program.
