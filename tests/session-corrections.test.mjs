import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {put,get,closeDb} from '../src/db.js';
import {correctedSession,saveSessionCorrection} from '../src/data/sessionCorrections.js';
import {coachingReport} from '../src/data/coachingReport.js';
const session={id:'correction-test',date:'2026-09-14',createdAt:'2026-09-14T12:00:00Z',status:'TOLERATED',nextDayResponse:{change:'baseline'},plannedItems:[{id:'press',name:'Press',sets:2,reps:'5'}],exerciseLog:{press:{sets:[{load:'20',reps:'5',complete:true,symptoms:'increased'}]}}};
test('Corrections preserve originals, identity, prescription and clinical response across revisions',()=>{
 const draft=structuredClone(session);draft.exerciseLog.press.sets[0].load='25';draft.status='MEDICAL_FLAG';
 const next=correctedSession(session,draft,'Wrong load','2026-09-15');
 assert.equal(next.status,'TOLERATED');assert.deepEqual(next.nextDayResponse,session.nextDayResponse);assert.deepEqual(next.correctionHistory[0].original,session);assert.equal(session.exerciseLog.press.sets[0].load,'20');
 const third=correctedSession(next,{...next,notes:'Clarified setup'},'Added setup');assert.equal(third.revision,2);assert.equal(third.correctionHistory.length,2);assert.equal(third.correctionHistory[1].original.exerciseLog.press.sets[0].load,'25');
});
test('Corrections validate inputs but allow clearing mistaken completion without fabricating evidence',()=>{
 assert.throws(()=>correctedSession(session,session,''));
 for(const value of ['-1','NaN','Infinity','11']) {const d=structuredClone(session);d.exerciseLog.press.sets[0].rpe=value;assert.throws(()=>correctedSession(session,d,'Fix'));}
 const d=structuredClone(session);d.exerciseLog.press.sets[0].complete=false;d.exerciseLog.press.sets[0].reps='';assert.equal(correctedSession(session,d,'Not performed').exerciseLog.press.sets[0].complete,false);
});
test('Atomic correction rejects stale data and keeps next morning responses',async()=>{
 await put('sessions',session);
 const next=await saveSessionCorrection(session,{...session,notes:'Corrected'},'Notes');
 assert.equal((await get('sessions',session.id)).revision,1);
 await assert.rejects(saveSessionCorrection(session,session,'Stale'),/changed/);
 assert.deepEqual((await get('sessions',session.id)).nextDayResponse,next.nextDayResponse);
 await closeDb();
});
test('Coaching report separates plan snapshot, recent actual activity and unknown older context',()=>{
 const prior={...session,id:'prior',date:'2026-09-10',workoutTitle:'Strength B'};
 const future={...prior,id:'future',date:'2026-09-20',workoutTitle:'Future secret'};
 const current={...session,coachingContext:{weeklyPlan:[{date:'2026-09-16',title:'Strength C',items:[{name:'Row',sets:3,reps:'10'}]}]}};
 const report=coachingReport(current,[prior,future],[{date:'2026-09-13',activityType:'walk',quantity:{steps:5000}}]);
 assert.match(report,/Row 3 × 10/);assert.match(report,/Strength B/);assert.match(report,/5,000 steps/);assert.doesNotMatch(report,/Future secret/);assert.match(report,/not proof of completion/);
 assert.match(coachingReport(session),/Original weekly plan not captured/);assert.match(coachingReport(session),/history unavailable/);
});
