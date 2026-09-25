import {REHAB_BLOCK_MATRIX} from '../rules/rehabBlockProgression.js';
import {EXERCISE_LIBRARY} from '../data/exerciseLibrary.js';
import {useState} from 'react';
import {exercisePath} from '../rules/exercisePaths.js';
import type {Exercise,Session} from '../types';
import type {SwapAction} from './ExerciseSwap';

export function ExercisePath({blockProgression=[],exercise,sessions,readiness,equipment,date,progressionAllowed,unavailable=[],workoutIds=[],onSwap}: {
 blockProgression?:any[];exercise:Exercise;sessions:Session[];readiness:string;equipment:string[];date:string;progressionAllowed:boolean;
 unavailable?:string[];workoutIds?:string[];onSwap?:SwapAction;
}) {
 const path=exercisePath(exercise,sessions,readiness,equipment.filter(id=>!unavailable.includes(id)),date,progressionAllowed);
 const [reviewed,setReviewed]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const origin=exercise.originalId || exercise.id;
 const block=blockProgression.find(row=>row.originId===origin);
 const rule=REHAB_BLOCK_MATRIX.rows.find(row=>row.originId===origin);
 const nextRehab=rule?.nextId && exercise.id!==rule.nextId ? EXERCISE_LIBRARY.find(ex=>ex.id===rule.nextId)?.name : null;
 const bikeMinutes=rule?.kind==='duration' ? REHAB_BLOCK_MATRIX.bikeMinutes.find(n=>n>Number(exercise.reps.match(/\d+/)?.[0])/60) : null;
 const duplicate=!!path.next && workoutIds.includes(path.next.id);
 async function apply(){
  if(!onSwap || !path.ready || !path.next || !reviewed || duplicate || busy)return;
  setBusy(true);setError('');
  try{await onSwap(exercise,path.next.id,'path','future',unavailable);setReviewed(false);}
  catch(e){setError(e instanceof Error?e.message:'Could not save the path change.');}
  finally{setBusy(false);}
 }
 return <details className="exercise-path">
  <summary>Exercise path · {path.ready?'Next variation review available':path.status==='REHAB_GATE'?'Rehab criteria':path.next?'Build toward next step':'Build or adapt'}</summary>
  <p><strong>Current:</strong> {exercise.name} · {exercise.sets} × {exercise.reps}</p>
  {block ? <><p><strong>Next:</strong> {nextRehab || (bikeMinutes ? bikeMinutes+' minutes at the same effort' : 'Maintain this variation and follow its prescribed load guidance')}</p><p><strong>Current decision:</strong> {block.reason}</p><details><summary>Requirements for this rehab step</summary><p>{rule?.criterion}</p><p className="helper">Only recorded evidence counts. The existing rule engine decides when to change the next plan; this panel does not grant clearance.</p></details></> : !path.next && <p><strong>Next:</strong> {exercise.progressionTarget?.text || 'Build the prescribed dose with controlled quality and record the next-morning response. No automatic harder variation is configured for this movement.'}</p>}
  {path.route.length>0 && <ol>{path.route.map((step: {id:string;name:string})=><li key={step.id}>{step.name}{step.id===exercise.id?' — current':''}</li>)}</ol>}
  <p>{path.reason}</p>
  {path.checks.length>0 && <ul>{path.checks.map((check: {label:string;met:boolean})=><li key={check.label}>{check.met?'Met':'Needed'}: {check.label}</li>)}</ul>}
  {path.next && <p>Next review: <strong>{path.next.name}</strong>. This is an optional equipment route, not a requirement to leave an effective exercise.</p>}
  {path.ready && onSwap && !duplicate && <>
   <label><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)} /> I have reviewed this variation’s technique, setup and safeties within my current restrictions. I will establish a fresh starting load.</label>
   <button className="secondary-button" disabled={!reviewed || busy} onClick={apply}>Use next variation for this and future sessions</button>
  </>}
  {duplicate && <p className="helper">The next variation is already in this workout. Do not add duplicate work.</p>}
  {!!path.alternatives.length && <p className="helper">Available alternatives: {path.alternatives.map((e: {name:string;easier:boolean})=>`${e.name}${e.easier?' (easier option)':''}`).join('; ')}. Use Swap exercise when equipment is unavailable or you need an alternative.</p>}
  <p className="helper">Recorded sets remain with their original exercise. No weights are converted between equipment. New sport, sled and research exercises are not unlocked by this path.</p>
  {error && <p role="alert">{error}</p>}
 </details>;
}
