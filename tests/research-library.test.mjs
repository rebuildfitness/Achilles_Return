import test from 'node:test';
import assert from 'node:assert/strict';
import {RESEARCH_EXERCISES} from '../src/data/researchExercises.js';
import {filterLibrary} from '../src/data/exerciseLibrary.js';
import {CATALOG} from '../src/data/catalog.js';
import manifest from '../public/assets/exercises/manifests/exercise-illustrations.json' with {type:'json'};

test('All 21 approved reference candidates are searchable, illustrated and kept out of prescription catalog',()=>{
 assert.equal(RESEARCH_EXERCISES.length,21);
 assert.deepEqual(RESEARCH_EXERCISES.map(x=>x.candidateNumber),[1,2,3,4,5,6,7,8,9,13,14,15,16,17,18,19,20,21,22,23,24]);
 for(const ex of RESEARCH_EXERCISES){
  assert(filterLibrary({search:ex.name}).some(x=>x.id===ex.id));
  assert.equal(ex.referenceOnly,true);assert.equal(ex.automaticScheduling,false);assert.equal(ex.approvedForAutomaticScheduling,false);
  assert.equal(ex.videoUrl,null);assert.equal(ex.educationalDose,null);assert.equal(CATALOG[ex.id],undefined);
  assert.equal(manifest.find(r=>r.exerciseId===ex.id)?.assetStatus,'generated');
  assert.equal(ex.research.candidateNumber,ex.candidateNumber);
 }
});
test('Equipment-dependent concepts remain labeled and backward treadmill art never implies movement authorization',()=>{
 for(const id of ['library-belt-squat-calf-raise','library-belt-squat-isometric']){
  assert.equal(RESEARCH_EXERCISES.find(x=>x.id===id).contentStatus,'setup-review-required');
  assert.equal(manifest.find(x=>x.exerciseId===id).illustrationKind,'movement-concept');
 }
 assert.equal(manifest.find(x=>x.exerciseId==='backward-treadmill-walk').illustrationKind,'equipment-reference');
 assert(manifest.every(x=>x.assetStatus==='generated'));
});
