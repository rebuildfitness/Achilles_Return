import { schedule } from "../src/domain/v2/planning.js";
import { startSession, sessionCommand } from "../src/domain/v2/execution.js";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import assert from "node:assert/strict";
import { DEFINITIONS } from "../src/domain/v2/compositionContent.js";
import {
  newDraft,
  emptyIntent,
  compose,
  known,
  targetNumber,
  customDefinition,
} from "../src/domain/v2/composition.js";
const root = resolve("dist"),
  out = resolve("artifacts/v2-final");
await mkdir(out, { recursive: true });
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const file = resolve(root, path.replace(/^\/qa\//, "") || "index.html");
    if (!file.startsWith(root + sep)) throw Error("path");
    res.setHeader(
      "Content-Type",
      {
        ".js": "text/javascript",
        ".css": "text/css",
        ".html": "text/html",
        ".svg": "image/svg+xml",
      }[extname(file)] || "application/octet-stream",
    );
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "msedge",
  headless: true,
});
const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  }),
  page = await context.newPage();
const passed = [],
  errors = [];
page.on("pageerror", (e) => (errors.push(e.message), console.error(e.stack)));
page.on("dialog", (d) => d.accept());
const button = (name, scope = page) =>
  scope.getByRole("button", { name, exact: true });
const panel = () => page.getByRole("region", { name: "Workout guidance" });
const pass = (t) => {
  passed.push(t);
  console.log("PASS FINAL " + t);
};
async function storage(store, records = null) {
  return page.evaluate(
    async ({ store, records }) => {
      const db = await new Promise((r, j) => {
        const q = indexedDB.open("achilles-return-db");
        q.onsuccess = () => r(q.result);
        q.onerror = () => j(q.error);
      });
      return new Promise((r, j) => {
        const tx = db.transaction(store, records ? "readwrite" : "readonly");
        let q;
        if (records) records.forEach((v) => tx.objectStore(store).put(v));
        else q = tx.objectStore(store).getAll();
        tx.oncomplete = () => {
          db.close();
          r(q?.result);
        };
        tx.onabort = () => j(tx.error);
      });
    },
    { store, records },
  );
}
async function enter() {
  await button("More").click();
  await button("Plan, Calendar & History").click();
  await page
    .getByRole("heading", { name: "Plan & training records", exact: true })
    .waitFor();
}
async function shot(name) {
  await page.screenshot({ path: resolve(out, name + ".png"), fullPage: true });
  await page.screenshot({ path: resolve(out, name + "-viewport.png") });
}
const date = new Date().toLocaleDateString("en-CA");
const nav = async (name) => {
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name, exact: true })
    .click();
};
const goto = async (name) => {
  await page.evaluate((n) => (location.hash = n), name);
  await page.waitForTimeout(180);
};
const saved = async () => {
  await page.getByText("Saved on this device", { exact: true }).waitFor();
};
async function add(search) {
  await button("Add exercise").click();
  const dialog = page.getByRole("dialog", { name: "Choose an exercise" });
  await dialog.getByLabel("Search exercises").fill(search);
  await dialog.getByRole("button", { name: /^Add / }).first().click();
  await saved();
}
try {
  await page.goto(`http://127.0.0.1:${server.address().port}/qa/`);
  await page.getByRole("heading", { name: "Today", exact: true }).waitFor();
  await shot("today-desktop");
  pass("Today opens without a readiness permission");
  await page.setViewportSize({ width: 390, height: 844 });
  await shot("today-mobile");
  await nav("Train");
  await page.getByRole("heading", { name: "Train", exact: true }).waitFor();
  await shot("train-home");
  await button("Start Blank Workout").click();
  await page
    .getByLabel("Workout name", { exact: true })
    .fill("Final mixed journey");
  await saved();
  await add("bilateral calf");
  await add("incline dumbbell");
  await add("stationary cycling");
  const cards = page.locator(".builder-exercise");
  for (const [i, format] of [
    "reps",
    "weighted-reps",
    "distance-time",
  ].entries()) {
    await page
      .getByLabel("Target format", { exact: true })
      .nth(i)
      .selectOption(format);
    await saved();
  }
  await page
    .getByText("Training categories for guidance", { exact: true })
    .click();
  await page.getByRole("checkbox", { name: "Strength", exact: true }).check();
  await page
    .getByRole("checkbox", { name: "Achilles Rehab", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Cardiovascular Training", exact: true })
    .check();
  await saved();
  await shot("workout-builder");
  await button("Save as template").click();
  await page
    .getByText(
      "Saved as a new template. Future draft edits affect this workout only.",
      { exact: true },
    )
    .waitFor();
  const template = (await storage("v2WorkoutTemplates")).find(
    (x) => x.name === "Final mixed journey",
  );
  assert.ok(template);
  pass("Mobile mixed workout and independent user template saved");
  await nav("Plan");
  await page.getByLabel("Workout source").selectOption(template.id);
  await button("Save to plan").click();
  await button("Back to records").click();
  await page
    .locator(".record-event")
    .filter({ hasText: "Final mixed journey" })
    .first()
    .waitFor();
  await shot("plan");
  await goto("Calendar");
  await page.getByRole("button", { name: `Day ${date}`, exact: true }).click();
  await shot("calendar");
  await page
    .locator(".record-event")
    .filter({ hasText: "Final mixed journey" })
    .first()
    .click();
  await button("Start planned workout").click();
  await page.locator(".execution-set").first().waitFor();
  await saved();
  const setRows = () => page.locator(".execution-set");
  let actual = setRows()
    .nth(0)
    .getByRole("group", { name: "Actual performance", exact: true });
  await actual.getByLabel("Reps", { exact: true }).fill("8");
  await button("Complete set", setRows().nth(0)).click();
  await saved();
  actual = setRows()
    .nth(1)
    .getByRole("group", { name: "Actual performance", exact: true });
  await actual.getByLabel("Reps", { exact: true }).fill("7");
  await actual.getByLabel("Load", { exact: true }).fill("20");
  await button("Complete set", setRows().nth(1)).click();
  await saved();
  actual = setRows()
    .nth(2)
    .getByRole("group", { name: "Actual performance", exact: true });
  await actual.getByLabel("Duration", { exact: true }).fill("10");
  await actual.getByLabel("Distance", { exact: true }).fill("2");
  await button("Complete set", setRows().nth(2)).click();
  await saved();
  await shot("active-workout");
  await add("single-leg balance");
  await shot("mid-session-addition");
  await storage('checkins',[{id:date,date,answers:{unusualSymptoms:['sharp-pain']}}]);
  await button("Refresh guidance").click();
  await page
    .getByText("Reviewing saved workout…", { exact: true })
    .waitFor({ state: "hidden" });
  const continueAdvice = page
    .getByRole("region", { name: "Workout guidance" })
    .getByRole("button", { name: /^(Continue|Continue Anyway)$/ })
    .first();
  assert.ok(await continueAdvice.count(),'Red-flag guidance must permit a recorded Continue Anyway decision');
  if (await continueAdvice.count()) {
    await continueAdvice.click();
    await page
      .getByText("Reviewing saved workout…", { exact: true })
      .waitFor({ state: "hidden" });
  }
  assert.ok((await storage('v2GuidanceDecisions')).some(d=>d.action==='continued-anyway'));
  pass('Strong warning decision is recorded without blocking factual logging or claiming clearance');
  await button("Finish workout").first().click();
  await button("Save partial workout").click();
  await saved();
  let session = (await storage("v2WorkoutSessions")).find(
    (s) => s.lifecycle === "partial",
  );
  assert.ok(session);
  assert.equal(session.occurrences.length, 4);
  assert.equal(session.occurrences[1].sets[0].actual.reps.amount.value, 7);
  pass(
    "Calendar start, strength/cardio actuals, addition and partial finish on mobile",
  );
  await goto("History");
  await page
    .locator(".record-event")
    .filter({ hasText: "Final mixed journey" })
    .first()
    .click();
  await shot("unified-history");
  await button("Review coaching report").click();
  await page.getByRole("region", { name: "Coaching report" }).waitFor();
  assert.match(
    await page
      .getByRole("region", { name: "Coaching report" })
      .locator("textarea")
      .inputValue(),
    /not medical clearance/,
  );
  await shot("coaching-report");
  await page
    .getByText("Record delayed tendon response", { exact: true })
    .click();
  await page.getByLabel("Tendon change").selectOption("baseline");
  await page.getByLabel("Function changed").selectOption("no");
  await page.getByLabel("Repeated worsening").selectOption("no");
  await button("Save delayed response").click();
  await page
    .getByText(
      "Response saved. Guidance reevaluated; workout lifecycle unchanged.",
      { exact: true },
    )
    .waitFor();
  assert.equal((await storage("v2WorkoutSessions"))[0].lifecycle, "partial");
  assert.ok((await storage("v2GuidanceEvents")).length);
  pass("Response observations trigger advice without changing completion");
  await button("Correct set").first().click();
  await page
    .getByRole("region", { name: "Audited correction" })
    .getByLabel("Reps", { exact: true })
    .fill("9");
  await page.getByLabel("Correction reason").fill("Factual count correction");
  await button("Save audited correction").click();
  await page
    .getByText("Correction saved with prior revision preserved.", {
      exact: true,
    })
    .waitFor();
  await shot("audited-correction");
  assert.ok((await storage("v2WorkoutSessions"))[0].correctionLineage.length);
  pass("History correction and immediate coaching export preserve audit");
  await nav("Progress");
  await page
    .getByRole("heading", { name: "1 recorded workouts", exact: true })
    .waitFor();
  await shot("progress-overview");
  for (const [label, file] of [
    ["Strength", "strength-progress"],
    ["Achilles", "achilles-progress"],
    ["Cardio & sport", "running-cardio-progress"],
    ["Symptoms & responses", "symptom-response-trends"],
  ]) {
    await button(label).click();
    await shot(file);
  }
  pass("Progress reflects actual recorded workout and separate response");
  await goto("Learn");
  await page
    .getByRole("heading", { name: "Rehab Guide", exact: true })
    .waitFor();
  await shot("rehab-guide-overview");
  for (const [name, file] of [
    ["2. Foundational Strength", "foundational-strength-guide"],
    ["3. Running Readiness", "running-readiness-guide"],
    ["6. Plyometrics", "plyometrics-guide"],
    ["9. Basketball Re-entry", "basketball-guide"],
  ]) {
    await button(name).click();
    await shot(file);
  }
  await button("6. Plyometrics").click();
  await shot("advanced-without-lock");
  await button("Add to workout").first().click();
  await page
    .getByRole("heading", { name: "Workout Builder", exact: true })
    .waitFor();
  await saved();
  await shot("guide-exercise-added");
  assert.ok(
    (await storage("v2PlannedWorkouts")).some((p) =>
      p.snapshot.occurrences.some((o) =>
        o.exerciseDefinitionId.startsWith("guide-plyometrics"),
      ),
    ),
  );
  pass("All guide phases browseable and advanced exercise added without gate");
  await goto("Settings");
  await page.getByRole("heading", { name: "Settings", exact: true }).waitFor();
  await shot("settings");
  await nav("Explore");
  await shot("mobile-navigation");
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "Today",
      "Train",
      "Plan",
      "Calendar",
      "Progress",
      "Learn",
      "Settings",
    ]) {
      await goto(route);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} overflow at ${width}`,
      );
    }
  }
  pass("Primary screens fit 320/390/tablet/desktop");
  await goto("Today");
  await shot("today-desktop-final");
  await goto("Calendar");
  await shot("completed-calendar");
  // Use the real UI export, then restore the same backup: identical records are idempotent.
  await goto("Settings");
  await button("Backup & restore").click();
  const exportButton = page
    .getByRole("button", {
      name: /Export.*JSON|Download.*backup|Export backup/i,
    })
    .first();
  const downloadPromise = page.waitForEvent("download");
  await exportButton.click();
  const download = await downloadPromise;
  const backupPath = resolve(out, "synthetic-backup.json");
  await download.saveAs(backupPath);
  const backup = JSON.parse(await readFile(backupPath, "utf8"));
  assert.ok(backup);
  await page.locator("input[type=file]").setInputFiles(backupPath);
  await page
    .getByRole("button", { name: /Restore|Import/ })
    .filter({ hasText: /Confirm|Restore/ })
    .last()
    .click();
  await page.waitForTimeout(300);
  assert.equal((await storage("v2WorkoutSessions")).length, 1);
  pass("Combined backup UI repeat restore preserves one session");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForTimeout(250);
  await context.setOffline(true);
  await page.reload();
  for (const route of [
    "Today",
    "Train",
    "Plan",
    "Calendar",
    "History",
    "Progress",
    "Learn",
    "Settings",
  ]) {
    await goto(route);
    await page.getByText(/Offline — saved workouts/).waitFor();
  }
  await shot("offline-final-app");
  assert.equal((await storage("v2WorkoutSessions")).length, 1);
  pass("Offline reload and all primary destinations retain restored records");
  await context.setOffline(false);
  assert.deepEqual(errors, []);
  await writeFile(
    resolve(out, "browser-results.json"),
    JSON.stringify({ passed, errors }, null, 2),
  );
} catch (e) {
  await shot("failure");
  throw e;
} finally {
  await context.close();
  await browser.close();
  await new Promise((r) => server.close(r));
}
