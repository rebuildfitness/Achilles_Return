import test from "node:test";
import assert from "node:assert/strict";
import {
  EXERCISE_LIBRARY,
  filterLibrary,
} from "../src/data/exerciseLibrary.js";
import { CATALOG, EQUIPMENT } from "../src/data/catalog.js";

test("Press and row groups include upper-body lifts without misclassifying Pallof press", () => {
  const chest = filterLibrary({ muscle: "Chest", search: "press" });
  assert.equal(chest.length, 7);
  assert.ok(chest.every((ex) => !/Pallof/.test(ex.name)));
  assert.equal(
    filterLibrary({ muscle: "Shoulders", search: "press" }).length,
    5,
  );
  assert.equal(filterLibrary({ muscle: "Back", search: "row" }).length, 8);
  assert.equal(filterLibrary({ muscle: "Core", search: "Pallof" }).length, 1);
});

test("Library entries have unique IDs, owned equipment, demos and setup metadata", () => {
  assert.ok(EXERCISE_LIBRARY.length >= 90);
  assert.equal(
    new Set(EXERCISE_LIBRARY.map((e) => e.id)).size,
    EXERCISE_LIBRARY.length,
  );
  for (const ex of EXERCISE_LIBRARY) {
    if (ex.referenceOnly) {
      assert.equal(ex.automaticScheduling, false);
      assert.equal(ex.videoUrl, null);
      if (ex.guideUrl) assert.equal(new URL(ex.guideUrl).protocol, "https:");
    } else {
      assert.equal(new URL(ex.videoUrl).protocol, "https:");
      assert.ok(ex.videoSource);
    }
    assert.ok(ex.setup && ex.verification);
    assert.ok(
      ex.equipment.every((id) => EQUIPMENT.includes(id)),
      ex.name,
    );
  }
});
test("New reference exercises cannot silently enter the prescribed catalog", () => {
  const ids = new Set(Object.values(CATALOG).map((e) => e.id));
  for (const ex of EXERCISE_LIBRARY.filter((e) => e.libraryOnly))
    assert.ok(!ids.has(ex.id));
  for (const id of ids) assert.ok(EXERCISE_LIBRARY.some((e) => e.id === id));
});
test("Combined filters find the requested unilateral curl and distinguish ball equipment", () => {
  const found = filterLibrary({
    search: "seated unilateral hamstring",
    equipment: "cable-station",
    muscle: "Legs",
  });
  assert.equal(found.length, 1);
  assert.match(found[0].videoUrl, /LsP3CaDboRA/);
  assert.ok(found[0].equipment.includes("adjustable-bench"));
  assert.ok(
    filterLibrary({ equipment: "plyo-ball" }).every((e) =>
      /Stability-ball/.test(e.name),
    ),
  );
  assert.equal(filterLibrary({ search: "nonexistent movement" }).length, 0);
  assert.ok(
    filterLibrary({ equipment: "bodyweight" }).every(
      (e) => e.equipment.length === 0,
    ),
  );
});
