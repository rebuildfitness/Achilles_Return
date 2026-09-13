import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const manifest=JSON.parse(await readFile(join(root,'public/assets/exercises/manifests/exercise-illustrations.json'),'utf8'));
const generated=manifest.filter(r=>r.assetStatus==='generated');
const sizes=generated.map(r=>r.assetFileSizeBytes).sort((a,b)=>a-b);
const total=sizes.reduce((a,b)=>a+b,0);
const thumbnailBytes=generated.reduce((sum,r)=>sum+r.thumbnailFileSizeBytes,0);
const counts=key=>Object.fromEntries([...new Set(generated.map(key))].map(k=>[k,generated.filter(r=>key(r)===k).length]));
async function bytesIn(dir) {
  let total=0;
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const path=join(dir,entry.name);
    total+=entry.isDirectory()?await bytesIn(path):entry.name==='sw.js'?0:(await stat(path)).size;
  }
  return total;
}
const productionBytes=await bytesIn(join(root,'dist')).catch(()=>null);
const worker=await readFile(join(root,'dist/sw.js'),'utf8');
const core=JSON.parse(worker.match(/const CORE = (\[[^\n]+\]);/)[1]);
const precache=(await Promise.all([...new Set(core.filter(path=>path!=='./'))].map(path=>stat(join(root,'dist',path)).then(s=>s.size)))).reduce((a,b)=>a+b,0);
const summary={canonicalIds:manifest.length,generated:generated.length,unresolved:manifest.length-generated.length,
  duplicateAppearances:manifest.reduce((n,r)=>n+r.sourceCollections.length-1,0),motionFormats:counts(r=>r.motionFormat),
  modelRepresentation:counts(r=>r.modelRepresentation.genderPresentation),raceEthnicityPresentation:counts(r=>r.modelRepresentation.raceEthnicityPresentation),imageBytes:total,
  meanBytes:sizes.length?Math.round(total/sizes.length):0,
  medianBytes:sizes.length?(sizes[Math.floor((sizes.length-1)/2)]+sizes[Math.floor(sizes.length/2)])/2:0,
  largest:generated.toSorted((a,b)=>b.assetFileSizeBytes-a.assetFileSizeBytes)[0]?.exerciseId,
  largestBytes:sizes.at(-1)||0,over250KB:generated.filter(r=>r.assetFileSizeBytes>250000).map(r=>r.exerciseId),
  over400KB:generated.filter(r=>r.assetFileSizeBytes>400000).map(r=>r.exerciseId),thumbnailBytes,meanThumbnailBytes:Math.round(thumbnailBytes/generated.length),thumbnailSavingsPercent:Math.round((1-thumbnailBytes/total)*100),productionBytes,initialPrecacheBytes:precache,onDemandImageBytes:total+thumbnailBytes,
  initialPrecacheBudgetBytes:15000000,cacheDecisionRequired:precache===null?null:precache>15000000};
await writeFile(join(root,'artifacts/illustration-audit-results.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
