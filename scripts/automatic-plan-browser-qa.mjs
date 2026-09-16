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
await new Promise((resolve) => server.listen(4184, "127.0.0.1", resolve));
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
 await page.clock.install({time:new Date(2026,8,16,12)});
 const url="http://127.0.0.1:4184"+scope;
 await page.goto(url);await page.getByRole("button",{name:"Get Started",exact:true}).click();
 const seed=async rows=>page.evaluate(async rows=>{
 const db=await new Promise((r,j)=>{const q=indexedDB.open("achilles-return-db");q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error);});
 await new Promise((r,j)=>{const tx=db.transaction([...new Set(rows.map(x=>x.store))],"readwrite");for(const row of rows)tx.objectStore(row.store).put(row.value);tx.oncomplete=r;tx.onerror=()=>j(tx.error);});db.close();},rows);
 const good={level:"GREEN",reason:"At your normal baseline.",action:"Follow your plan."};
 const first={id:"run-first",domain:"running",exposureLevel:"R1",date:"2026-09-11",createdAt:"2026-09-11T12:00:00Z",status:"TOLERATED",movementQuality:"good",progressionEligible:true,exerciseLog:{}};
 const second={...first,id:"run-second",date:"2026-09-14",createdAt:"2026-09-14T12:00:00Z",status:"PENDING_NEXT_DAY_RESPONSE"};
 await seed([
 {store:"profile",value:{id:"athlete",equipment:EQUIPMENT,availableDays:["1","3","5"]}},
 {store:"assessments",value:{id:"a",values:baselineValues(),completedAt:"2026-09-16T08:00:00Z",updatedAt:"2026-09-16T08:00:00Z",step:0}},
 {store:"checkins",value:{id:"2026-09-16",date:"2026-09-16",readiness:good,answers:{pain:"none",stiffness:"normal",swelling:"normal",previousResponse:"good",recovery:"good",unusualSymptoms:[]}}},
 {store:"sessions",value:first},{store:"sessions",value:second}]);
 await page.reload();await page.getByRole("heading",{name:"Today",exact:true}).waitFor();
 assert.equal(await page.locator(".planned-exposure").count(),0);
 await page.getByRole("button",{name:"Record next-morning response",exact:true}).first().click();
 await page.locator("#field-change").selectOption("baseline");await page.locator("#field-functionChange").selectOption("no");await page.locator("#field-repeatedWorsening").selectOption("no");
 await page.getByRole("button",{name:"Save next-morning response",exact:true}).click();
 await page.getByRole("heading",{name:"Running · R2",exact:true}).waitFor();
 await page.screenshot({path:resolve(artifacts,"automatic-plan-today.png"),fullPage:true});
 pass("Saving the next-morning response automatically inserts R2 into Today without manual advancement");
 await page.getByRole("button",{name:"Open Running session",exact:true}).click();
 await page.getByText("8x1min jog",{exact:false}).first().waitFor();
 pass("Automatically prescribed session opens the existing exposure logger at the updated dose");
 await page.reload();await page.getByRole("heading",{name:"Running · R2",exact:true}).waitFor();
 const nav=async n=>page.getByRole("navigation").getByRole("button",{name:n,exact:true}).click();
 await nav("Plan");await page.locator(".plan-day").filter({hasText:"Wed, Sep 16"}).locator("summary").first().click();
 await page.getByRole("heading",{name:"Running · R2",exact:true}).waitFor();
 await page.screenshot({path:resolve(artifacts,"automatic-plan-week.png"),fullPage:true});
 await page.getByRole("button",{name:"Next week",exact:true}).click();
 await page.locator(".planned-exposure h3").first().waitFor({state:"attached"}); const previews=await page.locator(".planned-exposure h3").allTextContents();assert(previews.length>0);assert(previews.every(x=>x.includes("R2")));
 assert.equal(await page.getByRole("button",{name:"Open Running session",exact:true}).count(),0);
 pass("Reload and future-week preview retain R2; future plans never invent successful R3 evidence");
 await seed([{store:"checkins",value:{id:"2026-09-16",date:"2026-09-16",readiness:{level:"YELLOW_1",reason:"Modified readiness",action:"Hold progression."},answers:{}}}]);
 await page.reload();await page.getByRole("heading",{name:"Today",exact:true}).waitFor();assert.equal(await page.locator(".planned-exposure").count(),0);
 pass("Changed readiness immediately removes the scheduled impact exposure");
 await seed([{store:"checkins",value:{id:"2026-09-16",date:"2026-09-16",readiness:good,answers:{}}}]);
 await page.reload();await page.getByRole("heading",{name:"Running · R2",exact:true}).waitFor();
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await context.setOffline(true);await page.reload();await page.getByRole("heading",{name:"Running · R2",exact:true}).waitFor();
 const audit=await page.evaluate(async()=>{const db=await new Promise(r=>{const q=indexedDB.open("achilles-return-db");q.onsuccess=()=>r(q.result);});const rows=await new Promise(r=>{const q=db.transaction("decisions").objectStore("decisions").getAll();q.onsuccess=()=>r(q.result);});db.close();return rows.filter(x=>x.decisionType==="AUTOMATIC_PLAN");});
 assert(audit.some(a=>a.plan.some(d=>d.exposure?.level==="R2")));assert.deepEqual(errors,[]);
 pass("Offline reload retains the prescription and local decision evidence without runtime errors");
 await writeFile(resolve(artifacts,"automatic-plan-browser-results.json"),JSON.stringify({passed,failed:0},null,2));
} catch(error) {console.error(await page?.locator("body").innerText());await page?.screenshot({path:resolve(artifacts,"automatic-plan-failure.png"),fullPage:true});throw error;}
finally {await browser?.close();await new Promise(r=>server.close(r));}


