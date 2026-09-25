import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import manifest from '../public/assets/exercises/manifests/exercise-illustrations.json' with {type:'json'};
import {DEFINITIONS} from '../src/domain/v2/compositionContent.js';
import {emptyIntent,compose,customDefinition} from '../src/domain/v2/composition.js';
import {GUIDE_PHASES,guideDefinitions} from '../src/domain/v2/rehabGuide.js';
import {illustrationUrl} from '../src/data/illustrationPaths.js';

test('V2 canonical mapped definitions retain 174 exact asset pairs without phase lookup',async()=>{
 assert.equal(manifest.length,174);
 for(const m of manifest){
  assert(DEFINITIONS.some(d=>d.id===m.exerciseId),m.exerciseId);
  for(const thumb of [true,false]){
   const url=illustrationUrl(m,'./',thumb);assert(url);
   const bytes=await readFile(new URL('../public/'+url.slice(2),import.meta.url));
   assert.equal(bytes.subarray(1,4).toString(),'PNG');
  }
 }
});
test('Repeated V2 occurrences share canonical artwork without changing targets or identity',()=>{
 const d=DEFINITIONS.find(d=>d.id==='bilateral-calf'),before=structuredClone(d);
 let intent=compose(emptyIntent('Repeated'),{type:'add',definition:d});
 intent=compose(intent,{type:'duplicate',id:intent.occurrences[0].id});
 assert.notEqual(intent.occurrences[0].id,intent.occurrences[1].id);
 assert.notEqual(intent.occurrences[0].sets[0].id,intent.occurrences[1].sets[0].id);
 for(const o of intent.occurrences)assert.equal(o.definitionSnapshot.id,'bilateral-calf');
 assert.deepEqual(d,before);
});
test('Custom and unmapped guide definitions stay usable without invented illustration aliases',()=>{
 const custom=customDefinition({name:'Bilateral Standing Calf Raise'});
 assert(!manifest.some(m=>m.exerciseId===custom.id));
 assert.equal(illustrationUrl(undefined),null);
 assert.equal(compose(emptyIntent('Custom'),{type:'add',definition:custom}).occurrences.length,1);
 for(const phase of GUIDE_PHASES){
  for(const d of guideDefinitions(phase,DEFINITIONS)){
   const before=structuredClone(d),m=manifest.find(m=>m.exerciseId===d.id);
   illustrationUrl(m);assert.deepEqual(d,before);
   assert.equal(compose(emptyIntent('Guide'),{type:'add',definition:d}).occurrences.length,1);
  }
 }
});
