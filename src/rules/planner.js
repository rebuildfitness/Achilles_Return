import { legacyRehabConditioningTemplate } from "./legacyRehabConditioning.js";
import { rehabConditioningTemplate, coordinateConditioning } from "./rehabConditioning.js";
import { applyAutomaticPlan } from "./automaticPlan.js";
import { CATALOG, activeExercise, EQUIPMENT, DEFAULT_EQUIPMENT } from "../data/catalog.js";
import { baselineResult } from "./baseline.js";
import { dayKey } from "../data/provisionalWeek.js";
import { resumeAfterMissedSessions } from "./workout.js";
import { swapExercise } from "./trainingFlexibility.js";
const clone = (value) => structuredClone(value);
export const STRENGTH_STYLES = [
  ["hybrid", "Rehab + Strength & Hypertrophy"],
  ["hypertrophy", "Rehab + hypertrophy"],
  ["rehab", "Original rehab template"],
  ["conditioning", "Strength + dedicated Achilles conditioning"],
];
export function strengthTemplate(kind, values, style = "hybrid") {
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
  const compound = (ex) => ({
    ...ex,
    sets: style === "hypertrophy" ? 3 : 5,
    reps: style === "hypertrophy" ? "8–12" : "5",
    rpe: "6–8",
    restSec: style === "hypertrophy" ? 120 : 180,
    strengthModule: true,
    cue: `${ex.cue} Warm up with lighter loads first. Keep 2–4 reps in reserve; no maximal attempts or forced reps.`,
    evidence:
      "User-requested general strength programming; 5×5 is not an Achilles clearance test.",
    evidenceType: "General resistance-training guidance / product programming",
    evidenceSourceIds: ["general-strength"],
  });
  const additions = {
    A: [
      compound(CATALOG.press),
      { ...CATALOG.row, sets: 2 },
      CATALOG.lateralRaise,
    ],
    B: [
      {
        ...compound(CATALOG.row),
        reps: style === "hypertrophy" ? "8–12 / side" : "5 / side",
      },
      CATALOG.triceps,
    ],
    C: [CATALOG.shoulderPress, CATALOG.row, CATALOG.curl, CATALOG.seatedCore],
  };
  if (style === "conditioning-legacy" && kind === "B") return legacyRehabConditioningTemplate(values, calf, soleus);
  if (style === "conditioning" && kind === "B") return rehabConditioningTemplate(values, calf, soleus);
  const expanded = style !== "rehab";
  return {
    id: `strength-${kind}`,
    title: `Strength ${kind}${expanded ? (kind === "C" || style === "hypertrophy" ? " · Hypertrophy" : " · Strength & Hypertrophy") : ""}`,
    phase: baselineResult(values).phase,
    items: clone([
      ...templates[kind],
      ...(expanded
        ? additions[kind].map((ex) => ({ ...ex, strengthModule: true }))
        : []),
    ]),
    notes: expanded
      ? [
          "Complete the rehab block first, then the added upper-body work. Added work uses the same strength days. Keep 2–4 reps in reserve and reduce accessory load or volume if it compromises rehab quality or recovery.",
        ]
      : [],
    ruleId: `template.strength-${kind}.${expanded ? "full-body.v1" : "v1"}`,
    rulesetVersion: "1.1.0",
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
  if (workout.sessionFormat === "rehab-conditioning" && workout.templateVersion === "2.0.0") {
    const treadmill = equipment.includes("incline-treadmill");
    const bike = equipment.includes("exercise-bike");
    const prep = treadmill || bike ? [{
      id:"rehab-warmup-cardio", illustrationId:treadmill?"library-treadmill-walking":"library-stationary-cycling",
      name:treadmill?"Walking warm-up":"Easy bike warm-up", block:"Warm-up", sets:1,reps:"240 sec",unit:"seconds",rpe:"Easy",restSec:0,
      equipment:[treadmill?"incline-treadmill":"exercise-bike"],loadTier:"low",impactTier:0,
      cue:treadmill?"2 minutes comfortable flat walking, then 2 minutes at an already tolerated incline; remain flat if incline is not established. Use the safety stop.":"Four minutes easy cycling. Record seconds, not repetitions or bike resistance as pounds.",
      purpose:"Gradually prepare for the circuits.",evidence:"User-requested warm-up arrangement; no new speed or incline prescription.",evidenceSourceIds:["product-v1"],
      videoUrl:treadmill?"https://www.youtube.com/watch?v=KALCW06tO5A":"https://www.youtube.com/watch?v=PFOfcsAOmVc",
      videoSource:"South Tees Hospitals NHS",videoType:"exercise_specific_page",videoVerifiedAt:"2026-09-11"
    }] : [];
    workout = {...workout,items:[...prep,...workout.items]};
  }
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
    const easeUpper = ex.strengthModule && readiness !== "GREEN";
    if (easeUpper) sets = Math.min(sets, readiness === "YELLOW_3" ? 2 : 3);
    if (
      ["YELLOW_1", "YELLOW_2"].includes(readiness) &&
      ["moderate", "high"].includes(ex.loadTier)
    )
      sets = Math.max(1, sets - 1);
    if (reentry > 0) sets = Math.max(1, Math.floor(sets * (1 - reentry)));
    return {
      ...ex,
      sets,
      ...(easeUpper
        ? {
            reps: ex.reps.includes("side") ? "8–12 / side" : "8–12",
            rpe: readiness === "YELLOW_3" ? "5–6" : "6–7",
            adjustment:
              "Use an easier load and fewer sets. No 5×5 or load progression today.",
          }
        : {}),
      ...(sets !== ex.sets && !easeUpper
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
      ...(workout.notes || []),
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
    availableEquipment: equipment,
  };
}
export function weeklyPlan(
  profile,
  assessment,
  sessions = [],
  today = new Date(),
  readiness = "GREEN",
  checkpoints = {},
  actualToday = dayKey(today),
  inProgressIds = [],
) {
  sessions = sessions.filter(s => !s.date || s.date <= actualToday);
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
    .filter((s) => s.date && s.date <= actualToday)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const daysMissed = prior
    ? Math.max(
        0,
        Math.floor(
          (new Date(actualToday + "T12:00:00").getTime() -
            new Date(prior.date + "T12:00:00").getTime()) /
            86400000,
        ) - 1,
      )
    : 0;
  const reentry = resumeAfterMissedSessions(daysMissed, readiness);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + index);
    const key = dayKey(date);
    const moves = profile?.scheduleMoves || [];
    const movedHere = moves.find((m) => m.to === key);
    const movedAway = moves.some((m) => m.from === key);
    const number = movedHere
      ? ["A", "B", "C"].indexOf(movedHere.kind)
      : movedAway
        ? -1
        : high.indexOf(index);
    const needsBaseline = !assessment?.completedAt;
    const restrictionReview =
      values?.clearance === "no" || values?.noRestrictions === "no";
    const blocked = phase === "Safety Hold" || restrictionReview;
    const isHigh = !needsBaseline && !blocked && number >= 0;
    const raw = isHigh
      ? strengthTemplate(
          ["A", "B", "C"][number],
          values,
          key === actualToday && profile?.strengthStyle === "conditioning" && inProgressIds.length && !inProgressIds.some(id => id.startsWith("rehab-")) ? "conditioning-legacy" : profile?.conditioningFrom && key < profile.conditioningFrom ? (profile.previousStrengthStyle || "hybrid") : profile?.strengthStyle || "hybrid",
        )
      : null;
    const effectiveReadiness = key === actualToday && readiness !== "UNCHECKED" ? readiness : "GREEN";
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
    if (raw)
      raw.items = raw.items.map((ex) => {
        const choice = profile?.exerciseChoices?.[ex.id];
        if (!choice || (choice.effectiveFrom && choice.effectiveFrom > key)) return ex;
        try {
          return swapExercise(
            ex,
            choice.id,
            profile?.equipment || DEFAULT_EQUIPMENT,
            modifiedReadiness,
            "equipment",
          );
        } catch {
          return ex;
        }
      });
    const workout = raw
      ? modifyWorkout(
          raw,
          modifiedReadiness,
          profile?.equipment || DEFAULT_EQUIPMENT,
          key === actualToday ? reentry.reduction : 0,
        )
      : null;
    return {
      date: key,
      dateObj: date,
      title: needsBaseline
        ? "Baseline first"
        : blocked
          ? phase === "Safety Hold"
            ? "Safety Hold"
            : "Review exercise restrictions"
          : workout?.title ||
            (index === 6 ? "Rest / Mobility" : "Easy aerobic / Recovery"),
      workout,
      focus: phase,
      high: isHigh,
      provisional: needsBaseline,
      note: needsBaseline
        ? "Complete baseline before activating a personalized plan."
        : blocked
          ? restrictionReview
            ? "Your assessment records no exercise clearance or an active restriction. Confirm which activities are permitted before generating a strength workout."
            : "Resolve concerning symptoms before Achilles loading."
          : !isHigh
            ? "Easy bike or comfortable walking if tolerated. No catch-up loading."
            : "Strength, quality and next-day tolerance.",
      retest:
        daysMissed > 10 &&
        (!assessment?.completedAt ||
          Math.floor(
            (new Date(actualToday + "T12:00:00").getTime() -
              new Date(
                assessment.completedAt.slice(0, 10) + "T12:00:00",
              ).getTime()) /
              86400000,
          ) > 10),
    };
  });
  return applyAutomaticPlan(days, { assessment, checkpoints, sessions, readiness, today: actualToday, manualChoices: profile?.exerciseChoices || {}, inProgressIds }).map(day => coordinateConditioning(day, sessions));
}
