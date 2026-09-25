import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';
import { customDefinition } from '../src/domain/v2/composition.js';
import manifest from '../public/assets/exercises/manifests/exercise-illustrations.json' with {type:'json'};
const out=resolve('artifacts/v2-illustrations'),root=resolve('dist');
await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{
 try{const p=new URL(req.url,'http://localhost').pathname;
 const file=resolve(root,p.replace(/^\/qa\//,'')||'index.html');
 if(!file.startsWith(root+sep))throw Error('path');
 res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');
 res.end(await readFile(file));}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();
const passed=[],errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{if(r.url().includes('/assets/exercises/')&&r.url().endsWith('.png'))requests.push(r.url());});
const pass=t=>{passed.push(t);console.log('PASS ILLUSTRATIONS '+t);};
const b=(name,scope=page)=>scope.getByRole('button',{name,exact:true});
const saved=()=>page.getByText('Saved on this device',{exact:true}).waitFor();
const picker=()=>page.getByRole('dialog',{name:'Choose an exercise',exact:true});
const cards=()=>page.locator('.builder-exercise');
const loaded=async(scope)=>{
 const img=scope.locator('.illustration-thumbnail img').first();await img.scrollIntoViewIfNeeded();
 await img.evaluate(el=>el.complete&&el.naturalWidth>0?undefined:new Promise((r,j)=>{el.onload=r;el.onerror=()=>j(Error('image failed'));}));
 assert(await img.evaluate(el=>el.naturalWidth>0));
};
const shot=async(name)=>{await page.screenshot({path:resolve(out,name+'.png'),fullPage:true});await page.screenshot({path:resolve(out,name+'-viewport.png')});};
const fit=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
const sizes=[320,390,768,1280];
async function responsive(scope){for(const width of sizes){await page.setViewportSize({width,height:900});await loaded(scope);await fit();}}
async function records(store,rows){return page.evaluate(async({store,rows})=>{
 const db=await new Promise((r,j)=>{const q=indexedDB.open('achilles-return-db');q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error);});
 return new Promise((r,j)=>{const tx=db.transaction(store,rows?'readwrite':'readonly');let q;
 if(rows)rows.forEach(x=>tx.objectStore(store).put(x));else q=tx.objectStore(store).getAll();
 tx.oncomplete=()=>{db.close();r(q?.result)};tx.onabort=()=>j(tx.error);});
},{store,rows});}
async function openImage(scope){await loaded(scope);const trigger=scope.locator('.illustration-thumbnail').first();await trigger.focus();await page.keyboard.press('Enter');
 const modal=page.locator('dialog.illustration-detail[open]');await modal.waitFor();
 await modal.locator('img').evaluate(el=>el.complete&&el.naturalWidth?undefined:new Promise((r,j)=>{el.onload=r;el.onerror=()=>j(Error('detail failed'));}));
 await modal.getByRole('heading').waitFor();return{trigger,modal};}
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/qa/`);
 await page.getByRole('heading',{name:'Today',exact:true}).waitFor();
 assert.equal(requests.length,0);pass('Startup does not preload the exercise image library');
 await b('Start Blank Workout').click();await saved();await b('Add exercise').click();
 await picker().getByLabel('Search exercises').fill('Bilateral Standing Calf');
 // Exact canonical result, not a name-based artwork substitution.
 const result=picker().locator('[data-exercise-id="bilateral-calf"]');
 await loaded(result);assert((await result.locator('img').getAttribute('src')).endsWith(manifest.find(x=>x.exerciseId==='bilateral-calf').thumbnailPath));
 await responsive(result);await shot('picker-desktop');await page.setViewportSize({width:390,height:844});await shot('picker-mobile');
 const p=await openImage(result);await shot('picker-enlarged');await page.keyboard.press('Escape');
 await picker().waitFor();assert(await p.trigger.evaluate(el=>el===document.activeElement));
 assert(await result.getByRole('link',{name:/Short Demo/}).count());
 pass('Picker canonical thumbnail, direct demo, nested keyboard dialog and all four widths');
 await result.getByRole('button',{name:/^Add /}).click();await saved();
 await loaded(cards().first());await responsive(cards().first());await shot('builder');
 await page.setViewportSize({width:320,height:844});await shot('builder-320');
 await page.getByLabel('Target format',{exact:true}).first().selectOption('reps');await saved();
 await b('Duplicate exercise',cards().first()).click();await saved();
 assert.equal(await cards().count(),2);
 const ids=await cards().evaluateAll(xs=>xs.map(x=>x.dataset.occurrence));assert.notEqual(ids[0],ids[1]);
 assert.equal(await cards().nth(0).locator('.illustration-thumbnail img').getAttribute('src'),await cards().nth(1).locator('.illustration-thumbnail img').getAttribute('src'));
 const panelIds=await cards().locator('.illustration-thumbnail').evaluateAll(xs=>xs.map(x=>x.getAttribute('aria-controls')));assert.notEqual(panelIds[0],panelIds[1]);
 pass('Builder thumbnails preserve repeated occurrence identities and unique dialog IDs');
 await b('Start Workout').click();await page.locator('.execution-set').first().waitFor();await saved();
 await responsive(cards().first());await page.setViewportSize({width:390,height:844});await shot('active-workout');
 const before=await records('v2WorkoutSessions');
 const a=await openImage(cards().first());await shot('enlarged-active');await b('Close illustration',a.modal).click();
 assert(await a.trigger.evaluate(el=>el===document.activeElement));assert.deepEqual(await records('v2WorkoutSessions'),before);
 assert(await cards().first().getByRole('link',{name:/Short Demo/}).count());
 await page.locator('.execution-set').first().getByRole('group',{name:'Actual performance',exact:true}).getByLabel('Reps',{exact:true}).fill('8');await saved();
 await b('Complete set',page.locator('.execution-set').first()).click();await saved();
 pass('Active thumbnails and modal do not mutate sessions or interfere with logging; demos remain');
 const custom=customDefinition({name:'Synthetic custom image-free exercise'});await records('v2ExerciseDefinitions',[custom]);
 await page.reload();await b('Resume Workout').first().click();await saved();
 await b('Add exercise').click();await picker().getByLabel('Search exercises').fill('Synthetic custom image-free');
 await picker().getByText('Illustration unavailable',{exact:true}).waitFor();await shot('custom-fallback');
 await picker().getByRole('button',{name:/^Add /}).click();await saved();
 assert(await cards().last().getByText('Illustration unavailable',{exact:true}).count());
 pass('Unmapped custom exercise remains selectable and loggable without fabricated artwork');
 await page.evaluate(()=>location.hash='Learn');await page.getByRole('heading',{name:'Rehab Guide',exact:true}).waitFor();
 await b('2. Foundational Strength').click();const guide=page.locator('.final-exercise').first();
 await responsive(guide);await page.setViewportSize({width:390,height:844});await guide.scrollIntoViewIfNeeded();await shot('rehab-guide');
 for(let i=1;i<=9;i++){
 await page.getByRole('button',{name:new RegExp('^'+i+'\\. ')}).click();
 for(const ex of await page.locator('.final-exercise').all()){
 const id=await ex.locator('[data-exercise-id]').getAttribute('data-exercise-id');
 if(manifest.some(x=>x.exerciseId===id)){await loaded(ex);}else{assert(await ex.getByText('Illustration unavailable',{exact:true}).count());}
 assert(await ex.getByRole('button',{name:'Add to workout',exact:true}).isEnabled());
 }
 }
 await page.locator('.final-exercise').first().scrollIntoViewIfNeeded();await shot('unmapped-guide');
 pass('All nine Guide phases use exact mappings or fallback without phase permission or missing-image locks');
 await b('2. Foundational Strength').click();await loaded(guide);const g=await openImage(guide);await page.keyboard.press('Escape');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();
 await b('2. Foundational Strength').click();await loaded(guide);await openImage(guide);await page.keyboard.press('Escape');
 // Wait for request-based image cache commits before cutting connectivity.
 await page.waitForFunction(async()=>{const cacheNames=await caches.keys();for(const n of cacheNames){const c=await caches.open(n);const keys=await c.keys();if(keys.some(k=>k.url.includes('/thumbnails/bilateral-calf.png')))return true;}return false;});
 await context.setOffline(true);await page.reload();await b('2. Foundational Strength').click();await loaded(guide);await guide.scrollIntoViewIfNeeded();await shot('offline-illustration');
 await openImage(guide);await page.keyboard.press('Escape');
 await page.evaluate(()=>location.hash='Today');await b('Resume Workout').first().click();await saved();await loaded(cards().first());
 await openImage(cards().first());await page.keyboard.press('Escape');await shot('offline-active');
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:'Today',exact:true}).click();await b('Start Blank Workout').click();await saved();await b('Add exercise').click();
 await picker().getByLabel('Search exercises').fill('Bilateral Standing Calf');await loaded(result);
 await result.getByRole('button',{name:/^Add /}).click();await saved();await loaded(cards().first());
 pass('Cached thumbnails and enlarged image survive offline reload in Guide, active workout, Picker and Builder');
 await context.setOffline(false);
 // Force image failure in a fresh disposable context with no service-worker/cache.
 const failContext=await browser.newContext({serviceWorkers:'block',viewport:{width:320,height:844}}),failPage=await failContext.newPage();
 await failPage.route('**/assets/exercises/**/*.png',r=>r.abort());
 await failPage.goto(`http://127.0.0.1:${server.address().port}/qa/#Learn`);
 await failPage.getByRole('button',{name:'2. Foundational Strength',exact:true}).click();
 const failed=failPage.locator('.final-exercise').first();await failed.scrollIntoViewIfNeeded();await failed.getByText('Connect to load illustration',{exact:true}).waitFor();
 assert(await failed.getByRole('button',{name:'Retry',exact:true}).isEnabled());assert(await failed.getByRole('button',{name:'Add to workout',exact:true}).isEnabled());
 await failPage.screenshot({path:resolve(out,'image-failure.png'),fullPage:true});await failContext.close();
 pass('Failed local asset has accessible retry and preserves exercise actions');
 assert.deepEqual(errors,[]);
 await writeFile(resolve(out,'browser-results.json'),JSON.stringify({passed,errors,mappings:manifest.length},null,2));
}catch(e){await shot('failure');throw e;}finally{await context.close();await browser.close();await new Promise(r=>server.close(r));}
