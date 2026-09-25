import { classifyTolerance } from "../rules/response.js";
import { RULESET } from "../rules/baseline.js";
import { getDb } from "../db.js";
import { V2_STORES, validateV2 } from "./v2Validation.js";
import { atomicV2, saveV2, materializeLegacy } from "./v2Repository.js";
import { schedule, planCommand, expandWeekly } from "../domain/v2/planning.js";
import { correctSession } from "../domain/v2/corrections.js";
import { startSession } from "../domain/v2/execution.js";
import { uid, known } from "../domain/v2/composition.js";
import { analyzeGuidance } from "./guidance.js";
export async function readTimeline() {
  const db = await getDb(),
    stores = [
      ...V2_STORES,
      "sessions",
      "settings",
      "assessments",
      "checkins",
      "capabilityStates",
    ];
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores),
      data = {};
    for (const s of stores) {
      const q = tx.objectStore(s).getAll();
      q.onsuccess = () => {
        data[s] = q.result;
      };
    }
    tx.oncomplete = () => {
      try {
        for (const s of V2_STORES) data[s].forEach((r) => validateV2(s, r));
        resolve(data);
      } catch (e) {
        reject(e);
      }
    };
    tx.onabort = () => reject(tx.error);
  });
}
export async function createPlan(intent, date, templateRef, copiedFrom) {
  const p = schedule(intent, date, templateRef);
  if (copiedFrom) p.planning.copiedFrom = structuredClone(copiedFrom);
  await saveV2("v2PlannedWorkouts", p, null);
  return p;
}
export async function changePlan(p, c) {
  const next = planCommand(p, c);
  await saveV2("v2PlannedWorkouts", next, p.revision);
  return next;
}
export async function repeatPlan(intent, options) {
  const plans = expandWeekly(intent, options);
  await atomicV2(
    plans.map((record) => ({
      store: "v2PlannedWorkouts",
      record,
      expectedRevision: null,
    })),
  );
  return plans;
}
export async function startPlanned(plan, now = new Date().toISOString()) {
  if (plan.status !== "planned" || plan.planning?.archived)
    throw Error("Restore this plan or create a new workout before starting");
  const session = startSession(plan, now);
  await atomicV2(
    [{ store: "v2WorkoutSessions", record: session, expectedRevision: null }],
    { guards: [{ store: "v2PlannedWorkouts", id: plan.id, value: plan }] },
  );
  return session;
}
export async function correctHistory(session, command) {
  const c = { ...command, id: uid(), at: new Date().toISOString() },
    next = correctSession(session, c);
  await atomicV2([
    {
      store: "v2WorkoutSessions",
      record: next,
      expectedRevision: session.revision,
      correction: c,
    },
  ]);
  return next;
}
export async function recordResponse(session, observations, activityDate) {
  if (
    !["completed", "partial", "abandoned", "unknown"].includes(
      session.lifecycle,
    )
  )
    throw Error("Finish the workout before adding its delayed response");
  const at = new Date().toISOString(),
    record = {
      id: uid(),
      recordVersion: 1,
      revision: 1,
      kind: "response",
      sessionId: session.id,
      activityDate,
      recordedAt: known(at),
      observations: structuredClone(observations),
      interpretation: {},
      provenance: { origin: "user", sourceIds: [] },
    };
  // Raw facts commit first. Guidance failure cannot undo or misreport the saved observation.
  await atomicV2(
    [{ store: "v2Observations", record, expectedRevision: null }],
    {
      guards: [{ store: "v2WorkoutSessions", id: session.id, value: session }],
    },
  );
  try {
    const interpreted = {
      ...record,
      revision: 2,
      interpretation: {
        status: classifyTolerance(record.observations),
        ruleId: "response.tolerance.v1",
        ruleVersion: RULESET,
      },
    };
    await saveV2("v2Observations", interpreted, 1);
    await analyzeGuidance(session, activityDate);
    return { record: interpreted, warning: null };
  } catch (e) {
    return {
      record,
      warning: `Response saved; guidance refresh needs retry: ${e.message}`,
    };
  }
}
export { materializeLegacy };
