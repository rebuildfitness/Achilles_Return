import test from "node:test";
import assert from "node:assert/strict";
import { baselineValues } from "./fixtures.mjs";
import {
  strengthTemplate,
  modifyWorkout,
  weeklyPlan,
} from "../src/rules/planner.js";
import { strengthDecision } from "../src/rules/progression.js";
import {
  SIMPLE_SAFETY,
  SIMPLE_FUNCTION,
  validateSimpleBaseline,
} from "../src/data/simpleBaseline.js";
import { baselineResult } from "../src/rules/baseline.js";
import { CATALOG, activeExercise } from "../src/data/catalog.js";

test("Full-body additions preserve every original rehab prescription and do not add training days", () => {
  for (const kind of ["A", "B", "C"]) {
    const original = strengthTemplate(kind, baselineValues(), "rehab");
    const expanded = strengthTemplate(kind, baselineValues());
    for (const ex of original.items)
      assert.deepEqual(
        expanded.items.find((e) => e.id === ex.id),
        ex,
      );
    assert.ok(expanded.items.length > original.items.length);
    assert.ok(expanded.items.every((e) => activeExercise(e)));
    assert.equal(
      new Set(expanded.items.map((e) => e.id)).size,
      expanded.items.length,
    );
  }
  const assessment = { values: baselineValues(), completedAt: "2026-09-01" };
  const days = weeklyPlan(
    { availableDays: ["1", "3", "5"] },
    assessment,
    [],
    new Date(2026, 8, 7),
  );
  assert.equal(days.filter((d) => d.workout).length, 3);
});
test("5×5 requires all five good sets and next-morning tolerance; recovery removes heavy added work", () => {
  const raw = strengthTemplate("A", baselineValues());
  const press = raw.items.find((e) => e.id === CATALOG.press.id);
  assert.equal(press.sets, 5);
  assert.equal(press.reps, "5");
  const good = Array.from({ length: 5 }, () => ({
    complete: true,
    reps: "5",
    rpe: "7",
    quality: "good",
    symptoms: "none",
  }));
  assert.equal(
    strengthDecision(press, good, "TOLERATED").action,
    "PROPOSE_SMALL_INCREMENT",
  );
  assert.equal(
    strengthDecision(press, good.slice(1), "TOLERATED").action,
    "HOLD",
  );
  assert.equal(
    strengthDecision(press, good, "PENDING_NEXT_DAY_RESPONSE").action,
    "HOLD",
  );
  for (const level of ["YELLOW_1", "YELLOW_2", "YELLOW_3"]) {
    const modified = modifyWorkout(raw, level);
    assert.ok(
      modified.items
        .filter((e) => e.strengthModule)
        .every((e) => e.sets <= 3 && e.reps !== "5"),
    );
    assert.equal(modified.progressionAllowed, false);
  }
  assert.equal(modifyWorkout(raw, "RED").items.length, 0);
  assert.ok(
    modifyWorkout(raw, "GREEN", []).items.every((e) => !e.equipment.length),
  );
  assert.equal(
    strengthTemplate("A", baselineValues(), "hypertrophy").items.find(
      (e) => e.id === CATALOG.press.id,
    ).reps,
    "8–12",
  );
});
test("Simple baseline saves untested measurements as absent without granting running clearance", () => {
  const fixture = baselineValues();
  const values = Object.fromEntries(
    [...SIMPLE_SAFETY.fields, ...SIMPLE_FUNCTION.fields].map((f) => [
      f.id,
      fixture[f.id],
    ]),
  );
  values.availableDays = ["1", "3", "5"];
  assert.deepEqual(validateSimpleBaseline(values), []);
  assert.equal(baselineResult(values).canRun, false);
  assert.equal(
    baselineResult(values).criteria.find((c) => c.id === "heel-rise").status,
    "Not recorded",
  );
  assert.ok(validateSimpleBaseline({ ...values, restPain: "" }).length);
  assert.ok(
    validateSimpleBaseline({ ...values, heel_repaired_reps: "-2" }).length,
  );
  assert.ok(
    validateSimpleBaseline({ ...values, soleus_repaired_rpe: "20" }).length,
  );
  assert.equal(
    baselineResult({ ...values, redFlags: ["sharp-pain"] }).phase,
    "Safety Hold",
  );
});
