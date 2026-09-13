import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { CATALOG } from '../src/data/catalog.js';
import { EXERCISE_LIBRARY } from '../src/data/exerciseLibrary.js';
import { MOVEMENT_EXERCISES, MOVEMENT_ROUTINES } from '../src/data/movementRoutines.js';
import { DRILL_DEMOS } from '../src/data/exposures.js';
import media from '../src/data/movementMedia.json' with {type:'json'};
const root = new URL('../',import.meta.url);
const folder = new URL('public/assets/exercises/manifests/',root);
await mkdir(folder,{recursive:true});
const reviews = JSON.parse(await readFile(new URL('artifacts/illustration-reviews.json',root),'utf8'));
const sources = new Map();
for (const [collection, list] of [['prescribed',Object.values(CATALOG)],['strength-library',EXERCISE_LIBRARY],['movement-library',MOVEMENT_EXERCISES]]) {
  for (const ex of list) {
    const row=sources.get(ex.id)||{ex,collections:[]};
    if(row.ex.name!==ex.name) throw Error(`Conflicting name for ${ex.id}`);
    row.collections.push(collection); sources.set(ex.id,row);
  }
}
const conflicts = [];
for (const ex of MOVEMENT_EXERCISES) {
  const steps=MOVEMENT_ROUTINES.flatMap(r=>r.steps).filter(s=>s.exerciseId===ex.id);
  if(new Set(steps.map(s=>s.name)).size>1) conflicts.push(ex.id);
}
const manifest=[];
for (const [id,{ex,collections}] of sources) {
  const review=reviews.find(r=>r.id===id);
  const primaryCollection=collections[0];
  const path=review?`/assets/exercises/${primaryCollection}/${id}.png`:null;
  const ready=!review?.rejected && path && await stat(new URL('public'+path,root)).catch(()=>null);
  const thumbnailPath=ready?`/assets/exercises/thumbnails/${id}.png`:null;
  const thumbnail=thumbnailPath?await stat(new URL('public'+thumbnailPath,root)):null;
  const demo=ex.videoUrl||media[id]?.url;
  manifest.push({exerciseId:id,exerciseName:ex.name,sourceCollections:collections,primaryCollection,
    primaryCategory:ex.category||ex.muscle||'strength', bodyRegions:[review?.bodyRegion||ex.bodyArea||ex.muscle||'Unclassified'],
    position:review?.position||ex.position||'Unreviewed',equipment:ex.equipment,
    motionFormat:review?.motionFormat||null,assetStatus:ready?'generated':review?.rejected?'needs_product_review':'not_generated',
    assetPath:ready?path:null,assetDimensions:ready?{width:640,height:960}:null,assetFormat:ready?'png':null,
    assetFileSizeBytes:ready?ready.size:null,optimizedFor:['mobile_library_thumbnail','exercise_detail_view'],
    thumbnailPath,thumbnailDimensions:thumbnail?{width:192,height:288}:null,thumbnailFileSizeBytes:thumbnail?.size||null,
    altText:review?`${ex.name}: ${review.motionFormat.replaceAll('_',' ')} panels. ${review.panelDescription}`:null,
    panelDescription:review?.panelDescription||null,
    modelRepresentation:review?{raceEthnicityPresentation:review.race||'Black',genderPresentation:review.gender,ageGroup:'adult'}:null,
    illustrationVersion:'1.0.0',existingDemoStatus:demo?'external_reference':'no_external_reference',
    clinicalRuleReference:primaryCollection==='prescribed'?'Existing Plan and readiness rules unchanged':'Existing restrictions unchanged',
    mechanicsSources:[{source:primaryCollection==='movement-library'?'src/data/movementRoutines.json':primaryCollection==='prescribed'?'src/data/catalog.js':'src/data/exerciseLibrary.js',setup:ex.setup||ex.cue||'',existingDemoUrl:demo||null,check:'Existing app setup and source metadata inspected; generated asset does not upgrade demo verification.'}],
    notes:review?.review||'Not generated: awaiting a future illustration batch. Individual generation and visual review remain outstanding; existing setup/demo remain authoritative.',pilot:review?.pilot||false});
}
await writeFile(new URL('exercise-illustrations.json',folder),JSON.stringify(manifest,null,2)+'\n');
const cols=['canonical_exercise_id','exact_app_display_name','source_collections','primary_collection','primary_category','body_region','position','equipment','motion_format','requires_clinical_or_rule_review','existing_demo_status','asset_status','asset_filename','notes'];
const quote=x=>'"'+String(x??'').replaceAll('"','""')+'"';
const csv=manifest.map(r=>[r.exerciseId,r.exerciseName,r.sourceCollections.join(';'),r.primaryCollection,r.primaryCategory,r.bodyRegions.join(';'),r.position,r.equipment.join(';'),r.motionFormat,'Existing restrictions remain authoritative',r.existingDemoStatus,r.assetStatus,r.assetPath,r.notes]);
await writeFile(new URL('exercise-illustration-inventory.csv',folder),[cols,...csv].map(row=>row.map(quote).join(',')).join('\n')+'\n');
const unresolved=manifest.filter(r=>r.assetStatus!=='generated');
await writeFile(new URL('unresolved-exercise-assets.md',folder),'# Unresolved illustration assets\n\n'+unresolved.map(r=>`- **${r.exerciseName}** (${r.exerciseId}): ${r.notes} Source: ${r.mechanicsSources[0].source}. Existing library and routine actions remain available.`).join('\n')+'\n\n## Inventory boundaries\n\nThe active libraries contain '+manifest.length+' stable exercise IDs. Prescribed entries appear again in the strength library and share one asset. Retained legacy exercises are imported for copied cues and the dayKey utility; currentWeekPlan and BASE_WORKOUT are not called by production UI. They are not a second active library.\n\nSport DRILL_DEMOS contains exposure-level groups with demo objects that have no canonical exercise IDs. These cannot be silently converted to exercise IDs or illustrated as a single movement. Groups inspected: '+Object.keys(DRILL_DEMOS).join(', ')+'. A future content decision must assign stable individual drill IDs before illustration mapping; no sport rule is changed.\n\nMovement title conflicts: '+(conflicts.join(', ')||'none')+'. Similar titles under different IDs remain separate; no semantic IDs are merged.\n');
console.log(JSON.stringify({unique:manifest.length,prescribed:Object.keys(CATALOG).length,strength:EXERCISE_LIBRARY.length,movement:MOVEMENT_EXERCISES.length,duplicateAppearances:[...sources.values()].reduce((n,r)=>n+r.collections.length-1,0),generated:manifest.length-unresolved.length,unresolved:unresolved.length}));
