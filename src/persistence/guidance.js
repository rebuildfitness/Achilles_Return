import { getDb } from "../db.js";
import { atomicV2 } from "./v2Repository.js";
import { validateV2, equal } from "./v2Validation.js";
import {
  evaluateGuidance,
  isCurrentGuidance,
  subjectIntent,
  GUIDANCE_VERSION,
  legacyPrescription,
} from "../domain/v2/guidance.js";
import { compose, clone, uid } from "../domain/v2/composition.js";
import { sessionCommand } from "../domain/v2/execution.js";
import { DEFINITIONS } from "../domain/v2/compositionContent.js";
const inputStores = [
  "profile",
  "checkins",
  "assessments",
  "capabilityStates",
  "sessions",
  "v2WorkoutSessions",
  "v2Observations",
  "v2PlannedWorkouts",
];
// One read transaction captures the inputs coherently. Does not invoke loadProgram,
// which performs V1 profile migration as a side effect.
export async function guidanceContext(subject, date) {
  const db = await getDb();
  const rows = await new Promise((resolve, reject) => {
    const result = {},
      tx = db.transaction(inputStores, "readonly");
    for (const store of inputStores) {
      const q = tx.objectStore(store).getAll();
      q.onsuccess = () => {
        result[store] = q.result;
      };
    }
    tx.oncomplete = () => resolve(result);
    tx.onabort = () => reject(tx.error);
  });
  for (const store of ["v2WorkoutSessions", "v2Observations"])
    rows[store].forEach((r) => validateV2(store, r));
  const assessment = rows.assessments
    .filter(
      (a) => a.completedAt && a.values && a.completedAt.slice(0, 10) <= date,
    )
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
    .at(-1);
  const profile = rows.profile.find((p) => p.id === "athlete");
  const materialized = new Set(
    rows.v2WorkoutSessions.map((s) => s.legacyOrigin?.id),
  );
  const previousSessions = [
    ...rows.sessions.filter((s) => !materialized.has(s.id) && s.date <= date),
    ...rows.v2WorkoutSessions.filter(
      (s) => s.id !== subject.id && s.date?.value <= date,
    ),
  ];
  const context = {
    date,
    assessment: assessment || null,
    checkIn: rows.checkins.find((c) => c.id === date) || null,
    checkpoints:
      rows.capabilityStates.find((c) => c.id === "checkpoints") || {},
    previousSessions,
    plannedWorkouts: rows.v2PlannedWorkouts.filter(p=>p.planning && !p.planning.archived && p.status === "planned" && p.id !== subject.id),
    observations: rows.v2Observations,
    equipment: {
      owned: profile?.equipment || null,
      availableToday: null,
      preferred: null,
    },
    inputIds: [
      ...(assessment ? [assessment.id] : []),
      ...previousSessions.map((s) => s.id),
      ...rows.v2Observations.map((o) => o.id),
    ],
  };
  const items = subjectIntent(subject).occurrences;
  // Curated rehab provenance must be explicit; arbitrary mixed workouts are not
  // relabeled as that program. Projection uses current explicit targets; ambiguous doses remain unknown.
  const program =
    subject.snapshot?.curatedProgram ||
    subject.originalIntent?.value?.curatedProgram;
  if (program?.sessionFormat === "rehab-conditioning")
    context.rehabWorkout = {
      ...program,
      progressionAllowed: true,
      availableEquipment: profile?.equipment || [],
      items: items.map((o) => ({
        ...legacyPrescription(o),
        block: o.block?.value,
      })),
    };
  return {
    context,
    guards: inputStores.map((store) => ({ store, value: rows[store] })),
  };
}
const storeFor = (s) =>
  s.execution ? "v2WorkoutSessions" : "v2PlannedWorkouts";
