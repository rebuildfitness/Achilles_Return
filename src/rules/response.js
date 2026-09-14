import { OWNED_LOADS } from "../data/ownedLoads.js";
// Qualitative categories come directly from MASTER_PLAN next-morning tolerance.
export function classifyTolerance(response) {
  if ((response.redFlags || []).length || response.change === "medical")
    return "MEDICAL_FLAG";
  if (
    response.change === "substantial" ||
    response.functionChange === "yes" ||
    response.repeatedWorsening === "yes"
  )
    return "NOT_TOLERATED";
  if (response.change === "meaningful") return "BORDERLINE";
  if (
    response.change === "baseline" &&
    response.functionChange === "no" &&
    response.repeatedWorsening === "no"
  )
    return "TOLERATED";
  return "PENDING_NEXT_DAY_RESPONSE";
}
export function validateWorkoutLog(workout, log) {
  for (const ex of workout.items) {
    const limit =
      ex.id === "belt-squat"
        ? OWNED_LOADS.olympicPlatesLb
        : /dumbbell|db-|supported-db-row|seated-arnold/.test(ex.id) &&
            !/triceps|seated-calf/.test(ex.id)
          ? 50
          : null;
    if (
      limit &&
      (log[ex.id]?.sets || []).some(
        (s) => s?.complete && Number(s.load) > limit,
      )
    )
      return ex.id === "belt-squat"
        ? `${ex.name}: you have ${limit} lb of Olympic plates available. Record added plates only; this is your inventory, not the Mammoth's rated capacity.`
        : `${ex.name}: the equipment limit is ${limit} lb${limit === 50 ? " per dumbbell" : ""}. Choose another variation rather than exceeding capacity.`;
  }
  const completed = workout.items.flatMap((ex) =>
    (log[ex.id]?.sets || []).slice(0, ex.sets).filter((set) => set?.complete),
  );
  if (!completed.length) return "Complete at least one prescribed set.";
  if (
    completed.some(
      (set) => !(Number(set.reps) > 0) || !Number.isFinite(Number(set.reps)),
    )
  )
    return "Enter valid repetitions, seconds or distance for every completed set.";
  if (
    completed.some(
      (set) =>
        set.load !== undefined &&
        set.load !== "" &&
        (!Number.isFinite(Number(set.load)) || Number(set.load) < 0),
    )
  )
    return "Loads must be zero or positive.";
  if (
    completed.some(
      (set) =>
        set.rpe !== undefined &&
        set.rpe !== "" &&
        (!Number.isFinite(Number(set.rpe)) ||
          Number(set.rpe) < 0 ||
          Number(set.rpe) > 10),
    )
  )
    return "Set RPE must be between 0 and 10.";
  return null;
}
