import { nativeSession } from "./native.ts";
import { copyIntent } from "../../../src/domain/v2/adapters.ts";
import {
  planFromTemplate,
  sessionFromPlan,
} from "../../../src/domain/v2/snapshots.ts";
export function persistedFixtures() {
  const native = nativeSession();
  const definition = {
    ...native.occurrences[0].definitionSnapshot,
    recordVersion: 1,
    revision: 1,
    archived: false,
  };
  const template = {
    ...copyIntent(native, "template-fixture", "Synthetic template"),
    recordVersion: 1,
  };
  const plan = {
    ...planFromTemplate(template, "plan-fixture", "2026-09-20"),
    recordVersion: 1,
  };
  const session = {
    ...sessionFromPlan(plan, "session-fixture", "2026-09-20T23:59:00Z"),
    recordVersion: 1,
    lifecycle: "draft",
  };
  const observation = {
    id: "observation-fixture",
    recordVersion: 1,
    revision: 1,
    kind: "response",
    sessionId: session.id,
    recordedAt: { state: "unknown" },
    observations: {
      pain: { state: "known", value: 0 },
      stiffness: { state: "blank" },
      swelling: { state: "unknown" },
    },
    interpretation: { tolerance: { state: "unknown" } },
  };
  const event = {
    id: "guidance-fixture",
    recordVersion: 1,
    revision: 1,
    subjectId: session.id,
    subjectRevision: 1,
    ruleId: "synthetic-rule",
    ruleVersion: "fixture-only",
    evidenceVersion: "fixture-only",
    sourceVersions: {},
    inputs: {},
    inputIds: [],
    sourceIds: [],
    missingInputs: ["next-day-response"],
    level: "CAUTION",
    explanation: "Synthetic persistence fixture, not a clinical recommendation",
  };
  const decision = {
    id: "decision-fixture",
    recordVersion: 1,
    revision: 1,
    guidanceId: event.id,
    subjectRevision: 1,
    action: "continued-anyway",
    at: "2026-09-21T00:01:00Z",
  };
  return {
    v2ExerciseDefinitions: definition,
    v2WorkoutTemplates: template,
    v2PlannedWorkouts: plan,
    v2WorkoutSessions: session,
    v2Observations: observation,
    v2GuidanceEvents: event,
    v2GuidanceDecisions: decision,
  };
}
