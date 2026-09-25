import test from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import {
  emptyIntent,
  compose,
  known,
  targetNumber,
  copyCompleted,
} from "../src/domain/v2/composition.js";
import {
  DEFINITIONS,
  starterTemplates,
} from "../src/domain/v2/compositionContent.js";
import {
  schedule,
  planCommand,
  expandWeekly,
} from "../src/domain/v2/planning.js";
import { correctSession } from "../src/domain/v2/corrections.js";
import {
  unified,
  calendarEvents,
  exerciseRows,
  exposureRows,
  actualRows,
  reportSession,
  readable,
} from "../src/domain/v2/timeline.js";
import { startSession, sessionCommand } from "../src/domain/v2/execution.js";
import {
  createPlan,
  changePlan,
  repeatPlan,
  startPlanned,
  correctHistory,
  recordResponse,
  readTimeline,
} from "../src/persistence/planningHistory.js";
import {
  saveV2,
  readV2,
  listV2,
  materializeLegacy,
} from "../src/persistence/v2Repository.js";
import { validateV2 } from "../src/persistence/v2Validation.js";
import { evaluateGuidance } from "../src/domain/v2/guidance.js";
import { closeDb, DB_NAME, put, exportAll, restoreBackup } from "../src/db.js";
const date = "2026-09-20",
  at = date + "T12:00:00.000Z",
  qty = (v, u = "count") => targetNumber(String(v), u);
function intent() {
  const t = compose(emptyIntent("Mixed workout"), {
    type: "add",
    definition: DEFINITIONS[0],
  });
  t.categories = ["Strength", "Achilles Rehab"];
  t.occurrences[0].sets[0].target = {
    reps: qty(8),
    load: qty(20, "lb"),
    loadConvention: known("per-hand"),
  };
  return t;
}
function finished(lifecycle = "completed") {
  let s = startSession(schedule(intent(), date), at);
  const o = s.occurrences[0],
    set = o.sets[0];
  s = sessionCommand(
    s,
    {
      type: "actual",
      id: o.id,
      setId: set.id,
      actual: {
        reps: qty(7),
        load: qty(20, "lb"),
        loadConvention: known("per-hand"),
        side: known("left"),
      },
    },
    at,
  );
  s = sessionCommand(s, { type: "complete", id: o.id, setId: set.id }, at);
  return { ...s, lifecycle, finishedAt: known(at) };
}
function correction(s, actual = { reps: qty(6) }) {
  return {
    type: "set",
    id: "correct-1",
    at,
    reason: "Typo",
    occurrenceId: s.occurrences[0].id,
    setId: s.occurrences[0].sets[0].id,
    actual,
  };
}
async function reset() {
  closeDb();
  await new Promise((r, j) => {
    const q = indexedDB.deleteDatabase(DB_NAME);
    q.onsuccess = r;
    q.onerror = j;
  });
}
test.beforeEach(reset);
test("dated plan deep copies a template", () => {
  const t = intent(),
    p = schedule(t, date);
  t.occurrences[0].sets[0].target.reps = qty(99);
  assert.equal(p.snapshot.occurrences[0].sets[0].target.reps.amount.value, 8);
});
test("plan editing cannot alter template", () => {
  const t = intent(),
    p = schedule(t, date);
  p.snapshot.name = "Different";
  assert.equal(t.name, "Mixed workout");
});
for (const type of ["move", "skip", "archive", "replace"])
  test(`plan ${type} is independent and audited`, () => {
    const p = schedule(intent(), date),
      before = structuredClone(p),
      n = planCommand(
        p,
        { type, date: "2026-09-22", intent: emptyIntent("New") },
        at,
      );
    assert.deepEqual(p, before);
    assert.equal(n.revision, 2);
    assert.equal(n.planning.audit.length, 1);
  });
