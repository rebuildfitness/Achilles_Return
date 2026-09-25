import test from "node:test";
import assert from "node:assert/strict";
import {
  progressSummary,
  strengthSeries,
  metricTotals,
  categories,
  completedTraining,
} from "../src/domain/v2/progress.js";
import { GUIDE_PHASES, guideDefinitions } from "../src/domain/v2/rehabGuide.js";
import { DEFINITIONS } from "../src/domain/v2/compositionContent.js";
import {
  emptyIntent,
  occurrence,
  known,
  targetNumber,
} from "../src/domain/v2/composition.js";
import { startSession } from "../src/domain/v2/execution.js";
import { schedule } from "../src/domain/v2/planning.js";
import { evaluateGuidance } from "../src/domain/v2/guidance.js";
import {correctSession,priorCorrectionState} from '../src/domain/v2/corrections.js';
const date = "2026-09-21",
  q = (n, u = "count") => targetNumber(String(n), u);
function session() {
  const i = emptyIntent("Synthetic mixed");
  i.categories = ["Strength", "Running"];
  i.occurrences = [
    occurrence(DEFINITIONS.find((d) => d.id === "bilateral-calf")),
  ];
  const s = startSession(schedule(i, date), date + "T12:00:00Z");
  s.lifecycle = "completed";
  s.occurrences[0].sets[0].disposition = "completed";
  s.occurrences[0].sets[0].actual = {
    reps: q(8),
    load: q(20, "lb"),
    loadConvention: known("per-hand"),
  };
  return s;
}
const data = (s) => ({
  v2WorkoutSessions: s,
  sessions: [],
  settings: [],
  v2Observations: [],
});
const summary = (d) => progressSummary(d, "2026-09-01", date);
test("Final: multi-category workout frequency is one", () =>
  assert.equal(summary(data([session()])).frequency, 1));
test("Final: plans and copies never count as training", () =>
  assert.equal(
    summary({ ...data([]), v2PlannedWorkouts: [schedule(emptyIntent(), date)] })
      .frequency,
    0,
  ));
test("Final: abandoned zero-work excluded", () => {
  const s = session();
  s.lifecycle = "abandoned";
  assert.equal(summary(data([s])).frequency, 0);
});
test("Final: active training excluded from completed frequency", () => {
  const s = session();
  s.lifecycle = "in-progress";
  assert.equal(summary(data([s])).frequency, 0);
});
test("Final: partial retains only completed work", () => {
  const s = session();
  s.lifecycle = "partial";
  s.occurrences[0].sets.push({
    ...structuredClone(s.occurrences[0].sets[0]),
    id: "unperformed",
    disposition: "planned",
    actual: {},
  });
  assert.equal(summary(data([s])).strength[0].points.length, 1);
});
test("Final: repeated occurrences retain distinct points", () => {
  const s = session(),
    o = structuredClone(s.occurrences[0]);
  o.id = "repeat";
  o.sets[0].id = "repeat-set";
  s.occurrences.push(o);
  assert.equal(strengthSeries([s])[0].points.length, 2);
});
test("Final: target weights never become actual loads", () => {
  const s = session();
  s.occurrences[0].sets[0].actual = {};
  s.occurrences[0].sets[0].target = { load: q(100, "lb") };
  assert.equal(strengthSeries([s]).length, 0);
});
test("Final: zero is recorded while blank unknown and N/A are not zero", () => {
  const rows = [
    { actual: { distance: q(0, "m") } },
    ...["blank", "unknown", "not-applicable"].map((state) => ({
      actual: { distance: { amount: { state }, unit: known("m") } },
    })),
  ];
  assert.deepEqual(metricTotals(rows, "distance"), {
    covered: 1,
    total: 4,
    values: [{ unit: "m", amount: 0 }],
  });
});
test("Final: missing next-day response is not tolerated", () =>
  assert.equal(summary(data([session()])).responseCoverage.covered, 0));
test("Final: no strength quantities attributed to running category", () => {
  const r = summary(data([session()])).categories.find(
    (c) => c.label === "Running",
  );
  assert.equal(r.sessions, 1);
  assert.equal(r.distance.covered, 0);
  assert.equal(r.sets, 0);
});
test("Final: metadata not exercise name determines Achilles classification", () => {
  const d = structuredClone(DEFINITIONS[0]);
  d.name = known("Calf soleus Achilles");
  d.categories = [];
  d.sourceMetadata = {};
  assert.deepEqual(categories(d), []);
});
for (const convention of [
  "stack-reading",
  "bar-included",
  "assistance",
  "device-specific",
  "bodyweight",
  "total-external",
])
  test("Final: separate " + convention + " from per-hand", () => {
    const a = session(),
      b = session();
    b.occurrences[0].sets[0].actual.loadConvention = known(convention);
    assert.equal(strengthSeries([a, b]).length, 2);
  });
test("Final: unknown convention does not produce tonnage", () => {
  const s = session();
  delete s.occurrences[0].sets[0].actual.loadConvention;
  assert.equal(strengthSeries([s])[0].points[0].volume, undefined);
});
test("Final: setup differences are never merged", () => {
  const a = session(),
    b = session();
  b.occurrences[0].definitionSnapshot.setup = known("Different device");
  assert.equal(strengthSeries([a, b]).length, 2);
});
test("Final: left and right remain separate", () => {
  const a = session(),
    b = session();
  a.occurrences[0].sets[0].actual.side = known("left");
  b.occurrences[0].sets[0].actual.side = known("right");
  assert.equal(strengthSeries([a, b]).length, 2);
});
test("Final: units remain separate", () =>
  assert.equal(
    metricTotals(
      [
        { actual: { distance: q(1, "km") } },
        { actual: { distance: q(1, "mi") } },
      ],
      "distance",
    ).values.length,
    2,
  ));
