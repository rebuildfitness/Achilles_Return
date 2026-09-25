import matrix from '../../spec/exercise-paths-v1.json' with {type:'json'};
import {CATALOG} from '../data/catalog.js';
import {EXERCISE_LIBRARY} from '../data/exerciseLibrary.js';
import {strengthDecision} from './progression.js';
import {swapOptions, easierOptions} from './trainingFlexibility.js';
export const EXERCISE_PATHS = matrix;
const lookup = id => Object.values(CATALOG).find(e=>e.id===id) || EXERCISE_LIBRARY.find(e=>e.id===id);

// Pure decision: only observed history counts. This never changes saved sessions or declares clearance.
export function exercisePath(exercise, sessions=[], readiness='UNCHECKED', equipment=[], today='', progressionAllowed=true) {
 const origin=exercise.originalId || exercise.id;
 const row=matrix.rows.find(r=>r.originId===origin) || matrix.rows.find(r=>r.route.includes(exercise.id) || r.alternatives.includes(exercise.id));
 const options=swapOptions(exercise,equipment).filter(e=>e.id!==exercise.id);
 /** @type {any} */
 const result={version:matrix.version,originId:origin,title:row?.title || exercise.name,mode:row?.mode || 'alternatives',
  currentId:exercise.id,route:(row?.route || []).map(id=>({id,name:lookup(id)?.name || id})),
  alternatives:options.map(e=>({id:e.id,name:e.name,easier:easierOptions(exercise).includes(e.id)})),
  next:null,ready:false,status:'KEEP_BUILDING',reason:'Build this variation within its prescribed guidance. Alternatives are not ranked as upgrades.',
  milestone:null,sourceSessionId:null,checks:[],sourceIds:matrix.sourceIds};
 if(row?.mode==='existing-rehab-rules') return {...result,status:'REHAB_GATE',reason:'This movement follows the existing rehab assessment and tolerance rules. A weight milestone cannot unlock a harder rehab variation.'};
 const index=row?.route.indexOf(exercise.id) ?? -1;
 if(index<0 || index===row.route.length-1) return result;
 const next=lookup(row.route[index+1]);
 if(!next) return result;
 result.next={id:next.id,name:next.name};
 const history=sessions.filter(s=>s.date<today && s.exerciseLog?.[exercise.id]).sort((a,b)=>a.date.localeCompare(b.date) || String(a.createdAt).localeCompare(String(b.createdAt)));
 const latest=history.at(-1), prior=latest?.plannedItems?.find(e=>e.id===exercise.id);
 const sets=latest?.exerciseLog?.[exercise.id]?.sets || [];
 const matching=!!prior && prior.sets===exercise.sets && prior.reps===exercise.reps && !prior.skipReason;
 const evidence=matching && (!latest.readiness || latest.readiness.level==='GREEN') && strengthDecision(prior,sets,latest.status,readiness).action==='PROPOSE_SMALL_INCREMENT';
 const threshold=row.milestones[exercise.id] ?? null;
 const loads=sets.slice(0,prior?.sets || 0).map(s=>s.load==null || s.load==='' ? NaN : Number(s.load));
 const milestone=threshold===null || (loads.length>0 && loads.every(n=>Number.isFinite(n) && n>=threshold));
 const observed=sessions.filter(s=>s.date<=today);
 const available=options.some(e=>e.id===next.id && e.videoUrl && (e.verifiedAt || e.videoVerifiedAt));
 result.milestone=threshold===null ? 'No automatic pound threshold; review technique and setup.' : `${threshold} ${row.unit} — review milestone, not clearance`;
 result.sourceSessionId=latest?.id || null;
 result.checks=[
  {label:'Today permits progression',met:readiness==='GREEN' && progressionAllowed},
  {label:'Required next-morning responses recorded',met:!observed.some(s=>s.status==='PENDING_NEXT_DAY_RESPONSE')},
  {label:'Same prescribed sets and rep target completed with suitable effort, quality and tolerance',met:!!evidence},
  {label:threshold===null?'Technique/setup review replaces a weight threshold':result.milestone,met:milestone},
  {label:'Next variation has available equipment and an existing reviewed demo',met:available},
 ];
 result.ready=result.checks.every(c=>c.met);
 result.status=result.ready?'REVIEW_NEXT':'HOLD';
 result.reason=result.ready ? 'Training evidence supports reviewing the next variation. Confirm its setup before applying; its working load starts fresh.' : result.checks.filter(c=>!c.met).map(c=>c.label).join('; ');
 return result;
}
