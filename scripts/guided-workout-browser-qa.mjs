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
await new Promise((resolve) => server.listen(4192, "127.0.0.1", resolve));
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
 const url='http://127.0.0.1:4192'+scope;
 await page.goto(url);await page.getByRole('button',{name:'Get Started',exact:true}).click();
 const rows=[
 {store:'profile',value:{id:'athlete',strengthStyle:'conditioning',equipment:EQUIPMENT,availableDays:['1','3','5']}},
 {store:'assessments',value:{id:'a',values:baselineValues(),completedAt:'2026-09-23T08:00:00Z',updatedAt:'2026-09-23T08:00:00Z',step:0}},
 {store:'capabilityStates',value:{id:'checkpoints',values:reviewed('deceleration','plannedCut')}},
 {store:'checkins',value:{id:'2026-09-23',date:'2026-09-23',readiness:{level:'GREEN',reason:'Normal baseline',action:'Follow plan'},answers:{pain:'none',stiffness:'normal',swelling:'normal',previousResponse:'good',recovery:'good',unusualSymptoms:[]}}},
 ...[['run','running','R3','2026-09-18'],['cod','cod','D4','2026-09-21']].map(([id,domain,exposureLevel,date])=>({store:'sessions',value:{id,domain,exposureLevel,date,createdAt:date+'T08:00:00Z',status:'TOLERATED',movementQuality:'good',progressionEligible:true,exerciseLog:{}}}))];
 await page.evaluate(async rows=>{const db=await new Promise(r=>{const q=indexedDB.open('achilles-return-db');q.onsuccess=()=>r(q.result)});await new Promise((r,j)=>{const tx=db.transaction([...new Set(rows.map(x=>x.store))],'readwrite');for(const x of rows)tx.objectStore(x.store).put(x.value);tx.oncomplete=r;tx.onerror=()=>j(tx.error)});db.close()},rows);


 await page.reload();await page.getByRole('button',{name:/^(Open|Resume) Workout$/}).click();
 await page.getByText('Session options',{exact:true}).click();
 await page.getByLabel('Guide me through each set',{exact:true}).check();
 const guide=page.getByRole('region',{name:'Guided workout',exact:true});
 const first=await guide.getByRole('status').innerText();
 assert.equal(await page.locator('.exercise-card').count(),1);
 assert.equal(await page.getByRole('link',{name:'Short Demo',exact:true}).count(),1);
 assert.equal(await page.getByRole('button',{name:/^View illustration for /}).count(),1);
 const card=page.locator('.exercise-card');
 await card.locator('input[aria-label$=" reps"]').fill('240');
 assert.equal(await guide.getByRole('status').innerText(),first);
 await card.getByRole('button',{name:/set 1 complete$/}).click();
 const second=await guide.getByRole('status').innerText();assert.notEqual(first,second);
 pass('Guide shows one illustrated exercise and advances only on explicit set completion');
 await page.getByRole('button',{name:'← Today',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:/^(Open|Resume) Workout$/}).click();
 assert.equal(await guide.getByRole('status').innerText(),second);
 await page.getByRole('button',{name:'View full session',exact:true}).click();
 assert.ok(await page.locator('.exercise-card').count()>1);
 assert.equal(await page.getByRole('button',{name:'Walking warm-up set 1 complete',exact:true}).getAttribute('aria-pressed'),'true');
 pass('Reload resumes the next set; full session retains the completed warm-up');
 await page.getByText('Session options',{exact:true}).click();
 await page.getByLabel('Guide me through each set',{exact:true}).check();
 await context.setOffline(true);
 await page.getByRole('button',{name:'← Today',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:/^(Open|Resume) Workout$/}).click();
 assert.equal(await guide.getByRole('status').innerText(),second);
 for(const width of [320,390,1280]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:resolve(artifacts,'guided-workout-mobile.png'),fullPage:true});
 assert.deepEqual(errors,[]);
 pass('Guided mode persists offline and fits mobile and desktop without runtime errors');
 await writeFile(resolve(artifacts,'guided-workout-browser-results.json'),JSON.stringify({passed,failed:0},null,2));
} catch(e){console.error(await page?.locator('body').innerText());throw e;}finally{await browser?.close();await new Promise(r=>server.close(r));}
