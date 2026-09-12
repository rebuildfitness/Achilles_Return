import test from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import {
  movementRecords,
  movementTotals,
  validateMovement,
  movementResponse,
} from "../src/data/movement.js";
import {
  MOVEMENT_ROUTINES,
  MOVEMENT_EXERCISES,
  createRoutineInstance,
  routineAvailability,
  actualFromDose,
} from "../src/data/movementRoutines.js";
import {
  loadMovement,
  saveMovementDraft,
  commitMovement,
  undoMovement,
  removeMovement,
} from "../src/persistence/movement.js";
import { put, get, exportAll, restoreBackup } from "../src/db.js";
import { migrateBackup } from "../src/persistence/schema.js";

const draft = (id, changes = {}) => ({
  id: `movement-${id}`,
  kind: "activity",
  movementRecordSchemaVersion: 1,
  date: "2026-09-12",
  status: "draft",
  revision: 1,
  activityType: "walk",
  quantity: { steps: 8000 },
  createdAt: "2026-09-12T10:00:00Z",
  ...changes,
});

test("legacy recovery projection is nondestructive, deterministic and never resurrects a removed activity", () => {
  const row = {
    id: "recovery-2026-09-10",
    date: "2026-09-10",
    entries: [
      {
        id: "bike",
        activity: "cycle-25",
        distance: "7.5",
        unit: "miles",
        notes: "Easy",
      },
      { id: "mixed", activity: "mobility", mobility: ["dead-bug", "balance"] },
    ],
  };
  const original = structuredClone(row),
    projected = movementRecords([row]);
  assert.deepEqual(row, original);
  assert.equal(projected[0].quantity.distanceUnit, "mi");
  assert.deepEqual(projected[1].legacyExerciseIds, ["dead-bug", "balance"]);
  assert.equal(movementRecords([row, ...projected]).length, 2);
  assert.equal(
    movementTotals(
      movementRecords([
        row,
        { ...projected[0], status: "voided" },
        projected[1],
      ]),
    ).cycleMinutes,
    0,
  );
});
test("totals count canonical saved IDs once, exclude drafts and convert distance", () => {
  const a = draft("total", { status: "saved" }),
    b = draft("cycle", {
      status: "saved",
      activityType: "cycle",
      cycleType: "indoor",
      quantity: { durationMinutes: 25, distance: 1, distanceUnit: "mi" },
      tags: ["mobility", "recovery"],
    });
  const totals = movementTotals([a, a, b, draft("unsaved")]);
  assert.equal(totals.steps, 8000);
  assert.equal(totals.count, 2);
  assert.equal(totals.cycleKm, 1.609344);
  assert.equal(totals.categories.mobility, 0);
});
test("movement validation rejects invalid dates, quantities, routine history and schema", () => {
  for (const patch of [
    { date: "2026-02-30" },
    { quantity: { steps: 2.5 } },
    { quantity: { distance: -1 } },
    { symptoms: { painAfter: 11 } },
    { movementRecordSchemaVersion: 2 },
    { status: "saved", quantity: {} },
    {
      activityType: "cycle",
      cycleType: "outdoor",
      status: "saved",
      quantity: { distance: 5 },
    },
  ])
    assert.throws(() => validateMovement(draft("bad", patch)));
  const instance = createRoutineInstance(MOVEMENT_ROUTINES[0]);
  instance.exerciseCompletions.pop();
  assert.throws(
    () => validateMovement(draft("bad-routine", { routineInstance: instance })),
    /history/,
  );
});
test("nine routines retain immutable original definitions and record actual quantities separately", () => {
  assert.equal(MOVEMENT_ROUTINES.length, 9);
  assert.equal(MOVEMENT_EXERCISES.length, 34);
  for (const r of MOVEMENT_ROUTINES) {
    assert.equal(r.routineVersion, "1.0.0");
    assert.ok(r.steps.length >= 4);
    assert.ok(r.sourceMetadata.source);
    for (const step of r.steps) {
      assert.ok(step.defaultDose && step.setupCues && step.substitution);
      assert.ok(MOVEMENT_EXERCISES.find((e) => e.id === step.exerciseId));
    }
  }
  const instance = createRoutineInstance(MOVEMENT_ROUTINES[0]);
  instance.definitionSnapshot.steps.pop();
  assert.equal(
    instance.originalDefinitionSnapshot.steps.length,
    MOVEMENT_ROUTINES[0].steps.length,
  );
  assert.deepEqual(actualFromDose("2 sets × 6/side"), {
    sets: 2,
    repsPerSide: 6,
  });
  assert.deepEqual(actualFromDose("2 × 20–30 m/side"), { sets: 2 });
  assert.deepEqual(actualFromDose("5 breaths"), { breaths: 5 });
});
test("recommendation restrictions never prevent factual logging or grant progression", () => {
  assert.equal(
    routineAvailability(MOVEMENT_ROUTINES[0], { readiness: "RED" }).allowed,
    false,
  );
  const r = validateMovement(
    draft("unplanned", { status: "saved", tags: ["unplanned"] }),
  );
  assert.equal(movementResponse(r, []).progressionCredit, false);
  assert.equal(
    movementResponse({ ...r, linkedSessionId: "session" }, [
      { id: "session", status: "PENDING_NEXT_DAY_RESPONSE" },
    ]).status,
    "PENDING_NEXT_DAY_RESPONSE",
  );
  assert.equal(
    movementResponse({ ...r, linkedSessionId: "session" }, [
      { id: "session", status: "TOLERATED" },
    ]).status,
    "TOLERATED",
  );
});
test("draft commit is idempotent; scoped undo preserves unrelated activity and clinical stores", async () => {
  await put("sessions", {
    id: "clinical",
    status: "PENDING_NEXT_DAY_RESPONSE",
  });
  await saveMovementDraft(draft("atomic-a"));
  await saveMovementDraft(draft("atomic-b"));
  const tx = await commitMovement(["movement-atomic-a"], "atomic");
  await commitMovement(["movement-atomic-a"], "atomic");
  await commitMovement(["movement-atomic-b"]);
  await undoMovement(tx);
  assert.equal((await get("settings", "movement-atomic-a")).status, "voided");
  assert.equal((await get("settings", "movement-atomic-b")).status, "saved");
  assert.equal(
    (await get("sessions", "clinical")).status,
    "PENDING_NEXT_DAY_RESPONSE",
  );
  await assert.rejects(undoMovement(tx));
});
test("batch validation rolls back every activity and rejects duplicate edit targets", async () => {
  await saveMovementDraft(draft("valid-batch"));
  await saveMovementDraft(draft("invalid-batch", { quantity: {} }));
  await assert.rejects(
    commitMovement(["movement-valid-batch", "movement-invalid-batch"]),
  );
  assert.equal((await get("settings", "movement-valid-batch")).status, "draft");
  await commitMovement(["movement-valid-batch"]);
  const original = await get("settings", "movement-valid-batch");
  for (const id of ["edit-one", "edit-two"])
    await saveMovementDraft(
      draft(id, { editTargetId: original.id, baseRevision: original.revision }),
    );
  await assert.rejects(
    commitMovement(["movement-edit-one", "movement-edit-two"]),
    /one edit/,
  );
  assert.equal(
    (await get("settings", original.id)).revision,
    original.revision,
  );
});
test("saved edits retain ID, creation time, history and undo; newer edits block stale undo", async () => {
  await saveMovementDraft(draft("edit-base"));
  await commitMovement(["movement-edit-base"]);
  const base = await get("settings", "movement-edit-base");
  await saveMovementDraft(
    draft("edit-draft", {
      editTargetId: base.id,
      baseRevision: base.revision,
      quantity: { steps: 10000 },
      createdAt: "2026-09-13T00:00:00Z",
    }),
  );
  const tx = await commitMovement(["movement-edit-draft"]);
  const updated = await get("settings", base.id);
  assert.equal(updated.createdAt, base.createdAt);
  assert.equal(updated.quantity.steps, 10000);
  assert.equal(updated.history[0].previous.quantity.steps, 8000);
  await undoMovement(tx);
  const restored = await get("settings", base.id);
  assert.equal(restored.quantity.steps, 8000);
  await saveMovementDraft(
    draft("new-edit", {
      editTargetId: base.id,
      baseRevision: restored.revision,
    }),
  );
  const newer = await commitMovement(["movement-new-edit"]);
  await removeMovement(await get("settings", base.id));
  await assert.rejects(undoMovement(newer), /changed after/);
});
test("concurrent draft writes reject stale revisions rather than silently overwriting", async () => {
  const first = await saveMovementDraft(draft("concurrent"));
  await saveMovementDraft({ ...first, quantity: { steps: 5000 } });
  await assert.rejects(
    saveMovementDraft({ ...first, quantity: { steps: 10000 } }),
    /another tab/,
  );
  assert.equal((await get("settings", first.id)).quantity.steps, 5000);
});
test("backup schema 2 round-trips drafts and movement audit history", async () => {
  const before = await loadMovement(),
    backup = await exportAll();
  assert.equal(backup.schemaVersion, 2);
  assert.equal(backup.backupSchemaVersion, undefined);
  assert.ok(backup.settings.some((r) => r.kind === "movement_transaction"));
  await restoreBackup(backup);
  assert.deepEqual(await loadMovement(), before);
  const invalid = structuredClone(backup);
  invalid.settings.push(draft("invalid-import", { quantity: { steps: -1 } }));
  assert.throws(() => migrateBackup(invalid));
});
