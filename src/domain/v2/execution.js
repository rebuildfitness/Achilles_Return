// Session-owned execution. No readiness, planner or clinical policy dependencies.
import {
  clone,
  uid,
  known,
  blank,
  occurrence,
  freshSet,
} from "./composition.js";
const unknown = () => ({ state: "unknown" });
export const terminal = (s) =>
  ["completed", "partial", "abandoned"].includes(s.lifecycle);
const reindex = (xs) =>
  xs.forEach((x, i) => {
    x.order = i;
  });
export const hasActual = (m) =>
  Object.values(m || {}).some(
    (v) =>
      v?.amount?.state === "known" || (v?.state === "known" && v.value !== ""),
  );
export const recordedSet = (s) =>
  s.disposition !== "planned" ||
  hasActual(s.actual) ||
  s.intervals.some((b) => b.disposition !== "planned" || hasActual(b.actual));
const workAmount = (m) =>
  ["reps", "duration", "distance", "steps", "contacts"].some(
    (k) => m?.[k]?.amount?.state === "known" && m[k].amount.value > 0,
  );
export const performedSet = (s) =>
  ["completed", "partial"].includes(s.disposition) ||
  workAmount(s.actual) ||
  s.intervals.some(
    (b) =>
      ["completed", "partial"].includes(b.disposition) || workAmount(b.actual),
  );
