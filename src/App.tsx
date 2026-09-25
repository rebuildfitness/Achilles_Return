import { SessionReview } from "./components/SessionReview";
import { sessionItemsForDisplay, REHAB_SESSION_OPTIONS_VERSION } from "./data/sessionPresentation.js";
import { exercisePath } from "./rules/exercisePaths.js";
import { automaticPlanSnapshot } from "./rules/automaticPlan.js";
import { saveAutomaticPlanAudit } from "./persistence/automaticPlan.js";
import { SessionRefresh } from "./components/SessionEditor";
import { CoachingReview } from "./components/CoachingReview";
import { carryFeedback, editFeedback, timerKey, timerTransition } from "./data/workoutExperience.js";
import { useEffect, useRef, useState } from "react";
import { AppShell, Card } from "./components/ui";
import { RehabPreview } from "./screens/RehabPreview";
import { Today } from "./screens/Today";
import { MovementScreen } from "./screens/Movement";
import { applySessionChanges, emptySessionChanges, recordSessionChange, sessionItems } from "./rules/sessionChanges.js";
import { EQUIPMENT, DEFAULT_EQUIPMENT } from "./data/catalog.js";
import { swapExercise, addDays } from "./rules/trainingFlexibility.js";
import { weeklyPlan, strengthTemplate, modifyWorkout } from "./rules/planner.js";
import { baselineResult } from "./rules/baseline.js";
import {
  exposureDecision,
  exposureScheduling,
  exposureReentry,
} from "./rules/progression.js";
import { exposureContent, exposureQuality, validateExposureLog } from "./data/exposures.js";
import { validateWorkoutLog } from "./rules/response.js";
import { classifyReadiness } from "./rules/readiness.js";
import { exportAll, writeRecords, put, get } from "./db.js";
import { Welcome } from "./screens/Welcome";
import { dayKey } from "./data/provisionalWeek.js";
import {
  loadCheckIn,
  loadDraft,
  loadSessions,
  saveCheckIn,
  saveDraft,
  saveSession,
  loadProgram,
  completeBaseline,
  saveCheckpoint,
  saveResponse,
} from "./persistence/repository";
import { CheckInScreen } from "./screens/CheckIn";
import { FinishScreen, WorkoutScreen } from "./screens/Workout";
import {
  MoreScreen,
  PlanScreen,
  ProgressScreen,
  TestsScreen,
  ExposureScreen,
  ResponseScreen,
} from "./screens/Program";
import { BaselineWizard } from "./screens/SimpleBaseline";
import type {
  Answers,
  CheckIn,
  Session,
  SetLog,
  Tab,
  Workout,
  WorkoutLog,
  Values,
} from "./types";

const tabs: Tab[] = ["Today", "Plan", "Progress", "Tests", "More"];
function currentTab(): Tab {
  const value = location.hash.slice(1) as Tab;
  return tabs.includes(value) ? value : "Today";
}

