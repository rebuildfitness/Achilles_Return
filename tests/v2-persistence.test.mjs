import test from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import {
  getDb,
  closeDb,
  get,
  getAll,
  put,
  writeRecords,
  exportAll,
  restoreBackup,
  DB_NAME,
} from "../src/db.js";
import {
  STORE_NAMES,
  ALL_STORE_NAMES,
  VERSIONS,
  migrateBackup,
} from "../src/persistence/schema.js";
import { V2_STORES, validateV2 } from "../src/persistence/v2Validation.js";
import {
  saveV2,
  atomicV2,
  readV2,
  listV2,
  archiveDefinition,
  materializeLegacy,
  mergedHistory,
} from "../src/persistence/v2Repository.js";
import { persistedFixtures } from "./fixtures/v2/persisted.mjs";
import { legacy } from "./fixtures/v2/records.mjs";
const request = (req) =>
  new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
test.beforeEach(async () => {
  await closeDb();
  await request(indexedDB.deleteDatabase(DB_NAME));
});
test.after(async () => closeDb());
const seed = async () => {
  const fixtures = persistedFixtures();
  await atomicV2(
    Object.entries(fixtures).map(([store, record]) => ({
      store,
      record,
      expectedRevision: null,
    })),
  );
  return fixtures;
};

test("phase2 upgrade shipped schema 2 preserves every old store record and reopens at 3", async () => {
  const req = indexedDB.open(DB_NAME, 2);
  req.onupgradeneeded = () =>
    STORE_NAMES.forEach((n) =>
      req.result.createObjectStore(n, { keyPath: "id" }),
    );
  const old = await request(req);
  const tx = old.transaction(STORE_NAMES, "readwrite");
  for (const n of STORE_NAMES)
    tx.objectStore(n).put({
      id: n,
      unknownField: { zero: 0, blank: "", missing: undefined },
    });
  await new Promise((r, j) => {
    tx.oncomplete = r;
    tx.onabort = j;
  });
  old.close();
  const db = await getDb();
  assert.equal(db.version, 3);
  assert.equal(VERSIONS.databaseVersion, 3);
  assert.deepEqual(
    [...db.objectStoreNames].sort(),
    [...ALL_STORE_NAMES].sort(),
  );
  for (const n of STORE_NAMES)
    assert.deepEqual(await get(n, n), {
      id: n,
      unknownField: { zero: 0, blank: "", missing: undefined },
    });
  await closeDb();
  assert.equal((await getDb()).version, 3);
});
test("phase2 required indexes exist and legacy stores have unchanged key paths", async () => {
  const db = await getDb(),
    tx = db.transaction(ALL_STORE_NAMES);
  for (const n of STORE_NAMES) {
    assert.equal(tx.objectStore(n).keyPath, "id");
    assert.equal(tx.objectStore(n).indexNames.length, 0);
  }
  assert.deepEqual(
    [...tx.objectStore("v2WorkoutSessions").indexNames],
    ["date", "legacyKey", "lifecycle"],
  );
  assert.equal(
    tx.objectStore("v2WorkoutSessions").index("legacyKey").unique,
    true,
  );
});
test("phase2 custom definition create/read/update/archive keeps referenced identity", async () => {
  const f = await seed(),
    d = f.v2ExerciseDefinitions;
  await saveV2(
    "v2ExerciseDefinitions",
    { ...d, revision: 2, name: { state: "known", value: "Edited custom" } },
    1,
  );
  await archiveDefinition(d.id, 2);
  const archived = await readV2("v2ExerciseDefinitions", d.id);
  assert.equal(archived.revision, 3);
  assert.equal(archived.archived, true);
  assert.equal(
    (await readV2("v2WorkoutSessions", f.v2WorkoutSessions.id)).occurrences[0]
      .definitionSnapshot.name.value,
    "Synthetic calf movement",
  );
});
for (const store of V2_STORES)
  test(`phase2 persists and reloads validated ${store}`, async () => {
    const f = await seed();
    await closeDb();
    assert.deepEqual(await readV2(store, f[store].id), f[store]);
  });