test("weekly expansion has independent snapshots and stable series/date identities", () => {
  const ps = expandWeekly(intent(), {
    start: date,
    end: "2026-10-04",
    weekdays: [1, 3, 5],
    seriesId: "series",
  });
  assert.equal(ps.length, 6);
  ps[0].snapshot.name = "One only";
  assert.notEqual(ps[1].snapshot.name, "One only");
  assert.equal(new Set(ps.map((p) => p.id)).size, 6);
});
test("recurrence rejects empty or invalid weekday and excessive horizon", () => {
  for (const options of [
    { weekdays: [] },
    { weekdays: [8] },
    { weekdays: [1], end: "2030-01-01" },
  ])
    assert.throws(() =>
      expandWeekly(intent(), { start: date, end: "2026-10-01", ...options }),
    );
});
test("two same-date plans coexist", async () => {
  await createPlan(intent(), date);
  await createPlan(intent(), date);
  assert.equal((await listV2("v2PlannedWorkouts")).length, 2);
});
test("all curated starters can be scheduled", () => {
  for (const t of starterTemplates())
    validateV2("v2PlannedWorkouts", schedule(t, date));
});
test("start plan has independent snapshot and actual date", async () => {
  const p = await createPlan(intent(), "2026-09-22"),
    s = await startPlanned(p, at);
  await changePlan(p, { type: "replace", intent: emptyIntent("Other") });
  assert.equal(s.name.value, "Mixed workout");
  assert.equal(s.date.value, date);
  assert.equal(s.planRef, p.id);
});
test("stale plan cannot start", async () => {
  const p = await createPlan(intent(), date);
  await changePlan(p, { type: "move", date: "2026-09-22" });
  await assert.rejects(startPlanned(p, at), /Stale/);
});
test("skipped intent cannot masquerade as a start", async () => {
  const p = await createPlan(intent(), date),
    skip = await changePlan(p, { type: "skip" });
  await assert.rejects(startPlanned(skip, at), /Restore/);
});
test("repeat expansion commits all independent records", async () => {
  const ps = await repeatPlan(intent(), {
    start: date,
    end: "2026-09-28",
    weekdays: [1],
    seriesId: "week",
  });
  assert.equal(ps.length, 2);
  assert.equal((await listV2("v2PlannedWorkouts")).length, 2);
});
test("legacy materialization is represented once and original remains", async () => {
  const v1 = {
    id: "old",
    date,
    finishedAt: at,
    createdAt: at,
    exerciseLog: {},
    plannedItems: [],
  };
  await put("sessions", v1);
  await materializeLegacy(v1);
  const d = await readTimeline();
  assert.equal(unified(d).length, 1);
  assert.equal(d.sessions.length, 1);
});
test("multi-category session is one calendar session", () => {
  const s = finished();
  assert.equal(
    calendarEvents({ v2WorkoutSessions: [s] }).filter(
      (e) => e.kind === "session",
    ).length,
    1,
  );
});
test("copying completed workout is intent without actuals", () => {
  const s = finished(),
    p = schedule(copyCompleted(s), date);
  assert.ok(!JSON.stringify(p).includes('"actual"'));
  assert.equal(
    calendarEvents({ v2PlannedWorkouts: [p] }).filter((e) => e.training).length,
    0,
  );
});
test("partial work counts only completed set/bout rows", () => {
  const s = finished("partial");
  s.occurrences[0].sets.push({
    ...structuredClone(s.occurrences[0].sets[0]),
    id: "unperformed",
    disposition: "planned",
    actual: {},
  });
  assert.equal(actualRows(s).length, 1);
});
test("abandoned zero-work session and skipped plan do not count as training", () => {
  const s = startSession(schedule(intent(), date), at);
  s.lifecycle = "abandoned";
  const p = planCommand(schedule(intent(), date), { type: "skip" }, at);
  assert.equal(
    calendarEvents({ v2WorkoutSessions: [s], v2PlannedWorkouts: [p] }).filter(
      (e) => e.training,
    ).length,
    0,
  );
});
test("linked legacy exposure appears once, under parent event", () => {
  const parent = {
      id: "p",
      date,
      finishedAt: at,
      linkedExposureIds: ["ex"],
      exerciseLog: {},
      plannedItems: [],
    },
    ex = { id: "ex", date, domain: "running", duration: 10, finishedAt: at };
  const d = { sessions: [parent, ex] };
  assert.equal(calendarEvents(d).filter((e) => e.kind === "session").length, 1);
  assert.equal(exposureRows(unified(d)).length, 1);
});
test("explicit observation link supersedes duplicate embedded exposure", () => {
  const s = finished();
  s.categories = [];
  s.occurrences = [];
  s.exposures = [
    {
      id: "e",
      domain: known("running"),
      actual: { duration: qty(10, "minutes") },
      observations: {},
    },
  ];
  assert.equal(
    exposureRows(
      [s],
      [
        {
          id: "obs",
          kind: "exposure",
          sessionId: s.id,
          sourceExposureId: "e",
          observations: { domain: "running" },
          actual: { duration: qty(10, "minutes") },
        },
      ],
    ).length,
    1,
  );
});
for (const category of [
  "Running",
  "Plyometrics",
  "Sprinting",
  "Acceleration",
  "Deceleration",
  "Change of Direction / Agility",
  "Basketball Skill Exposure",
  "Walking",
])
  test(`${category} actual exposure retains category and raw quantities`, () => {
    const s = finished();
    s.categories = [category];
    const rows = exposureRows([s]);
    assert.ok(rows.some((r) => r.domain.includes(category)));
    assert.equal(
      rows.find((r) => r.source === "performed occurrence").actual[0].reps
        .amount.value,
      7,
    );
  });
