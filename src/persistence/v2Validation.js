// Runtime validation of persisted V2 aggregates. No clinical policy or coercion.
export const V2_STORES = [
  "v2ExerciseDefinitions",
  "v2WorkoutTemplates",
  "v2PlannedWorkouts",
  "v2WorkoutSessions",
  "v2Observations",
  "v2GuidanceEvents",
  "v2GuidanceDecisions",
];
const fail = (message) => {
  throw new Error(`Invalid V2 record: ${message}`);
};
const object = (x, label = "object") => {
  if (
    !x ||
    typeof x !== "object" ||
    Array.isArray(x) ||
    Object.getPrototypeOf(x) !== Object.prototype
  )
    fail(label);
};
const text = (x) => {
  if (typeof x !== "string") fail("string");
};
const id = (x) => {
  text(x);
  if (!x.trim()) fail("empty identity");
};
const list = (x, fn) => {
  if (!Array.isArray(x)) fail("array");
  x.forEach(fn);
};
const number = (x) => {
  if (typeof x !== "number" || !Number.isFinite(x) || x < 0)
    fail("nonnegative finite number");
};
const integer = (x) => {
  number(x);
  if (!Number.isSafeInteger(x)) fail("integer");
};
const oneOf = (x, options) => {
  if (!options.includes(x)) fail(`enum ${String(x)}`);
};
export function date(x) {
  text(x);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(x) ||
    new Date(x + "T12:00:00Z").toISOString().slice(0, 10) !== x
  )
    fail("date");
}
const stamp = (x) => {
  text(x);
  if (!Number.isFinite(Date.parse(x))) fail("timestamp");
};
export function tagged(x, validate = () => {}) {
  object(x, "tagged value");
  oneOf(x.state, ["known", "blank", "unknown", "not-applicable"]);
  if (x.state === "known") {
    if (!Object.hasOwn(x, "value")) fail("missing known value");
    validate(x.value);
  } else if (Object.hasOwn(x, "value")) fail("unknown state carrying a value");
  if (x.reason !== undefined) text(x.reason);
}
// Portable structured records; unknown fields retained, unsupported values rejected.
function portable(x, seen = new Set()) {
  if (
    x === null ||
    x === undefined ||
    typeof x === "string" ||
    typeof x === "boolean"
  )
    return;
  if (typeof x === "number") {
    if (!Number.isFinite(x)) fail("nonfinite value");
    return;
  }
  if (typeof x !== "object" || seen.has(x)) fail("nonportable or cyclic data");
  seen.add(x);
  if (Array.isArray(x)) x.forEach((v) => portable(v, seen));
  else {
    object(x);
    for (const [k, v] of Object.entries(x)) {
      if (["__proto__", "prototype", "constructor"].includes(k))
        fail("unsafe key");
      portable(v, seen);
    }
  }
  seen.delete(x);
}
export function metrics(x, intent = false) {
  object(x, "metrics");
  const quantities = [
    "reps",
    "load",
    "duration",
    "distance",
    "rest",
    "rpe",
    "steps",
    "contacts",
  ];
  const tags = [
    "loadConvention",
    "loadConventionNote",
    "tempo",
    "side",
    "notes",
    "symptoms",
    "quality",
  ];
  for (const key of Object.keys(x)) {
    if (!quantities.includes(key) && !tags.includes(key))
      fail(`unsupported metric ${key}`);
    if (quantities.includes(key)) {
      object(x[key]);
      tagged(x[key].amount, number);
      tagged(x[key].unit, id);
    } else
      tagged(x[key], key === "symptoms" || key === "quality" ? () => {} : text);
  }
  if (x.side) tagged(x.side, (v) => oneOf(v, ["bilateral", "left", "right"]));
  if (x.loadConvention)
    tagged(x.loadConvention, (v) =>
      oneOf(v, [
        "per-hand",
        "total-external",
        "bar-included",
        "stack-reading",
        "assistance",
        "bodyweight",
        "device-specific",
        "other",
      ]),
    );
  if (x.rpe?.amount.state === "known" && x.rpe.amount.value > 10)
    fail("RPE range");
  if (intent && ("symptoms" in x || "quality" in x))
    fail("observation in intent");
}
function provenance(x) {
  object(x);
  oneOf(x.origin, ["researched", "custom", "legacy", "unknown"]);
  tagged(x.verification, text);
  list(x.sourceIds, id);
}
export function definition(x) {
  object(x);
  noHistory(x);
  id(x.id);
  tagged(x.name, text);
  for (const k of [
    "aliases",
    "categories",
    "bodyRegions",
    "movementPatterns",
    "physicalQualities",
    "phaseAssociations",
    "equipment",
  ])
    list(x[k], text);
  for (const k of ["achillesPurpose", "setup", "laterality"])
    tagged(x[k], text);
  tagged(x.demandLevel);
  tagged(x.trackingType, (v) =>
    oneOf(v, [
      "weighted-reps",
      "reps",
      "time",
      "distance-time",
      "reps-time",
      "intervals",
      "free-form",
    ]),
  );
  list(x.supportedMetrics, (v) =>
    oneOf(v, [
      "reps",
      "load",
      "duration",
      "distance",
      "rest",
      "rpe",
      "steps",
      "contacts",
    ]),
  );
  list(x.evidence, (e) => {
    object(e);
    if (e.id !== undefined) id(e.id);
    if (e.url !== undefined) text(e.url);
  });
  list(x.media, (m) => {
    object(m);
    oneOf(m.kind, ["demo", "illustration", "related-demo"]);
    tagged(m.verification, text);
    if (m.url !== undefined) text(m.url);
  });
  provenance(x.provenance);
  object(x.sourceMetadata);
  if ("exerciseLog" in x || "actual" in x || "responses" in x)
    fail("actual data in definition");
}
const dispositions = ["planned", "completed", "partial", "skipped", "unknown"];
function unique(items, label) {
  const ids = items.map((x) => x.id);
  if (new Set(ids).size !== ids.length) fail(`duplicate ${label} IDs`);
}
function noHistory(x) {
  for (const k of [
    "actual",
    "disposition",
    "legacy",
    "symptoms",
    "responses",
    "interpretations",
    "guidanceDecisions",
    "overrides",
    "correctionLineage",
    "completion",
    "complete",
  ])
    if (k in x) fail(`historical ${k} in intent`);
}
function occurrences(xs, intent) {
  list(xs, (o) => {
    object(o);
    id(o.id);
    id(o.exerciseDefinitionId);
    integer(o.order);
    definition(o.definitionSnapshot);
    if (o.exerciseDefinitionId !== o.definitionSnapshot.id)
      fail("definition identity mismatch");
    tagged(o.block, text);
    metrics(o.target, true);
    tagged(o.targetDescription, text);
    tagged(o.targetSetCount, integer);
    if (o.targetTrackingType !== undefined)
      oneOf(o.targetTrackingType, [
        "",
        "weighted-reps",
        "reps",
        "time",
        "distance-time",
        "reps-time",
        "intervals",
        "free-form",
      ]);
    if (intent) noHistory(o);
    else {
      oneOf(o.disposition, dispositions);
      oneOf(o.snapshotOrigin, ["captured", "current-reference", "unknown"]);
      tagged(o.notes, text);
      if (o.aggregateActual) metrics(o.aggregateActual);
    }
    list(o.sets, (s) => {
      object(s);
      id(s.id);
      integer(s.order);
      tagged(s.type, (v) => oneOf(v, ["warm-up", "working", "rehab"]));
      metrics(s.target, true);
      if (s.repeatCount !== undefined) {
        integer(s.repeatCount);
        if (s.repeatCount < 1) fail("interval repeat count");
      }
      if (intent) noHistory(s);
      else {
        metrics(s.actual);
        oneOf(s.disposition, dispositions);
      }
      list(s.intervals, (b) => {
        object(b);
        id(b.id);
        integer(b.order);
        oneOf(b.kind, ["work", "recovery"]);
        metrics(b.target, true);
        if (intent) noHistory(b);
        else {
          metrics(b.actual);
          oneOf(b.disposition, dispositions);
        }
      });
      unique(s.intervals, "bout");
      if (s.feedbackProvenance) {
        object(s.feedbackProvenance);
        list(s.feedbackProvenance.inheritedFields, text);
        tagged(s.feedbackProvenance.confirmed, (v) => {
          if (typeof v !== "boolean") fail("confirmation");
        });
      }
    });
    unique(o.sets, "set");
  });
  unique(xs, "occurrence");
  unique(
    xs.flatMap((o) => o.sets),
    "session set",
  );
}
export function template(x) {
  object(x);
  id(x.id);
  integer(x.revision);
  text(x.name);
  list(x.categories, text);
  oneOf(x.source, ["curated", "user"]);
  noHistory(x);
  occurrences(x.occurrences, true);
  if (x.notes !== undefined) text(x.notes);
  if (x.archived !== undefined && typeof x.archived !== "boolean")
    fail("archive flag");
  if (x.groups !== undefined) {
    list(x.groups, (g) => {
      object(g);
      id(g.id);
      text(g.name);
      oneOf(g.kind, ["superset", "circuit"]);
      integer(g.rounds);
      if (g.rounds < 1) fail("group rounds");
    });
    unique(x.groups, "group");
  }
  for (const o of x.occurrences)
    if (
      o.groupId !== undefined &&
      !(x.groups || []).some((g) => g.id === o.groupId)
    )
      fail("unknown group");
}
export function validateV2(store, x) {
  if (!V2_STORES.includes(store)) fail("unknown store");
  portable(x);
  object(x);
  id(x.id);
  if (x.recordVersion !== 1) fail("record version");
  integer(x.revision);
  if (x.revision < 1) fail("revision");
  switch (store) {
    case "v2ExerciseDefinitions":
      definition(x);
      if (x.provenance.origin !== "custom")
        fail("only custom definitions may be stored");
      if (typeof x.archived !== "boolean") fail("archive flag");
      break;
    case "v2WorkoutTemplates":
      template(x);
      break;
    case "v2PlannedWorkouts":
      noHistory(x);
      date(x.date);
      template(x.snapshot);
      oneOf(x.status, ["planned", "skipped", "replaced"]);
      if (x.planning !== undefined) {
        object(x.planning); if(x.planning.version !== 1 || typeof x.planning.archived !== 'boolean') fail('planning metadata'); list(x.planning.audit,object);
        if(x.planning.recurrence) { const r=x.planning.recurrence; object(r); id(r.seriesId);date(r.start);date(r.end);list(r.weekdays,v=>oneOf(v,[0,1,2,3,4,5,6])); if(r.start>r.end||!r.weekdays.length)fail('weekly recurrence');text(r.name); }
      }
      if (x.composition !== undefined) {
        object(x.composition);
        if (
          x.composition.version !== 1 ||
          typeof x.composition.archived !== "boolean"
        )
          fail("composition draft");
      }
      if (x.templateRef) {
        id(x.templateRef.id);
        integer(x.templateRef.revision);
      }
      break;
    case "v2WorkoutSessions":
      if (x.schemaVersion !== 2) fail("domain schema");
      tagged(x.date, date);
      tagged(x.name, text);
      tagged(x.startedAt, stamp);
      tagged(x.finishedAt, stamp);
      oneOf(x.lifecycle, [
        "draft",
        "in-progress",
        "completed",
        "partial",
        "abandoned",
        "unknown",
      ]);
      list(x.categories, text);
      occurrences(x.occurrences, false);
      tagged(x.originalIntent);
      object(x.interpretations);
      list(x.symptoms, (s) => {
        object(s);
        id(s.id);
        if (s.sessionId !== undefined) id(s.sessionId);
        tagged(s.recordedAt, stamp);
        oneOf(s.timing, ["before", "during", "after", "next-day", "unknown"]);
        object(s.observations);
        provenance(s.provenance);
      });
      list(x.responses, (r) => {
        object(r);
        id(r.id);
        id(r.sessionId);
        tagged(r.observations);
        tagged(r.interpretation, text);
      });
      list(x.exposures, (e) => {
        object(e);
        id(e.id);
        if (e.sessionId !== undefined) id(e.sessionId);
        tagged(e.domain, text);
        metrics(e.actual);
        object(e.observations);
        object(e.interpretation);
        tagged(e.storedQuality);
        tagged(e.reportedQuality);
        provenance(e.provenance);
      });
      list(x.correctionLineage, () => {}); // Legacy payloads remain opaque.
      x.correctionLineage.forEach((entry,index)=>{
        if(entry.version===2 && Object.hasOwn(entry,'previousLineageCount')) {
          if(entry.previousLineageCount!==index || !entry.previous || entry.previous.revision!==entry.previousRevision || Object.hasOwn(entry.previous,'correctionLineage')) throw Error('Invalid correction lineage reference');
        }
      });
      list(x.guidanceDecisions, (d) => {
        object(d);
        id(d.id);
        id(d.guidanceId);
        integer(d.subjectRevision);
        stamp(d.at);
        oneOf(d.action, ["accepted", "declined", "deferred", "acknowledged"]);
      });
      list(x.overrides, (o) => {
        object(o);
        id(o.id);
        id(o.guidanceId);
        id(o.subjectId);
        integer(o.subjectRevision);
        stamp(o.at);
        if (o.reason !== undefined) text(o.reason);
      });
      if (x.execution) {
        const e = x.execution;
        object(e);
        if (e.version !== 1) fail("execution version");
        stamp(x.createdAt);
        text(e.notes);
        list(e.audit, (a) => {
          object(a);
          id(a.id);
          id(a.type);
          stamp(a.at);
        });
        list(e.groups, (g) => {
          id(g.id);
          text(g.name);
          oneOf(g.kind, ["superset", "circuit"]);
          integer(g.rounds);
          if (g.rounds < 1) fail("rounds");
        });
        unique(e.groups, "execution group");
        tagged(x.originalIntent, template);
        if (x.originalIntent.state !== "known")
          fail("execution original intent required");
        unique(
          x.occurrences.flatMap((o) => o.sets.flatMap((s) => s.intervals)),
          "session bout",
        );
        if (e.restTimer !== null) {
          object(e.restTimer);
          if (e.restTimer.sessionId !== x.id) fail("timer identity");
          id(e.restTimer.setId);
          stamp(e.restTimer.startedAt);
          stamp(e.restTimer.endsAt);
          if (
            !x.occurrences.some((o) =>
              o.sets.some((s) => s.id === e.restTimer.setId),
            )
          )
            fail("timer set");
        }
        for (const o of x.occurrences) {
          if (o.groupId && !e.groups.some((g) => g.id === o.groupId))
            fail("execution group reference");
          if (typeof o.addedDuringSession !== "boolean")
            fail("added-work flag");
          id(o.sourceOccurrenceId);
          for (const k of ["replacesOccurrenceId", "replacedByOccurrenceId"])
            if (
              o[k] !== undefined &&
              !x.occurrences.some(
                (other) => other.id === o[k] && other.id !== o.id,
              )
            )
              fail("replacement reference");
          for (const s of o.sets) {
            id(s.sourceSetId);
            if (s.groupRound !== undefined) {
              integer(s.groupRound);
              if (s.groupRound < 1) fail("round");
            }
            if (s.actualType)
              tagged(s.actualType, (v) =>
                oneOf(v, ["warm-up", "working", "rehab"]),
              );
            for (const b of s.intervals) {
              integer(b.repeat);
              if (b.repeat < 1) fail("repeat");
              id(b.sourceBoutId);
            }
          }
        }
      }
      if (x.observationIds) list(x.observationIds, id);
      if (x.legacyOrigin) {
        object(x.legacyOrigin);
        if (x.legacyOrigin.store !== "sessions") fail("legacy origin store");
        id(x.legacyOrigin.id);
        integer(x.legacyOrigin.revision);
        if (x.legacyKey !== JSON.stringify(["sessions", x.legacyOrigin.id]))
          fail("legacy key");
        if (!x.legacy?.raw) fail("legacy raw");
      } else if (x.legacyKey !== undefined) fail("orphan legacy key");
      break;
    case "v2Observations":
      oneOf(x.kind, ["symptom", "response", "exposure", "benchmark"]);
      tagged(x.recordedAt, stamp);
      object(x.observations);
      object(x.interpretation);
      if (x.sessionId !== undefined) id(x.sessionId);
      if (x.activityDate !== undefined) date(x.activityDate);
      if (x.actual) metrics(x.actual);
      break;
    case "v2GuidanceEvents":
      if (x.adapterVersion !== undefined) {
        id(x.adapterVersion);
        stamp(x.at);
        text(x.finding);
        id(x.dedupKey);
        text(x.contextKey);
        if (x.occurrenceId !== undefined) id(x.occurrenceId);
        if (x.proposal) {
          oneOf(x.proposal.kind, ["review", "replace", "edit-target"]);
          if (x.proposal.kind === "replace") id(x.proposal.definitionId);
          if (x.proposal.kind === "edit-target")
            oneOf(x.proposal.metric, ["load"]);
        }
        if (
          x.inputs?.subject?.id !== x.subjectId ||
          x.inputs?.subject?.revision !== x.subjectRevision
        )
          fail("guidance input revision");
      }
      id(x.subjectId);
      integer(x.subjectRevision);
      id(x.ruleId);
      id(x.ruleVersion);
      id(x.evidenceVersion);
      object(x.sourceVersions);
      Object.values(x.sourceVersions).forEach(text);
      object(x.inputs);
      list(x.inputIds, id);
      list(x.sourceIds, id);
      list(x.missingInputs, text);
      oneOf(x.level, [
        "INFORMATION",
        "RECOMMENDATION",
        "CAUTION",
        "STRONG_WARNING",
      ]);
      text(x.explanation);
      if (x.proposal) {
        object(x.proposal);
        text(x.proposal.description);
        id(x.proposal.targetId);
      }
      break;
    case "v2GuidanceDecisions":
      if (x.adapterVersion !== undefined) {
        id(x.adapterVersion);
        id(x.subjectId);
        if (
          x.action === "accepted" &&
          x.resultingRevision !== x.subjectRevision + 1
        )
          fail("applied guidance revision");
      }
      id(x.guidanceId);
      integer(x.subjectRevision);
      oneOf(x.action, [
        "accepted",
        "declined",
        "dismissed",
        "deferred",
        "acknowledged",
        "continued-anyway",
      ]);
      stamp(x.at);
      if ("clearance" in x || "medicalClearance" in x)
        fail("acknowledgment is not clearance");
      break;
  }
  return x;
}
/** Order-insensitive object equality, retaining undefined versus absent. */
export function equal(a, b) {
  if (Object.is(a, b)) return true;
  if (
    !a ||
    !b ||
    typeof a !== "object" ||
    typeof b !== "object" ||
    Array.isArray(a) !== Array.isArray(b)
  )
    return false;
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((k) => Object.hasOwn(b, k) && equal(a[k], b[k]))
  );
}
