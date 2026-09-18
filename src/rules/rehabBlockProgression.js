import matrix from "../../spec/rehab-block-progression-v1.json" with {type:"json"};
import {EXERCISE_LIBRARY} from "../data/exerciseLibrary.js";
import {strengthDecision} from "./progression.js";
export const REHAB_BLOCK_MATRIX = matrix;
export function progressRehabBlocks(workout, {sessions=[], readiness="UNCHECKED", assessment, date, today=date, manualChoices={}, inProgressIds=[]}) {
 if(workout?.sessionFormat!=="rehab-conditioning") return workout;
 const observed=sessions.filter(s=>s.date<=today && s.date<date);
 const pending=sessions.some(s=>s.date<=today && s.status==="PENDING_NEXT_DAY_RESPONSE");
 const medical=sessions.some(s=>s.date<=today && s.status==="MEDICAL_FLAG" && s.createdAt>assessment?.completedAt);
 const expandedEvidence=workout.templateVersion!=="2.0.0" || observed.some(s=>s.sessionFormat==="rehab-conditioning" && s.templateVersion==="2.0.0" && s.status==="TOLERATED");
 const permitted=expandedEvidence && readiness==="GREEN" && workout.progressionAllowed && !pending && !medical && assessment?.values?.clearance==="yes" && assessment?.values?.noRestrictions==="yes";
 const decisions=[];let advanced=false;
 const items=workout.items.map(base=>{
  const origin=base.originalId || base.id;
  const row=matrix.rows.find(r=>r.originId===origin);
  if(!row) return base;
  const record={originId:origin,block:base.block,action:"HOLD",fromId:base.id,toId:base.id,reason:"Build the prescribed work with controlled quality and recorded next-morning tolerance.",sourceSessionId:null,matrixVersion:matrix.version,sourceIds:matrix.sourceIds};
  const finish=(item)=>{record.toId=item.id;record.prescription=`${item.sets} × ${item.reps}`;decisions.push(record);return item;};
  if(manualChoices[origin] || base.id!==origin) {record.reason="Your selected exercise choice takes precedence over automatic replacement.";return finish(base);}
  const history=observed.filter(s=>s.sessionFormat==="rehab-conditioning" && s.plannedItems?.some(e=>(e.originalId || e.id)===origin) && s.exerciseLog).sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt)));
  const latest=history.at(-1);const prior=latest?.plannedItems?.find(e=>(e.originalId || e.id)===origin);
  record.sourceSessionId=latest?.id || null;
  let current=base;
  const candidate=row.nextId && EXERCISE_LIBRARY.find(e=>e.id===row.nextId);
  const equipment=workout.availableEquipment || [];
  const available=candidate && !candidate.referenceOnly && candidate.videoUrl && (candidate.verifiedAt || candidate.videoVerifiedAt) && candidate.equipment.every(e=>equipment.includes(e));
  const variation=()=>({...base,...candidate,originalId:origin,block:base.block,sets:base.sets,reps:base.reps,rpe:base.rpe,restSec:base.restSec,unit:base.unit,loadTier:base.loadTier,impactTier:base.impactTier,libraryOnly:false,review:undefined,progressionTarget:undefined,
   videoType:"exercise_specific_page",videoVerifiedAt:candidate.verifiedAt || candidate.videoVerifiedAt,
   illustrationId:candidate.id,
   requestedMovement:undefined,selectionReason:undefined,
   cue:origin==="single-calf" ? "Use stable hand support and your reviewed range from floor level. Start with the lightest practical dumbbell and establish a new working load; do not copy bodyweight or another exercise's load." : candidate.setup,
   adjustment:base.adjustment});
  const balancePermitted=!["single-balance","rehab-bodyweight-squat"].includes(origin) || assessment?.values?.goodBalance==="yes";
  const bosuPrerequisite=origin!=="rehab-bodyweight-squat" || observed.some(s=>{
   const foam=s.plannedItems?.find(e=>e.id==="library-single-leg-foam-pad-balance");
   return s.sessionFormat==="rehab-conditioning" && s.readiness?.level==="GREEN" && foam && !foam.skipReason && !foam.adjustment && strengthDecision(foam,s.exerciseLog?.[foam.id]?.sets || [],s.status,readiness).action==="PROPOSE_SMALL_INCREMENT";
  });
  if((prior?.id===row.nextId || (date===today && inProgressIds.includes(row.nextId))) && available && balancePermitted) current=variation();
  if(row.kind==="duration") {
   const minutes=Number(String(prior?.reps || "").match(/\d+/)?.[0])/60;
   if(matrix.bikeMinutes.includes(minutes)) current={...base,reps:`${minutes*60} sec`,cue:`${minutes} minutes at a comfortable, tolerated effort. Record actual seconds; leave weight blank. Do not increase resistance or pace as part of a duration increase.`};
  }
  record.fromId=current.id;
  const continuingAdvance=date===today && row.nextId && inProgressIds.includes(row.nextId) && prior?.id!==row.nextId && current.id===row.nextId;
  if(continuingAdvance) advanced=true;

  if(latest && ["BORDERLINE","NOT_TOLERATED"].includes(latest.status)) {
   record.action="REGRESS";record.reason="The latest recorded response needs a lower demand. Return to the prior block step; today's readiness modifiers still apply.";
   if(row.kind==="duration") {const index=matrix.bikeMinutes.indexOf(Number(current.reps.match(/\d+/)?.[0])/60);const minutes=matrix.bikeMinutes[Math.max(0,index-1)];return finish({...base,reps:`${minutes*60} sec`,cue:`${minutes} minutes at a comfortable, tolerated effort. Record actual seconds; leave weight blank.`});}
   return finish(base);
  }
  if(!permitted) {record.reason="Hold advancement until readiness, restrictions, required responses and re-entry checks permit progression.";return finish(current);}
  if(continuingAdvance) {record.action="ADVANCE";record.reason="Continue the variation selected from the previous tolerated session. Its logged sets keep this session on the same step; other blocks wait.";return finish(current);}
  const sets=latest?.exerciseLog?.[prior?.id]?.sets || [];
  const matches=prior && prior.id===current.id && prior.sets===current.sets && prior.reps===current.reps && !prior.skipReason && !prior.adjustment && latest.readiness?.level==="GREEN";
  const qualifies=matches && strengthDecision(prior,sets,latest.status,readiness).action==="PROPOSE_SMALL_INCREMENT";
  if(!qualifies) return finish(current);
  if(date===today && inProgressIds.includes(origin) && row.kind==="variation") {record.reason="Keep the exercise already logged in this session; reassess the next workout.";return finish(current);}
  if(row.kind==="variation" && current.id===row.nextId) {record.reason="Current variation established. Keep its dose; the existing load rule can prescribe the next working-load target.";return finish(current);}
  if(row.kind==="variation" && (!available || !balancePermitted || !bosuPrerequisite)) {record.reason=origin==="rehab-bodyweight-squat" ? "BOSU squat follows controlled squat sets and a tolerated foam-pad balance session, recorded good balance and available BOSU equipment. Use fixed support and a manufacturer-permitted setup." : "Next variation requires its equipment, reviewed demo and current assessment prerequisites.";return finish(current);}
  if(row.kind==="duration" && Number(current.reps.match(/\d+/)?.[0])>=1500) {record.action="MAINTAIN";record.reason="At the approved 25-minute ceiling; no automatic pace or resistance increase.";return finish(current);}
  if(advanced) {record.action="QUEUED";record.reason="Milestone met; hold this block while another block advances. Reassess after recording that session's response.";return finish(current);}
  advanced=true;record.action="ADVANCE";
  record.reason="Prescribed upper target completed with good quality, no increased symptoms, confirmed effort and tolerated next morning. One block advances; other doses stay unchanged.";
  if(row.kind==="variation") return finish(variation());
  const index=matrix.bikeMinutes.indexOf(Number(current.reps.match(/\d+/)?.[0])/60);const minutes=matrix.bikeMinutes[index+1];
  return finish({...current,reps:`${minutes*60} sec`,cue:`${minutes} minutes at the same comfortable, tolerated effort. Duration is the only change; record actual seconds and leave weight blank.`});
 });
 return {...workout,items,blockProgression:decisions,blockMatrixVersion:matrix.version};
}
