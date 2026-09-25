import test from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import { closeDb, DB_NAME, getAll, put } from "../src/db.js";
import {
  saveV2,
  readV2,
  listV2,
  archiveDefinition,
} from "../src/persistence/v2Repository.js";
import {
  draftWriter,
  archiveDraft,
  updateTemplate,
} from "../src/persistence/compositionDraft.js";
import { validateV2 } from "../src/persistence/v2Validation.js";
import {
  DEFINITIONS,
  starterTemplates,
} from "../src/domain/v2/compositionContent.js";
import {
  emptyIntent,
  newDraft,
  fromTemplate,
  copyTemplate,
  copyCompleted,
  compose,
  customDefinition,
  targetNumber,
  known,
  tempo,
  TRACKING,
  filterDefinitions,
  FILTERS,
  facet,
  visibleTargetFields,
} from "../src/domain/v2/composition.js";
import { adaptSession } from "../src/domain/v2/adapters.ts";
import { legacy } from "./fixtures/v2/records.mjs";
const d = DEFINITIONS.find((d) => d.id === "bilateral-calf");
const populated = () => compose(emptyIntent(), { type: "add", definition: d });
const validate = (t) =>
  validateV2("v2PlannedWorkouts", newDraft(t, "2026-09-20"));
test.beforeEach(async () => {
  await closeDb();
  await new Promise((r, j) => {
    const q = indexedDB.deleteDatabase(DB_NAME);
    q.onsuccess = r;
    q.onerror = () => j(q.error);
  });
});
test.afterEach(() => closeDb());
test("composition saves template and draft link atomically; stale template leaves both unchanged", async () => {
  const p = newDraft(populated(), "2026-09-20");
  await saveV2("v2PlannedWorkouts", p, null);
  const w = draftWriter(p),
    t = await w.saveTemplate(p.snapshot);
  assert.equal((await readV2("v2PlannedWorkouts", p.id)).templateRef.id, t.id);
  await updateTemplate(t, { ...t, name: "Other template edit" });
  const before = await readV2("v2PlannedWorkouts", p.id);
  await assert.rejects(
    () => w.saveTemplate({ ...p.snapshot, name: "stale template attempt" }, t),
    /Stale revision/,
  );
  assert.deepEqual(await readV2("v2PlannedWorkouts", p.id), before);
  assert.equal(
    (await readV2("v2WorkoutTemplates", t.id)).name,
    "Other template edit",
  );
});
test("composition changing target format never hides previously entered values", () => {
  const t = populated(),
    o = t.occurrences[0];
  o.targetTrackingType = "time";
  o.sets[0].target.load = targetNumber("0", "lb");
  assert.deepEqual(visibleTargetFields(o), ["duration", "load"]);
});
test("composition blank draft persists as intent, without starting a session", async () => {
  const p = newDraft(emptyIntent(), "2026-09-20");
  await saveV2("v2PlannedWorkouts", p, null);
  assert.deepEqual(await readV2("v2PlannedWorkouts", p.id), p);
  assert.deepEqual(await listV2("v2WorkoutSessions"), []);
});
test("composition picker preserves all catalog identities, evidence and illustration metadata", () => {
  assert.ok(DEFINITIONS.length >= 174);
  assert.equal(new Set(DEFINITIONS.map((d) => d.id)).size, DEFINITIONS.length);
  const d = DEFINITIONS.find((d) => d.id === "library-tibialis-raise");
  assert.ok(d.media.some((m) => m.kind === "illustration"));
  assert.ok(d.media.some((m) => m.url));
  assert.ok(d.sourceMetadata.research);
  assert.ok(
    filterDefinitions(DEFINITIONS, "tibialis").some((e) => e.id === d.id),
  );
});
for (const key of Object.keys(FILTERS))
  test(`composition filter ${key} uses recorded metadata including unspecified`, () => {
    const options = [...new Set(DEFINITIONS.flatMap((d) => facet(d, key)))];
    for (const q of options)
      assert.ok(
        filterDefinitions(DEFINITIONS, "", { [key]: q }).every((d) =>
          facet(d, key).includes(q),
        ),
      );
    assert.deepEqual(
      filterDefinitions(DEFINITIONS, "", { [key]: "nonexistent" }),
      [],
    );
  });
