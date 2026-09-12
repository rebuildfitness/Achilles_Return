import { getDb, getAll } from "../db.js";
import { movementRecords, validateMovement } from "../data/movement.js";
export const loadMovement = async () =>
  movementRecords(await getAll("settings"));

// Atomic read/modify/write across tabs. Existing clinical stores are never written.
async function mutate(change) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("settings", "readwrite"),
      store = tx.objectStore("settings"),
      req = store.getAll();
    let result, failure;
    req.onsuccess = () => {
      try {
        const changed = change(req.result, movementRecords(req.result));
        result = changed.result;
        for (const row of changed.rows) store.put(row);
      } catch (e) {
        failure = e;
        tx.abort();
      }
    };
    tx.oncomplete = () => resolve(result);
    tx.onabort = () =>
      reject(failure || tx.error || new Error("Movement save interrupted."));
  });
}
export async function saveMovementDraft(record) {
  return mutate((settings, all) => {
    const old = all.find((r) => r.id === record.id);
    if (old && (old.status !== "draft" || old.revision !== record.revision))
      throw new Error(
        "This draft changed in another tab. Reopen it before editing.",
      );
    const next = validateMovement({
      ...record,
      status: "draft",
      revision: (old?.revision || 0) + 1,
      updatedAt: new Date().toISOString(),
    });
    return { rows: [next], result: next };
  });
}
export async function commitMovement(ids, transactionId = crypto.randomUUID()) {
  return mutate((settings, all) => {
    const txid = `movement-transaction-${transactionId}`;
    if (settings.some((r) => r.id === txid)) return { rows: [], result: txid };
    if (!ids.length) throw new Error("Choose an activity to save.");
    const rows = [],
      before = [],
      after = [],
      targets = new Set();
    for (const id of new Set(ids)) {
      const draft = all.find((r) => r.id === id);
      if (!draft || draft.status !== "draft")
        throw new Error("A draft changed. Refresh the activity list.");
      const old = draft.editTargetId
        ? all.find((r) => r.id === draft.editTargetId)
        : null;
      if (draft.editTargetId && (!old || old.revision !== draft.baseRevision))
        throw new Error(
          "The saved activity changed. Reopen it before editing.",
        );
      const target = old?.id || draft.id;
      if (targets.has(target))
        throw new Error("Save only one edit of each activity at a time.");
      targets.add(target);
      const next = validateMovement({
        ...draft,
        id: target,
        createdAt: old?.createdAt || draft.createdAt,
        status: "saved",
        revision: (old?.revision || draft.revision) + 1,
        editTargetId: undefined,
        baseRevision: undefined,
        updatedAt: new Date().toISOString(),
        history: [
          ...(old?.history || []),
          ...(old
            ? [
                {
                  at: new Date().toISOString(),
                  previous: { ...old, history: undefined },
                  reason: draft.editReason || "Edited activity",
                },
              ]
            : []),
        ],
      });
      before.push(old || null);
      after.push({ id: next.id, revision: next.revision });
      rows.push(next);
      if (old)
        rows.push({ ...draft, status: "voided", revision: draft.revision + 1 });
    }
    rows.push({
      id: txid,
      kind: "movement_transaction",
      before,
      after,
      createdAt: new Date().toISOString(),
    });
    return { rows, result: txid };
  });
}
export async function undoMovement(txid) {
  return mutate((settings, all) => {
    const entry = settings.find((r) => r.id === txid);
    if (!entry || entry.undone)
      throw new Error("That save has already been undone.");
    const rows = entry.after.map((ref, i) => {
      const live = all.find((r) => r.id === ref.id);
      if (!live || live.revision !== ref.revision)
        throw new Error(
          "An activity changed after this save. Edit it directly instead of undoing newer work.",
        );
      return {
        ...(entry.before[i] || live),
        status: entry.before[i]?.status || "voided",
        revision: live.revision + 1,
        updatedAt: new Date().toISOString(),
        history: [
          ...(live.history || []),
          {
            at: new Date().toISOString(),
            reason: "Undo save",
            previous: { ...live, history: undefined },
          },
        ],
      };
    });
    return { rows: [...rows, { ...entry, undone: true }], result: undefined };
  });
}
export async function removeMovement(record) {
  return mutate((_, all) => {
    const live = all.find((r) => r.id === record.id);
    if (!live || live.revision !== record.revision)
      throw new Error("Activity changed. Refresh before removing.");
    return {
      rows: [
        {
          ...live,
          status: "voided",
          revision: live.revision + 1,
          updatedAt: new Date().toISOString(),
          history: [
            ...(live.history || []),
            { reason: "Removed", previous: { ...live, history: undefined } },
          ],
        },
      ],
      result: undefined,
    };
  });
}
