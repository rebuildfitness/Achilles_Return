export const MOVEMENT_TYPES = Object.freeze({
  walk: "Walk",
  cycle: "Cycle",
  mobility: "Mobility",
  core_stability: "Core & stability",
  balance_movement_control: "Balance & control",
  recovery_practice: "Recovery practice",
  other: "Other activity",
});
export const MOVEMENT_SCHEMA = 1;
export function movementRecords(settings) {
  const map = new Map(
    settings
      .filter(
        (r) => r.movementRecordSchemaVersion === 1 && r.kind === "activity",
      )
      .map((r) => [r.id, r]),
  );
  for (const row of settings.filter((r) =>
    String(r.id).startsWith("recovery-"),
  )) {
    for (const [index, entry] of (row.entries || []).entries()) {
      const id = `movement-legacy-${row.date || row.id.slice(9)}-${entry.id || index}`;
      if (map.has(id)) continue;
      const [prefix, number] = String(entry.activity).split("-");
      const type =
        prefix === "walk"
          ? "walk"
          : prefix === "cycle"
            ? "cycle"
            : entry.activity === "mobility"
              ? "mobility"
              : "other";
      map.set(id, {
        id,
        kind: "activity",
        movementRecordSchemaVersion: 1,
        date: row.date || row.id.slice(9),
        status: "saved",
        revision: 1,
        activityType: type,
        cycleType: type === "cycle" ? "indoor" : undefined,
        quantity: {
          steps: type === "walk" ? Number(number) : null,
          durationMinutes: type === "cycle" ? Number(number) : null,
          distance:
            entry.distance === "" || entry.distance == null
              ? null
              : Number(entry.distance),
          distanceUnit: entry.unit === "miles" ? "mi" : entry.unit || "mi",
        },
        notes: entry.notes || "",
        legacyLabel: entry.activity,
        legacyExerciseIds: entry.mobility || [],
        tags: ["legacy"],
        createdAt: entry.createdAt,
        updatedAt: entry.createdAt,
        legacy: true,
      });
    }
  }
  return [...map.values()];
}
export function validateMovement(r) {
  if (!r || typeof r !== "object") throw new Error("Invalid movement record.");
  if (
    r.movementRecordSchemaVersion !== 1 ||
    r.kind !== "activity" ||
    typeof r.id !== "string" ||
    !r.id.startsWith("movement-")
  )
    throw new Error("Unsupported movement record.");
  if (
    !Object.hasOwn(MOVEMENT_TYPES, r.activityType) ||
    !["draft", "saved", "voided"].includes(r.status)
  )
    throw new Error("Invalid movement type or state.");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(r.date || "") ||
    !Number.isFinite(Date.parse(r.date + "T12:00:00Z")) ||
    new Date(r.date + "T12:00:00Z").toISOString().slice(0, 10) !== r.date
  )
    throw new Error("Choose a valid activity date.");
  if (!Number.isInteger(r.revision) || r.revision < 1)
    throw new Error("Invalid movement revision.");
  if (
    r.quantity != null &&
    (typeof r.quantity !== "object" || Array.isArray(r.quantity))
  )
    throw new Error("Invalid movement amounts.");
  const numbers = [
    r.quantity?.steps,
    r.quantity?.durationMinutes,
    r.quantity?.distance,
    r.symptoms?.painDuring,
    r.symptoms?.painAfter,
  ];
  for (const n of numbers)
    if (n != null && (typeof n !== "number" || !Number.isFinite(n) || n < 0))
      throw new Error("Amounts must be valid non-negative numbers.");
  if (r.quantity?.steps != null && !Number.isInteger(r.quantity.steps))
    throw new Error("Steps must be a whole number.");
  if (
    [r.symptoms?.painDuring, r.symptoms?.painAfter].some(
      (n) => n != null && n > 10,
    )
  )
    throw new Error("Pain must be between 0 and 10.");
  if (
    r.quantity?.distanceUnit &&
    !["mi", "km"].includes(r.quantity.distanceUnit)
  )
    throw new Error("Choose miles or kilometers.");
  if (
    r.activityType === "cycle" &&
    !["indoor", "outdoor"].includes(r.cycleType)
  )
    throw new Error("Choose indoor or outdoor cycling.");
  if (r.status === "saved") {
    if (
      r.activityType === "walk" &&
      !(
        r.quantity?.steps > 0 ||
        r.quantity?.durationMinutes > 0 ||
        r.quantity?.distance > 0
      )
    )
      throw new Error("Record steps, duration or distance for your walk.");
    if (r.activityType === "cycle" && !(r.quantity?.durationMinutes > 0))
      throw new Error("Record your cycling duration.");
    if (
      !["walk", "cycle"].includes(r.activityType) &&
      !r.routineInstance &&
      !String(r.name || r.notes || r.legacyLabel || "").trim()
    )
      throw new Error("Describe the activity you completed.");
  }
  if (r.routineInstance) {
    const instance = r.routineInstance;
    if (
      !instance.routineVersion ||
      !instance.definitionSnapshot ||
      !Array.isArray(instance.exerciseCompletions)
    )
      throw new Error("Routine history is incomplete.");
    if (
      !Array.isArray(instance.definitionSnapshot.steps) ||
      instance.definitionSnapshot.steps.length !==
        instance.exerciseCompletions.length ||
      new Set(instance.exerciseCompletions.map((s) => s?.id)).size !==
        instance.exerciseCompletions.length
    )
      throw new Error("Routine steps do not match their history.");
    for (const step of instance.exerciseCompletions) {
      if (
        !step ||
        !step.id ||
        !step.exerciseId ||
        !["pending", "completed", "skipped"].includes(step.status)
      )
        throw new Error("Invalid routine step.");
      for (const value of Object.values(step.actual || {}))
        if (
          value != null &&
          (typeof value !== "number" || !Number.isFinite(value) || value < 0)
        )
          throw new Error("Enter valid actual exercise amounts.");
    }
    if (
      r.status === "saved" &&
      !instance.exerciseCompletions.some((s) => s.status === "completed")
    )
      throw new Error(
        "Complete at least one exercise before saving a routine.",
      );
  }
  return r;
}
export function movementTotals(records) {
  const saved = [
    ...new Map(
      records.filter((r) => r.status === "saved").map((r) => [r.id, r]),
    ).values(),
  ];
  return {
    count: saved.length,
    steps: saved
      .filter((r) => r.activityType === "walk")
      .reduce((n, r) => n + (r.quantity?.steps || 0), 0),
    cycleMinutes: saved
      .filter((r) => r.activityType === "cycle")
      .reduce((n, r) => n + (r.quantity?.durationMinutes || 0), 0),
    cycleKm: saved
      .filter((r) => r.activityType === "cycle")
      .reduce(
        (n, r) =>
          n +
          (r.quantity?.distance || 0) *
            (r.quantity?.distanceUnit === "mi" ? 1.609344 : 1),
        0,
      ),
    categories: Object.fromEntries(
      Object.keys(MOVEMENT_TYPES).map((type) => [
        type,
        saved.filter((r) => r.activityType === type).length,
      ]),
    ),
  };
}
export function movementTitle(r) {
  return (
    r.routineInstance?.definitionSnapshot?.name ||
    r.name ||
    MOVEMENT_TYPES[r.activityType] ||
    "Activity"
  );
}
export function movementAmount(r) {
  if (r.routineInstance)
    return `${r.routineInstance.exerciseCompletions.filter((s) => s.status === "completed").length} of ${r.routineInstance.exerciseCompletions.length} exercises`;
  return [
    r.quantity?.steps != null
      ? `${r.quantity.steps.toLocaleString()} steps`
      : "",
    r.quantity?.durationMinutes != null
      ? `${r.quantity.durationMinutes} min`
      : "",
    r.quantity?.distance != null
      ? `${r.quantity.distance} ${r.quantity.distanceUnit === "mi" ? "miles" : "km"}`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
// Context only: movement does not supply evidence to the clinical engines in v1.
export function movementResponse(record, sessions) {
  const linked = sessions.find((s) => s.id === record.linkedSessionId);
  return linked
    ? {
        status: linked.status,
        source: "linked_session",
        progressionCredit: false,
      }
    : {
        status: "not_applicable",
        source: "movement",
        progressionCredit: false,
      };
}
