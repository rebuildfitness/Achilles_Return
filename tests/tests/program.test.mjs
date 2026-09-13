import test from "node:test";
import assert from "node:assert/strict";
import { baselineValues, reviewed, exposure } from "./fixtures.mjs";
import { classifyReadiness } from "../src/rules/readiness.js";
import {
  BASELINE_SECTIONS,
  sectionBlocked,
  validateSection,
} from "../src/data/baseline.js";
import {
  baselineResult,
  heelRiseMetrics,
  metric,
  symmetry,
} from "../src/rules/baseline.js";
import {
  strengthTemplate,
  modifyWorkout,
  weeklyPlan,
} from "../src/rules/planner.js";
import {
  gate,
  levelGate,
  exposureDecision,
  strengthDecision,
  exposureScheduling,
  exposureReentry,
  PROGRESSION_CONFIG,
} from "../src/rules/progression.js";
import {
  classifyTolerance,
  validateWorkoutLog,
} from "../src/rules/response.js";
import {
  CATALOG,
  EQUIPMENT,
  activeExercise,
  validDemo,
  PROGRESSION_DOMAINS,
} from "../src/data/catalog.js";
import {
  courtCap,
  exposureQuality,
  exposureContent,
  validateExposureLog,
} from "../src/data/exposures.js";
import { CLINICAL_COPY } from "../src/data/evidence.js";
import { migrateBackup } from "../src/persistence/schema.js";
const baseline = baselineValues();
const good = {
  pain: "none",
  stiffness: "normal",
  swelling: "normal",
  previousResponse: "good",
  recovery: "good",
  unusualSymptoms: [],
};
const assessment = {
  id: "baseline",
  values: baseline,
  completedAt: "2026-09-11T09:00:00Z",
};
const dates = new Date(2026, 8, 11);
for (const flag of [
  "sharp-pain",
  "new-bruising",
  "major-swelling",
  "sudden-weakness",
  "new-limp",
])
  test(`Safety 1–6: ${flag} overrides recovery and removes workout`, () => {
    assert.equal(
      classifyReadiness({ ...good, unusualSymptoms: [flag] }).level,
      "RED",
    );
    assert.equal(
      modifyWorkout(strengthTemplate("A", baseline), "RED").items.length,
      0,
    );
  });
