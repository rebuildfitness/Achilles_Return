import test from "node:test";
import assert from "node:assert/strict";
import {strengthTemplate,modifyWorkout,weeklyPlan} from "../src/rules/planner.js";
import {baselineValues} from "./fixtures.mjs";
import {EQUIPMENT,validDemo} from "../src/data/catalog.js";
import {swapExercise} from "../src/rules/trainingFlexibility.js";
const values=baselineValues();
const raw=(v=values)=>strengthTemplate("B",v,"conditioning");
test("Expanded series supplies warm-up and all three circuits with separate repeated-movement log IDs",()=>{
 for(const v of [values,{...values,heel_repaired_reps:"0"}]) {
 const w=modifyWorkout(raw(v));
 assert.equal(w.templateVersion,"2.0.0");
 assert.equal(new Set(w.items.map(e=>e.id)).size,w.items.length);
 assert.deepEqual([...new Set(w.items.map(e=>e.block))],["Warm-up","Circuit A · Strength & control","Circuit B · Achilles & movement","Circuit C · Balance & control","Finisher · Conditioning"]);
 assert.ok(w.items.every(validDemo));
 assert.ok(w.items.find(e=>e.id==="rehab-warmup-calf"));
 assert.ok(w.items.find(e=>e.id==="rehab-bilateral-strength"));
 assert.ok(w.items.find(e=>e.id==="rehab-toe-walk-c"));
 }
});
test("Dynamic balance and toe walking require their actual recorded function; impact is not fabricated",()=>{
 const w=raw({...values,function_5:"limited",goodBalance:"no"});
 assert.ok(!w.items.some(e=>/toe-walk|balance-reach|multidirectional/.test(e.id)));
 assert.ok(w.items.every(e=>e.impactTier===0));
 assert.ok(w.items.filter(e=>e.requestedMovement).length===5);
});
test("Cardio warm-up chooses available equipment and never changes final bike dose",()=>{
 const w=modifyWorkout(raw(),"GREEN",["exercise-bike"]);
 assert.equal(w.items[0].name,"Easy bike warm-up");
 assert.equal(w.items[0].reps,"240 sec");
 assert.equal(w.items.find(e=>e.id==="library-stationary-cycling").reps,"600 sec");
 assert.ok(!modifyWorkout(raw(),"GREEN",[]).items.some(e=>e.id==="rehab-warmup-cardio"));
 assert.deepEqual(modifyWorkout(raw(),"RED").items,[]);
});
test("Selected combined variations replace rather than add work, and modified readiness blocks harder choices",()=>{
 const bridge=raw().items.find(e=>e.id==="bridge");
 const choice=swapExercise(bridge,"rehab-bench-single-squat",EQUIPMENT,"GREEN","progression");
 assert.equal(choice.sets,bridge.sets);assert.equal(choice.reps,"8 / side");assert.equal(choice.originalId,"bridge");
 assert.throws(()=>swapExercise(bridge,"rehab-bench-single-squat",EQUIPMENT,"YELLOW_1","equipment"));
 const squat=raw().items.find(e=>e.id==="rehab-bodyweight-squat");
 assert.equal(swapExercise(squat,"rehab-bosu-squat",EQUIPMENT,"GREEN","progression").sets,2);
 assert.throws(()=>swapExercise(squat,"rehab-bosu-squat",[],"GREEN","progression"));
});
test("Old in-progress rehab drafts retain their original template while new circuit drafts keep theirs",()=>{
 const p={strengthStyle:"conditioning",equipment:EQUIPMENT,availableDays:["1","3","5"]};
 const a={values,completedAt:"2026-09-23T08:00:00Z"};
 const plan=ids=>weeklyPlan(p,a,[],new Date("2026-09-23T12:00:00"),"GREEN",{},"2026-09-23",ids).find(d=>d.date==="2026-09-23").workout;
 assert.equal(plan(["single-calf"]).templateVersion,"1.0.0");
 assert.equal(plan(["single-calf","rehab-series-v2"]).templateVersion,"2.0.0");
 assert.equal(plan([]).templateVersion,"2.0.0");
});
test("Expanding an old session does not simultaneously prescribe a new block or load progression",()=>{
 const p={strengthStyle:"conditioning",equipment:EQUIPMENT,availableDays:["1","3","5"]};
 const a={values,completedAt:"2026-09-23T08:00:00Z"};
 const w=raw();
 const s={id:"old",date:"2026-09-21",createdAt:"2026-09-21T08:00:00Z",sessionFormat:"rehab-conditioning",templateVersion:"1.0.0",status:"TOLERATED",readiness:{level:"GREEN"},plannedItems:w.items,exerciseLog:Object.fromEntries(w.items.map(e=>[e.id,{sets:Array.from({length:e.sets},()=>({complete:true,reps:"60",load:"10",rpe:"7",quality:"good",symptoms:"none"}))}]))};
 const next=weeklyPlan(p,a,[s],new Date("2026-09-23T12:00:00"),"GREEN").find(d=>d.date==="2026-09-23").workout;
 assert.ok(!next.blockProgression.some(r=>r.action==="ADVANCE"));
 assert.ok(!next.items.some(e=>e.progressionTarget?.action==="INCREASE_LOAD"));
});
