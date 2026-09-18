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
await new Promise((resolve) => server.listen(4187, "127.0.0.1", resolve));
let browser, page;
const passed = [];
function pass(name) {
  passed.push(name);
  console.log(`PASS ${name}`);
}


try {
 browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || "msedge",headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}});page=await context.newPage();
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.clock.install({time:new Date(2026,8,14,12)});
 const url="http://127.0.0.1:4187"+scope;
 await page.goto(url);await page.getByRole("button",{name:"Get Started",exact:true}).click();
 const seed=async rows=>page.evaluate(async rows=>{
 const db=await new Promise((r,j)=>{const q=indexedDB.open("achilles-return-db");q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error);});
 await new Promise((r,j)=>{const tx=db.transaction([...new Set(rows.map(x=>x.store))],"readwrite");for(const row of rows)tx.objectStore(row.store).put(row.value);tx.oncomplete=r;tx.onerror=()=>j(tx.error);});db.close();},rows);
 const readStore=async name=>page.evaluate(async name=>{const db=await new Promise(r=>{const q=indexedDB.open("achilles-return-db");q.onsuccess=()=>r(q.result);});const rows=await new Promise(r=>{const q=db.transaction(name).objectStore(name).getAll();q.onsuccess=()=>r(q.result);});db.close();return rows;},name);
 const good={level:"GREEN",reason:"At your normal baseline.",action:"Follow your plan."};
 const historic={id:"historic",date:"2026-09-11",createdAt:"2026-09-11T12:00:00Z",status:"TOLERATED",workoutId:"strength-C",workoutTitle:"Original completed workout",exerciseLog:{}};
 await seed([
 {store:"profile",value:{id:"athlete",strengthStyle:"hybrid",equipment:EQUIPMENT,availableDays:["1","3","5"]}},
 {store:"assessments",value:{id:"a",values:{...baselineValues(),heel_repaired_reps:"0"},completedAt:"2026-09-14T08:00:00Z",updatedAt:"2026-09-14T08:00:00Z",step:0}},
 ...["2026-09-14","2026-09-16"].map(date=>({store:"checkins",value:{id:date,date,readiness:good,answers:{pain:"none",stiffness:"normal",swelling:"normal",previousResponse:"good",recovery:"good",unusualSymptoms:[]}}})),
 {store:"sessions",value:historic}]);
 await page.reload();await page.getByRole("heading",{name:"Today",exact:true}).waitFor();
 await page.getByRole('button',{name:'View dedicated rehab workout',exact:true}).click();
 await page.getByRole('heading',{name:'Achilles Rehab & Conditioning',exact:true}).waitFor();
 assert.ok(await page.locator('.exercise-card').count() >= 18);
 assert.equal(await page.getByRole('button',{name:'Finish Workout',exact:true}).count(),0);
 assert.equal(await page.getByRole('button',{name:'Open scheduled rehab workout',exact:true}).count(),0);
 assert.equal((await readStore('profile'))[0].strengthStyle,'hybrid');
 assert.deepEqual((await readStore('sessions'))[0],historic);
 await page.screenshot({path:resolve(artifacts,'rehab-preview-mobile.png'),fullPage:false});
 await page.getByRole('button',{name:'Back to Today',exact:true}).click();
 pass('Full rehab preview is visible before activation and on a non-rehab day without starting or logging work');
 await page.getByRole('button',{name:'Use dedicated rehab schedule',exact:true}).click();
 await page.getByText('Dedicated Achilles Rehab & Conditioning replaces your B session from 2026-09-15.',{exact:false}).waitFor();
 assert.equal((await readStore('profile'))[0].strengthStyle,'conditioning');
 assert.deepEqual((await readStore('sessions'))[0],historic);
 assert.equal(await page.getByRole('heading',{name:'Strength A · Strength & Hypertrophy',exact:true}).count(),1);
 pass('Dedicated schedule starts tomorrow, preserves today and does not alter completed history');
 await page.clock.setFixedTime(new Date(2026,8,16,12));await page.reload();
 await page.getByRole('heading',{name:'Achilles Rehab & Conditioning',exact:true}).waitFor();
 await page.getByRole('button',{name:/^(Open|Resume) Workout$/}).click();
 await page.getByRole('heading',{name:'Rehab & Conditioning',exact:true}).waitFor();
 assert.ok(await page.locator('.exercise-card').count() >= 18);
 assert.equal(await page.getByRole('link',{name:'Short Demo',exact:true}).count(),await page.locator('.exercise-card').count());
 assert.equal(await page.getByRole('button',{name:/^View illustration for /}).count(),await page.locator('.exercise-card').count());
 await page.getByLabel('Session block',{exact:true}).selectOption('Circuit A · Strength & control');
 await page.getByLabel('Round view',{exact:true}).selectOption('2');
 assert.ok(await page.locator('.exercise-card').count() >= 3);
 assert.equal(await page.getByLabel('Step-Up set 2 reps',{exact:true}).count(),1);
 assert.equal(await page.getByLabel('Step-Up set 1 reps',{exact:true}).count(),0);
 await page.getByLabel('Step-Up set 2 reps',{exact:true}).fill('10');
 await page.getByRole('button',{name:'Step-Up set 2 complete',exact:true}).click();
 pass('Block and round navigation retain prescribed indices, demos, illustrations and actual set logging');
 await page.getByLabel('Session block',{exact:true}).selectOption('Finisher · Conditioning');
 await page.getByRole('button',{name:'Start activity timer',exact:true}).click();
 assert.equal(await page.getByLabel('Stationary cycling time remaining',{exact:true}).innerText(),'10:00');
 await page.getByLabel('Stationary cycling set 1 reps',{exact:true}).fill('600');
 await page.getByRole('button',{name:'Stationary cycling set 1 complete',exact:true}).click();
 await page.getByRole('button',{name:'← Today',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:/^(Open|Resume) Workout$/}).click();
 assert.equal(await page.getByLabel('Stationary cycling set 1 reps',{exact:true}).inputValue(),'600');
 assert.equal(await page.getByRole('button',{name:'Step-Up set 2 complete',exact:true}).getAttribute('aria-pressed'),'true');
 assert.match(await page.getByLabel('Stationary cycling time remaining',{exact:true}).innerText(),/^\d+:\d\d$/);
 await page.screenshot({path:resolve(artifacts,'rehab-conditioning-mobile.png'),fullPage:true});
 for(const width of [320,1280]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await page.setViewportSize({width:390,height:844});
 pass('Activity timer and logged rounds survive reload; mobile and desktop fit');
 await context.setOffline(true);
 await page.getByRole('button',{name:'Finish Workout',exact:true}).click();
 await page.locator('input[name="difficulty"][value="right"]').check();await page.locator('input[name="achilles"][value="good"]').check();
 await page.getByRole('button',{name:'Save Workout',exact:true}).click();
 await page.getByRole('heading',{name:'Today',exact:true}).waitFor();
 const saved=(await readStore('sessions')).find(s=>s.id!=='historic');
 assert.equal(saved.sessionFormat,'rehab-conditioning');assert.equal(saved.status,'PENDING_NEXT_DAY_RESPONSE');
 assert.equal(saved.exerciseLog['library-stationary-cycling'].sets[0].reps,'600');
 assert.match(await page.getByLabel('Coaching report',{exact:true}).inputValue(),/rehab-conditioning/);
 assert.deepEqual((await readStore('sessions')).find(s=>s.id==='historic'),historic);
 await page.getByRole('button',{name:'View dedicated rehab workout',exact:true}).click();
 await page.getByRole('heading',{name:'Achilles Rehab & Conditioning',exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Open scheduled rehab workout',exact:true}).count(),0);
 assert.equal((await readStore('sessions')).length,2);
 pass('Rehab preview remains accessible offline after saving without offering a duplicate workout');
 assert.deepEqual(errors,[]);
 pass('Offline finish preserves actual work and history; immediate report includes format and pending tolerance');
 await writeFile(resolve(artifacts,'rehab-conditioning-browser-results.json'),JSON.stringify({passed,failed:0},null,2));
} catch(error) {console.error(await page?.locator('body').innerText());await page?.screenshot({path:resolve(artifacts,'rehab-conditioning-failure.png'),fullPage:true});throw error;}
finally {await browser?.close();await new Promise(r=>server.close(r));}
