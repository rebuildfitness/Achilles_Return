import test from 'node:test';
import assert from 'node:assert/strict';
import {updateEquipmentContext,EQUIPMENT_REFERENCE_EXERCISES,LEGACY_MOVEMENT_ALIASES} from '../src/data/equipmentContext.js';
import {CATALOG,DEFAULT_EQUIPMENT,EQUIPMENT_OPTIONS,activeExercise,ownedExercise} from '../src/data/catalog.js';
import {filterLibrary} from '../src/data/exerciseLibrary.js';
import {swapOptions} from '../src/rules/trainingFlexibility.js';
import {modifyWorkout,strengthTemplate} from '../src/rules/planner.js';
import {baselineValues} from './fixtures.mjs';
import {addConfirmedEquipment} from '../src/data/equipmentUpdate.js';

test('equipment update adds exact device context without changing ownership or stored history',()=>{
 const profile={id:'athlete',equipment:['weighted-wagon','incline-treadmill'],equipmentDetails:{custom:{note:'retain'}},equipmentUpdate20260915:true};
 const original=structuredClone(profile); const updated=addConfirmedEquipment(profile);
 assert.deepEqual(profile,original);assert.deepEqual(updated.equipment,original.equipment);
 assert.equal(updated.equipmentDetails['incline-treadmill'].model,'PFTL39715.1');
 assert.equal(updated.equipmentDetails['weighted-wagon'].role,'personal-substitute');
 assert.equal(updated.equipmentDetails['weighted-wagon'].generalRecommendation,false);
 assert.deepEqual(updated.equipmentDetails.custom,{note:'retain'});
 assert.equal(updateEquipmentContext(updated),updated);
 const deselected={...updated,equipment:[]};assert.equal(updateEquipmentContext(deselected),deselected);
});
test('sled selection is separate from default ownership and personal wagon ownership',()=>{
 assert(EQUIPMENT_OPTIONS.includes('training-sled'));assert(!EQUIPMENT_OPTIONS.includes('weighted-wagon'));
 assert(!DEFAULT_EQUIPMENT.includes('training-sled'));assert(!DEFAULT_EQUIPMENT.includes('weighted-wagon'));
 const fresh=updateEquipmentContext({equipment:[]});assert(!fresh.equipmentDetails['weighted-wagon']);
 for(const ex of EQUIPMENT_REFERENCE_EXERCISES.filter(e=>e.equipment.includes('training-sled'))){
  assert.equal(ownedExercise(ex,['weighted-wagon']),false);assert.equal(ownedExercise(ex,['training-sled']),true);
 }
});
test('canonical references remain non-runnable even with equipment and green readiness',()=>{
 const ids=new Set(EQUIPMENT_REFERENCE_EXERCISES.map(e=>e.id));
 for(const ex of EQUIPMENT_REFERENCE_EXERCISES){
  assert.equal(activeExercise(ex,['training-sled','incline-treadmill']),false);
  assert.equal(swapOptions(ex,['training-sled','incline-treadmill']).length,0);
  assert.equal(ex.videoUrl,null);assert.equal(ex.automaticScheduling,false);
 }
 for(const kind of ['A','B','C']){
  const plan=modifyWorkout(strengthTemplate(kind,baselineValues()),'GREEN',['training-sled','incline-treadmill']);
  assert(plan.items.every(e=>!ids.has(e.id)));
 }
 assert.equal(filterLibrary({equipment:'training-sled'}).length,3);
 assert.equal(filterLibrary({search:'backward treadmill'})[0].id,'backward-treadmill-walk');
});
test('legacy movement maps only for reference and keeps original equipment identity',()=>{
 assert.equal(LEGACY_MOVEMENT_ALIASES['weighted-wagon-backward-drag'],'backward-sled-drag');
 assert.equal(CATALOG.wagon.id,'weighted-wagon-backward-drag');
 assert.deepEqual(CATALOG.wagon.equipment,['weighted-wagon']);
 assert.equal(CATALOG.wagon.canonicalMovementId,'backward-sled-drag');
 assert.equal(ownedExercise(CATALOG.wagon,['training-sled']),false);
 assert.equal(ownedExercise(CATALOG.wagon,['weighted-wagon']),true);
});