test("repeated occurrences remain distinct in exercise history", () => {
  const s = finished(),
    o = structuredClone(s.occurrences[0]);
  o.id = "other";
  s.occurrences.push(o);
  assert.equal(exerciseRows([s]).length, 2);
});
test("load conventions and side are not aggregated", () => {
  const s = finished(),
    o = structuredClone(s.occurrences[0]);
  o.id = "other";
  o.sets[0].actual.loadConvention = known("assistance");
  s.occurrences.push(o);
  const rows = exerciseRows([s]);
  assert.equal(rows[0].rows[0].actual.loadConvention.value, "per-hand");
  assert.equal(rows[1].rows[0].actual.loadConvention.value, "assistance");
  assert.equal(rows[0].rows[0].actual.side.value, "left");
});
test("zero blank unknown and not applicable remain distinct in history", () => {
  assert.equal(readable(known(0)), "0");
  assert.equal(readable({ state: "blank" }), "Blank");
  assert.equal(readable({ state: "unknown" }), "Unknown");
  assert.equal(readable({ state: "not-applicable" }), "Not applicable");
});
test("checkpoints and assessment observations have unique calendar records", () => {
  const es = calendarEvents({
    assessments: [{ id: "a", completedAt: at, values: {} }],
    capabilityStates: [
      {
        id: "checkpoints",
        values: {
          calfCapacity: "yes",
          calfCapacity_date: date,
          calfCapacity_evidence: "Measured",
        },
      },
    ],
  });
  assert.equal(es.length, 2);
  assert.ok(es.some((e) => e.kind === "checkpoint"));
});
test("correction retains entire prior revision and original targets", () => {
  const s = finished(),
    n = correctSession(s, correction(s));
  assert.deepEqual(n.correctionLineage.at(-1).previous, s);
  assert.deepEqual(n.originalIntent, s.originalIntent);
  assert.deepEqual(
    n.occurrences[0].sets[0].target,
    s.occurrences[0].sets[0].target,
  );
  assert.equal(n.occurrences[0].sets[0].actual.reps.amount.value, 6);
});
test("ordinary finished writes still fail while audited corrections commit", async () => {
  const s = finished();
  s.revision = 1;
  await saveV2("v2WorkoutSessions", s, null);
  await assert.rejects(
    saveV2("v2WorkoutSessions", { ...s, revision: 2 }, 1),
    /immutable/,
  );
  const n = await correctHistory(s, correction(s));
  assert.equal(n.revision, 2);
  assert.equal(
    (await readV2("v2WorkoutSessions", s.id)).correctionLineage.length,
    1,
  );
});
test("correction rejects stale revisions", async () => {
  const s = finished();
  s.revision = 1;
  await saveV2("v2WorkoutSessions", s, null);
  await correctHistory(s, correction(s));
  await assert.rejects(
    correctHistory(s, correction(s)),
    /Invalid audited correction|Stale/,
  );
});
test("correction requires reason and cannot change template", () => {
  const s = finished();
  assert.throws(
    () => correctSession(s, { ...correction(s), reason: "" }),
    /reason/,
  );
  assert.throws(
    () => correctSession(s, { ...correction(s), type: "template" }),
    /Unsupported/,
  );
});
test("delayed response saves raw then separate classification without changing session", async () => {
  const s = finished();
  s.revision = 1;
  await saveV2("v2WorkoutSessions", s, null);
  const answers = {
    change: "baseline",
    functionChange: "no",
    repeatedWorsening: "no",
    notes: "Better",
  };
  const r = await recordResponse(s, answers, date);
  assert.equal(r.warning, null);
  assert.deepEqual(r.record.observations, answers);
  assert.equal(r.record.interpretation.status, "TOLERATED");
  assert.deepEqual(await readV2("v2WorkoutSessions", s.id), s);
  assert.ok((await listV2("v2GuidanceEvents")).length);
});
test("response missing answers remain pending", async () => {
  const s = finished();
  s.revision = 1;
  await saveV2("v2WorkoutSessions", s, null);
  const r = await recordResponse(s, { notes: "Unsure" }, date);
  assert.equal(r.record.interpretation.status, "PENDING_NEXT_DAY_RESPONSE");
});
test("report preserves target actual response unknown and no clearance", () => {
  const s = finished(),
    report = reportSession(s, { v2WorkoutSessions: [s] });
  assert.match(report, /target:.*8 count/);
  assert.match(report, /actual:.*7 count/);
  assert.match(report, /not yet recorded/);
  assert.match(report, /not medical clearance/);
});
test("planning conflicts are advisory and pure", () => {
  const p = schedule(intent(), date),
    other = schedule(intent(), date);
  p.snapshot.categories = ["Running"];
  other.snapshot.categories = ["Basketball Conditioning"];
  const before = structuredClone(p);
  const findings = evaluateGuidance(p, { date, plannedWorkouts: [other] }, at);
  assert.ok(findings.some((e) => e.ruleId === "schedule.high-low.planned.v1"));
  assert.deepEqual(p, before);
});
test("schema validates planning metadata and response date", () => {
  const p = schedule(intent(), date);
  p.planning.recurrence = {
    seriesId: "x",
    start: date,
    end: date,
    weekdays: [9],
    name: "x",
  };
  assert.throws(() => validateV2("v2PlannedWorkouts", p));
});
test("planning and audited corrections survive backup round trip", async () => {
  await createPlan(intent(), date);
  const s = finished();
  s.revision = 1;
  await saveV2("v2WorkoutSessions", s, null);
  await correctHistory(s, correction(s));
  const backup = await exportAll();
  await reset();
  await restoreBackup(backup);
  const d = await readTimeline();
  assert.equal(d.v2PlannedWorkouts.length, 1);
  assert.equal(d.v2WorkoutSessions[0].correctionLineage.length, 1);
});

