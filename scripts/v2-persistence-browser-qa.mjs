import { chromium } from "playwright";
import { build } from "vite";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, extname, sep } from "node:path";
import assert from "node:assert/strict";
const root = fileURLToPath(new URL("../", import.meta.url));
await build({
  configFile: false,
  publicDir: false,
  logLevel: "error",
  build: {
    outDir: resolve(root, "artifacts/v2-browser"),
    emptyOutDir: false,
    lib: {
      entry: resolve(root, "scripts/v2-browser-harness.js"),
      formats: ["es"],
      fileName: () => "harness.js",
    },
  },
});
let revision = 1;
const scope = "/v2-persistence-qa/";
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (!path.startsWith(scope)) {
      res.writeHead(404).end();
      return;
    }
    const relative = path.slice(scope.length);
    res.setHeader("Cache-Control", "no-store");
    if (!relative || relative === "index.html") {
      res.setHeader("Content-Type", "text/html");
      res.end(
        '<!doctype html><title>Disposable V2 persistence QA</title><script type="module" src="./harness.js"></script>',
      );
      return;
    }
    if (relative === "harness.js") {
      res.setHeader("Content-Type", "text/javascript");
      res.end(await readFile(resolve(root, "artifacts/v2-browser/harness.js")));
      return;
    }
    const base = resolve(root, "dist"),
      target = resolve(base, relative);
    if (!target.startsWith(base + sep)) {
      res.writeHead(403).end();
      return;
    }
    let data = await readFile(target);
    if (relative === "sw.js")
      data = Buffer.from(
        data
          .toString()
          .replace(
            /const BUILD = '[^']+';/,
            `const BUILD = 'v2-qa-${revision}';`,
          )
          .replace("const CORE = [", 'const CORE = ["./harness.js",') +
          `\n// test-update-${revision}`,
      );
    res.setHeader(
      "Content-Type",
      {
        ".js": "text/javascript",
        ".html": "text/html",
        ".json": "application/json",
        ".svg": "image/svg+xml",
        ".css": "text/css",
      }[extname(target)] || "application/octet-stream",
    );
    res.end(data);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}${scope}`;
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : { channel: "msedge" }),
});
const context = await browser.newContext(),
  page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
const ready = async (p) => {
  await p.goto(url);
  await p.waitForFunction(() => !!window.v2Test);
};
const pass = (message) => console.log("PASS V2 " + message);
try {
  await ready(page);
  const blocker = await context.newPage();
  await ready(blocker);
  await blocker.evaluate(async () => {
    const req = indexedDB.open("achilles-return-db", 2);
    req.onupgradeneeded = () => {
      for (const n of [
        "profile",
        "checkins",
        "sessions",
        "assessments",
        "capabilityStates",
        "decisions",
        "settings",
      ])
        req.result.createObjectStore(n, { keyPath: "id" });
    };
    window.oldConnection = await new Promise((r, j) => {
      req.onsuccess = () => r(req.result);
      req.onerror = () => j(req.error);
    });
    const tx = window.oldConnection.transaction("sessions", "readwrite");
    tx.objectStore("sessions").put({
      id: "legacy-browser",
      unknownField: { zero: 0, blank: "" },
    });
    await new Promise((r) => (tx.oncomplete = r));
  });
  const blocked = await page.evaluate(async () => {
    try {
      await window.v2Test.getDb();
      return "unexpected";
    } catch (e) {
      return e.message;
    }
  });
  assert.match(blocked, /Close other/);
  await blocker.evaluate(() => window.oldConnection.close());
  await blocker.close();
  await page.waitForFunction(async () => {
    try {
      return (await window.v2Test.getDb()).version === 3;
    } catch {
      return false;
    }
  });
  assert.deepEqual(
    await page.evaluate(() => window.v2Test.get("sessions", "legacy-browser")),
    { id: "legacy-browser", unknownField: { zero: 0, blank: "" } },
  );
  pass(
    "blocked cross-tab upgrade retries at schema 3 without changing V1 data",
  );
  await page.evaluate(async () => {
    const f = window.v2Test.persistedFixtures();
    await window.v2Test.atomicV2(
      Object.entries(f).map(([store, record]) => ({
        store,
        record,
        expectedRevision: null,
      })),
    );
    const s = { ...f.v2WorkoutSessions, id: "second-same-date" };
    await window.v2Test.saveV2("v2WorkoutSessions", s, null);
  });
  assert.equal(
    await page.evaluate(
      async () => (await window.v2Test.listV2("v2WorkoutSessions")).length,
    ),
    2,
  );
  pass("multiple session-keyed drafts persist on the same date");
  const peer = await context.newPage();
  await ready(peer);
  await page.evaluate(async () => {
    const s = await window.v2Test.readV2(
      "v2WorkoutSessions",
      "session-fixture",
    );
    await window.v2Test.saveV2(
      "v2WorkoutSessions",
      { ...s, revision: 2, lifecycle: "in-progress" },
      1,
    );
  });
  assert.match(
    await peer.evaluate(async () => {
      const s = window.v2Test.persistedFixtures().v2WorkoutSessions;
      try {
        await window.v2Test.saveV2(
          "v2WorkoutSessions",
          { ...s, revision: 2, lifecycle: "abandoned" },
          1,
        );
        return "unexpected";
      } catch (e) {
        return e.message;
      }
    }),
    /Stale/,
  );
  pass("cross-tab stale session edit cannot overwrite a newer revision");
  await peer.close();
  await page.evaluate(async () => {
    await navigator.serviceWorker.register("./sw.js");
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(
    () => !!window.v2Test && !!navigator.serviceWorker.controller,
  );
  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(() => !!window.v2Test);
  await page.evaluate(async () => {
    await window.v2Test.closeDb();
    const s = await window.v2Test.readV2(
      "v2WorkoutSessions",
      "session-fixture",
    );
    await window.v2Test.saveV2(
      "v2WorkoutSessions",
      { ...s, revision: 3, resumedAt: "2026-09-21T00:10:00Z" },
      2,
    );
  });
  await page.reload();
  await page.waitForFunction(() => !!window.v2Test);
  assert.equal(
    await page.evaluate(
      async () =>
        (await window.v2Test.readV2("v2WorkoutSessions", "session-fixture"))
          .revision,
    ),
    3,
  );
  pass("offline reload/save/reopen preserves draft identity across midnight");
  await context.setOffline(false);
  revision = 2;
  await page.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    await r.update();
  });
  await page.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    await new Promise((resolve) => {
      navigator.serviceWorker.addEventListener("controllerchange", resolve, {
        once: true,
      });
      const activate = () => {
        if (r.waiting) {
          clearInterval(poll);
          r.waiting.postMessage("ACTIVATE_UPDATE");
        }
      };
      const poll = setInterval(activate, 50);
      activate();
    });
  });
  await page.reload();
  await page.waitForFunction(() => !!window.v2Test);
  assert.equal(
    await page.evaluate(
      async () =>
        (await window.v2Test.readV2("v2WorkoutSessions", "session-fixture"))
          .revision,
    ),
    3,
  );
  pass(
    "production service-worker activation protocol preserves V2 drafts and V1 history",
  );
  const backup = await page.evaluate(() => window.v2Test.exportAll());
  assert.equal(backup.schemaVersion, 3);
  assert.equal(backup.sessions[0].id, "legacy-browser");
  assert.equal(backup.v2WorkoutSessions.length, 2);
  pass("browser backup includes legacy and V2 stores");
  const stale = await context.newPage();
  await ready(stale);
  await page.evaluate(() => window.v2Test.getDb());
  await stale.evaluate(async () => {
    const req = indexedDB.open("achilles-return-db", 4);
    const db = await new Promise((r, j) => {
      req.onsuccess = () => r(req.result);
      req.onerror = () => j(req.error);
    });
    db.close();
  });
  assert.equal(
    await page.evaluate(async () => {
      try {
        await window.v2Test.getDb();
        return "unexpected";
      } catch (e) {
        return e.name;
      }
    }),
    "VersionError",
  );
  pass(
    "versionchange closes live connection; older bundle cannot reopen a newer schema",
  );
  await stale.close();
  assert.deepEqual(errors, []);
  pass("no uncaught browser runtime errors");
} finally {
  await context.close();
  await browser.close();
  await new Promise((r) => server.close(r));
}
