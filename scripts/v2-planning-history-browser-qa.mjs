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
  out = resolve("artifacts/v2-phase6");
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
  console.log("PASS V6 " + t);
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
const t = compose(emptyIntent("Mixed strength + rehab"), {
  type: "add",
  definition: DEFINITIONS.find((d) => d.id === "bilateral-calf"),
});
t.categories = ["Strength", "Achilles Rehab", "Running"];
t.occurrences[0].sets[0].target = {
  reps: targetNumber("8", "count"),
  load: targetNumber("20", "lb"),
  loadConvention: known("total-external"),
};
const p = schedule(t, date),
  second = schedule({ ...t, name: "Evening conditioning" }, date);
let s = startSession(p, new Date().toISOString());
s = sessionCommand(s, {
  type: "actual",
  id: s.occurrences[0].id,
  setId: s.occurrences[0].sets[0].id,
  actual: {
    reps: targetNumber("7", "count"),
    load: targetNumber("20", "lb"),
    loadConvention: known("total-external"),
  },
});
s = sessionCommand(s, {
  type: "complete",
  id: s.occurrences[0].id,
  setId: s.occurrences[0].sets[0].id,
});
s = sessionCommand(s, { type: "finish", lifecycle: "completed" });
const legacy = {
  id: "earlier-test",
  date,
  createdAt: date + "T09:00:00Z",
  finishedAt: date + "T10:00:00Z",
  workoutTitle: "Earlier recorded workout",
  status: "PENDING_NEXT_DAY_RESPONSE",
  plannedItems: [],
  exerciseLog: {},
};
try {
  await page.goto(`http://127.0.0.1:${server.address().port}/qa/`);
  await button("Get Started").click();
  await storage("v2PlannedWorkouts", [p, second]);
  await storage("v2WorkoutSessions", [s]);
  await storage("sessions", [legacy]);
  await storage("v2WorkoutTemplates", [t]);
  await enter();
  await page
    .locator(".record-event")
    .filter({ hasText: "Mixed strength + rehab" })
    .first()
    .waitFor();
  await shot("weekly-plan-desktop");
  pass("Weekly plan shows multiple same-day plans and actual work");
  await page.setViewportSize({ width: 390, height: 844 });
  await shot("weekly-plan-mobile");
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  pass("390px weekly planning fits");
  await page
    .locator(".record-event")
    .filter({ hasText: "Evening conditioning" })
    .click();
  await page.getByLabel("Move to date").fill(date);
  await button("Move workout").focus();
  await page.keyboard.press("Enter");
  await page
    .getByText("Plan saved. Existing sessions are unchanged.", { exact: true })
    .waitFor();
  pass("Keyboard move commits independent dated plan");
  await button("Duplicate planned workout").click();
  await page.getByText("Saving…", { exact: true }).waitFor({ state: "hidden" });
  assert.equal((await storage("v2PlannedWorkouts")).length, 3);
  pass("Duplicate creates separate plan");
  await button("Skip workout").click();
  await page.getByText("Saving…", { exact: true }).waitFor({ state: "hidden" });
  assert.ok(
    (await storage("v2PlannedWorkouts")).some((x) => x.status === "skipped"),
  );
  await button("Restore plan").click();
  await page.getByText("Saving…", { exact: true }).waitFor({ state: "hidden" });
  pass("Skip and restore are explicit and not performed training");
  await button("Calendar").click();
  await page.getByRole("button", { name: `Day ${date}`, exact: true }).click();
  await shot("calendar-mobile");
  await shot("multiple-sessions-day");
  await page.setViewportSize({ width: 1280, height: 900 });
  await shot("calendar-desktop");
  pass("Month and selected day distinguish planned/completed records");
  await button("History").click();
  await page
    .getByRole("button")
    .filter({ hasText: "Earlier recorded workout" })
    .waitFor();
  await shot("unified-history");
  pass("V1 and V2 appear in unified history");
  await page
    .locator(".record-event")
    .filter({ hasText: "Mixed strength + rehab" })
    .click();
  await button("Review coaching report").click();
  await page.getByRole("region", { name: "Coaching report" }).waitFor();
  await shot("coaching-report");
  assert.match(
    await page
      .getByRole("region", { name: "Coaching report" })
      .locator("textarea")
      .inputValue(),
    /not medical clearance/,
  );
  pass("Report preserves targets actuals and unknown delayed response");
  await page
    .getByText("Record delayed tendon response", { exact: true })
    .click();
  await page.getByLabel("Tendon change").selectOption("baseline");
  await page.getByLabel("Function changed").selectOption("no");
  await page.getByLabel("Repeated worsening").selectOption("no");
  await page.getByLabel("Response notes").fill("Usual baseline");
  await shot("delayed-response");
  await button("Save delayed response").click();
  await page
    .getByText(
      "Response saved. Guidance reevaluated; workout lifecycle unchanged.",
      { exact: true },
    )
    .waitFor();
  assert.equal((await storage("v2WorkoutSessions"))[0].lifecycle, "completed");
  pass("Raw delayed response saves separately and guidance reevaluates");
  await button("Correct set").click();
  await page
    .getByRole("region", { name: "Audited correction" })
    .getByLabel("Reps", { exact: true })
    .fill("6");
  await page.getByLabel("Correction reason").fill("Correcting a miscount");
  await shot("historical-correction");
  await button("Save audited correction").click();
  await page
    .getByText("Correction saved with prior revision preserved.", {
      exact: true,
    })
    .waitFor();
  assert.equal(
    (await storage("v2WorkoutSessions"))[0].correctionLineage.length,
    1,
  );
  pass("Audited correction retains previous revision");
  await button("Exercise history").click();
  await shot("exercise-history");
  assert.match(
    await page.locator(".training-records").innerText(),
    /total-external/,
  );
  pass("Exercise history retains actual load convention");
  await button("Exposure history").click();
  await shot("exposure-history");
  assert.match(await page.locator(".training-records").innerText(), /Running/);
  pass("Exposure history retains category and recorded metrics");
  await button("Weekly Plan").click();
  await page.getByLabel("Workout source").selectOption(t.id);
  await button("Save to plan").click();
  await button("Start planned workout").waitFor();
  await page.getByLabel("Replacement template").selectOption("blank");
  await button("Replace planned workout").click();
  await page
    .getByText("Plan saved. Existing sessions are unchanged.", { exact: true })
    .waitFor();
  assert.equal((await storage("v2WorkoutTemplates"))[0].occurrences.length, 1);
  pass(
    "Schedule user template and replace dated intent without editing its source",
  );
  await button("Weekly Plan").click();
  const starterValue = await page
    .getByLabel("Workout source")
    .locator("option")
    .filter({ hasText: /Strength A.*Full/ })
    .first()
    .getAttribute("value");
  await page.getByLabel("Workout source").selectOption(starterValue);
  await button("Save to plan").click();
  await button("Start planned workout").waitFor();
  pass("Curated starter can be scheduled independently");
  await button("Weekly Plan").click();
  await page.setViewportSize({ width: 320, height: 760 });
  await button("History").click();
  await shot("history-mobile");
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  pass("320px history remains usable");
  await button("Weekly Plan").click();
  await page.getByLabel("Workout source").selectOption("blank");
  await page.getByLabel("Workout name").fill("Recovery weekly");
  await page.getByLabel("Repeat weekly", { exact: true }).check();
  await button("Save to plan").click();
  await page
    .getByText("Weekly structure saved as independent workouts.", {
      exact: true,
    })
    .waitFor();
  pass("Recurring weekly structure expands locally");
  await button("Calendar").click();
  await page
    .locator(".record-event")
    .filter({ hasText: "Evening conditioning" })
    .first()
    .click();
  await button("Start planned workout").click();
  await page.locator(".workout-execution").waitFor();
  await shot("started-from-plan");
  pass("Plan starts independent session despite advisory uncertainty");
  await page.reload();
  await enter();
  await button("History").click();
  assert.ok((await storage("v2WorkoutSessions")).length === 2);
  pass("Reload preserves plans and sessions");
  await context.setOffline(true);
  await button("Weekly Plan").click();
  await page.getByLabel("Workout name").fill("Offline plan");
  await button("Save to plan").click();
  await page
    .getByRole("heading", { name: "Offline plan", exact: true })
    .waitFor();
  assert.ok(
    (await storage("v2PlannedWorkouts")).some(
      (x) => x.snapshot.name === "Offline plan",
    ),
  );
  await context.setOffline(false);
  pass("Offline planning save uses committed local repository");
  assert.deepEqual(errors, []);
  await writeFile(
    resolve(out, "browser-results.json"),
    JSON.stringify({ passed, errors }, null, 2),
  );
} catch (e) {
  await page.screenshot({ path: resolve(out, "failure.png"), fullPage: true });
  throw e;
} finally {
  await context.close();
  await browser.close();
  server.close();
}
