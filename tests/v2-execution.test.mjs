import test from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import { closeDb, DB_NAME } from "../src/db.js";
import { saveV2, readV2, listV2 } from "../src/persistence/v2Repository.js";
import { validateV2 } from "../src/persistence/v2Validation.js";
import {
  startSession,
  sessionCommand,
  sessionSummary,
  executionOrder,
  elapsedSeconds,
  restSeconds,
} from "../src/domain/v2/execution.js";
import {
  persistStart,
  sessionWriter,
  readRecovery,
} from "../src/persistence/sessionExecution.js";
import {
  emptyIntent,
  newDraft,
  compose,
  known,
  targetNumber,
  customDefinition,
  copyCompleted,
} from "../src/domain/v2/composition.js";
import {
  DEFINITIONS,
  starterTemplates,
} from "../src/domain/v2/compositionContent.js";
const def = DEFINITIONS.find((d) => d.id === "bilateral-calf");
const now = "2026-09-20T12:00:00Z";
const intent = () =>
  compose(emptyIntent("Test session"), { type: "add", definition: def });
const plan = () => newDraft(intent(), "2026-09-20");
const start = () => startSession(plan(), now);
const command = (s, type, extra = {}) =>
  sessionCommand(
    s,
    {
      type,
      id: s.occurrences[0].id,
      setId: s.occurrences[0].sets[0]?.id,
      ...extra,
    },
    now,
  );
const qty = (n, u = "count") => targetNumber(String(n), u);
const storage = () => {
  const m = new Map();
  return {
    setItem: (k, v) => m.set(k, v),
    getItem: (k) => m.get(k) || null,
    removeItem: (k) => m.delete(k),
  };
};
const interval = () => {
  const p = plan();
  p.snapshot.occurrences[0].sets[0].repeatCount = 6;
  p.snapshot.occurrences[0].sets[0].intervals = [
    {
      id: "work",
      order: 0,
      kind: "work",
      target: { duration: qty(60, "seconds") },
    },
    {
      id: "rest",
      order: 1,
      kind: "recovery",
      target: { duration: qty(120, "seconds") },
    },
  ];
  return startSession(p, now);
};
const group = (kind = "superset", sets = 2, rounds = 3) => {
  let t = intent();
  t = compose(t, { type: "duplicate", id: t.occurrences[0].id });
  t.groups = [{ id: "g", name: "Group", kind, rounds }];
  for (const o of t.occurrences) {
    o.groupId = "g";
    for (let i = o.sets.length; i < sets; i++)
      t = compose(t, { type: "add-set", id: o.id });
  }
  t.occurrences.forEach((o) => (o.groupId = "g"));
  return startSession(newDraft(t, "2026-09-20"), now);
};
test.beforeEach(async () => {
  await closeDb();
  await new Promise((r, j) => {
    const q = indexedDB.deleteDatabase(DB_NAME);
    q.onsuccess = r;
    q.onerror = () => j(q.error);
  });
});
test.afterEach(() => closeDb());
test("execution starts blank without manufactured performance", () => {
  const s = startSession(newDraft(emptyIntent(), "2026-09-20"), now);
  validateV2("v2WorkoutSessions", s);
  assert.equal(s.lifecycle, "in-progress");
  assert.equal(s.occurrences.length, 0);
  assert.deepEqual(s.responses, []);
});
test("start snapshot has independent session occurrence set identities and unchanged targets", () => {
  const p = plan();
  p.snapshot.occurrences[0].sets[0].target = {
    reps: qty(8),
    load: qty(185, "lb"),
  };
  const original = structuredClone(p);
  const s = startSession(p, now);
  assert.notEqual(s.id, p.id);
  assert.notEqual(s.occurrences[0].id, p.snapshot.occurrences[0].id);
  assert.notEqual(
    s.occurrences[0].sets[0].id,
    p.snapshot.occurrences[0].sets[0].id,
  );
  assert.deepEqual(s.occurrences[0].sets[0].actual, {});
  p.snapshot.occurrences[0].sets[0].target.reps = qty(99);
  assert.deepEqual(s.originalIntent.value, original.snapshot);
});
test("start is committed and custom graph errors cannot claim successful start", async () => {
  const p = plan();
  const s = await persistStart(p, now);
  assert.deepEqual(await readV2("v2WorkoutSessions", s.id), s);
  p.snapshot.occurrences[0].definitionSnapshot = customDefinition({
    name: "Custom",
    categories: [],
    equipment: [],
    trackingType: "reps",
  });
  p.snapshot.occurrences[0].exerciseDefinitionId =
    p.snapshot.occurrences[0].definitionSnapshot.id;
  await assert.rejects(() => persistStart(p, now), /Missing custom/);
  assert.equal((await listV2("v2WorkoutSessions")).length, 1);
});
for (const [label, actual] of Object.entries({
  strength: { reps: qty(7), load: qty(185, "lb") },
  time: { duration: qty(10, "minutes") },
  distance: { distance: qty(2, "km") },
  cardio: { duration: qty(20, "minutes"), distance: qty(5, "km") },
  repsTime: { reps: qty(10), duration: qty(40, "seconds") },
  feedback: {
    rpe: qty(7, "0–10"),
    symptoms: known("normal"),
    quality: known("controlled"),
    side: known("left"),
    tempo: known("3-1-X-0"),
    rest: qty(90, "seconds"),
  },
}))
  test(`actual ${label} remains separate and persists explicit units`, async () => {
    const s = command(start(), "actual", { actual });
    validateV2("v2WorkoutSessions", s);
    assert.deepEqual(s.occurrences[0].sets[0].actual, actual);
    assert.deepEqual(s.occurrences[0].sets[0].target, {});
    await saveV2("v2WorkoutSessions", s, null);
    assert.deepEqual(
      (await readV2("v2WorkoutSessions", s.id)).occurrences[0].sets[0].actual,
      actual,
    );
  });
