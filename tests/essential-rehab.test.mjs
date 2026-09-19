import test from 'node:test';
import assert from 'node:assert/strict';
import {strengthTemplate,modifyWorkout} from '../src/rules/planner.js';
import {strengthDecision} from '../src/rules/progression.js';
import {sessionItemsForDisplay,sessionEstimate,optionalAccessory} from '../src/data/sessionPresentation.js';
import {baselineValues} from './fixtures.mjs';
const full=()=>strengthTemplate('B',baselineValues(),'conditioning').items;
test('Essential removes only six supplemental circuit entries and preserves core doses and ordering',()=>{
 const items=full(),before=structuredClone(items),essential=sessionItemsForDisplay(items,{},true);
 assert.equal(items.length-essential.length,6);
 assert.ok(essential.some(e=>e.id==='single-calf'));
 assert.ok(essential.some(e=>e.id==='seated-calf'));
 assert.ok(essential.some(e=>e.id==='single-balance'));
 assert.ok(essential.some(e=>e.id==='rehab-bodyweight-squat'));
 assert.ok(essential.some(e=>e.id==='library-stationary-cycling'));
 assert.deepEqual(essential,items.filter(e=>!optionalAccessory(e)));
 assert.deepEqual(items,before);
 assert.ok(parseInt(sessionEstimate(essential))<parseInt(sessionEstimate(items)));
});
test('Started supplemental exercise and its swap remain visible in Essential; restoring Full loses no entries',()=>{
 const items=full(),supplement=items.find(optionalAccessory),log={[supplement.id]:{sets:[{reps:'10'}]}};
 assert.ok(sessionItemsForDisplay(items,log,true).some(e=>e.id===supplement.id));
 const replacement={...supplement,id:'replacement',originalId:supplement.id};
 assert.ok(optionalAccessory(replacement));
 assert.deepEqual(sessionItemsForDisplay(items,log,false),items);
 assert.equal(log[supplement.id].sets[0].complete,undefined);
});
test('Omitted work cannot qualify for progression, and Essential does not bypass readiness reductions',()=>{
 for(const ex of full().filter(optionalAccessory)) assert.notEqual(strengthDecision(ex,[],'TOLERATED','GREEN').action,'PROPOSE_SMALL_INCREMENT');
 const reduced=modifyWorkout(strengthTemplate('B',baselineValues(),'conditioning'),'YELLOW_1');
 const essential=sessionItemsForDisplay(reduced.items,{},true);
 assert.equal(reduced.progressionAllowed,false);
 assert.ok(essential.every(ex=>reduced.items.includes(ex)));
 assert.deepEqual(sessionItemsForDisplay(modifyWorkout(strengthTemplate('B',baselineValues(),'conditioning'),'RED').items,{},true),[]);
});
