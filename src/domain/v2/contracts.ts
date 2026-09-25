/** Phase 1 contracts only. No imports into the live application or persistence. */
export type ID = string;
export type RawRecord = Record<string, unknown>;
export type Value<T> =
  | { state: "known"; value: T }
  | { state: "blank" | "unknown" | "not-applicable"; reason?: string };
export type Side = "bilateral" | "left" | "right";
export type SetType = "warm-up" | "working" | "rehab";
export type TrackingType =
  | "weighted-reps"
  | "reps"
  | "time"
  | "distance-time"
  | "reps-time"
  | "intervals"
  | "free-form";
export type MetricName =
  | "reps"
  | "load"
  | "duration"
  | "distance"
  | "rest"
  | "rpe"
  | "steps"
  | "contacts";
export type Quantity = { amount: Value<number>; unit: Value<string> };
export type LoadConvention =
  | "per-hand"
  | "total-external"
  | "bar-included"
  | "stack-reading"
  | "assistance"
  | "bodyweight"
  | "device-specific"
  | "other";
export interface Metrics {
  reps?: Quantity;
  load?: Quantity;
  duration?: Quantity;
  distance?: Quantity;
  rest?: Quantity;
  rpe?: Quantity;
  steps?: Quantity;
  contacts?: Quantity;
  loadConvention?: Value<LoadConvention>;
  loadConventionNote?: Value<string>;
  tempo?: Value<string>;
  side?: Value<Side>;
  notes?: Value<string>;
  symptoms?: Value<unknown>;
  quality?: Value<unknown>;
}
export interface Provenance {
  origin: "researched" | "custom" | "legacy" | "unknown";
  verification: Value<string>;
  sourceIds: string[];
  /** Complete source payloads, including fields not normalized by this adapter. */
  raw?: unknown;
}
export interface EvidenceReference {
  id?: string;
  url?: string;
  strength?: string;
  type?: string;
  limitations?: unknown;
  raw: unknown;
}
export interface MediaReference {
  kind: "demo" | "illustration" | "related-demo";
  url?: string;
  exerciseId?: string;
  verification: Value<string>;
  raw: unknown;
}
export interface ExerciseDefinition {
  id: ID;
  aliases: string[];
  name: Value<string>;
  categories: string[];
  bodyRegions: string[];
  movementPatterns: string[];
  physicalQualities: string[];
  achillesPurpose: Value<string>;
  phaseAssociations: string[];
  demandLevel: Value<unknown>;
  laterality: Value<Side | string>;
  equipment: string[];
  setup: Value<string>;
  trackingType: Value<TrackingType>;
  supportedMetrics: MetricName[];
  evidence: EvidenceReference[];
  media: MediaReference[];
  provenance: Provenance;
  /** Source definition only, never session actuals. */
  sourceMetadata: RawRecord;
}
export interface EquipmentContext {
  owned: Value<string[]>;
  availableToday: Value<string[]>;
  preferred: Value<string[]>;
  details: RawRecord;
}
export interface IntervalBout {
  id: ID;
  order: number;
  kind: "work" | "recovery";
  target: Metrics;
  actual: Metrics;
  disposition: "planned" | "completed" | "partial" | "skipped" | "unknown";
}
export interface SetPerformance {
  id: ID;
  order: number;
  type: Value<SetType>;
  target: Metrics;
  actual: Metrics;
  disposition: "planned" | "completed" | "partial" | "skipped" | "unknown";
  intervals: IntervalBout[];
  feedbackProvenance?: { inheritedFields: string[]; confirmed: Value<boolean> };
  legacy?: unknown;
}
export interface ExerciseOccurrence {
  id: ID;
  exerciseDefinitionId: ID;
  order: number;
  block: Value<string>;
  definitionSnapshot: ExerciseDefinition;
  snapshotOrigin: "captured" | "current-reference" | "unknown";
  target: Metrics;
  targetDescription: Value<string>;
  targetSetCount: Value<number>;
  sets: SetPerformance[];
  disposition: "planned" | "completed" | "partial" | "skipped" | "unknown";
  notes: Value<string>;
  aggregateActual?: Metrics;
  legacy?: unknown;
}
export type ExercisePerformance = ExerciseOccurrence;
/** Intent cannot contain actuals, symptoms, response or past guidance decisions. */
export interface IntentSet {
  repeatCount?: number;
  id: ID;
  order: number;
  type: Value<SetType>;
  target: Metrics;
  intervals: {
    id: ID;
    order: number;
    kind: "work" | "recovery";
    target: Metrics;
  }[];
}
export interface IntentOccurrence {
  targetTrackingType?: TrackingType | "";
  groupId?: ID;
  id: ID;
  exerciseDefinitionId: ID;
  order: number;
  block: Value<string>;
  definitionSnapshot: ExerciseDefinition;
  target: Metrics;
  targetDescription: Value<string>;
  targetSetCount: Value<number>;
  sets: IntentSet[];
}
export interface WorkoutTemplate {
  notes?: string;
  groups?: {
    id: ID;
    name: string;
    kind: "superset" | "circuit";
    rounds: number;
  }[];
  archived?: boolean;
  id: ID;
  revision: number;
  name: string;
  categories: string[];
  occurrences: IntentOccurrence[];
  source: "curated" | "user";
}
export interface WeeklyRecurrence {
  seriesId: ID; start: string; end: string; weekdays: number[]; name: string;
}
export interface PlannedWorkout {
  planning?: {version: 1; archived: boolean; audit: RawRecord[]; recurrence?: WeeklyRecurrence};
  id: ID;
  revision: number;
  date: string;
  templateRef?: { id: ID; revision: number };
  snapshot: WorkoutTemplate;
  status: "planned" | "skipped" | "replaced";
}
export interface SymptomEntry {
  id: ID;
  sessionId?: ID;
  recordedAt: Value<string>;
  timing: "before" | "during" | "after" | "next-day" | "unknown";
  observations: RawRecord;
  provenance: Provenance;
}
export interface ResponseObservation {
  id: ID;
  sessionId: ID;
  observations: Value<unknown>;
  interpretation: Value<string>;
  raw: unknown;
}
export interface ExposureObservation {
  id: ID;
  sessionId?: ID;
  domain: Value<string>;
  actual: Metrics;
  observations: RawRecord;
  interpretation: RawRecord;
  /** V1 may have overwritten reported quality. Never claim this is the original answer. */
  storedQuality: Value<unknown>;
  reportedQuality: Value<unknown>;
  provenance: Provenance;
}
export type ExposureRecord = ExposureObservation;
export interface RehabPhaseStatus {
  id: ID;
  phaseId: Value<string>;
  assessedAt: Value<string>;
  benchmarks: {
    id: ID;
    state: "met" | "not-yet-met" | "not-tested" | "clinician-clearance";
    evidenceIds: ID[];
  }[];
  sourceIds: ID[];
  rulesetVersion: Value<string>;
}
export interface GuidanceResult {
  id: ID;
  subjectId: ID;
  subjectRevision: number;
  ruleId: string;
  ruleVersion: string;
  level: "INFORMATION" | "RECOMMENDATION" | "CAUTION" | "STRONG_WARNING";
  explanation: string;
  inputIds: ID[];
  sourceIds: ID[];
  missingInputs: string[];
  proposal?: {
    description: string;
    targetId: ID;
    kind?: "review" | "replace" | "edit-target";
    metric?: string;
    definitionId?: ID;
  };
  adapterVersion?: string;
  at?: string;
  finding?: string;
  contextKey?: string;
  occurrenceId?: ID;
  evidenceVersion?: string;
  sourceVersions?: Record<string, string>;
  inputs?: RawRecord;
  dedupKey?: string;
}
export type GuidanceEvent = GuidanceResult;
export interface GuidanceDecision {
  adapterVersion?: string;
  subjectId?: ID;
  resultingRevision?: number;
  id: ID;
  guidanceId: ID;
  subjectRevision: number;
  action:
    | "accepted"
    | "declined"
    | "dismissed"
    | "deferred"
    | "acknowledged"
    | "continued-anyway";
  at: string;
}
export interface UserOverride {
  id: ID;
  guidanceId: ID;
  subjectId: ID;
  subjectRevision: number;
  at: string;
  reason?: string;
}
export interface WorkoutSession {
  schemaVersion: 2;
  id: ID;
  revision: number;
  date: Value<string>;
  name: Value<string>;
  startedAt: Value<string>;
  finishedAt: Value<string>;
  lifecycle:
    "draft" | "in-progress" | "completed" | "partial" | "abandoned" | "unknown";
  categories: string[];
  occurrences: ExercisePerformance[];
  originalIntent: Value<unknown>;
  planRef?: ID;
  templateRef?: ID;
  symptoms: SymptomEntry[];
  responses: ResponseObservation[];
  exposures: ExposureObservation[];
  interpretations: RawRecord;
  correctionLineage: unknown[];
  guidanceDecisions: GuidanceDecision[];
  overrides: UserOverride[];
  /** Deep copy of the complete V1 input. This is the lossless preservation envelope. */
  legacy?: {
    source: "session" | "movement" | "recovery";
    raw: unknown;
    limitations: string[];
  };
}

/** Phase 4 additive execution metadata. Original intent remains immutable. */
export interface ExecutionAudit {
  id: ID;
  type: string;
  at: string;
  [key: string]: unknown;
}
export interface ExecutionMetadata {
  version: 1;
  normalization: "one-set-per-round-v1";
  groups: NonNullable<WorkoutTemplate["groups"]>;
  notes: string;
  audit: ExecutionAudit[];
  restTimer: null | {
    sessionId: ID;
    setId: ID;
    startedAt: string;
    endsAt: string;
  };
}
export interface WorkoutSession {
  createdAt?: string;
  execution?: ExecutionMetadata;
}
export interface ExerciseOccurrence {
  sourceOccurrenceId?: ID;
  addedDuringSession?: boolean;
  groupId?: ID;
  targetTrackingType?: TrackingType | "";
  replacesOccurrenceId?: ID;
  replacedByOccurrenceId?: ID;
}
export interface SetPerformance {
  sourceSetId?: ID;
  groupRound?: number;
  repeatCount?: number;
  stoppedEarly?: boolean;
  actualType?: Value<SetType>;
}
export interface IntervalBout {
  sourceBoutId?: ID;
  repeat?: number;
}
