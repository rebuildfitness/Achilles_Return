import { correctSession } from "../domain/v2/corrections.js";
import { getDb } from "../db.js";
import { V2_STORES, validateV2, equal } from "./v2Validation.js";
import { adaptSession } from "../domain/v2/adapters.ts";

export function validateGraph(rows) {
  const by = (store) => new Map(rows[store].map((r) => [r.id, r]));
  const sessions = by("v2WorkoutSessions"),
    defs = by("v2ExerciseDefinitions"),
    observations = by("v2Observations"),
    events = by("v2GuidanceEvents");
  const legacyKeys = new Set();
  for (const s of sessions.values()) {
    if (s.legacyKey) {
      if (legacyKeys.has(s.legacyKey))
        throw new Error("Duplicate legacy materialization");
      legacyKeys.add(s.legacyKey);
    }
    for (const id of s.observationIds || []) {
      const o = observations.get(id);
      if (!o || o.sessionId !== s.id)
        throw new Error("Invalid observation linkage");
    }
  }
  for (const o of observations.values())
    if (o.sessionId && !sessions.has(o.sessionId))
      throw new Error("Missing observation session");
  for (const e of events.values()) {
    const subject =
      sessions.get(e.subjectId) ||
      by("v2PlannedWorkouts").get(e.subjectId) ||
      by("v2WorkoutTemplates").get(e.subjectId);
    if (!subject || e.subjectRevision > subject.revision)
      throw new Error("Invalid guidance subject revision");
  }
  for (const d of rows.v2GuidanceDecisions) {
    const e = events.get(d.guidanceId);
    if (!e || e.subjectRevision !== d.subjectRevision)
      throw new Error("Invalid guidance decision reference");
    if (d.subjectId !== undefined && d.subjectId !== e.subjectId)
      throw Error("Guidance decision subject mismatch");
  }
  for (const row of [
    ...sessions.values(),
    ...rows.v2WorkoutTemplates,
    ...rows.v2PlannedWorkouts.map((p) => p.snapshot),
  ])
    for (const o of row.occurrences) {
      if (
        o.definitionSnapshot.provenance.origin === "custom" &&
        !defs.has(o.exerciseDefinitionId)
      )
        throw new Error("Missing custom definition");
    }
}
/** Internal atomic read/validate/write boundary shared with backup restore. */
export async function atomicV2(
  operations,
  { mode = "write", legacyRecords = [], guards = [] } = {},
) {
  if (mode !== "write" && mode !== "restore")
    throw new Error("Unsupported write mode");
  const ops = structuredClone(operations),
    legacy = structuredClone(legacyRecords);
  const checks = structuredClone(guards);
  for (const g of checks)
    if (
      ![
        ...V2_STORES,
        "profile",
        "checkins",
        "assessments",
        "capabilityStates",
        "sessions",
      ].includes(g.store)
    )
      throw Error("Invalid transaction guard");
  const seen = new Set();
  for (const op of ops) {
    validateV2(op.store, op.record);
    const key = JSON.stringify([op.store, op.record.id]);
    if (seen.has(key)) throw new Error("Duplicate operation target");
    seen.add(key);
    if (
      mode === "write" &&
      !(
        op.expectedRevision === null ||
        (Number.isSafeInteger(op.expectedRevision) && op.expectedRevision >= 1)
      )
    )
      throw new Error("Expected revision required");
  }
  if (mode === "write" && legacy.length)
    throw new Error("Legacy writes are restore-only");
  for (const r of legacy)
    if (
      ![
        "profile",
        "checkins",
        "sessions",
        "assessments",
        "capabilityStates",
        "decisions",
        "settings",
      ].includes(r.store) ||
      !r.value ||
      typeof r.value.id !== "string"
    )
      throw new Error("Invalid legacy restore operation");
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const names = [
      ...new Set([
        ...V2_STORES,
        "sessions",
        ...legacy.map((r) => r.store),
        ...checks.map((g) => g.store),
      ]),
    ];
    const tx = db.transaction(names, "readwrite");
    let failure,
      remaining = names.length;
    const rows = {};
    tx.oncomplete = () => resolve(ops.map((op) => structuredClone(op.record)));
    tx.onabort = () =>
      reject(failure || tx.error || new Error("Atomic V2 write interrupted"));
    const abort = (e) => {
      failure = e;
      tx.abort();
    };
    for (const name of names) {
      const request = tx.objectStore(name).getAll();
      request.onsuccess = () => {
        rows[name] = request.result;
        if (--remaining) return;
        try {
          for (const g of checks) {
            const actual =
              g.id === undefined
                ? rows[g.store]
                : rows[g.store].find((r) => r.id === g.id);
            if (!equal(actual, g.value))
              throw Error(
                "Stale guidance inputs; review the latest saved workout and analyze again",
              );
          }
          for (const store of V2_STORES)
            rows[store].forEach((r) => validateV2(store, r));
          const changes = [];
          for (const r of legacy)
            if (r.store === "sessions")
              rows.sessions = rows.sessions
                .filter((s) => s.id !== r.value.id)
                .concat(r.value);
          for (const op of ops) {
            const current = rows[op.store].find((r) => r.id === op.record.id);
            if (current && equal(current, op.record)) continue; // Exact retry only.
            if (mode === "restore" && current)
              throw new Error(
                `Restore conflict: ${op.store}/${op.record.id}; no records imported`,
              );
            if (mode === "write") {
              if (current?.adapterVersion && op.store === "v2GuidanceEvents")
                throw Error(
                  "Guidance events are immutable; evaluate a new revision",
                );
              if (current?.adapterVersion && op.store === "v2GuidanceDecisions")
                throw Error(
                  "Guidance decisions are immutable; record a new decision",
                );
              if (op.store === "v2WorkoutSessions" && current && !op.correction && (current.legacyOrigin || current.correctionLineage?.some(c=>c.version===1)) && ['completed','partial','abandoned','unknown'].includes(current.lifecycle)) throw Error('Finished historical record requires audited correction');
              if (op.store === "v2WorkoutSessions" && op.correction) {
                if (!current || !equal(correctSession(current,op.correction),op.record)) throw Error("Invalid audited correction");
              }
              if (op.store === "v2WorkoutSessions" && current?.execution) {
                if (
                  ["completed", "partial", "abandoned"].includes(
                    current.lifecycle,
                  ) && !op.correction
                )
                  throw new Error(
                    "Finished execution history is immutable; correction flow required",
                  );
                if (!equal(current.originalIntent, op.record.originalIntent))
                  throw new Error("Original session intent is immutable");
                if (!op.record.execution)
                  throw new Error("Cannot remove execution identity");
              }
              if ((current?.revision ?? null) !== op.expectedRevision)
                throw new Error(`Stale revision: ${op.record.id}`);
              if (op.record.revision !== (current?.revision ?? 0) + 1)
                throw new Error("Revision must increment by one");
              if (
                current?.legacyKey &&
                current.legacyKey !== op.record.legacyKey
              )
                throw new Error("Cannot change materialization origin");
            }
            if (op.record.legacyOrigin) {
              const original = rows.sessions.find(
                (r) => r.id === op.record.legacyOrigin.id,
              );
              if (
                !original ||
                !equal(original, op.record.legacy.raw) ||
                (original.revision ?? 0) !== op.record.legacyOrigin.revision
              )
                throw new Error(
                  "Legacy source changed; materialization rejected",
                );
            }
            rows[op.store] = rows[op.store]
              .filter((r) => r.id !== op.record.id)
              .concat(op.record);
            changes.push(op);
          }
          // Restore supplies legacy records in the same transaction, before graph validation.
          for (const r of legacy) {
            if (r.store === "sessions") {
              const material = rows.v2WorkoutSessions.find(
                (s) => s.legacyOrigin?.id === r.value.id,
              );
              if (material && !equal(material.legacy.raw, r.value))
                throw new Error(
                  "Restore conflicts with materialized legacy history",
                );
            }
          }
          validateGraph(rows);
          for (const op of changes) tx.objectStore(op.store).put(op.record);
          for (const r of legacy) tx.objectStore(r.store).put(r.value);
        } catch (e) {
          abort(e);
        }
      };
    }
  });
}
export const saveV2 = (store, record, expectedRevision) =>
  atomicV2([{ store, record, expectedRevision }]).then((rows) => rows[0]);
