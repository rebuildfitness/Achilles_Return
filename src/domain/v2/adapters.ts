import type {
  Value,
  RawRecord,
  ExerciseDefinition,
  Metrics,
  Quantity,
  SetPerformance,
  ExerciseOccurrence,
  WorkoutSession,
  ExposureObservation,
  EquipmentContext,
  WorkoutTemplate,
  IntentOccurrence,
} from "./contracts";

// Pure projections: no database, clock, random IDs, planner imports or input mutation.
const clone = <T>(value: T): T => structuredClone(value);
const obj = (value: unknown): RawRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as RawRecord)
    : {};
const array = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];
const strings = (value: unknown): string[] =>
  array(value).filter((v): v is string => typeof v === "string");
export const unknown = <T>(reason?: string): Value<T> => ({
  state: "unknown",
  ...(reason ? { reason } : {}),
});
export function value<T>(input: T | null | undefined): Value<T> {
  if (input == null) return unknown();
  if (input === "") return { state: "blank" };
  return { state: "known", value: clone(input) };
}
export function quantity(input: unknown, unit?: string): Quantity {
  const amount: Value<number> =
    input === ""
      ? { state: "blank" }
      : input == null
        ? unknown()
        : (typeof input === "number" || typeof input === "string") &&
            String(input).trim() !== "" &&
            Number.isFinite(Number(input))
          ? { state: "known", value: Number(input) }
          : unknown("Non-numeric legacy value retained in raw source");
  return { amount, unit: value(unit) };
}
/** Length-prefixed components prevent collisions from delimiters in user IDs. */
export function derivedId(...parts: (string | number)[]): string {
  return "v2:" + parts.map((p) => `${String(p).length}:${p}`).join("");
}
function requiredId(input: RawRecord): string {
  if (typeof input.id !== "string" || !input.id)
    throw new Error(
      "A stable source ID is required; no random replacement is generated.",
    );
  return input.id;
}
export function adaptDefinition(
  input: RawRecord,
  illustration?: RawRecord,
): ExerciseDefinition {
  const id = requiredId(input);
  const media: ExerciseDefinition["media"] = [];
  if (
    input.videoUrl ||
    input.demoUrl ||
    input.videoVerification ||
    input.demoVerification
  )
    media.push({
      kind: "demo",
      url:
        typeof (input.videoUrl ?? input.demoUrl) === "string"
          ? String(input.videoUrl ?? input.demoUrl)
          : undefined,
      verification:
        input.origin === "custom"
          ? { state: "known", value: "unverified-user-supplied" }
          : value(
              typeof input.videoVerification === "string"
                ? input.videoVerification
                : typeof input.verification === "string"
                  ? input.verification
                  : undefined,
            ),
      raw: clone(
        Object.fromEntries(
          Object.entries(input).filter(([k]) =>
            /video|demo|verif|previousSourceReview/i.test(k),
          ),
        ),
      ),
    });
  if (input.relatedDemo)
    media.push({
      kind: "related-demo",
      verification: unknown("Retain source verification details"),
      raw: clone(input.relatedDemo),
    });
  if (illustration)
    media.push({
      kind: "illustration",
      exerciseId: String(illustration.exerciseId ?? id),
      verification: value(
        typeof illustration.status === "string"
          ? illustration.status
          : undefined,
      ),
      raw: clone(illustration),
    });
  const unit = input.unit;
  const trackingTypes = [
    "weighted-reps",
    "reps",
    "time",
    "distance-time",
    "reps-time",
    "intervals",
    "free-form",
  ] as const;
  const tracking =
    trackingTypes.find((t) => t === input.trackingType) ??
    (unit === "seconds" ? "time" : unit === "reps" ? "reps" : undefined);
  // V1 yards establishes distance, not the additional time required by distance-time.
  const metricNames = [
    "reps",
    "load",
    "duration",
    "distance",
    "rest",
    "rpe",
    "steps",
    "contacts",
  ] as const;
  const explicitMetrics = metricNames.filter((m) =>
    strings(input.supportedMetrics).includes(m),
  );
  const sourceIds = [
    ...new Set([
      ...strings(input.evidenceSourceIds),
      ...strings(input.sourceIds),
    ]),
  ];
  const evidenceRaw = clone(
    Object.fromEntries(
      Object.entries(input).filter(([key]) =>
        /evidence|source|limitation/i.test(key),
      ),
    ),
  );
  return {
    id,
    aliases: strings(input.aliases),
    name: value(typeof input.name === "string" ? input.name : undefined),
    categories: strings(input.categories),
    bodyRegions: strings(input.bodyRegions),
    movementPatterns: strings(input.movementPatterns),
    physicalQualities: strings(input.physicalQualities),
    achillesPurpose: value(
      typeof input.achillesPurpose === "string"
        ? input.achillesPurpose
        : undefined,
    ),
    phaseAssociations: strings(
      input.phaseAvailability ?? input.phaseAssociations,
    ),
    demandLevel: value(input.demandLevel ?? input.loadTier),
    laterality: value(
      typeof input.laterality === "string" ? input.laterality : undefined,
    ),
    equipment: strings(input.equipment),
    setup: value(
      typeof (input.setup ?? input.cue) === "string"
        ? String(input.setup ?? input.cue)
        : undefined,
    ),
    trackingType: value(tracking),
    supportedMetrics: explicitMetrics.length
      ? explicitMetrics
      : unit === "seconds"
        ? ["duration"]
        : unit === "yards"
          ? ["distance"]
          : unit === "reps"
            ? ["reps"]
            : [],
    evidence: (sourceIds.length ? sourceIds : [undefined]).map((sourceId) => ({
      id: sourceId,
      url:
        typeof input.evidenceUrl === "string" ? input.evidenceUrl : undefined,
      strength:
        typeof input.evidenceStrength === "string"
          ? input.evidenceStrength
          : undefined,
      type:
        typeof input.evidenceType === "string" ? input.evidenceType : undefined,
      limitations: clone(input.limitations),
      raw: clone(evidenceRaw),
    })),
    media,
    provenance: {
      origin:
        input.origin === "custom"
          ? "custom"
          : input.origin === "researched"
            ? "researched"
            : "legacy",
      verification: unknown("Preserve original verification; no new review"),
      sourceIds,
      raw: clone(input),
    },
    sourceMetadata: clone(input),
  };
}
export function adaptEquipment(
  profile: RawRecord,
  today: RawRecord = {},
): EquipmentContext {
  return {
    owned: value(
      Array.isArray(profile.equipment) ? strings(profile.equipment) : undefined,
    ),
    availableToday: value(
      Array.isArray(today.availableEquipment)
        ? strings(today.availableEquipment)
        : undefined,
    ),
    preferred: value(
      Array.isArray(profile.preferredEquipment)
        ? strings(profile.preferredEquipment)
        : undefined,
    ),
    details: clone(obj(profile.equipmentDetails)),
  };
}
function targetMetrics(ex: RawRecord): Metrics {
  // V1 prescriptions are often ranges. Retain them as text, never guessed actuals.
  return { rest: quantity(ex.restSec, "s") };
}
function definitionSource(input: RawRecord): RawRecord {
  const execution = new Set([
    "sets",
    "reps",
    "rpe",
    "restSec",
    "block",
    "skipReason",
    "progressionTarget",
    "originalId",
    "selectionReason",
    "adjustment",
  ]);
  return Object.fromEntries(
    Object.entries(input).filter(([key]) => !execution.has(key)),
  );
}
function actualMetrics(
  set: RawRecord,
  ex: RawRecord,
  limits: string[],
): Metrics {
  const result: Metrics = {
    load: quantity(set.load, "lb"),
    loadConvention: unknown(
      "V1 numeric load does not establish setup/convention",
    ),
    loadConventionNote: value(
      typeof ex.loadConvention === "string" ? ex.loadConvention : undefined,
    ),
    rpe: quantity(set.rpe, "RPE"),
    quality: value(set.quality),
    symptoms: value(set.symptoms),
  };
  if (ex.unit === "seconds") result.duration = quantity(set.reps, "s");
  else if (ex.unit === "yards") result.distance = quantity(set.reps, "yd");
  else if (ex.unit === "reps") result.reps = quantity(set.reps, "count");
  else if (set.reps != null)
    limits.push(
      "Actual quantity has no captured unit; retained without guessing reps/time/distance.",
    );
  return result;
}
function occurrence(
  sessionId: string,
  id: string,
  index: number,
  ex: RawRecord | undefined,
  entry: RawRecord,
  lookup: Record<string, RawRecord>,
  limits: string[],
): ExerciseOccurrence {
  const occurrenceId = derivedId(sessionId, "exercise", id, index);
  const source = ex ?? lookup[id] ?? { id };
  if (!ex)
    limits.push(
      `Exercise ${id} lacks a captured definition; current reference is not historical evidence.`,
    );
  const sets = array(entry.sets).map((raw, i): SetPerformance => {
    const set = obj(raw);
    return {
      id: derivedId(occurrenceId, "set", i),
      order: i,
      type: unknown("V1 has no explicit set type"),
      target: targetMetrics(ex ?? {}),
      actual: actualMetrics(set, ex ?? {}, limits),
      disposition: set.complete === true ? "completed" : "unknown",
      intervals: [],
      feedbackProvenance: {
        inheritedFields: strings(set.inheritedFields),
        confirmed: value(
          typeof set.feedbackConfirmed === "boolean"
            ? set.feedbackConfirmed
            : undefined,
        ),
      },
      legacy: clone(raw),
    };
  });
  const completed = sets.filter((s) => s.disposition === "completed").length;
  return {
    id: occurrenceId,
    exerciseDefinitionId: id,
    order: index,
    block: value(typeof source.block === "string" ? source.block : undefined),
    definitionSnapshot: adaptDefinition(definitionSource({ ...source, id })),
    snapshotOrigin: ex
      ? "captured"
      : lookup[id]
        ? "current-reference"
        : "unknown",
    target: targetMetrics(ex ?? {}),
    targetDescription: value(
      typeof ex?.reps === "string" ? ex.reps : undefined,
    ),
    targetSetCount: typeof ex?.sets === "number" ? value(ex.sets) : unknown(),
    sets,
    disposition: ex?.skipReason
      ? "skipped"
      : completed > 0
        ? typeof ex?.sets === "number" && completed >= ex.sets
          ? "completed"
          : "partial"
        : "unknown",
    notes: value(
      typeof ex?.skipReason === "string" ? ex.skipReason : undefined,
    ),
    legacy: clone({ definition: ex, entry }),
  };
}
export function adaptExposure(input: RawRecord): ExposureObservation {
  const id = requiredId(input);
  return {
    id: derivedId(id, "exposure"),
    sessionId: id,
    domain: value(typeof input.domain === "string" ? input.domain : undefined),
    actual: {
      duration: quantity(input.minutes, "min"),
      distance: quantity(
        input.distance,
        typeof input.distanceUnit === "string" ? input.distanceUnit : undefined,
      ),
      contacts: quantity(input.contacts, "count"),
      rpe: quantity(input.sessionRPE, "RPE"),
    },
    observations: clone({
      minutes: input.minutes,
      distance: input.distance,
      contacts: input.contacts,
      intensity: input.intensity,
      drillDose: input.drillDose,
      drillsPerformed: input.drillsPerformed,
      immediateAchillesResponse: input.immediateAchillesResponse,
    }),
    interpretation: clone({
      progressionEligible: input.progressionEligible,
      reviewReasons: input.reviewReasons,
      readiness: input.readiness,
      status: input.status,
    }),
    storedQuality: value(input.movementQuality),
    reportedQuality: unknown(
      "V1 exposureQuality may have overwritten the original reported quality",
    ),
    provenance: {
      origin: "legacy",
      verification: unknown(),
      sourceIds: [],
      raw: clone(input),
    },
  };
}
export function adaptSession(
  input: RawRecord,
  lookup: Record<string, RawRecord> = {},
): WorkoutSession {
  const id = requiredId(input),
    limits: string[] = [];
  const items = array(input.plannedItems).map(obj),
    log = obj(input.exerciseLog);
  // V1 logs are keyed by definition ID, not occurrence. Never copy one log into two occurrences.
  const ids = [
    ...new Set([...items.map((e) => String(e.id)), ...Object.keys(log)]),
  ];
  if (items.length !== new Set(items.map((e) => e.id)).size)
    limits.push(
      "Duplicate V1 definition IDs share one log; original occurrence attribution is unknowable. Raw item order retained.",
    );
  const occurrences = ids.map((exerciseId, index) =>
    occurrence(
      id,
      exerciseId,
      index,
      items.find((e) => e.id === exerciseId),
      obj(log[exerciseId]),
      lookup,
      limits,
    ),
  );
  const responses = [
    {
      id: derivedId(id, "response"),
      sessionId: id,
      observations: value(input.nextDayResponse),
      interpretation: value(
        typeof input.status === "string" ? input.status : undefined,
      ),
      raw: clone({
        status: input.status,
        nextDayResponse: input.nextDayResponse,
      }),
    },
  ];
  if (!input.finishedAt)
    limits.push(
      "Legacy finish timestamp/lifecycle is not fully recorded; do not infer completion from tolerance.",
    );
  return {
    schemaVersion: 2,
    id,
    revision: typeof input.revision === "number" ? input.revision : 0,
    date: value(typeof input.date === "string" ? input.date : undefined),
    name: value(
      typeof input.workoutTitle === "string" ? input.workoutTitle : undefined,
    ),
    startedAt: value(
      typeof input.startedAt === "string" ? input.startedAt : undefined,
    ),
    finishedAt: value(
      typeof input.finishedAt === "string" ? input.finishedAt : undefined,
    ),
    lifecycle: input.finishedAt
      ? occurrences.some((o) => o.disposition !== "completed")
        ? "partial"
        : "completed"
      : "unknown",
    categories: [],
    occurrences,
    originalIntent: value(input.originalPlan),
    symptoms: [
      {
        id: derivedId(id, "symptoms"),
        sessionId: id,
        recordedAt: value(
          typeof input.createdAt === "string" ? input.createdAt : undefined,
        ),
        timing: "after",
        observations: clone({
          immediateAchillesResponse: input.immediateAchillesResponse,
        }),
        provenance: {
          origin: "legacy",
          verification: unknown(),
          sourceIds: [],
        },
      },
    ],
    responses,
    exposures: input.domain ? [adaptExposure(input)] : [],
    interpretations: clone({
      readiness: input.readiness,
      status: input.status,
      blockProgression: input.blockProgression,
      rulesetVersion: input.rulesetVersion,
    }),
    correctionLineage: clone(array(input.correctionHistory)),
    guidanceDecisions: [],
    overrides: [],
    legacy: {
      source: "session",
      raw: clone(input),
      limitations: [...new Set(limits)],
    },
  };
}
export function adaptMovement(input: RawRecord): WorkoutSession {
  const session = adaptSession({
    id: requiredId(input),
    date: input.date,
    createdAt: input.createdAt,
    revision: input.revision,
  });
  const q = obj(input.quantity);
  session.name = value(
    typeof input.activityType === "string" ? input.activityType : undefined,
  );
  const routine = obj(input.routineInstance);
  session.occurrences = array(routine.exerciseCompletions).map((raw, index) => {
    const completion = obj(raw),
      actual = obj(completion.actual);
    const exerciseId = String(
      completion.substitutionExerciseId ?? completion.exerciseId ?? "unknown",
    );
    const o = occurrence(session.id, exerciseId, index, undefined, {}, {}, []);
    o.id = derivedId(session.id, "routine", String(completion.id ?? index));
    o.disposition =
      completion.status === "completed"
        ? "completed"
        : completion.status === "skipped"
          ? "skipped"
          : "unknown";
    o.aggregateActual = {
      duration: quantity(actual.durationSeconds, "s"),
      reps: quantity(actual.repsPerSide, "per-side-count"),
      distance: quantity(
        actual.distance,
        typeof actual.distanceUnit === "string"
          ? actual.distanceUnit
          : undefined,
      ),
    };
    o.notes = value(
      typeof completion.notes === "string" ? completion.notes : undefined,
    );
    o.legacy = clone(raw);
    return o;
  });
  session.exposures = [
    {
      id: derivedId(session.id, "activity"),
      sessionId: session.id,
      domain: value(
        typeof input.activityType === "string" ? input.activityType : undefined,
      ),
      actual: {
        duration: quantity(q.durationMinutes, "min"),
        distance: quantity(
          q.distance,
          typeof q.distanceUnit === "string" ? q.distanceUnit : undefined,
        ),
        steps: quantity(q.steps, "count"),
      },
      observations: clone({
        quantity: input.quantity,
        symptoms: input.symptoms,
      }),
      interpretation: {},
      storedQuality: unknown(),
      reportedQuality: unknown(),
      provenance: {
        origin: "legacy",
        verification: unknown(),
        sourceIds: [],
        raw: clone(input),
      },
    },
  ];
  session.symptoms = [
    {
      id: derivedId(session.id, "symptoms"),
      sessionId: session.id,
      recordedAt: value(
        typeof input.createdAt === "string" ? input.createdAt : undefined,
      ),
      timing: "unknown",
      observations: clone(obj(input.symptoms)),
      provenance: { origin: "legacy", verification: unknown(), sourceIds: [] },
    },
  ];
  // Routine actuals are aggregates: do not fabricate individual completed sets.
  session.interpretations = { movementStatus: clone(input.status) };
  session.correctionLineage = clone(array(input.history));
  session.legacy = {
    source: "movement",
    raw: clone(input),
    limitations: [
      "Movement routine quantities are aggregateActual, not fabricated individual sets; raw retains all routine snapshots and completion metadata.",
    ],
  };
  return session;
}
export function adaptRecovery(input: RawRecord): WorkoutSession {
  const session = adaptMovement(input);
  session.legacy = {
    source: "recovery",
    raw: clone(input),
    limitations: [
      "Legacy activity labels and entries preserved without assuming units or doses from label text.",
    ],
  };
  return session;
}
/** Whitelist intent fields; never copy session legacy envelopes, symptoms or actuals. */
export function copyIntent(
  session: WorkoutSession,
  templateId: string,
  name: string,
): WorkoutTemplate {
  const targets = (m: Metrics): Metrics => {
    const { symptoms, quality, ...safe } = m;
    return clone(safe);
  };
  const occurrences: IntentOccurrence[] = session.occurrences.map((o, i) => ({
    id: derivedId(templateId, "occurrence", i),
    exerciseDefinitionId: o.exerciseDefinitionId,
    order: i,
    block: clone(o.block),
    definitionSnapshot: clone(o.definitionSnapshot),
    target: targets(o.target),
    targetDescription: clone(o.targetDescription),
    targetSetCount: clone(o.targetSetCount),
    sets: Array.from(
      {
        length:
          o.targetSetCount.state === "known" &&
          Number.isInteger(o.targetSetCount.value) &&
          o.targetSetCount.value >= 0
            ? o.targetSetCount.value
            : o.sets.length,
      },
      (_, j) =>
        o.sets[j] ?? { type: unknown(), target: o.target, intervals: [] },
    ).map((s, j) => ({
      id: derivedId(templateId, i, "set", j),
      order: j,
      type: clone(s.type),
      target: targets(s.target),
      intervals: s.intervals.map((b, k) => ({
        id: derivedId(templateId, i, j, "bout", k),
        order: k,
        kind: b.kind,
        target: targets(b.target),
      })),
    })),
  }));
  return {
    id: templateId,
    revision: 1,
    name,
    categories: clone(session.categories),
    occurrences,
    source: "user",
  };
}

/** Recover the exact source payload, including unknown fields and original revisions. */
export function recoverLegacy(session: WorkoutSession): unknown {
  if (!session.legacy) throw new Error("This is not an adapted legacy record.");
  return clone(session.legacy.raw);
}
