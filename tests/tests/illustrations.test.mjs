import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import manifest from '../public/assets/exercises/manifests/exercise-illustrations.json' with {type:'json'};
import { CATALOG } from '../src/data/catalog.js';
import { EXERCISE_LIBRARY } from '../src/data/exerciseLibrary.js';
import { MOVEMENT_EXERCISES } from '../src/data/movementRoutines.js';
import { illustrationUrl } from '../src/data/illustrationPaths.js';
const root=new URL('../public/',import.meta.url);
test('illustration inventory covers each canonical ID exactly once with exact display names',()=>{
  const active=[...Object.values(CATALOG),...EXERCISE_LIBRARY,...MOVEMENT_EXERCISES];
  const ids=new Set(active.map(e=>e.id));
  assert.equal(manifest.length,ids.size);
  assert.equal(new Set(manifest.map(r=>r.exerciseId)).size,ids.size);
  for(const r of manifest){assert(ids.has(r.exerciseId)); assert(active.filter(e=>e.id===r.exerciseId).every(e=>e.name===r.exerciseName));}
});
test('generated PNGs exist with accurate dimensions and file sizes; unresolved entries have no fake paths',async()=>{
  for(const r of manifest){
    if(r.assetStatus!=='generated'){
      assert.equal(r.assetPath,null);assert.equal(r.assetDimensions,null);assert.equal(r.assetFileSizeBytes,null);continue;
    }
    assert(illustrationUrl(r));
    const bytes=await readFile(new URL(r.assetPath.slice(1),root));
    assert.equal(bytes.subarray(1,4).toString(),'PNG');
    assert.equal(bytes.readUInt32BE(16),640);assert.equal(bytes.readUInt32BE(20),960);
    assert.deepEqual(r.assetDimensions,{width:640,height:960});assert.equal(r.assetFileSizeBytes,bytes.length);
    assert(r.altText.includes(r.exerciseName));assert(r.panelDescription);assert(r.mechanicsSources.length);
    const thumbnail=await readFile(new URL(r.thumbnailPath.slice(1),root));
    assert.equal(thumbnail.readUInt32BE(16),192);assert.equal(thumbnail.readUInt32BE(20),288);
    assert.equal(thumbnail.length,r.thumbnailFileSizeBytes);
    assert(thumbnail.length<bytes.length);
    assert.equal(illustrationUrl(r,'/Achilles_Return/',true),'/Achilles_Return'+r.thumbnailPath);
  }
});
test('shared collection appearances use one file and every physical PNG is accounted for',async()=>{
  const paths=manifest.filter(r=>r.assetStatus==='generated').map(r=>r.assetPath);
  assert.equal(new Set(paths).size,paths.length);
  for(const ex of Object.values(CATALOG)){
    const row=manifest.find(r=>r.exerciseId===ex.id);
    assert(row.sourceCollections.includes('prescribed'));assert(row.sourceCollections.includes('strength-library'));
  }
  const files=await readdir(new URL('assets/exercises/',root),{recursive:true});
  assert.equal(files.filter(p=>p.endsWith('.png')).length,paths.length*2);
  assert.equal(new Set(manifest.filter(r=>r.assetStatus==='generated').map(r=>r.thumbnailPath)).size,paths.length);
});
test('base-path resolver supports relative Vite URLs and Pages subpaths, rejects invalid assets',()=>{
  const row=manifest.find(r=>r.assetStatus==='generated');
  assert.equal(illustrationUrl(row,'./'),'./'+row.assetPath.slice(1));
  assert.equal(illustrationUrl(row,'/Achilles_Return/'),'/Achilles_Return'+row.assetPath);
  assert.equal(illustrationUrl(row,'/Achilles_Return'),'/Achilles_Return'+row.assetPath);
  assert.equal(illustrationUrl(undefined),null);
  assert.equal(illustrationUrl({...row,assetStatus:'not_generated'}),null);
  assert.equal(illustrationUrl({...row,assetPath:'/assets/exercises/../wrong.png'}),null);
});
