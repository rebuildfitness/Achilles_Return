import test from 'node:test';
import assert from 'node:assert/strict';
import {carryFeedback, editFeedback, confirmFeedback, elapsedMs, timerTransition, formatDuration, timerKey} from '../src/data/workoutExperience.js';
import {coachingReport} from '../src/data/coachingReport.js';
import {strengthDecision} from '../src/rules/progression.js';
import {strengthTemplate,STRENGTH_STYLES} from '../src/rules/planner.js';
import {baselineValues} from './fixtures.mjs';

test('Hybrid naming is accurate while preserving the existing five-set prescription',()=>{
 assert.equal(STRENGTH_STYLES[0][1],'Rehab + Strength & Hypertrophy');
 const w=strengthTemplate('A',baselineValues(),'hybrid');
 assert.doesNotMatch(w.title,/5×5/);
 assert.equal(w.items.find(ex=>ex.id==='db-bench').sets,5);
 assert.equal(w.items.find(ex=>ex.id==='db-bench').reps,'5');
});
test('Timer only advances after explicit start, survives serialization and excludes pauses',()=>{
 let t={id:timerKey('2026-09-14','A'),accumulatedMs:0,runningSince:null};
 assert.equal(elapsedMs(t,10000),0);
 t=timerTransition(t,'start',10000);
 assert.equal(elapsedMs(JSON.parse(JSON.stringify(t)),70000),60000);
 t=timerTransition(t,'pause',70000); assert.equal(elapsedMs(t,100000),60000);
 t=timerTransition(t,'start',100000); t=timerTransition(t,'finish',160000);
 assert.equal(t.accumulatedMs,120000); assert.equal(t.runningSince,null);
 assert.equal(formatDuration(t.accumulatedMs),'00:02:00');
 assert.notEqual(timerKey('2026-09-15','A'),t.id);
});
test('Carried feedback fills blank fields only and never copies completion, reps or loads',()=>{
 const first={rpe:'7',quality:'good',symptoms:'none',load:'20',reps:'5',complete:true};
 const source=[first,{rpe:'8'}, {complete:true,reps:'4'},{}];
 const next=carryFeedback(source,4);
 assert.equal(next[1].rpe,'8'); assert.equal(next[1].quality,'good');
 assert.equal(next[1].load,undefined); assert.equal(next[1].complete,undefined);
 assert.deepEqual(next[2],source[2]); assert.equal(next[3].feedbackConfirmed,false);
 assert.equal(source[1].quality,undefined);
});
test('Manual overrides remove only their inherited fields; newly completed copied sets need confirmation',()=>{
 const source=carryFeedback([{rpe:'7',quality:'good',symptoms:'none'}],2)[1];
 let next=editFeedback(source,{...source,rpe:'9'});
 assert.deepEqual(next.inheritedFields,['quality','symptoms']);
 next=editFeedback({...next,feedbackConfirmed:true},{...next,feedbackConfirmed:true,complete:true});
 assert.equal(next.feedbackConfirmed,false);
 const confirmed=confirmFeedback([next,{...source}]);
 assert.equal(confirmed[0].feedbackConfirmed,true); assert.equal(confirmed[1].feedbackConfirmed,false);
 assert.deepEqual(editFeedback({}, {load:''}),{load:''});
});
test('Unconfirmed copied feedback cannot unlock progression; explicit confirmation can',()=>{
 const exercise={sets:2,reps:'5'};
 const first={rpe:'7',quality:'good',symptoms:'none',complete:true,reps:'5'};
 const sets=carryFeedback([first],2); sets[1]={...sets[1],complete:true,reps:'5'};
 assert.equal(strengthDecision(exercise,sets,'TOLERATED').action,'HOLD');
 assert.equal(strengthDecision(exercise,confirmFeedback(sets),'TOLERATED').action,'PROPOSE_SMALL_INCREMENT');
 assert.equal(strengthDecision(exercise,confirmFeedback(sets),'PENDING_NEXT_DAY_RESPONSE').action,'HOLD');
});
test('Coach report includes actual sets, previous same-exercise history, unknowns and response updates',()=>{
 const session={id:'current',date:'2026-09-14',createdAt:'2026-09-14',status:'PENDING_NEXT_DAY_RESPONSE',durationMs:120000,workoutTitle:'Strength A',plannedItems:[{id:'press',name:'Press',sets:2,reps:'5',unit:'reps'}],exerciseLog:{press:{sets:[{complete:true,load:'0',reps:'5',rpe:'7',inheritedFields:['rpe'],feedbackConfirmed:false}]}},exerciseChanges:[{fromName:'Pull-Up',toName:'Lat pulldown',reason:'difficulty',scope:'session'}]};
 const prior={id:'older',date:'2026-09-10',createdAt:'2026-09-10',status:'TOLERATED',exerciseLog:{press:{sets:[{complete:true,load:'10',reps:'5'}]}}};
 const report=coachingReport(session,[prior,session]);
 for(const phrase of ['00:02:00','load 0 lb','UNCONFIRMED','10 lb × 5','Pull-Up → Lat pulldown','Awaiting next-morning response','Not recorded','clinical clearance']) assert.ok(report.includes(phrase),phrase);
 const updated=coachingReport({...session,status:'TOLERATED',nextDayResponse:{change:'baseline'}},[prior]);
 assert.match(updated,/Symptoms compared with usual: Back to usual baseline/);
 assert.doesNotMatch(updated,/Next-morning response not recorded/);
});