test("7–14: all readiness branches modify approved templates consistently", () => {
  assert.equal(classifyReadiness(good).level, "GREEN");
  const raw = strengthTemplate("A", baseline),
    y1 = modifyWorkout(raw, "YELLOW_1");
  assert.equal(y1.items[0].sets, raw.items[0].sets - 1);
  assert.equal(y1.progressionAllowed, false);
  assert.ok(
    modifyWorkout(raw, "YELLOW_2").items.every(
      (e) => e.impactTier === 0 && e.loadTier !== "high",
    ),
  );
  assert.ok(
    modifyWorkout(raw, "YELLOW_3").items.every((e) => e.loadTier === "minimal"),
  );
});
test("15–20: next-morning responses and incomplete answers remain conservative", () => {
  assert.equal(classifyTolerance({}), "PENDING_NEXT_DAY_RESPONSE");
  assert.equal(
    classifyTolerance({
      change: "baseline",
      functionChange: "no",
      repeatedWorsening: "no",
    }),
    "TOLERATED",
  );
  assert.equal(classifyTolerance({ change: "meaningful" }), "BORDERLINE");
  assert.equal(classifyTolerance({ change: "substantial" }), "NOT_TOLERATED");
  assert.equal(
    classifyTolerance({ change: "baseline", functionChange: "yes" }),
    "NOT_TOLERATED",
  );
  assert.equal(
    classifyTolerance({ change: "baseline", redFlags: ["sharp-pain"] }),
    "MEDICAL_FLAG",
  );
  for (const [status, action] of [
    ["PENDING_NEXT_DAY_RESPONSE", "WAIT"],
    ["BORDERLINE", "HOLD"],
    ["NOT_TOLERATED", "WAIT"],
  ])
    assert.equal(
      exposureDecision("running", baseline, {}, [
        exposure("running", "R2", status),
      ]).action,
      action,
    );
});
test("21–29: equipment, unique calf demos, video metadata and wagon units", () => {
  for (const kind of ["A", "B", "C"])
    for (const ex of modifyWorkout(strengthTemplate(kind, baseline)).items) {
      assert.ok(activeExercise(ex));
      assert.ok(ex.equipment.every((e) => EQUIPMENT.includes(e)));
      assert.ok(validDemo(ex));
      assert.doesNotMatch(ex.name, /leg press/i);
    }
  assert.equal(
    new Set([
      CATALOG.bilateral.videoUrl,
      CATALOG.seated.videoUrl,
      CATALOG.single.videoUrl,
    ]).size,
    3,
  );
  assert.equal(CATALOG.wagon.unit, "yards");
  assert.match(CATALOG.wagon.cue, /not equivalent/);
  assert.equal(
    activeExercise({ ...CATALOG.belt, equipment: ["leg-press-machine"] }),
    false,
  );
  assert.equal(validDemo({ ...CATALOG.single, videoType: "lecture" }), false);
  assert.equal(
    modifyWorkout(strengthTemplate("A", baseline), "GREEN", []).items.some(
      (ex) => ex.equipment.length,
    ),
    false,
  );
});
test("30: red symptoms and unsafe bilateral screen prevent dynamic testing", () => {
  const heel = BASELINE_SECTIONS.find((s) => s.id === "heelrise");
  assert.ok(sectionBlocked(heel, { ...baseline, redFlags: ["new-bruising"] }));
  assert.ok(sectionBlocked(heel, { ...baseline, bilateralSafe: "no" }));
  assert.ok(sectionBlocked(heel, { ...baseline, clearance: "unsure" }));
});
test("31–33: independent rep, height and work LSI; no invented missing values", () => {
  const m = heelRiseMetrics(baseline);
  assert.equal(m.repLSI, 80);
  assert.equal(m.heightLSI, 80);
  assert.equal(m.workLSI, 62.2);
  assert.equal(
    heelRiseMetrics({ ...baseline, heel_repaired_average: "" }).workLSI,
    null,
  );
  assert.equal(
    heelRiseMetrics({ ...baseline, heel_uninvolved_average: "0" }).workLSI,
    null,
  );
  assert.equal(symmetry(10, 0), null);
  assert.equal(metric(""), null);
  assert.equal(metric("bad"), null);
});
test("34–36,41: all seven required and no calendar-only clearance", () => {
  assert.equal(baselineResult(baseline).canRun, true);
  for (const [key, value] of Object.entries({
    noDailyPain: "no",
    noRehabPain: "no",
    gait: "slight",
    function_5: "no",
    heel_repaired_reps: "9",
    goodBalance: "no",
    psychReady: "no",
  }))
    assert.equal(
      gate("running", { ...baseline, [key]: value }).allowed,
      false,
      key,
    );
  assert.equal(gate("speed", baseline).allowed, false);
  assert.equal(gate("basketball", baseline).allowed, false);
  assert.equal(
    baselineResult({ ...baseline, surgeryDate: "2020-01-01" }).phase,
    baselineResult(baseline).phase,
  );
});
test("Baseline required values validate, zero is valid, unsafe sections are skipped", () => {
  for (const section of BASELINE_SECTIONS)
    assert.deepEqual(validateSection(section, baseline), [], section.id);
  assert.ok(
    validateSection(BASELINE_SECTIONS[0], { ...baseline, restPain: "11" })
      .length,
  );
  assert.ok(
    validateSection(BASELINE_SECTIONS[0], { ...baseline, clearance: "" })
      .length,
  );
});
const sets = Array.from({ length: 3 }, () => ({
  complete: true,
  reps: "12",
  load: "20",
  rpe: "8",
  quality: "good",
  symptoms: "none",
}));
const calf = { ...CATALOG.single, sets: 3, reps: "6–12" };
test("37–40: double progression requires every set, quality, RPE, tolerance and green", () => {
  assert.equal(
    strengthDecision(calf, sets, "TOLERATED").action,
    "PROPOSE_SMALL_INCREMENT",
  );
  for (const change of [
    { quality: "reduced" },
    { rpe: "10" },
    { symptoms: "increased" },
    { reps: "9" },
    { complete: false },
    { rpe: "" },
  ])
    assert.equal(
      strengthDecision(
        calf,
        [{ ...sets[0], ...change }, ...sets.slice(1)],
        "TOLERATED",
      ).action,
      "HOLD",
    );
  assert.equal(
    strengthDecision(calf, sets, "TOLERATED", "YELLOW_1").action,
    "HOLD",
  );
  assert.equal(
    strengthDecision(calf, sets, "PENDING_NEXT_DAY_RESPONSE").action,
    "HOLD",
  );
});
test("42–45: run advances one ladder step after two good tolerated exposures", () => {
  assert.equal(
    exposureDecision("running", baseline, {}, [exposure("running", "R1")])
      .level,
    "R1",
  );
  assert.equal(
    exposureDecision("running", baseline, {}, [
      exposure("running", "R1", "TOLERATED", 1),
      exposure("running", "R1", "TOLERATED", 2),
    ]).level,
    "R2",
  );
  assert.equal(
    exposureDecision("running", baseline, {}, [
      exposure("running", "R1", "TOLERATED", 1),
      exposure("running", "R2", "NOT_TOLERATED", 2),
    ]).level,
    "R1",
  );
  assert.equal(
    PROGRESSION_DOMAINS.find((d) => d.id === "running").levels.length,
    9,
  );
});
test("46–49: independent jump gate, unilateral lock and contact spike review", () => {
  const checks = reviewed("calfCapacity", "lowElastic");
  assert.equal(
    gate("jumping", { ...baseline, psychReady: "no" }, checks).allowed,
    true,
  );
  assert.equal(levelGate("jumping", "J3", baseline, checks).allowed, false);
  assert.equal(
    exposureQuality(
      "jumping",
      "J2",
      {
        movementQuality: "good",
        immediateAchillesResponse: "good",
        contacts: "120",
      },
      [{ ...exposure("jumping", "J1"), contacts: "60" }],
    ).progressionEligible,
    false,
  );
  assert.equal(
    exposureDecision("running", baseline, {}, [
      exposure("jumping", "J1", "NOT_TOLERATED"),
    ]).level,
    "R1",
  );
  assert.equal(exposureContent("jumping", "J5").missingDemos.length, 0);
  assert.equal(exposureContent("jumping", "J5").needsIndividualDose, true);
});
test("50–53: high speed and reactive gates use multi-domain recorded evidence", () => {
  const checks = reviewed(
    "plyometric",
    "lateStage",
    "highSpeedReview",
    "deceleration",
    "plannedCut",
    "reactiveCod",
    "stationarySkills",
  );
  const history = [
    exposure("running", "R8"),
    exposure("jumping", "J4"),
    exposure("speed", "S3", "TOLERATED", 1),
    exposure("speed", "S4", "TOLERATED", 2),
  ];
  assert.equal(PROGRESSION_CONFIG.highSpeedToleratedExposures, 3);
  assert.equal(
    levelGate("speed", "S5", baseline, checks, history).allowed,
    false,
  );
  history.push(exposure("speed", "S4", "TOLERATED", 3));
  assert.equal(
    levelGate("speed", "S5", baseline, checks, history).allowed,
    true,
  );
  assert.equal(
    levelGate("cod", "D6", baseline, checks, history).allowed,
    false,
  );
  history.push(exposure("cod", "D5"));
  assert.equal(levelGate("cod", "D6", baseline, checks, history).allowed, true);
  assert.equal(
    levelGate("basketball", "B5", baseline, checks, history).allowed,
    false,
  );
});
test("54–58: stationary skills, court log, exposure caps and candidate wording", () => {
  assert.equal(
    gate(
      "basketball",
      { ...baseline, psychReady: "no" },
      reviewed("stationarySkills"),
    ).allowed,
    true,
  );
  assert.equal(courtCap("B8", []), 30);
  assert.equal(courtCap("B8", [exposure("basketball", "B8")]), 45);
  assert.ok(
    validateExposureLog(
      "basketball",
      "B6",
      {
        minutes: "10",
        sessionRPE: "5",
        movementQuality: "good",
        immediateAchillesResponse: "good",
      },
      [],
    ).includes("Record actual intensity / pace."),
  );
  assert.equal(
    exposureQuality("basketball", "B8", {
      minutes: "35",
      movementQuality: "good",
      immediateAchillesResponse: "good",
    }).progressionEligible,
    false,
  );
  assert.equal(CLINICAL_COPY.candidate, "Unrestricted Basketball Candidate");
  assert.equal(
    strengthDecision(calf, sets, "TOLERATED").action,
    "PROPOSE_SMALL_INCREMENT",
  );
});
test("59–61: soccer optional, low skills before multidirectional tasks", () => {
  assert.equal(
    gate("soccer", baseline, {}, [exposure("running", "R1")]).allowed,
    false,
  );
  const values = {
    ...baseline,
    soccerEnabled: "yes",
    soccerBall: "yes",
    soccerField: "yes",
  };
  assert.equal(
    gate("soccer", values, {}, [exposure("running", "R1")]).allowed,
    true,
  );
  assert.equal(
    levelGate("soccer", "SC4", values, {}, [exposure("running", "R1")]).allowed,
    false,
  );
});
test("62–63,68–71: seven days, whitelisted templates, missed-session reduction and spacing", () => {
  const plan = weeklyPlan(undefined, assessment, [], dates);
  assert.equal(plan.length, 7);
  assert.equal(plan.filter((d) => d.high).length, 3);
  const allDays = weeklyPlan(
    { availableDays: ["0", "1", "2", "3", "4", "5", "6"] },
    assessment,
    [],
    dates,
  );
  assert.equal(allDays[6].high, false);
  const old = [
    {
      id: "s",
      date: "2026-08-01",
      createdAt: "2026-08-01",
      status: "TOLERATED",
    },
  ];
  assert.equal(
    weeklyPlan(
      undefined,
      { ...assessment, completedAt: "2026-08-01" },
      old,
      dates,
    ).find((d) => d.date === "2026-09-11").retest,
    true,
  );
  assert.equal(
    weeklyPlan(undefined, assessment, old, dates).find(
      (d) => d.date === "2026-09-11",
    ).retest,
    false,
  );
  assert.equal(
    exposureScheduling(
      "running",
      [{ domain: "running", date: "2026-09-11" }],
      "2026-09-11",
      true,
    ).allowed,
    false,
  );
  assert.equal(
    exposureScheduling(
      "running",
      [{ domain: "running", date: "2026-09-10" }],
      "2026-09-11",
      true,
    ).allowed,
    false,
  );
  assert.equal(
    exposureScheduling(
      "running",
      [
        { domain: "running", date: "2026-09-07" },
        { domain: "jumping", date: "2026-09-09" },
      ],
      "2026-09-11",
      true,
    ).allowed,
    false,
  );
});
test("Program cannot activate before baseline, nor advance past missing relevant responses", () => {
  assert.ok(
    weeklyPlan(undefined, undefined, [], dates).every(
      (d) => d.provisional && !d.workout,
    ),
  );
  assert.equal(
    exposureDecision("running", baseline, {}, [
      {
        ...exposure("strength", "A", "PENDING_NEXT_DAY_RESPONSE"),
        domain: undefined,
      },
    ]).allowed,
    false,
  );
});
test("Completed logs reject invalid load, reps and RPE without losing incomplete sets", () => {
  const workout = { items: [calf] };
  assert.match(validateWorkoutLog(workout, {}), /Complete/);
  assert.equal(validateWorkoutLog(workout, { [calf.id]: { sets } }), null);
  assert.match(
    validateWorkoutLog(workout, {
      [calf.id]: { sets: [{ complete: true, reps: "", load: "20" }] },
    }),
    /valid repetitions/,
  );
  assert.match(
    validateWorkoutLog(workout, {
      [calf.id]: { sets: [{ ...sets[0], load: "-1" }] },
    }),
    /Loads/,
  );
});
test("Backup validation catches malformed values and duplicate IDs before restore", () => {
  const backup = {
    version: 1,
    profile: [],
    checkins: [],
    sessions: [],
    assessments: [],
  };
  assert.throws(
    () => migrateBackup({ ...backup, assessments: [{ id: "a", values: [] }] }),
    /Invalid measurements/,
  );
  assert.throws(
    () => migrateBackup({ ...backup, sessions: [{ id: "a" }, { id: "a" }] }),
    /Duplicate/,
  );
});

