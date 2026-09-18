import test from "node:test";
import assert from "node:assert/strict";
import {strengthTemplate,modifyWorkout,weeklyPlan} from "../src/rules/planner.js";
import {progressRehabBlocks} from "../src/rules/rehabBlockProgression.js";
import {EQUIPMENT} from "../src/data/catalog.js";
import {baselineValues} from "./fixtures.mjs";
const values=baselineValues(), assessment={values,completedAt:"2026-09-23T08:00:00Z"};
const raw=()=>modifyWorkout(strengthTemplate("B",values,"conditioning"),"GREEN",EQUIPMENT);
function record(workout,date="2026-09-16",patch={}) {return {id:date,date,createdAt:date+"T12:00:00Z",sessionFormat:"rehab-conditioning",templateVersion:"2.0.0",status:"TOLERATED",readiness:{level:"GREEN"},plannedItems:structuredClone(workout.items),exerciseLog:Object.fromEntries(workout.items.map(e=>[e.id,{sets:Array.from({length:e.sets},()=>({complete:true,reps:String(Number(e.reps.match(/\d+[–-](\d+)/)?.[1] || e.reps.match(/\d+/)?.[0])),rpe:"7",quality:"good",symptoms:"none",load:"0"}))}])),...patch};}
const run=(sessions,extra={})=>progressRehabBlocks(raw(),{sessions,assessment,date:"2026-09-23",today:"2026-09-23",readiness:"GREEN",...extra});
test("Qualified calf work automatically selects loaded variation without changing records or other blocks",()=>{
 const prior=record(raw()),before=structuredClone(prior),next=run([prior]);
 assert.equal(next.items.find(e=>(e.originalId || e.id)==="single-calf").id,"calf-dumbbell-single");assert.equal(next.items.find(e=>(e.originalId || e.id)==="single-calf").originalId,"single-calf");
 assert.equal(next.items.find(e=>(e.originalId || e.id)==="single-calf").sets,3);assert.equal(next.items.find(e=>(e.originalId || e.id)==="single-calf").reps,"6–12");assert.match(next.items.find(e=>(e.originalId || e.id)==="single-calf").cue,/floor level/);
 assert.equal(next.blockProgression.filter(r=>r.action==="ADVANCE").length,1);
 assert.equal(next.blockProgression.find(r=>r.originId==="single-balance").action,"QUEUED");assert.deepEqual(prior,before);
 assert.deepEqual(run([prior]),next);
});
test("Subsequent tolerated dedicated sessions advance balance then BOSU then bike without future cascades",()=>{
 const first=run([record(raw())]); const second=run([record(first)]);
 assert.ok(second.items.some(e=>e.id==="library-single-leg-foam-pad-balance"));
 const bosu=run([record(second)]);assert.ok(bosu.items.some(e=>e.id==="rehab-bosu-squat"));assert.equal(bosu.items.at(-1).reps,"600 sec");
 const third=run([record(bosu)]);assert.equal(third.items.at(-1).reps,"900 sec");
 const fourth=run([record(third)]);assert.equal(fourth.items.at(-1).reps,"1200 sec");
 const fifth=run([record(fourth)]);assert.equal(fifth.items.at(-1).reps,"1500 sec");
 assert.equal(run([record(fifth)]).items.at(-1).reps,"1500 sec");
 const future=run([record(raw())],{date:"2026-10-01"});assert.equal(future.items.at(-1).reps,"600 sec");
});
test("Pending, unconfirmed feedback, symptoms, effort, restrictions and modified readiness block advancement",()=>{
 for(const patch of [{status:"PENDING_NEXT_DAY_RESPONSE"},{status:"NOT_TOLERATED"},{status:"BORDERLINE"}])assert.equal(run([record(raw(),"2026-09-16",patch)]).items.find(e=>(e.originalId || e.id)==="single-calf").id,"single-calf");
 for(const setPatch of [{rpe:""},{quality:"reduced"},{symptoms:"increased"},{inheritedFields:["quality"],feedbackConfirmed:false}]) {
  const s=record(raw());s.exerciseLog["single-calf"].sets[0]={...s.exerciseLog["single-calf"].sets[0],...setPatch};assert.equal(run([s]).items.find(e=>(e.originalId || e.id)==="single-calf").id,"single-calf");
 }
 for(const readiness of ["UNCHECKED","YELLOW_1","RED"])assert.equal(run([record(raw())],{readiness}).items.find(e=>(e.originalId || e.id)==="single-calf").id,"single-calf");
 assert.equal(run([record(raw())],{assessment:{...assessment,values:{...values,noRestrictions:"no"}}}).items.find(e=>(e.originalId || e.id)==="single-calf").id,"single-calf");
});
test("Equipment, stable-floor assessment and manual choices remain prerequisites",()=>{
 const noEquipment={...raw(),availableEquipment:[]};
 assert.equal(progressRehabBlocks(noEquipment,{sessions:[record(raw())],assessment,date:"2026-09-23",readiness:"GREEN"}).items.find(e=>(e.originalId || e.id)==="single-calf").id,"single-calf");
 const loaded=run([record(raw())]);
 const result=run([record(loaded)],{assessment:{...assessment,values:{...values,goodBalance:"no"}}});assert.ok(result.items.some(e=>e.id==="single-balance"));
 assert.equal(run([record(raw())],{manualChoices:{"single-calf":{id:"single-calf"}}}).items.find(e=>(e.originalId || e.id)==="single-calf").id,"single-calf");
});
test("Active logs do not change exercise identity mid-session; existing advanced exercise stays selected",()=>{
 assert.equal(run([record(raw())],{inProgressIds:["single-calf"]}).items.find(e=>(e.originalId || e.id)==="single-calf").id,"single-calf");
 const continuing=run([record(raw())],{inProgressIds:["calf-dumbbell-single"]});
 assert.equal(continuing.items.find(e=>(e.originalId || e.id)==="single-calf").id,"calf-dumbbell-single");
 assert.ok(continuing.items.some(e=>e.id==="single-balance"));
 assert.equal(continuing.items.at(-1).reps,"600 sec");
});
test("Bad response reduces an advanced variant and duration, while pending holds its established stage",()=>{
 const first=run([record(raw())]);assert.equal(run([record(first,"2026-09-16",{status:"PENDING_NEXT_DAY_RESPONSE"})]).items.find(e=>(e.originalId || e.id)==="single-calf").id,"calf-dumbbell-single");
 assert.equal(run([record(first,"2026-09-16",{status:"BORDERLINE"})]).items.find(e=>(e.originalId || e.id)==="single-calf").id,"single-calf");
 const bike={...raw(),items:raw().items.map(e=>e.id==="library-stationary-cycling"?{...e,reps:"1200 sec"}:e)};
 assert.equal(run([record(bike,"2026-09-16",{status:"NOT_TOLERATED"})]).items.at(-1).reps,"900 sec");
});
test("Other workout prescriptions cannot reset established block stage or fabricate advancement",()=>{
 const loaded=run([record(raw())]);const a=record(raw(),"2026-09-21",{sessionFormat:undefined});
 assert.equal(run([record(loaded),a]).items.find(e=>(e.originalId || e.id)==="single-calf").id,"calf-dumbbell-single");
 assert.equal(run([a]).items.find(e=>(e.originalId || e.id)==="single-calf").id,"single-calf");
 assert.equal(run([record(raw(),"2026-10-01")]).items.find(e=>(e.originalId || e.id)==="single-calf").id,"single-calf");
});
test("Weekly plan projects one evidenced change, preserves history and records block explanations",()=>{
 const sessions=[record(raw()),record(raw(),"2026-09-21",{sessionFormat:undefined})];const before=structuredClone(sessions);
 const week=weeklyPlan({strengthStyle:"conditioning",equipment:EQUIPMENT,availableDays:["1","3","5"]},assessment,sessions,new Date("2026-09-23T12:00:00"),"GREEN");
 const day=week.find(d=>d.date==="2026-09-23");assert.equal(day.workout.items.find(e=>(e.originalId || e.id)==="single-calf").id,"calf-dumbbell-single");assert.ok(day.workout.blockProgression.length);assert.deepEqual(sessions,before);
});
