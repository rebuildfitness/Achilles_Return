import type {
  ExerciseDefinition,
  WorkoutSession,
  Value,
  SetPerformance,
  ExerciseOccurrence,
  GuidanceResult,
  GuidanceDecision,
  UserOverride,
  RehabPhaseStatus,
  EquipmentContext,
} from "../../../src/domain/v2/contracts";
// Synthetic contract examples, not clinical prescriptions or personal records.
const known = <T>(value: T): Value<T> => ({ state: "known", value });
const definition: ExerciseDefinition = {
  id: "synthetic-calf",
  aliases: ["fixture"],
  name: known("Synthetic calf movement"),
  categories: ["strength", "achilles-rehab"],
  bodyRegions: ["lower-leg"],
  movementPatterns: ["plantar-flexion"],
  physicalQualities: ["strength"],
  achillesPurpose: known("Schema example only"),
  phaseAssociations: [],
  demandLevel: { state: "unknown" },
  laterality: known("bilateral"),
  equipment: ["dumbbells"],
  setup: known("Synthetic test setup"),
  trackingType: known("weighted-reps"),
  supportedMetrics: ["reps", "load"],
  evidence: [],
  media: [],
  provenance: {
    origin: "custom",
    verification: known("unverified-user-supplied"),
    sourceIds: [],
  },
  sourceMetadata: {},
};
function set(
  id: string,
  side: "left" | "right" | "bilateral",
  type: "warm-up" | "working" | "rehab",
): SetPerformance {
  return {
    id,
    order: 0,
    type: known(type),
    target: {
      reps: { amount: known(8), unit: known("count") },
      tempo: known("3-1-1-0"),
      side: known(side),
    },
    actual: {
      reps: { amount: known(6), unit: known("count") },
      load: { amount: known(0), unit: known("lb") },
      loadConvention: known("per-hand"),
      tempo: known("3-1-1-0"),
      side: known(side),
      duration: { amount: { state: "not-applicable" }, unit: known("s") },
      rest: { amount: known(75), unit: known("s") },
      notes: known("Synthetic note"),
      rpe: { amount: known(6), unit: known("RPE") },
      symptoms: known("baseline"),
      quality: known("controlled"),
    },
    disposition: "completed",
    intervals: [],
  };
}
export function nativeSession(): WorkoutSession {
  const occurrence = (
    id: string,
    block: string,
    side: "left" | "right",
  ): ExerciseOccurrence => ({
    id,
    exerciseDefinitionId: definition.id,
    order: 0,
    block: known(block),
    definitionSnapshot: structuredClone(definition),
    snapshotOrigin: "captured",
    target: {},
    targetDescription: known("Synthetic intent"),
    targetSetCount: known(2),
    sets: [
      set(id + "-warm", side, "warm-up"),
      { ...set(id + "-work", side, "working"), order: 1 },
    ],
    disposition: "completed",
    notes: { state: "blank" },
  });
  return {
    schemaVersion: 2,
    id: "synthetic-native",
    revision: 1,
    date: known("2026-09-01"),
    name: known("Synthetic contract exercise"),
    startedAt: known("2026-09-01T10:00:00Z"),
    finishedAt: known("2026-09-01T10:30:00Z"),
    lifecycle: "completed",
    categories: ["strength", "achilles-rehab"],
    occurrences: [
      occurrence("first", "Strength", "left"),
      { ...occurrence("second", "Rehab circuit", "right"), order: 1 },
    ],
    originalIntent: { state: "unknown" },
    symptoms: [],
    responses: [],
    exposures: [],
    interpretations: {},
    correctionLineage: [],
    guidanceDecisions: [],
    overrides: [],
  };
}
export const guidance: GuidanceResult = {
  id: "g1",
  subjectId: "synthetic-native",
  subjectRevision: 1,
  ruleId: "synthetic-only",
  ruleVersion: "fixture",
  level: "CAUTION",
  explanation: "Schema example, not a clinical conclusion",
  inputIds: [],
  sourceIds: [],
  missingInputs: ["assessment"],
};
export const decision: GuidanceDecision = {
  id: "d1",
  guidanceId: "g1",
  subjectRevision: 1,
  action: "declined",
  at: "2026-09-01T10:00:00Z",
};
export const override: UserOverride = {
  id: "u1",
  guidanceId: "g1",
  subjectId: "synthetic-native",
  subjectRevision: 1,
  at: "2026-09-01T10:00:00Z",
};
export const phase: RehabPhaseStatus = {
  id: "phase-fixture",
  phaseId: { state: "unknown" },
  assessedAt: { state: "unknown" },
  benchmarks: [{ id: "fixture", state: "not-tested", evidenceIds: [] }],
  sourceIds: [],
  rulesetVersion: { state: "unknown" },
};
export const equipment: EquipmentContext = {
  owned: known(["weighted-wagon"]),
  availableToday: known(["training-sled"]),
  preferred: known(["dumbbells"]),
  details: {},
};
