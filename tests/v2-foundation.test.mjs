import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  adaptDefinition,
  adaptSession,
  adaptMovement,
  adaptRecovery,
  adaptEquipment,
  adaptExposure,
  copyIntent,
  derivedId,
  quantity,
  value,
  recoverLegacy,
} from "../src/domain/v2/adapters.ts";
import {
  planFromTemplate,
  sessionFromPlan,
} from "../src/domain/v2/snapshots.ts";
import { legacy, native } from "./fixtures/v2/records.mjs";
import {
  guidance,
  decision,
  override,
  phase,
  equipment,
} from "./fixtures/v2/native.ts";
import { CATALOG } from "../src/data/catalog.js";
import { EXERCISE_LIBRARY } from "../src/data/exerciseLibrary.js";
import { EQUIPMENT_REFERENCE_EXERCISES } from "../src/data/equipmentContext.js";

const known = (v) => ({ state: "known", value: v });
for (const [name, input] of Object.entries(legacy))
  test(`V2 lossless raw envelope and input purity: ${name}`, () => {
    const before = structuredClone(input);
    const adapter =
      name === "recovery"
        ? adaptRecovery
        : ["movement", "routine"].includes(name)
          ? adaptMovement
          : adaptSession;
    const result = adapter(input);
    assert.deepEqual(result.legacy.raw, input);
    assert.deepEqual(input, before);
    assert.deepEqual(adapter(input), result);
    result.legacy.raw.date = "changed-output";
    assert.deepEqual(input, before);
  });
