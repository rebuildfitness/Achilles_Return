import type {
  PlannedWorkout,
  WorkoutTemplate,
  WorkoutSession,
} from "./contracts";
import type { Value } from "./contracts";
const value = <T>(v: T): Value<T> => ({
  state: "known",
  value: structuredClone(v),
});
const derivedId = (...parts: (string | number)[]) =>
  "v2-snapshot:" + JSON.stringify(parts);

/** Pure aggregate factories for contract verification; no persistence or UI wiring. */
export function planFromTemplate(
  template: WorkoutTemplate,
  id: string,
  date: string,
): PlannedWorkout {
  return {
    id,
    revision: 1,
    date,
    templateRef: { id: template.id, revision: template.revision },
    snapshot: structuredClone(template),
    status: "planned",
  };
}
export function sessionFromPlan(
  plan: PlannedWorkout,
  id: string,
  startedAt: string,
): WorkoutSession {
  return {
    schemaVersion: 2,
    id,
    revision: 1,
    date: value(plan.date),
    name: value(plan.snapshot.name),
    startedAt: value(startedAt),
    finishedAt: { state: "unknown" },
    lifecycle: "in-progress",
    categories: structuredClone(plan.snapshot.categories),
    planRef: plan.id,
    templateRef: plan.templateRef?.id,
    originalIntent: value(plan.snapshot),
    occurrences: plan.snapshot.occurrences.map((o, i) => ({
      ...structuredClone(o),
      id: derivedId(id, "occurrence", i),
      snapshotOrigin: "captured",
      disposition: "planned",
      notes: { state: "blank" },
      sets: o.sets.map((s, j) => ({
        ...structuredClone(s),
        id: derivedId(id, i, "set", j),
        actual: {},
        disposition: "planned",
        intervals: s.intervals.map((b, k) => ({
          ...structuredClone(b),
          id: derivedId(id, i, j, "bout", k),
          actual: {},
          disposition: "planned",
        })),
      })),
    })),
    symptoms: [],
    responses: [],
    exposures: [],
    interpretations: {},
    correctionLineage: [],
    guidanceDecisions: [],
    overrides: [],
  };
}
