import { addConfirmedEquipment } from "../data/equipmentUpdate.js";
import { get, getAll, put, writeRecords } from "../db.js";
import { VERSIONS } from "./schema.js";
import { baselineResult } from "../rules/baseline.js";
import { classifyTolerance } from "../rules/response.js";
import { EQUIPMENT, DEFAULT_EQUIPMENT } from "../data/catalog.js";
import type { Assessment, Profile, Values } from "../types";
import { readinessAudit } from "../rules/audit.js";
import type {
  Answers,
  CheckIn,
  Readiness,
  Session,
  WorkoutLog,
} from "../types";
export const loadSessions = async () => (await getAll("sessions")) as Session[];
export const loadCheckIn = async (date: string) =>
  (await get("checkins", date)) as CheckIn | undefined;
export const loadDraft = async (date: string) =>
  ((await get("settings", `draft-${date}`)) as { log: WorkoutLog } | undefined)
    ?.log || {};
export const saveDraft = (date: string, log: WorkoutLog) =>
  put("settings", { id: `draft-${date}`, log });
export async function saveCheckIn(
  date: string,
  answers: Answers,
  readiness: Readiness,
) {
  const audit = readinessAudit(date, answers, readiness, crypto.randomUUID());
  const records: { store: string; value: object }[] = [
    {
      store: "checkins",
      value: {
        id: date,
        date,
        createdAt: new Date().toISOString(),
        answers,
        readiness,
        rulesetVersion: VERSIONS.rulesetVersion,
        decisionId: audit.id,
      },
    },
    { store: "decisions", value: audit },
  ];
  await writeRecords(records);
}
export const saveSession = (session: Session) =>
  writeRecords([
    {
      store: "sessions",
      value: { ...session, rulesetVersion: VERSIONS.rulesetVersion },
    },
    { store: "settings", value: { id: `draft-${session.date}`, log: {} } },
    ...(session.workoutTimer ? [{ store: "settings", value: session.workoutTimer }] : []),
  ]);
export async function loadProgram() {
  const [all, draft, profile, checkpoints, welcome] = await Promise.all([
    getAll("assessments"),
    get("settings", "baseline-draft"),
    get("profile", "athlete"),
    get("capabilityStates", "checkpoints"),
    get("settings", "onboarding"),
  ]);
  const updatedProfile = addConfirmedEquipment(profile);
  if (updatedProfile !== profile) await put("profile", updatedProfile);
  const assessments = (all as Assessment[])
    .filter((a) => a.completedAt && a.values)
    .sort((a, b) => b.completedAt!.localeCompare(a.completedAt!));
  return {
    assessments,
    assessment: assessments[0] as Assessment | undefined,
    draft: draft as Assessment | undefined,
    profile: updatedProfile as Profile | undefined,
    checkpoints: (checkpoints as { values: Values } | undefined)?.values || {},
    welcomed: !!(welcome as { done: boolean } | undefined)?.done,
  };
}
export const saveBaselineDraft = (values: Values, step: number) =>
  put("settings", {
    id: "baseline-draft",
    values,
    step,
    updatedAt: new Date().toISOString(),
  });
export async function completeBaseline(values: Values) {
  const now = new Date().toISOString(),
    id = crypto.randomUUID(),
    result = baselineResult(values);
  const profile = (await get("profile", "athlete")) as Profile | undefined;
  await writeRecords([
    {
      store: "assessments",
      value: {
        id,
        values,
        step: 0,
        completedAt: now,
        updatedAt: now,
        result,
        rulesetVersion: VERSIONS.rulesetVersion,
      },
    },
    {
      store: "profile",
      value: {
        ...profile,
        id: "athlete",
        equipment: profile?.equipment || DEFAULT_EQUIPMENT,
        availableDays: values.availableDays,
        surgeryDate: values.surgeryDate,
      },
    },
    {
      store: "settings",
      value: { id: "baseline-draft", values: {}, step: 0, updatedAt: now },
    },
    {
      store: "capabilityStates",
      value: { id: "baseline", assessmentId: id, result, updatedAt: now },
    },
    // Qualitative reviews belong to the previous assessment; never silently carry a clearance forward.
    {
      store: "capabilityStates",
      value: {
        id: "checkpoints",
        values: result.phase === "Safety Hold" ? {} : { safetyReviewedAt: now },
        updatedAt: now,
      },
    },
    {
      store: "decisions",
      value: {
        id: crypto.randomUUID(),
        assessmentId: id,
        inputs: values,
        ...result,
        createdAt: now,
      },
    },
  ]);
}
export async function saveCheckpoint(values: Values) {
  const now = new Date().toISOString();
  await writeRecords([
    {
      store: "capabilityStates",
      value: { id: "checkpoints", values, updatedAt: now },
    },
    {
      store: "decisions",
      value: {
        id: crypto.randomUUID(),
        ruleId: "capacity.documented-review.v1",
        rulesetVersion: VERSIONS.rulesetVersion,
        inputs: values,
        createdAt: now,
      },
    },
  ]);
}
export async function saveResponse(
  session: Session,
  response: Values,
  today: string,
) {
  if (session.date >= today)
    throw new Error(
      "Record the response the following morning, not on the workout date.",
    );
  const status = classifyTolerance(response),
    now = new Date().toISOString();
  if (status === "PENDING_NEXT_DAY_RESPONSE")
    throw new Error("Complete the next-morning response.");
  await writeRecords([
    {
      store: "sessions",
      value: {
        ...session,
        status,
        nextDayResponse: response,
        closedAt: now,
        toleranceRulesetVersion: VERSIONS.rulesetVersion,
      },
    },
    {
      store: "decisions",
      value: {
        id: crypto.randomUUID(),
        sessionId: session.id,
        ruleId: "tolerance.next-morning.v1",
        rulesetVersion: VERSIONS.rulesetVersion,
        inputs: response,
        result: status,
        createdAt: now,
      },
    },
  ]);
}
