import test from "node:test";
import assert from "node:assert/strict";
import { currentWeekPlan } from "../src/data/provisionalWeek.js";
import { nextDayStatus } from "../src/rules/tolerance.js";
test("red flags override even good next-morning responses", () => {
  for (const response of ["good", "somewhat-sore", "poor"])
    assert.equal(nextDayStatus(response, "RED"), "MEDICAL_FLAG");
});
test("existing next-morning mapping stays conservative for unknown responses", () => {
  assert.equal(nextDayStatus("good", "GREEN"), "TOLERATED");
  assert.equal(nextDayStatus("somewhat-sore", "YELLOW_1"), "BORDERLINE");
  assert.equal(nextDayStatus("poor", "YELLOW_2"), "NOT_TOLERATED");
  assert.equal(nextDayStatus(undefined, "GREEN"), "PENDING_NEXT_DAY_RESPONSE");
});
test("ported provisional week retains seven days across month/year boundaries", () => {
  const week = currentWeekPlan(new Date(2027, 0, 1));
  assert.equal(week.length, 7);
  assert.equal(week[0].date, "2026-12-28");
  assert.equal(week[6].date, "2027-01-03");
  assert.equal(week[0].workout.items.length, 6);
  assert.equal(week[3].workout, null);
});
