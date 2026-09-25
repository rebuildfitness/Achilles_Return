import {strengthTemplate,modifyWorkout} from "../src/rules/planner.js";
import { baselineValues } from "../tests/fixtures.mjs";
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
await new Promise((resolve) => server.listen(4188, "127.0.0.1", resolve));
let browser, page;
const passed = [];
function pass(name) {
  passed.push(name);
  console.log(`PASS ${name}`);
}


try {
 browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || "msedge",headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}});page=await context.newPage();
 const errors=[];page.on("pageerror",e=>errors.push(e.message));await page.clock.install({time:new Date(2026,8,23,12)});
 await page.goto("http://127.0.0.1:4188"+scope);await page.getByRole("button",{name:"Get Started",exact:true}).click();
 const seed=async rows=>page.evaluate(async rows=>{const db=await new Promise(r=>{const q=indexedDB.open("achilles-return-db");q.onsuccess=()=>r(q.result);});await new Promise((r,j)=>{const tx=db.transaction([...new Set(rows.map(x=>x.store))],"readwrite");rows.forEach(x=>tx.objectStore(x.store).put(x.value));tx.oncomplete=r;tx.onerror=()=>j(tx.error);});db.close();},rows);
 const read=async name=>page.evaluate(async name=>{const db=await new Promise(r=>{const q=indexedDB.open("achilles-return-db");q.onsuccess=()=>r(q.result);});const rows=await new Promise(r=>{const q=db.transaction(name).objectStore(name).getAll();q.onsuccess=()=>r(q.result);});db.close();return rows;},name);
 const values=baselineValues();const w=modifyWorkout(strengthTemplate('B',values,'conditioning'),'GREEN',EQUIPMENT);
 const prior={id:'prior-rehab',date:'2026-09-16',createdAt:'2026-09-16T12:00:00Z',sessionFormat:'rehab-conditioning',templateVersion:'2.0.0',workoutId:'strength-B',workoutTitle:w.title,status:'PENDING_NEXT_DAY_RESPONSE',readiness:{level:'GREEN'},plannedItems:w.items,exerciseLog:Object.fromEntries(w.items.map(e=>[e.id,{sets:Array.from({length:e.sets},()=>({complete:true,reps:String(Number(e.reps.match(/\d+[–-](\d+)/)?.[1]||e.reps.match(/\d+/)?.[0])),load:'0',rpe:'7',quality:'good',symptoms:'none'}))}]))};
 const recent={id:'recent-strength',date:'2026-09-21',createdAt:'2026-09-21T12:00:00Z',workoutId:'strength-A',status:'TOLERATED',exerciseLog:{}};
 await seed([{store:'profile',value:{id:'athlete',equipment:EQUIPMENT,availableDays:['1','3','5'],strengthStyle:'conditioning'}},{store:'assessments',value:{id:'a',values,completedAt:'2026-09-23T08:00:00Z',updatedAt:'2026-09-23T08:00:00Z'}},{store:'sessions',value:prior},{store:'sessions',value:recent},{store:'checkins',value:{id:'2026-09-23',date:'2026-09-23',readiness:{level:'GREEN',reason:'Normal baseline',action:'Follow plan'},answers:{pain:'none',stiffness:'normal',swelling:'normal',previousResponse:'good',recovery:'good',unusualSymptoms:[]}}}]);
 await page.reload();await page.getByRole('heading',{name:'Today',exact:true}).waitFor();
 await page.getByRole('button',{name:'Record next-morning response',exact:true}).first().click();
 await page.locator('#field-change').selectOption('baseline');await page.locator('#field-functionChange').selectOption('no');await page.locator('#field-repeatedWorsening').selectOption('no');await page.getByRole('button',{name:'Save next-morning response',exact:true}).click();
 await page.getByRole('button',{name:/^(Open|Resume) Workout$/}).click();
 await page.getByRole('heading',{name:'Dumbbell-loaded single-leg calf raise',exact:true}).waitFor();
 assert.equal(await page.getByRole('heading',{name:'Single-Leg Balance',exact:true}).count(),1);
 assert.equal(await page.getByRole('heading',{name:'Single-leg foam-pad balance',exact:true}).count(),0);
 await page.getByText('Rehab progression — what changed?',{exact:true}).click();
 await page.getByRole('heading',{name:'Circuit B · Achilles & movement: Advancing',exact:true}).waitFor();
 pass('Saving qualified next-morning feedback automatically inserts loaded calf work and explains the source milestone');
 await page.getByLabel('Dumbbell-loaded single-leg calf raise set 1 reps',{exact:true}).fill('6');
 await page.getByLabel('Dumbbell-loaded single-leg calf raise set 1 load',{exact:true}).fill('5');
 await page.getByRole('button',{name:'Dumbbell-loaded single-leg calf raise set 1 complete',exact:true}).click();
 assert.equal(await page.getByRole('heading',{name:'Single-leg foam-pad balance',exact:true}).count(),0);
 await page.reload();await page.getByRole('button',{name:/^(Open|Resume) Workout$/}).click();
 assert.equal(await page.getByLabel('Dumbbell-loaded single-leg calf raise set 1 load',{exact:true}).inputValue(),'5');
 assert.equal(await page.getByRole('heading',{name:'Single-Leg Balance',exact:true}).count(),1);
 pass('Logging and reload keep the selected variation, separate working load and one-block progression limit');
 await page.getByText('Rehab progression — what changed?',{exact:true}).click();await page.locator('.rehab-progression').screenshot({path:resolve(artifacts,'rehab-block-progression.png')});
 await context.setOffline(true);await page.getByRole('button',{name:'Finish Workout',exact:true}).click();await page.locator('input[name="difficulty"][value="right"]').check();await page.locator('input[name="achilles"][value="good"]').check();await page.getByRole('button',{name:'Save Workout',exact:true}).click();
 await page.getByRole('heading',{name:'Today',exact:true}).waitFor();
 const records=await read('sessions'),saved=records.find(s=>!['prior-rehab','recent-strength'].includes(s.id));
 assert.equal(saved.status,'PENDING_NEXT_DAY_RESPONSE');assert.equal(saved.blockMatrixVersion,'1.1.0');assert.equal(saved.blockProgression.find(r=>r.originId==='single-calf').action,'ADVANCE');
 assert.deepEqual(records.find(s=>s.id==='recent-strength'),recent);assert.deepEqual(records.find(s=>s.id==='prior-rehab').exerciseLog,prior.exerciseLog);
 assert.match(await page.getByLabel('Coaching report',{exact:true}).inputValue(),/Rehab block decisions/);
 pass('Offline save and coaching export retain decision evidence without rewriting previous sets or assuming tolerance');
 const audits=(await read('decisions')).filter(x=>x.decisionType==='AUTOMATIC_PLAN');assert(audits.some(a=>a.plan.some(d=>d.rehabBlocks?.some(r=>r.action==='ADVANCE'))));assert.deepEqual(errors,[]);
 pass('Versioned automatic-plan audit includes block decisions with no browser runtime errors');
 await writeFile(resolve(artifacts,'rehab-block-browser-results.json'),JSON.stringify({passed,failed:0},null,2));
} catch(error) {console.error(await page?.locator('body').innerText());await page?.screenshot({path:resolve(artifacts,'rehab-block-failure.png'),fullPage:true});throw error;}
finally {await browser?.close();await new Promise(r=>server.close(r));}
