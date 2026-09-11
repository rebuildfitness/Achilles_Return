import { CATALOG, activeExercise, EQUIPMENT } from "../data/catalog.js";
import { baselineResult } from "./baseline.js";
import { dayKey } from "../data/provisionalWeek.js";
import { resumeAfterMissedSessions } from "./workout.js";
const clone = (value) => structuredClone(value);
export function strengthTemplate(kind, values) {
  const unilateral =
    values.bilateralSafe === "yes" &&
    values.bilateralTen === "yes" &&
    values.bilateralSymmetry !== "clear" &&
    values.bilateralHeight !== "marked" &&
    values.heelQuality === "yes" &&
    Number(values.heel_repaired_reps) > 0;
  const calf = clone(unilateral ? CATALOG.single : CATALOG.bilateral);
  const soleus = clone(CATALOG.seated);
  const templates = {
    A: [
      { ...calf, sets: 4, reps: "6–10" },
      soleus,
      { ...CATALOG.belt, sets: 3, reps: "6–10" },
      CATALOG.rdl,
      CATALOG.pullup,
      { ...CATALOG.pallof, sets: 2, reps: "10 / side" },
    ],
    B: [
      { ...soleus, sets: 4, reps: "10–15" },
      { ...calf, sets: 3, reps: "6–12" },
      CATALOG.step,
      CATALOG.bridge,
      CATALOG.hamstring,
      CATALOG.press,
    ],
    C: [
      { ...calf, sets: 3, reps: "6–10" },
      { ...soleus, sets: 3 },
      { ...CATALOG.belt, reps: "8–12" },
      CATALOG.wagon,
      CATALOG.balance,
    ],
  };
  return {
    id: `strength-${kind}`,
    title: `Strength ${kind}`,
    phase: baselineResult(values).phase,
    items: clone(templates[kind]),
    ruleId: `template.strength-${kind}.v1`,
    rulesetVersion: "1.0.0",
  };
}
export function modifyWorkout(
  workout,
  readiness = "GREEN",
  equipment = EQUIPMENT,
  reentry = 0,
) {
  if (readiness === "RED")
    return {
      ...workout,
      items: [],
      stopped: true,
      notes: ["Stop Achilles loading and seek appropriate medical evaluation."],
    };
  const unavailable = workout.items.filter(
    (ex) => !activeExercise(ex, equipment),
  );
  let items = workout.items.filter((ex) => activeExercise(ex, equipment));
  if (readiness === "YELLOW_3")
    items = items.filter((ex) => ex.loadTier === "minimal");
  if (readiness === "YELLOW_2")
    items = items.filter((ex) => ex.impactTier === 0 && ex.loadTier !== "high");
  items = items.map((ex) => {
    let sets = ex.sets;
    if (
      ["YELLOW_1", "YELLOW_2"].includes(readiness) &&
      ["moderate", "high"].includes(ex.loadTier)
    )
      sets = Math.max(1, sets - 1);
    if (reentry > 0) sets = Math.max(1, Math.floor(sets * (1 - reentry)));
    return {
      ...ex,
      sets,
      ...(sets !== ex.sets
        ? { adjustment: "Reduced volume; hold load progression." }
        : {}),
    };
  });
  return {
    ...workout,
    title:
      readiness === "YELLOW_3"
        ? "Recovery-focused movement"
        : readiness === "GREEN"
          ? workout.title
          : `Modified ${workout.title}`,
    items,
    omitted: unavailable.map((ex) => ({
      id: ex.id,
      name: ex.name,
      reason: ex.lockedReason || "Equipment unavailable",
    })),
    notes: [
      ...(unavailable.length
        ? [
            "Some template items are unavailable; no unreviewed replacements have been added.",
          ]
        : []),
      ...(readiness === "YELLOW_3"
        ? ["Easy bike / walking only if tolerated. No impact today."]
        : []),
      ...(reentry
        ? [
            "Reduced re-entry dose after missed training. Never double sessions to catch up.",
          ]
        : []),
    ],
    progressionAllowed: readiness === "GREEN" && reentry === 0,
  };
}
export function weeklyPlan(
  profile,
  assessment,
  sessions = [],
  today = new Date(),
  readiness = "GREEN",
) {
  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const values = assessment?.values;
  const phase = values ? baselineResult(values).phase : "Re-entry / Baseline";
  const available = profile?.availableDays ||
    values?.availableDays || ["1", "3", "5"];
  const high = [];
  const lastStrength = [...sessions]
    .filter((s) => !s.domain)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0];
  const highLimit = ["BORDERLINE", "NOT_TOLERATED"].includes(
    lastStrength?.status,
  )
    ? 2
    : 3;
  for (let index = 0; index < 7; index++)
    if (
      available.includes(String((index + 1) % 7)) &&
      (high.length === 0 || index - high.at(-1) >= 2) &&
      !(index === 6 && high[0] === 0) &&
      high.length < highLimit
    )
      high.push(index);
  const prior = [...sessions]
    .filter((s) => s.date && s.date <= dayKey(today))
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const daysMissed = prior
    ? Math.max(
        0,
        Math.floor(
          (new Date(dayKey(today) + "T12:00:00").getTime() -
            new Date(prior.date + "T12:00:00").getTime()) /
            86400000,
        ) - 1,
      )
    : 0;
  const reentry = resumeAfterMissedSessions(daysMissed, readiness);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + index);
    const key = dayKey(date);
    const number = high.indexOf(index);
    const needsBaseline = !assessment?.completedAt;
    const restrictionReview = values?.clearance === "no" || values?.noRestrictions === "no";
    const blocked = phase === "Safety Hold" || restrictionReview;
    const isHigh = !needsBaseline && !blocked && number >= 0;
    const raw = isHigh
      ? strengthTemplate(["A", "B", "C"][number], values)
      : null;
    const effectiveReadiness = key === dayKey(today) ? readiness : "GREEN";
    const responseReadiness =
      lastStrength?.status === "NOT_TOLERATED"
        ? "YELLOW_2"
        : lastStrength?.status === "BORDERLINE"
          ? "YELLOW_1"
          : effectiveReadiness;
    const severity = ["GREEN", "YELLOW_1", "YELLOW_2", "YELLOW_3", "RED"];
    const modifiedReadiness =
      severity[
        Math.max(
          severity.indexOf(effectiveReadiness),
          severity.indexOf(responseReadiness),
        )
      ];
    const workout = raw
      ? modifyWorkout(
          raw,
          modifiedReadiness,
          profile?.equipment || EQUIPMENT,
          key === dayKey(today) ? reentry.reduction : 0,
        )
      : null;
    return {
      date: key,
      dateObj: date,
      title: needsBaseline
        ? "Baseline first"
        : blocked
          ? (phase === "Safety Hold" ? "Safety Hold" : "Review exercise restrictions")
          : workout?.title ||
            (index === 6 ? "Rest / Mobility" : "Easy aerobic / Recovery"),
      workout,
      focus: phase,
      high: isHigh,
      provisional: needsBaseline,
      note: needsBaseline
        ? "Complete baseline before activating a personalized plan."
        : blocked
          ? (restrictionReview ? "Your assessment records no exercise clearance or an active restriction. Confirm which activities are permitted before generating a strength workout." : "Resolve concerning symptoms before Achilles loading.")
          : !isHigh
            ? "Easy bike or comfortable walking if tolerated. No catch-up loading."
            : "Strength, quality and next-day tolerance.",
      retest:
        daysMissed > 10 &&
        (!assessment?.completedAt ||
          assessment.completedAt.slice(0, 10) < dayKey(today)),
    };
  });
}
