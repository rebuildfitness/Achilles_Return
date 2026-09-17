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
await new Promise((resolve) => server.listen(4174, "127.0.0.1", resolve));
let browser, page;
const passed = [];
function pass(name) {
  passed.push(name);
  console.log(`PASS ${name}`);
}

// Feature flow appended below.
try {
  const { BASELINE_SECTIONS, BASELINE_DEMOS } =
    await import("../src/data/baseline.js");
  const { baselineValues } = await import("../tests/fixtures.mjs");
  browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || "msedge",
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  page = await context.newPage();
  await page.clock.setFixedTime(new Date(2026, 8, 7, 12));
  const errors = [];
  page.on("pageerror", (e) => {
    errors.push(e.message);
    console.error("Browser error:", e.message);
  });
  const url = `http://127.0.0.1:4174${scope}`;
  let lastTab = "Today";
  const originalReload = page.reload.bind(page);
  page.reload = (...args) => { lastTab = new URL(page.url()).hash.slice(1) || "Today"; return originalReload(...args); };
  const enterIntro = async (target = page, restoreTab = true) => {
    const oldHash = lastTab;
    await target.getByRole("button", { name: "Get Started", exact: true }).or(target.getByRole("heading", { name: "Today", exact: true })).waitFor();
    const start = target.getByRole("button", { name: "Get Started", exact: true });
    if (await start.isVisible()) await start.click();
    await target.getByRole("heading", { name: "Today", exact: true }).waitFor();
    if (restoreTab && oldHash && oldHash !== "Today")
      await target
        .getByRole("navigation")
        .getByRole("button", { name: oldHash, exact: true })
        .click();
  };
  const nav = async (tab) => {
    lastTab = tab;
    await page
      .getByRole("navigation")
      .getByRole("button", { name: tab, exact: true })
      .click();
    await page.getByRole("heading", { name: tab, exact: true }).waitFor();
    assert.equal(
      await page
        .getByRole("navigation")
        .getByRole("button", { name: tab, exact: true })
        .getAttribute("aria-current"),
      "page",
    );
  };
  const readStore = async (name) =>
    page.evaluate(async (name) => {
      const db = await new Promise((r, j) => {
        const q = indexedDB.open("achilles-return-db");
        q.onsuccess = () => r(q.result);
        q.onerror = () => j(q.error);
      });
      const rows = await new Promise((r) => {
        const q = db.transaction(name).objectStore(name).getAll();
        q.onsuccess = () => r(q.result);
      });
      db.close();
      return rows;
    }, name);
  const checkin = async () => {
    await page
      .getByRole("button", { name: /^(Check In|Update check-in)$/ })
      .click();
    if (await page.getByRole('button',{name:'Check today’s symptoms first',exact:true}).isVisible()) await page.getByRole('button',{name:'Check today’s symptoms first',exact:true}).click();
    for (const [name, value] of Object.entries({
      pain: "none",
      stiffness: "normal",
      swelling: "normal",
      previousResponse: "good",
      recovery: "good",
    }))
      await page.locator(`input[name="${name}"][value="${value}"]`).check();
    await page.getByRole("button", { name: "See Today’s Plan" }).click();
    await page.getByRole("heading", { name: /Ready to Train|Next-morning review due|Establish your starting point/ }).waitFor();
  };
  const response = async () => {
    await page
      .getByRole("button", { name: /Record next-morning response|Record response/ })
      .first()
      .click();
    await page.locator("#field-change").selectOption("baseline");
    await page.locator("#field-functionChange").selectOption("no");
    await page.locator("#field-repeatedWorsening").selectOption("no");
    await page.locator("#field-notes").fill("My Achilles feels better than usual.");
    await page
      .getByRole("button", { name: "Save next-morning response" })
      .click();
    await page.getByRole('heading',{name:'Daily Check-In',exact:true}).or(page.getByRole('heading',{name:'Today',exact:true})).waitFor();
    if (await page.getByRole('heading',{name:'Daily Check-In',exact:true}).isVisible()) await page.getByRole('button',{name:'← Today',exact:true}).click();
    await page.getByRole("heading", { name: "Today", exact: true }).waitFor();
  };
  await page.goto("http://127.0.0.1:4174/seed");
  await page.evaluate(async () => {
    await new Promise((r, j) => {
      const q = indexedDB.open("achilles-return-db", 1);
      q.onupgradeneeded = () => {
        for (const s of ["profile", "checkins", "sessions", "assessments"])
          q.result.createObjectStore(s, { keyPath: "id" });
      };
      q.onsuccess = () => {
        const db = q.result,
          tx = db.transaction("sessions", "readwrite");
        tx.objectStore("sessions").put({
          id: "legacy",
          date: "2026-09-06",
          createdAt: "2026-09-06T12:00:00Z",
          workoutId: "legacy",
          exerciseLog: {},
          status: "PENDING_NEXT_DAY_RESPONSE",
          rulesetVersion: "legacy-original",
        });
        tx.oncomplete = () => {
          db.close();
          r();
        };
      };
      q.onerror = () => j(q.error);
    });
  });
  await page.goto(url);
  await enterIntro();
  await page.getByRole("heading", { name: "Today", exact: true }).waitFor();
  assert.equal(
    (await readStore("sessions"))[0].rulesetVersion,
    "legacy-original",
  );
  await checkin();
  assert.equal(
    (await readStore("sessions"))[0].status,
    "PENDING_NEXT_DAY_RESPONSE",
  );
  await response();
  assert.equal((await readStore("sessions"))[0].status, "TOLERATED");
  pass(
    "Migration preserves legacy history; check-in never fabricates next-morning tolerance",
  );
  await page
    .getByRole("button", { name: "Start Baseline", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start Baseline", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Open detailed assessment", exact: true })
    .click();
  await page.waitForFunction(
    () => document.querySelector("progress")?.max === 13,
  );
  await page.locator("#field-repairSide").selectOption("left");
  await page.getByRole("button", { name: "Save & exit" }).click();
  await page.reload();
  await enterIntro();
  await page.getByRole("button", { name: "Resume assessment" }).click();
  assert.equal(await page.locator("#field-repairSide").inputValue(), "left");
  pass("Baseline autosaves and resumes after exit and reload");
  const values = baselineValues();
  for (const [index, section] of BASELINE_SECTIONS.entries()) {
    for (const demo of BASELINE_DEMOS[section.id] || []) {
      const link = page.getByRole("link", {
        name: `Short Demo · ${demo.name} ↗`,
        exact: true,
      });
      assert.equal(await link.getAttribute("href"), demo.videoUrl);
      assert.equal(await link.isVisible(), true);
    }
    for (const f of section.fields) {
      const value = values[f.id];
      if (f.type === "checks") {
        for (const v of value)
          await page
            .getByRole("group", { name: f.label + (f.required ? " *" : "") })
            .getByLabel(f.options.find((o) => o[0] === v)[1], { exact: true })
            .check();
      } else if (f.type === "select")
        await page.locator(`#field-${f.id}`).selectOption(String(value));
      else await page.locator(`#field-${f.id}`).fill(String(value));
    }
    if (index === 6)
      await page.screenshot({
        animations: "disabled",
        path: resolve(artifacts, "baseline-mobile.png"),
        fullPage: true,
      });
    await page
      .getByRole("button", {
        name:
          index === BASELINE_SECTIONS.length - 1
            ? "Finish assessment"
            : "Continue",
        exact: true,
      })
      .click();
  }
  await page.getByRole("heading", { name: "Tests", exact: true }).waitFor();
  assert.equal((await readStore("assessments")).length, 1);
  await page.screenshot({
    animations: "disabled",
    path: resolve(artifacts, "tests-mobile.png"),
    fullPage: true,
  });
  pass(
    "All baseline sections validate, calculate measured results and activate the plan",
  );
  await nav("Today");
  await page.screenshot({
    animations: "disabled",
    path: resolve(artifacts, "today-ready-mobile.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: /^(Open|Resume) Workout$/ }).click();
  assert.equal(await page.locator(".exercise-card").count(), 9);
  assert.equal(await page.getByLabel('Workout elapsed time',{exact:true}).innerText(),'00:00:00');
  await page.getByRole('button',{name:'Start workout timer',exact:true}).click();
  await page.clock.setFixedTime(new Date(2026,8,7,12,1));
  await page.getByLabel('Workout elapsed time',{exact:true}).filter({hasText:'00:01:00'}).waitFor();
  await page.getByRole('button',{name:'Pause workout timer',exact:true}).click();
  await page.clock.setFixedTime(new Date(2026,8,7,12,2));
  assert.equal(await page.getByLabel('Workout elapsed time',{exact:true}).innerText(),'00:01:00');
  await page.getByRole('button',{name:'Resume workout timer',exact:true}).click();
  await page.clock.setFixedTime(new Date(2026,8,7,12,3));
  await page.getByLabel('Workout elapsed time',{exact:true}).filter({hasText:'00:02:00'}).waitFor();
  await page.locator('.workout-timer').screenshot({path:resolve(artifacts,'workout-duration.png')});
  pass('Workout timer starts explicitly, includes rest and excludes paused time');

  assert.equal(
    await page.getByRole("link", { name: "Short Demo", exact: true }).count(),
    9,
  );
  const load = "Single-Leg Calf Raise set 1 load",
    reps = "Single-Leg Calf Raise set 1 reps";
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:resolve(artifacts,'design-workout-mobile.png')});
  const firstRow=await page.getByLabel('Single-Leg Calf Raise set 1 load',{exact:true}).boundingBox();
  assert.ok(firstRow && firstRow.y+firstRow.height < 780,'First logging row above bottom navigation');
  pass('Compact workout reaches the first logging row in the initial phone view');
  const fullCardCount = await page.locator(".exercise-card").count();
  await page.getByText("Session options",{exact:true}).click();
  await page.getByRole("checkbox", {name:/Shorter session/}).check();
  assert.ok(await page.locator(".exercise-card").count() < fullCardCount);
  await page.getByRole("spinbutton", {name:load,exact:true}).waitFor();
  await page.getByRole("checkbox", {name:/Shorter session/}).uncheck();
  assert.equal(await page.locator(".exercise-card").count(),fullCardCount);
  pass("Shorter session hides optional accessories and restores the original full workout");
  const feedbackCard=page.locator('.exercise-card').filter({has:page.getByRole('heading',{name:'Single-Leg Calf Raise',exact:true})});
  await feedbackCard.getByText('Set 1 · RPE, quality & symptoms',{exact:true}).click();
  await feedbackCard.getByLabel('Single-Leg Calf Raise set 1 RPE',{exact:true}).fill('7');
  await feedbackCard.getByLabel('Single-Leg Calf Raise set 1 quality',{exact:true}).selectOption('good');
  await feedbackCard.getByLabel('Single-Leg Calf Raise set 1 symptoms',{exact:true}).selectOption('none');
  await feedbackCard.getByText('First-set feedback shortcut',{exact:true}).click();
  await feedbackCard.getByRole('button',{name:'Use first-set feedback for remaining sets',exact:true}).click();
  await feedbackCard.getByText('Set 2 · RPE, quality & symptoms',{exact:true}).click();
  assert.equal(await feedbackCard.getByLabel('Single-Leg Calf Raise set 2 RPE',{exact:true}).inputValue(),'7');
  await feedbackCard.getByLabel('Single-Leg Calf Raise set 2 RPE',{exact:true}).fill('8');
  await feedbackCard.getByLabel('Single-Leg Calf Raise set 2 reps',{exact:true}).fill('10');
  await feedbackCard.getByRole('button',{name:'Single-Leg Calf Raise set 2 complete',exact:true}).click();
  await feedbackCard.getByRole('button',{name:'Confirm carried feedback for completed sets',exact:true}).click();
  await feedbackCard.getByText('Carried feedback confirmed: quality, symptoms',{exact:true}).waitFor();
  await feedbackCard.screenshot({path:resolve(artifacts,'workout-feedback.png'),style:'.session-dashboard, .bottom-nav {visibility:hidden;}'});
  await feedbackCard.getByRole('button',{name:'Single-Leg Calf Raise set 2 complete',exact:true}).click();
  pass('First-set feedback prefills blank fields, allows overrides and confirms only completed sets');

  await page.getByRole("spinbutton", { name: load, exact: true }).fill("20");
  await page.getByRole("spinbutton", { name: reps, exact: true }).fill("10");
  await page
    .getByRole("button", {
      name: "Single-Leg Calf Raise set 1 complete",
      exact: true,
    })
    .click();
  await page.waitForFunction(async () => {
    const db = await new Promise((r) => {
      const q = indexedDB.open("achilles-return-db");
      q.onsuccess = () => r(q.result);
    });
    const rows = await new Promise((r) => {
      const q = db.transaction("settings").objectStore("settings").getAll();
      q.onsuccess = () => r(q.result);
    });
    db.close();
    return rows.some((r) => r.log?.["single-calf"]?.sets?.[0]?.complete);
  });
  const illustratedCalf = page.locator('.exercise-card').filter({has:page.getByRole('heading',{name:'Single-Leg Calf Raise',exact:true})});
  const illustrationTrigger = illustratedCalf.getByRole('button',{name:'View illustration for Single-Leg Calf Raise',exact:true});
  await illustrationTrigger.scrollIntoViewIfNeeded();
  await illustrationTrigger.locator('img').evaluate(img=>img.decode());
  assert.equal(await illustrationTrigger.locator('img').evaluate(img=>img.naturalWidth),192);
  await illustrationTrigger.click();
  await illustratedCalf.locator('.illustration-detail img').evaluate(img=>img.decode());
  assert.equal(await illustratedCalf.locator('.illustration-detail img').evaluate(img=>img.naturalWidth),640);
  assert.equal(await page.locator('input[aria-label="'+load+'"]').inputValue(),'20');
  assert.equal(await page.locator('input[aria-label="'+reps+'"]').inputValue(),'10');
  await illustratedCalf.screenshot({path:resolve(artifacts,'workout-illustration.png'),style:'.session-dashboard, .bottom-nav { visibility: hidden; }'});
  await illustratedCalf.getByRole('button',{name:'Close illustration'}).click();
  assert.equal(await illustrationTrigger.evaluate(el=>el===document.activeElement),true);
  await illustrationTrigger.click(); await page.keyboard.press('Escape');
  assert.equal(await illustratedCalf.locator('.illustration-detail').count(),0);
  await illustratedCalf.screenshot({path:resolve(artifacts,'workout-thumbnail.png'),style:'.session-dashboard, .bottom-nav { visibility: hidden; }'});
  pass('Workout thumbnail and enlarged artwork preserve logged sets; close and Escape restore focus');
  await page.reload();
  await enterIntro();
  await page.getByRole("button", { name: /^(Open|Resume) Workout$/ }).click();
  assert.equal(
    await page
      .getByRole("spinbutton", { name: load, exact: true })
      .inputValue(),
    "20",
  );
  assert.equal(
    await page.getByLabel("Rest remaining", { exact: true }).innerText(),
    "1:30",
  );
  await page.getByRole("button", { name: "+30 sec", exact: true }).click();
  assert.equal(
    await page.getByLabel("Rest remaining", { exact: true }).innerText(),
    "2:00",
  );
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  assert.equal(
    await page.getByLabel("Rest remaining", { exact: true }).innerText(),
    "Ready",
  );
  pass(
    "Rest timer starts on a completed set, survives reload, and supports extending and clearing",
  );
  await page.screenshot({
    animations: "disabled",
    path: resolve(artifacts, "workout-mobile.png"),
    fullPage: true,
  });
  assert.equal(
    await page
      .getByRole("spinbutton", {
        name: "Incline Dumbbell Press set 5 reps",
        exact: true,
      })
      .count(),
    1,
  );
  pass(
    "Nine exercise cards include 5×5, specific demos and inline sets that survive reload",
  );
  for (const width of [320, 375, 390, 720, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Workout overflow at ${width}`,
    );
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.evaluate(() => (document.documentElement.style.fontSize = "100%"));
  await page.setViewportSize({ width: 390, height: 844 });
  pass("Inline workout usable at 320–1280px and with 200% text");
  assert.equal(await page.getByText('Swap exercise', {exact:true}).count(), await page.locator('.exercise-card').count());
  const pullCard = page.locator('.exercise-card').filter({has:page.getByRole('heading',{name:'Pull-Up',exact:true})});
  await pullCard.getByRole('spinbutton',{name:'Pull-Up set 1 reps',exact:true}).fill('3');
  await pullCard.getByRole('button',{name:'Pull-Up set 1 complete',exact:true}).click();
  await pullCard.getByText('Swap exercise',{exact:true}).click();
  await pullCard.getByLabel('Reason for change',{exact:true}).selectOption('difficulty');
  await pullCard.getByText('Equipment unavailable today (0)',{exact:true}).click();
  await pullCard.getByRole('checkbox',{name:'pull up bar',exact:true}).check();
  await pullCard.getByLabel('Alternative exercise',{exact:true}).selectOption('library-lat-pulldown');
  assert.equal(await pullCard.getByLabel('Apply change to',{exact:true}).inputValue(),'session');
  await pullCard.getByRole('button',{name:'Use this alternative',exact:true}).click();
  const latCard = page.locator('.exercise-card').filter({has:page.getByRole('heading',{name:'Lat pulldown',exact:true})});
  await latCard.waitFor();
  assert.equal(await latCard.getByRole('spinbutton',{name:'Lat pulldown set 1 load',exact:true}).inputValue(),'');
  await latCard.getByRole('button',{name:'View illustration for Lat pulldown',exact:true}).locator('img').evaluate(img=>img.decode());
  await latCard.getByRole('spinbutton',{name:'Lat pulldown set 1 load',exact:true}).fill('20');
  await latCard.getByRole('spinbutton',{name:'Lat pulldown set 1 reps',exact:true}).fill('8');
  await latCard.getByRole('button',{name:'Lat pulldown set 1 complete',exact:true}).click();
  await page.getByRole('heading',{name:'Recorded before a swap',exact:true}).waitFor();
  await page.getByText('3 / 28 sets',{exact:true}).waitFor();
  const seatedCard = page.locator('.exercise-card').filter({has:page.getByRole('heading',{name:'Loaded Seated Calf Raise',exact:true})});
  await seatedCard.getByText('Swap exercise',{exact:true}).click();
  await seatedCard.getByRole('button',{name:'Skip remaining sets today',exact:true}).click();
  await seatedCard.getByText('Remaining sets skipped: equipment',{exact:true}).waitFor();
  assert.equal((await readStore('profile'))[0].exerciseChoices?.['pull-up'],undefined);
  await page.reload(); await enterIntro();
  await page.getByRole('button',{name:/^(Open|Resume) Workout$/}).click();
  await latCard.waitFor();
  assert.equal(await latCard.getByRole('spinbutton',{name:'Lat pulldown set 1 load',exact:true}).inputValue(),'20');
  await page.getByRole('heading',{name:'Recorded before a swap',exact:true}).waitFor();
  await seatedCard.getByText('Remaining sets skipped: equipment',{exact:true}).waitFor();
  await latCard.getByText('Swap exercise',{exact:true}).click();
  await latCard.screenshot({path:resolve(artifacts,'workout-swap.png'),style:'.session-dashboard, .bottom-nav { visibility: hidden; }'});
  pass('Every card offers swap; pull-up replacement, separate loads, unavailable equipment and skip survive reload');

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await enterIntro();
  await page.getByRole("button", { name: /^(Open|Resume) Workout$/ }).click();
  await page
    .getByText("Video requires internet", { exact: true })
    .first()
    .waitFor();
  await page.getByRole("spinbutton", { name: load, exact: true }).fill("25");
  await page.getByRole("button", { name: "← Today", exact: true }).click();
  for (const tab of ["Plan", "Progress", "Tests", "More", "Today"])
    await nav(tab);
  await page.getByRole("button", { name: /^(Open|Resume) Workout$/ }).click();
  assert.equal(
    await page
      .getByRole("spinbutton", { name: load, exact: true })
      .inputValue(),
    "25",
  );
  await page
    .getByRole("button", { name: "Finish Workout", exact: true })
    .click();
  await page.locator('input[name="difficulty"][value="right"]').check();
  await page.locator('input[name="achilles"][value="good"]').check();
  await page.getByRole("button", { name: "Save Workout", exact: true }).click();
  await page.getByRole("heading", { name: "Today", exact: true }).waitFor();
  const saved = (await readStore("sessions")).find((s) => s.id !== "legacy");
  assert.equal(saved.status, "PENDING_NEXT_DAY_RESPONSE");
  assert.equal(saved.exerciseLog["single-calf"].sets[0].load, "25");
  assert.equal(saved.durationMs,120000);
  assert.equal(saved.exerciseLog['single-calf'].sets[1].rpe,'8');
  assert.equal(saved.exerciseLog['single-calf'].sets[2].feedbackConfirmed,false);
  await page.getByText('AI coaching review',{exact:true}).click();
  const coachText=await page.getByLabel('Coaching report',{exact:true}).inputValue();
  assert.ok(coachText.includes('00:02:00') && coachText.includes('Awaiting next-morning response') && coachText.includes('UNCONFIRMED'));
  const downloadEvent=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download Markdown',exact:true}).click();
  const downloaded=await downloadEvent;
  assert.equal(await readFile(await downloaded.path(),'utf8'),coachText);
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.getByRole('button',{name:'Copy coaching report',exact:true}).click();
  await page.getByText('Coaching report copied.',{exact:true}).waitFor();
  assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replaceAll('\r\n','\n'),coachText);
  await page.locator('.coaching-review').screenshot({path:resolve(artifacts,'coaching-review.png'),style:'.bottom-nav {visibility:hidden;}'});
  pass('Timer and feedback survive reload and offline finish; coach report downloads and copies exact saved data');

  assert.equal(
    await page.getByRole("button", { name: /^(Open|Resume) Workout$/ }).count(),
    0,
  );
  await page
    .getByRole("button", { name: "Log recovery", exact: true })
    .waitFor();
  pass(
    "Offline app shell, all tabs, logging and finish work; no same-day catch-up workout",
  );
  const swapSaved = (await readStore('sessions')).find(s=>s.date==='2026-09-07');
  assert.equal(swapSaved.exerciseLog['pull-up'].sets[0].reps,'3');
  assert.equal(swapSaved.exerciseLog['library-lat-pulldown'].sets[0].load,'20');
  assert.equal(swapSaved.exerciseChanges.length,2);
  assert.equal(swapSaved.plannedItems.find(ex=>ex.id==='seated-calf').skipReason,'equipment');
  pass('Finished session preserves original sets, replacement sets and recorded skips');

  await nav("Plan");
  assert.equal(await page.locator(".plan-day").count(), 7);
  await page.locator(".plan-day summary").first().click();
  await page.getByRole("button", { name: "Calendar", exact: true }).click();
  await page
    .getByRole("button", { name: "2026-09-07, saved workout", exact: true })
    .click();
  await page.locator(".history-row summary").first().click();
  await page.getByText("Set 1: 25 lb × 10 ✓ · RPE 7 · good quality · symptoms: none", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Previous month" }).click();
  await page.getByRole("button", { name: "Next month" }).click();
  await page.screenshot({
    animations: "disabled",
    path: resolve(artifacts, "plan-mobile.png"),
    fullPage: true,
  });
  pass(
    "Seven-day plan expands and calendar displays actual stored sets across month navigation",
  );
  await context.setOffline(false);
  await page.clock.setFixedTime(new Date(2026, 8, 9, 12));
  await page.reload();
  await enterIntro();
  await nav("Today");
  await response();
  await nav("Progress");
  await page.getByRole('button',{name:'Overview',exact:true}).click();
  await page.locator('.history-row > summary').first().click();
  const readableReview=page.locator('.coaching-review').first();
  await readableReview.getByText('AI coaching review',{exact:true}).click();
  const readableReport=await readableReview.getByLabel('Coaching report',{exact:true}).inputValue();
  assert.ok(readableReport.includes('Next-morning review: Session tolerated'));
  assert.ok(readableReport.includes('Your notes: My Achilles feels better than usual.'));
  assert.ok(!/TOLERATED|functionChange|repeatedWorsening|\{"/.test(readableReport));
  await readableReview.screenshot({path:resolve(artifacts,'readable-coaching-review.png'),style:'.bottom-nav {visibility:hidden;}'});
  await nav('Plan');
  await page.getByRole('button',{name:'Calendar',exact:true}).click();
  await page.getByRole('button',{name:'2026-09-07, saved workout',exact:true}).click();
  await page.locator('.history-row > summary').first().click();
  await page.getByText('Next-morning details',{exact:true}).click();
  await page.getByText('Symptoms compared with usual: Back to usual baseline',{exact:true}).waitFor();
  await page.getByText('Walking or daily function worse?: No',{exact:true}).waitFor();
  await page.getByText('Your notes: My Achilles feels better than usual.',{exact:true}).waitFor();
  assert.equal(await page.locator('.history-row pre').count(),0);
  await page.locator('.history-row').first().screenshot({path:resolve(artifacts,'readable-next-morning.png'),style:'.bottom-nav {visibility:hidden;}'});
  pass('Saved next-morning details and coaching export show plain-language answers with original notes');
  const beforeCorrection=(await readStore('sessions')).find(s=>s.date==='2026-09-07' && !s.domain);
  const editor=page.locator('.history-row .session-editor').first();
  await editor.getByRole('button',{name:'Edit session',exact:true}).click();
  await editor.getByLabel('Session notes',{exact:true}).fill('Cancelled note');
  await editor.getByRole('button',{name:'Cancel',exact:true}).click();
  assert.deepEqual((await readStore('sessions')).find(s=>s.id===beforeCorrection.id),beforeCorrection);
  await editor.getByRole('button',{name:'Edit session',exact:true}).click();
  await editor.locator('details > summary').first().click();
  await editor.getByLabel(/set 1 load$/).first().fill('0');
  await editor.getByLabel('Session notes',{exact:true}).fill('Corrected setup: load is per hand.');
  await editor.getByLabel('Correction reason',{exact:true}).fill('Corrected load and setup');
  await editor.screenshot({path:resolve(artifacts,'completed-session-editor.png'),style:'.bottom-nav {visibility:hidden;}'});
  await editor.getByRole('button',{name:'Save corrections',exact:true}).click();
  await editor.getByText('Corrections saved. Charts and coaching reports use the updated record.',{exact:true}).waitFor();
  const corrected=(await readStore('sessions')).find(s=>s.id===beforeCorrection.id);
  assert.equal(corrected.revision,1); assert.deepEqual(corrected.correctionHistory[0].original,beforeCorrection);
  assert.deepEqual(corrected.nextDayResponse,beforeCorrection.nextDayResponse); assert.equal(corrected.status,beforeCorrection.status);
  await page.reload(); await enterIntro(); await nav('Progress');
  await page.getByRole('button',{name:'Overview',exact:true}).click();
  await page.locator('.history-row > summary').first().click();
  await page.locator('.coaching-review').first().getByText('AI coaching review',{exact:true}).click();
  const revisedText=await page.locator('.coaching-review').first().getByLabel('Coaching report',{exact:true}).inputValue();
  assert.ok(revisedText.includes('Corrected setup: load is per hand.') && revisedText.includes('Weekly training context'));
  pass('Completed session corrections persist, cancel leaves data unchanged, original and tolerance are preserved, report refreshes');
  await nav('Today');
  await checkin();
  await nav("Progress");
  await page.getByRole("button", { name: "Sport", exact: true }).click();
  await page.getByRole("button", { name: "Open R1 exposure" }).click();
  await page.locator("#field-minutes").fill("18");
  await page.locator("#field-sessionRPE").fill("4");
  await page.locator("#field-intensity").fill("Easy");
  await page.locator("#field-movementQuality").selectOption("good");
  await page.locator("#field-immediateAchillesResponse").selectOption("good");
  await page.getByRole("button", { name: "← Progress" }).click();
  await page.reload();
  await enterIntro();
  await page.getByRole("button", { name: "Sport", exact: true }).click();
  await page.getByRole("button", { name: "Open R1 exposure" }).click();
  assert.equal(await page.locator("#field-minutes").inputValue(), "18");
  await page
    .getByRole("button", { name: "Save exposure", exact: true })
    .click();
  await page.getByRole("heading", { name: "Today", exact: true }).waitFor();
  assert.equal(
    (await readStore("sessions")).find((s) => s.domain === "running").status,
    "PENDING_NEXT_DAY_RESPONSE",
  );
  await nav("Progress");
  await page.getByRole("button", { name: "Sport", exact: true }).click();
  assert.ok(
    await page.getByRole("button", { name: "Open R1 exposure" }).isDisabled(),
  );
  await page.screenshot({
    animations: "disabled",
    path: resolve(artifacts, "progress-mobile.png"),
    fullPage: true,
  });
  pass(
    "Run exposure draft survives reload; saved dose remains pending and prevents advancement",
  );
  await nav("More");
  await page.getByRole("button", { name: "Backup & restore" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON backup" }).click();
  const download = await downloadPromise;
  const file = resolve(artifacts, "qa-backup.json");
  await download.saveAs(file);
  const backup = JSON.parse(await readFile(file, "utf8"));
  assert.equal(backup.sessions.length, 3);
  await page.locator("input[type=file]").setInputFiles(file);
  await page.getByRole("button", { name: "Restore validated backup" }).click();
  await page
    .getByText("Backup restored successfully.", { exact: true })
    .waitFor();
  assert.equal((await readStore("sessions")).length, 3);
  pass(
    "Versioned export and validated restore preserve data and avoid duplicate sessions",
  );
  await nav("Today");
  await page.getByRole("button", { name: "Update check-in" }).click();
  await page.locator('input[name="unusual"][value="sharp-pain"]').check();
  await page.getByRole("button", { name: "See Today’s Plan" }).click();
  await page.getByRole("heading", { name: "Stop Achilles Loading" }).waitFor();
  assert.equal(
    await page.getByRole("button", { name: /^(Open|Resume) Workout$/ }).count(),
    0,
  );
  await page.screenshot({
    animations: "disabled",
    path: resolve(artifacts, "today-stop-mobile.png"),
    fullPage: true,
  });
  pass("Red symptoms override readiness and remove loading actions");
  const oldCaches = await page.evaluate(() => caches.keys());
  await page.evaluate(() => caches.open("unrelated-app-cache"));
  workerRevision = 2;
  await page.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    await r.update();
  });
  await page.getByRole("button", { name: "Update & reload" }).waitFor();
  await Promise.all([
    page.waitForEvent("load"),
    page.getByRole("button", { name: "Update & reload" }).click(),
  ]);
  await enterIntro(page, false);
  await page.getByRole("heading", { name: "Today", exact: true }).waitFor();
  await page.waitForFunction(
    async () =>
      !(await caches.keys()).some(
        (k) => k.startsWith("achilles-return:") && !k.endsWith("-qa-update"),
      ),
  );
  const newCaches = await page.evaluate(() => caches.keys());
  assert.ok(newCaches.includes("unrelated-app-cache"));
  assert.ok(oldCaches.every((k) => !newCaches.includes(k)));
  assert.equal((await readStore("sessions")).length, 3);
  pass(
    "Service-worker updates preserve records and remove only obsolete app caches",
  );
  for (const tab of ["Today", "Plan", "Progress", "Tests", "More"]) {
    await nav(tab);
    await page.setViewportSize({ width: 320, height: 900 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      tab + " overflow",
    );
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "200%"),
    );
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      tab + " large text overflow",
    );
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "100%"),
    );
  }
  pass("All five main screens fit 320px and enlarged text");
  await page.locator(".skip-link").focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(() => document.activeElement.id), "main");
  assert.equal(new URL(page.url()).hash, "#More");
  pass(
    "Keyboard skip link focuses content without changing the current screen",
  );
  const fresh = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const welcome = await fresh.newPage();
  await welcome.goto(url);
  await welcome.getByRole("button", { name: "Get Started" }).waitFor();
  await welcome.screenshot({
    animations: "disabled",
    path: resolve(artifacts, "welcome-mobile.png"),
    fullPage: true,
  });
  await welcome.getByRole("button", { name: "Get Started" }).click();
  await welcome.getByRole("heading", { name: "Today", exact: true }).waitFor();
  await welcome.reload();
  await enterIntro(welcome, false);
  await welcome.getByRole("heading", { name: "Today", exact: true }).waitFor();
  await fresh.close();
  pass(
    "First-use hero continues to Today; returning launches open Today",
  );
  await page.clock.setFixedTime(new Date(2026, 8, 30, 12));
  await page.reload();
  await enterIntro();
  await nav("Tests");
  await page
    .getByRole("button", { name: "Start reassessment", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Open detailed assessment", exact: true })
    .click();
  await page.waitForFunction(
    () => document.querySelector("progress")?.max === 13,
  );
  assert.equal(await page.locator("#field-restPain").inputValue(), "");
  await page.locator("#field-assessmentSlot").selectOption("finish");
  const finishValues = { ...baselineValues(), heel_repaired_reps: "30" };
  for (const [index, section] of BASELINE_SECTIONS.entries()) {
    if (section.id === "mobility")
      assert.equal(
        await page.locator("#field-mobility_repaired_trial1").isVisible(),
        true,
      );
    if (section.id === "strength") {
      assert.equal(await page.locator(".assessment-test").count(), 4);
      await page.screenshot({
        path: resolve(artifacts, "baseline-strength-monthly.png"),
        fullPage: true,
      });
    }
    for (const f of section.fields) {
      const value = finishValues[f.id];
      if (f.type === "checks") {
        for (const v of value)
          await page
            .getByRole("group", { name: f.label + (f.required ? " *" : "") })
            .getByLabel(f.options.find((o) => o[0] === v)[1], { exact: true })
            .check();
      } else if (f.type === "select")
        await page.locator(`#field-${f.id}`).selectOption(String(value));
      else await page.locator(`#field-${f.id}`).fill(String(value));
    }
    await page
      .getByRole("button", {
        name:
          index === BASELINE_SECTIONS.length - 1
            ? "Finish assessment"
            : "Continue",
        exact: true,
      })
      .click();
  }
  await page.getByRole("heading", { name: "Tests", exact: true }).waitFor();
  await page.reload();
  await enterIntro();
  await page.getByRole("heading", { name: "Tests", exact: true }).waitFor();
  const monthlyRecords = await readStore("assessments");
  assert.equal(monthlyRecords.length, 2);
  const finishing = monthlyRecords.find(
    (a) => a.values.assessmentSlot === "finish",
  );
  assert.equal(finishing.values.noDailyPain, "yes");
  assert.equal(finishing.values.noRehabPain, "yes");
  assert.equal(finishing.values.heel_repaired_reps, "30");
  await nav("Progress");
  await page.getByRole("button", { name: "Sport", exact: true }).click();
  await page.getByRole("button", { name: "Rehab", exact: true }).click();
  assert.equal(await page.locator("#trend-month").inputValue(), "2026-09");
  assert.equal(
    await page
      .getByRole("img", { name: /Heel-rise repetitions across 2 assessments/ })
      .count(),
    1,
  );
  assert.ok(
    (await page.locator(".assessment-table").first().innerText()).includes(
      "30 reps",
    ),
  );
  await page.screenshot({
    path: resolve(artifacts, "monthly-progress.png"),
    fullPage: true,
  });
  pass(
    "Monthly finishing retest preserves starting data and pain-free answers; separated exercise inputs and charts render",
  );
  await nav("More");
  await page.getByRole("button", { name: /Profile & schedule/ }).click();
  await page.locator("#field-strengthStyle").selectOption("hypertrophy");
  await page
    .getByRole("button", { name: "Save preferences", exact: true })
    .click();
  await page
    .getByText("Preferences saved on this device.", { exact: true })
    .waitFor();
  await nav("Tests");
  await page
    .getByRole("button", { name: "Start reassessment", exact: true })
    .click();
  assert.ok((await page.locator("body").innerText()).includes("Step 1 of 4"));
  const { SIMPLE_SAFETY, SIMPLE_FUNCTION } =
    await import("../src/data/simpleBaseline.js");
  for (const f of SIMPLE_SAFETY.fields.filter(
    (f) => f.required && f.id !== "surgeryDate",
  )) {
    if (f.type === "select")
      await page.locator(`#field-${f.id}`).selectOption(String(values[f.id]));
    else await page.locator(`#field-${f.id}`).fill(String(values[f.id]));
  }
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  for (const f of SIMPLE_FUNCTION.fields) {
    if (f.type === "select")
      await page.locator(`#field-${f.id}`).selectOption(String(values[f.id]));
    else await page.locator(`#field-${f.id}`).fill(String(values[f.id]));
  }
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.screenshot({
    path: resolve(artifacts, "baseline-simple-mobile.png"),
    fullPage: true,
  });
  await page
    .getByText("Single-leg heel-rise test · Not tested", { exact: true })
    .click();
  await page.locator("#field-heel_repaired_reps").fill("15");
  await page.locator("#field-heelQuality").selectOption("yes");
  await page.getByRole("button", { name: "Save & exit", exact: true }).click();
  await page.reload();
  await enterIntro();
  await page
    .getByRole("button", { name: "Resume assessment", exact: true })
    .click();
  assert.ok((await page.locator("body").innerText()).includes("Step 3 of 4"));
  await page
    .getByText("Single-leg heel-rise test · Data entered", { exact: true })
    .click();
  assert.equal(
    await page.locator("#field-heel_repaired_reps").inputValue(),
    "15",
  );
  await page
    .getByRole("button", { name: "Continue with recorded tests", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save baseline", exact: true })
    .click();
  await page.getByRole("heading", { name: "Tests", exact: true }).waitFor();
  const simplified = (await readStore("assessments")).find(
    (a) => a.values.baselineMode === "simple",
  );
  assert.equal(simplified.values.heel_repaired_reps, "15");
  assert.equal(simplified.values.balance_repaired_seconds, undefined);
  assert.equal((await readStore("assessments")).length, 3);
  assert.equal((await readStore("profile"))[0].strengthStyle, "hypertrophy");
  pass(
    "Four-step baseline resumes, saves partial measurements and preserves history and strength preference",
  );
  await nav("More");
  await page.getByRole("button", { name: /Exercise library/i }).click();
  await page.getByRole("heading", { name: "Your exercise library" }).waitFor();
  await page.getByLabel("Find an exercise").fill("seated unilateral hamstring");
  assert.equal(
    await page.getByRole("link", { name: /Short Demo:/ }).count(),
    1,
  );
  assert.match(
    await page.getByRole("link", { name: /Short Demo:/ }).getAttribute("href"),
    /LsP3CaDboRA/,
  );
  await page.getByText("Setup & guidance", { exact: true }).click();
  await page.screenshot({
    path: resolve(artifacts, "exercise-library-mobile.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByRole("button", { name: "All exercises", exact: true }).click();
  await page.locator(".library-filters > summary").click();
  await page.getByLabel("Equipment", { exact: true }).selectOption("plyo-ball");
  assert.equal(
    await page.getByRole("link", { name: /Short Demo:/ }).count(),
    6,
  );
  await page.getByLabel("Muscle group", { exact: true }).selectOption("Arms");
  await page
    .getByRole("heading", { name: "No matching exercises yet" })
    .waitFor();
  await page
    .getByRole("button", { name: "Show all exercises", exact: true })
    .click();
  assert.equal(
    await page.locator('.exercise-library-card .illustrated-exercise').count(),
    20,
  );
  await page.getByRole("button", { name: "Show 20 more exercises" }).click();
  assert.equal(
    await page.locator('.exercise-library-card .illustrated-exercise').count(),
    40,
  );
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  pass(
    "Exercise library search, combined filters, demo link, empty state and pagination work on mobile",
  );
  await nav("Today");
  await page.getByRole("button", { name: "View all →", exact: true }).click();
  await page.getByRole("button", { name: "Cycle", exact: true }).click();
  await page.getByRole("button", { name: "25 min", exact: true }).click();
  await page
    .getByText("Distance, effort & symptoms (optional)", { exact: true })
    .click();
  await page.getByLabel("Distance", { exact: true }).fill("7.5");
  await page
    .getByRole("button", { name: "Save activity", exact: true })
    .click();
  await page
    .getByText("Movement saved on this device.", { exact: true })
    .waitFor();
  await page.reload();
  await enterIntro(page, false);
  await page.getByRole("button", { name: "View all →", exact: true }).click();
  await page.getByText("25 min · 7.5 miles", {exact:true}).waitFor();
  await page.getByRole("button", { name: "← Back", exact: true }).click();
  await checkin();
  await page.getByRole("button", { name: /^(Open|Resume) Workout$/, exact: true }).click();
  const press = page.locator(".exercise-card").filter({
    has: page.getByRole("heading", {
      name: "Incline Dumbbell Press",
      exact: true,
    }),
  });
  await press
    .getByText("Swap exercise", { exact: true })
    .click();
  await press
    .getByLabel("Alternative exercise", { exact: true })
    .selectOption("library-smith-incline-bench-press");
  await press.getByLabel("Apply change to", { exact: true }).selectOption("future");
  await press
    .getByRole("button", { name: "Use this alternative", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Smith incline bench press", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "← Today", exact: true }).click();
  await nav("Plan");
  await page.getByRole("button", { name: "Reschedule", exact: true }).click();
  await page
    .getByLabel("Workout to move", { exact: true })
    .selectOption("2026-09-30");
  await page.getByLabel("Make-up date", { exact: true }).fill("2026-10-01");
  await page.getByRole("button", { name: "Move workout", exact: true }).click();
  await page.getByText(/Workout moved to 2026-10-01/).waitFor();
  await page.clock.setFixedTime(new Date(2026, 9, 1, 12));
  await page.reload();
  await enterIntro(page, false);
  await checkin();
  await page.getByRole("button", { name: /^(Open|Resume) Workout$/, exact: true }).click();
  await page
    .getByRole("heading", { name: "Smith incline bench press", exact: true })
    .waitFor();
  await page.screenshot({
    path: resolve(artifacts, "flexible-workout-mobile.png"),
    fullPage: true,
  });
  pass(
    "Recovery distance persists, press swaps persist, and a moved workout opens on its make-up day",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: resolve(artifacts, "rebuild-workout.png") });
  await nav("Today");
  assert.equal(
    await page.getByLabel("Recovery activity", { exact: true }).count(),
    0,
  );
  assert.equal(
    await page.getByLabel("Workout to move", { exact: true }).count(),
    0,
  );
  await page.screenshot({ path: resolve(artifacts, "rebuild-today.png") });
  await nav("Plan");
  await page.screenshot({ path: resolve(artifacts, "rebuild-plan.png") });
  await nav("Progress");
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page
    .getByRole("heading", { name: "Your training, together", exact: true })
    .waitFor();
  await page
    .getByText(/25 min · 7.5 miles/)
    .first()
    .waitFor();
  await page.screenshot({ path: resolve(artifacts, "rebuild-progress.png") });
  await page.getByRole("button", { name: "Strength", exact: true }).click();
  await page.locator("#strength-trend").selectOption("single-calf");
  await page
    .getByRole("img", {
      name: "Recorded load trend in pounds; values listed below",
      exact: true,
    })
    .waitFor();
  await page.getByText(/Recorded sets/).click();
  await page.getByText("0 lb × 10", { exact: true }).waitFor();
  await nav("Tests");
  await page.screenshot({ path: resolve(artifacts, "rebuild-tests.png") });
  await nav("More");
  await page
    .getByRole("button", { name: "Exercise library", exact: true })
    .click();
  assert.equal(
    await page
      .getByRole("button", { name: "Backup & restore", exact: true })
      .count(),
    0,
  );
  await page
    .getByRole("button", { name: "← All settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Backup & restore", exact: true })
    .waitFor();
  pass(
    "Focused destinations keep forms out of Today, combine recovery and training history, and show recorded strength loads",
  );
  await page.clock.setFixedTime(new Date(2026, 8, 30, 12));
  await page.reload();
  await enterIntro(page,false);
  await nav("Today");
  await page.getByRole("button", { name: "View all →", exact: true }).click();
  await page
    .getByRole("button", { name: "+ Add activity", exact: true })
    .click();
  await page.getByRole("button", { name: "Walk", exact: true }).click();
  await page.getByRole("button", { name: "8,000", exact: true }).click();
  await page.getByRole("button", { name: "Add to today", exact: true }).click();
  await page
    .getByRole("button", { name: "Resume draft", exact: true })
    .waitFor();
  await page.reload();
  await enterIntro(page, false);
  await page.getByRole("button", { name: "View all →", exact: true }).click();
  await page.getByRole("button", { name: "Resume draft", exact: true }).click();
  assert.equal(
    await page.getByLabel("Custom steps", { exact: true }).inputValue(),
    "8000",
  );
  await page
    .getByRole("button", { name: "Save activity", exact: true })
    .click();
  await page
    .getByText("Movement saved on this device.", { exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Undo save", exact: true }).click();
  await page
    .getByText("Save undone. Other activities and workouts are unchanged.", {
      exact: true,
    })
    .waitFor();
  assert.equal(
    await page.getByRole("button", { name: "Edit Walk", exact: true }).count(),
    0,
  );
  assert.equal(
    await page.getByRole("button", { name: "Edit Cycle", exact: true }).count(),
    1,
  );
  pass(
    "Movement drafts survive reload; scoped Undo removes only its saved walk",
  );
  await page.getByRole("button", { name: "Edit Cycle", exact: true }).click();
  await page.getByRole("button", { name: "30 min", exact: true }).click();
  await page
    .getByRole("button", { name: "Save activity", exact: true })
    .click();
  await page.getByText("30 min · 7.5 miles", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "+ Add activity", exact: true })
    .click();
  await page.getByRole("button", { name: "Mobility", exact: true }).click();
  await page
    .locator(".movement-routine")
    .filter({ has: page.getByText("Morning Reset", { exact: true }) })
    .getByRole("button")
    .click();
  await page.locator(".movement-step-check").first().click();
  await page
    .locator(".movement-step")
    .first()
    .getByText("Actual amounts, alternative or skip", { exact: true })
    .click();
  assert.equal(
    await page
      .locator(".movement-step")
      .first()
      .getByLabel("Seconds", { exact: true })
      .inputValue(),
    "60",
  );
  await page
    .locator(".movement-step")
    .first()
    .getByLabel("Seconds", { exact: true })
    .fill("45");
  await page
    .locator(".movement-step")
    .first()
    .getByText("Short Demo & setup", { exact: true })
    .click();
  await page.screenshot({ path: resolve(artifacts, "movement-routine.png") });
  await page.getByRole("button", { name: "Add to today", exact: true }).click();
  await context.setOffline(true);
  await page.reload();
  await enterIntro(page, false);
  await page.getByRole("button", { name: "View all →", exact: true }).click();
  await page.getByRole("button", { name: "Resume draft", exact: true }).click();
  await page
    .locator(".movement-step")
    .first()
    .getByText("Actual amounts, alternative or skip", { exact: true })
    .click();
  assert.equal(
    await page
      .locator(".movement-step")
      .first()
      .getByLabel("Seconds", { exact: true })
      .inputValue(),
    "45",
  );
  await page
    .getByRole("button", { name: "Save activity", exact: true })
    .click();
  await page.getByText("1 of 5 exercises", { exact: true }).waitFor();
  await context.setOffline(false);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({ path: resolve(artifacts, "movement-summary.png") });
  await page.setViewportSize({ width: 320, height: 740 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await nav("Progress");
  await page.getByRole("button", { name: "Movement", exact: true }).click();
  await page
    .getByRole("heading", { name: "Movement this week", exact: true })
    .waitFor();
  await page.getByRole("img", { name: /activities/ }).waitFor();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({
    path: resolve(artifacts, "movement-progress.png"),
    fullPage: true,
  });
  const movementRows = (await readStore("settings")).filter(
    (r) => r.kind === "activity" && r.status === "saved",
  );
  assert.equal(
    movementRows.filter((r) => r.activityType === "cycle").length,
    1,
  );
  assert.equal(
    movementRows.find((r) => r.routineInstance)?.routineInstance
      .exerciseCompletions[0].actual.durationSeconds,
    45,
  );
  pass(
    "Movement edits preserve IDs; routine actual amounts autosave offline and appear in mobile Progress",
  );
  await nav("Tests");
  const assessmentsBefore = await readStore("assessments");
  await page.getByLabel("Result (reps)").fill("0");
  await page.getByLabel("Setup, assistance and repetitions").fill("Flat floor, fingertip balance");
  await page.getByRole("button", {name:"Save measurement", exact:true}).click();
  await page.getByText("Measurement saved on this device.", {exact:true}).waitFor();
  await page.reload(); await enterIntro();
  await page.getByText("1 recorded results", {exact:true}).click();
  await page.getByText("0 reps", {exact:true}).waitFor();
  assert.deepEqual(await readStore("assessments"), assessmentsBefore);
  await page.screenshot({path:resolve(artifacts,"companion-measurements.png"),fullPage:true});
  pass("Independent zero measurement survives reload without changing clinical assessments");
  await nav("More");
  await page.getByRole("button", {name:"Exercise library",exact:true}).click();
  await page.getByLabel("Find an exercise").fill("Dumbbell Biceps Curl");
  await page.getByRole("button", {name:"Favorite: Dumbbell Biceps Curl",exact:true}).click();
  await page.getByText("Saved favorite",{exact:true}).waitFor();
  await page.reload(); await enterIntro();
  await page.getByRole("button", {name:"Exercise library",exact:true}).click();
  await page.getByRole("button", {name:"Favorites",exact:true}).click();
  await page.getByRole("button", {name:"Favorite: Dumbbell Biceps Curl",exact:true}).waitFor();
  pass("Favorite exercise survives reload and appears in Favorites");
  await nav("Today");
  const brand = page.locator(".daily-brand img");
  await brand.scrollIntoViewIfNeeded();
  await brand.evaluate(img => img.decode());
  const source = await brand.getAttribute("src");
  assert.match(source,/daily-brand\/day-\d{2}\.webp$/);
  await page.reload(); await enterIntro();
  assert.equal(await page.locator(".daily-brand img").getAttribute("src"),source);
  assert.equal(await page.getByRole("button",{name:"Get Started",exact:true}).count(),0);
  await page.locator(".daily-brand img").scrollIntoViewIfNeeded();
  await page.locator(".daily-brand img").evaluate(img => img.decode());
  await page.screenshot({path:resolve(artifacts,"companion-today.png"),fullPage:true});
  await nav("More");
  await page.getByRole("heading",{name:"App & data status"}).waitFor();
  await page.getByRole("button",{name:/Replay welcome/}).click();
  await page.getByRole("button",{name:"Get Started",exact:true}).waitFor();
  pass("Daily branding stays stable on refresh; returning launch and optional hero replay work");
  await page.getByRole('button',{name:'Get Started',exact:true}).click();
  await nav('Today');
  for(const width of [320,390,1440]) {
    await page.setViewportSize({width,height:900}); await page.evaluate(()=>window.scrollTo(0,0));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:resolve(artifacts,`design-today-${width}.png`),fullPage:true});
  }
  const img=page.locator('.daily-brand img'); await img.evaluate(i=>i.decode());
  assert.equal(await img.evaluate(i=>getComputedStyle(i).objectFit),'contain');
  assert.equal(await page.locator('.daily-brand figcaption').evaluate(e=>getComputedStyle(e).position),'static');
  assert.ok((await page.locator('.app-shell').boundingBox()).width<=720);
  pass('Phone and desktop layouts reflow; daily photo is uncropped and caption stays below; desktop retains 720px shell');
  assert.deepEqual(errors, []);
  pass("No browser runtime errors");
  await writeFile(
    resolve(artifacts, "browser-qa-results.json"),
    JSON.stringify({ passed, failed: 0, isolatedProfile: true }, null, 2),
  );
} catch (error) {
  if (page) {
    console.error(await page.locator("body").innerText());
    await page.screenshot({
      path: resolve(artifacts, "browser-failure.png"),
      fullPage: true,
    });
  }
  await writeFile(
    resolve(artifacts, "browser-qa-results.json"),
    JSON.stringify({ passed, failed: 1, error: String(error) }, null, 2),
  );
  throw error;
} finally {
  await browser?.close();
  await new Promise((r) => server.close(r));
}
