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
await new Promise((resolve) => server.listen(4185, "127.0.0.1", resolve));
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
 await page.goto("http://127.0.0.1:4185"+scope);await page.getByRole("button",{name:"Get Started",exact:true}).click();
 await page.evaluate(async()=>{const db=await new Promise(r=>{const q=indexedDB.open("achilles-return-db");q.onsuccess=()=>r(q.result);});await new Promise((r,j)=>{const t=db.transaction("profile","readwrite");t.objectStore("profile").put({id:"athlete",equipment:["weighted-wagon","incline-treadmill"],equipmentUpdate20260915:true});t.oncomplete=r;t.onerror=j;});db.close();});
 await page.reload();await page.getByRole("navigation").getByRole("button",{name:"More",exact:true}).click();
 await page.getByRole("button",{name:"Profile & schedule",exact:true}).click();
 await page.getByText(/Recorded treadmill: ProForm Performance 300i/).waitFor();
 assert.equal(await page.getByLabel("Training sled (push / pull)",{exact:true}).isChecked(),false);
 assert.equal(await page.getByLabel("Utility wagon (personal substitute)",{exact:true}).isChecked(),true);
 await page.screenshot({path:resolve(artifacts,"equipment-followup-profile.png"),fullPage:true});
 pass("Existing wagon ownership retained; exact treadmill displayed; sled not marked owned");
 await page.getByRole("navigation").getByRole("button",{name:"More",exact:true}).click();
 await page.getByRole("button",{name:"← All settings",exact:true}).click();await page.getByRole("button",{name:"Exercise library",exact:true}).click();
 const search=page.getByPlaceholder("Hamstring, cable, chest…");await search.fill("sled");
 await page.getByRole("heading",{name:"Sled push",exact:true}).waitFor();
 const card=page.locator(".exercise-library-card").filter({has:page.getByRole("heading",{name:"Sled push",exact:true})});
 assert.equal(await card.getByRole("link").count(),0);await card.getByText(/Demo pending verification/).waitFor();
 await page.screenshot({path:resolve(artifacts,"equipment-followup-sled.png"),fullPage:true});
 pass("Canonical sled references are searchable without an unverified demo button");
 await search.fill("backward treadmill");await page.getByRole("heading",{name:"Backward treadmill walk",exact:true}).waitFor();
 assert.equal(await page.locator(".exercise-library-card a.demo-link").count(),0);
 pass("Backward treadmill remains a deferred reference without a demo link");
 const profile=await page.evaluate(async()=>{const db=await new Promise(r=>{const q=indexedDB.open("achilles-return-db");q.onsuccess=()=>r(q.result);});return await new Promise(r=>{const q=db.transaction("profile").objectStore("profile").get("athlete");q.onsuccess=()=>r(q.result);});});
 assert.equal(profile.equipmentDetails["incline-treadmill"].model,"PFTL39715.1");assert.deepEqual(errors,[]);
 pass("Exact model persisted locally with no browser runtime errors");
 await writeFile(resolve(artifacts,"equipment-followup-browser-results.json"),JSON.stringify({passed,failed:0},null,2));
} catch(error) {console.error(await page?.locator("body").innerText());throw error;}
finally {await browser?.close();await new Promise(r=>server.close(r));}


