import test from 'node:test';
import assert from 'node:assert/strict';
import {strengthTemplate,modifyWorkout} from '../src/rules/planner.js';
import {progressRehabBlocks} from '../src/rules/rehabBlockProgression.js';
import {baselineValues, reviewed, exposure} from './fixtures.mjs';
import {EQUIPMENT,validDemo} from '../src/data/catalog.js';
import {exposureContent,validateExposureLog} from '../src/data/exposures.js';
import {exposureDecision} from '../src/rules/progression.js';
const values=baselineValues();
const raw=()=>modifyWorkout(strengthTemplate('B',values,'conditioning'),'GREEN',EQUIPMENT);
const record=w=>({id:'prior',date:'2026-09-16',createdAt:'2026-09-16T12:00:00Z',sessionFormat:'rehab-conditioning',templateVersion:'2.0.0',status:'TOLERATED',readiness:{level:'GREEN'},plannedItems:structuredClone(w.items),exerciseLog:Object.fromEntries(w.items.map(e=>[e.id,{sets:Array.from({length:e.sets},()=>({complete:true,reps:String(Number(e.reps.match(/\d+[–-](\d+)/)?.[1] || e.reps.match(/\d+/)?.[0])),rpe:'7',quality:'good',symptoms:'none',load:'0'}))}]))});
const run=(sessions,extra={})=>progressRehabBlocks(raw(),{sessions,assessment:{values,completedAt:'2026-09-15T08:00:00Z'},date:'2026-09-23',readiness:'GREEN',...extra});
const foamSession=()=>record(run([record(run([record(raw())]))]));
test('BOSU replaces floor squat after qualified pad and squat work with separate identity and one changed block',()=>{
 const prior=foamSession(),before=structuredClone(prior),w=run([prior]);
 const ex=w.items.find(e=>e.id==='rehab-bosu-squat');assert.ok(ex);assert.equal(ex.sets,2);assert.equal(ex.reps,'12');assert.equal(ex.originalId,'rehab-bodyweight-squat');assert.equal(ex.illustrationId,ex.id);
 assert.equal(w.blockProgression.filter(r=>r.action==='ADVANCE').length,1);assert.equal(w.items.at(-1).reps,'600 sec');assert.deepEqual(prior,before);
});
test('BOSU does not advance with absent equipment, bad balance, unconfirmed pad sets, pending response or logged floor squats',()=>{
 const s=foamSession();
 for(const readiness of ['YELLOW_1','RED','UNCHECKED']) assert.ok(!run([s],{readiness}).items.some(e=>e.id==='rehab-bosu-squat'));
 const incomplete=structuredClone(s);incomplete.exerciseLog['library-single-leg-foam-pad-balance'].sets[0].complete=false;
 assert.ok(!run([incomplete]).items.some(e=>e.id==='rehab-bosu-squat'));
 assert.ok(!run([{...s,status:'PENDING_NEXT_DAY_RESPONSE'}]).items.some(e=>e.id==='rehab-bosu-squat'));
 assert.ok(!run([s],{inProgressIds:['rehab-bodyweight-squat']}).items.some(e=>e.id==='rehab-bosu-squat'));
 const w=raw();w.availableEquipment=w.availableEquipment.filter(e=>e!=='bosu-ball');
 assert.ok(!progressRehabBlocks(w,{sessions:[s],assessment:{values},date:'2026-09-23',readiness:'GREEN'}).items.some(e=>e.id==='rehab-bosu-squat'));
 assert.ok(!run([s],{assessment:{values:{...values,goodBalance:'no'}}}).items.some(e=>e.id==='rehab-bosu-squat'));
});
test('Forward jog and directional demos are exact references without inserting D5 into earlier levels',()=>{
 assert.ok(exposureContent('running','R1').demos.every(validDemo));
 const d5=exposureContent('cod','D5');assert.ok(d5.demos.every(validDemo));assert.ok(d5.demos.some(d=>d.name.includes('Backward')));assert.ok(d5.demos.some(d=>d.name.includes('Crossovers')));
 assert.ok(!exposureContent('cod','D1').demos.some(d=>d.name.includes('Backward')));
 assert.match(d5.note,/4–6 total bouts/);
 const decision=exposureDecision('cod',values,reviewed('deceleration','plannedCut'),[exposure('running','R1')],'GREEN');assert.equal(decision.level,'D1');
});
test('Backward jog logging requires actual bout details; incomplete records are not silently populated',()=>{
 const v={minutes:'3',sessionRPE:'5',movementQuality:'good',immediateAchillesResponse:'good',distance:'40',drillsPerformed:['backward']};
 assert.ok(validateExposureLog('cod','D5',v).some(e=>/bout/.test(e)));
 assert.deepEqual(validateExposureLog('cod','D5',{...v,drillDose:'2 backward bouts, 2 crossovers, 10m each; 60 sec rest'}),[]);
});
