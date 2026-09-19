import { baselineValues, reviewed } from "../tests/fixtures.mjs";
import { EQUIPMENT } from "../src/data/catalog.js";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, extname, sep } from "node:path";
import assert from "node:assert/strict";

// Disposable browser profile: never touches the user's browser data.
const root = fileURLToPath(new URL("../dist/", import.meta.url));
const artifacts = fileURLToPath(new URL("../artifacts/", import.meta.url));
await mkdir(artifacts, { recursive: true });
const scope = "/achilles-return-app/";
let workerRevision = 1;
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
};
const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/seed") {
      res.setHeader("Content-Type", "text/html");
      res.end("<title>Isolated migration fixture</title>");
      return;
    }
    if (!pathname.startsWith(scope)) {
      res.writeHead(404).end();
      return;
    }
    const target = resolve(
      root,
      decodeURIComponent(pathname.slice(scope.length)) || "index.html",
    );
    if (!target.startsWith(root.endsWith(sep) ? root : root + sep)) {
      res.writeHead(403).end();
      return;
    }
    res.setHeader(
      "Content-Type",
      types[extname(target)] || "application/octet-stream",
    );
    res.setHeader("Cache-Control", "no-cache");
    const content = await readFile(target);
    res.end(
      extname(target) === ".js" &&
        target.endsWith(`${sep}sw.js`) &&
        workerRevision === 2
        ? content
            .toString()
            .replace(
              /const BUILD = '([^']+)';/,
              "const BUILD = '$1-qa-update';",
            )
        : content,
    );
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(4191, "127.0.0.1", resolve));
let browser, page;
const passed = [];
function pass(name) {
  passed.push(name);
  console.log(`PASS ${name}`);
}