export function App() {
  const [savedReviewId, setSavedReviewId] = useState("");
  const [intro, setIntro] = useState(false);
  const welcomeChecked = useRef(false);
  const [movementDate, setMovementDate] = useState(dayKey());
  const [movementType, setMovementType] = useState("");
  const [tab, setTab] = useState<Tab>(currentTab);
  const [date, setDate] = useState(dayKey());
  const [checkIn, setCheckIn] = useState<CheckIn>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [program, setProgram] = useState<
    Awaited<ReturnType<typeof loadProgram>>
  >({
    assessments: [],
    assessment: undefined,
    draft: undefined,
    profile: undefined,
    checkpoints: {},
    welcomed: false,
  });
  const [domain, setDomain] = useState("");
  const [restoreOnOpen, setRestoreOnOpen] = useState(false);
  const [dailyReview, setDailyReview] = useState(false);
  const [reviewedSession, setReviewedSession] = useState<Session>();
  const [responseSession, setResponseSession] = useState<Session>();
  const [log, setLog] = useState<WorkoutLog>({});
  const [sessionChanges, setSessionChanges] = useState<any>(emptySessionChanges(date));
  const swapping = useRef(false);
  const logRef = useRef(log);
  const queue = useRef(Promise.resolve());
  const [flow, setFlow] = useState<
    | "rehab-preview"
    | "recovery"
    | "checkin"
    | "workout"
    | "finish"
    | "baseline"
    | "exposure"
    | "response"
    | null
  >(null);
  const [loaded, setLoaded] = useState(false),
    [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [update, setUpdate] = useState<ServiceWorkerRegistration>();
  const medical = sessions.some(
    (s) =>
      s.status === "MEDICAL_FLAG" &&
      (!program.assessment?.completedAt ||
        s.createdAt > program.assessment.completedAt),
  );
  const safetyHold =
    program.assessment && (program.assessment.values.redFlags || []).length > 0;
  const readiness =
    medical || safetyHold
      ? {
          level: "RED",
          reason: medical
            ? "A session response recorded concerning symptoms."
            : "Your assessment identified a concerning symptom.",
          action:
            "Stop Achilles loading. Seek appropriate medical evaluation and reassess before resuming.",
        }
      : checkIn?.readiness || null;
  const week = weeklyPlan(
    program.profile,
    program.assessment,
    sessions,
    new Date(date + "T12:00:00"),
    readiness?.level || "UNCHECKED",
    program.checkpoints,
    date,
    [...Object.keys(log).filter(id => log[id]?.sets.some(set => set && Object.values(set).some(Boolean))), ...(sessionChanges.rehabTemplateVersion === "2.0.0" ? ["rehab-series-v2"] : [])],
  );
  const planSnapshot = JSON.stringify(automaticPlanSnapshot(week, program.assessment, program.checkpoints, sessions, readiness?.level || "UNCHECKED", date));
  useEffect(() => {
    if (!loaded || !program.assessment) return;
    void saveAutomaticPlanAudit(JSON.parse(planSnapshot)).catch(e => setError(`Could not save plan explanation: ${String(e)}`));
  }, [loaded, planSnapshot]);
  const today = week.find((d) => d.date === date)!;
  const baseWorkout: Workout = today.workout || {
    id: "recovery",
    title: today.title,
    phase: today.focus,
    items: [],
    notes: [today.note],
  };
  const workout: Workout = applySessionChanges(baseWorkout, sessionChanges, log, program.profile?.equipment, readiness?.level || "GREEN");
  const savedCoachingSession = sessions.find(s => s.id === savedReviewId && s.date === date) || sessions.filter(s => s.date === date).slice().sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))[0];
  const strengthDone = sessions.some((s) => s.date === date && !s.domain);
  const canOpenWorkout =
    !!program.assessment &&
    !!readiness &&
    readiness.level !== "RED" &&
    workout.items.length > 0 &&
    !strengthDone &&
    !today.retest;
  async function reloadProgram() {
    setProgram(await loadProgram());
    setSessions(await loadSessions());
    setCheckIn(await loadCheckIn(date));
  }
  const report = (e: unknown) =>
    setError(
      e instanceof Error
        ? e.message
        : "Could not save locally. Please try again.",
    );
  useEffect(() => {
    const available = (event: Event) =>
      setUpdate((event as CustomEvent<ServiceWorkerRegistration>).detail);
    const failed = () =>
      setError(
        "Offline setup could not finish. Reconnect and reload to try again.",
      );
    window.addEventListener("pwa-update", available);
    window.addEventListener("pwa-error", failed);
    return () => {
      window.removeEventListener("pwa-update", available);
      window.removeEventListener("pwa-error", failed);
    };
  }, []);
  useEffect(() => {
    let active = true;
    setLoaded(false);
    setFlow(null);
    setCheckIn(undefined);
    setError("");
    Promise.all([
      loadCheckIn(date),
      loadSessions(),
      loadDraft(date),
      loadProgram(),
      get("settings", `workout-changes-${date}`),
    ])
      .then(([record, saved, draft, loadedProgram, changes]) => {
        if (!active) return;
        setCheckIn(record);
        setSessions(saved);
        setProgram(loadedProgram);
        if (!welcomeChecked.current) {
          welcomeChecked.current = true;
          setIntro(!loadedProgram.welcomed);
          setTab("Today");
          location.hash = "Today";
        }
        setSessionChanges(changes || emptySessionChanges(date));
        setLog(draft);
        logRef.current = draft;
        setLoaded(true);
      })
      .catch((e) => {
        if (active) report(e);
      });
    return () => {
      active = false;
    };
  }, [date]);
  useEffect(() => {
    const hash = () => {
      setTab(currentTab());
      setFlow(null);
    };
    let active = true;
    const sync = async () => {
      setDate(dayKey());
      if (!navigator.onLine) {
        setOnline(false);
        return;
      }
      // HEAD bypasses the service worker cache. Some browsers keep onLine true
      // when their network cannot reach the app (for example a disconnected VPN).
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}manifest.webmanifest`,
          {
            method: "HEAD",
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
          },
        );
        if (active) setOnline(response.ok);
      } catch {
        if (active) setOnline(false);
      }
    };
    void sync();
    window.addEventListener("hashchange", hash);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    document.addEventListener("visibilitychange", sync);
    const timer = window.setInterval(() => setDate(dayKey()), 30000);
    return () => {
      active = false;
      window.removeEventListener("hashchange", hash);
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
      document.removeEventListener("visibilitychange", sync);
      clearInterval(timer);
    };
  }, []);
  function select(next: Tab) {
    if (busy) return;
    if (location.hash === `#${next}`) {
      setTab(next);
      setFlow(null);
    } else location.hash = next;
    window.scrollTo(0, 0);
  }
  function open(next: typeof flow) {
    setFlow(next);
    window.scrollTo(0, 0);
  }
  async function enableConditioning() {
    if (busy || program.profile?.strengthStyle === "conditioning") return;
    setBusy(true);
    try {
      await put("profile", {...program.profile, id:"athlete", equipment:program.profile?.equipment || DEFAULT_EQUIPMENT, availableDays:program.profile?.availableDays || ["1","3","5"], previousStrengthStyle:program.profile?.strengthStyle || "hybrid", strengthStyle:"conditioning", conditioningFrom:addDays(date,1)});
      setProgram(await loadProgram());
    } catch(e) { report(e); } finally { setBusy(false); }
  }
  async function submitCheckIn(answers: Answers) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const decision = classifyReadiness(answers);
      await saveCheckIn(date, answers, decision);
      setCheckIn(await loadCheckIn(date));
      setSessions(await loadSessions());
      open(null);
    } catch (e) {
      report(e);
    } finally {
      setBusy(false);
    }
  }
  function changeSet(id: string, index: number, value: SetLog) {
    const next = structuredClone(logRef.current);
    next[id] ||= { sets: [] };
    next[id].sets[index] = editFeedback(next[id].sets[index], value);
    if (index === 0) next[id].sets = carryFeedback(next[id].sets, workout.items.find(ex => ex.id === id)?.sets || next[id].sets.length);
    persistLog(next);
  }
  function changeFeedback(id: string, sets: SetLog[]) {
    const next = structuredClone(logRef.current); next[id] = {sets}; persistLog(next);
  }
  function persistLog(next: WorkoutLog) {
    const updatedChanges = workout.templateVersion === "2.0.0" ? {...sessionChanges, rehabTemplateVersion:"2.0.0"} : sessionChanges;
    if (updatedChanges !== sessionChanges) setSessionChanges(updatedChanges);
    logRef.current = next;
    setLog(next);
    queue.current = queue.current
      .catch(() => {})
      .then(async () => {
        await put("settings", updatedChanges);
          await saveDraft(date, next);
      })
      .catch(report);
  }
  function changeGuided(guided: boolean) {
    const next = {...sessionChanges, guided};
    setSessionChanges(next);
    queue.current = queue.current.catch(() => {}).then(() => put("settings", next)).then(() => {}).catch(report);
  }
  function changeSessionMode(shortSession: boolean) {
    const next = {...sessionChanges, shortSession};
    setSessionChanges(next);
    queue.current = queue.current.catch(() => {}).then(() => put("settings", next)).then(() => {}).catch(report);
  }
  async function finish(details: {
    overallDifficulty: string;
    immediateAchillesResponse: string;
    notes: string;
  }) {
    if (!canOpenWorkout || !readiness || busy) return;
    setBusy(true);
    setError("");
    try {
      await queue.current;
      const recordedItems = sessionItems(workout, logRef.current);
      const logError = validateWorkoutLog({ ...workout, items: recordedItems }, logRef.current);
      if (logError) throw new Error(logError);
      const activeLog = Object.fromEntries(
        Object.entries(logRef.current)
          .filter(([id]) => recordedItems.some((ex: import("./types").Exercise) => ex.id === id))
          .map(([id, entry]) => [
            id,
            {
              sets: entry.sets.slice(
                0,
                recordedItems.find((ex: import("./types").Exercise) => ex.id === id)!.sets,
              ),
            },
          ]),
      );
      const sessionId = crypto.randomUUID();
      const finishedAt = new Date().toISOString();
      const runningTimer = await get("settings", timerKey(date, workout.id));
      const timer = runningTimer?.startedAt ? timerTransition(runningTimer, "finish", Date.now()) : undefined;
      await saveSession({
        id: sessionId,
        finishedAt,
        ...(timer ? { durationMs: timer.accumulatedMs, startedAt: timer.startedAt, workoutTimer: timer } : {}),
        originalPlan: baseWorkout.items,
        sessionMode: sessionChanges.shortSession ? "shorter" : "full",
        ...(workout.sessionFormat === "rehab-conditioning" ? {sessionOptionLabel:sessionChanges.shortSession ? "Essential" : "Full",sessionOptionsVersion:REHAB_SESSION_OPTIONS_VERSION} : {}),
        omittedOptionalIds: workout.items.filter(ex => !sessionItemsForDisplay(workout.items, activeLog, !!sessionChanges.shortSession).some((visible: import("./types").Exercise) => visible.id === ex.id)).map(ex=>ex.id),
        linkedExposureIds: sessions.filter(s=>s.date===date && s.domain).map(s=>s.id),
        coachingContext: { weeklyPlan: week.map(d => ({date:d.date,title:d.title,items:d.workout?.items.map((e: import("./types").Exercise)=>({name:e.name,sets:e.sets,reps:e.reps})) || []})), phase: workout.phase, equipment: program.profile?.equipment || DEFAULT_EQUIPMENT, checkIn: checkIn?.answers, clinical: Object.fromEntries(["surgeryDate", "repairSide", "restrictions", "complications"].map(key => [key, program.assessment?.values[key] ?? "Not recorded"])) },
        date,
        createdAt: new Date().toISOString(),
        workoutId: workout.id,
        workoutTitle: workout.title,
        sessionFormat: workout.sessionFormat,
        templateVersion: workout.templateVersion,
        blockProgression: workout.blockProgression,
        blockMatrixVersion: workout.blockMatrixVersion,
        plannedItems: recordedItems,
        exerciseChanges: sessionChanges.events,
        exerciseLog: activeLog,
        readiness,
        ...details,
        status: "PENDING_NEXT_DAY_RESPONSE",
      });
      setSavedReviewId(sessionId);
      setLog({});
      logRef.current = {};
      setSessions(await loadSessions());
      open(null);
    } catch (e) {
      report(e);
    } finally {
      setBusy(false);
    }
  }
  async function saveExposure(
    values: Values,
    decision: ReturnType<typeof exposureDecision>,
    exposureDomain = domain,
    stayInWorkout = false,
  ) {
    const domain = exposureDomain;
    if (!program.assessment || readiness?.level !== "GREEN")
      throw new Error(
        "Complete a current green check-in before impact or sport work.",
      );
    const latest = await loadSessions(),
      fresh = exposureDecision(
        domain,
        program.assessment.values,
        program.checkpoints,
        latest,
        readiness.level,
      );
    if (
      !fresh.allowed ||
      fresh.level !== decision.level ||
      exposureContent(domain, fresh.level).missingDemos.length
    )
      throw new Error("This exposure is no longer eligible. Review Progress.");
    const schedule = exposureScheduling(
      domain,
      latest,
      date,
      today.high,
      today.retest,
      program.assessment.completedAt,
    );
    if (!schedule.allowed) throw new Error(schedule.reason);
    const logErrors = validateExposureLog(domain, fresh.level, values, latest);
    if (logErrors.length) throw new Error(logErrors.join(" "));
    const reentry = exposureReentry(
      domain,
      latest,
      date,
      program.assessment.completedAt,
    );
    if (reentry.reduction && !String(values.individualDose || "").trim())
      throw new Error(
        "Record the reviewed reduced re-entry dose before saving.",
      );
    if (latest.some((s) => s.date === date && s.domain))
      throw new Error(
        "One planned impact/sport exposure per day. Do not stack catch-up exposures.",
      );
    const now = new Date().toISOString(),
      id = crypto.randomUUID();
    const session = {
      id,
      date,
      createdAt: now,
      workoutId: `${domain}-${fresh.level}`,
      workoutTitle: `${fresh.level} · ${fresh.title}`,
      domain,
      exposureLevel: fresh.level,
      exerciseLog: {},
      plannedDose: fresh.dose,
      ...values,
      ...exposureQuality(domain, fresh.level, values, latest),
      ...(reentry.reduction
        ? { progressionEligible: false, reentryReduction: reentry.reduction }
        : {}),
      readiness,
      status: "PENDING_NEXT_DAY_RESPONSE",
      rulesetVersion: fresh.rulesetVersion,
    };
    await writeRecords([
      { store: "sessions", value: session },
      {
        store: "settings",
        value: { id: `exposure-draft-${domain}-${date}`, values: {} },
      },
      {
        store: "decisions",
        value: {
          id: crypto.randomUUID(),
          sessionId: id,
          createdAt: now,
          ...fresh,
          inputs: {
            assessmentId: program.assessment.id,
            checkpoints: program.checkpoints,
            priorSessionIds: latest.map((s) => s.id),
            readiness,
          },
          sourceIds: [
            domain === "running" ? "running-consensus" : "rehab-guidance",
          ],
        },
      },
    ]);
    setSessions(await loadSessions());
    setDomain("");
    if (!stayInWorkout) { open(null); select("Today"); }
  }
  async function download() {
    try {
      const payload = await exportAll();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(payload, null, 2)], {
          type: "application/json",
        }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `achilles-rehab-backup-${date}.json`;
      anchor.click();
      await put("settings", { id: "backup-status", requestedAt: new Date().toISOString() });
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      report(e);
    }
  }
  async function activateUpdate() {
    await queue.current;
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => location.reload(),
      { once: true },
    );
    update?.waiting?.postMessage("ACTIVATE_UPDATE");
  }
  if (loaded && intro)
    return (
      <Welcome
        busy={busy}
        error={error}
        onStart={async (restore) => {
          setBusy(true);
          try {
            await put("settings", { id: "onboarding", done: true });
            await reloadProgram();
            setIntro(false);
            setRestoreOnOpen(restore);
            setTab(restore ? "More" : "Today");
            location.hash = restore ? "More" : "Today";
          } catch (e) {
            report(e);
          } finally {
            setBusy(false);
          }
        }}
      />
    );
  return (
    <SessionRefresh.Provider value={reloadProgram}><AppShell tab={tab} onSelect={select}>
      {update && !flow && (
        <p className="notice">
          An app update is ready.{" "}
          <button className="text-button" onClick={activateUpdate}>
            Update & reload
          </button>
        </p>
      )}
      {!online && (
        <p className="notice" role="status">
          Offline · Your check-ins and logs still save on this device.
        </p>
      )}
      {error && (
        <div className="error-message" role="alert">
          {error}
          {!loaded && (
            <button className="text-button" onClick={() => location.reload()}>
              Retry
            </button>
          )}
        </div>
      )}
      {!loaded ? (
        <Card>
          <h2>Opening your local data…</h2>
        </Card>
      ) : (
        <>
          {flow === "rehab-preview" ? (
            <RehabPreview
              workout={program.assessment ? modifyWorkout(strengthTemplate("B", program.assessment.values, "conditioning"), readiness?.level || "GREEN", program.profile?.equipment || DEFAULT_EQUIPMENT) : undefined}
              enabled={program.profile?.strengthStyle === "conditioning"}
              busy={busy}
              online={online}
              canStart={canOpenWorkout && workout.sessionFormat === "rehab-conditioning"}
              onStart={() => open("workout")}
              onEnable={enableConditioning}
              onBack={() => open(null)}
              onPlan={() => { open(null); select("Plan"); }}
              onTests={() => { open(null); select("Tests"); }}
              onProgress={() => { open(null); select("Progress"); }}
            />
          ) : flow === "baseline" ? (
            <BaselineWizard
              draft={program.draft}
              previous={program.assessment}
              checkpoints={program.checkpoints}
              sessions={sessions}
              onBack={async () => {
                await reloadProgram();
                open(null);
              }}
              onComplete={async (values) => {
                await completeBaseline(values);
                await reloadProgram();
                open(null);
                select("Tests");
              }}
            />
          ) : flow === "exposure" && program.assessment ? (
            <ExposureScreen
              domain={domain}
              assessment={program.assessment}
              checkpoints={program.checkpoints}
              sessions={sessions}
              readiness={readiness?.level || "UNCHECKED"}
              onSave={saveExposure}
              onBack={() => open(null)}
            />
          ) : flow === "response" && responseSession ? (
            <ResponseScreen
              session={responseSession}
              continueToCheckIn={dailyReview}
              onCheckInFirst={() => {setReviewedSession(undefined);open("checkin");}}
              onBack={() => open(null)}
              onSave={async (values) => {
                await saveResponse(responseSession, values, date);
                const refreshed = await loadSessions();
                setReviewedSession(refreshed.find(s=>s.id===responseSession.id));
                await reloadProgram();
                open(dailyReview ? "checkin" : null);
              }}
            />
          ) : flow === "recovery" ? (
            <MovementScreen
              key={movementDate}
              date={movementDate}
              initialType={movementType}
              sessions={sessions}
              context={{
                readiness: readiness?.level || "UNCHECKED",
                assessment: program.assessment,
                equipment: program.profile?.equipment,
              }}
              onBack={() => open(null)}
              onPlan={() => select("Today")}
            />
          ) : flow === "checkin" ? (
            <CheckInScreen
              initial={checkIn?.answers}
              reviewedSession={reviewedSession}
              busy={busy}
              onSubmit={submitCheckIn}
              onBack={() => !busy && open(null)}
            />
          ) : flow === "workout" && canOpenWorkout ? (
            <WorkoutScreen
              workout={workout}
              shortSession={!!sessionChanges.shortSession}
              onSessionMode={changeSessionMode}
              guided={!!sessionChanges.guided}
              onGuided={changeGuided}
              exposureLogger={today.exposure && program.assessment ? <ExposureScreen key={today.exposure.domain} embedded domain={today.exposure.domain} assessment={program.assessment} checkpoints={program.checkpoints} sessions={sessions} readiness={readiness?.level || "UNCHECKED"} onBack={()=>{}} onSave={(values,decision)=>saveExposure(values,decision,today.exposure.domain,true)} /> : undefined}
              exposure={today.exposure}
              onExposure={(domain) => { setDomain(domain); open("exposure"); }}
              date={date}
              onFeedback={changeFeedback}
              log={log}
              sessions={sessions}
              online={online}
              onChange={changeSet}
              onBack={() => open(null)}
              onFinish={() => !busy && open("finish")}
              unavailable={sessionChanges.unavailable}
              readiness={readiness?.level || "UNCHECKED"}
              equipment={program.profile?.equipment}
              onSwap={async (exercise, id, reason, scope, unavailable) => {
                if (swapping.current || busy) throw new Error("Please wait for the current save.");
                if (!canOpenWorkout || readiness?.level === "RED") throw new Error("Review today's check-in before changing the workout.");
                swapping.current = true; setBusy(true);
                try {
                  const owned = program.profile?.equipment || DEFAULT_EQUIPMENT;
                  let pathAudit: any = null;
                  if (reason === "path") {
                    const decision = exercisePath(exercise, sessions, readiness?.level || "UNCHECKED", owned.filter(key => !unavailable.includes(key)), date, !!workout.progressionAllowed);
                    if (!decision.ready || decision.next?.id !== id || workout.items.some(e => e.id === id)) throw new Error("This path is no longer eligible. Review the current criteria.");
                    pathAudit = {version:decision.version,sourceSessionId:decision.sourceSessionId,checks:decision.checks,setupReviewConfirmed:true};
                    reason = "progression";
                  }
                  const missing = unavailable.filter(key => owned.includes(key));
                  const replacement = id === exercise.id ? { ...exercise, skipReason: undefined } : id ? swapExercise(exercise, id, owned.filter(key => !missing.includes(key)), readiness?.level, reason) : null;
                  if (id !== exercise.id && workout.items.some(ex => ex.id === id)) throw new Error("That exercise is already in this workout.");
                  await queue.current;
                  const next = recordSessionChange(sessionChanges, exercise, replacement, reason, scope, missing, logRef.current, new Date().toISOString());
                  if (pathAudit) next.events[next.events.length-1].pathReview = pathAudit;
                  const records: any[] = [{ store: "settings", value: next }];
                  if (scope === "future" && replacement) records.push({ store: "profile", value: {
                    ...program.profile, id: "athlete", exerciseChoices: { ...program.profile?.exerciseChoices,
                      [exercise.originalId || exercise.id]: { id: replacement.id, reason, effectiveFrom: addDays(date, 1) }
                    }
                  }});
                  await writeRecords(records);
                  setSessionChanges(next);
                  if (scope === "future") await reloadProgram();
                } finally { swapping.current = false; setBusy(false); }
              }}
            />
          ) : flow === "finish" ? (
            <FinishScreen
              review={<><SessionReview items={[...workout.items,...(workout.retained || [])]} log={log} sessions={sessions} date={date} short={!!sessionChanges.shortSession}/>{today.exposure && <p className="notice">The prescribed running / sport block has not been saved. Return to the workout to log it if performed; saving this workout does not complete that block.</p>}</>}
              busy={busy}
              onBack={() => !busy && open("workout")}
              onSave={finish}
            />
          ) : tab === "Today" ? (
            <>
              {savedCoachingSession && <Card><h2>Workout saved</h2>{!savedCoachingSession.domain && <SessionReview items={savedCoachingSession.plannedItems || []} log={savedCoachingSession.exerciseLog} sessions={sessions} date={savedCoachingSession.date} short={savedCoachingSession.sessionMode === "shorter"}/>}<CoachingReview session={savedCoachingSession} sessions={sessions} expanded /></Card>}
              <Today
                conditioningEnabled={program.profile?.strengthStyle === "conditioning"}
                conditioningFrom={program.profile?.conditioningFrom}
                onEnableConditioning={enableConditioning}
                onViewRehab={() => open("rehab-preview")}
                exposure={today.exposure}
                onExposure={(d) => { setDomain(d); open("exposure"); }}
                hasDraft={Object.values(log).some(item => item.sets.some(set => set && Object.keys(set).length > 0))}
                onRecovery={(type = "") => {
                  setMovementType(type);
                  setMovementDate(date);
                  open("recovery");
                }}
                completed={strengthDone}
                assessment={program.assessment}
                canOpenWorkout={canOpenWorkout}
                workoutNote={
                  strengthDone
                    ? "Workout saved. Your coaching report is ready now; add your next-morning response tomorrow."
                    : today.retest
                      ? "Reassessment due after the training break."
                      : today.note
                }
                onResponse={(s) => {
                  setDailyReview(!checkIn);
                  setResponseSession(s);
                  open("response");
                }}
                readiness={readiness}
                workout={workout}
                sessions={sessions}
                onCheckIn={() => {
                  const pending = [...sessions].filter(s=>s.status === "PENDING_NEXT_DAY_RESPONSE" && s.date < date).sort((a,b)=>b.date.localeCompare(a.date))[0];
                  setDailyReview(true);
                  if (pending) {setResponseSession(pending);open("response");} else {setReviewedSession(undefined);open("checkin");}
                }}
                onWorkout={() => canOpenWorkout && open("workout")}
                onPlan={() => select("Plan")}
                onTests={() => select("Tests")}
              />
            </>
          ) : tab === "Plan" ? (
            <PlanScreen
              checkpoints={program.checkpoints}
              onExposure={(d) => { setDomain(d); open("exposure"); }}
              onMovement={(d) => {
                setMovementType("");
                setMovementDate(d);
                open("recovery");
              }}
              sessions={sessions}
              profile={program.profile}
              assessment={program.assessment}
              readiness={readiness?.level || "UNCHECKED"}
              onTests={() => select("Tests")}
              onReload={reloadProgram}
            />
          ) : tab === "Progress" ? (
            <ProgressScreen
              onMovement={(d) => {
                setMovementType("");
                setMovementDate(d);
                open("recovery");
              }}
              assessments={program.assessments}
              isLoadingDay={today.high}
              retest={today.retest}
              assessment={program.assessment}
              checkpoints={program.checkpoints}
              sessions={sessions}
              readiness={readiness?.level || "UNCHECKED"}
              onTests={() => select("Tests")}
              onStart={(d) => {
                setDomain(d);
                open("exposure");
              }}
            />
          ) : tab === "Tests" ? (
            <TestsScreen
              sessions={sessions}
              {...program}
              onBaseline={() => open("baseline")}
              onCheckpoint={async (values) => {
                await saveCheckpoint(values);
                await reloadProgram();
              }}
            />
          ) : (
            <MoreScreen
              onWelcome={() => setIntro(true)}
              prescribedIds={[...new Set(week.flatMap(d => d.workout?.items.map((ex: { id: string }) => ex.id) || []))]}
              onMovement={() => {
                setMovementType("");
                setMovementDate(date);
                open("recovery");
              }}
              initialSection={restoreOnOpen ? "backup" : ""}
              profile={program.profile}
              onExport={download}
              onReload={reloadProgram}
            />
          )}
        </>
      )}
    </AppShell></SessionRefresh.Provider>
  );
}
