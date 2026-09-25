import {
  unified,
  actualRows,
  calendarEvents,
  exposureRows,
  val,
} from "./timeline.js";
import { CATEGORY_OPTIONS } from "./composition.js";
// Presentation aliases of existing metadata, never exercise-name matching.
const aliases = {
  calf: "Achilles Rehab",
  soleus: "Achilles Rehab",
  rehab: "Achilles Rehab",
  balance: "Balance / Proprioception",
  balance_movement_control: "Balance / Proprioception",
  trunk: "Core",
  core: "Core",
  mobility: "Mobility",
  recovery: "Recovery",
  strength: "Strength",
  running: "Running",
  jumping: "Jumping & Landing",
  speed: "Sprinting",
  cod: "Change of Direction / Agility",
  basketball: "Basketball Conditioning",
  walk: "Walking",
  bike: "Cardiovascular Training",
  cycle: "Cardiovascular Training",
  cardio: "Cardiovascular Training",
};
export function categories(definition) {
  const raw = definition.sourceMetadata || {};
  const curated = {
    "library-stationary-cycling": ["Cardiovascular Training"],
    "library-treadmill-walking": ["Walking", "Cardiovascular Training"],
  };
  return [
    ...new Set(
      [
        ...(definition.categories || []),
        ...(raw.tags || []),
        ...(raw.domain ? [raw.domain] : []),
        ...(curated[definition.id] || []),
        ...(["Bent knee / soleus", "Straight knee"].includes(raw.family)
          ? ["Achilles Rehab"]
          : []),
      ].map((x) => aliases[x] || x),
    ),
  ];
}
export function calfSummary(rows) {
  const calf = rows.filter((r) => {
    const d = r.occurrence.definitionSnapshot,
      raw = d.sourceMetadata || {};
    return (
      [...(d.categories || []), ...(raw.tags || [])].some((x) =>
        ["calf", "soleus"].includes(x),
      ) || ["Bent knee / soleus", "Straight knee"].includes(raw.family)
    );
  });
  const soleus = calf.filter((r) => {
    const d = r.occurrence.definitionSnapshot;
    return (
      [...d.categories, ...(d.sourceMetadata?.tags || [])].includes("soleus") ||
      d.sourceMetadata?.family === "Bent knee / soleus"
    );
  });
  return {
    calf: calf.length,
    soleus: soleus.length,
    bilateral: calf.filter((r) => val(r.actual.side) === "bilateral").length,
    unilateral: calf.filter((r) =>
      ["left", "right"].includes(val(r.actual.side)),
    ).length,
    sideKnown: calf.filter((r) => val(r.actual.side)).length,
  };
}
export function number(metric) {
  const n = val(metric?.amount);
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}
export function completedTraining(data) {
  const visible = new Set(
    calendarEvents(data)
      .filter((e) => e.kind === "session")
      .map((e) => e.recordId),
  );
  return unified(data).filter(
    (s) =>
      visible.has(s.id) &&
      (["completed", "partial"].includes(s.lifecycle) ||
        (s.legacy?.source === "movement" && s.legacy.raw.status === "saved")) &&
      (actualRows(s).length ||
        s.exposures?.length ||
        s.occurrences.some(
          (o) => o.disposition === "completed" && o.aggregateActual,
        )),
  );
}
export function responseRecorded(s, observations = []) {
  return (
    observations.some(
      (o) =>
        o.kind === "response" &&
        o.sessionId === s.id &&
        Object.values(o.observations || {}).some((v) => v !== "" && v != null),
    ) ||
    s.responses?.some(
      (r) => val(r.observations) && Object.keys(val(r.observations)).length,
    )
  );
}
// Units are displayed separately. No guessing units, device identity or targets.
export function metricTotals(rows, key) {
  const groups = new Map();
  let covered = 0;
  for (const row of rows) {
    const m = row.actual?.[key],
      n = number(m),
      unit = val(m?.unit);
    if (n === undefined || !unit) continue;
    covered++;
    groups.set(unit, (groups.get(unit) || 0) + n);
  }
  return {
    covered,
    total: rows.length,
    values: [...groups].map(([unit, amount]) => ({ unit, amount })),
  };
}
export function strengthSeries(sessions) {
  const groups = new Map();
  for (const s of sessions)
    for (const r of actualRows(s)) {
      const load = r.actual.load,
        amount = number(load),
        reps = number(r.actual.reps);
      if (amount === undefined) continue;
      const d = r.occurrence.definitionSnapshot;
      const convention = val(r.actual.loadConvention),
        setup = val(r.actual.loadConventionNote) || val(d.setup);
      const key = JSON.stringify([
        d.id,
        val(load.unit),
        convention,
        setup,
        val(r.actual.side),
      ]);
      if (!groups.has(key))
        groups.set(key, {
          key,
          exerciseId: d.id,
          name: val(d.name) || "Unknown exercise",
          unit: val(load.unit),
          convention,
          setup,
          side: val(r.actual.side),
          points: [],
        });
      groups
        .get(key)
        .points.push({
          date: val(s.date),
          sessionId: s.id,
          occurrenceId: r.occurrence.id,
          setId: r.set.id,
          load: amount,
          reps,
          rpe: number(r.actual.rpe),
          volume:
            reps !== undefined &&
            val(load.unit) &&
            convention &&
            !["assistance", "bodyweight", "unknown"].includes(convention)
              ? reps * amount
              : undefined,
        });
    }
  return [...groups.values()].map((g) => ({
    ...g,
    points: g.points.sort((a, b) => (a.date || "").localeCompare(b.date || "")),
  }));
}
export function progressSummary(data, from, to) {
  const sessions = completedTraining(data).filter(
    (s) => val(s.date) >= from && val(s.date) <= to,
  );
  const allRows = sessions.flatMap((s) =>
    actualRows(s).map((r) => ({ ...r, sessionId: s.id, date: val(s.date) })),
  );
  const exposures = exposureRows(unified(data), data.v2Observations).filter(
    (e) => e.date >= from && e.date <= to,
  );
  const owners = new Map();
  for (const s of unified(data))
    for (const id of s.legacy?.raw?.linkedExposureIds || [])
      owners.set(id, s.id);
  const aggregate = exposures
    .filter((e) => ["recorded", "recorded observation"].includes(e.source))
    .map((e) => ({
      ...e,
      sessionId: owners.get(e.sessionId) || e.sessionId || e.id,
      category: aliases[e.domain] || e.domain,
    }));
  const labels = [...CATEGORY_OPTIONS, "Jumping & Landing"];
  const summaries = labels.map((label) => {
    const matching = sessions.filter(
      (s) =>
        s.categories?.includes(label) ||
        actualRows(s).some((r) =>
          categories(r.occurrence.definitionSnapshot).includes(label),
        ) ||
        s.exposures?.some(
          (e) => (aliases[val(e.domain)] || val(e.domain)) === label,
        ),
    );
    const performed = allRows.filter((r) =>
      categories(r.occurrence.definitionSnapshot).includes(label),
    );
    const linkedOccurrenceIds = new Set(
      (data.v2Observations || [])
        .filter((o) => o.kind === "exposure" && o.occurrenceId)
        .map((o) => `${o.sessionId}:${o.occurrenceId}`),
    );
    const rows = [
      ...performed.filter(
        (r) => !linkedOccurrenceIds.has(`${r.sessionId}:${r.occurrence.id}`),
      ),
      ...aggregate.filter((e) => e.category === label),
    ];
    return {
      label,
      sessions: new Set([
        ...matching.map((s) => s.id),
        ...rows.map((r) => r.sessionId),
      ]).size,
      sets: performed.length,
      duration: metricTotals(rows, "duration"),
      distance: metricTotals(rows, "distance"),
      contacts: metricTotals(rows, "contacts"),
      distanceSessions: new Set(
        rows
          .filter(
            (r) =>
              number(r.actual.distance) !== undefined &&
              val(r.actual.distance.unit),
          )
          .map((r) => r.sessionId),
      ).size,
    };
  });
  const weeks = new Map();
  for (const s of sessions) {
    const dt = new Date(val(s.date) + "T12:00:00Z");
    dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7));
    const k = dt.toISOString().slice(0, 10);
    weeks.set(k, (weeks.get(k) || 0) + 1);
  }
  return {
    sessions,
    frequency: sessions.length,
    weeks: [...weeks].sort().map(([date, count]) => ({ date, count })),
    categories: summaries,
    calf: calfSummary(allRows),
    strength: strengthSeries(sessions),
    responseCoverage: {
      covered: sessions.filter((s) => responseRecorded(s, data.v2Observations))
        .length,
      total: sessions.length,
    },
    exposures,
    symptoms: [
      ...(data.checkins || []).map((c) => ({
        id: c.id,
        date: c.date || c.id,
        raw: c.answers,
        interpretation: c.readiness,
      })),
      ...(data.v2Observations || [])
        .filter((o) => ["symptom", "response"].includes(o.kind))
        .map((o) => ({
          id: o.id,
          date: o.activityDate || val(o.recordedAt)?.slice(0, 10),
          raw: o.observations,
          interpretation: o.interpretation,
        })),
    ].filter((o) => o.date >= from && o.date <= to),
  };
}