test("V2 original source, research, assets, docs and existing tests remain byte-identical", async () => {
  const manifest = JSON.parse(
    await readFile(
      new URL("./fixtures/v2/v1-preservation-manifest.json", import.meta.url),
      "utf8",
    ),
  );
  const approvedDelta=JSON.parse(await readFile(new URL('./fixtures/v2/phase2-approved-deltas.json',import.meta.url),'utf8'));
  const phase3Delta=JSON.parse(await readFile(new URL('./fixtures/v2/phase3-approved-deltas.json',import.meta.url),'utf8'));
  const phase4Delta=JSON.parse(await readFile(new URL('./fixtures/v2/phase4-approved-deltas.json',import.meta.url),'utf8'));
  const phase5Delta=JSON.parse(await readFile(new URL('./fixtures/v2/phase5-approved-deltas.json',import.meta.url),'utf8'));
  const phase6Delta=JSON.parse(await readFile(new URL('./fixtures/v2/phase6-approved-deltas.json',import.meta.url),'utf8'));
  const finalDelta=JSON.parse(await readFile(new URL('./fixtures/v2/final-approved-deltas.json',import.meta.url),'utf8'));
  for (const [path, hash] of Object.entries({...manifest,...approvedDelta,...phase3Delta,...phase4Delta,...phase5Delta,...phase6Delta,...finalDelta}))
    assert.equal(
      createHash("sha256")
        .update(await readFile(new URL("../" + path, import.meta.url)))
        .digest("hex"),
      hash,
      path,
    );
  assert.ok(Object.keys(manifest).length >= 596);
});
test("V2 every catalog/library/reference definition preserves canonical ID and complete metadata", () => {
  for (const original of [
    ...Object.values(CATALOG),
    ...EXERCISE_LIBRARY,
    ...EQUIPMENT_REFERENCE_EXERCISES,
  ]) {
    const before = structuredClone(original),
      converted = adaptDefinition(original);
    assert.equal(converted.id, original.id);
    assert.deepEqual(converted.provenance.raw, original);
    assert.deepEqual(converted.sourceMetadata, original);
    assert.deepEqual(original, before);
  }
});
test("V2 evidence and demo curation provenance are not upgraded or dropped", () => {
  const raw = {
    id: "test",
    evidenceSourceIds: ["a"],
    evidenceStrength: "limited",
    evidenceType: "indirect",
    limitations: ["not postoperative"],
    videoUrl: "https://example.invalid",
    videoVerification: "Page only",
    demoVerification: { status: "page-only" },
    previousSourceReview: { verifiedAt: "older" },
  };
  const result = adaptDefinition(raw);
  assert.deepEqual(result.provenance.sourceIds, ["a"]);
  assert.equal(result.media[0].verification.value, "Page only");
  assert.deepEqual(
    result.media[0].raw.previousSourceReview,
    raw.previousSourceReview,
  );
  assert.deepEqual(result.evidence[0].raw.limitations, raw.limitations);
});
test("V2 illustration manifest mappings remain exact and independent of clinical availability", async () => {
  const manifest = JSON.parse(
    await readFile(
      new URL(
        "../public/assets/exercises/manifests/exercise-illustrations.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  for (const row of manifest) {
    const ex = adaptDefinition({ id: row.exerciseId }, row);
    assert.deepEqual(ex.media[0].raw, row);
    assert.equal(ex.media[0].exerciseId, row.exerciseId);
  }
});
test("V2 stable IDs are independent of actual values and revisions", () => {
  const first = adaptSession(legacy.normal),
    edit = structuredClone(legacy.normal);
  edit.exerciseLog.press.sets[0].load = "19";
  edit.revision = 5;
  const after = adaptSession(edit);
  assert.equal(first.occurrences[0].id, after.occurrences[0].id);
  assert.equal(
    first.occurrences[0].sets[0].id,
    after.occurrences[0].sets[0].id,
  );
  assert.notEqual(derivedId("a:b", "c"), derivedId("a", "b:c"));
});
test("V2 repeated definitions have independent occurrence and set identities", () => {
  const [a, b] = native.repeated.occurrences;
  assert.equal(a.exerciseDefinitionId, b.exerciseDefinitionId);
  assert.notEqual(a.id, b.id);
  assert.notEqual(a.sets[0].id, b.sets[0].id);
  const result = structuredClone(native.repeated);
  result.occurrences[0].sets[0].actual.reps.amount.value = 999;
  assert.equal(result.occurrences[1].sets[0].actual.reps.amount.value, 6);
});
test("V2 ambiguous duplicate V1 log is not duplicated as actual training", () => {
  const result = adaptSession(legacy.repeated);
  assert.equal(result.occurrences.length, 1);
  assert.equal(result.occurrences[0].sets.length, 1);
  assert.match(
    result.legacy.limitations.join(" "),
    /attribution is unknowable/,
  );
  assert.equal(result.legacy.raw.plannedItems.length, 2);
});
test("V2 repeated rehab IDs and illustration alias are not silently canonicalized", () => {
  const result = adaptSession(legacy.repeatedRehab);
  assert.deepEqual(
    result.occurrences.map((o) => o.exerciseDefinitionId),
    ["rehab-toe-walk", "rehab-toe-walk-c"],
  );
  assert.equal(
    result.occurrences[1].definitionSnapshot.sourceMetadata.illustrationId,
    "rehab-toe-walk",
  );
});
test("V2 zero, blank, unknown, not applicable and malformed numeric input remain distinct", () => {
  assert.deepEqual(quantity("0", "lb").amount, known(0));
  assert.equal(quantity("", "lb").amount.state, "blank");
  assert.equal(quantity(null, "lb").amount.state, "unknown");
  assert.equal(quantity("abc", "lb").amount.state, "unknown");
  assert.equal(quantity(false).amount.state, "unknown");
  assert.equal(
    native.tempo.occurrences[0].sets[0].actual.duration.amount.state,
    "not-applicable",
  );
  assert.deepEqual(value(false), known(false));
});
test("V2 converts time and distance only from captured units, never from current lookup", () => {
  const t = adaptSession(legacy.timed).occurrences[0].sets[0].actual;
  assert.equal(t.duration.unit.value, "s");
  assert.equal(t.duration.amount.value, 30);
  assert.equal(t.reps, undefined);
  const d = adaptSession(legacy.distance).occurrences[0].sets[0].actual;
  assert.equal(d.distance.unit.value, "yd");
  assert.equal(d.distance.amount.value, 20);
  assert.equal(d.reps, undefined);
  const missing = adaptSession(legacy.missingSnapshot, {
    press: { id: "press", unit: "seconds" },
  });
  assert.equal(missing.occurrences[0].sets[0].actual.duration, undefined);
  assert.equal(missing.occurrences[0].snapshotOrigin, "current-reference");
});
test("V2 source load units do not imply an invented machine/load convention", () => {
  const actual = adaptSession(legacy.normal).occurrences[0].sets[0].actual;
  assert.equal(actual.load.unit.value, "lb");
  assert.equal(actual.loadConvention.state, "unknown");
  assert.equal(
    native.tempo.occurrences[0].sets[0].actual.loadConvention.value,
    "per-hand",
  );
});
test("V2 side, tempo and warm-up/working/rehab set type contracts remain explicit", () => {
  const [left, right] = native.leftRight.occurrences;
  assert.equal(left.sets[0].actual.side.value, "left");
  assert.equal(right.sets[0].actual.side.value, "right");
  assert.deepEqual(
    left.sets.map((s) => s.type.value),
    ["warm-up", "working"],
  );
  assert.equal(left.sets[0].actual.tempo.value, "3-1-1-0");
  assert.equal(
    adaptSession(legacy.rehab).occurrences[0].sets[0].type.state,
    "unknown",
  );
});
test("V2 intervals retain order, work/recovery and separate target/actual duration", () => {
  const bouts = native.interval.occurrences[0].sets[0].intervals;
  assert.deepEqual(
    bouts.map((b) => b.kind),
    ["work", "recovery", "work"],
  );
  assert.equal(new Set(bouts.map((b) => b.id)).size, 3);
  assert.equal(bouts[0].target.duration.amount.value, 30);
  assert.equal(bouts[0].actual.duration.amount.value, 25);
});
test("V2 supports distance and time simultaneously without using reps", () => {
  const actual = native.distanceTime.occurrences[0].sets[0].actual;
  assert.equal(actual.distance.unit.value, "km");
  assert.equal(actual.duration.unit.value, "s");
  assert.equal(actual.reps, undefined);
});
test("V2 target and actual values are independent; ranges remain target text", () => {
  const result = adaptSession(legacy.normal),
    o = result.occurrences[0];
  assert.equal(o.targetDescription.value, "8–12");
  assert.equal(o.sets[0].actual.reps.amount.value, 8);
  assert.equal(o.sets[0].target.reps, undefined);
  assert.equal(native.tempo.occurrences[0].sets[0].target.reps.amount.value, 8);
  assert.equal(native.tempo.occurrences[0].sets[0].actual.reps.amount.value, 6);
});
test("V2 correction lineage and pending delayed response survive without tolerance inference", () => {
  const c = adaptSession(legacy.corrected);
  assert.deepEqual(c.correctionLineage, legacy.corrected.correctionHistory);
  assert.equal(c.revision, 2);
  const p = adaptSession(legacy.pending);
  assert.equal(p.responses[0].observations.state, "unknown");
  assert.equal(
    p.responses[0].interpretation.value,
    "PENDING_NEXT_DAY_RESPONSE",
  );
  assert.notEqual(p.lifecycle, "draft");
});
test("V2 swap preserves actual sets with original identity and never transfers loads", () => {
  const [old, replacement] = adaptSession(legacy.swapped).occurrences;
  assert.equal(old.exerciseDefinitionId, "press");
  assert.equal(old.sets[0].actual.load.amount.value, 5);
  assert.equal(replacement.sets[0].actual.load.amount.value, 12);
  assert.equal(old.disposition, "skipped");
});
test("V2 partial/skipped/abandoned lifecycle does not fabricate completion", () => {
  assert.equal(native.partial.lifecycle, "partial");
  assert.equal(native.skipped.occurrences[0].disposition, "skipped");
  assert.equal(native.abandoned.lifecycle, "abandoned");
  assert.equal(native.abandoned.occurrences.length, 0);
  assert.equal(adaptSession(legacy.normal).lifecycle, "partial");
});
test("V2 wagon and equipment contexts never become a training sled", () => {
  const o = adaptSession(legacy.wagon).occurrences[0];
  assert.equal(o.exerciseDefinitionId, "weighted-wagon-backward-drag");
  assert.deepEqual(o.definitionSnapshot.equipment, ["weighted-wagon"]);
  assert.equal(
    o.sets[0].actual.loadConventionNote.value,
    "Cargo added to utility wagon",
  );
  const ctx = adaptEquipment(
    { equipment: ["weighted-wagon"], preferredEquipment: ["dumbbells"] },
    { availableEquipment: ["training-sled"] },
  );
  assert.deepEqual(ctx.owned, equipment.owned);
  assert.deepEqual(ctx.availableToday, equipment.availableToday);
  assert.deepEqual(ctx.preferred, equipment.preferred);
});
test("V2 original observations stay separate from derived exposure concerns", () => {
  const e = adaptExposure(legacy.exposure);
  assert.equal(e.actual.duration.amount.value, 10);
  assert.equal(e.interpretation.progressionEligible, false);
  assert.equal(e.storedQuality.value, "reduced");
  assert.equal(e.reportedQuality.state, "unknown");
  assert.deepEqual(e.provenance.raw, legacy.exposure);
});
test("V2 movement quantities and routine aggregates do not fabricate individual sets", () => {
  const m = adaptMovement(legacy.movement);
  assert.equal(m.exposures[0].actual.distance.amount.value, 0);
  assert.equal(m.symptoms[0].observations.painDuring, 0);
  assert.deepEqual(m.correctionLineage, legacy.movement.history);
  const r = adaptMovement(legacy.routine);
  assert.equal(r.occurrences[0].aggregateActual.duration.amount.value, 20);
  assert.deepEqual(r.occurrences[0].sets, []);
});
test("V2 copying completed sessions carries only structure/targets, not actuals or decisions", () => {
  const source = structuredClone(native.interval);
  source.guidanceDecisions = [decision];
  source.overrides = [override];
  source.symptoms = [{ id: "synthetic-symptom" }];
  const t = copyIntent(source, "template-copy", "Copy");
  assert.equal(t.occurrences.length, 2);
  assert.equal(t.occurrences[0].sets[0].actual, undefined);
  assert.equal(t.occurrences[0].sets[0].disposition, undefined);
  assert.equal(t.occurrences[0].sets[0].intervals[0].actual, undefined);
  for (const key of [
    "legacy",
    "symptoms",
    "responses",
    "interpretations",
    "guidanceDecisions",
    "overrides",
    "correctionLineage",
  ])
    assert.equal(t[key], undefined);
});
test("V2 template, plan, session and definition snapshots are independent", () => {
  const t = copyIntent(native.tempo, "template", "Template"),
    p = planFromTemplate(t, "plan", "2026-09-02"),
    s = sessionFromPlan(p, "new-session", "2026-09-02T10:00:00Z");
  t.occurrences[0].definitionSnapshot.name.value = "Changed template";
  p.snapshot.occurrences[0].sets[0].target.tempo.value = "Changed plan";
  assert.equal(
    s.occurrences[0].definitionSnapshot.name.value,
    "Synthetic calf movement",
  );
  assert.equal(s.occurrences[0].sets[0].target.tempo.value, "3-1-1-0");
  assert.deepEqual(s.occurrences[0].sets[0].actual, {});
  assert.equal(s.occurrences[0].sets[0].disposition, "planned");
  assert.deepEqual(s.responses, []);
});
test("V2 custom source and supplied demo cannot inherit researched verification", () => {
  const custom = adaptDefinition({
    id: "user-1",
    origin: "custom",
    videoUrl: "https://example.invalid/custom",
    videoVerification: "User says verified",
  });
  assert.equal(custom.provenance.origin, "custom");
  assert.equal(custom.media[0].verification.value, "unverified-user-supplied");
  assert.equal(custom.demandLevel.state, "unknown");
});
test("V2 benchmark not-tested and advisory decision are distinct from clearance", () => {
  assert.equal(phase.benchmarks[0].state, "not-tested");
  assert.equal(guidance.level, "CAUTION");
  assert.equal(decision.action, "declined");
  assert.equal(override.guidanceId, guidance.id);
  assert.equal(override.clearance, undefined);
});
test("V2 refuses missing identity rather than generating nondeterministic data", () => {
  assert.throws(() => adaptSession({}), /stable source ID/);
  assert.throws(() => adaptDefinition({}), /stable source ID/);
});

test("V2 exact legacy recovery retains unknown fields and does not share mutable references", () => {
  const a = adaptSession(legacy.unknown),
    recovered = recoverLegacy(a);
  assert.deepEqual(recovered, legacy.unknown);
  recovered.mystery.nested.push("new");
  assert.deepEqual(a.legacy.raw, legacy.unknown);
});
test("V2 custom tracking types and supported metrics remain explicit and unverified", () => {
  for (const trackingType of [
    "weighted-reps",
    "reps",
    "time",
    "distance-time",
    "reps-time",
    "intervals",
    "free-form",
  ]) {
    const d = adaptDefinition({
      id: "custom-" + trackingType,
      origin: "custom",
      trackingType,
      supportedMetrics: ["duration", "distance"],
    });
    assert.equal(d.trackingType.value, trackingType);
    assert.deepEqual(d.supportedMetrics, ["duration", "distance"]);
    assert.equal(d.provenance.verification.state, "unknown");
  }
  const researched = adaptDefinition({ id: "source", origin: "researched" });
  assert.equal(researched.provenance.origin, "researched");
});
test("V2 copy preserves unperformed target slots without copying completion or symptoms", () => {
  const s = adaptSession(legacy.timed),
    t = copyIntent(s, "copy", "Copy");
  assert.equal(t.occurrences[0].sets.length, 2);
  assert.equal(t.occurrences[0].sets[1].actual, undefined);
  assert.equal(t.occurrences[0].sets[0].target.symptoms, undefined);
});
test("V2 bilateral side and rehab set type remain distinct from definition identity", () => {
  const o = native.repeated.occurrences[1];
  assert.equal(o.sets[0].type.value, "rehab");
  assert.equal(o.sets[0].actual.side.value, "bilateral");
  assert.equal(
    o.exerciseDefinitionId,
    native.repeated.occurrences[0].exerciseDefinitionId,
  );
});