export const recordedOccurrence = (o) => o.sets.some(recordedSet);
function expandSet(source, round = undefined) {
  const s = {
    ...clone(source),
    id: uid(),
    sourceSetId: source.id,
    actual: {},
    disposition: "planned",
    intervals: [],
  };
  if (round !== undefined) s.groupRound = round;
  for (let repeat = 1; repeat <= (source.repeatCount || 1); repeat++)
    for (const b of source.intervals)
      s.intervals.push({
        ...clone(b),
        id: uid(),
        sourceBoutId: b.id,
        repeat,
        order: s.intervals.length,
        actual: {},
        disposition: "planned",
      });
  return s;
}
function expandOccurrence(source, groups = [], added = false) {
  const o = {
    ...clone(source),
    id: uid(),
    sourceOccurrenceId: source.id,
    snapshotOrigin: "captured",
    disposition: "planned",
    notes: blank(),
    addedDuringSession: added,
    sets: [],
  };
  const group = groups.find((g) => g.id === source.groupId);
  // One source set per pass. Repeat the last target only when fewer sets than
  // explicitly requested rounds; surplus sets remain additional sequential work.
  const count = group
    ? Math.max(group.rounds, source.sets.length)
    : source.sets.length;
  for (let i = 0; i < count; i++) {
    const target = source.sets[i] || source.sets.at(-1) || freshSet();
    o.sets.push(
      expandSet(target, group && i < group.rounds ? i + 1 : undefined),
    );
  }
  reindex(o.sets);
  return o;
}
export function startSession(
  plan,
  now = new Date().toISOString(),
  sessionId = uid(),
) {
  const date = new Date(now),
    day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return {
    recordVersion: 1,
    schemaVersion: 2,
    id: sessionId,
    revision: 1,
    date: known(day),
    name: known(plan.snapshot.name),
    startedAt: known(now),
    createdAt: now,
    finishedAt: unknown(),
    lifecycle: "in-progress",
    categories: clone(plan.snapshot.categories),
    planRef: plan.id,
    ...(plan.planning ? {sourcePlanMetadata: clone(plan.planning)} : {}),
    ...(plan.templateRef ? { templateRef: plan.templateRef.id } : {}),
    originalIntent: known(clone(plan.snapshot)),
    occurrences: plan.snapshot.occurrences.map((o, i) => ({
      ...expandOccurrence(o, plan.snapshot.groups || []),
      order: i,
    })),
    symptoms: [],
    responses: [],
    exposures: [],
    interpretations: {},
    correctionLineage: [],
    guidanceDecisions: [],
    overrides: [],
    execution: {
      version: 1,
      groups: clone(plan.snapshot.groups || []),
      normalization: "one-set-per-round-v1",
      notes: "",
      audit: [],
      restTimer: null,
    },
  };
}
function locate(s, c) {
  const o = s.occurrences.find((o) => o.id === c.id);
  if (!o) throw Error("Exercise occurrence not found");
  const set = c.setId ? o.sets.find((v) => v.id === c.setId) : null;
  if (c.setId && !set) throw Error("Set not found");
  const bout = c.boutId ? set?.intervals.find((v) => v.id === c.boutId) : null;
  if (c.boutId && !bout) throw Error("Bout not found");
  return { o, set, bout };
}
function skipSet(s) {
  // Existing actuals are never erased or marked as wholly skipped.
  for (const b of s.intervals)
    if (b.disposition === "planned" && !hasActual(b.actual))
      b.disposition = "skipped";
  s.disposition = performedSet(s) ? "partial" : "skipped";
}
function refreshDisposition(o) {
  if (o.sets.length && o.sets.every((s) => s.disposition === "completed"))
    o.disposition = "completed";
  else if (o.sets.length && o.sets.every((s) => s.disposition === "skipped"))
    o.disposition = "skipped";
  else o.disposition = o.sets.some(performedSet) ? "partial" : "planned";
}
function audit(s, type, details, at) {
  s.execution.audit.push({ id: uid(), type, at, ...clone(details) });
}
export function sessionCommand(source, c, now = new Date().toISOString()) {
  if (terminal(source))
    throw Error(
      "Finished history is read-only; a revisioned correction flow is required",
    );
  if (!source.execution) throw Error("Not an execution session");
  const s = clone(source);
  if (c.type === "notes") s.execution.notes = c.notes;
  else if (c.type === "rest-start") {
    const { set } = locate(s, c);
    if (!Number.isFinite(c.seconds) || c.seconds < 0)
      throw Error("Invalid rest duration");
    s.execution.restTimer = {
      sessionId: s.id,
      setId: set.id,
      startedAt: now,
      endsAt: new Date(Date.parse(now) + c.seconds * 1000).toISOString(),
    };
  } else if (c.type === "rest-dismiss") s.execution.restTimer = null;
  else if (c.type === "finish") {
    const summary = sessionSummary(s, now);
    if (c.lifecycle === "abandoned" && summary.performedSets)
      throw Error("Recorded work must be saved as partial, not abandoned");
    if (
      c.lifecycle === "completed" &&
      (!summary.completedSets || summary.unfinishedSets || summary.skippedSets)
    )
      throw Error("Unfinished or skipped work should be saved as partial");
    if (c.lifecycle === "partial" && !summary.performedSets)
      throw Error("No performed work; abandon this session instead");
    if (!["completed", "partial", "abandoned"].includes(c.lifecycle))
      throw Error("Invalid finish state");
    s.lifecycle = c.lifecycle;
    s.finishedAt = known(now);
    s.execution.restTimer = null;
    audit(s, "finish", { lifecycle: c.lifecycle }, now);
  } else if (c.type === "add") {
    s.occurrences.push(expandOccurrence(occurrence(c.definition), [], true));
    audit(s, "add-exercise", { occurrenceId: s.occurrences.at(-1).id }, now);
  } else if (c.type === "skip-round" || c.type === "stop-group") {
    const g = s.execution.groups.find((g) => g.id === c.groupId);
    if (!g) throw Error("Unknown group");
    for (const o of s.occurrences.filter((o) => o.groupId === g.id))
      for (const set of o.sets)
        if (
          set.groupRound &&
          (c.type === "stop-group" || set.groupRound === c.round) &&
          set.disposition !== "completed"
        )
          skipSet(set);
    audit(s, c.type, { groupId: c.groupId, round: c.round }, now);
  } else {
    const { o, set, bout } = locate(s, c);
    if (c.type === "actual") {
      const dest = bout || set;
      audit(
        s,
        "actual-edit",
        {
          occurrenceId: o.id,
          setId: set.id,
          ...(bout ? { boutId: bout.id } : {}),
          before: dest.actual,
          after: c.actual,
        },
        now,
      );
      dest.actual = clone(c.actual);
    } else if (c.type === "complete" || c.type === "skip") {
      const dest = bout || set;
      if (c.type === "skip") {
        if (bout)
          dest.disposition = hasActual(dest.actual) ? "partial" : "skipped";
        else skipSet(set);
      } else {
        if (!bout && set.intervals.some((b) => b.disposition !== "completed"))
          throw Error("Complete each interval bout, or stop intervals early");
        dest.disposition = "completed";
      }
      audit(
        s,
        c.type,
        {
          occurrenceId: o.id,
          setId: set.id,
          ...(bout ? { boutId: bout.id } : {}),
        },
        now,
      );
    } else if (c.type === "stop-intervals") {
      // Remaining planned bouts remain explicitly unperformed, not completed.
      set.disposition = performedSet(set) ? "partial" : "skipped";
      set.stoppedEarly = true;
      audit(s, c.type, { occurrenceId: o.id, setId: set.id }, now);
    } else if (c.type === "target") {
      if (recordedSet(set)) throw Error("Only upcoming targets can be edited");
      const p = c.patch;
      if (p.intervals || p.repeatCount !== undefined)
        throw Error(
          "Edit individual upcoming bout targets; add a new interval set for a new sequence",
        );
      for (const k of ["target", "type"])
        if (p[k] !== undefined) set[k] = clone(p[k]);
    } else if (c.type === "bout-target") {
      if (bout.disposition !== "planned" || hasActual(bout.actual))
        throw Error("Only upcoming bout targets can be edited");
      bout.target = clone(c.target);
    } else if (c.type === "actual-type") {
      audit(
        s,
        "actual-type",
        { setId: set.id, before: set.actualType, after: c.value },
        now,
      );
      set.actualType = clone(c.value);
    } else if (c.type === "exercise-notes") o.notes = known(c.notes);
    else if (c.type === "add-set") {
      const intervalSource = o.sets.find((s) => s.intervals.length);
      const intervalIntent = intervalSource
        ? {
            id: uid(),
            order: 0,
            type: clone(intervalSource.type),
            target: clone(intervalSource.target),
            repeatCount: intervalSource.repeatCount,
            intervals: intervalSource.intervals
              .filter((b) => b.repeat === 1)
              .map((b, order) => ({
                id: uid(),
                order,
                kind: b.kind,
                target: clone(b.target),
              })),
          }
        : null;
      const n = expandSet(c.intentSet || intervalIntent || freshSet());
      o.sets.push(n);
      audit(s, c.type, { occurrenceId: o.id, setId: n.id }, now);
    } else if (c.type === "remove-set") {
      if (recordedSet(set)) throw Error("Recorded sets cannot be removed");
      o.sets = o.sets.filter((v) => v.id !== set.id);
      audit(s, c.type, { occurrenceId: o.id, removed: set }, now);
    } else if (c.type === "skip-exercise") {
      o.sets.forEach((v) => {
        if (v.disposition !== "completed") skipSet(v);
      });
      audit(s, c.type, { occurrenceId: o.id }, now);
    } else if (c.type === "remove") {
      if (recordedOccurrence(o))
        throw Error("Recorded work cannot be removed; skip remaining work");
      s.occurrences = s.occurrences.filter((v) => v.id !== o.id);
      for (const other of s.occurrences)
        if (other.replacedByOccurrenceId === o.id)
          delete other.replacedByOccurrenceId;
      audit(s, c.type, { removed: o }, now);
    } else if (c.type === "duplicate") {
      const intent = {
        id: o.id,
        exerciseDefinitionId: o.exerciseDefinitionId,
        order: 0,
        block: clone(o.block),
        definitionSnapshot: clone(o.definitionSnapshot),
        target: clone(o.target),
        targetDescription: clone(o.targetDescription),
        targetSetCount: clone(o.targetSetCount),
        ...(o.targetTrackingType
          ? { targetTrackingType: o.targetTrackingType }
          : {}),
        sets: o.sets.map((v) => ({
          id: v.id,
          order: v.order,
          type: v.type,
          target: v.target,
          intervals: [],
          ...(v.intervals.length
            ? {
                intervals: v.intervals
                  .filter((b) => b.repeat === 1)
                  .map((b) => ({
                    id: b.id,
                    order: b.order,
                    kind: b.kind,
                    target: b.target,
                  })),
                repeatCount: v.repeatCount,
              }
            : {}),
        })),
      };
      delete intent.groupId;
      const n = expandOccurrence(intent, [], true);
      s.occurrences.push(n);
      audit(s, c.type, { sourceOccurrenceId: o.id, occurrenceId: n.id }, now);
    } else if (c.type === "replace") {
      const future = o.sets.filter((v) => !recordedSet(v));
      const n = expandOccurrence(occurrence(c.definition), [], true);
      if (o.groupId) n.groupId = o.groupId;
      // Different exercises do not inherit old loads. Preserve round placement only.
      n.sets = (future.length ? future : [null]).map((v, i) => ({
        ...expandSet(freshSet(), v?.groupRound),
        order: i,
      }));
      n.replacesOccurrenceId = o.id;
      o.replacedByOccurrenceId = n.id;
      for (const v of future) v.disposition = "skipped";
      const index = s.occurrences.indexOf(o);
      s.occurrences.splice(index + 1, 0, n);
      audit(
        s,
        "replace",
        {
          oldOccurrenceId: o.id,
          newOccurrenceId: n.id,
          retainedSetIds: o.sets.map((v) => v.id),
        },
        now,
      );
    } else if (c.type === "move") {
      if (recordedOccurrence(o))
        throw Error("Only unrecorded exercises can be reordered");
      const i = s.occurrences.indexOf(o),
        j = i + c.delta;
      if (j >= 0 && j < s.occurrences.length) {
        if (recordedOccurrence(s.occurrences[j]))
          throw Error("Cannot reorder across recorded work");
        [s.occurrences[i], s.occurrences[j]] = [
          s.occurrences[j],
          s.occurrences[i],
        ];
      }
    } else throw Error("Unknown session command");
    if (bout) {
      if (set.intervals.every((b) => b.disposition === "completed"))
        set.disposition = "completed";
      else if (
        set.intervals.some(
          (b) => b.disposition !== "planned" || hasActual(b.actual),
        )
      )
        set.disposition = "partial";
    }
  }
  if (
    s.execution.restTimer &&
    !s.occurrences.some((o) =>
      o.sets.some((set) => set.id === s.execution.restTimer.setId),
    )
  )
    s.execution.restTimer = null;
  reindex(s.occurrences);
  s.occurrences.forEach((o) => {
    reindex(o.sets);
    refreshDisposition(o);
  });
  return s;
}
export function sessionSummary(s, now = new Date().toISOString()) {
  const sets = s.occurrences.flatMap((o) => o.sets);
  return {
    completedExercises: s.occurrences.filter(
      (o) => o.disposition === "completed",
    ).length,
    skippedExercises: s.occurrences.filter((o) => o.disposition === "skipped")
      .length,
    addedExercises: s.occurrences.filter((o) => o.addedDuringSession).length,
    completedSets: sets.filter((v) => v.disposition === "completed").length,
    performedSets: sets.filter(performedSet).length,
    skippedSets: sets.filter((v) => v.disposition === "skipped").length,
    unfinishedSets: sets.filter(
      (v) => !["completed", "skipped"].includes(v.disposition),
    ).length,
    completedBouts: sets
      .flatMap((v) => v.intervals)
      .filter((b) => b.disposition === "completed").length,
    elapsedSeconds: elapsedSeconds(s, now),
  };
}
export function elapsedSeconds(s, now = new Date().toISOString()) {
  return Math.max(
    0,
    Math.floor(
      (Date.parse(s.finishedAt.state === "known" ? s.finishedAt.value : now) -
        Date.parse(s.startedAt.value)) /
        1000,
    ),
  );
}
export function restSeconds(s, now = new Date().toISOString()) {
  const r = s.execution.restTimer;
  return r?.sessionId === s.id
    ? Math.max(0, Math.ceil((Date.parse(r.endsAt) - Date.parse(now)) / 1000))
    : 0;
}
export function executionOrder(s, groupId) {
  const g = s.execution.groups.find((g) => g.id === groupId);
  if (!g) return [];
  return Array.from({ length: g.rounds }, (_, i) => ({
    round: i + 1,
    steps: s.occurrences
      .filter((o) => o.groupId === g.id)
      .flatMap((o) =>
        o.sets
          .filter((v) => v.groupRound === i + 1)
          .map((v) => ({
            occurrenceId: o.id,
            setId: v.id,
            name: o.definitionSnapshot.name,
            disposition: v.disposition,
          })),
      ),
  }));
}
