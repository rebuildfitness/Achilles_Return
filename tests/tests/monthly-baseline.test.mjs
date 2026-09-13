import test from "node:test";
import assert from "node:assert/strict";
import {
  freshBaseline,
  monthlyPair,
  monthlyStatus,
  TREND_METRICS,
  trendValue,
} from "../src/data/assessmentHistory.js";
import { runningCriteria } from "../src/rules/baseline.js";
import { BASELINE_SECTIONS, validateSection } from "../src/data/baseline.js";
import { EQUIPMENT } from "../src/data/catalog.js";
test("New retests retain profile but never silently reuse prior measured results", () => {
  const next = freshBaseline(
    {
      repairSide: "left",
      heel_repaired_reps: "25",
      noDailyPain: "yes",
      redFlags: ["sharp-pain"],
      availableDays: ["1", "3"],
    },
    new Date(2026, 8, 30),
  );
  assert.equal(next.heel_repaired_reps, undefined);
  assert.equal(next.noDailyPain, undefined);
  assert.equal(next.redFlags, undefined);
  assert.equal(next.repairSide, "left");
  assert.equal(next.assessmentSlot, "finish");
  assert.equal(next.assessmentMonth, "2026-09");
});
test("Monthly comparisons use explicit pairs and preserve absent values and real zero", () => {
  const start = {
    id: "a",
    completedAt: "2026-09-01",
    values: {
      assessmentMonth: "2026-09",
      assessmentSlot: "start",
      heel_repaired_reps: "0",
    },
  };
  const finish = {
    id: "b",
    completedAt: "2026-09-30",
    values: {
      assessmentMonth: "2026-09",
      assessmentSlot: "finish",
      heel_repaired_reps: "12",
    },
  };
  const historical = {
    id: "c",
    completedAt: "2026-09-20",
    values: { heel_repaired_reps: "99" },
  };
  const pair = monthlyPair([finish, historical, start], "2026-09");
  assert.equal(pair.start, start);
  assert.equal(pair.finish, finish);
  assert.equal(trendValue(start, TREND_METRICS[0], 0), 0);
  assert.equal(trendValue(start, TREND_METRICS[0], 1), null);
  assert.equal(
    monthlyStatus([], new Date(2028, 1, 1)).finishDate,
    "2028-02-29",
  );
});
test("Pain-free answers remain met; conflicting answers and unmeasured capabilities are explicit", () => {
  const criteria = runningCriteria({
    noDailyPain: "yes",
    noRehabPain: "yes",
    restPain: "0",
    walkPain: "0",
  });
  assert.equal(criteria[0].status, "Met");
  assert.equal(criteria[1].status, "Met");
  assert.equal(
    criteria.find((c) => c.id === "heel-rise").status,
    "Not recorded",
  );
  assert.equal(criteria.find((c) => c.id === "balance").status, "Not recorded");
  assert.equal(
    runningCriteria({ noDailyPain: "yes", restPain: "3" })[0].status,
    "Review conflicting answers",
  );
});
test("Unperformed physical tests can remain blank, but invalid recorded measurements cannot be saved", () => {
  const section = BASELINE_SECTIONS.find((s) => s.id === "bilateral");
  assert.deepEqual(
    validateSection(section, { clearance: "yes", noRestrictions: "yes" }),
    [],
  );
  assert.ok(
    validateSection(
      BASELINE_SECTIONS.find((s) => s.id === "balance"),
      { redFlags: ["sharp-pain"], balance_repaired_seconds: "-1" },
    ).length,
  );
  assert.ok(EQUIPMENT.includes("olympic-barbell"));
  assert.ok(EQUIPMENT.includes("weight-plates"));
});