export async function analyzeGuidance(
  subject,
  date,
  at = new Date().toISOString(),
) {
  const captured = await guidanceContext(subject, date);
  const events = evaluateGuidance(subject, captured.context, at);
  // Existing identical findings keep their original timestamp and decisions.
  const db = await getDb();
  const existing = await new Promise((resolve, reject) => {
    const tx = db.transaction("v2GuidanceEvents"),
      q = tx.objectStore("v2GuidanceEvents").getAll();
    tx.oncomplete = () => resolve(q.result);
    tx.onabort = () => reject(tx.error);
  });
  const resolved = events.map((e) => {
    const old = existing.find((x) => x.id === e.id);
    if (
      old &&
      (!equal(old.inputs, e.inputs) || old.contextKey !== e.contextKey)
    )
      throw Error("Guidance identity conflict");
    return old || e;
  });
  await atomicV2(
    resolved.map((record) => ({
      store: "v2GuidanceEvents",
      record,
      expectedRevision: null,
    })),
    {
      guards: [
        ...captured.guards,
        { store: storeFor(subject), id: subject.id, value: subject },
      ],
    },
  );
  return { events: resolved, ...captured };
}
export function proposalEdit(
  subject,
  event,
  choice,
  at = new Date().toISOString(),
) {
  const proposal = event.proposal;
  if (!proposal) throw Error("No proposed modification");
  const o = subjectIntent(subject).occurrences.find(
    (o) => o.id === proposal.targetId,
  );
  if (!o) throw Error("Proposal occurrence no longer exists");
  let command;
  if (proposal.kind === "replace") {
    const definition = DEFINITIONS.find((d) => d.id === proposal.definitionId);
    if (!definition) throw Error("Proposed definition unavailable");
    command = { type: "replace", id: o.id, definition };
  } else if (proposal.kind === "edit-target") {
    const set = o.sets.find((s) => s.id === choice?.setId);
    if (!set || !Number.isFinite(choice.amount) || choice.amount < 0)
      throw Error(
        "Select an upcoming set and enter an explicit nonnegative target",
      );
    const previous = set.target[proposal.metric];
    if (
      previous?.unit?.state !== "known" ||
      (proposal.metric === "load" &&
        set.target.loadConvention?.state !== "known")
    )
      throw Error(
        "Set explicit units and load convention in the target editor first",
      );
    const patch = {
      target: {
        ...clone(set.target),
        [proposal.metric]: {
          ...clone(previous),
          amount: { state: "known", value: choice.amount },
        },
      },
    };
    command = subject.execution
      ? { type: "target", id: o.id, setId: set.id, patch }
      : { type: "set", id: o.id, setId: set.id, patch };
  } else
    throw Error(
      "This proposal needs manual workout editing; no automatic prescription is provided",
    );
  const next = subject.execution
    ? sessionCommand(subject, command, at)
    : { ...clone(subject), snapshot: compose(subject.snapshot, command) };
  const audit = {
    id: uid(),
    type: "guidance-applied",
    at,
    guidanceId: event.id,
    subjectRevision: subject.revision,
    command: clone(command),
  };
  if (next.execution) next.execution.audit.push(audit);
  else
    next.composition = {
      ...next.composition,
      audit: [...(next.composition.audit || []), audit],
    };
  return { ...next, revision: subject.revision + 1 };
}
/** @param {any} subject @param {any} event @param {string} action @param {any} captured @param {any} choice */
export async function decideGuidance(
  subject,
  event,
  action,
  captured,
  choice = null,
  at = new Date().toISOString(),
) {
  if (!isCurrentGuidance(event, subject, captured.context))
    throw Error("Guidance is stale; analyze the saved workout again");
  const decision = {
    id: uid(),
    adapterVersion: GUIDANCE_VERSION,
    recordVersion: 1,
    revision: 1,
    guidanceId: event.id,
    subjectId: subject.id,
    subjectRevision: subject.revision,
    action,
    at,
  };
  const next =
    action === "accepted" ? proposalEdit(subject, event, choice, at) : null;
  if (next) decision.resultingRevision = next.revision;
  await atomicV2(
    [
      {
        store: "v2GuidanceDecisions",
        record: decision,
        expectedRevision: null,
      },
      ...(next
        ? [
            {
              store: storeFor(next),
              record: next,
              expectedRevision: subject.revision,
            },
          ]
        : []),
    ],
    {
      guards: [
        ...captured.guards,
        { store: storeFor(subject), id: subject.id, value: subject },
        { store: "v2GuidanceEvents", id: event.id, value: event },
      ],
    },
  );
  return { decision, subject: next || subject };
}
