import test from 'node:test';
import assert from 'node:assert/strict';
import { measurementDraftPatch } from '../src/data/measurementReview.js';
import { previousExerciseSession, loadConvention } from '../src/data/workflowClarity.js';
import { addConfirmedEquipment } from '../src/data/equipmentUpdate.js';
import { NEW_EQUIPMENT_EXERCISES } from '../src/data/newEquipmentExercises.js';
import { CATALOG, EQUIPMENT } from '../src/data/catalog.js';
const row = {id:'test-zero',metric:'heel-reps',side:'repaired',date:'2026-09-15',value:'0',setup:'Flat floor, fingertip support',notes:''};
test('measurement review requires confirmation and matching dates, preserves zero and cannot infer quality',()=>{
 assert.throws(()=>measurementDraftPatch(row,row.date,row.date,false),/Confirm/);
 assert.throws(()=>measurementDraftPatch(row,'2026-09-14',row.date,true),/date/);
 const patch=measurementDraftPatch(row,row.date,row.date,true);
 assert.equal(patch.heel_repaired_reps,'0');assert.equal(patch.heelQuality,undefined);assert.equal(patch.goodBalance,undefined);
 assert.match(patch.journal_heel_repaired,/test-zero/);
 assert.throws(()=>measurementDraftPatch({...row,metric:'soleus-load'},row.date,row.date,true),/additional/);
});
test('last recorded session includes pending responses but excludes today, future and unfinished sets',()=>{
 const make=(date,status,complete=true)=>({date,createdAt:date+'T12:00:00Z',status,exerciseLog:{press:{sets:[{load:'0',reps:'5',complete}]}}});
 const rows=[make('2026-09-10','TOLERATED'),make('2026-09-14','PENDING_NEXT_DAY_RESPONSE'),make('2026-09-15','TOLERATED'),make('2026-09-16','TOLERATED')];
 assert.equal(previousExerciseSession(rows,'press','2026-09-15').date,'2026-09-14');
 assert.equal(previousExerciseSession([make('2026-09-14','TOLERATED',false)],'press','2026-09-15'),undefined);
});
test('equipment update is additive, runs once and respects subsequent removal',()=>{
 const original={id:'athlete',equipment:['dumbbells'],availableDays:['1']};
 const updated=addConfirmedEquipment(original);assert.equal(original.equipment.length,1);
 assert.deepEqual(updated.equipment,['dumbbells','landmine-station','rack-leg-extension']);
 const deselected={...updated,equipment:['dumbbells']};assert.equal(addConfirmedEquipment(deselected),deselected);
});
test('new equipment references have owned equipment and demos but do not enter prescribed rehab',()=>{
 assert.equal(NEW_EQUIPMENT_EXERCISES.length,6);
 for(const ex of NEW_EQUIPMENT_EXERCISES){assert(ex.equipment.every(id=>EQUIPMENT.includes(id)));assert(ex.videoUrl.startsWith('https://'));assert(!Object.values(CATALOG).some(c=>c.id===ex.id));}
 assert.match(loadConvention(NEW_EQUIPMENT_EXERCISES[0]),/added plates/);
 assert.match(loadConvention(NEW_EQUIPMENT_EXERCISES[3]),/stack/);
 assert.match(loadConvention({equipment:['olympic-barbell']}),/45 lb/);
});
