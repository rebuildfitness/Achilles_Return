import test from "node:test";
import assert from "node:assert/strict";
import {
  exerciseHistory,
  recordedExercises,
} from "../src/data/trainingHistory.js";

test("strength history includes substitutions and retains response status", () => {
  const sessions = [
    {
      id: "a",
      date: "2026-09-12",
      createdAt: "2026-09-12",
      status: "PENDING_NEXT_DAY_RESPONSE",
      plannedItems: [{ id: "smith-press", name: "Smith press" }],
      exerciseLog: {
        "smith-press": {
          sets: [
            { load: 95, reps: 5, complete: true },
            { load: 115, reps: 5, complete: false },
          ],
        },
      },
    },
  ];
  assert.deepEqual(recordedExercises(sessions), [
    { id: "smith-press", name: "Smith press" },
  ]);
  assert.equal(exerciseHistory(sessions, "smith-press")[0].load, 95);
  assert.equal(
    exerciseHistory(sessions, "smith-press")[0].status,
    "PENDING_NEXT_DAY_RESPONSE",
  );
});
test("strength graph excludes absent loads without discarding a recorded zero", () => {
  const session = {
    id: "a",
    date: "2026-09-12",
    createdAt: "2026-09-12",
    status: "TOLERATED",
    exerciseLog: {
      core: {
        sets: [
          { load: "", complete: true },
          { load: undefined, complete: true },
          { load: "invalid", complete: true },
          { load: 0, reps: 10, complete: true },
        ],
      },
    },
  };
  assert.equal(exerciseHistory([session], "core").length, 1);
  assert.equal(exerciseHistory([session], "core")[0].load, 0);
  assert.deepEqual(exerciseHistory([session], "missing"), []);
});