test("phase2 rejects static researched definitions and generic unversioned writes", async () => {
  const d = persistedFixtures().v2ExerciseDefinitions;
  await assert.rejects(
    saveV2(
      "v2ExerciseDefinitions",
      { ...d, provenance: { ...d.provenance, origin: "researched" } },
      null,
    ),
    /custom/,
  );
  await assert.rejects(put("v2ExerciseDefinitions", d), /revision-controlled/);
  await assert.rejects(
    writeRecords([{ store: "v2ExerciseDefinitions", value: d }]),
    /revision-controlled/,
  );
});
test("phase2 multiple same-date session drafts survive midnight reopen independently", async () => {
  const f = await seed(),
    a = f.v2WorkoutSessions,
    b = { ...structuredClone(a), id: "second-session" };
  await saveV2("v2WorkoutSessions", b, null);
  await closeDb();
  assert.equal((await listV2("v2WorkoutSessions")).length, 2);
  const resumed = await readV2("v2WorkoutSessions", a.id);
  await saveV2(
    "v2WorkoutSessions",
    {
      ...resumed,
      revision: 2,
      lifecycle: "in-progress",
      resumedAt: "2026-09-21T00:10:00Z",
    },
    1,
  );
  assert.deepEqual((await readV2("v2WorkoutSessions", a.id)).date, a.date);
});
test("phase2 template/plan/session persistence keeps snapshots independent and occurrence/set IDs stable", async () => {
  const f = await seed(),
    t = f.v2WorkoutTemplates,
    p = f.v2PlannedWorkouts,
    s = f.v2WorkoutSessions;
  t.name = "Later template";
  t.revision = 2;
  await saveV2("v2WorkoutTemplates", t, 1);
  p.snapshot.name = "Later plan";
  p.revision = 2;
  await saveV2("v2PlannedWorkouts", p, 1);
  assert.deepEqual(await readV2("v2WorkoutSessions", s.id), s);
  await closeDb();
  assert.equal(
    (await readV2("v2WorkoutSessions", s.id)).occurrences[0].sets[0].id,
    s.occurrences[0].sets[0].id,
  );
});
for (const lifecycle of ["partial", "abandoned"])
  test(`phase2 persists ${lifecycle} lifecycle without clinical reclassification`, async () => {
    const f = await seed(),
      s = f.v2WorkoutSessions;
    await saveV2("v2WorkoutSessions", { ...s, revision: 2, lifecycle }, 1);
    assert.equal(
      (await readV2("v2WorkoutSessions", s.id)).lifecycle,
      lifecycle,
    );
  });
