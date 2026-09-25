import { V2_STORES, validateV2 } from "./persistence/v2Validation.js";
import { encodeBackup, decodeBackup } from "./persistence/v2BackupCodec.js";
import {
  migrateDatabase,
  migrateBackup,
  STORE_NAMES,
  ALL_STORE_NAMES,
  VERSIONS,
} from "./persistence/schema.js";
export const DB_NAME = "achilles-return-db";
let dbPromise;
export function getDb() {
  if (!globalThis.indexedDB)
    return Promise.reject(
      new Error(
        "Local storage is unavailable. Enable IndexedDB to save your data.",
      ),
    );
  if (!dbPromise)
    dbPromise = new Promise((resolve, reject) => {
      let blocked = false;
      const req = indexedDB.open(DB_NAME, VERSIONS.databaseVersion);
      req.onupgradeneeded = (event) =>
        migrateDatabase(req.result, event.oldVersion);
      req.onsuccess = () => {
        if (blocked) {
          req.result.close();
          return;
        }
        req.result.onversionchange = () => {
          req.result.close();
          dbPromise = undefined;
        };
        resolve(req.result);
      };
      req.onerror = () => {
        dbPromise = undefined;
        reject(req.error);
      };
      req.onblocked = () => {
        blocked = true;
        dbPromise = undefined;
        reject(
          new Error(
            "Close other Achilles Return tabs and reload to upgrade local storage.",
          ),
        );
      };
    });
  return dbPromise;
}
export async function closeDb() {
  if (dbPromise) (await dbPromise).close();
  dbPromise = undefined;
}
export async function put(store, value) {
  if (V2_STORES.includes(store))
    throw new Error("Use revision-controlled V2 repository");
  return transaction(await getDb(), store, "readwrite", (s) => s.put(value));
}
export async function get(store, id) {
  const row = await transaction(await getDb(), store, "readonly", (s) =>
    s.get(id),
  );
  return row && V2_STORES.includes(store) ? validateV2(store, row) : row;
}
export async function getAll(store) {
  const rows = await transaction(await getDb(), store, "readonly", (s) =>
    s.getAll(),
  );
  return V2_STORES.includes(store)
    ? rows.map((row) => validateV2(store, row))
    : rows;
}
export async function writeRecords(records) {
  if (records.some((row) => V2_STORES.includes(row.store)))
    throw new Error("Use revision-controlled V2 repository");
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      [...new Set(records.map((row) => row.store))],
      "readwrite",
    );
    tx.oncomplete = () => resolve(undefined);
    tx.onabort = () =>
      reject(tx.error || new Error("Local save was interrupted."));
    try {
      for (const row of records) tx.objectStore(row.store).put(row.value);
    } catch (error) {
      tx.abort();
      reject(error);
    }
  });
}
// Request success precedes commit: never report a save before transaction completion.
function transaction(db, store, mode, op) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const request = op(tx.objectStore(store));
    tx.oncomplete = () => resolve(request.result);
    tx.onabort = () =>
      reject(tx.error || new Error("Local save was interrupted."));
    tx.onerror = () => reject(tx.error);
  });
}
export async function exportAll() {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ALL_STORE_NAMES, "readonly");
    const payload = {
      version: 3,
      schemaVersion: 3,
      provenance: {
        format: "achilles-local-backup",
        origin: "local-device",
        phase: "V2 additive persistence",
      },
      ...VERSIONS,
      exportedAt: new Date().toISOString(),
    };
    for (const name of ALL_STORE_NAMES) {
      const request = tx.objectStore(name).getAll();
      request.onsuccess = () => {
        payload[name] = request.result;
      };
    }
    tx.oncomplete = () => {
      try {
        migrateBackup(payload);
        resolve(encodeBackup(payload));
      } catch (error) {
        reject(error);
      }
    };
    tx.onabort = () => reject(tx.error);
  });
}
// Foundation API; the restore UI is deferred to the backup/restore sprint.
export async function restoreBackup(input) {
  const payload = migrateBackup(decodeBackup(input));
  const records = STORE_NAMES.flatMap((store) =>
    payload[store].map((value) => ({ store, value })),
  );
  const operations = V2_STORES.flatMap((store) =>
    (payload[store] || []).map((record) => ({ store, record })),
  );
  const { atomicV2 } = await import("./persistence/v2Repository.js");
  await atomicV2(operations, { mode: "restore", legacyRecords: records });
}
