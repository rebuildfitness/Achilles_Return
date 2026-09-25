import test from "node:test";
import assert from "node:assert/strict";
import { BASELINE_DEMOS, BASELINE_SECTIONS } from "../src/data/baseline.js";
import {
  CATALOG,
  PROGRESSION_DOMAINS,
  validDemo,
} from "../src/data/catalog.js";
import { DRILL_DEMOS, exposureContent } from "../src/data/exposures.js";

test("Every physical baseline section reuses valid exercise-specific catalog demos", () => {
  for (const id of [
    "mobility",
    "bilateral",
    "heelrise",
    "soleus",
    "straight",
    "strength",
  ]) {
    assert.ok(BASELINE_SECTIONS.some((s) => s.id === id));
    assert.ok(BASELINE_DEMOS[id].length);
    for (const demo of BASELINE_DEMOS[id]) {
      assert.ok(Object.values(CATALOG).includes(demo));
      assert.ok(validDemo(demo));
    }
  }
  assert.equal(BASELINE_DEMOS.strength.length, 4);
});

test("Every progression level has valid demo metadata and resolved placeholders", () => {
  for (const domain of PROGRESSION_DOMAINS)
    for (const level of domain.levels) {
      const content = exposureContent(domain.id, level.id);
      assert.ok(content.demos.length, `${domain.id} ${level.id}`);
      assert.equal(content.missingDemos.length, 0, level.id);
      for (const demo of content.demos) assert.ok(validDemo(demo), demo.name);
    }
  for (const level of ["J5", "SC3", "SC4", "SC5", "SC6"])
    assert.equal(
      exposureContent(level === "J5" ? "jumping" : "soccer", level)
        .needsIndividualDose,
      true,
    );
});

test("A URL alone cannot bypass the exposure demo gate", () => {
  const demo = DRILL_DEMOS.SC2[0];
  const source = demo.videoSource;
  try {
    demo.videoSource = "";
    assert.deepEqual(exposureContent("soccer", "SC2").missingDemos, [
      demo.name,
    ]);
  } finally {
    demo.videoSource = source;
  }
});