test("complete never fills actuals from targets", () => {
  let s = start();
  s.occurrences[0].sets[0].target = { reps: qty(8) };
  s = command(s, "complete");
  assert.deepEqual(s.occurrences[0].sets[0].actual, {});
  assert.equal(s.occurrences[0].sets[0].disposition, "completed");
});
test("completed actual edits retain ID and before/after audit", () => {
  let s = command(start(), "actual", { actual: { reps: qty(8) } });
  s = command(s, "complete");
  const id = s.occurrences[0].sets[0].id;
  s = command(s, "actual", { actual: { reps: qty(7) } });
  assert.equal(s.occurrences[0].sets[0].id, id);
  assert.equal(s.execution.audit.at(-1).before.reps.amount.value, 8);
  assert.equal(s.execution.audit.at(-1).after.reps.amount.value, 7);
});
test("upcoming target edits and add/remove set preserve original intent", () => {
  let s = start();
  const original = structuredClone(s.originalIntent);
  s = command(s, "target", { patch: { target: { reps: qty(4) } } });
  s = command(s, "add-set");
  const next = s.occurrences[0].sets[1].id;
  s = command(s, "remove-set", { setId: next });
  assert.deepEqual(s.originalIntent, original);
  assert.equal(s.occurrences[0].sets.length, 1);
  s = command(s, "complete");
  assert.throws(() => command(s, "remove-set"), /Recorded/);
  assert.throws(
    () => command(s, "target", { patch: { target: {} } }),
    /upcoming/,
  );
});
test("replacement preserves completed old exercise and explicit future relationship", () => {
  let s = command(start(), "add-set");
  s = command(s, "actual", { actual: { reps: qty(8), load: qty(185, "lb") } });
  s = command(s, "complete");
  const old = structuredClone(s.occurrences[0]);
  s = command(s, "replace", {
    definition: DEFINITIONS.find((d) => d.id !== def.id),
  });
  assert.equal(s.occurrences.length, 2);
  assert.deepEqual(s.occurrences[0].sets[0], old.sets[0]);
  assert.equal(s.occurrences[0].sets[1].disposition, "skipped");
  assert.equal(s.occurrences[1].replacesOccurrenceId, old.id);
  assert.deepEqual(s.occurrences[1].sets[0].actual, {});
  assert.deepEqual(s.occurrences[1].sets[0].target, {});
});
test("repeated and added exercises are independent, duplication never copies actuals", () => {
  let s = command(start(), "actual", { actual: { reps: qty(8) } });
  s = command(s, "duplicate");
  assert.equal(s.occurrences[1].exerciseDefinitionId, def.id);
  assert.notEqual(s.occurrences[0].id, s.occurrences[1].id);
  assert.deepEqual(s.occurrences[1].sets[0].actual, {});
  assert.equal(s.occurrences[1].addedDuringSession, true);
  s = sessionCommand(s, { type: "add", definition: def });
  assert.equal(s.originalIntent.value.occurrences.length, 1);
  assert.equal(s.occurrences.length, 3);
});
test("unperformed reorder/remove works; recorded work cannot be removed", () => {
  let s = command(start(), "duplicate");
  const id = s.occurrences[1].id;
  s = sessionCommand(s, { type: "move", id, delta: -1 });
  assert.equal(s.occurrences[0].id, id);
  s = command(s, "remove");
  s = command(s, "complete");
  assert.throws(() => command(s, "remove"), /Recorded/);
});
test("interval repeats materialize independently and stopping after four leaves two unperformed", () => {
  let s = interval();
  const o = s.occurrences[0],
    set = o.sets[0];
  assert.equal(set.intervals.length, 12);
  for (const b of set.intervals.slice(0, 8))
    s = sessionCommand(
      s,
      { type: "complete", id: o.id, setId: set.id, boutId: b.id },
      now,
    );
  s = command(s, "stop-intervals");
  assert.equal(
    s.occurrences[0].sets[0].intervals.filter(
      (b) => b.disposition === "completed",
    ).length,
    8,
  );
  assert.ok(
    s.occurrences[0].sets[0].intervals
      .slice(8)
      .every((b) => b.disposition === "planned"),
  );
  assert.equal(s.occurrences[0].sets[0].disposition, "partial");
  assert.throws(() => command(s, "complete"), /each interval/);
  validateV2("v2WorkoutSessions", s);
});
test("interval actual edits, skipping and target updates retain all bout identities", () => {
  let s = interval();
  const b = s.occurrences[0].sets[0].intervals[0];
  s = command(s, "bout-target", {
    boutId: b.id,
    target: { duration: qty(45, "seconds") },
  });
  s = command(s, "actual", {
    boutId: b.id,
    actual: { duration: qty(40, "seconds") },
  });
  s = command(s, "skip", { boutId: b.id });
  assert.equal(s.occurrences[0].sets[0].intervals[0].disposition, "partial");
  assert.equal(
    s.occurrences[0].sets[0].intervals[0].actual.duration.amount.value,
    40,
  );
});
for (const kind of ["superset", "circuit"])
  test(`${kind} uses one set per round, not rounds multiplied by sets`, () => {
    const s = group(kind, 3, 3);
    assert.equal(s.occurrences[0].sets.length, 3);
    const rounds = executionOrder(s, s.execution.groups[0].id);
    assert.equal(rounds.length, 3);
    assert.ok(rounds.every((r) => r.steps.length === 2));
    assert.notEqual(rounds[0].steps[0].setId, rounds[1].steps[0].setId);
    validateV2("v2WorkoutSessions", s);
  });
