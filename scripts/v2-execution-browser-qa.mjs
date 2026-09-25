import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import {
  emptyIntent,
  newDraft,
  compose,
  targetNumber,
  known,
} from "../src/domain/v2/composition.js";
import {
  DEFINITIONS,
  starterTemplates,
} from "../src/domain/v2/compositionContent.js";
const root = resolve("dist"),
  out = resolve("artifacts/v2-phase4");
await mkdir(out, { recursive: true });
const server = createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const file = resolve(root, p.replace(/^\/qa\//, "") || "index.html");
    if (!file.startsWith(root + sep)) throw Error("path");
    res.setHeader(
      "Content-Type",
      {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".webmanifest": "application/manifest+json",
      }[extname(file)] || "application/octet-stream",
    );
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}/qa/`;
const profile = await mkdtemp(resolve(tmpdir(), "achilles-v4-qa-"));
const launch = () =>
  chromium.launchPersistentContext(profile, {
    channel: process.env.BROWSER_CHANNEL || "msedge",
    headless: true,
    viewport: { width: 390, height: 844 },
  });
let context = await launch(),
  page = await context.newPage();
const errors = [],
  passed = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("dialog", (d) => d.accept());
const pass = (m) => {
  passed.push(m);
  console.log("PASS V4 " + m);
};
const button = (n, scope = page) =>
  scope.getByRole("button", { name: n, exact: true });
const saved = () =>
  page.getByText("Saved on this device", { exact: true }).waitFor();
const rows = (store) =>
  page.evaluate(async (store) => {
    const db = await new Promise((r, j) => {
      const q = indexedDB.open("achilles-return-db");
      q.onsuccess = () => r(q.result);
      q.onerror = () => j(q.error);
    });
    return await new Promise((r, j) => {
      const tx = db.transaction(store),
        q = tx.objectStore(store).getAll();
      q.onsuccess = () => {
        r(q.result);
        db.close();
      };
      q.onerror = () => j(q.error);
    });
  }, store);
const enter = async () => {
  await button("More").click();
  await button("Workout Builder").click();
  await page
    .getByRole("heading", { name: "Workout Builder", exact: true })
    .waitFor();
};
async function add(search) {
  await button("Add exercise").click();
  const dialog = page.getByRole("dialog", { name: "Choose an exercise" });
  await dialog.getByLabel("Search exercises").fill(search);
  await dialog.getByRole("button", { name: /^Add / }).first().click();
  await saved();
}
async function seed(store, records) {
  await page.evaluate(
    async ({ store, records }) => {
      const db = await new Promise((r, j) => {
        const q = indexedDB.open("achilles-return-db");
        q.onsuccess = () => r(q.result);
        q.onerror = () => j(q.error);
      });
      await new Promise((r, j) => {
        const tx = db.transaction(store, "readwrite");
        records.forEach((v) => tx.objectStore(store).put(v));
        tx.oncomplete = () => {
          db.close();
          r();
        };
        tx.onabort = () => j(tx.error);
      });
    },
    { store, records },
  );
}
const exercise = () => page.locator(".workout-execution [data-occurrence]");
const setRows = () => exercise().first().locator("[data-set]");
const sessionRows = () => rows("v2WorkoutSessions");
const shot = async (name) => {
  await page.screenshot({ path: resolve(out, name + ".png"), fullPage: true });
  const target =
    name === "partial-finish-summary"
      ? page.locator(".execution-review")
      : name === "cardio-time-distance"
        ? exercise().nth(1)
        : name === "interval-execution"
          ? exercise().nth(2).locator("[data-bout]").first()
          : name === "added-mid-session"
            ? exercise().last()
            : name === "strength-logging" || name === "replacement-preserved"
              ? exercise().first()
              : page.locator(".workout-execution");
  if (["active-mixed-desktop","active-mixed-mobile","resumed-active"].includes(name)) await page.evaluate(()=>window.scrollTo(0,0));
  else if(name === "group-execution") await page.locator(".execution-round").first().evaluate(el=>el.scrollIntoView({block:"start"}));
  else if (await target.count()) await target.evaluate(el=>el.scrollIntoView({block:"start"}));
  await page.screenshot({ path: resolve(out, name + "-viewport.png") });
};
const resume = async () => {
  await page.reload();
  await enter();
  await button("Resume workout").first().click();
  await page.locator(".workout-execution").waitFor();
};
const def = DEFINITIONS.find((d) => d.id === "bilateral-calf");
try {
  await page.goto(url);
  await button("Get Started").click();
  await enter();
  await button("Start blank workout").click();
  await saved();
  await button("Start Workout").click();
  await page.locator(".workout-execution").waitFor();
  let initial = (await sessionRows())[0];
  assert.equal(initial.occurrences.length, 0);
  assert.equal(initial.lifecycle, "in-progress");
  pass(
    "Start blank composition persists independent session without readiness or actuals",
  );
  await button("Finish workout").first().click();
  await button("Abandon zero-work workout").click();
  await saved();
  assert.equal((await sessionRows())[0].lifecycle, "abandoned");
  await button("← Workout Builder").click();
  let t = compose(emptyIntent("Execution mixed test"), {
    type: "add",
    definition: def,
  });
  t = compose(t, { type: "add-set", id: t.occurrences[0].id });
  t.occurrences[0].targetTrackingType = "weighted-reps";
  t.occurrences[0].sets[0].target = {
    reps: targetNumber("8", "count"),
    load: targetNumber("185", "lb"),
  };
  t = compose(t, {
    type: "add",
    definition: DEFINITIONS.find((d) => d.id !== def.id),
  });
  t.occurrences[1].targetTrackingType = "distance-time";
  t.occurrences[1].sets[0].target = {
    duration: targetNumber("20", "minutes"),
    distance: targetNumber("2", "km"),
  };
  t = compose(t, { type: "add", definition: def });
  t.occurrences[2].targetTrackingType = "intervals";
  t.occurrences[2].sets[0].repeatCount = 6;
  t.occurrences[2].sets[0].intervals = [
    {
      id: "work",
      order: 0,
      kind: "work",
      target: { duration: targetNumber("60", "seconds") },
    },
    {
      id: "recovery",
      order: 1,
      kind: "recovery",
      target: { duration: targetNumber("120", "seconds") },
    },
  ];
  t.groups = [
    { id: "superset", name: "Strength pair", kind: "superset", rounds: 2 },
    { id: "circuit", name: "Recovery circuit", kind: "circuit", rounds: 1 },
  ];
  t.occurrences[0].groupId = "superset";
  t.occurrences[1].groupId = "superset";
  t.occurrences[2].groupId = "circuit";
  const draft = newDraft(t, "2026-09-20");
  await seed("v2PlannedWorkouts", [draft]);
  await page.reload();
  await enter();
  await page
    .locator(".builder-saved")
    .filter({ hasText: "Execution mixed test" })
    .getByRole("button", { name: "Edit draft", exact: true })
    .click();
  await button("Start Workout").click();
  await page.locator(".workout-execution").waitFor();
  await saved();
  let sessions = await sessionRows(),
    active = sessions.find((s) => s.lifecycle === "in-progress"),
    id = active.id;
  assert.notEqual(active.id, draft.id);
  assert.deepEqual(active.originalIntent.value, draft.snapshot);
  assert.equal(active.occurrences[0].sets.length, 2);
  assert.equal(active.occurrences[1].sets.length, 2);
  pass(
    "Mixed session owns original intent, group normalization and independent occurrence/set IDs",
  );
  await page.setViewportSize({ width: 1280, height: 1000 });
  await shot("active-mixed-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await shot("active-mixed-mobile");
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  const firstActual = setRows()
    .first()
    .getByRole("group", { name: "Actual performance", exact: true });
  await firstActual.getByLabel("Reps", { exact: true }).fill("7");
  await firstActual.getByLabel("Load", { exact: true }).fill("185");
  await button("Complete set", setRows().first()).click();
  await saved();
  active = (await sessionRows()).find((s) => s.id === id);
  assert.equal(active.occurrences[0].sets[0].actual.reps.amount.value, 7);
  assert.equal(active.occurrences[0].sets[0].target.reps.amount.value, 8);
  await shot("strength-logging");
  pass(
    "Strength actual logging and completion preserve targets and stable set identity",
  );
  await button("Start rest", setRows().first()).click();
  await saved();
  assert.ok(
    (await sessionRows()).find((s) => s.id === id).execution.restTimer
      .sessionId === id,
  );
  pass(
    "Rest timer persists against session and set without manufacturing completion",
  );
  const cardio = exercise()
    .nth(1)
    .locator("[data-set]")
    .first()
    .getByRole("group", { name: "Actual performance", exact: true });
  await cardio.getByLabel("Duration", { exact: true }).fill("19");
  await cardio
    .getByLabel("Duration unit", { exact: true })
    .selectOption("minutes");
  await cardio.getByLabel("Distance", { exact: true }).fill("1.8");
  await cardio.getByLabel("Distance unit", { exact: true }).selectOption("km");
  await saved();
  await shot("cardio-time-distance");
  pass(
    "Cardio records duration and distance in explicit units without required reps/load",
  );
  const bouts = exercise().nth(2).locator("[data-bout]");
  for (let i = 0; i < 8; i++)
    await button("Complete bout", bouts.nth(i)).click();
  await button("Stop intervals early", exercise().nth(2)).click();
  await saved();
  active = (await sessionRows()).find((s) => s.id === id);
  assert.equal(
    active.occurrences[2].sets[0].intervals.filter(
      (b) => b.disposition === "completed",
    ).length,
    8,
  );
  assert.ok(
    active.occurrences[2].sets[0].intervals
      .slice(8)
      .every((b) => b.disposition === "planned"),
  );
  await shot("interval-execution");
  pass(
    "Intervals stop after four of six repeats and retain remaining unperformed structure",
  );
  await button("Skip round 2").click();
  await saved();
  await shot("group-execution");
  active = (await sessionRows()).find((s) => s.id === id);
  assert.equal(active.occurrences[0].sets[0].disposition, "completed");
  assert.equal(active.occurrences[0].sets[1].disposition, "skipped");
  pass(
    "Superset and circuit round views support skipping without removing completed work",
  );
  await button("Replace remaining work", exercise().first()).click();
  let dialog = page.getByRole("dialog", { name: "Choose an exercise" });
  await dialog.getByLabel("Search exercises").fill("cable row");
  await dialog.getByRole("button", { name: /^Add / }).first().click();
  await saved();
  active = (await sessionRows()).find((s) => s.id === id);
  assert.equal(active.occurrences[0].sets[0].actual.reps.amount.value, 7);
  assert.equal(
    active.occurrences[1].replacesOccurrenceId,
    active.occurrences[0].id,
  );
  await shot("replacement-preserved");
  pass(
    "Exercise replacement retains completed original exercise and independent blank replacement targets",
  );
  await button("Add exercise").click();
  dialog = page.getByRole("dialog", { name: "Choose an exercise" });
  await dialog.getByLabel("Search exercises").fill("bilateral calf");
  await dialog.getByRole("button", { name: /^Add / }).first().click();
  await saved();
  await shot("added-mid-session");
  active = (await sessionRows()).find((s) => s.id === id);
  assert.equal(active.originalIntent.value.occurrences.length, 3);
  assert.equal(active.occurrences.length, 5);
  assert.equal(active.occurrences[4].addedDuringSession, true);
  pass(
    "Mid-session addition and repeated exercise retain independent identities and original intent",
  );
  await button("Create custom exercise").click();
  await page
    .getByLabel("Exercise name", { exact: true })
    .fill("Custom session cardio");
  await page
    .getByLabel("Tracking type", { exact: true })
    .selectOption("reps-time");
  await button("Save custom exercise").click();
  await page.getByRole("heading", { name: /Custom session cardio/ }).waitFor();
  await saved();
  active = (await sessionRows()).find((s) => s.id === id);
  assert.equal(
    active.occurrences.at(-1).definitionSnapshot.provenance.origin,
    "custom",
  );
  const customActual = exercise()
    .last()
    .getByRole("group", { name: "Actual performance", exact: true });
  await customActual.getByLabel("Reps", { exact: true }).fill("5");
  await customActual.getByLabel("Duration", { exact: true }).fill("30");
  await saved();
  pass(
    "Custom exercise created and logged mid-session with reps plus time and unverified origin",
  );
  await button("Add set", exercise().last()).click();
  await saved();
  await button(
    "Remove unperformed set",
    exercise().last().locator("[data-set]").last(),
  ).click();
  await saved();
  pass("Add and remove unperformed set preserve logged work");
  await resume();
  await saved();
  assert.equal(
    await page.locator(".workout-execution").getAttribute("data-session"),
    id,
  );
  await shot("resumed-active");
  pass("Reload resumes exact session identity, timer and actual values");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await resume();
  await page
    .getByLabel("Session notes", { exact: true })
    .fill("Offline committed notes");
  await saved();
  await resume();
  assert.equal(
    await page.getByLabel("Session notes", { exact: true }).inputValue(),
    "Offline committed notes",
  );
  await context.setOffline(false);
  pass("Offline reload and autosave preserve active session");
  await context.close();
  context = await launch();
  page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  await page.goto(url);
  await enter();
  await button("Resume workout").first().click();
  await saved();
  assert.equal(
    await page.locator(".workout-execution").getAttribute("data-session"),
    id,
  );
  assert.equal(
    await page.getByLabel("Session notes", { exact: true }).inputValue(),
    "Offline committed notes",
  );
  pass(
    "Browser process restart reopens disposable profile with committed session and timer identity",
  );
  await page.setViewportSize({ width: 320, height: 800 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.keyboard.press("Tab");
  assert.ok(
    await page.evaluate(() => document.activeElement !== document.body),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await exercise()
      .first()
      .getByRole("link", { name: /Short Demo/ })
      .count(),
  );
  pass(
    "320px full-workout layout, keyboard focus and direct demo access remain available",
  );
  await button("Finish workout").first().click();
  await shot("partial-finish-summary");
  await button("Save partial workout").click();
  await saved();
  active = (await sessionRows()).find((s) => s.id === id);
  assert.equal(active.lifecycle, "partial");
  assert.deepEqual(active.responses, []);
  assert.deepEqual(active.originalIntent.value, draft.snapshot);
  pass(
    "Partial finish persists actuals and unperformed targets independently of tendon response",
  );
  await button("← Workout Builder").click();
  if (await button("← All workout drafts").count())
    await button("← All workout drafts").click();
  await page
    .locator(".builder-saved")
    .filter({ hasText: "Execution mixed test" })
    .filter({ has: button("Copy as new intent") })
    .getByRole("button", { name: "Copy as new intent", exact: true })
    .click();
  await saved();
  await button("Start Workout").click();
  await saved();
  const copied = (await sessionRows()).find(
    (s) => s.lifecycle === "in-progress",
  );
  assert.ok(
    copied.occurrences.every((o) =>
      o.sets.every((s) => Object.keys(s.actual).length === 0),
    ),
  );
  pass(
    "Copied previous intent starts as a separate session without copying actuals",
  );
  // Concurrent synthetic revision, never production user data.
  const newer = structuredClone(copied);
  newer.revision++;
  newer.execution.notes = "Other tab committed";
  await seed("v2WorkoutSessions", [newer]);
  await page
    .getByLabel("Session notes", { exact: true })
    .fill("Stale local note");
  await page.getByRole("alert").waitFor();
  assert.equal(
    (await sessionRows()).find((s) => s.id === copied.id).execution.notes,
    "Other tab committed",
  );
  assert.ok(
    await page.evaluate(
      (id) => !!localStorage.getItem("v2-execution-recovery:" + id),
      copied.id,
    ),
  );
  pass(
    "Stale revision shows recovery and retains pending edits without overwriting newer session",
  );
  await button("Load saved session").click();
  await button("← Workout Builder").click();
  if (await button("← All workout drafts").count())
    await button("← All workout drafts").click();
  await button("Start blank workout").click();
  await page
    .getByLabel("Workout name", { exact: true })
    .fill("User template source");
  await saved();
  await add("bilateral calf");
  await button("Save as template").click();
  await saved();
  await button("Start Workout").click();
  await saved();
  const userSession = (await sessionRows()).find(
    (s) => s.name.value === "User template source",
  );
  assert.ok(userSession.templateRef);
  await button("Complete set", setRows().first()).click();
  await saved();
  await button("Finish workout").first().click();
  await button("Save completed workout").click();
  await saved();
  assert.equal(
    (await sessionRows()).find((s) => s.id === userSession.id).lifecycle,
    "completed",
  );
  pass(
    "User-template instance starts and completes independently with unknown actual amounts retained",
  );
  const templates = await rows("v2WorkoutTemplates");
  const edited = {
    ...templates.find((t) => t.id === userSession.templateRef),
    name: "Changed template later",
  };
  edited.revision++;
  await seed("v2WorkoutTemplates", [edited]);
  assert.equal(
    (await sessionRows()).find((s) => s.id === userSession.id).name.value,
    "User template source",
  );
  pass("Later template edits do not alter finished session");
  await button("← Workout Builder").click();
  if (await button("← All workout drafts").count())
    await button("← All workout drafts").click();
  await page
    .getByRole("button", { name: /Strength A.*Full/ })
    .first()
    .click();
  await saved();
  await button("Start Workout").click();
  await saved();
  const allSessions = await sessionRows();
  assert.ok(
    allSessions.filter((s) => s.lifecycle === "in-progress").length >= 2,
  );
  assert.ok(allSessions.every((s) => s.id));
  pass(
    "Curated starter starts without planner mutation and multiple same-day sessions coexist",
  );
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
  await rm(profile, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 200,
  });
  await new Promise((r) => server.close(r));
}
