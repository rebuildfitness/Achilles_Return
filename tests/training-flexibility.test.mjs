import test from "node:test";
import assert from "node:assert/strict";
import {
  rescheduleWorkout,
  swapExercise,
  loadGuidance,
} from "../src/rules/trainingFlexibility.js";
import { weeklyPlan } from "../src/rules/planner.js";
import { CATALOG, EQUIPMENT } from "../src/data/catalog.js";
import { baselineValues } from "./fixtures.mjs";
import { validateWorkoutLog } from "../src/rules/response.js";
const assessment = { values: baselineValues(), completedAt: "2026-09-01" };
test("Mammoth milestone prompts review without a 225 lb logging cap or transferred load", () => {
  const history = (load, status = "TOLERATED") => [{
    createdAt: "2026-09-13",
    status,
    exerciseLog: { [CATALOG.belt.id]: { sets: Array.from({length: CATALOG.belt.sets}, () => ({
      complete: true, load: String(load), reps: "10", quality: "good", symptoms: "none", rpe: "7",
    })) } },
  }];
  assert.equal(loadGuidance(CATALOG.belt, history(224)).next, false);
  const guide = loadGuidance(CATALOG.belt, history(225));
  assert.equal(guide.next, true);
  assert.equal(guide.limit, 380);
  assert.match(guide.transition, /personal milestone/);
  for (const status of ["PENDING_NEXT_DAY_RESPONSE", "BORDERLINE", "NOT_TOLERATED"]) {
    assert.equal(loadGuidance(CATALOG.belt, history(225, status)).next, false);
  }
  for (const readiness of ["YELLOW_1", "RED"]) {
    assert.equal(loadGuidance(CATALOG.belt, history(225), readiness).next, false);
  }
  for (const load of [225, 250, 380]) {
    assert.equal(validateWorkoutLog({items:[CATALOG.belt]}, {
      [CATALOG.belt.id]: {sets:[{complete:true, load:String(load), reps:"8"}]},
    }), null);
  }
  assert.match(validateWorkoutLog({items:[CATALOG.belt]}, {
    [CATALOG.belt.id]: {sets:[{complete:true, load:"385", reps:"8"}]},
  }), /380 lb of Olympic plates/);
  const smith = swapExercise(CATALOG.belt, "library-smith-wide-stance-squat", EQUIPMENT, "GREEN", "progression");
  assert.match(loadGuidance(smith, history(225)).starting, /No established tolerated load/);
  assert.equal(loadGuidance(smith, history(225)).next, false);
});
test("Recent reassessment stays valid for a next-day make-up; selected variants receive yellow modifications", () => {
  const profile = {
    equipment: EQUIPMENT,
    availableDays: ["1", "3", "5"],
    exerciseChoices: {
      "db-bench": {
        id: "library-smith-incline-bench-press",
        reason: "progression",
      },
    },
  };
  const a = { ...assessment, completedAt: "2026-09-29T12:00:00" };
  const sessions = [
    { date: "2026-09-01", createdAt: "2026-09-01", status: "TOLERATED" },
  ];
  const today = weeklyPlan(
    profile,
    a,
    sessions,
    new Date("2026-09-30T12:00:00"),
    "YELLOW_1",
  ).find((d) => d.date === "2026-09-30");
  assert.equal(today.retest, false);
  assert.ok(
    today.workout.items.some(
      (ex) => ex.id === "library-smith-incline-bench-press",
    ),
  );
  assert.equal(today.workout.progressionAllowed, false);
});
test("A missed Monday moves to Tuesday and shifts Wednesday rather than stacking strength", () => {
  const profile = { availableDays: ["1", "3", "5"], equipment: EQUIPMENT };
  const days = weeklyPlan(
    profile,
    assessment,
    [],
    new Date("2026-09-08T12:00:00"),
  );
  const moves = rescheduleWorkout(
    days,
    [],
    "2026-09-07",
    "2026-09-08",
    "2026-09-08",
  );
  const next = weeklyPlan(
    { ...profile, scheduleMoves: moves },
    assessment,
    [],
    new Date("2026-09-08T12:00:00"),
  );
  assert.equal(next.find((d) => d.date === "2026-09-07").workout, null);
  assert.equal(
    next.find((d) => d.date === "2026-09-08").workout.id,
    "strength-A",
  );
  assert.equal(next.find((d) => d.date === "2026-09-09").workout, null);
  assert.equal(
    next.find((d) => d.date === "2026-09-10").workout.id,
    "strength-B",
  );
  assert.throws(() =>
    rescheduleWorkout(
      days,
      [{ date: "2026-09-07" }],
      "2026-09-07",
      "2026-09-08",
      "2026-09-08",
    ),
  );
});
test("Swaps retain dose, require equipment and preserve red/modified guards", () => {
  const next = swapExercise(
    CATALOG.press,
    "library-smith-incline-bench-press",
    EQUIPMENT,
    "GREEN",
    "progression",
  );
  assert.equal(next.originalId, CATALOG.press.id);
  assert.equal(next.sets, CATALOG.press.sets);
  assert.throws(() =>
    swapExercise(CATALOG.press, next.id, [], "GREEN", "progression"),
  );
  assert.throws(() =>
    swapExercise(CATALOG.press, next.id, EQUIPMENT, "RED", "equipment"),
  );
  assert.throws(() =>
    swapExercise(CATALOG.press, next.id, EQUIPMENT, "YELLOW_1", "progression"),
  );
});
test("Equipment-limit guidance uses tolerated history and blocks over-capacity completion", () => {
  const sets = Array.from({ length: 3 }, () => ({
    complete: true,
    load: "50",
    reps: "10",
    quality: "good",
    symptoms: "none",
    rpe: "7",
  }));
  const session = {
    createdAt: "2026-09-10",
    status: "TOLERATED",
    exerciseLog: { [CATALOG.press.id]: { sets } },
  };
  assert.equal(loadGuidance(CATALOG.press, [session]).next, true);
  assert.equal(
    loadGuidance(CATALOG.press, [
      { ...session, status: "PENDING_NEXT_DAY_RESPONSE" },
    ]).next,
    false,
  );
  assert.match(
    validateWorkoutLog(
      { items: [CATALOG.press] },
      {
        [CATALOG.press.id]: {
          sets: [{ complete: true, load: "55", reps: "5" }],
        },
      },
    ),
    /50 lb/,
  );
});
