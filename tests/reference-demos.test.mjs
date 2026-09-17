import test from 'node:test';
import assert from 'node:assert/strict';
import {REFERENCE_DEMOS,RELATED_REFERENCE_VIDEOS} from '../src/data/referenceDemos.js';
import {RESEARCH_EXERCISES} from '../src/data/researchExercises.js';
import {EQUIPMENT_REFERENCE_EXERCISES,TREADMILL_DETAILS} from '../src/data/equipmentContext.js';
import {swapOptions} from '../src/rules/trainingFlexibility.js';
import {CATALOG,EQUIPMENT} from '../src/data/catalog.js';
import draft from '../docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json' with {type:'json'};
test('All 25 reference entries have an auditable demo result without new programming eligibility',()=>{
 const references=[...RESEARCH_EXERCISES,...EQUIPMENT_REFERENCE_EXERCISES];
 assert.equal(references.length,25);assert.equal(Object.keys(REFERENCE_DEMOS).length,22);
 assert.equal(Object.keys(RELATED_REFERENCE_VIDEOS).length,2);
 for(const ex of references){
  assert.equal(ex.referenceOnly,true);assert.equal(ex.automaticScheduling,false);
  assert(!Object.values(CATALOG).some(c=>c.id===ex.id));assert.deepEqual(swapOptions(ex,EQUIPMENT),[]);
  if(ex.videoUrl){
   assert.equal(ex.demoVerification.status,'playback-reviewed');assert.equal(ex.verifiedAt,'2026-09-17');
   assert.equal(new URL(ex.videoUrl).protocol,'https:');assert(ex.demoVerification.seconds>0&&ex.demoVerification.seconds<300);
   assert(ex.demoVerification.provider&&ex.demoVerification.note);assert(ex.previousSourceReview);
  }else if(ex.relatedDemo){
   assert.equal(ex.contentStatus,'setup-review-required');assert.equal(ex.relatedDemo.status,'related-playback-reviewed');
   assert.match(ex.relatedDemo.note,/Different belt-squat machine/);assert.equal(ex.videoUrl,null);
  }else assert.equal(ex.id,'backward-treadmill-walk');
 }
 assert.equal(TREADMILL_DETAILS.backwardWalkingAuthorization,'unverified');
});
test('Original research source and evidence records survive demo curation',()=>{
 for(const ex of RESEARCH_EXERCISES){const original=draft.candidates.find(c=>c.candidateNumber===ex.candidateNumber);assert.deepEqual(ex.research.claims,original.claims);assert.deepEqual(ex.research.demos,original.demos);assert(ex.research.sourceFile);assert.equal(ex.educationalDose,null);}
});
