import { getDb } from '../db.js';
export function correctedSession(current, draft, reason, now = new Date().toISOString()) {
 if (!reason.trim()) throw new Error('Add a short correction reason.');
 const log = structuredClone(draft.exerciseLog || {});
 for (const [id, entry] of Object.entries(log)) {
  if (!(id in (current.exerciseLog || {})) && !current.plannedItems?.some(e=>e.id===id)) throw new Error('Unknown exercise.');
  for (const set of entry.sets || []) {
   if (!set) continue;
   for (const key of ['load','reps','rpe']) if (set[key] != null && set[key] !== '' && (!Number.isFinite(Number(set[key])) || Number(set[key]) < 0 || (key==='rpe' && Number(set[key])>10))) throw new Error('Use valid nonnegative values; RPE must be between 0 and 10.');
   if (set.complete && !(Number(set.reps)>0)) throw new Error('Enter repetitions, seconds or distance for each completed set.');
  }
 }
 const { correctionHistory, ...original } = current;
 return { ...current, exerciseLog: log, notes: draft.notes || '', updatedAt: now, revision: (current.revision || 0)+1,
 correctionHistory: [...(correctionHistory || []), {at: now, reason: reason.trim(), original}] };
}
// Read, compare and write in the same transaction: stale editors cannot overwrite newer responses.
export async function saveSessionCorrection(expected, draft, reason) {
 const db = await getDb();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('sessions','readwrite'); const store=tx.objectStore('sessions'); let result, failure;
  tx.oncomplete=()=>resolve(result); tx.onabort=()=>reject(failure || tx.error || new Error('Correction was not saved.'));
  const req=store.get(expected.id);
  req.onsuccess=()=>{ try {
   const current=req.result;
   if (!current || JSON.stringify(current)!==JSON.stringify(expected)) throw new Error('This session changed. Close the editor and reload before correcting it.');
   result=correctedSession(current,draft,reason); store.put(result);
  } catch(e) { failure=e; tx.abort(); } };
 });
}
