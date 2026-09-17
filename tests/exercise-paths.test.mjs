import test from 'node:test';
import assert from 'node:assert/strict';
import {exercisePath,EXERCISE_PATHS} from '../src/rules/exercisePaths.js';
import {CATALOG,EQUIPMENT} from '../src/data/catalog.js';
import {strengthTemplate,weeklyPlan} from '../src/rules/planner.js';
import {swapExercise} from '../src/rules/trainingFlexibility.js';
import {baselineValues} from './fixtures.mjs';
const today='2026-09-16';
const press=strengthTemplate('A',baselineValues()).items.find(e=>e.id==='db-bench');
const session=(ex=press,load=50)=>({id:'prior',date:'2026-09-14',createdAt:'2026-09-14T12:00:00Z',status:'TOLERATED',readiness:{level:'GREEN'},plannedItems:[ex],exerciseLog:{[ex.id]:{sets:Array.from({length:ex.sets},()=>({complete:true,reps:10,load,rpe:7,quality:'good',symptoms:'none'}))}}});
const decision=(sessions=[session()],readiness='GREEN',equipment=EQUIPMENT,ex=press)=>exercisePath(ex,sessions,readiness,equipment,today,true);
test('path matrix covers every active exercise without enrolling research content',()=>{
 assert.deepEqual(new Set(EXERCISE_PATHS.rows.map(r=>r.originId)),new Set(Object.values(CATALOG).map(e=>e.id)));
 assert(!EXERCISE_PATHS.rows.some(r=>r.originId==='sled-push'));
 assert.equal(decision().next.id,'library-smith-incline-bench-press');assert.equal(decision().ready,true);
 assert.equal(decision([session(press,45)]).ready,false);
});
test('milestone is not enough: incomplete, pending, modified or unconfirmed evidence holds the path',()=>{
 for(const status of ['PENDING_NEXT_DAY_RESPONSE','BORDERLINE','NOT_TOLERATED','MEDICAL_FLAG'])assert(!decision([{...session(),status}]).ready);
 for(const readiness of ['UNCHECKED','RED','YELLOW_1','YELLOW_2','YELLOW_3'])assert(!decision([session()],readiness).ready);
 for(const patch of [{rpe:9},{quality:'poor'},{symptoms:'pain'},{reps:1},{complete:false},{inheritedFields:['rpe'],feedbackConfirmed:false}]){
  const s=session();Object.assign(s.exerciseLog[press.id].sets[0],patch);assert(!decision([s]).ready);
 }
 assert(!decision([session(),{id:'other',date:'2026-09-15',status:'PENDING_NEXT_DAY_RESPONSE'}]).ready);
 assert(!decision([{...session(),readiness:{level:'YELLOW_1'}}]).ready);
});
test('missing, zero, future and different prescriptions do not satisfy equipment milestones',()=>{
 for(const load of ['',null,undefined,0]){const missing=session();missing.exerciseLog[press.id].sets.forEach(s=>s.load=load);assert(!decision([missing]).ready);}
 assert(!decision([{...session(),date:'2026-09-20'}]).ready);
 assert(!decision([{...session(),plannedItems:[{...press,sets:2}]}]).ready);
 assert(!decision([session()],'GREEN',EQUIPMENT.filter(e=>e!=='smith-machine')).ready);
 assert(!exercisePath(press,[session()],'GREEN',EQUIPMENT,today,false).ready);
});
test('225 is a personal belt review milestone; later Smith transition has no invented pound threshold',()=>{
 const belt=CATALOG.belt;assert(!decision([session(belt,220)],'GREEN',EQUIPMENT,belt).ready);
 const s=session(belt,225);const result=decision([s],'GREEN',EQUIPMENT,belt);assert(result.ready);assert.equal(result.next.id,'library-smith-wide-stance-squat');
 const smith=swapExercise(belt,result.next.id,EQUIPMENT,'GREEN','progression');
 const smithResult=decision([session(smith,25)],'GREEN',EQUIPMENT,smith);
 assert(smithResult.ready);assert.equal(smithResult.next.id,'library-barbell-back-squat');assert.match(smithResult.milestone,/No automatic pound threshold/);
});
test('path evaluation never changes sessions and existing future-choice mechanism updates plans without load conversion',()=>{
 const s=session(),before=structuredClone(s);decision([s]);assert.deepEqual(s,before);
 const replacement=swapExercise(press,'library-smith-incline-bench-press',EQUIPMENT,'GREEN','progression');
 assert.equal(replacement.progressionTarget,undefined);assert.match(replacement.adjustment,/fresh working load/);
 const profile={equipment:EQUIPMENT,availableDays:['1','3','5'],exerciseChoices:{'db-bench':{id:replacement.id,reason:'progression',effectiveFrom:today}}};
 const week=weeklyPlan(profile,{id:'a',values:baselineValues(),completedAt:today},[],new Date('2026-09-21T12:00:00'),'GREEN',{},today);
 assert(week.some(d=>d.workout?.items.some(e=>e.id===replacement.id)));
 assert.deepEqual(s,before);
});
test('rehab and alternative branches do not become equipment-progression gates',()=>{
 assert.equal(decision([],'GREEN',EQUIPMENT,CATALOG.bilateral).status,'REHAB_GATE');
 assert.equal(decision([],'GREEN',EQUIPMENT,CATALOG.pullup).next,null);
 assert(decision([],'GREEN',EQUIPMENT,CATALOG.pullup).alternatives.some(e=>e.id==='library-lat-pulldown'&&e.easier));
});
