# Data Model and Rule Engine Specification v1.0

## Architecture
UI -> deterministic rule modules -> persistence.
Clinical rules must not be embedded inside screen components.

## Core entities
### Profile
- id
- repairSide
- surgeryDate
- ptEndDate
- restrictions
- basketballGoal
- soccerEnabled
- availableTrainingDays
- equipment[]

### DailyCheckIn
- date
- pain
- stiffnessChange
- swellingChange
- previousSessionResponse
- recovery
- unusualSymptoms[]
- readinessClassification
- rulesetVersion

### ExerciseDefinition
- id
- name
- purpose
- capabilityTags[]
- equipment[]
- phaseAvailability[]
- loadTier
- impactTier
- defaultPrescription
- regressionIds[]
- progressionIds[]
- contraindicationFlags[]
- evidenceStrength
- evidenceType
- evidenceSourceIds[]
- videoUrl
- videoSource
- videoType
- videoVerifiedAt

### WorkoutTemplate
- id
- title
- phase
- blocks[]
- requiredCapabilities[]
- maxImpactTier

### WorkoutSession
- id
- date
- templateId
- readiness
- plannedItems[]
- completedItems[]
- modifications[]
- startTime/endTime
- sessionRPE
- immediateAchillesResponse
- notes
- nextDayStatus
- rulesetVersion

### ExerciseSet
- exerciseId
- setNumber
- load
- reps/time/distance
- rpe or easy/right/hard mapping
- quality
- symptoms
- complete

### Assessment
- id
- type
- date
- measurements
- painResponse
- quality
- derivedMetrics
- result
- ruleVersion

### CapabilityState
- symptomControl
- straightKneeStrength
- soleusStrength
- heelRiseCapacity
- balance
- running
- jumping
- plyometric
- speed
- deceleration
- cod
- basketball
- confidence

Composite 0–100 values may be used for display only; hard rules inspect underlying criteria.

### ProgressionDecision
- id
- date
- decisionType
- fromLevel
- toLevel
- reasonCodes[]
- supportingData
- ruleId
- rulesetVersion

## Rule priority
1. Safety
2. Next-day tolerance
3. Phase/capability prerequisites
4. Daily readiness
5. Session modification
6. Exercise progression
7. Phase progression
8. Sport progression

## Rule modules
- safetyRules
- readinessRules
- toleranceRules
- strengthRules
- runningRules
- jumpRules
- sprintRules
- codRules
- basketballRules
- soccerRules
- missedSessionRules

## Rule metadata
Each rule stores:
- ruleId
- name
- description
- decision
- evidenceStrength
- evidenceType
- sourceIds[]
- ruleVersion
- userExplanation

## Persistence
V1 local-first IndexedDB.
Stores:
- profile
- checkins
- sessions
- assessments
- capabilityStates
- decisions
- settings

## Backup
- Export JSON with schema version, ruleset version, export timestamp
- Restore validates version and runs migration
- Optional CSV export for workouts/test history later

## Versioning
Store separately:
- appVersion
- databaseVersion
- rulesetVersion
- exerciseLibraryVersion
- evidenceCatalogVersion

Historical decisions retain their original ruleset version.
