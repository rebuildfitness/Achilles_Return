import test from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import {
  evaluateGuidance,
  benchmarkStatuses,
  isCurrentGuidance,
  legacyEvidence,
  prioritize,
  occurrenceDomains,
} from "../src/domain/v2/guidance.js";
import {
  emptyIntent,
  compose,
  newDraft,
  known,
  targetNumber,
  customDefinition,
} from "../src/domain/v2/composition.js";
import { DEFINITIONS } from "../src/domain/v2/compositionContent.js";
import { startSession, sessionCommand } from "../src/domain/v2/execution.js";
import {
  analyzeGuidance,
  decideGuidance,
  proposalEdit,
} from "../src/persistence/guidance.js";
import { saveV2, readV2, listV2 } from "../src/persistence/v2Repository.js";
import { validateV2 } from "../src/persistence/v2Validation.js";
import { put, closeDb, DB_NAME, exportAll } from "../src/db.js";
import { classifyReadiness } from "../src/rules/readiness.js";
import { runningCriteria } from "../src/rules/baseline.js";
import { CATALOG, EQUIPMENT } from "../src/data/catalog.js";
import { strengthTemplate, modifyWorkout } from "../src/rules/planner.js";
import { baselineValues } from "./fixtures.mjs";
const at = "2026-09-20T15:00:00.000Z",
  date = "2026-09-20";
const def = DEFINITIONS.find((d) => d.id === "bilateral-calf");
const qty = (n, u = "count") => targetNumber(String(n), u);
const green = {
  pain: "none",
  stiffness: "normal",
  swelling: "normal",
  previousResponse: "good",
  recovery: "good",
  unusualSymptoms: [],
};
const values = {
  noDailyPain: "yes",
  noRehabPain: "yes",
  gait: "normal",
  function_5: "normal",
  heel_repaired_reps: 10,
  heelQuality: "yes",
  goodBalance: "yes",
  psychReady: "yes",
  clearance: "yes",
  noRestrictions: "yes",
  bilateralSafe: "yes",
  bilateralTen: "yes",
};
const ctx = () => ({
  date,
  assessment: { id: "a", completedAt: "2026-09-19T10:00:00Z", values },
  checkIn: { answers: green },
  previousSessions: [],
  observations: [],
});
function plan(d = def) {
  const t = compose(emptyIntent("Guidance test"), {
    type: "add",
    definition: d,
  });
  t.occurrences[0].sets[0].target = {
    reps: qty(10),
    load: qty(20, "lb"),
    loadConvention: known("total-external"),
  };
  return newDraft(t, date);
}
const evaluate = (p = plan(), c = ctx()) => evaluateGuidance(p, c, at);
const history = () => ({
  id: "previous",
  date: "2026-09-19",
  createdAt: "2026-09-19T10:00:00Z",
  status: "TOLERATED",
  plannedItems: [{ ...def.sourceMetadata, id: def.id, sets: 1, reps: "10" }],
  exerciseLog: {
    [def.id]: {
      sets: [
        {
          complete: true,
          reps: 10,
          load: 20,
          rpe: 7,
          quality: "good",
          symptoms: "none",
        },
      ],
    },
  },
});
test.beforeEach(async () => {
  await closeDb();
  await new Promise((r, j) => {
    const q = indexedDB.deleteDatabase(DB_NAME);
    q.onsuccess = r;
    q.onerror = j;
  });
});
test("empty workout with no concerns has no findings", () =>
  assert.deepEqual(evaluate(newDraft(emptyIntent(), date), {}), []));
test("pure evaluation preserves all raw inputs and selected work", () => {
  const p = plan(),
    c = ctx(),
    a = structuredClone([p, c]);
  evaluate(p, c);
  assert.deepEqual([p, c], a);
});
test("red flag parity retains stop advice and raw symptom", () => {
  const c = ctx();
  c.checkIn.answers = { ...green, unusualSymptoms: ["sharp-pain"] };
  const e = evaluate(plan(), c)[0];
  assert.equal(classifyReadiness(c.checkIn.answers).level, "RED");
  assert.equal(e.level, "STRONG_WARNING");
  assert.match(e.explanation, /Stop Achilles loading/);
  assert.deepEqual(e.inputs.context.checkIn.answers, c.checkIn.answers);
});
for (const pain of ["mild", "moderate", "significant"])
  test("existing " + pain + " symptom becomes caution", () => {
    const c = ctx();
    c.checkIn.answers = { ...green, pain };
    assert.equal(evaluate(plan(), c)[0].level, "CAUTION");
  });
