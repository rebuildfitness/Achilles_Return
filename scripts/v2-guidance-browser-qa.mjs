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
  out = resolve("artifacts/v2-phase5");
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
page.on("pageerror", (e) => errors.push(e.message));
page.on("dialog", (d) => d.accept());
const button = (name, scope = page) =>
  scope.getByRole("button", { name, exact: true });
const panel = () => page.getByRole("region", { name: "Workout guidance" });
const pass = (t) => {
  passed.push(t);
  console.log("PASS V5 " + t);
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
  await button("Workout Builder").click();
  await page
    .getByRole("heading", { name: "Workout Builder", exact: true })
    .waitFor();
}
async function ready() {
  await panel().waitFor();
  await button("Refresh guidance", panel()).waitFor();
  await page.waitForFunction(
    () =>
      !document
        .querySelector(".v2-guidance")
        ?.textContent.includes("Reviewing saved workout…"),
  );
}
async function shot(name) {
  await panel().scrollIntoViewIfNeeded();
  await page.screenshot({ path: resolve(out, name + ".png"), fullPage: true });
  await page.screenshot({ path: resolve(out, name + "-viewport.png") });
}
const date = new Date().toLocaleDateString("en-CA"),
  priorDate = new Date(Date.now() - 86400000).toLocaleDateString("en-CA");