test("group missing slots repeat last target and surplus sets remain additional", () => {
  assert.equal(group("circuit", 1, 3).occurrences[0].sets.length, 3);
  const s = group("circuit", 4, 2);
  assert.equal(s.occurrences[0].sets.length, 4);
  assert.equal(s.occurrences[0].sets[2].groupRound, undefined);
});
test("skip round and stop group preserve completed records", () => {
  let s = group();
  s = command(s, "actual", { actual: { reps: qty(8) } });
  s = command(s, "complete");
  s = sessionCommand(s, {
    type: "skip-round",
    groupId: s.execution.groups[0].id,
    round: 1,
  });
  assert.equal(s.occurrences[0].sets[0].disposition, "completed");
  assert.equal(s.occurrences[1].sets[0].disposition, "skipped");
  s = sessionCommand(s, {
    type: "stop-group",
    groupId: s.execution.groups[0].id,
  });
  assert.equal(s.occurrences[0].sets[2].disposition, "skipped");
});
test("skip exercise with partial actuals preserves work", () => {
  let s = command(start(), "actual", { actual: { reps: qty(4) } });
  s = command(s, "skip-exercise");
  assert.equal(s.occurrences[0].sets[0].disposition, "partial");
  assert.equal(sessionSummary(s).performedSets, 1);
});
test("completed, partial and abandoned lifecycle separate from delayed response", () => {
  let s = command(start(), "complete");
  s = command(s, "finish", { lifecycle: "completed" });
  assert.equal(s.lifecycle, "completed");
  assert.deepEqual(s.responses, []);
  assert.throws(() => command(s, "actual", { actual: {} }), /read-only/);
  let p = command(start(), "actual", { actual: { reps: qty(3) } });
  p = command(p, "finish", { lifecycle: "partial" });
  assert.equal(p.occurrences[0].sets[0].disposition, "planned");
  const a = command(start(), "finish", { lifecycle: "abandoned" });
  assert.equal(sessionSummary(a).performedSets, 0);
  assert.throws(
    () =>
      command(command(start(), "complete"), "finish", {
        lifecycle: "abandoned",
      }),
    /partial/,
  );
});
test("timers use session IDs, survive midnight and do not complete sets", () => {
  const p = plan();
  let a = startSession(p, "2026-09-20T23:59:00Z"),
    b = startSession(p, "2026-09-20T23:59:00Z");
  a = sessionCommand(
    a,
    {
      type: "rest-start",
      id: a.occurrences[0].id,
      setId: a.occurrences[0].sets[0].id,
      seconds: 120,
    },
    "2026-09-20T23:59:30Z",
  );
  assert.equal(elapsedSeconds(a, "2026-09-21T00:01:00Z"), 120);
  assert.equal(restSeconds(a, "2026-09-21T00:00:00Z"), 90);
  assert.equal(restSeconds(b, "2026-09-21T00:00:00Z"), 0);
  assert.equal(a.occurrences[0].sets[0].disposition, "planned");
});
test("two sessions same day persist and reopening preserves identity", async () => {
  const a = await persistStart(plan(), now),
    b = await persistStart(plan(), now);
  await closeDb();
  assert.equal((await listV2("v2WorkoutSessions")).length, 2);
  assert.notEqual(a.id, b.id);
  assert.equal((await readV2("v2WorkoutSessions", a.id)).startedAt.value, now);
});
test("autosave serializes commands and optimistic UI IDs equal committed IDs", async () => {
  const initial = await persistStart(plan(), now),
    w = sessionWriter(initial, () => {}, storage());
  const c = { type: "add", definition: def };
  const preview = sessionCommand(initial, c, now);
  await w.dispatch(c, now, preview);
  await w.dispatch({
    type: "actual",
    id: preview.occurrences[1].id,
    setId: preview.occurrences[1].sets[0].id,
    actual: { reps: qty(6) },
  });
  const saved = await w.flush();
  assert.equal(saved.occurrences[1].id, preview.occurrences[1].id);
  assert.equal(saved.occurrences[1].sets[0].actual.reps.amount.value, 6);
  assert.equal(saved.revision, 3);
});
test("stale edit retains recovery journal without duplicate training or overwriting newer actuals", async () => {
  const initial = await persistStart(plan(), now),
    cache = storage();
  const a = sessionWriter(initial, () => {}, cache),
    b = sessionWriter(initial, () => {}, cache);
  await a.dispatch({ type: "notes", notes: "newer" });
  await a.flush();
  await b.dispatch({ type: "notes", notes: "stale" });
  await assert.rejects(() => b.flush(), /Stale/);
  assert.equal(
    (await readV2("v2WorkoutSessions", initial.id)).execution.notes,
    "newer",
  );
  assert.equal(
    readRecovery(initial.id, cache).commands[0].command.notes,
    "stale",
  );
  assert.equal((await listV2("v2WorkoutSessions")).length, 1);
  await assert.rejects(() => b.retry(), /newer/);
});
test("repository prevents finished history mutation and original intent rewriting", async () => {
  const s = await persistStart(plan(), now);
  await assert.rejects(
    () =>
      saveV2(
        "v2WorkoutSessions",
        { ...s, originalIntent: known(emptyIntent("changed")), revision: 2 },
        1,
      ),
    /immutable/,
  );
  const finished = {
    ...command(s, "finish", { lifecycle: "abandoned" }),
    revision: 2,
  };
  await saveV2("v2WorkoutSessions", finished, 1);
  await assert.rejects(
    () => saveV2("v2WorkoutSessions", { ...finished, revision: 3 }, 2),
    /immutable/,
  );
});
test("custom additions retain unverified media, source metadata and original intent", async () => {
  const d = customDefinition({
    name: "Custom rehab",
    categories: [],
    equipment: ["weighted-wagon"],
    trackingType: "distance-time",
    demoUrl: "https://example.com/demo",
  });
  await saveV2("v2ExerciseDefinitions", d, null);
  let s = sessionCommand(start(), { type: "add", definition: d }, now);
  await saveV2("v2WorkoutSessions", s, null);
  assert.equal(s.occurrences[1].definitionSnapshot.provenance.origin, "custom");
  assert.deepEqual(s.occurrences[1].definitionSnapshot.equipment, [
    "weighted-wagon",
  ]);
  assert.equal(s.originalIntent.value.occurrences.length, 1);
});
test("all curated starters instantiate valid snapshots without planner eligibility", () => {
  for (const t of starterTemplates()) {
    const p = newDraft(t, "2026-09-20"),
      s = startSession(p, now);
    validateV2("v2WorkoutSessions", s);
    assert.deepEqual(s.originalIntent.value, p.snapshot);
  }
});
test("copy completed execution excludes actual performance", () => {
  const s = command(
    command(start(), "actual", { actual: { reps: qty(99) } }),
    "complete",
  );
  const t = copyCompleted(s);
  assert.equal(t.occurrences[0].sets[0].actual, undefined);
  const next = startSession(newDraft(t, "2026-09-20"), now);
  assert.deepEqual(next.occurrences[0].sets[0].actual, {});
});
test("copy interval history preserves one planned sequence, not expanded repeats multiplied again", () => {
  const s = interval();
  const t = copyCompleted(s);
  assert.equal(t.occurrences[0].sets[0].intervals.length, 2);
  assert.equal(
    startSession(newDraft(t, "2026-09-20"), now).occurrences[0].sets[0]
      .intervals.length,
    12,
  );
});
test("notes, symptom answers and load setup alone do not manufacture performed volume", () => {
  let s = command(start(), "actual", {
    actual: {
      notes: known("not attempted"),
      symptoms: known("normal"),
      load: qty(100, "lb"),
    },
  });
  assert.equal(sessionSummary(s).performedSets, 0);
  s = command(s, "finish", { lifecycle: "abandoned" });
  assert.equal(s.lifecycle, "abandoned");
});
test("removing unperformed work dismisses its rest timer without orphan references", () => {
  let s = command(start(), "rest-start", { seconds: 60 });
  s = command(s, "remove-set");
  assert.equal(s.execution.restTimer, null);
  validateV2("v2WorkoutSessions", s);
});
test("removing unperformed replacement preserves original work and audited relationship", () => {
  let s = command(start(), "complete");
  s = command(s, "replace", { definition: def });
  const id = s.occurrences[1].id;
  s = sessionCommand(s, { type: "remove", id }, now);
  assert.equal(s.occurrences.length, 1);
  assert.equal(s.occurrences[0].sets[0].disposition, "completed");
  validateV2("v2WorkoutSessions", s);
  assert.ok(s.execution.audit.some((a) => a.type === "replace"));
});
test("corrupt execution linkage and duplicated bout identity are rejected", () => {
  let s = interval();
  s.occurrences[0].replacesOccurrenceId = "missing";
  assert.throws(() => validateV2("v2WorkoutSessions", s), /replacement/);
  s = interval();
  s.occurrences[0].sets[0].intervals[1].id =
    s.occurrences[0].sets[0].intervals[0].id;
  assert.throws(() => validateV2("v2WorkoutSessions", s), /duplicate/);
});
test("new interval set contains fresh planned repeats and no copied actuals", () => {
  let s = interval();
  const id = s.occurrences[0].sets[0].intervals[0].id;
  s = command(s, "actual", {
    boutId: id,
    actual: { duration: qty(55, "seconds") },
  });
  s = command(s, "add-set");
  assert.equal(s.occurrences[0].sets[1].intervals.length, 12);
  assert.ok(
    s.occurrences[0].sets[1].intervals.every(
      (b) => !Object.keys(b.actual).length,
    ),
  );
  validateV2("v2WorkoutSessions", s);
});