test("incomplete check-in cannot imply stable readiness", () =>
  assert.ok(
    evaluate(plan(), { checkIn: { answers: {} }, date }).some((e) =>
      e.missingInputs.includes("current check-in"),
    ),
  ));
test("missing baseline is uncertainty not failed test", () => {
  const e = evaluate(plan(), {}).find(
    (e) => e.ruleId === "baseline.context.v1",
  );
  assert.equal(e.level, "INFORMATION");
  assert.equal(e.benchmarks[0].status, "not-tested");
});
test("benchmark raw zero differs from not tested and conflicting answers", () => {
  assert.equal(
    benchmarkStatuses({ heel_repaired_reps: 0, heelQuality: "yes" }).find(
      (b) => b.id === "heel-rise",
    ).status,
    "not-yet-met",
  );
  assert.equal(
    benchmarkStatuses({}).find((b) => b.id === "heel-rise").status,
    "not-tested",
  );
  assert.equal(
    benchmarkStatuses({ noDailyPain: "yes", walkPain: 1 })[0].status,
    "unknown",
  );
});
test("running benchmark interpretations preserve rule parity", () => {
  assert.deepEqual(
    benchmarkStatuses(values)
      .slice(0, 7)
      .map((b) => b.passed),
    runningCriteria(values).map((b) => b.passed),
  );
});
test("custom exercise classification unknown even user-added running category", () => {
  const p = plan(
    customDefinition({ name: "Custom running", categories: ["Running"] }),
  );
  const e = evaluate(p);
  assert.ok(e.some((e) => e.ruleId === "exercise.custom-context.v1"));
  assert.equal(
    e.some((e) => e.ruleId === "running.entry.v1"),
    false,
  );
});
test("phase context is not mistaken for performing running", () =>
  assert.deepEqual(occurrenceDomains(plan().snapshot.occurrences[0]), []));
test("phase mismatch is advisory and leaves selection intact", () => {
  const p = plan({ ...def, phaseAssociations: ["Plyometrics"] });
  const c = { ...ctx(), rehabPhase: "Foundational Strength" };
  assert.ok(
    evaluate(p, c).some((e) => e.ruleId === "exercise.phase-context.v1"),
  );
  assert.equal(p.snapshot.occurrences.length, 1);
  assert.ok(startSession(p, at).id);
});
for (const category of [
  "Running",
  "Jumping & Landing",
  "Plyometrics",
  "Acceleration",
  "Sprinting",
  "Deceleration",
  "Change of Direction / Agility",
  "Basketball Conditioning",
  "Basketball Skill Exposure",
  "Soccer",
])
  test(
    category + " receives distinct contextual domain finding without blocking",
    () => {
      const p = plan({ ...def, categories: [category] });
      const es = evaluate(p, { date });
      assert.ok(es.some((e) => e.domain === category));
      assert.equal(startSession(p, at).occurrences.length, 1);
    },
  );
