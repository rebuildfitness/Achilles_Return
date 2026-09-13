import {
  migrateDatabase,
  migrateBackup,
  STORE_NAMES,
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
  return transaction(await getDb(), store, "readwrite", (s) => s.put(value));
}
export async function get(store, id) {
  return transaction(await getDb(), store, "readonly", (s) => s.get(id));
}
export async function getAll(store) {
  return transaction(await getDb(), store, "readonly", (s) => s.getAll());
}
export async function writeRecords(records) {
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
    const tx = db.transaction(STORE_NAMES, "readonly");
    const payload = {
      version: 2,
      schemaVersion: 2,
      ...VERSIONS,
      exportedAt: new Date().toISOString(),
    };
    for (const name of STORE_NAMES) {
      const request = tx.objectStore(name).getAll();
      request.onsuccess = () => {
        payload[name] = request.result;
      };
    }
    tx.oncomplete = () => resolve(payload);
    tx.onabort = () => reject(tx.error);
  });
}
// Foundation API; the restore UI is deferred to the backup/restore sprint.
export async function restoreBackup(input) {
  const payload = migrateBackup(input);
  const records = STORE_NAMES.flatMap((store) =>
    payload[store].map((value) => ({ store, value })),
  );
  if (records.length) await writeRecords(records);
}
