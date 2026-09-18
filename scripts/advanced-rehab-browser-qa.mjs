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
await new Promise((resolve) => server.listen(4189, "127.0.0.1", resolve));
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
 const url='http://127.0.0.1:4189'+scope;
 await page.goto(url);await page.getByRole('button',{name:'Get Started',exact:true}).click();
 const rows=[
 {store:'profile',value:{id:'athlete',strengthStyle:'conditioning',equipment:EQUIPMENT,availableDays:['1','3','5']}},
 {store:'assessments',value:{id:'a',values:baselineValues(),completedAt:'2026-09-23T08:00:00Z',updatedAt:'2026-09-23T08:00:00Z',step:0}},
 {store:'capabilityStates',value:{id:'checkpoints',values:reviewed('deceleration','plannedCut')}},
 {store:'checkins',value:{id:'2026-09-23',date:'2026-09-23',readiness:{level:'GREEN',reason:'Normal baseline',action:'Follow plan'},answers:{pain:'none',stiffness:'normal',swelling:'normal',previousResponse:'good',recovery:'good',unusualSymptoms:[]}}},
 ...[['run','running','R3','2026-09-18'],['cod','cod','D4','2026-09-21']].map(([id,domain,exposureLevel,date])=>({store:'sessions',value:{id,domain,exposureLevel,date,createdAt:date+'T08:00:00Z',status:'TOLERATED',movementQuality:'good',progressionEligible:true,exerciseLog:{}}}))];
 await page.evaluate(async rows=>{const db=await new Promise(r=>{const q=indexedDB.open('achilles-return-db');q.onsuccess=()=>r(q.result)});await new Promise((r,j)=>{const tx=db.transaction([...new Set(rows.map(x=>x.store))],'readwrite');for(const x of rows)tx.objectStore(x.store).put(x.value);tx.oncomplete=r;tx.onerror=()=>j(tx.error)});db.close()},rows);
 await page.reload();await page.getByRole('navigation').getByRole('button',{name:'Progress',exact:true}).click();await page.getByRole('button',{name:'Sport',exact:true}).click();
 await page.getByRole('button',{name:'Open D5 exposure',exact:true}).click();
 await page.getByRole('link',{name:/Short Demo · Crossovers/}).waitFor();
 assert.equal(await page.getByRole('link',{name:/Short Demo · Crossovers/}).count(),1);
 assert.equal(await page.getByRole('link',{name:/Short Demo · Backward jog/}).count(),1);
 await page.getByLabel('Crossovers / carioca',{exact:true}).check();await page.getByLabel('Backward jog — previously reviewed, overground',{exact:true}).check();
 const dose='2 crossover bouts + 2 backward jog bouts; 10m each; 60 sec rest';
 await page.getByLabel('Actual bouts, time or distance for each movement, and rest',{exact:true}).fill(dose);
 await page.getByLabel('Actual minutes',{exact:true}).fill('4');await page.getByLabel('Session RPE (0–10)',{exact:true}).fill('5');await page.getByLabel('Total distance (metres)',{exact:true}).fill('40');await page.getByLabel('Movement quality',{exact:true}).selectOption('good');await page.getByLabel('Immediate Achilles response',{exact:true}).selectOption('good');
 await page.getByRole('button',{name:'← Progress',exact:true}).click();await page.reload();
 await page.getByRole('navigation').getByRole('button',{name:'Progress',exact:true}).click();await page.getByRole('button',{name:'Sport',exact:true}).click();await page.getByRole('button',{name:'Open D5 exposure',exact:true}).click();
 assert.equal(await page.getByLabel('Actual bouts, time or distance for each movement, and rest',{exact:true}).inputValue(),dose);
 assert.ok(await page.getByLabel('Backward jog — previously reviewed, overground',{exact:true}).isChecked());
 pass('D5 exact demos and per-movement actual dose persist after exit and reload');
 await context.setOffline(true);await page.getByRole('button',{name:'Save exposure',exact:true}).click();
 await page.getByRole('heading',{name:'Today',exact:true}).waitFor();
 const saved=await page.evaluate(async()=>{const db=await new Promise(r=>{const q=indexedDB.open('achilles-return-db');q.onsuccess=()=>r(q.result)});const rows=await new Promise(r=>{const q=db.transaction('sessions').objectStore('sessions').getAll();q.onsuccess=()=>r(q.result)});db.close();return rows});
 const current=saved.find(s=>s.date==='2026-09-23');assert.equal(current.drillDose,dose);assert.equal(current.status,'PENDING_NEXT_DAY_RESPONSE');assert.deepEqual(current.drillsPerformed,['crossover','backward']);assert.equal(saved.length,3);
 pass('Offline directional logging preserves history and requires next-morning tolerance');
 assert.deepEqual(errors,[]);await writeFile(resolve(artifacts,'advanced-rehab-browser-results.json'),JSON.stringify({passed,failed:0},null,2));
} catch(e){console.error(await page?.locator('body').innerText());throw e;}finally{await browser?.close();await new Promise(r=>server.close(r));}
