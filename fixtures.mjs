import { BASELINE_SECTIONS } from "../src/data/baseline.js";
export function baselineValues() {
  const values = {};
  for (const section of BASELINE_SECTIONS)
    for (const field of section.fields) {
      if (field.type === "select") values[field.id] = field.options[0][0];
      else if (field.type === "number") values[field.id] = "0";
      else if (field.type === "checks") values[field.id] = [];
      else
        values[field.id] =
          field.type === "date"
            ? "2026-01-07"
            : field.type === "month"
              ? "2026-06"
              : "";
    }
  for (let i = 0; i < 11; i++) values[`function_${i}`] = "normal";
  return {
    ...values,
    complications: "no",
    restPain: "0",
    walkPain: "0",
    gait: "normal",
    noDailyPain: "yes",
    noRehabPain: "yes",
    bilateralSafe: "yes",
    bilateralTen: "yes",
    bilateralHeight: "normal",
    bilateralSymmetry: "good",
    heelQuality: "yes",
    heel_repaired_reps: "20",
    heel_uninvolved_reps: "25",
    heel_repaired_peak: "8",
    heel_uninvolved_peak: "10",
    heel_repaired_average: "7",
    heel_uninvolved_average: "9",
    goodBalance: "yes",
    psychReady: "yes",
    recentRunning: "no",
    runMinutes: "0",
    soccerEnabled: "no",
    availableDays: ["1", "3", "5"],
    confidence_run: "8",
  };
}
export const reviewed = (...keys) =>
  Object.fromEntries(
    keys.flatMap((key) => [
      [key, "yes"],
      [
        `${key}_evidence`,
        "Performed controlled assessment with reviewer and current measurements.",
      ],
      [`${key}_date`, "2026-09-11"],
    ]),
  );
export const exposure = (domain, level, status = "TOLERATED", n = 1) => ({
  id: `${domain}-${level}-${n}`,
  domain,
  exposureLevel: level,
  date: `2026-08-${String(n).padStart(2, "0")}`,
  createdAt: `2026-08-${String(n).padStart(2, "0")}T12:00:00Z`,
  status,
  movementQuality: "good",
  exerciseLog: {},
  progressionEligible: true,
});