test("phase2 stale writes reject while exact duplicate retry is idempotent", async () => {
  const f = await seed(),
    s = f.v2WorkoutSessions,
    next = { ...s, revision: 2, lifecycle: "in-progress" };
  await saveV2("v2WorkoutSessions", next, 1);
  await saveV2("v2WorkoutSessions", next, 1);
  await assert.rejects(
    saveV2(
      "v2WorkoutSessions",
      { ...s, revision: 2, lifecycle: "abandoned" },
      1,
    ),
    /Stale/,
  );
  assert.deepEqual(await readV2("v2WorkoutSessions", s.id), next);
});
test("phase2 completion and observation link commit atomically and resolve draft lifecycle", async () => {
  const f = await seed(),
    s = f.v2WorkoutSessions,
    o = { ...f.v2Observations, id: "after-finish" };
  await atomicV2([
    {
      store: "v2WorkoutSessions",
      record: {
        ...s,
        revision: 2,
        lifecycle: "partial",
        observationIds: [o.id],
      },
      expectedRevision: 1,
    },
    { store: "v2Observations", record: o, expectedRevision: null },
  ]);
  assert.equal(
    (await readV2("v2WorkoutSessions", s.id)).observationIds[0],
    o.id,
  );
});
test("phase2 interrupted transaction rolls back an earlier put as well as observation linkage", async () => {
  const f = await seed(),
    s = f.v2WorkoutSessions,
    o = { ...f.v2Observations, id: "abort-observation" },
    db = await getDb(),
    original = db.transaction.bind(db);
  db.transaction = (...args) => {
    const tx = original(...args),
      os = tx.objectStore.bind(tx);
    tx.objectStore = (name) => {
      const store = os(name);
      if (name === "v2Observations")
        store.put = () => {
          throw new DOMException(
            "Synthetic quota failure",
            "QuotaExceededError",
          );
        };
      return store;
    };
    return tx;
  };
  try {
    await assert.rejects(
      atomicV2([
        {
          store: "v2WorkoutSessions",
          record: { ...s, revision: 2, observationIds: [o.id] },
          expectedRevision: 1,
        },
        { store: "v2Observations", record: o, expectedRevision: null },
      ]),
      /Synthetic/,
    );
  } finally {
    db.transaction = original;
  }
  assert.deepEqual(await readV2("v2WorkoutSessions", s.id), s);
  assert.equal(await readV2("v2Observations", o.id), undefined);
});
test("phase2 graph failure cannot partially create unrelated valid records", async () => {
  const f = await seed(),
    s = f.v2WorkoutSessions;
  await assert.rejects(
    atomicV2([
      {
        store: "v2WorkoutSessions",
        record: { ...s, revision: 2, observationIds: ["missing"] },
        expectedRevision: 1,
      },
      {
        store: "v2Observations",
        record: { ...f.v2Observations, id: "should-not-exist" },
        expectedRevision: null,
      },
    ]),
    /linkage/,
  );
  assert.equal(await readV2("v2Observations", "should-not-exist"), undefined);
});
test("phase2 runtime corruption and intent actuals fail before writes", async () => {
  const f = await seed();
  for (const mutation of [
    (s) => (s.date = { state: "known", value: "nonsense" }),
    (s) =>
      (s.occurrences[0].sets[0].actual.reps = {
        amount: { state: "known", value: "8" },
        unit: { state: "known", value: "count" },
      }),
    (s) =>
      (s.occurrences[0].sets[0].actual.side = {
        state: "known",
        value: "inferred",
      }),
    (s) => (s.occurrences[0].sets[0].id = s.occurrences[1].sets[0].id),
  ]) {
    const s = structuredClone(f.v2WorkoutSessions);
    mutation(s);
    await assert.rejects(saveV2("v2WorkoutSessions", s, 1));
  }
  const t = structuredClone(f.v2WorkoutTemplates);
  t.occurrences[0].sets[0].actual = {};
  await assert.rejects(saveV2("v2WorkoutTemplates", t, 1), /historical/);
});
test("phase2 corrupted records already in storage are rejected on reads", async () => {
  const db = await getDb(),
    tx = db.transaction("v2WorkoutSessions", "readwrite");
  tx.objectStore("v2WorkoutSessions").put({ id: "corrupt", revision: 1 });
  await new Promise((r) => (tx.oncomplete = r));
  await assert.rejects(readV2("v2WorkoutSessions", "corrupt"), /Invalid/);
});
test("phase2 guidance persistence never changes its subject or grants clearance", async () => {
  const f = await seed(),
    s = await readV2("v2WorkoutSessions", f.v2WorkoutSessions.id);
  await saveV2(
    "v2GuidanceDecisions",
    { ...f.v2GuidanceDecisions, revision: 2, action: "acknowledged" },
    1,
  );
  assert.deepEqual(await readV2("v2WorkoutSessions", s.id), s);
  await assert.rejects(
    saveV2(
      "v2GuidanceDecisions",
      { ...f.v2GuidanceDecisions, revision: 3, clearance: true },
      2,
    ),
    /clearance/,
  );
});
test("phase2 materialization preserves V1 and has explicit V2-over-V1 read precedence", async () => {
  await put("sessions", legacy.normal);
  await put("settings", { id: "draft-2026-09-01", log: { untouched: true } });
  const m = await materializeLegacy(legacy.normal);
  await materializeLegacy(legacy.normal);
  assert.deepEqual(await get("sessions", legacy.normal.id), legacy.normal);
  assert.equal((await listV2("v2WorkoutSessions")).length, 1);
  assert.equal(mergedHistory([legacy.normal], [m]).length, 1);
  assert.deepEqual(m.legacy.raw, legacy.normal);
  assert.deepEqual((await get("settings", "draft-2026-09-01")).log, {
    untouched: true,
  });
  const duplicate = { ...m, id: "other-materialization" };
  await assert.rejects(
    saveV2("v2WorkoutSessions", duplicate, null),
    /Duplicate legacy/,
  );
});
test("phase2 materialization rejects changed source without writing anything", async () => {
  await put("sessions", { ...legacy.normal, revision: 2 });
  await assert.rejects(materializeLegacy(legacy.normal), /source changed/);
  assert.deepEqual(await listV2("v2WorkoutSessions"), []);
});
test("phase2 JSON backup round trip includes V1/V2, unknown fields and undefined/sparse distinctions", async () => {
  await seed();
  const sparse = [];
  sparse.length = 2;
  sparse[1] = undefined;
  await put("sessions", {
    ...legacy.unknown,
    extra: { blank: "", zero: 0, unknown: undefined, sparse },
  });
  const b = await exportAll();
  assert.equal(b.schemaVersion, 3);
  assert.equal(b.databaseVersion, 3);
  assert.ok(b.rulesetVersion && b.evidenceCatalogVersion && b.provenance);
  const serialized = JSON.parse(JSON.stringify(b));
  await closeDb();
  await request(indexedDB.deleteDatabase(DB_NAME));
  await restoreBackup(serialized);
  assert.deepEqual((await get("sessions", legacy.unknown.id)).extra, {
    blank: "",
    zero: 0,
    unknown: undefined,
    sparse,
  });
  assert.equal((await listV2("v2WorkoutSessions")).length, 1);
  await restoreBackup(serialized);
  assert.equal((await listV2("v2WorkoutSessions")).length, 1);
});
test("phase2 materialized legacy backup restores to empty database without duplicates", async () => {
  await put("sessions", legacy.normal);
  await materializeLegacy(legacy.normal);
  const b = await exportAll();
  await closeDb();
  await request(indexedDB.deleteDatabase(DB_NAME));
  await restoreBackup(b);
  assert.equal(
    mergedHistory(await getAll("sessions"), await listV2("v2WorkoutSessions"))
      .length,
    1,
  );
});
test("phase2 older and newer differing same-ID imports both reject atomically", async () => {
  const f = await seed(),
    b = await exportAll();
  await saveV2(
    "v2WorkoutSessions",
    { ...f.v2WorkoutSessions, revision: 2, lifecycle: "abandoned" },
    1,
  );
  b.profile.push({ id: "must-not-import" });
  await assert.rejects(restoreBackup(b), /Restore conflict/);
  assert.equal(await get("profile", "must-not-import"), undefined);
  b.v2WorkoutSessions[0].revision = 99;
  await assert.rejects(restoreBackup(b), /Restore conflict/);
  assert.equal(
    (await readV2("v2WorkoutSessions", f.v2WorkoutSessions.id)).revision,
    2,
  );
});
test("phase2 invalid/future backup and tampered serialization are rejected before any write", async () => {
  const f = await seed(),
    b = await exportAll();
  b.profile.push({ id: "forbidden" });
  b.v2WorkoutSessions[0].revision = "3";
  await assert.rejects(restoreBackup(b));
  assert.equal(await get("profile", "forbidden"), undefined);
  await assert.rejects(
    restoreBackup({ ...b, schemaVersion: 99 }),
    /Unsupported/,
  );
  await assert.rejects(
    restoreBackup({
      ...b,
      serialization: {
        version: 1,
        special: [{ path: ["__proto__", "polluted"], type: "undefined" }],
      },
    }),
  );
  assert.throws(
    () =>
      migrateBackup({
        version: 2,
        ...Object.fromEntries(STORE_NAMES.map((s) => [s, []])),
        v2WorkoutSessions: [],
      }),
    /schema 3/,
  );
});
test("phase2 old backup formats remain readable with missing V2 stores empty", async () => {
  await restoreBackup({
    version: 1,
    profile: [],
    sessions: [{ id: "v1-source" }],
    assessments: [],
    checkins: [],
  });
  await restoreBackup({
    version: 2,
    ...Object.fromEntries(STORE_NAMES.map((s) => [s, []])),
  });
  assert.equal((await getAll("sessions")).length, 1);
  assert.deepEqual(await listV2("v2WorkoutSessions"), []);
});
test("phase2 blocked upgrade rejects clearly; release blocker allows safe retry", async () => {
  const req = indexedDB.open(DB_NAME, 2);
  req.onupgradeneeded = () =>
    STORE_NAMES.forEach((n) =>
      req.result.createObjectStore(n, { keyPath: "id" }),
    );
  const blocker = await request(req);
  await assert.rejects(getDb(), /Close other/);
  blocker.close();
  await new Promise((r) => setTimeout(r, 25));
  await closeDb();
  assert.equal((await getDb()).version, 3);
});
test("phase2 versionchange closes the cached connection and stale older opener fails safely", async () => {
  await getDb();
  const newer = await request(indexedDB.open(DB_NAME, 4));
  newer.close();
  await assert.rejects(getDb(), (e) => e.name === "VersionError");
});

test("phase2 backup preview validation is safely repeatable before restore", async () => {
  await seed();
  const exported = JSON.parse(JSON.stringify(await exportAll()));
  await restoreBackup(migrateBackup(exported));
  const old = {
    version: 1,
    profile: [],
    sessions: [{ id: "double-validation" }],
    assessments: [],
    checkins: [],
  };
  await restoreBackup(migrateBackup(old));
  assert.ok(await get("sessions", "double-validation"));
});
