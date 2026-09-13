import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const out=fileURLToPath(new URL('../artifacts/',import.meta.url));
const scope='/Achilles_Return/', origin='http://127.0.0.1:4178';
const passed=[];const pass=x=>{passed.push(x);console.log('PASS '+x);};
const server=createServer(async(req,res)=>{
  try{
    const pathname=new URL(req.url,origin).pathname;
    if(!pathname.startsWith(scope))return res.writeHead(404).end();
    const path=resolve(root,pathname.slice(scope.length)||'index.html');
    if(!path.startsWith(root.endsWith(sep)?root:root+sep))return res.writeHead(403).end();
    const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
    res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.end(await readFile(path));
  }catch{res.writeHead(404).end();}
});
await mkdir(out,{recursive:true});await new Promise(r=>server.listen(4178,'127.0.0.1',r));
let browser;
try{
 browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();
 async function library(p){
  await p.goto(origin+scope);
  await p.getByRole('button',{name:/Get Started/}).click();
  await p.getByRole('button',{name:'More',exact:true}).click();
  await p.getByRole('button',{name:'Exercise library',exact:true}).click();
  await p.getByRole('heading',{name:'Your exercise library'}).waitFor();
 }
 await library(page);
 const search=page.getByRole('searchbox');
 await search.fill('Dumbbell Biceps Curl');
 const row=page.locator('[data-exercise-id="db-curl"]');
 await row.locator('img').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('[data-exercise-id="db-curl"] img')?.naturalWidth===640);
 assert((await row.locator('img').getAttribute('src')).startsWith('./assets/'));
 const demo=await row.getByRole('link',{name:/Short Demo/}).getAttribute('href');assert(demo.includes('prehab'));
 await row.screenshot({path:resolve(out,'illustration-strength-thumbnail.png'),style:'.bottom-nav {visibility:hidden}'});
 await row.getByRole('button',{name:/View illustration/}).click();
 assert(await row.locator('.illustration-detail').isVisible());
 await row.screenshot({path:resolve(out,'illustration-strength-detail.png'),style:'.bottom-nav {visibility:hidden}'});
 await row.getByRole('button',{name:'Close illustration'}).focus();await page.keyboard.press('Escape');
 assert.equal(await row.locator('.illustration-detail').count(),0);
 assert.equal(await row.getByRole('button',{name:/View illustration/}).evaluate(e=>document.activeElement===e),true);
 pass('Strength thumbnail, enlarged view, Escape/focus restoration and original demo');
 await search.fill('');await page.getByRole('button',{name:'Show 20 more exercises'}).click();
 assert((await page.locator('[data-exercise-id]').count())>=40);pass('Pagination retains stable exercise IDs');
 await search.fill('Seated unilateral');
 assert(await page.locator('.illustration-unavailable').first().isVisible());
 assert(await page.getByRole('link',{name:/Short Demo:/}).isVisible());
 await page.screenshot({path:resolve(out,'illustration-unavailable.png'),fullPage:true});pass('Missing strength artwork preserves demo and setup');
 await page.getByRole('button',{name:'Mobility',exact:true}).click();
 const mobility=page.locator('[data-exercise-id="wall-slides"]');
 await mobility.scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('[data-exercise-id="wall-slides"] img')?.naturalWidth===640);
 await mobility.locator('summary').click();assert(await mobility.getByRole('link',{name:/Open external demo/}).isVisible());
 await mobility.screenshot({path:resolve(out,'illustration-mobility-thumbnail.png'),style:'.bottom-nav {visibility:hidden}'});
 await mobility.getByRole('button',{name:/View illustration/}).click();
 await mobility.screenshot({path:resolve(out,'illustration-mobility-detail.png'),style:'.bottom-nav {visibility:hidden}'});
 pass('Movement thumbnail/detail and external demo remain available');
 await page.getByRole('combobox',{name:/^Position/}).selectOption('Standing');
 assert(await mobility.isVisible());pass('Movement filters retain image mapping');
 for(const width of [320,390]){
  await page.setViewportSize({width,height:844});await mobility.scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const a=await mobility.locator('.illustration-thumbnail').boundingBox(),b=await mobility.locator('h3').boundingBox();assert(a.x+a.width<=b.x);
 }
 await page.addStyleTag({content:'html {font-size:32px!important}'});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:resolve(out,'illustration-large-text.png'),fullPage:true});
 pass('320px mobile layout and enlarged text reflow');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
 const cached=await page.evaluate(async()=>{const all=await caches.keys();for(const key of all){const cache=await caches.open(key);if(await cache.match('./assets/exercises/movement-library/wall-slides.png'))return true;}return false;});assert(cached);
 await context.setOffline(true);await page.reload();await page.getByRole('button',{name:/Get Started/}).click();
 await page.getByRole('button',{name:'More',exact:true}).click();await page.getByRole('button',{name:'Exercise library',exact:true}).click();
 await page.getByRole('button',{name:'Mobility',exact:true}).click();await page.locator('[data-exercise-id="wall-slides"]').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>document.querySelector('[data-exercise-id="wall-slides"] img')?.naturalWidth===640);
 pass('Project-subpath service-worker install and offline images');
 const broken=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await broken.route('**/assets/exercises/**/*.png',r=>r.abort());
 const bp=await broken.newPage();await library(bp);await bp.getByRole('searchbox').fill('Dumbbell Biceps Curl');
 const br=bp.locator('[data-exercise-id="db-curl"]');await br.scrollIntoViewIfNeeded();await br.locator('.illustration-unavailable').waitFor();assert.equal(await br.locator('img').count(),0);assert(await br.getByRole('link',{name:/Short Demo/}).isVisible());
 await bp.getByRole('button',{name:'Mobility',exact:true}).click();const bm=bp.locator('[data-exercise-id="wall-slides"]');await bm.scrollIntoViewIfNeeded();await bm.locator('.illustration-unavailable').waitFor();assert.equal(await bm.locator('img').count(),0);
 pass('Failed image requests fall back in both libraries without broken icons');
 await writeFile(resolve(out,'illustration-browser-results.json'),JSON.stringify({passed},null,2));
}finally{await browser?.close();server.close();}
