import definitions from "./movementRoutines.json" with { type: "json" };
import { EQUIPMENT } from "./catalog.js";
export const MOVEMENT_ROUTINES = definitions;
// Metadata is explicit and scoped to the approved nine routines; not inferred from
// category membership. No support routine grants formal capacity-test credit.
const standing = new Set([
  "wall-slides",
  "band-pull-aparts",
  "banded-lateral-walk",
  "supported-hip-airplane",
  "box-squat-pattern",
  "standing-pallof-press",
  "cable-anti-rotation-walkout",
  "supported-single-arm-cable-press-with-brace",
  "suitcase-carry",
  "supported-single-leg-stance",
  "supported-weight-shifts",
  "tandem-stance",
  "star-reach",
  "controlled-step-down",
]);
const seated = new Set([
  "ankle-circles",
  "seated-thoracic-extension-over-chair-back",
  "seated-core-march",
  "seated-pallof-hold",
]);
const quadruped = new Set(["cat-cow", "adductor-rock-back"]);
const bands = new Set(["band-pull-aparts", "banded-lateral-walk"]);
const cables = new Set([
  "seated-pallof-hold",
  "standing-pallof-press",
  "cable-anti-rotation-walkout",
  "supported-single-arm-cable-press-with-brace",
]);
const lower = new Set([
  "ankle-circles",
  "knee-to-wall-dorsiflexion-mobility",
  "banded-lateral-walk",
  "supported-hip-airplane",
  "box-squat-pattern",
  "suitcase-carry",
  "supported-single-leg-stance",
  "supported-weight-shifts",
  "tandem-stance",
  "star-reach",
  "controlled-step-down",
  "glute-bridge-with-reach",
]);
export const MOVEMENT_EXERCISES = [
  ...new Map(
    definitions.flatMap((r) =>
      r.steps.map((step) => [
        step.exerciseId,
        {
          id: step.exerciseId,
          name: step.name,
          category: [
            "dead-bug",
            "seated-core-march",
            "seated-pallof-hold",
            "side-plank-from-knees",
            "standing-pallof-press",
            "cable-anti-rotation-walkout",
            "supported-single-arm-cable-press-with-brace",
            "suitcase-carry",
          ].includes(step.exerciseId)
            ? "core_stability"
            : r.category,
          bodyArea: lower.has(step.exerciseId)
            ? "Lower leg & hips"
            : r.category === "core_stability"
              ? "Trunk"
              : "Whole body",
          position: standing.has(step.exerciseId)
            ? "Standing"
            : seated.has(step.exerciseId)
              ? "Seated"
              : quadruped.has(step.exerciseId)
                ? "Quadruped"
                : step.exerciseId === "half-kneeling-hip-flexor-stretch"
                  ? "Kneeling"
                  : "Floor",
          equipment: bands.has(step.exerciseId)
            ? ["rehab-bands"]
            : cables.has(step.exerciseId)
              ? ["cable-station"]
              : step.exerciseId === "suitcase-carry"
                ? ["dumbbells"]
                : [],
          lowerLegDemand: lower.has(step.exerciseId),
          defaultDose: step.defaultDose,
          setup: step.offlineGuidance || step.setupCues,
          substitution: step.substitution,
          source: "User-approved movement handoff v3",
          sourcePath: "docs/MOVEMENT_RECOVERY_HANDOFF_V3.md",
          impact: "none",
          availabilityRuleId: "movement-support-existing-restrictions",
        },
      ]),
    ),
  ).values(),
];
export function routineAvailability(
  routine,
  { readiness = "UNCHECKED", assessment, equipment = EQUIPMENT } = {},
) {
  const missing = routine.steps
    .flatMap(
      (s) =>
        MOVEMENT_EXERCISES.find((e) => e.id === s.exerciseId)?.equipment || [],
    )
    .filter((e) => !equipment.includes(e));
  if (missing.length)
    return {
      allowed: false,
      reason:
        "Equipment not selected in your profile. Choose a compatible routine or log what you did.",
    };
  if (readiness === "RED" || (assessment?.values?.redFlags || []).length)
    return {
      allowed: false,
      reason:
        "Safety hold: follow the existing safety guidance. Factual logging remains available.",
    };
  if (
    assessment?.values?.noRestrictions !== "yes" ||
    assessment?.values?.clearance !== "yes"
  )
    return {
      allowed: false,
      reason:
        "Use your existing plan/restrictions to guide exercise. You can still record actual activity.",
    };
  if (
    readiness !== "GREEN" &&
    routine.steps.some(
      (s) =>
        MOVEMENT_EXERCISES.find((e) => e.id === s.exerciseId)?.lowerLegDemand,
    )
  )
    return {
      allowed: false,
      reason:
        "Use today's modified prescribed plan for lower-leg loading. Log completed activity separately.",
    };
  return {
    allowed: true,
    reason: "Optional support; no tolerance or progression credit.",
  };
}
export function createRoutineInstance(routine) {
  return {
    id: crypto.randomUUID(),
    routineId: routine.routineId,
    routineVersion: routine.routineVersion,
    definitionSnapshot: structuredClone(routine),
    originalDefinitionSnapshot: structuredClone(routine),
    wasModified: false,
    durationMinutes: null,
    exerciseCompletions: routine.steps.map((step) => ({
      id: crypto.randomUUID(),
      exerciseId: step.exerciseId,
      status: "pending",
      actual: {
        sets: null,
        repsPerSide: null,
        durationSeconds: null,
        distance: null,
      },
      substitutionExerciseId: null,
      skipReason: "",
      notes: "",
    })),
  };
}

// The checkbox confirms the displayed dose. Numeric values stay editable; ranges
// are recorded only after the user enters an exact amount, never guessed.
export function actualFromDose(dose) {
  const result = {};
  const sets = dose.match(/^(\d+)\s*(?:sets?\s*)?×/);
  if (sets) result.sets = Number(sets[1]);
  const body = sets ? dose.slice(sets[0].length).trim() : dose;
  if (/[–-]\d/.test(body)) return result;
  const n = Number(body.match(/^\d+/)?.[0]);
  if (!n) return result;
  if (/seconds?|sec\b/.test(body) && !/reps/.test(body))
    result.durationSeconds = n;
  else if (/minutes/.test(body)) result.durationSeconds = n * 60;
  else if (/breaths/.test(body)) result.breaths = n;
  else if (/steps/.test(body)) result.stepsPerSide = n;
  else if (/reaches/.test(body)) result.reachesPerDirectionPerSide = n;
  else if (/side/.test(body)) result.repsPerSide = n;
  else result.reps = n;
  return result;
}