test("spacing uses existing evaluator and never moves workout", () => {
  const p = plan({ ...def, categories: ["Running"] });
  const c = ctx();
  c.previousSessions = [
    {
      id: "r",
      domain: "running",
      date,
      exposureLevel: "R1",
      status: "TOLERATED",
    },
  ];
  assert.ok(evaluate(p, c).some((e) => e.ruleId === "schedule.high-low.v1"));
  assert.equal(p.date, date);
});
test("existing double-contact ladder rule remains caution/review not invented dose", () => {
  const p = plan({ ...def, categories: ["Jumping & Landing"] });
  const c = ctx();
  c.checkpoints = {
    calfCapacity: "yes",
    calfCapacity_date: date,
    calfCapacity_evidence: "review",
    lowElastic: "yes",
    lowElastic_date: date,
    lowElastic_evidence: "review",
  };
  c.previousSessions = [
    {
      id: "j",
      domain: "jumping",
      exposureLevel: "J0",
      date: "2026-09-18",
      status: "TOLERATED",
      movementQuality: "good",
      contacts: 27,
    },
  ];
  const es = evaluate(p, c);
  assert.ok(es.some((e) => e.explanation.includes("double")));
  assert.equal(p.snapshot.occurrences[0].sets.length, 1);
});
test("delayed response unknown does not overwrite completed lifecycle", () => {
  let s = startSession(plan(), at);
  const o = s.occurrences[0];
  s = sessionCommand(
    s,
    { type: "complete", id: o.id, setId: o.sets[0].id },
    at,
  );
  s = sessionCommand(s, { type: "finish", lifecycle: "completed" }, at);
  const e = evaluate(s, ctx());
  assert.ok(e.some((e) => e.ruleId === "response.pending.v1"));
  assert.equal(s.lifecycle, "completed");
  assert.deepEqual(s.responses, []);
});
test("explicit response interpretations preserve raw exposure", () => {
  const c = ctx();
  c.observations = [
    {
      id: "response",
      kind: "response",
      observations: { change: "meaningful", notes: "raw" },
    },
    { id: "exposure", kind: "exposure", observations: { contacts: 0 } },
  ];
  const before = structuredClone(c);
  assert.ok(evaluate(plan(), c).some((e) => e.interpretation === "BORDERLINE"));
  assert.deepEqual(c, before);
});
test("strength progression is a proposal and not a load write", () => {
  const p = plan(),
    c = ctx();
  c.previousSessions = [history()];
  const e = evaluate(p, c).find(
    (e) => e.ruleId === "strength.double-progression.v1",
  );
  assert.equal(e.level, "RECOMMENDATION");
  assert.equal(e.proposal.kind, "edit-target");
  assert.equal(p.snapshot.occurrences[0].sets[0].target.load.amount.value, 20);
});
test("no progression proposal without explicit next-day tolerance", () => {
  const c = ctx();
  c.previousSessions = [{ ...history(), status: "PENDING_NEXT_DAY_RESPONSE" }];
  assert.equal(
    evaluate(plan(), c).some(
      (e) => e.ruleId === "strength.double-progression.v1",
    ),
    false,
  );
});
test("equipment availability does not alias ownership and wagon is not sled", () => {
  const d = { ...def, equipment: ["weighted-wagon"] };
  const c = {
    ...ctx(),
    equipment: {
      owned: ["weighted-wagon"],
      availableToday: [],
      preferred: ["training-sled"],
    },
  };
  const e = evaluate(plan(d), c);
  assert.ok(e.some((e) => e.ruleId === "equipment.available.v1"));
  assert.ok(e.some((e) => e.ruleId === "equipment.wagon.v1"));
  assert.deepEqual(d.equipment, ["weighted-wagon"]);
});
test("revision or context changes invalidate old advice", () => {
  const p = plan(),
    c = ctx(),
    e = evaluate(p, c)[0] || evaluate(p, {})[0];
  const context = e.inputs.context;
  assert.ok(isCurrentGuidance(e, p, context));
  assert.ok(!isCurrentGuidance(e, { ...p, revision: 2 }, context));
  assert.ok(!isCurrentGuidance(e, p, { ...context, changed: true }));
});
test("deduplication prioritizes strongest findings", () => {
  const es = [
    { dedupKey: "a", level: "INFORMATION" },
    { dedupKey: "b", level: "STRONG_WARNING" },
    { dedupKey: "a", level: "INFORMATION" },
  ];
  assert.deepEqual(
    prioritize(es).map((e) => e.dedupKey),
    ["b", "a"],
  );
});
test("occurrence-linked findings preserve repeated exercises", () => {
  let p = plan({ ...def, phaseAssociations: ["Plyometrics"] });
  p.snapshot = compose(p.snapshot, {
    type: "duplicate",
    id: p.snapshot.occurrences[0].id,
  });
  const e = evaluate(p, { ...ctx(), rehabPhase: "Running" }).filter(
    (e) => e.ruleId === "exercise.phase-context.v1",
  );
  assert.equal(new Set(e.map((e) => e.occurrenceId)).size, 2);
});
test("legacy projection does not synthesize tolerance or collapse repeated work", () => {
  let p = plan();
  p.snapshot = compose(p.snapshot, {
    type: "duplicate",
    id: p.snapshot.occurrences[0].id,
  });
  const s = startSession(p, at);
  s.lifecycle = "partial";
  const rows = legacyEvidence([s]);
  assert.equal(rows.length, 2);
  assert.notEqual(rows[0].id, rows[1].id);
  assert.ok(rows.every((r) => r.status === "PENDING_NEXT_DAY_RESPONSE"));
});
test("persisted warning override is separate from clearance and unchanged subject", async () => {
  const p = plan();
  await saveV2("v2PlannedWorkouts", p, null);
  await put("checkins", {
    id: date,
    answers: { ...green, unusualSymptoms: ["sharp-pain"] },
  });
  const a = await analyzeGuidance(p, date, at),
    e = a.events.find((e) => e.level === "STRONG_WARNING");
  const r = await decideGuidance(p, e, "continued-anyway", a);
  assert.equal(r.decision.action, "continued-anyway");
  assert.equal("clearance" in r.decision, false);
  assert.deepEqual(await readV2("v2PlannedWorkouts", p.id), p);
  const b = await analyzeGuidance(p, date, "2026-09-20T16:00:00Z");
  assert.equal(b.events.find((e) => e.level === "STRONG_WARNING").id, e.id);
  assert.equal((await listV2("v2GuidanceDecisions")).length, 1);
  assert.throws(() =>
    validateV2("v2GuidanceDecisions", { ...r.decision, clearance: true }),
  );
});
async function recommendation() {
  const p = plan();
  await saveV2("v2PlannedWorkouts", p, null);
  await put("checkins", { id: date, answers: green });
  await put("assessments", ctx().assessment);
  await put("sessions", history());
  const a = await analyzeGuidance(p, date, at);
  return {
    p,
    a,
    e: a.events.find((e) => e.ruleId === "strength.double-progression.v1"),
  };
}
test("explicit Apply atomically changes intended set and records audit", async () => {
  const { p, a, e } = await recommendation();
  const before = structuredClone(p);
  const r = await decideGuidance(p, e, "accepted", a, {
    setId: p.snapshot.occurrences[0].sets[0].id,
    amount: 22,
  });
  assert.equal(
    r.subject.snapshot.occurrences[0].sets[0].target.load.amount.value,
    22,
  );
  assert.equal(r.subject.revision, 2);
  assert.equal(r.subject.composition.audit[0].guidanceId, e.id);
  assert.deepEqual(p, before);
  assert.equal((await listV2("v2GuidanceDecisions"))[0].action, "accepted");
});
test("decline leaves workout unchanged", async () => {
  const { p, a, e } = await recommendation();
  await decideGuidance(p, e, "declined", a);
  assert.deepEqual(await readV2("v2PlannedWorkouts", p.id), p);
});
test("dismiss recommendation persists supported action", async () => {
  const { p, a, e } = await recommendation();
  await decideGuidance(p, e, "dismissed", a);
  assert.equal((await listV2("v2GuidanceDecisions"))[0].action, "dismissed");
});
test("stale subject rejects apply and decision together", async () => {
  const { p, a, e } = await recommendation();
  await saveV2("v2PlannedWorkouts", { ...p, revision: 2 }, 1);
  await assert.rejects(
    decideGuidance(p, e, "accepted", a, {
      setId: p.snapshot.occurrences[0].sets[0].id,
      amount: 25,
    }),
    /Stale/,
  );
  assert.equal((await listV2("v2GuidanceDecisions")).length, 0);
});
test("changed symptom inputs reject previously reviewed proposal", async () => {
  const { p, a, e } = await recommendation();
  await put("checkins", {
    id: date,
    answers: { ...green, pain: "significant" },
  });
  await assert.rejects(
    decideGuidance(p, e, "accepted", a, {
      setId: p.snapshot.occurrences[0].sets[0].id,
      amount: 25,
    }),
    /Stale/,
  );
  assert.deepEqual(await readV2("v2PlannedWorkouts", p.id), p);
});
test("completed work cannot be changed by a load proposal", () => {
  let s = startSession(plan(), at);
  const o = s.occurrences[0];
  s = sessionCommand(
    s,
    { type: "complete", id: o.id, setId: o.sets[0].id },
    at,
  );
  assert.throws(
    () =>
      proposalEdit(
        s,
        {
          id: "g",
          proposal: { kind: "edit-target", targetId: o.id, metric: "load" },
        },
        { setId: o.sets[0].id, amount: 25 },
        at,
      ),
    /recorded|performed|Upcoming/i,
  );
});
test("guidance and overrides participate in backup", async () => {
  const { p, a, e } = await recommendation();
  await decideGuidance(p, e, "deferred", a);
  const b = await exportAll();
  assert.match(JSON.stringify(b), /v2GuidanceDecisions/);
  assert.match(JSON.stringify(b), /deferred/);
});
test("exercise path milestone yields review proposal without mutation", () => {
  const d = DEFINITIONS.find((d) => d.id === "db-bench"),
    p = plan(d),
    c = ctx();
  c.equipment = { owned: EQUIPMENT };
  c.previousSessions = [
    {
      ...history(),
      plannedItems: [{ ...CATALOG.dbBench, id: d.id, sets: 1, reps: "10" }],
      exerciseLog: {
        [d.id]: {
          sets: [
            {
              complete: true,
              reps: 10,
              load: 50,
              rpe: 7,
              quality: "good",
              symptoms: "none",
            },
          ],
        },
      },
    },
  ];
  const before = structuredClone(p);
  const e = evaluate(p, c).find((e) => e.ruleId === "exercise-path.review.v1");
  assert.ok(e);
  assert.equal(e.proposal.kind, "replace");
  assert.deepEqual(p, before);
});
test("rehab block advancement is an unapplied proposal", () => {
  const v = baselineValues(),
    workout = modifyWorkout(
      strengthTemplate("B", v, "conditioning"),
      "GREEN",
      EQUIPMENT,
    );
  const prior = {
    id: "rehab",
    date: "2026-09-18",
    createdAt: "2026-09-18T12:00:00Z",
    sessionFormat: "rehab-conditioning",
    templateVersion: "2.0.0",
    readiness: { level: "GREEN" },
    status: "TOLERATED",
    plannedItems: workout.items,
    exerciseLog: Object.fromEntries(
      workout.items.map((e) => [
        e.id,
        {
          sets: Array.from({ length: e.sets }, () => ({
            complete: true,
            reps: Number(
              e.reps.match(/\d+[–-](\d+)/)?.[1] || e.reps.match(/\d+/)?.[0],
            ),
            rpe: 7,
            quality: "good",
            symptoms: "none",
          })),
        },
      ]),
    ),
  };
  const p = plan(DEFINITIONS.find((d) => d.id === "single-calf"));
  const c = {
    ...ctx(),
    assessment: { values: v, completedAt: "2026-09-19T10:00:00Z" },
    previousSessions: [prior],
    rehabWorkout: workout,
  };
  const before = structuredClone(p);
  const e = evaluate(p, c).find((e) => e.ruleId === "rehab-block.review.v1");
  assert.ok(e);
  assert.equal(e.proposal.definitionId, "calf-dumbbell-single");
  assert.deepEqual(p, before);
});
test("planned contact increase is reviewed using existing contact rule", () => {
  const p = plan();
  p.snapshot.categories = ["Plyometrics"];
  p.snapshot.occurrences[0].sets[0].target.contacts = qty(60);
  const c = ctx();
  c.previousSessions = [
    {
      id: "j",
      date: "2026-09-18",
      domain: "jumping",
      createdAt: "2026-09-18T10:00:00Z",
      status: "TOLERATED",
      contacts: 30,
    },
  ];
  assert.ok(
    evaluate(p, c).some((e) => e.ruleId === "exposure.contact-increase.v1"),
  );
});
test("current raw set symptoms retain meaning without rewriting observations", () => {
  let s = startSession(plan(), at);
  const o = s.occurrences[0];
  s = sessionCommand(
    s,
    {
      type: "actual",
      id: o.id,
      setId: o.sets[0].id,
      actual: { symptoms: known("sharp-pain") },
    },
    at,
  );
  const before = structuredClone(s);
  assert.ok(evaluate(s, ctx()).some((e) => e.level === "STRONG_WARNING"));
  assert.deepEqual(s, before);
});

test("mixed explicit rep targets do not fall back to an outdated source prescription", async () => {
  const { legacyPrescription } = await import('../src/domain/v2/guidance.js');
  const p = plan(); const o = p.snapshot.occurrences[0];
  o.targetDescription = known('8');
  o.sets = [structuredClone(o.sets[0]), structuredClone(o.sets[0])];
  o.sets[0].target.reps = qty(8); o.sets[1].target.reps = qty(5);
  assert.equal(legacyPrescription(o).reps, undefined);
});
test("grouped contact totals stay uncertain rather than silently ignoring rounds", () => {
  const p = plan(); p.snapshot.categories = ['Plyometrics'];
  p.snapshot.groups = [{id:'circuit',kind:'circuit',name:'Circuit',rounds:3}];
  p.snapshot.occurrences[0].groupId = 'circuit';
  p.snapshot.occurrences[0].sets[0].target.contacts = qty(30);
  assert.ok(evaluate(p, ctx()).some(e => e.ruleId === 'exposure.contacts-unknown.v1'));
});
