import test from 'node:test';
import assert from 'node:assert/strict';
import {guidedSetOrder,nextGuidedSet} from '../src/data/guidedWorkout.js';
const items=[{id:'warm',sets:1,block:'Warm-up'},{id:'a',sets:3,block:'A'},{id:'b',sets:2,block:'A'},{id:'c',sets:1,block:'C'}];
test('Guided circuit completes rounds within each block with unequal set counts',()=>{
 assert.deepEqual(guidedSetOrder(items,true).map(s=>s.id+s.index),['warm0','a0','b0','a1','b1','a2','c0']);
});
test('Strength navigation completes one exercise at a time',()=>{
 assert.deepEqual(guidedSetOrder(items,false).map(s=>s.id+s.index),['warm0','a0','a1','a2','b0','b1','c0']);
});
test('Only recorded completion advances navigation; reload derives the same place without mutating history',()=>{
 const log={warm:{sets:[{reps:'10'}]}},before=structuredClone(log);
 assert.equal(nextGuidedSet(items,log,true).id,'warm');assert.deepEqual(log,before);
 log.warm.sets[0].complete=true;
 assert.deepEqual(nextGuidedSet(items,JSON.parse(JSON.stringify(log)),true),{id:'a',index:0,block:'A'});
});
test('Skipped and removed exercises earn no completion and cannot trap the guide',()=>{
 const changed=items.map(e=>e.id==='warm'?{...e,skipReason:'unavailable'}:e);
 assert.equal(nextGuidedSet(changed,{},true).id,'a');
 assert.equal(nextGuidedSet([],{},true),null);
 assert.equal(nextGuidedSet([{id:'done',sets:1}],{done:{sets:[{complete:true}]}},false),null);
});
