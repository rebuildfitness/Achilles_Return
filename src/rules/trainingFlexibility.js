import { CATALOG, EQUIPMENT } from "../data/catalog.js";
import { EXERCISE_LIBRARY } from "../data/exerciseLibrary.js";
import { strengthDecision } from "./progression.js";

export const FAMILIES = {
  "band-hamstring": [
    "band-hamstring",
    "library-seated-unilateral-cable-hamstring-curl",
    "library-standing-cable-hamstring-curl",
  ],
  "db-curl": [
    "db-curl",
    "library-standing-hammer-curl",
    "library-incline-dumbbell-curl",
    "barbell-curl",
  ],
  "db-lateral-raise": [
    "db-lateral-raise",
    "library-seated-dumbbell-lateral-raise",
    "library-two-arm-cable-lateral-raise",
  ],
  "seated-db-triceps": [
    "seated-db-triceps",
    "library-rope-cable-triceps-extension",
    "library-lying-dumbbell-triceps-extension",
  ],
  "seated-march": ["seated-march", "cable-pallof-press"],
  "db-bench": [
    "db-bench",
    "library-flat-dumbbell-bench-press",
    "library-dumbbell-floor-press",
    "library-smith-incline-bench-press",
    "library-barbell-bench-press",
  ],
  "supported-db-row": [
    "supported-db-row",
    "library-chest-supported-dumbbell-row",
    "library-smith-bent-over-row",
    "library-barbell-bent-over-row",
  ],
  "seated-arnold-press": [
    "seated-arnold-press",
    "library-seated-dumbbell-shoulder-press",
    "library-smith-seated-shoulder-press",
  ],
  "belt-squat": [
    "belt-squat",
    "library-dumbbell-goblet-squat",
    "library-smith-wide-stance-squat",
    "library-barbell-back-squat",
  ],
  "dumbbell-romanian-deadlift": [
    "dumbbell-romanian-deadlift",
    "library-barbell-romanian-deadlift",
    "library-trap-bar-deadlift",
  ],
  "cable-pallof-press": ["cable-pallof-press", "seated-march"],
};
export function swapOptions(exercise, equipment = EQUIPMENT) {
  const origin = exercise.originalId || exercise.id;
  const ids = FAMILIES[origin] || [];
  return ids
    .map(
      (id) =>
        Object.values(CATALOG).find((e) => e.id === id) ||
        EXERCISE_LIBRARY.find((e) => e.id === id),
    )
    .filter((e) => e && e.equipment.every((id) => equipment.includes(id)));
}
export function swapExercise(exercise, id, equipment, readiness, reason) {
  const option = swapOptions(exercise, equipment).find((e) => e.id === id);
  if (!option || !["equipment", "progression", "discomfort"].includes(reason))
    throw new Error("Choose an available reviewed alternative and a reason.");
  if (readiness === "RED")
    throw new Error("Resolve safety concerns before loading.");
  if (reason === "progression" && readiness !== "GREEN")
    throw new Error("Hold progression on a modified day.");
  // A different movement never inherits completed sets or a pound-for-pound load.
  return {
    ...exercise,
    ...option,
    originalId: exercise.originalId || exercise.id,
    sets: exercise.sets,
    reps: exercise.reps,
    rpe: exercise.rpe,
    restSec: exercise.restSec,
    cue: option.setup || option.cue,
    swapReason: reason,
    loadTier: /smith|barbell|trap/.test(id) ? "moderate" : exercise.loadTier,
    videoType: option.videoType || "exercise_specific_page",
    videoVerifiedAt: option.videoVerifiedAt || option.verifiedAt,
    adjustment:
      "New variation: warm up and establish a fresh working load. Stop if the alternative also provokes symptoms.",
  };
}
export function loadGuidance(exercise, sessions = [], readiness = "GREEN") {
  const latest = [...sessions]
    .filter((s) => s.exerciseLog?.[exercise.id])
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const sets = latest?.exerciseLog[exercise.id]?.sets || [];
  const decision = strengthDecision(exercise, sets, latest?.status, readiness);
  const loads = sets
    .filter(
      (s) =>
        s?.complete &&
        s.load !== "" &&
        s.load !== undefined &&
        Number.isFinite(Number(s.load)),
    )
    .map((s) => Number(s.load));
  const perDumbbell =
    /dumbbell|db-/.test(exercise.id) &&
    !/triceps|seated-calf/.test(exercise.id);
  const max = exercise.id === "belt-squat" ? 225 : perDumbbell ? 50 : null;
  const atLimit = max !== null && loads.length > 0 && Math.max(...loads) >= max;
  return {
    starting:
      loads.length && latest.status === "TOLERATED"
        ? `Last tolerated load: ${Math.min(...loads)}${Math.min(...loads) !== Math.max(...loads) ? "–" + Math.max(...loads) : ""} lb${perDumbbell ? " per dumbbell" : ""}. Warm up below this; repeat only if today feels comparable.`
        : "No established tolerated load for this variation. Start with bodyweight or the lightest practical resistance, then use small warm-up increases until the prescribed reps feel controlled at the target RPE. Keep 2–4 reps in reserve; do not test a maximum.",
    cadence: /calf/.test(exercise.id)
      ? "Calf cadence: 2 seconds up, 1 second hold, 2–3 seconds down; keep heel height consistent."
      : exercise.unit === "seconds"
        ? "Hold steadily and breathe normally."
        : "Cadence: about 2 seconds lowering, a brief controlled transition, then 1–2 seconds lifting. No bouncing or forced speed.",
    overload: decision.reason,
    transition: atLimit
      ? "Your equipment limit is reached. Choose a reviewed variation rather than exceeding capacity. Establish its starting load independently."
      : "Build reps within the prescribed range before increasing load. Change one variable at a time.",
    limit: max,
    next: atLimit && decision.action === "PROPOSE_SMALL_INCREMENT",
  };
}
export const addDays = (date, days) => {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export function rescheduleWorkout(days, sessions, from, to, today) {
  const source = days.find((d) => d.date === from);
  if (!source?.workout || from >= to || to < today)
    throw new Error(
      "Select an unfinished workout and a later date from today onward.",
    );
  if (sessions.some((s) => !s.domain && (s.date === from || s.date === to)))
    throw new Error("A completed workout cannot be moved or doubled.");
  const queue = days.filter(
    (d) =>
      d.workout &&
      d.date >= to &&
      d.date !== from &&
      !sessions.some((s) => !s.domain && s.date === d.date),
  );
  const prior = sessions
    .filter((s) => !s.domain && s.date < to)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (prior && addDays(prior.date, 2) > to)
    throw new Error(
      "Choose a day with a recovery day after your last strength workout.",
    );
  const plannedPrior = days
    .filter(
      (d) => d.workout && d.date < to && d.date !== from && d.date >= today,
    )
    .at(-1);
  if (plannedPrior && addDays(plannedPrior.date, 2) > to)
    throw new Error(
      "Choose a date with a recovery day after the preceding planned strength workout.",
    );
  const changes = [
    { from, to, kind: source.workout.id.replace("strength-", "") },
  ];
  let previous = to;
  for (const day of queue) {
    const target =
      day.date < addDays(previous, 2) ? addDays(previous, 2) : day.date;
    if (target !== day.date)
      changes.push({
        from: day.date,
        to: target,
        kind: day.workout.id.replace("strength-", ""),
      });
    previous = target;
  }
  return changes;
}