test("composition duplicate exercise retains canonical identity but independent occurrence/set IDs and targets", () => {
  let t = populated();
  const id = t.occurrences[0].id;
  t = compose(t, { type: "duplicate", id });
  assert.equal(
    t.occurrences[0].exerciseDefinitionId,
    t.occurrences[1].exerciseDefinitionId,
  );
  assert.notEqual(t.occurrences[0].id, t.occurrences[1].id);
  assert.notEqual(t.occurrences[0].sets[0].id, t.occurrences[1].sets[0].id);
  t.occurrences[1].sets[0].target.reps = targetNumber("10", "count");
  assert.equal(t.occurrences[0].sets[0].target.reps, undefined);
  validate(t);
});
test("composition exercise move replace remove commands preserve unrelated targets", () => {
  let t = compose(populated(), { type: "add", definition: DEFINITIONS[0] });
  const second = t.occurrences[1].id;
  t = compose(t, { type: "move", id: second, delta: -1 });
  assert.equal(t.occurrences[0].id, second);
  t = compose(t, { type: "replace", id: second, definition: d });
  assert.notEqual(t.occurrences[0].id, second);
  t = compose(t, { type: "remove", id: t.occurrences[0].id });
  assert.equal(t.occurrences.length, 1);
  validate(t);
});
test("composition sets add remove reorder retain identities and types/sides", () => {
  let t = populated(),
    id = t.occurrences[0].id;
  t = compose(t, { type: "add-set", id });
  const sid = t.occurrences[0].sets[1].id;
  t = compose(t, {
    type: "set",
    id,
    setId: sid,
    patch: {
      type: known("rehab"),
      target: { side: known("left"), reps: targetNumber("0", "count") },
    },
  });
  t = compose(t, { type: "move-set", id, setId: sid, delta: -1 });
  assert.equal(t.occurrences[0].sets[0].id, sid);
  for (const type of ["warm-up", "working", "rehab"])
    for (const side of ["left", "right", "bilateral"]) {
      t = compose(t, {
        type: "set",
        id,
        setId: sid,
        patch: { type: known(type), target: { side: known(side) } },
      });
      validate(t);
    }
  t = compose(t, { type: "remove-set", id, setId: sid });
  assert.equal(t.occurrences[0].sets.length, 1);
});
test("composition quantities preserve zero, blank, units and structured tempo", () => {
  assert.equal(targetNumber("0", "kg").amount.value, 0);
  assert.equal(targetNumber("", "seconds").amount.state, "blank");
  assert.throws(() => targetNumber("-1", "lb"));
  assert.throws(() => targetNumber("NaN", "lb"));
  assert.equal(tempo(["3", "1", "X", "0"]).value, "3-1-X-0");
  assert.throws(() => tempo(["3", "", "1", "0"]));
  let t = populated();
  t.occurrences[0].sets[0].target = {
    reps: targetNumber("8", "count"),
    load: targetNumber("25", "kg"),
    duration: targetNumber("30", "seconds"),
    distance: targetNumber("10", "m"),
    rest: targetNumber("60", "seconds"),
    tempo: tempo(["3", "1", "X", "0"]),
    loadConvention: known("per-hand"),
  };
  validate(t);
});
for (const trackingType of Object.keys(TRACKING))
  test(`composition custom ${trackingType} definition remains unverified and usable`, async () => {
    const c = customDefinition({
      name: "Synthetic " + trackingType,
      categories: ["Strength", "Achilles Rehab"],
      equipment: ["custom-machine"],
      trackingType,
      notes: "fixture",
      tags: ["fixture"],
      demoUrl: "https://example.invalid/demo",
    });
    await saveV2("v2ExerciseDefinitions", c, null);
    assert.equal(c.demandLevel.state, "unknown");
    assert.equal(c.media[0].verification.value, "unverified-user-supplied");
    assert.deepEqual(
      [...c.supportedMetrics].sort(),
      [...TRACKING[trackingType]].sort(),
    );
    const p = newDraft(
      compose(emptyIntent(), { type: "add", definition: c }),
      "2026-09-20",
    );
    await saveV2("v2PlannedWorkouts", p, null);
    await archiveDefinition(c.id, 1);
    assert.equal(
      filterDefinitions(await listV2("v2ExerciseDefinitions")).length,
      0,
    );
    assert.equal(
      (await readV2("v2PlannedWorkouts", p.id)).snapshot.occurrences[0]
        .exerciseDefinitionId,
      c.id,
    );
  });
