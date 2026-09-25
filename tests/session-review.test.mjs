import test from 'node:test';
import assert from 'node:assert/strict';
import {sessionReview,sessionItemsForDisplay} from '../src/data/sessionPresentation.js';
const items=[{id:'calf',name:'Calf',sets:3,reps:'10'},{id:'curl',name:'Curl',sets:3,reps:'8',strengthModule:true}];
test('short session retains rehab and any started accessory without mutating the plan',()=>{
 const log={curl:{sets:[{reps:'8'}]}};
 assert.deepEqual(sessionItemsForDisplay(items,{},true).map(e=>e.id),['calf']);
 assert.equal(sessionItemsForDisplay(items,log,true).length,2);
 assert.equal(items.length,2);assert.equal(log.curl.sets[0].complete,undefined);
});
test('review reports unfinished work and compares only earlier same-exercise completed sets',()=>{
 const log={calf:{sets:[{complete:true,reps:'10'},{reps:'8'}]}};
 const sessions=[{date:'2026-09-18',exerciseLog:{calf:{sets:[{complete:true,reps:'8'}]}}},{date:'2026-09-20',exerciseLog:{calf:{sets:[{complete:true,reps:'99'}]}}}];
 const rows=sessionReview(items,log,sessions,'2026-09-19');
 assert.equal(rows[0].completed,1);assert.equal(rows[0].remaining,2);
 assert.equal(rows[0].status,'Partially completed');assert.match(rows[0].previous,/8 reps/);
 assert.equal(rows[1].status,'Not performed');assert.equal(rows[1].previousDate,null);
});
test('review deduplicates retained items and labels seconds correctly',()=>{
 const ex={id:'bike',name:'Bike',sets:1,reps:'600',unit:'seconds'};
 const rows=sessionReview([ex,ex],{bike:{sets:[{complete:true,reps:'600'}]}});
 assert.equal(rows.length,1);assert.match(rows[0].current,/600 sec/);
});