export async function listV2(store) {
  if (!V2_STORES.includes(store)) throw new Error("Unknown V2 store");
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    let result;
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => {
      try {
        result = req.result.map((r) => validateV2(store, r));
      } catch (e) {
        reject(e);
        tx.abort();
      }
    };
    tx.oncomplete = () => resolve(result);
    tx.onabort = () => reject(tx.error || new Error("Read aborted"));
  });
}
export async function readV2(store, id) {
  return (await listV2(store)).find((r) => r.id === id);
}
export async function archiveDefinition(id, expectedRevision) {
  const current = await readV2("v2ExerciseDefinitions", id);
  if (!current) throw new Error("Definition not found");
  return saveV2(
    "v2ExerciseDefinitions",
    { ...current, archived: true, revision: expectedRevision + 1 },
    expectedRevision,
  );
}
export async function materializeLegacy(source) {
  // Explicit operation only. Current UI never calls this.
  const record = {
    ...adaptSession(source),
    recordVersion: 1,
    revision: 1,
    legacyOrigin: {
      store: "sessions",
      id: source.id,
      revision: source.revision ?? 0,
    },
    legacyKey: JSON.stringify(["sessions", source.id]),
  };
  return saveV2("v2WorkoutSessions", record, null);
}
export function mergedHistory(legacy, v2) {
  v2.forEach((s) => validateV2("v2WorkoutSessions", s));
  const keys = new Set(
    v2.filter((s) => s.legacyOrigin).map((s) => s.legacyOrigin.id),
  );
  return [
    ...legacy.filter((s) => !keys.has(s.id)).map((s) => adaptSession(s)),
    ...structuredClone(v2),
  ];
}
