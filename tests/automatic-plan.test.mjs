import test from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import { baselineValues, reviewed } from "./fixtures.mjs";
import { weeklyPlan, strengthTemplate } from "../src/rules/planner.js";
import { applyAutomaticPlan, automaticStrengthTarget, automaticPlanSnapshot, PROGRESSION_MATRIX } from "../src/rules/automaticPlan.js";
import { saveAutomaticPlanAudit } from "../src/persistence/automaticPlan.js";
import { getAll } from "../src/db.js";
import { EQUIPMENT, PROGRESSION_DOMAINS } from "../src/data/catalog.js";
const today = "2026-09-16";
const assessment = { id:"a", values:baselineValues(), completedAt:"2026-09-16T08:00:00Z" };
const profile = { equipment:EQUIPMENT, availableDays:["1","3","5"] };
const session=(n,status="TOLERATED",level="R1",domain="running")=>({id:`${domain}-${n}`,date:`2026-09-${n}`,createdAt:`2026-09-${n}T12:00:00Z`,domain,exposureLevel:level,status,movementQuality:"good",progressionEligible:true,exerciseLog:{}});
const week=(sessions=[], readiness="GREEN", checkpoints={}, a=assessment)=>weeklyPlan(profile,a,sessions,new Date(today+"T12:00:00"),readiness,checkpoints,today);
const planned=days=>days.filter(d=>d.exposure);
test("meeting running entry criteria automatically inserts the first prescription; incomplete criteria do not",()=>{
 assert.equal(planned(week())[0].exposure.level,"R1");
 assert.equal(planned(week([],"GREEN",{},{...assessment,values:{...assessment.values,psychReady:""}})).length,0);
});
test("saving the second qualified tolerance automatically advances R1 to R2 without simulated future advancement",()=>{
 const prior=[session(11),session(14,"PENDING_NEXT_DAY_RESPONSE")];
 assert.equal(planned(week(prior)).length,0);
 prior[1].status="TOLERATED";
 const result=week(prior);assert.equal(planned(result)[0].exposure.level,"R2");
 assert.ok(planned(result).every(d=>d.exposure.level==="R2"));
 assert.deepEqual(result,week(prior));assert.equal(prior[1].exposureLevel,"R1");
});
test("one tolerated running exposure holds; borderline holds and poor response regresses",()=>{
 assert.equal(planned(week([session(14)]))[0].exposure.level,"R1");
 assert.equal(planned(week([session(11),session(14,"BORDERLINE","R2")]))[0].exposure.level,"R2");
 assert.equal(planned(week([session(11),session(14,"NOT_TOLERATED","R2")]))[0].exposure.level,"R1");
});
test("yellow, red and outstanding Achilles responses cannot schedule progression",()=>{
 for(const r of ["RED","YELLOW_1","YELLOW_2","YELLOW_3"])assert.equal(planned(week([],r)).length,0);
 assert.equal(planned(week([{...session(14),domain:"jumping",status:"PENDING_NEXT_DAY_RESPONSE"}])).length,0);
 assert.equal(planned(week([{...session(16),createdAt:"2026-09-16T09:00:00Z",status:"MEDICAL_FLAG"}])).length,0);
});
test("unchecked plans preview conditionally but cannot start; missing baseline cannot prescribe",()=>{
 assert.equal(planned(week([],"UNCHECKED"))[0].exposure.canStart,false);
 assert.equal(planned(week([],"UNCHECKED"))[0].exposure.conditional,true);
 assert.equal(planned(weeklyPlan(profile,undefined,[],new Date(today+"T12:00:00"),"GREEN",{},today)).length,0);
});
test("weekly reservations obey two exposure maximum, spacing and existing completed exposure",()=>{
 const days=week([session(14)]);assert.equal(planned(days).length,1);
 assert.equal(planned(days)[0].date,today);
 assert.equal(planned(week([session(15)]))[0].date,"2026-09-18");
 assert.ok(planned(week()).every(d=>d.high && d.date>=today));
});
test("future recorded sessions cannot provide evidence; old exposures require re-entry review",()=>{
 assert.equal(planned(week([session(21),session(23)]))[0].exposure.level,"R1");
 const old={...session(1),date:"2026-09-01",createdAt:"2026-09-01T12:00:00Z"};
 const days=week([old]);assert.equal(planned(days).length,0);
 assert.ok(days.some(d=>d.progressionReviews.length || d.retest));
});
test("domain criteria remain independent; soccer is not scheduled without enablement",()=>{
 const cp=reviewed("calfCapacity","lowElastic","stationarySkills");
 const domains=planned(week([],"GREEN",cp)).map(d=>d.exposure.domain);
 assert.deepEqual(domains,["running","jumping"]);
 assert.ok(!domains.includes("soccer"));
 assert.equal(PROGRESSION_MATRIX.rows.length,PROGRESSION_DOMAINS.length+1);
});
const ex=strengthTemplate("A",assessment.values).items.find(e=>e.id==="db-bench");
const lift=(overrides={})=>({id:"lift",date:"2026-09-11",createdAt:"2026-09-11T12:00:00Z",status:"TOLERATED",readiness:{level:"GREEN"},plannedItems:[ex],exerciseLog:{[ex.id]:{sets:Array.from({length:ex.sets},()=>({load:"30",reps:"5",rpe:"7",quality:"good",symptoms:"none",complete:true}))}},...overrides});
test("strength evidence changes the next workout prescription without filling actual logs",()=>{
 const prior=lift();const before=structuredClone(prior);
 const target=automaticStrengthTarget(ex,[prior],"GREEN",today);
 assert.equal(target.progressionTarget.action,"INCREASE_LOAD");assert.equal(target.progressionTarget.previousLoad,30);
 assert.equal(target.sets,5);assert.equal(target.reps,"5");assert.deepEqual(prior,before);
 const monday="2026-09-21";const day=weeklyPlan(profile,assessment,[prior],new Date(monday+"T12:00:00"),"GREEN",{},today)[0];
 assert.ok(day.workout.items.find(e=>e.id===ex.id).progressionTarget);
});
test("strength holds with absent quality, unconfirmed feedback, poor response, modified prescription or readiness",()=>{
 for(const status of ["PENDING_NEXT_DAY_RESPONSE","BORDERLINE","NOT_TOLERATED"])
 assert.equal(automaticStrengthTarget(ex,[lift({status})],"GREEN",today).progressionTarget,undefined);
 for(const patch of [{quality:"reduced"},{rpe:""},{inheritedFields:["rpe"],feedbackConfirmed:false},{load:""}]){
 const s=lift();Object.assign(s.exerciseLog[ex.id].sets[0],patch);
 assert.equal(automaticStrengthTarget(ex,[s],"GREEN",today).progressionTarget,undefined);
 }
 assert.equal(automaticStrengthTarget(ex,[lift()],"YELLOW_1",today).progressionTarget,undefined);
 assert.equal(automaticStrengthTarget({...ex,reps:"8–12"},[lift()],"GREEN",today).progressionTarget,undefined);
 assert.equal(automaticStrengthTarget(ex,[lift()],"GREEN",today,false).progressionTarget,undefined);
});
test("limits prompt review, different variations do not inherit loads and corrections recompute",()=>{
 const s=lift();s.exerciseLog[ex.id].sets.forEach(x=>x.load="50");
 assert.equal(automaticStrengthTarget(ex,[s],"GREEN",today).progressionTarget.action,"REVIEW_VARIATION");
 assert.equal(automaticStrengthTarget({...ex,id:"other"},[s],"GREEN",today).progressionTarget,undefined);
 s.exerciseLog[ex.id].sets[0].complete=false;
 assert.equal(automaticStrengthTarget(ex,[s],"GREEN",today).progressionTarget,undefined);
});
test("only real evidence enters audit snapshots and repeated saves are idempotent",async()=>{
 const sessions=[session(11),session(14)];const snapshot=automaticPlanSnapshot(week(sessions),assessment,{},sessions,"GREEN",today);
 const id=await saveAutomaticPlanAudit(snapshot);assert.equal(await saveAutomaticPlanAudit(snapshot),id);
 assert.equal((await getAll("decisions")).filter(x=>x.id===id).length,1);
 assert.equal((await getAll("sessions")).length,0);
 const changed={...snapshot,readiness:"YELLOW_1"};assert.notEqual(await saveAutomaticPlanAudit(changed),id);
});