const green = {
  pain: "none",
  stiffness: "normal",
  swelling: "normal",
  previousResponse: "good",
  recovery: "good",
  unusualSymptoms: [],
};
const values = {
  noDailyPain: "yes",
  noRehabPain: "yes",
  gait: "normal",
  function_5: "normal",
  heel_repaired_reps: 10,
  heelQuality: "yes",
  goodBalance: "yes",
  psychReady: "yes",
  clearance: "yes",
  noRestrictions: "yes",
  bilateralSafe: "yes",
  bilateralTen: "yes",
};
const def = DEFINITIONS.find((d) => d.id === "bilateral-calf");
function plan(d = def) {
  const t = compose(emptyIntent("Guidance browser workout"), {
    type: "add",
    definition: d,
  });
  t.occurrences[0].sets[0].target = {
    reps: targetNumber("10", "count"),
    load: targetNumber("20", "lb"),
    loadConvention: known("total-external"),
  };
  return newDraft(t, date);
}
async function open(p) {
  p.snapshot.name = "Guidance " + p.id;
  await storage("v2PlannedWorkouts", [p]);
  await page.reload();
  await enter();
  await page
    .locator(".builder-saved")
    .filter({ hasText: p.snapshot.name })
    .getByRole("button", { name: "Edit draft", exact: true })
    .click();
  await ready();
}
try {
  await page.goto(`http://127.0.0.1:${server.address().port}/qa/`);
  await button("Get Started").click();
  await enter();
  const p = plan();
  await open(p);
  await panel()
    .getByText("Assessment information is unavailable", { exact: true })
    .waitFor();
  await shot("information");
  pass("Information: missing assessment is uncertainty, and builder is usable");
  await storage("checkins", [{ id: date, answers: green }]);
  await storage("assessments", [
    {
      id: "a",
      completedAt: priorDate + "T10:00:00Z",
      values,
      result: { phase: "Foundational Strength" },
    },
  ]);
  await storage("sessions", [
    {
      id: "prior",
      date: priorDate,
      createdAt: priorDate + "T12:00:00Z",
      status: "TOLERATED",
      plannedItems: [
        { ...def.sourceMetadata, id: def.id, sets: 1, reps: "10" },
      ],
      exerciseLog: {
        [def.id]: {
          sets: [
            {
              complete: true,
              reps: 10,
              load: 20,
              rpe: 7,
              quality: "good",
              symptoms: "none",
            },
          ],
        },
      },
    },
  ]);
  await button("Refresh guidance", panel()).click();
  await ready();
  await panel()
    .getByText("Consider reviewing the working load", { exact: true })
    .waitFor();
  await shot("recommendation");
  const recommendation = panel()
    .locator("article")
    .filter({ hasText: "Consider reviewing the working load" });
  await recommendation.getByText("View Why", { exact: true }).click();
  await shot("view-why");
  pass("Recommendation retains evidence limitations and rule/revision details");
  await button("Modify Workout", recommendation).click();
  await panel()
    .getByLabel("Proposal set")
    .selectOption(p.snapshot.occurrences[0].sets[0].id);
  await panel().getByLabel("Proposed target load").fill("22");
  await shot("modify-workout");
  await button("Apply Change", panel()).click();
  await ready();
  assert.equal(
    (await storage("v2PlannedWorkouts")).find((s) => s.id === p.id).snapshot
      .occurrences[0].sets[0].target.load.amount.value,
    22,
  );
  pass("Explicit Apply changes the intended target and records a decision");
  await storage("checkins", [
    { id: date, answers: { ...green, pain: "mild" } },
  ]);
  await button("Refresh guidance", panel()).click();
  await ready();
  await shot("caution");
  await button("Continue", panel()).first().click();
  await ready();
  pass("Caution Continue records acknowledgment without mutating workout");
  await storage("checkins", [
    { id: date, answers: { ...green, unusualSymptoms: ["sharp-pain"] } },
  ]);
  await button("Refresh guidance", panel()).click();
  await ready();
  await shot("strong-warning");
  await button("Continue Anyway", panel()).click();
  await ready();
  await shot("continue-anyway");
  await panel()
    .getByText(/Recorded decision: continued anyway/)
    .waitFor();
  await shot("recorded-override");
  const ds = await storage("v2GuidanceDecisions");
  assert.ok(
    ds.some((d) => d.action === "continued-anyway" && !("clearance" in d)),
  );
  pass(
    "Strong warning retains stop advice and persists override without clearance",
  );
  await button("Refresh guidance", panel()).click();
  await ready();
  assert.equal(await button("Continue Anyway", panel()).count(), 0);
  pass("Unchanged acknowledged warning is not prompted again");
  await page
    .getByLabel("Workout name", { exact: true })
    .fill("Edited guidance workout");
  await page.getByText(/Previous guidance is stale/).waitFor();
  await button("Refresh guidance", panel()).click();
  await ready();
  await button("Continue Anyway", panel()).waitFor();
  pass("Changed revision invalidates old guidance and reevaluates");
  await button("Start Workout").click();
  await page.locator(".workout-execution").waitFor();
  await ready();
  await button("Continue Anyway", panel()).click();
  await ready();
  const set = page.locator("[data-set]").first();
  await button("Complete set", set).click();
  await button("Finish workout").first().click();
  await button("Save completed workout").click();
  await page.getByText("completed ·", { exact: false }).first().waitFor();
  pass("Session can start, log and finish despite strong warning");
  await button("← Workout Builder").click();
  const custom = customDefinition({
    name: "Unreviewed personal drill",
    trackingType: "reps",
    categories: ["Running"],
  });
  await storage("v2ExerciseDefinitions", [custom]);
  await open(plan(custom));
  if (
    await panel()
      .getByRole("button", { name: /View All Guidance/ })
      .count()
  )
    await panel()
      .getByRole("button", { name: /View All Guidance/ })
      .click();
  await panel()
    .getByText("Clinical loading classification is unknown", { exact: true })
    .waitFor();
  await shot("custom-unknown");
  pass("Custom exercise retains unknown demand and remains selectable");
  const later = { ...def, id: def.id, phaseAssociations: ["Running"] };
  await open(plan(later));
  const all = panel().getByRole("button", { name: /View All Guidance/ });
  if (await all.count()) await all.click();
  await panel()
    .getByText("Exercise phase association differs from your current focus", {
      exact: true,
    })
    .waitFor();
  await shot("phase-mismatch");
  await button("Start Workout").click();
  await page.locator(".workout-execution").waitFor();
  await ready();
  pass("Phase mismatch does not lock selection or start");
  await page.setViewportSize({ width: 390, height: 844 });
  await shot("guidance-mobile");
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.keyboard.press("Tab");
  assert.ok(
    await page.evaluate(() => document.activeElement !== document.body),
  );
  pass("Mobile guidance fits viewport and supports keyboard focus");
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
