import {strengthTemplate} from "../src/rules/planner.js";
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
await new Promise((resolve) => server.listen(4186, "127.0.0.1", resolve));
let browser, page;
const passed = [];
function pass(name) {
  passed.push(name);
  console.log(`PASS ${name}`);
}


try {
 browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || "msedge",headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}});page=await context.newPage();
 const errors=[];page.on("pageerror",e=>errors.push(e.message));await page.clock.install({time:new Date(2026,8,21,12)});
 await page.goto("http://127.0.0.1:4186"+scope);await page.getByRole("button",{name:"Get Started",exact:true}).click();
 const press=strengthTemplate('A',baselineValues()).items.find(e=>e.id==='db-bench');
 const prior={id:'path-prior',date:'2026-09-18',createdAt:'2026-09-18T12:00:00Z',status:'TOLERATED',readiness:{level:'GREEN'},plannedItems:[press],exerciseLog:{[press.id]:{sets:Array.from({length:press.sets},()=>({complete:true,reps:5,load:50,rpe:7,quality:'good',symptoms:'none'}))}}};
 await page.evaluate(async rows=>{const db=await new Promise(r=>{const q=indexedDB.open('achilles-return-db');q.onsuccess=()=>r(q.result);});await new Promise((r,j)=>{const t=db.transaction([...new Set(rows.map(x=>x.store))],'readwrite');for(const row of rows)t.objectStore(row.store).put(row.value);t.oncomplete=r;t.onerror=j;});db.close();},[
 {store:'profile',value:{id:'athlete',equipment:EQUIPMENT,availableDays:['1','3','5']}},
 {store:'assessments',value:{id:'a',values:baselineValues(),completedAt:'2026-09-21T08:00:00Z',step:0}},
 {store:'checkins',value:{id:'2026-09-21',date:'2026-09-21',readiness:{level:'GREEN',reason:'Baseline',action:'Follow plan'},answers:{}}},
 {store:'sessions',value:prior}]);
 await page.reload();await page.getByRole('button',{name:'Open Workout',exact:true}).click();
 const path=page.locator('.exercise-path').filter({hasText:'Chest pressing'});
 // Match the route by its next exercise; other paths have different equipment destinations.
 const pressPath=page.locator('.exercise-path').filter({hasText:'Smith incline bench press'}).first();
 await pressPath.locator('summary').click();
 const button=pressPath.getByRole('button',{name:'Use next variation for this and future sessions',exact:true});
 assert.equal(await button.isDisabled(),true);
 await pressPath.getByRole('checkbox').check();await page.screenshot({path:resolve(artifacts,'exercise-path-review.png'),fullPage:true});
 await button.click();await page.getByRole('heading',{name:'Smith incline bench press',exact:true}).waitFor();
 pass('Qualified 50 lb pressing milestone exposes a reviewed transition and applies the selected next variation');
 const saved=await page.evaluate(async()=>{const db=await new Promise(r=>{const q=indexedDB.open('achilles-return-db');q.onsuccess=()=>r(q.result);});const get=(store,id)=>new Promise(r=>{const q=db.transaction(store).objectStore(store).get(id);q.onsuccess=()=>r(q.result);});return {profile:await get('profile','athlete'),prior:await get('sessions','path-prior'),changes:await get('settings','workout-changes-2026-09-21')};});
 assert.equal(saved.profile.exerciseChoices['db-bench'].id,'library-smith-incline-bench-press');assert.deepEqual(saved.prior,prior);assert.equal(saved.changes.events.at(-1).pathReview.version,'1.0.0');
 pass('Future exercise choice and path evidence are saved; prior session remains byte-for-byte equivalent');
 await page.reload();await page.getByRole('button',{name:'Open Workout',exact:true}).click();await page.getByRole('heading',{name:'Smith incline bench press',exact:true}).waitFor();
 const newPath=page.locator('.exercise-path').filter({hasText:'Olympic'}).first();
 assert.equal(await page.getByRole('button',{name:'Use next variation for this and future sessions',exact:true}).count(),0);
 assert.deepEqual(errors,[]);pass('Reload preserves the chosen variation without cascading to the next equipment stage or runtime errors');
 await writeFile(resolve(artifacts,'exercise-path-browser-results.json'),JSON.stringify({passed,failed:0},null,2));
} catch(error){console.error(await page?.locator('body').innerText());throw error;}
finally{await browser?.close();await new Promise(r=>server.close(r));}
