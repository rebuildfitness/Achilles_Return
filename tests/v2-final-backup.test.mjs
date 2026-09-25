import test from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import { closeDb, DB_NAME, put, exportAll, restoreBackup } from "../src/db.js";
import {
  emptyIntent,
  customDefinition,
  occurrence,
  known,
  targetNumber,
} from "../src/domain/v2/composition.js";
import { saveV2, listV2 } from "../src/persistence/v2Repository.js";
import {
  repeatPlan,
  startPlanned,
  recordResponse,
  correctHistory,
  readTimeline,
} from "../src/persistence/planningHistory.js";
import { sessionWriter } from "../src/persistence/sessionExecution.js";
import {
  analyzeGuidance,
  decideGuidance,
} from "../src/persistence/guidance.js";
import { completedTraining } from "../src/domain/v2/progress.js";
import {priorCorrectionState} from '../src/domain/v2/corrections.js';
async function reset() {
  await closeDb();
  await new Promise((r, j) => {
    const q = indexedDB.deleteDatabase(DB_NAME);
    q.onsuccess = r;
    q.onerror = j;
  });
}
test("Final combined backup round trip preserves V1, custom, recurrence, actuals, correction, response and guidance", async () => {
  await reset();
  const date = "2026-09-21",
    at = date + "T12:00:00Z";
  await put("sessions", {
    id: "legacy-kept",
    date,
    unknownExtension: { unchanged: 0 },
    finishedAt: at,
    exerciseLog: {},
  });
  const d = customDefinition({
    name: "Synthetic custom",
    trackingType: "reps",
    categories: ["Strength"],
  });
  await saveV2("v2ExerciseDefinitions", d, null);
  const t = emptyIntent("Synthetic template");
  t.occurrences = [occurrence(d)];
  await saveV2("v2WorkoutTemplates", t, null);
  const plans = await repeatPlan(t, {
    start: date,
    end: "2026-09-28",
    weekdays: [1],
    seriesId: "synthetic-series",
    templateRef: { id: t.id, revision: 1 },
  });
  const active = await startPlanned(plans[0], at),
    writer = sessionWriter(active, () => {}, null),
    o = active.occurrences[0],
    set = o.sets[0];
  await writer.dispatch(
    {
      type: "actual",
      id: o.id,
      setId: set.id,
      actual: { reps: targetNumber("8", "count") },
    },
    at,
  );
  await writer.dispatch({ type: "complete", id: o.id, setId: set.id }, at);
  await writer.dispatch({ type: "finish", lifecycle: "completed" }, at);
  const finished = await writer.flush();
    let corrected = await correctHistory(finished, {
    type: "set",
    reason: "Synthetic correction",
    occurrenceId: o.id,
    setId: set.id,
    actual: { reps: targetNumber("9", "count") },
  });
    const firstCorrection=structuredClone(corrected);
    corrected=await correctHistory(corrected,{type:'notes',notes:'Second factual correction',reason:'Synthetic second correction'});
    await recordResponse(
    corrected,
    {
      change: "baseline",
      functionChange: "no",
      repeatedWorsening: "no",
      notes: "Synthetic",
    },
    date,
  );
  const captured = await analyzeGuidance(corrected, date, at);
  assert.ok(captured.events.length);
  await decideGuidance(
    corrected,
    captured.events[0],
    "acknowledged",
    captured,
    null,
    at,
  );
  const backup = JSON.parse(JSON.stringify(await exportAll()));
  const before = await readTimeline();
  await reset();
  await restoreBackup(backup);
  await restoreBackup(backup);
  await closeDb();
  const after = await readTimeline();
  for (const store of [
    "sessions",
    "v2ExerciseDefinitions",
    "v2WorkoutTemplates",
    "v2PlannedWorkouts",
    "v2WorkoutSessions",
    "v2Observations",
    "v2GuidanceEvents",
    "v2GuidanceDecisions",
  ])
    assert.deepEqual(after[store], before[store], store);
  assert.equal(after.sessions[0].unknownExtension.unchanged, 0);
    assert.equal(after.v2WorkoutSessions[0].correctionLineage.length, 2);
    assert.deepEqual(priorCorrectionState(after.v2WorkoutSessions[0],1),firstCorrection);
  assert.equal(after.v2PlannedWorkouts.length, 2);
  assert.equal(completedTraining(after).length, 1);
  const bytes = JSON.stringify(backup).length;
  console.log(
    "Final synthetic backup bytes:",
    bytes,
    "guidance events:",
    after.v2GuidanceEvents.length,
  );
  const conflict = structuredClone(backup); // a different same-ID record is rejected atomically
  const current = after.v2WorkoutTemplates[0];
  await saveV2(
    "v2WorkoutTemplates",
    { ...current, name: "Newer local", revision: 2 },
    1,
  );
  await assert.rejects(restoreBackup(conflict), /conflict/i);
  assert.equal((await listV2("v2WorkoutTemplates"))[0].name, "Newer local");
  await reset();
});
