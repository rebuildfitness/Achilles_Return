import { adaptSession, adaptMovement } from "./adapters.ts";
import { clone } from "./composition.js";
import { movementRecords } from "../../data/movement.js";
export const val = (x) => (x?.state === "known" ? x.value : undefined);
export function readable(x) {
  if (x === undefined || x === null) return "Not recorded";
  if (x?.state)
    return x.state === "known"
      ? readable(x.value)
      : {
          blank: "Blank",
          unknown: "Unknown",
          "not-applicable": "Not applicable",
        }[x.state] || x.state;
  if (x?.amount)
    return `${readable(x.amount)} ${val(x.unit) || "(unit unknown)"}`;
  if (Array.isArray(x))
    return x.length ? x.map(readable).join(", ") : "None recorded";
  if (typeof x === "object")
    return Object.entries(x)
      .map(([k, v]) => `${k.replace(/([A-Z])/g, " $1")}: ${readable(v)}`)
      .join("; ");
  return (
    {
      TOLERATED: "Tolerated",
      NOT_TOLERATED: "Not tolerated",
      BORDERLINE: "Borderline response",
      MEDICAL_FLAG: "Concerning response — seek evaluation",
      PENDING_NEXT_DAY_RESPONSE: "Response not yet established",
      baseline: "At usual baseline",
    }[String(x)] || String(x)
  );
}
const completed = (s) => ["completed", "partial"].includes(s.disposition);
export function actualRows(session) {
  return session.occurrences.flatMap((o) =>
    o.sets.flatMap((s) =>
      s.intervals?.length
        ? s.intervals.filter(completed).map((b) => ({
            occurrence: o,
            set: s,
            bout: b,
            actual: b.actual,
            target: b.target,
            disposition: b.disposition,
          }))
        : completed(s)
          ? [
              {
                occurrence: o,
                set: s,
                actual: s.actual,
                target: s.target,
                disposition: s.disposition,
              },
            ]
          : [],
    ),
  );
}
export function unified(data) {
  const native = data.v2WorkoutSessions || [],
    origins = new Set(
      native.filter((s) => s.legacyOrigin).map((s) => s.legacyOrigin.id),
    );
  const sessions = [
    ...(data.sessions || [])
      .filter((s) => !origins.has(s.id))
      .map((s) => adaptSession(s)),
    ...clone(native),
  ];
  const movement = movementRecords(data.settings || [])
    .filter((m) => m.status === "saved")
    .map((s) => adaptMovement(s));
  return [...sessions, ...movement];
}
export function sessionLabel(s) {
  return s.legacyOrigin
    ? "Saved workout (corrected)"
    : s.legacy
      ? "Earlier workout"
      : s.sourcePlanMetadata?.copiedFrom
        ? "Workout (copied intent)"
        : "Workout";
}
export function exposureRows(sessions, observations = []) {
  const rows = new Map();
  for (const s of sessions) {
    for (const e of s.exposures || [])
      rows.set(e.id, {
        id: e.id,
        sessionId: s.id,
        date: val(s.date),
        domain: val(e.domain) || "Unspecified",
        actual: clone(e.actual),
        raw: clone(e.observations),
        source: "recorded",
      });
    if (actualRows(s).length && s.categories?.length)
      rows.set("context:" + s.id, {
        id: "context:" + s.id,
        sessionId: s.id,
        date: val(s.date),
        domain: s.categories.join(" · "),
        actual: {},
        raw: {
          note: "Workout categories only. No domain-specific quantities inferred.",
        },
        source: "workout context, not an additional exposure",
      });
    // Category is context, not an invented quantity. Each performed occurrence is one exposure row.
    for (const o of s.occurrences) {
      const performed = actualRows(s).filter((r) => r.occurrence.id === o.id);
      if (!performed.length) continue;
      const categories = [
        ...new Set([
          ...(s.categories || []),
          ...(o.definitionSnapshot.categories || []),
        ]),
      ];
      if (!categories.length) continue;
      rows.set(`occurrence:${s.id}:${o.id}`, {
        id: `occurrence:${s.id}:${o.id}`,
        sessionId: s.id,
        date: val(s.date),
        domain:
          (o.definitionSnapshot.categories || []).join(" · ") ||
          "Unclassified movement",
        actual: performed.map((r) => r.actual),
        raw: {
          exercise: o.definitionSnapshot.name,
          workoutCategories: s.categories,
          attribution:
            "Recorded movement metrics; not allocated to each workout category",
          setup: o.definitionSnapshot.setup,
        },
        source: "performed occurrence",
      });
    }
  }
  for (const o of observations.filter((o) => o.kind === "exposure")) {
    // Explicit identity links suppress a redundant embedded representation only.
    if (o.sourceExposureId) rows.delete(o.sourceExposureId);
    if (o.occurrenceId && o.sessionId)
      rows.delete(`occurrence:${o.sessionId}:${o.occurrenceId}`);
    rows.set(o.id, {
      id: o.id,
      sessionId: o.sessionId,
      date: o.activityDate || val(o.recordedAt)?.slice(0, 10),
      domain: val(o.domain) || o.observations.domain || "Unspecified",
      actual: o.actual || {},
      raw: o.observations,
      source: "recorded observation",
    });
  }
  return [...rows.values()];
}
export function calendarEvents(data) {
  const sessions = unified(data),
    events = [],
    linked = new Set();
  for (const s of sessions)
    for (const id of s.legacy?.raw?.linkedExposureIds || []) linked.add(id);
  for (const p of data.v2PlannedWorkouts || [])
    if (p.planning && !p.planning.archived)
      events.push({
        id: `plan:${p.id}`,
        recordId: p.id,
        date: p.date,
        kind: "plan",
        title: p.snapshot.name,
        status:
          p.status === "planned" && sessions.some((s) => s.planRef === p.id)
            ? "started / recorded"
            : p.status,
        categories: p.snapshot.categories,
        record: p,
      });
  for (const s of sessions) {
    const raw = s.legacy?.raw;
    if (linked.has(s.id)) continue; // Shown inside the linked workout, not as another workout event.
    events.push({
      id: `session:${s.id}`,
      recordId: s.id,
      date: val(s.date),
      kind: "session",
      title: val(s.name) || raw?.domain || "Recorded activity",
      status: s.lifecycle,
      categories: s.categories,
      record: s,
      training: s.lifecycle !== "abandoned" && actualRows(s).length > 0,
    });
  }
  for (const [store, kind] of [
    ["assessments", "assessment"],
    ["checkins", "symptom"],
    ["v2Observations", "observation"],
  ])
    for (const r of data[store] || [])
      events.push({
        id: `${store}:${r.id}`,
        recordId: r.id,
        date:
          r.activityDate ||
          r.date ||
          r.completedAt?.slice(0, 10) ||
          val(r.recordedAt)?.slice(0, 10) ||
          r.id,
        kind,
        title: kind === "observation" ? `${r.kind} observation` : kind,
        status: "recorded",
        record: r,
      });
  for (const r of data.capabilityStates || [])
    if (r.id === "checkpoints")
      for (const [key, entry] of Object.entries(r.values || {})) {
        if (key.endsWith("_date") && typeof entry === "string")
          events.push({
            id: `checkpoint:${r.id}:${key}`,
            date: entry,
            kind: "checkpoint",
            title: key.slice(0, -5),
            status: "recorded",
            record: {
              answer: r.values[key.slice(0, -5)],
              evidence: r.values[key.slice(0, -5) + "_evidence"],
              date: entry,
            },
          });
        if (entry && typeof entry === "object" && entry.date)
          events.push({
            id: `checkpoint:${r.id}:${key}`,
            date: entry.date,
            kind: "checkpoint",
            title: key,
            status: "recorded",
            record: entry,
          });
      }
  return events.sort(
    (a, b) =>
      (a.date || "").localeCompare(b.date || "") || a.id.localeCompare(b.id),
  );
}
export function exerciseRows(sessions, id = "") {
  return sessions
    .flatMap((s) =>
      s.occurrences
        .filter((o) => !id || o.exerciseDefinitionId === id)
        .map((o) => ({
          id: `${s.id}:${o.id}`,
          session: s,
          occurrence: o,
          rows: actualRows(s).filter((r) => r.occurrence.id === o.id),
        })),
    )
    .filter((x) => x.rows.length || x.occurrence.aggregateActual);
}
export function reportSession(session, data) {
  const events = (data.v2GuidanceEvents || []).filter(
      (e) => e.subjectId === session.id,
    ),
    decisions = (data.v2GuidanceDecisions || []).filter((d) =>
      events.some((e) => e.id === d.guidanceId),
    );
  const lines = [
    `# ${val(session.name) || "Workout"} — ${val(session.date) || "Date unknown"}`,
    `Status: ${session.lifecycle}. ${sessionLabel(session)}. Revision ${session.revision}.`,
    `Completed recorded work: ${actualRows(session).length} sets/bouts. Unknown amounts are not filled from targets.`,
    `Notes: ${session.execution?.notes || session.recordNotes || "Not recorded"}`,
    "## Original intent",
    readable(
      val(session.originalIntent)?.occurrences?.map((o) => ({
        exercise: o.definitionSnapshot.name,
        targets: o.sets.map((s) => s.target),
      })),
    ),
    "## Planned and actual work",
  ];
  for (const o of session.occurrences) {
    lines.push(
      `### ${readable(o.definitionSnapshot.name)} (${o.id})`,
      `${o.addedDuringSession ? "Added during session. " : ""}${o.replacesOccurrenceId ? "Replacement for " + o.replacesOccurrenceId + ". " : ""}Setup: ${readable(o.definitionSnapshot.setup)}`,
    );
    for (const s of o.sets) {
      lines.push(
        `- ${s.disposition}; type ${readable(s.actualType || s.type)}; target: ${readable(s.target)}; actual: ${readable(s.actual)}`,
      );
      for (const b of s.intervals || [])
        lines.push(
          `  - ${b.kind} ${b.disposition}; target: ${readable(b.target)}; actual: ${readable(b.actual)}`,
        );
    }
  }
  lines.push("## Raw observations");
  for (const s of session.symptoms || []) lines.push(readable(s.observations));
  for (const r of session.responses || [])
    lines.push(
      `Delayed response: ${readable(r.observations)}; stored interpretation: ${readable(r.interpretation)}`,
    );
  const observations = (data.v2Observations || []).filter(
    (o) => o.sessionId === session.id,
  );
  if (
    !observations.some((o) => o.kind === "response") &&
    !session.responses?.some((r) => val(r.observations))
  )
    lines.push(
      "Delayed tendon response: not yet recorded. Completion is not tolerance.",
    );
  for (const o of observations)
    lines.push(
      `${o.kind}: ${readable(o.observations)}\nDerived interpretation (separate): ${readable(o.interpretation)}`,
    );
  lines.push(
    "## Guidance and decisions",
    "Continue Anyway is not medical clearance. Prior findings remain historical, not automatically current.",
  );
  for (const e of events)
    lines.push(
      `${e.level}: ${e.finding || e.explanation}; subject revision ${e.subjectRevision} (${e.subjectRevision === session.revision ? "revision matches; context may need refresh" : "historical/stale"}); rule ${e.ruleId} ${e.ruleVersion}; sources ${e.sourceIds.join(", ")}`,
    );
  for (const d of decisions)
    lines.push(`${d.action} at ${d.at} for ${d.guidanceId}`);
  lines.push(
    "## Recorded exposure",
    "No recorded exposure does not mean none occurred.",
  );
  const linked = session.legacy?.raw?.linkedExposureIds || [];
  for (const e of exposureRows(unified(data), data.v2Observations).filter(
    (e) => e.sessionId === session.id || linked.includes(e.sessionId),
  ))
    lines.push(`${e.domain}: ${readable(e.actual)}; ${readable(e.raw)}`);
  lines.push("## Corrections");
  for (const c of session.correctionLineage || [])
    lines.push(
      `${c.at || "Unknown date"}: ${c.reason || "Legacy correction"}; prior revision ${c.previousRevision ?? "unknown"}`,
    );
  return lines.join("\n\n");
}