test('legacy audited correction keeps original record and deduplicated corrected actuals',async()=>{
 const v1={id:'legacy-fact',date,createdAt:at,finishedAt:at,plannedItems:[{id:'bilateral-calf',name:'Calf',sets:1,reps:'8'}],exerciseLog:{'bilateral-calf':{sets:[{complete:true,reps:7,load:20}]}}};
 await put('sessions',v1);const s=await materializeLegacy(v1);await assert.rejects(saveV2('v2WorkoutSessions',{...s,revision:2},1),/correction/);
 const n=await correctHistory(s,correction(s));const data=await readTimeline();assert.deepEqual(data.sessions[0],v1);assert.equal(unified(data).length,1);assert.equal(actualRows(n)[0].actual.reps.amount.value,6);
});
test('workout-category context never allocates calf reps to running quantity',()=>{const s=finished();s.categories=['Running'];const rows=exposureRows([s]);const context=rows.find(r=>r.source.startsWith('workout context'));assert.deepEqual(context.actual,{});assert.ok(rows.find(r=>r.source==='performed occurrence').raw.attribution.includes('not allocated'));});
test('copied intent provenance survives into an independent session',async()=>{const p=await createPlan(intent(),date,undefined,{kind:'session',id:'older'});const s=await startPlanned(p,at);assert.equal(s.sourcePlanMetadata.copiedFrom.id,'older');assert.equal(actualRows(s).length,0);});

test('voided movement activity is not displayed as recorded activity',()=>{const settings=[{id:'movement-void',movementRecordSchemaVersion:1,kind:'activity',status:'voided',date,activityType:'walk',quantity:{durationMinutes:10}}];assert.equal(unified({settings}).length,0);});
test('actual set type correction preserves original target type',()=>{const s=finished();const c={...correction(s),actualType:known('rehab')};const n=correctSession(s,c);assert.equal(n.occurrences[0].sets[0].actualType.value,'rehab');assert.deepEqual(n.occurrences[0].sets[0].type,s.occurrences[0].sets[0].type);});
