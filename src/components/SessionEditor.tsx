import { createContext, useContext, useState } from 'react';
import { SetRow } from './ui';
import { editFeedback } from '../data/workoutExperience.js';
import { saveSessionCorrection } from '../data/sessionCorrections.js';
import type { Session, Exercise } from '../types';
export const SessionRefresh = createContext<() => Promise<void>>(async()=>{});
export function SessionEditor({session}:{session:Session}) {
 const refresh=useContext(SessionRefresh);
 const [draft,setDraft]=useState<Session|null>(null), [reason,setReason]=useState(''), [error,setError]=useState(''), [busy,setBusy]=useState(false), [saved,setSaved]=useState(false);
 async function save() { if (!draft) return; setBusy(true); setError(''); try { await saveSessionCorrection(session,draft,reason); await refresh(); setDraft(null); setSaved(true); } catch(e) {setError(e instanceof Error?e.message:'Could not save.');} finally {setBusy(false);} }
 return <div className="session-editor">
 {!draft && <button className="text-button" onClick={()=>{setDraft(structuredClone(session));setReason('');setError('');setSaved(false);}}>Edit session</button>}
 {saved && <p role="status">Corrections saved. Charts and coaching reports use the updated record.</p>}
 {!!session.revision && <p className="helper">Edited {session.revision} time(s). Original entries are retained in your backup.</p>}
 {draft && <section aria-label="Edit completed session"><h3>Correct completed workout</h3><p>Record what actually happened. Leave forgotten values blank. Next-morning response and original prescription are preserved.</p>
 <fieldset disabled={busy}>
 {Array.from(new Set([...(session.plannedItems||[]).map(e=>e.id),...Object.keys(draft.exerciseLog||{})])).map(id=>{
 const ex=session.plannedItems?.find(e=>e.id===id) || {id,name:id,sets:draft.exerciseLog[id]?.sets.length||0} as Exercise;
 const sets=draft.exerciseLog[id]?.sets||[];
 return <details key={id}><summary>{ex.name}</summary><div className="set-row set-header" aria-hidden="true"><span>Set</span><span>Previous</span><span>lb</span><span>Reps / amount</span><span>Done</span></div>{Array.from({length:Math.max(ex.sets||0,sets.length)},(_,i)=><SetRow key={i} exercise={ex} index={i} value={sets[i]||{}} onChange={value=>setDraft({...draft,exerciseLog:{...draft.exerciseLog,[id]:{sets:Array.from({length:Math.max(ex.sets||0,sets.length)},(_,j)=>j===i?editFeedback(sets[i]||{},value):sets[j]||{})}}})}/> )}</details>;
 })}
 <div className="question"><label>Session notes<textarea value={draft.notes||''} onChange={e=>setDraft({...draft,notes:e.target.value})}/></label></div>
 <div className="question"><label>Correction reason<input value={reason} onChange={e=>setReason(e.target.value)} placeholder="For example: corrected first-set symptoms"/></label></div>
 <button className="primary-button" onClick={save}>Save corrections</button><button className="text-button" onClick={()=>setDraft(null)}>Cancel</button>
 </fieldset>{error && <p role="alert">{error}</p>}</section>}
 </div>;
}
