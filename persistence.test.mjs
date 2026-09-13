import test from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import {
  getDb,
  getAll,
  get,
  put,
  closeDb,
  exportAll,
  restoreBackup,
  writeRecords,
  DB_NAME,
} from "../src/db.js";
import { migrateBackup, STORE_NAMES } from "../src/persistence/schema.js";

test("upgrade real v1 schema without changing records; commit, reopen, export and restore", async () => {
  const original = {
    id: "old-session",
    date: "2026-08-01",
    status: "PENDING_NEXT_DAY_RESPONSE",
    exerciseLog: {
      calf: { sets: [{ load: "20", reps: "8", complete: true }] },
    },
    rulesetVersion: "old-rules",
  };
  await new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      for (const name of ["profile", "checkins", "sessions", "assessments"])
        request.result.createObjectStore(name, { keyPath: "id" });
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("sessions", "readwrite");
      tx.objectStore("sessions").put(original);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
    };
    request.onerror = () => reject(request.error);
  });
  const db = await getDb();
  assert.equal(db.version, 2);
  assert.deepEqual([...db.objectStoreNames].sort(), [...STORE_NAMES].sort());
  assert.deepEqual(await get("sessions", "old-session"), original);
  await put("settings", { id: "draft", log: { reps: 8 } });
  await closeDb();
  assert.deepEqual(await get("settings", "draft"), {
    id: "draft",
    log: { reps: 8 },
  });
  const exported = await exportAll();
  assert.equal(exported.schemaVersion, 2);
  assert.equal(exported.sessions[0].rulesetVersion, "old-rules");
  assert.ok(exported.rulesetVersion && exported.exportedAt);
  await restoreBackup({
    version: 1,
    profile: [],
    checkins: [],
    sessions: [{ id: "imported", status: "TOLERATED" }],
    assessments: [],
  });
  assert.equal((await getAll("sessions")).length, 2);
  await assert.rejects(put("sessions", { missingId: true }));
  await assert.rejects(
    writeRecords([
      { store: "sessions", value: { id: "rolled-back" } },
      { store: "settings", value: { bad: true } },
    ]),
  );
  assert.equal(await get("sessions", "rolled-back"), undefined);
  await closeDb();
});
test("backup validation rejects future versions and invalid rows before writes", () => {
  assert.throws(() => migrateBackup({ version: 99 }), /Unsupported/);
  assert.throws(() => migrateBackup({ version: 1 }), /Missing/);
  assert.throws(
    () =>
      migrateBackup({
        version: 1,
        profile: [],
        checkins: [],
        sessions: [{}],
        assessments: [],
      }),
    /Invalid records/,
  );
});
test("storage unavailability rejects rather than falsely reporting a successful save", async () => {
  await closeDb();
  const original = globalThis.indexedDB;
  try {
    globalThis.indexedDB = undefined;
    await assert.rejects(put("sessions", { id: "lost" }), /unavailable/);
  } finally {
    globalThis.indexedDB = original;
  }
});
