import {useState} from 'react';
import {exercisePath} from '../rules/exercisePaths.js';
import type {Exercise,Session} from '../types';
import type {SwapAction} from './ExerciseSwap';

export function ExercisePath({exercise,sessions,readiness,equipment,date,progressionAllowed,unavailable=[],workoutIds=[],onSwap}: {
 exercise:Exercise;sessions:Session[];readiness:string;equipment:string[];date:string;progressionAllowed:boolean;
 unavailable?:string[];workoutIds?:string[];onSwap?:SwapAction;
}) {
 const path=exercisePath(exercise,sessions,readiness,equipment.filter(id=>!unavailable.includes(id)),date,progressionAllowed);
 const [reviewed,setReviewed]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
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
