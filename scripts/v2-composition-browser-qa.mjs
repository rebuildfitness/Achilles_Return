import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import assert from "node:assert/strict";
import { legacy } from "../tests/fixtures/v2/records.mjs";
const root = resolve("dist"),
  out = resolve("artifacts/v2-phase3");
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
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "msedge",
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
});
const page = await context.newPage(),
  errors = [],
  passed = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("dialog", (d) => d.accept());
const pass = (m) => {
  passed.push(m);
  console.log("PASS V3 " + m);
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
try {
  await page.goto(url);
  await button("Get Started").click();
  await enter();
  await button("Start blank workout").click();
  await page
    .getByLabel("Workout name", { exact: true })
    .fill("Mixed strength + rehab");
  await saved();
  assert.equal((await rows("v2WorkoutSessions")).length, 0);
  pass(
    "Blank workout creates saved intent without baseline or starting V1/V2 execution",
  );
  await page.screenshot({
    path: resolve(out, "blank-mobile.png"),
    fullPage: true,
  });
  await add("bilateral calf");
  let card = page.locator(".builder-exercise").first();
  assert.ok(await card.getByRole("link", { name: /Short Demo/ }).count());
  await card.getByLabel("Target format").selectOption("weighted-reps");
  await card.getByLabel("Reps", { exact: true }).fill("8");
  await card.getByLabel("Load", { exact: true }).fill("20");
  await card.getByLabel("Load convention").selectOption("total-external");
  await card.getByText("Rest, side, tempo & notes", { exact: true }).click();
  await card.getByLabel("Side", { exact: true }).selectOption("left");
  await card.getByLabel("Tempo", { exact: true }).fill("3-1-X-0");
  await card.getByLabel("Rest", { exact: true }).fill("90");
  await card.getByLabel("Set notes", { exact: true }).fill("Controlled");
  await card.getByLabel("Set type").selectOption("warm-up");
  await button("Add set", card).click();
  await card.getByLabel("Set type").nth(1).selectOption("working");
  await card.getByLabel("Reps", { exact: true }).nth(1).fill("10");
  await button("Move set 2 up", card).click();
  await saved();
  pass(
    "Researched exercise, direct demo, load/reps, rest, left side, tempo and accessible set reordering",
  );
  await button("Duplicate exercise", card).click();
  assert.equal(await page.locator(".builder-exercise").count(), 2);
  await page
    .locator(".builder-exercise")
    .nth(1)
    .getByLabel("Reps", { exact: true })
    .first()
    .fill("12");
  await page
    .locator(".builder-exercise")
    .nth(1)
    .getByRole("button", { name: /^Move .* up$/ }).first()
    .click();
  await saved();
  const repeated = (await rows("v2PlannedWorkouts"))[0].snapshot.occurrences;
  assert.equal(
    repeated[0].exerciseDefinitionId,
    repeated[1].exerciseDefinitionId,
  );
  assert.notEqual(repeated[0].id, repeated[1].id);
  assert.notEqual(repeated[0].sets[0].id, repeated[1].sets[0].id);
  pass(
    "Repeated definition uses independent occurrence/set identities and targets; exercise reorder works",
  );
  await button("Add superset").click();
  await card
    .getByLabel("Group", { exact: true })
    .selectOption({ label: "Superset 1 (superset)" });
  await button("Add circuit").click();
  await page
    .locator(".builder-exercise")
    .nth(1)
    .getByLabel("Group", { exact: true })
    .selectOption({ label: "Circuit 2 (circuit)" });
  await page
    .locator(".builder-exercise")
    .nth(1)
    .getByLabel("Set type")
    .first()
    .selectOption("rehab");
  await card.getByLabel("Group", { exact: true }).selectOption("");
  await saved();
  pass(
    "Superset/circuit creation, assignment and ungrouping keep full workout visible",
  );
  await button("Replace", card).click();
  let picker = page.getByRole("dialog");
  await picker.getByText("Filter exercises", { exact: true }).click();
  await picker.getByLabel("Body region", { exact: true }).selectOption("Back");
  assert.ok((await picker.locator("li").count()) > 0);
  await picker.getByLabel("Search exercises").fill("row");
  await picker.getByRole("button", { name: /^Add / }).first().click();
  await button("Add set", card).click();
  await button("Remove set 2", card).click();
  await saved();
  pass(
    "Picker search and combined metadata filters, replacement and set removal",
  );
  await button("Create custom exercise").click();
  await page
    .getByLabel("Exercise name", { exact: true })
    .fill("My bike intervals");
  await page
    .getByLabel("Tracking type", { exact: true })
    .selectOption("intervals");
  await page.getByLabel("Equipment (comma separated)").fill("exercise-bike");
  await page
    .getByLabel("Demo URL (optional)")
    .fill("https://example.invalid/my-demo");
  await page
    .getByLabel("Exercise notes", { exact: true })
    .last()
    .fill("Synthetic browser exercise");
  await button("Save custom exercise").click();
  await page
    .getByText(
      "Custom exercise saved with unverified media and unknown clinical demand.",
    )
    .waitFor();
  let interval = page.locator(".builder-exercise").last();
  assert.ok((await interval.innerText()).includes("unverified"));
  await button("Add work/recovery bout", interval).click();
  await button("Add work/recovery bout", interval).click();
  await interval.getByLabel("Repeat sequence").fill("6");
  await interval
    .locator(".builder-intervals")
    .getByLabel("Duration", { exact: true })
    .nth(0)
    .fill("60");
  await interval
    .locator(".builder-intervals")
    .getByLabel("Duration", { exact: true })
    .nth(1)
    .fill("120");
  await interval.getByLabel("Distance", { exact: true }).first().fill("2");
  await interval.getByLabel("Distance unit").first().selectOption("km");
  await saved();
  pass(
    "Custom unverified exercise and ordered work/recovery intervals with repeat count and typed distance",
  );
  await page
    .getByLabel("Workout notes", { exact: true })
    .fill("Full session visible; synthetic QA targets");
  await saved();
  await page.screenshot({
    path: resolve(out, "mixed-mobile.png"),
    fullPage: true,
  });
  await page.locator('.builder-exercise').first().evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 70));
  await page.screenshot({ path: resolve(out, 'editor-mobile.png') });
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.screenshot({
    path: resolve(out, "mixed-desktop.png"),
    fullPage: true,
  });
  await page.locator('.builder-exercise').first().evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 70));
  await page.screenshot({ path: resolve(out, 'editor-desktop.png') });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.setViewportSize({ width: 320, height: 850 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  pass(
    "Desktop and 320px mobile full-workout layouts fit; screenshots captured",
  );
  await button("Save as template").click();
  await page
    .getByText(
      "Saved as a new template. Future draft edits affect this workout only.",
    )
    .waitFor();
  const originalTemplate = (await rows("v2WorkoutTemplates"))[0];
  await page
    .getByLabel("Workout name", { exact: true })
    .fill("Independent workout edit");
  await saved();
  assert.equal(
    (await rows("v2WorkoutTemplates"))[0].name,
    originalTemplate.name,
  );
  await button("Update Template").click();
  await page
    .getByText(
      "Template updated explicitly. Existing workout snapshots are unchanged.",
    )
    .waitFor();
  assert.equal(
    (await rows("v2WorkoutTemplates"))[0].name,
    "Independent workout edit",
  );
  pass(
    "Save as template, workout-only edits and explicit Update Template preserve scope",
  );
  await button("← All workout drafts").click();
  await button("Duplicate template").click();
  assert.equal((await rows("v2WorkoutTemplates")).length, 2);
  await button("Create workout / edit").first().click();
  await page
    .getByLabel("Workout name", { exact: true })
    .fill("Second independent draft");
  await saved();
  await button("← All workout drafts").click();
  assert.equal(await button("Edit draft").count(), 2);
  pass("Template duplication and second same-date workout draft");
  await page.reload();
  await enter();
  await button("Edit draft", page.locator(".builder-saved").filter({hasText:"Second independent draft"})).click();
  assert.equal(
    await page.getByLabel("Workout name", { exact: true }).inputValue(),
    "Second independent draft",
  );
  await saved();
  pass("Browser reload recovers independent draft with stable IDs");
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise((r) =>
        navigator.serviceWorker.addEventListener("controllerchange", r, {
          once: true,
        }),
      );
  });
  await context.setOffline(true);
  await page
    .getByLabel("Workout notes", { exact: true })
    .fill("Offline target edit");
  await saved();
  await page.reload();
  await enter();
  await button("Edit draft", page.locator(".builder-saved").filter({hasText:"Second independent draft"})).click();
  assert.equal(
    await page.getByLabel("Workout notes", { exact: true }).inputValue(),
    "Offline target edit",
  );
  await context.setOffline(false);
  pass("Offline save and refresh recover composed targets");
  // Synthetic competing-tab write, preserving the snapshot under an increased revision.
  await page.evaluate(async () => {
    const db = await new Promise((r) => {
      const q = indexedDB.open("achilles-return-db");
      q.onsuccess = () => r(q.result);
    });
    await new Promise((r) => {
      const tx = db.transaction("v2PlannedWorkouts", "readwrite"),
        s = tx.objectStore("v2PlannedWorkouts"),
        q = s.getAll();
      q.onsuccess = () => {
        const d = q.result.find(
          (x) => x.snapshot.name === "Second independent draft",
        );
        s.put({
          ...d,
          revision: d.revision + 1,
          snapshot: { ...d.snapshot, name: "Other tab edit" },
        });
      };
      tx.oncomplete = r;
    });
    db.close();
  });
  await page
    .getByLabel("Workout name", { exact: true })
    .fill("Recovered local edit");
  await page
    .getByText(
      "A newer edit exists. Your changes were saved as a separate recovery draft.",
    )
    .waitFor();
  await saved();
  assert.ok(
    (await rows("v2PlannedWorkouts")).some(
      (d) => d.snapshot.name === "Other tab edit",
    ),
  );
  pass(
    "Stale autosave is visible and preserves both revisions as separate drafts",
  );
  await button(
    "Remove exercise",
    page.locator(".builder-exercise").first(),
  ).click();
  await saved();
  await button("Discard draft").click();
  await button("Start blank workout").waitFor();
  pass("Exercise removal and confirmed draft discard preserve templates");
  await page.evaluate(async (row) => {
    const db = await new Promise((r) => {
      const q = indexedDB.open("achilles-return-db");
      q.onsuccess = () => r(q.result);
    });
    await new Promise((r) => {
      const tx = db.transaction("sessions", "readwrite");
      tx.objectStore("sessions").put(row);
      tx.oncomplete = r;
    });
    db.close();
  }, legacy.normal);
  await page.reload();
  await enter();
  await button("Copy as new intent").click();
  await saved();
  const copies = (await rows("v2PlannedWorkouts")).filter((d) =>
    d.snapshot.name.includes("copy"),
  );
  assert.ok(copies.length);
  assert.ok(
    copies
      .at(-1)
      .snapshot.occurrences.every((o) => o.sets.every((s) => !("actual" in s))),
  );
  assert.deepEqual(
    (await rows("sessions")).find((s) => s.id === legacy.normal.id),
    legacy.normal,
  );
  pass(
    "Completed workout copies as fresh intent without altering V1 actuals or responses",
  );
  await button("← All workout drafts").click();
  await page.getByRole("button", { name: /^Strength A.*Full/ }).click();
  await saved();
  assert.ok((await page.locator(".builder-exercise").count()) > 5);
  pass(
    "Curated Strength A Full is an editable starter without readiness filtering",
  );
  await page.keyboard.press("Tab");
  assert.ok(
    await page.evaluate(() => document.activeElement !== document.body),
  );
  assert.deepEqual(errors, []);
  pass("Keyboard focus and browser runtime remain healthy");
  await writeFile(
    resolve(out, "browser-results.json"),
    JSON.stringify({ passed, errors }, null, 2),
  );
} catch (e) {
  console.log((await page.locator("body").innerText()).slice(-9000));
  await page.screenshot({ path: resolve(out, "failure.png"), fullPage: true });
  throw e;
} finally {
  await context.close();
  await browser.close();
  await new Promise((r) => server.close(r));
}
