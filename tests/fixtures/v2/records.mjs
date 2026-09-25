import { nativeSession } from "./native.ts";
// All IDs/dates/quantities are fabricated for preservation tests, not user data.
const clone = structuredClone;
const ex = (id, unit = "reps") => ({
  id,
  name: `Synthetic ${id}`,
  unit,
  sets: 2,
  reps: "8–12",
  restSec: 60,
  equipment: ["dumbbells"],
  videoUrl: "https://example.invalid/demo",
  videoSource: "Synthetic",
  videoVerifiedAt: "fixture",
  videoVerification: "Unverified fixture",
  evidenceSourceIds: ["synthetic-source"],
  evidenceStrength: "Unknown",
  evidenceType: "Fixture",
  limitations: ["Not clinical advice"],
});
const base = (id = "normal") => ({
  id,
  date: "2026-09-01",
  createdAt: "2026-09-01T10:00:00Z",
  finishedAt: "2026-09-01T10:30:00Z",
  workoutTitle: "Synthetic strength",
  status: "PENDING_NEXT_DAY_RESPONSE",
  plannedItems: [ex("press")],
  exerciseLog: {
    press: {
      sets: [
        {
          load: "0",
          reps: "8",
          complete: true,
          rpe: "6",
          quality: "good",
          symptoms: "none",
        },
        { load: "", reps: "", complete: false },
      ],
    },
  },
});
export const legacy = {
  normal: base(),
  rehab: { ...base("rehab"), sessionFormat: "rehab-conditioning" },
  timed: {
    ...base("timed"),
    plannedItems: [ex("hold", "seconds")],
    exerciseLog: { hold: { sets: [{ reps: "30", complete: true }] } },
  },
  distance: {
    ...base("distance"),
    plannedItems: [ex("carry", "yards")],
    exerciseLog: {
      carry: { sets: [{ reps: "20", load: "10", complete: true }] },
    },
  },
  exposure: {
    id: "exposure",
    date: "2026-09-01",
    domain: "running",
    minutes: "10",
    distance: "1",
    distanceUnit: "mi",
    movementQuality: "reduced",
    progressionEligible: false,
    reviewReasons: ["Synthetic derived concern"],
    status: "PENDING_NEXT_DAY_RESPONSE",
    exerciseLog: {},
  },
  corrected: {
    ...base("corrected"),
    revision: 2,
    updatedAt: "2026-09-02T10:00:00Z",
    correctionHistory: [
      {
        at: "2026-09-02T10:00:00Z",
        reason: "Synthetic correction",
        original: base("corrected"),
      },
    ],
    nextDayResponse: { change: "baseline" },
  },
  pending: base("pending"),
  swapped: {
    ...base("swapped"),
    plannedItems: [{ ...ex("press"), skipReason: "unavailable" }, ex("row")],
    exerciseLog: {
      press: { sets: [{ reps: "8", load: "5", complete: true }] },
      row: { sets: [{ reps: "6", load: "12", complete: true }] },
    },
    exerciseChanges: [
      {
        fromName: "press",
        toName: "row",
        reason: "equipment",
        scope: "session",
      },
    ],
  },
  repeated: {
    ...base("repeated"),
    plannedItems: [ex("press"), ex("press")],
    exerciseLog: { press: { sets: [{ reps: "8", complete: true }] } },
  },
  repeatedRehab: {
    ...base("repeated-rehab"),
    plannedItems: [
      ex("rehab-toe-walk", "seconds"),
      {
        ...ex("rehab-toe-walk-c", "seconds"),
        illustrationId: "rehab-toe-walk",
      },
    ],
    exerciseLog: {
      "rehab-toe-walk": { sets: [{ reps: "20", complete: true }] },
      "rehab-toe-walk-c": { sets: [{ reps: "15", complete: true }] },
    },
  },
  wagon: {
    ...base("wagon"),
    plannedItems: [
      {
        ...ex("weighted-wagon-backward-drag", "yards"),
        equipment: ["weighted-wagon"],
        loadConvention: "Cargo added to utility wagon",
      },
    ],
    exerciseLog: {
      "weighted-wagon-backward-drag": {
        sets: [{ load: "20", reps: "10", complete: true }],
      },
    },
  },
  missingSnapshot: { ...base("missing-snapshot"), plannedItems: undefined },
  unknown: {
    ...base("unknown"),
    finishedAt: undefined,
    plannedItems: [{ id: "press", name: "Incomplete historical definition" }],
    mystery: { nested: ["preserve", null, 0] },
    exerciseLog: {
      press: { sets: [{ reps: "12", load: null, quality: undefined }] },
    },
  },
  movement: {
    id: "movement-fixture",
    date: "2026-09-01",
    kind: "activity",
    movementRecordSchemaVersion: 1,
    status: "saved",
    revision: 1,
    activityType: "cycle",
    quantity: { durationMinutes: 15, distance: 0, distanceUnit: "mi" },
    symptoms: { painDuring: 0, painAfter: null },
    history: [{ reason: "Synthetic correction" }],
  },
  routine: {
    id: "movement-routine",
    date: "2026-09-01",
    activityType: "mobility",
    status: "saved",
    routineInstance: {
      id: "routine-1",
      definitionSnapshot: { name: "Fixture" },
      originalDefinitionSnapshot: { name: "Fixture" },
      exerciseCompletions: [
        {
          id: "completion-1",
          exerciseId: "balance",
          status: "completed",
          actual: { sets: 2, durationSeconds: 20, repsPerSide: null },
        },
      ],
    },
  },
  recovery: {
    id: "recovery-2026-09-01",
    date: "2026-09-01",
    entries: [
      { id: "a", activity: "walk-5000", distance: "", notes: "Synthetic" },
    ],
  },
};
export const native = {
  repeated: nativeSession(),
  warmupWorking: nativeSession(),
  leftRight: nativeSession(),
  tempo: nativeSession(),
  distanceTime: nativeSession(),
  interval: nativeSession(),
  partial: nativeSession(),
  skipped: nativeSession(),
  abandoned: nativeSession(),
};
native.distanceTime.occurrences[0].sets[0].actual = {
  distance: {
    amount: { state: "known", value: 1 },
    unit: { state: "known", value: "km" },
  },
  duration: {
    amount: { state: "known", value: 600 },
    unit: { state: "known", value: "s" },
  },
};
native.interval.occurrences[0].sets[0].intervals = [
  "work",
  "recovery",
  "work",
].map((kind, i) => ({
  id: `bout-${i}`,
  order: i,
  kind,
  target: {
    duration: {
      amount: { state: "known", value: 30 },
      unit: { state: "known", value: "s" },
    },
  },
  actual: {
    duration: {
      amount: { state: "known", value: 25 },
      unit: { state: "known", value: "s" },
    },
  },
  disposition: "completed",
}));
native.partial.lifecycle = "partial";
native.partial.occurrences[0].sets[1].disposition = "skipped";
native.skipped.occurrences[0].disposition = "skipped";
native.skipped.occurrences[0].sets = [];
native.abandoned.lifecycle = "abandoned";
native.abandoned.occurrences = [];
export const freshLegacy = (key) => clone(legacy[key]);

native.repeated.occurrences[1].sets[0].type = {
  state: "known",
  value: "rehab",
};
native.repeated.occurrences[1].sets[0].actual.side = {
  state: "known",
  value: "bilateral",
};