test("Final: future and out-of-range sessions excluded", () => {
  const s = session();
  s.date = known("2027-01-01");
  assert.equal(summary(data([s])).frequency, 0);
});
test("Final: raw and interpreted symptoms stay distinct", () => {
  const d = data([]);
  d.v2Observations = [
    {
      id: "sym",
      kind: "symptom",
      activityDate: date,
      observations: { pain: 0 },
      interpretation: { concern: "unknown" },
    },
  ];
  assert.deepEqual(summary(d).symptoms[0].raw, { pain: 0 });
});
test("Final: materialized legacy precedence remains one workout", () => {
  const s = session();
  s.legacyOrigin = { id: "old", store: "sessions", revision: 0 };
  const d = data([s]);
  d.sessions = [{ id: "old", finishedAt: date + "T12:00:00Z", date }];
  assert.equal(completedTraining(d).length, 1);
});
test("Final: linked exposure is not extra workout frequency", () => {
  const a = session(),
    b = session();
  a.legacy = { raw: { linkedExposureIds: [b.id] } };
  assert.equal(completedTraining(data([a, b])).length, 1);
});
test("Final: nine educational phases contain source references", () => {
  assert.equal(GUIDE_PHASES.length, 9);
  assert.ok(
    GUIDE_PHASES.every((p) => p.sources.length && p.purpose && p.caution),
  );
});
for (const p of GUIDE_PHASES)
  test(
    "Final: " + p.name + " exercise options available without readiness",
    () => {
      const defs = guideDefinitions(p, DEFINITIONS);
      assert.ok(defs.length);
      assert.ok(defs.every((d) => d.id && d.media && d.provenance));
      assert.equal(JSON.stringify(p).includes("locked"), false);
    },
  );
test("Final: advanced exercise can be composed and analysis never mutates", () => {
  const d = guideDefinitions(GUIDE_PHASES[5], DEFINITIONS)[0],
    i = emptyIntent();
  i.occurrences = [occurrence(d)];
  const p = schedule(i, date),
    before = structuredClone(p);
  const findings = evaluateGuidance(p, { date }, date + "T12:00:00Z");
  assert.ok(findings.length);
  assert.deepEqual(p, before);
});
test("Final: saved legacy walking activity contributes measured distance without inventing completion timestamp", () => {
  const d = data([]);
  d.settings = [
    {
      id: "walk-record",
      movementRecordSchemaVersion: 1,
      kind: "activity",
      status: "saved",
      date,
      activityType: "walk",
      quantity: { durationMinutes: 10, distance: 1, distanceUnit: "km" },
      createdAt: date + "T12:00:00Z",
    },
  ];
  const r = summary(d);
  assert.equal(r.frequency, 1);
  assert.equal(
    r.categories.find((c) => c.label === "Walking").distance.values[0].amount,
    1,
  );
});
test("Final: calf and soleus metadata counted without inferring side", () => {
  const s = session();
  let r = summary(data([s]));
  assert.equal(r.calf.calf, 1);
  assert.equal(r.calf.sideKnown, 0);
  s.occurrences[0].definitionSnapshot = DEFINITIONS.find(
    (d) => d.id === "seated-calf",
  );
  r = summary(data([s]));
  assert.equal(r.calf.soleus, 1);
});
test("Final: linked exposure replacement does not double-count quantity", () => {
  const s = session();
  s.occurrences[0].definitionSnapshot.categories = ["Running"];
  s.occurrences[0].sets[0].actual = { distance: q(1, "km") };
  const d = data([s]);
  d.v2Observations = [
    {
      id: "ex",
      kind: "exposure",
      sessionId: s.id,
      occurrenceId: s.occurrences[0].id,
      activityDate: date,
      domain: known("running"),
      observations: {},
      actual: { distance: q(1, "km") },
    },
  ];
  assert.equal(
    summary(d).categories.find((c) => c.label === "Running").distance.values[0]
      .amount,
    1,
  );
});
test("Final: explicit cycling classification does not reclassify arbitrary custom names", () => {
  assert.ok(
    categories(
      DEFINITIONS.find((d) => d.id === "library-stationary-cycling"),
    ).includes("Cardiovascular Training"),
  );
  assert.deepEqual(
    categories({
      id: "custom-cycle",
      categories: [],
      sourceMetadata: {},
      name: known("Stationary cycling"),
    }),
    [],
  );
});
test('Final: repeated correction history grows linearly and every previous revision reconstructs exactly',()=>{let s=session();const originals=[];const base=JSON.stringify(s).length;for(let n=0;n<12;n++){originals.push(structuredClone(s));s=correctSession(s,{type:'notes',notes:'Correction '+n,reason:'Synthetic factual correction',id:'correction-'+n,at:date+'T12:00:00Z'})}for(let n=0;n<12;n++)assert.deepEqual(priorCorrectionState(s,n),originals[n]);assert.ok(JSON.stringify(s).length<base*15);console.log('Final correction bytes, base / twelve corrections:',base,JSON.stringify(s).length)});