test("Contact guard holds a ladder jump before prescribed contacts double", () => {
  const decision = exposureDecision(
    "jumping",
    baseline,
    reviewed("calfCapacity", "lowElastic"),
    [{ ...exposure("jumping", "J0"), contacts: "27" }],
  );
  assert.equal(decision.level, "J0");
  assert.equal(decision.action, "HOLD");
  assert.match(decision.reason, /double/);
});

test("Interrupted exposure requires domain-specific retest and reduced re-entry", () => {
  const history = [{ ...exposure("running", "R3"), date: "2026-08-01" }];
  assert.equal(
    exposureReentry("running", history, "2026-09-11", "2026-08-01").retest,
    true,
  );
  assert.equal(
    exposureReentry("running", history, "2026-09-11", "2026-09-11").reduction,
    0.3,
  );
  assert.equal(
    exposureReentry(
      "running",
      [{ ...exposure("running", "R1"), date: "2026-09-05" }],
      "2026-09-11",
    ).reduction,
    0.2,
  );
});

test("Latest poor quality or reduced re-entry cannot borrow old successful exposure counts", () => {
  const history = [
    exposure("running", "R1", "TOLERATED", 1),
    exposure("running", "R1", "TOLERATED", 2),
    {
      ...exposure("running", "R1", "TOLERATED", 3),
      progressionEligible: false,
    },
  ];
  assert.equal(exposureDecision("running", baseline, {}, history).level, "R1");
  assert.equal(
    exposureDecision("running", baseline, {}, history).action,
    "HOLD",
  );
});