test("composition unsafe demo and missing custom names reject", () => {
  assert.throws(() => customDefinition({ name: "" }));
  assert.throws(() =>
    customDefinition({ name: "bad", demoUrl: "javascript:alert(1)" }),
  );
});
test("composition intervals keep ordered work/recovery and repeat count across copies", () => {
  let t = populated();
  t.occurrences[0].sets[0].repeatCount = 6;
  t.occurrences[0].sets[0].intervals = [
    {
      id: "w",
      order: 0,
      kind: "work",
      target: { duration: targetNumber("60", "seconds") },
    },
    {
      id: "r",
      order: 1,
      kind: "recovery",
      target: { duration: targetNumber("120", "seconds") },
    },
  ];
  validate(t);
  const copy = copyTemplate(t);
  assert.equal(copy.occurrences[0].sets[0].repeatCount, 6);
  assert.deepEqual(
    copy.occurrences[0].sets[0].intervals.map((b) => b.kind),
    ["work", "recovery"],
  );
  assert.notEqual(copy.occurrences[0].sets[0].intervals[0].id, "w");
});
test("composition superset/circuit grouping and ungrouping retain independent exercise order", () => {
  let t = populated();
  for (const kind of ["superset", "circuit"]) {
    t = compose(t, { type: "add-group", kind, name: kind });
    t = compose(t, {
      type: "group",
      id: t.occurrences[0].id,
      groupId: t.groups.at(-1).id,
    });
    validate(t);
  }
  const c = copyTemplate(t);
  assert.notEqual(c.occurrences[0].groupId, t.occurrences[0].groupId);
  t = compose(t, { type: "group", id: t.occurrences[0].id, groupId: "" });
  assert.equal(t.occurrences[0].groupId, undefined);
  validate(t);
});
test("composition all existing starter structures validate without personalized readiness", () => {
  const ts = starterTemplates();
  assert.ok(ts.some((t) => t.name.includes("Strength A")));
  assert.ok(ts.some((t) => t.name.includes("Achilles Rehab")));
  assert.ok(ts.some((t) => t.name.includes("Essential")));
  assert.ok(ts.some((t) => t.name === "Morning Reset"));
  ts.forEach(validate);
});
test("composition template save rename duplicate explicit update and draft independence", async () => {
  const t = { ...populated(), archived: false };
  await saveV2("v2WorkoutTemplates", t, null);
  const p = fromTemplate(t, "2026-09-20");
  await saveV2("v2PlannedWorkouts", p, null);
  p.snapshot.name = "Only this workout";
  await saveV2("v2PlannedWorkouts", { ...p, revision: 2 }, 1);
  assert.equal((await readV2("v2WorkoutTemplates", t.id)).name, t.name);
  await updateTemplate(t, p.snapshot);
  assert.equal(
    (await readV2("v2WorkoutTemplates", t.id)).name,
    "Only this workout",
  );
  assert.equal((await readV2("v2PlannedWorkouts", p.id)).revision, 2);
  await assert.rejects(
    () => updateTemplate(t, { ...p.snapshot, name: "stale" }),
    /Stale revision/,
  );
});
test("composition copying completed history never copies actuals, RPE, response or guidance", () => {
  for (const row of Object.values(legacy).filter((r) => r.exerciseLog)) {
    const s = adaptSession(row),
      before = structuredClone(s),
      t = copyCompleted(s);
    const inspect = (x) => {
      if (x && typeof x === "object") {
        for (const [k, v] of Object.entries(x)) {
          if (["definitionSnapshot"].includes(k)) continue;
          assert.ok(
            ![
              "actual",
              "symptoms",
              "quality",
              "rpe",
              "responses",
              "interpretations",
              "guidanceDecisions",
              "overrides",
              "completion",
              "disposition",
              "legacy",
            ].includes(k),
            k,
          );
          inspect(v);
        }
      }
    };
    inspect(t);
    assert.deepEqual(s, before);
    validate(t);
  }
});
test("composition draft queue commits rapid edits and resumes with independent same-day drafts", async () => {
  const p = newDraft(populated(), "2026-09-20");
  await saveV2("v2PlannedWorkouts", p, null);
  const w = draftWriter(p);
  w.save({ ...p.snapshot, name: "first" });
  w.save({ ...p.snapshot, name: "last" });
  const last = await w.flush();
  assert.equal(last.revision, 3);
  await closeDb();
  assert.equal((await readV2("v2PlannedWorkouts", p.id)).snapshot.name, "last");
  const other = newDraft(p.snapshot, p.date);
  await saveV2("v2PlannedWorkouts", other, null);
  assert.equal((await listV2("v2PlannedWorkouts")).length, 2);
});
test("composition stale autosave preserves both edits in recovery draft", async () => {
  const p = newDraft(populated(), "2026-09-20");
  await saveV2("v2PlannedWorkouts", p, null);
  await saveV2(
    "v2PlannedWorkouts",
    { ...p, revision: 2, snapshot: { ...p.snapshot, name: "other tab" } },
    1,
  );
  const messages = [],
    w = draftWriter(p, (m) => messages.push(m));
  w.save({ ...p.snapshot, name: "my unsaved edit" });
  const recovered = await w.flush();
  assert.notEqual(recovered.id, p.id);
  assert.equal(recovered.recoveredFrom, p.id);
  assert.equal(
    (await readV2("v2PlannedWorkouts", p.id)).snapshot.name,
    "other tab",
  );
  assert.equal(recovered.snapshot.name, "my unsaved edit");
  assert.ok(messages.some((m) => m.includes("recovery draft")));
});
test("composition discarded draft is archived without touching V1 draft or history", async () => {
  await put("settings", { id: "draft-2026-09-20", log: "untouched" });
  const p = newDraft(populated(), "2026-09-20");
  await saveV2("v2PlannedWorkouts", p, null);
  await archiveDraft(p);
  assert.equal(
    (await readV2("v2PlannedWorkouts", p.id)).composition.archived,
    true,
  );
  assert.equal((await getAll("settings"))[0].log, "untouched");
});
