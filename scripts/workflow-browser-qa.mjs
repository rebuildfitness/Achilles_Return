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
await new Promise((resolve) => server.listen(4179, "127.0.0.1", resolve));
let browser, page;
const passed = [];
function pass(name) {
  passed.push(name);
  console.log(`PASS ${name}`);
}


try {
 browser = await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}});
 page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date(2026,8,15,12)});
 await page.goto('http://127.0.0.1:4179'+scope);
 await page.getByRole('button',{name:'Get Started',exact:true}).click();
 const nav=async name=>{await page.getByRole('navigation').getByRole('button',{name,exact:true}).click();};
 const records=async store=>page.evaluate(async store=>{const db=await new Promise((r,j)=>{const q=indexedDB.open('achilles-return-db');q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error);});const rows=await new Promise((r,j)=>{const q=db.transaction(store).objectStore(store).getAll();q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error);});db.close();return rows;},store);
 await nav('More');await page.getByRole('button',{name:'Exercise library',exact:true}).click();
 assert.equal(await page.getByRole('button',{name:'All exercises',exact:true}).getAttribute('aria-pressed'),'true');
 assert.ok(await page.locator('.exercise-library-card [data-exercise-id]').count()>0);
 await page.getByRole('button',{name:'Favorites',exact:true}).click();
 await page.getByText('You have not saved any favorites yet.',{exact:false}).waitFor();
 await page.getByRole('button',{name:'All exercises',exact:true}).click();
 await page.getByRole('searchbox').fill('landmine');assert.equal(await page.locator('.exercise-library-card [data-exercise-id]').count(),3);
 await page.getByRole('searchbox').fill('rack-mounted');assert.equal(await page.locator('.exercise-library-card [data-exercise-id]').count(),3);
 assert.equal(await page.getByRole('link',{name:/Short Demo:/}).count(),3);
 await page.screenshot({path:resolve(artifacts,'workflow-new-equipment.png'),fullPage:true});
 pass('Unconfigured library opens populated; favorites explain emptiness; six new equipment entries have demos');
 await page.evaluate(async()=>{
 const db=await new Promise(r=>{const q=indexedDB.open('achilles-return-db');q.onsuccess=()=>r(q.result);});
 await new Promise((r,j)=>{const tx=db.transaction(['settings','profile','sessions'],'readwrite');
 tx.objectStore('profile').put({id:'athlete',equipment:['dumbbells'],availableDays:['1']});
 tx.objectStore('settings').put({id:'measurement-browser-zero',measurementRecordVersion:1,metric:'heel-reps',side:'repaired',date:'2026-09-15',value:'0',setup:'Flat floor; fingertip support; same shoes',notes:'Measured zero',createdAt:'2026-09-15T12:00:00Z'});
 tx.objectStore('settings').put({id:'baseline-draft',values:{baselineMode:'simple',simpleStep:'2',assessmentDate:'2026-09-15',assessmentMonth:'2026-09',assessmentSlot:'start'},step:0});
 tx.objectStore('sessions').put({id:'workflow-prior',date:'2026-09-14',createdAt:'2026-09-14T12:00:00Z',status:'PENDING_NEXT_DAY_RESPONSE',workoutId:'strength-a',workoutTitle:'Strength A',exerciseLog:{}});
 tx.oncomplete=r;tx.onerror=()=>j(tx.error);});db.close();});
 await page.reload();await page.getByRole('heading',{name:'Today',exact:true}).waitFor();
 let profile=(await records('profile'))[0];assert(profile.equipment.includes('landmine-station'));assert(profile.equipment.includes('rack-leg-extension'));
 await nav('More');await page.getByRole('button',{name:'Profile & schedule',exact:true}).click();
 await page.getByRole('checkbox',{name:'Landmine station',exact:true}).uncheck();await page.getByRole('button',{name:'Save preferences',exact:true}).click();
 await page.getByText('Preferences saved on this device.',{exact:true}).waitFor();await page.reload();await page.getByRole('heading',{name:'Today',exact:true}).waitFor();
 assert(!(await records('profile'))[0].equipment.includes('landmine-station'));
 pass('Confirmed equipment is added to an existing profile once; later deselection survives reload');
 await page.getByRole('button',{name:'Check In',exact:true}).click();
 await page.getByText('Step 1 of 2 · Previous workout',{exact:true}).waitFor();
 await page.locator('#field-change').selectOption('baseline');await page.locator('#field-functionChange').selectOption('no');await page.locator('#field-repeatedWorsening').selectOption('no');
 await page.getByRole('button',{name:'Save next-morning response',exact:true}).click();
 await page.getByRole('heading',{name:'Daily Check-In',exact:true}).waitFor();
 assert.equal((await records('checkins')).length,0);assert.equal((await records('sessions')).find(s=>s.id==='workflow-prior').status,'TOLERATED');
 assert.equal(await page.locator('input[name="previousResponse"]:checked').count(),0);
 for (const [name,value] of Object.entries({pain:'none',stiffness:'normal',swelling:'normal',previousResponse:'good',recovery:'good'})) await page.locator(`input[name="${name}"][value="${value}"]`).check();
 await page.screenshot({path:resolve(artifacts,'workflow-guided-checkin.png'),fullPage:true});
 await page.getByRole('button',{name:'See Today’s Plan',exact:true}).click();await page.getByRole('heading',{name:'Today',exact:true}).waitFor();
 assert.equal((await records('checkins')).length,1);
 assert.equal((await records('sessions')).find(s=>s.id==='workflow-prior').status,'TOLERATED');
 pass('Guided response then check-in saves separate dated records without copying or auto-confirming answers');
 await nav('Tests');await page.getByText('How can this result inform my plan?',{exact:true}).click();await page.getByRole('button',{name:'Review results in assessment',exact:true}).click();
 await page.getByText('Review saved individual measurements (1)',{exact:true}).click();
 await page.getByLabel('Saved result',{exact:true}).selectOption('measurement-browser-zero');
 const copy=page.getByRole('button',{name:'Copy result to assessment draft',exact:true});assert.equal(await copy.isEnabled(),false);
 await page.getByRole('checkbox',{name:/I confirm the date/}).check();await copy.click();
 await page.getByText('Copied to this draft.',{exact:false}).waitFor();
 await page.getByRole('button',{name:'Save & exit',exact:true}).click();
 const draft=(await records('settings')).find(r=>r.id==='baseline-draft');assert.equal(draft.values.heel_repaired_reps,'0');assert.equal(draft.values.heelQuality,undefined);assert.equal((await records('assessments')).length,0);
 assert.equal((await records('settings')).find(r=>r.id==='measurement-browser-zero').value,'0');
 pass('Journal review copies an explicitly confirmed zero into a draft without changing original measurement or assessment');
 assert.deepEqual(errors,[]);pass('No browser runtime errors');
 await writeFile(resolve(artifacts,'workflow-browser-results.json'),JSON.stringify({passed,failed:0},null,2));
} catch(error) {
 console.error(await page?.locator('body').innerText());await page?.screenshot({path:resolve(artifacts,'workflow-failure.png'),fullPage:true});throw error;
} finally {await browser?.close();await new Promise(r=>server.close(r));}
