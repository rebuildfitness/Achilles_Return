import test from "node:test";
import assert from "node:assert/strict";
import {weeklyPlan, strengthTemplate, modifyWorkout} from "../src/rules/planner.js";
import {coordinateConditioning, CONDITIONING_BIKE_ID} from "../src/rules/rehabConditioning.js";
import {EQUIPMENT, validDemo} from "../src/data/catalog.js";
import {baselineValues} from "./fixtures.mjs";
const values=baselineValues();
const profile={strengthStyle:"conditioning",equipment:EQUIPMENT,availableDays:["1","3","5"]};
const assessment={values,completedAt:"2026-09-16T08:00:00Z"};
const raw=()=>strengthTemplate("B",values,"conditioning");
test("Dedicated rehab replaces B rather than adding loading days; original modes remain available",()=>{
 const days=weeklyPlan(profile,assessment,[],new Date("2026-09-16T12:00:00"));
 assert.equal(days.filter(d=>d.high).length,3);
 assert.equal(days.find(d=>d.date==="2026-09-16").workout.sessionFormat,"rehab-conditioning");
 assert.equal(strengthTemplate("B",values,"hybrid").sessionFormat,undefined);
 assert.equal(days.find(d=>d.date==="2026-09-15").workout,null);
 assert.ok(strengthTemplate("A",values,"conditioning").items.some(e=>e.strengthModule));
 assert.ok(strengthTemplate("C",values,"conditioning").items.some(e=>e.strengthModule));
});
test("Activation preserves today's existing B prescription until its effective date",()=>{
 const p={...profile,previousStrengthStyle:"hybrid",conditioningFrom:"2026-09-17"};
 assert.equal(weeklyPlan(p,assessment,[],new Date("2026-09-16T12:00:00")).find(d=>d.date==="2026-09-16").workout.sessionFormat,undefined);
 assert.equal(weeklyPlan(p,assessment,[],new Date("2026-09-23T12:00:00")).find(d=>d.date==="2026-09-23").workout.sessionFormat,"rehab-conditioning");
});
test("Rehab blocks have unique IDs, demos and bounded approved doses without automatic sport drills",()=>{
 const w=raw(); assert.equal(new Set(w.items.map(e=>e.id)).size,w.items.length);
 assert.ok(w.items.every(e=>validDemo(e) && e.block));
 assert.equal(w.items.find(e=>e.id===CONDITIONING_BIKE_ID).reps,"600 sec");
 assert.ok(w.items.every(e=>!e.impactTier));
 assert.ok(!w.items.some(e=>/carioca|pistol|bosu|backward-jog/.test(e.id)));
});
test("Red, yellow, re-entry and equipment restrictions still apply to dedicated rehab",()=>{
 const w=raw();assert.deepEqual(modifyWorkout(w,"RED").items,[]);
 assert.ok(modifyWorkout(w,"YELLOW_3").items.every(e=>e.loadTier==="minimal"));
 assert.ok(modifyWorkout(w,"GREEN",[]).omitted.some(e=>e.id===CONDITIONING_BIKE_ID));
 assert.ok(modifyWorkout(w,"GREEN",EQUIPMENT,.2).items.find(e=>e.id==="bench-step-up").sets<w.items.find(e=>e.id==="bench-step-up").sets);
 assert.equal(modifyWorkout(w,"YELLOW_1").progressionAllowed,false);
});
test("Scheduled or recorded impact replaces bike without mutating saved evidence",()=>{
 const day={date:"2026-09-16",workout:raw(),exposure:{domain:"running"}};
 assert.ok(!coordinateConditioning(day).workout.items.some(e=>e.id===CONDITIONING_BIKE_ID));
 const history=[{date:day.date,domain:"running",status:"PENDING_NEXT_DAY_RESPONSE",exerciseLog:{}}];
 const before=structuredClone(history);
 assert.ok(!coordinateConditioning({...day,exposure:null},history).workout.items.some(e=>e.id===CONDITIONING_BIKE_ID));
 assert.deepEqual(history,before);
 assert.ok(coordinateConditioning({...day,exposure:null},[]).workout.items.some(e=>e.id===CONDITIONING_BIKE_ID));
});
test("Self-reported therapy experience never supplies running criteria or completed history",()=>{
 const a={...assessment,values:{...values,heel_repaired_reps:"0",painDaily:"no"}};
 const days=weeklyPlan({...profile,therapyExperience:"All movements; normal next morning"},a,[],new Date("2026-09-16T12:00:00"));
 assert.ok(!days.some(d=>d.exposure?.domain==="running"));
});
