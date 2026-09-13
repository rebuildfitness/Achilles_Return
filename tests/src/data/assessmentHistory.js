import { metric } from "../rules/baseline.js";
export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function freshBaseline(previous = {}, date = new Date()) {
  const keep = [
    "repairSide",
    "surgeryDate",
    "ptEndDate",
    "availableDays",
    "basketballFrequency",
    "basketballFormat",
    "basketballGoal",
    "courtDays",
    "soccerEnabled",
    "soccerBall",
    "soccerField",
    "soccerGoal",
  ];
  return {
    surgeryDate: "2026-01-07",
    ptEndDate: "2026-06",
    ...Object.fromEntries(
      keep
        .filter((k) => previous[k] !== undefined)
        .map((k) => [k, previous[k]]),
    ),
    assessmentDate: localDate(date),
    assessmentMonth: localDate(date).slice(0, 7),
    assessmentSlot: date.getDate() <= 15 ? "start" : "finish",
  };
}
export const assessmentDate = (a) =>
  a.values.assessmentDate || a.completedAt?.slice(0, 10) || "";
export const assessmentMonth = (a) =>
  a.values.assessmentMonth || assessmentDate(a).slice(0, 7);
export const assessmentLabel = (a) =>
  `${assessmentDate(a)} · ${a.values.assessmentSlot === "start" ? "Monthly starting" : a.values.assessmentSlot === "finish" ? "Monthly finishing" : "Historical"} baseline`;
export function monthlyPair(assessments, month) {
  const records = assessments
    .filter((a) => assessmentMonth(a) === month)
    .sort((a, b) => String(a.completedAt).localeCompare(String(b.completedAt)));
  return {
    start: records.filter((a) => a.values.assessmentSlot === "start").at(-1),
    finish: records.filter((a) => a.values.assessmentSlot === "finish").at(-1),
  };
}
export function monthlyStatus(assessments, date = new Date()) {
  const month = localDate(date).slice(0, 7),
    pair = monthlyPair(assessments, month);
  const finishDate = localDate(
    new Date(date.getFullYear(), date.getMonth() + 1, 0),
  );
  return {
    month,
    finishDate,
    startDone: !!pair.start,
    finishDone: !!pair.finish,
  };
}
export const TREND_METRICS = [
  {
    id: "heelReps",
    label: "Heel-rise repetitions",
    unit: "reps",
    keys: ["heel_repaired_reps", "heel_uninvolved_reps"],
  },
  {
    id: "heelHeight",
    label: "Peak heel-rise height",
    unit: "cm",
    keys: ["heel_repaired_peak", "heel_uninvolved_peak"],
  },
  {
    id: "balance",
    label: "Single-leg balance",
    unit: "seconds",
    keys: ["balance_repaired_seconds", "balance_uninvolved_seconds"],
  },
  {
    id: "mobility",
    label: "Knee-to-wall mobility (best trial)",
    unit: "cm",
    keys: ["mobility_repaired", "mobility_uninvolved"],
  },
  {
    id: "soleus",
    label: "Seated calf load",
    unit: "lb",
    keys: ["soleus_repaired_load", "soleus_uninvolved_load"],
  },
  {
    id: "straight",
    label: "Standing calf load",
    unit: "lb",
    keys: ["straight_repaired_load", "straight_uninvolved_load"],
  },
  {
    id: "pain",
    label: "Pain",
    unit: "/10",
    keys: ["restPain", "walkPain"],
    series: ["Resting", "Walking"],
  },
  ...["belt", "rdl", "step", "bridge"].map((id, i) => ({
    id,
    label:
      ["Belt squat", "Dumbbell RDL", "Step-up", "Bridge / hip thrust"][i] +
      " load",
    unit: "lb",
    keys: [id + "_load"],
    series: ["Load"],
  })),
];
export function trendValue(assessment, definition, side) {
  if (!assessment) return null;
  const key = definition.keys[side];
  if (definition.id === "mobility") {
    const trials = [
      metric(assessment.values[key + "_trial1"]),
      metric(assessment.values[key + "_trial2"]),
    ].filter((v) => v !== null);
    return trials.length ? Math.max(...trials) : null;
  }
  return metric(assessment.values[key]);
}