try {
 browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || "msedge",headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}});page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date(2026,8,23,12)});
 const url='http://127.0.0.1:4191'+scope;
 await page.goto(url);await page.getByRole('button',{name:'Get Started',exact:true}).click();
 const rows=[
 {store:'profile',value:{id:'athlete',strengthStyle:'conditioning',equipment:EQUIPMENT,availableDays:['1','3','5']}},
 {store:'assessments',value:{id:'a',values:baselineValues(),completedAt:'2026-09-23T08:00:00Z',updatedAt:'2026-09-23T08:00:00Z',step:0}},
 {store:'capabilityStates',value:{id:'checkpoints',values:reviewed('deceleration','plannedCut')}},
 {store:'checkins',value:{id:'2026-09-23',date:'2026-09-23',readiness:{level:'GREEN',reason:'Normal baseline',action:'Follow plan'},answers:{pain:'none',stiffness:'normal',swelling:'normal',previousResponse:'good',recovery:'good',unusualSymptoms:[]}}},
 ...[['run','running','R3','2026-09-18'],['cod','cod','D4','2026-09-21']].map(([id,domain,exposureLevel,date])=>({store:'sessions',value:{id,domain,exposureLevel,date,createdAt:date+'T08:00:00Z',status:'TOLERATED',movementQuality:'good',progressionEligible:true,exerciseLog:{}}}))];
 await page.evaluate(async rows=>{const db=await new Promise(r=>{const q=indexedDB.open('achilles-return-db');q.onsuccess=()=>r(q.result)});await new Promise((r,j)=>{const tx=db.transaction([...new Set(rows.map(x=>x.store))],'readwrite');for(const x of rows)tx.objectStore(x.store).put(x.value);tx.oncomplete=r;tx.onerror=()=>j(tx.error)});db.close()},rows);

 await page.reload();
 await page.getByRole('button',{name:/^(Open|Resume) Workout$/}).click();
 await page.getByRole('heading',{name:'Rehab & Conditioning',exact:true}).waitFor();
 const fullCount=await page.locator('.exercise-card').count();
 await page.getByText('Session options',{exact:true}).click();
 await page.getByLabel('Essential rehab session',{exact:true}).check();
 assert.equal(await page.locator('.exercise-card').count(),fullCount-6);
 await page.getByRole('button',{name:'Choose Full',exact:true}).click();
 assert.equal(await page.locator('.exercise-card').count(),fullCount);
 await page.getByRole('button',{name:'Choose Essential',exact:true}).click();
 await page.screenshot({path:resolve(artifacts,'essential-rehab-mobile.png'),fullPage:false});
 await page.getByLabel('Step-Up set 2 reps',{exact:true}).fill('10');
 await page.getByRole('button',{name:'Step-Up set 2 complete',exact:true}).click();
 await page.getByRole('button',{name:'← Today',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:/^(Open|Resume) Workout$/}).click();
 await page.getByText('Session options',{exact:true}).click();
 assert.ok(await page.getByLabel('Essential rehab session',{exact:true}).isChecked());
 assert.equal(await page.getByLabel('Step-Up set 2 reps',{exact:true}).inputValue(),'10');
 pass('Shorter choice and logged sets persist together after reload');
 const block=page.getByRole('region',{name:'Running and sport block',exact:true});
 await block.waitFor();
 await block.getByLabel('Actual minutes',{exact:true}).fill('4');
 await block.getByLabel('Session RPE (0–10)',{exact:true}).fill('5');
 if(await block.getByLabel('Total distance (metres)',{exact:true}).count()) await block.getByLabel('Total distance (metres)',{exact:true}).fill('40');
 await block.getByLabel('Movement quality',{exact:true}).selectOption('good');
 await block.getByLabel('Immediate Achilles response',{exact:true}).selectOption('good');
 await context.setOffline(true);
 await block.getByRole('button',{name:'Save exposure',exact:true}).click();
 await page.getByRole('heading',{name:'Running / sport work saved',exact:true}).waitFor();
 assert.equal(await page.getByLabel('Step-Up set 2 reps',{exact:true}).inputValue(),'10');
 assert.equal(await page.getByRole('button',{name:'Finish Workout',exact:true}).count(),1);
 assert.equal(await page.getByRole('region',{name:'Running and sport block',exact:true}).count(),0);
 pass('Embedded exposure saves offline without leaving workout or losing sets; no duplicate logger');
 await page.getByRole('button',{name:'Finish Workout',exact:true}).click();
 await page.getByRole('heading',{name:'Session review',exact:true}).waitFor();
 await page.screenshot({path:resolve(artifacts,'unified-session-finish-mobile.png'),fullPage:false});
 await page.getByText('Completed, unfinished & previous session',{exact:true}).click();
 assert.match(await page.getByRole('region',{name:'Session review',exact:true}).innerText(),/Partially completed/);
 await page.screenshot({path:resolve(artifacts,'unified-session-review-mobile.png'),fullPage:true});
 await page.locator('input[name="difficulty"][value="right"]').check();
 await page.locator('input[name="achilles"][value="good"]').check();
 await page.getByRole('button',{name:'Save Workout',exact:true}).click();
 await page.getByRole('heading',{name:'Today',exact:true}).waitFor();
 assert.match(await page.getByLabel('Coaching report',{exact:true}).inputValue(),/Session choice: shorter/);
 assert.match(await page.getByLabel('Coaching report',{exact:true}).inputValue(),/Associated running/);
 const saved=await page.evaluate(async()=>{const db=await new Promise(r=>{const q=indexedDB.open('achilles-return-db');q.onsuccess=()=>r(q.result)});const rows=await new Promise(r=>{const q=db.transaction('sessions').objectStore('sessions').getAll();q.onsuccess=()=>r(q.result)});db.close();return rows});
 const strength=saved.find(s=>s.date==='2026-09-23' && !s.domain);
 assert.equal(strength.sessionMode,'shorter');assert.equal(strength.sessionOptionLabel,'Essential');assert.equal(strength.omittedOptionalIds.length,6);assert.ok(strength.omittedOptionalIds.every(id=>!strength.exerciseLog[id]?.sets?.some(s=>s?.complete)));assert.equal(strength.linkedExposureIds.length,1);
 assert.equal(strength.status,'PENDING_NEXT_DAY_RESPONSE');assert.equal(saved.length,4);
 assert.deepEqual(errors,[]);
 pass('Finish summary, linked separate records and immediate coaching report preserve tolerance requirements');
 await writeFile(resolve(artifacts,'unified-session-browser-results.json'),JSON.stringify({passed,failed:0},null,2));
} catch(e){console.error(await page?.locator('body').innerText());throw e;}finally{await browser?.close();await new Promise(r=>server.close(r));}

