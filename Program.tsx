import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Card,
  PrimaryButton,
  CalendarCard,
  ExerciseCard,
} from "../components/ui";
import { AssessmentResult, DataField } from "./Baseline";
import { CHECKPOINTS } from "../data/checkpoints.js";
import {
  CATALOG,
  EQUIPMENT,
  PROGRESSION_DOMAINS,
  validDemo,
} from "../data/catalog.js";
import { EVIDENCE, CLINICAL_COPY } from "../data/evidence.js";
import {
  exposureDecision,
  supportingTargets,
  strengthDecision,
  exposureScheduling,
  exposureReentry,
  checkpointAvailability,
} from "../rules/progression.js";
import {
  exposureContent,
  courtCap,
  validateExposureLog,
} from "../data/exposures.js";
import { weeklyPlan } from "../rules/planner.js";
import { dayKey } from "../data/provisionalWeek.js";
import { get, getAll, put, restoreBackup } from "../db.js";
import { migrateBackup, STORE_NAMES, VERSIONS } from "../persistence/schema.js";
import type { Assessment, Profile, Session, Values, Exercise } from "../types";

export function History({ sessions }: { sessions: Session[] }) {
  return (
    <>
      {sessions.length === 0 ? (
        <p>No saved workout on this date.</p>
      ) : (
        [...sessions]
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((s) => (
            <details className="history-row" key={s.id}>
              <summary>
                {s.workoutTitle || s.workoutId}{" "}
                <small>{s.status.replaceAll("_", " ").toLowerCase()}</small>
              </summary>
              {s.domain && (
                <p>
                  {s.exposureLevel} · {s.minutes} minutes · Session RPE{" "}
                  {s.sessionRPE ?? "—"} · Quality:{" "}
                  {s.movementQuality || "not recorded"}
                </p>
              )}
              <p>
                Difficulty:{" "}
                {s.overallDifficulty || s.sessionRPE || "Not recorded"} ·
                Immediate Achilles response:{" "}
                {s.immediateAchillesResponse || "Not recorded"}
              </p>
              {!!s.nextDayResponse && (
                <details>
                  <summary>Next-morning details</summary>
                  <pre>{JSON.stringify(s.nextDayResponse, null, 2)}</pre>
                </details>
              )}
              {Object.entries(s.exerciseLog || {}).map(([id, entry]) => (
                <div key={id}>
                  <h3>
                    {s.plannedItems?.find((e) => e.id === id)?.name || id}
                  </h3>
                  {entry.sets.filter(Boolean).map((set, i) => (
                    <p key={i}>
                      Set {i + 1}: {set.load || "—"} lb × {set.reps || "—"}{" "}
                      {set.complete ? "✓" : ""}
                      {set.rpe ? ` · RPE ${set.rpe}` : ""}
                      {set.quality ? ` · ${set.quality} quality` : ""}
                      {set.symptoms ? ` · symptoms: ${set.symptoms}` : ""}
                    </p>
                  ))}
                </div>
              ))}
              {s.notes && <p>{s.notes}</p>}
              <small>
                Saved {new Date(s.createdAt).toLocaleString()} · Rules{" "}
                {s.rulesetVersion || "legacy"}
              </small>
            </details>
          ))
      )}
    </>
  );
}

export function PlanScreen({
  profile,
  assessment,
  sessions,
  readiness,
  onTests,
}: {
  profile?: Profile;
  assessment?: Assessment;
  sessions: Session[];
  readiness: string;
  onTests: () => void;
}) {
  const [selected, setSelected] = useState(dayKey()),
    [offset, setOffset] = useState(0);
  const date = new Date();
  date.setDate(date.getDate() + offset * 7);
  const days = weeklyPlan(profile, assessment, sessions, date, readiness);
  return (
    <>
      <div className="screen-heading">
        <h1>Plan</h1>
        <p>Your full week. Capacity first, recovery built in.</p>
      </div>
      {!assessment && (
        <Card>
          <h2>Baseline first</h2>
          <p>A personalized plan becomes active after assessment.</p>
          <PrimaryButton onClick={onTests}>Start Baseline</PrimaryButton>
        </Card>
      )}
      <div className="calendar-heading">
        <button
          aria-label="Previous week"
          onClick={() => setOffset(offset - 1)}
        >
          ‹
        </button>
        <h2>
          {days[0].dateObj.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}{" "}
          –{" "}
          {days[6].dateObj.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </h2>
        <button aria-label="Next week" onClick={() => setOffset(offset + 1)}>
          ›
        </button>
      </div>
      {days.map((day) => (
        <Card key={day.date}>
          <details className="plan-day">
            <summary>
              <strong>
                {day.dateObj.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                · {day.title}
              </strong>
              <small>{day.note}</small>
            </summary>
            {day.retest && (
              <p className="notice">
                Reassessment due after more than 10 missed days. Resume with a
                reduced dose after retesting.
              </p>
            )}
            {day.workout?.items.map((ex: Exercise) => (
              <div key={ex.id} className="preview-row">
                <span className="exercise-bullet" />
                <span>{ex.name}</span>
                <span>
                  {ex.sets} × {ex.reps}
                </span>
              </div>
            ))}
            {day.high && (
              <p className="helper">
                Eligible running or sport work belongs on a loading day, before
                strength when appropriate. Choose one exposure in Progress; do
                not add separate catch-up sessions.
              </p>
            )}
            {day.workout?.notes?.map((note: string) => (
              <p key={note} className="helper">
                {note}
              </p>
            ))}
          </details>
        </Card>
      ))}
      <div className="section-heading">
        <h2>Workout Calendar</h2>
      </div>
      <CalendarCard
        modifiedDates={sessions
          .filter(
            (s) =>
              s.readiness?.level.startsWith("YELLOW") ||
              ["BORDERLINE", "NOT_TOLERATED", "MEDICAL_FLAG"].includes(
                s.status,
              ),
          )
          .map((s) => s.date)}
        sessionDates={sessions.map((s) => s.date)}
        onSelect={setSelected}
      />
      <Card>
        <h2>
          {new Date(selected + "T12:00:00").toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
          })}
        </h2>
        <History sessions={sessions.filter((s) => s.date === selected)} />
      </Card>
    </>
  );
}

export function TestsScreen({
  assessment,
  assessments,
  draft,
  checkpoints,
  onBaseline,
  onCheckpoint,
  sessions,
}: {
  assessment?: Assessment;
  assessments: Assessment[];
  draft?: Assessment;
  checkpoints: Values;
  onBaseline: () => void;
  onCheckpoint: (v: Values) => Promise<void>;
  sessions: Session[];
}) {
  const [editing, setEditing] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function review(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = new FormData(e.currentTarget);
      await onCheckpoint({
        ...checkpoints,
        [editing]: String(data.get("result")),
        [`${editing}_evidence`]: String(data.get("evidence")),
        [`${editing}_date`]: String(data.get("date")),
      });
      setEditing("");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="screen-heading">
        <h1>Tests</h1>
        <p>Measure what matters. Retest with the same setup.</p>
      </div>
      <Card>
        <h2>
          {assessment ? "Baseline & reassessment" : "Establish your baseline"}
        </h2>
        <p>
          {assessment
            ? `Last completed ${new Date(assessment.completedAt!).toLocaleDateString()}`
            : "A guided assessment of symptoms, strength, balance, function and confidence."}
        </p>
        <PrimaryButton onClick={onBaseline}>
          {Object.keys(draft?.values || {}).length
            ? "Resume assessment"
            : assessment
              ? "Start reassessment"
              : "Start Baseline"}
        </PrimaryButton>
      </Card>
      {assessment && <AssessmentResult assessment={assessment} />}
      <Card>
        <h2>Capacity reviews</h2>
        <p>
          Record the result of a performed assessment. These reviews address
          qualitative prerequisites in the approved plan; a score alone is not
          clearance.
        </p>
        {CHECKPOINTS.map((c) => (
          <details key={c.id} className="review-row">
            <summary>
              {checkpoints[c.id] === "yes" ? "✓" : "○"} {c.label}
            </summary>
            <p>{c.description}</p>
            {checkpoints[`${c.id}_evidence`] && (
              <p>
                Recorded evidence: {String(checkpoints[`${c.id}_evidence`])} (
                {String(checkpoints[`${c.id}_date`])})
              </p>
            )}
            <button
              className="text-button"
              disabled={
                !assessment ||
                !checkpointAvailability(
                  c.id,
                  assessment.values,
                  checkpoints,
                  sessions,
                )
              }
              onClick={() => {
                setEditing(c.id);
                setError("");
              }}
            >
              {assessment &&
              checkpointAvailability(
                c.id,
                assessment.values,
                checkpoints,
                sessions,
              )
                ? "Record review"
                : "Not needed yet"}
            </button>
          </details>
        ))}
        {editing && (
          <form onSubmit={review} className="review-form">
            <h3>{CHECKPOINTS.find((c) => c.id === editing)?.label}</h3>
            <label>
              Result
              <select name="result" required defaultValue="">
                <option value="">Choose…</option>
                <option value="yes">Demonstrated / reviewed as met</option>
                <option value="no">Not yet met</option>
                <option value="unsure">Needs further review</option>
              </select>
            </label>
            <label>
              Assessment date
              <input
                name="date"
                type="date"
                max={dayKey()}
                defaultValue={dayKey()}
                required
              />
            </label>
            <label>
              Measurements, setup, movement quality and reviewer
              <textarea
                name="evidence"
                required
                minLength={12}
                rows={4}
                placeholder="Describe the assessment performed and its result."
              />
            </label>
            <p className="helper">
              High-speed and unrestricted sport reviews should include your
              clinician/performance professional. Record actual findings; do not
              check a gate simply to unlock it.
            </p>
            <PrimaryButton disabled={busy}>Save review</PrimaryButton>
            <button
              type="button"
              className="text-button"
              onClick={() => setEditing("")}
            >
              Cancel
            </button>
          </form>
        )}
        {error && <p role="alert">{error}</p>}
      </Card>
      {assessments.length > 0 && (
        <Card>
          <h2>Assessment history</h2>
          {assessments.map((a) => (
            <details key={a.id}>
              <summary>
                {new Date(a.completedAt!).toLocaleDateString()} · Baseline
              </summary>
              <AssessmentResult assessment={a} />
            </details>
          ))}
        </Card>
      )}
    </>
  );
}

export function ProgressScreen({
  assessment,
  checkpoints,
  sessions,
  readiness,
  onStart,
  onTests,
  isLoadingDay,
  retest,
}: {
  assessment?: Assessment;
  checkpoints: Values;
  sessions: Session[];
  readiness: string;
  onStart: (domain: string) => void;
  onTests: () => void;
  isLoadingDay: boolean;
  retest: boolean;
}) {
  const values = assessment?.values || {},
    targets = supportingTargets(values, checkpoints);
  return (
    <>
      <div className="screen-heading">
        <h1>Progress</h1>
        <p>A structured path back to the game.</p>
      </div>
      {!assessment && (
        <Card>
          <h2>Start with your baseline</h2>
          <p>Running, jumping and sport gates use your measured capacities.</p>
          <PrimaryButton onClick={onTests}>View Tests</PrimaryButton>
        </Card>
      )}
      {PROGRESSION_DOMAINS.filter(
        (d) => d.id !== "soccer" || values.soccerEnabled === "yes",
      ).map((domain) => {
        const decision = exposureDecision(
            domain.id,
            values,
            checkpoints,
            sessions,
            readiness,
          ),
          content = exposureContent(domain.id, decision.level),
          schedule = exposureScheduling(
            domain.id,
            sessions,
            dayKey(),
            isLoadingDay,
            retest,
            assessment?.completedAt,
          ),
          history = sessions.filter((s) => s.domain === domain.id);
        return (
          <Card key={domain.id}>
            <div className="section-heading">
              <h2>{domain.title}</h2>
              <span className="pill">{decision.level}</span>
            </div>
            <h3>
              {decision.level === "B8"
                ? CLINICAL_COPY.candidate
                : decision.title}
            </h3>
            <p>
              {decision.action === "LOCKED" ? "Still needed: " : ""}
              {decision.reason}
            </p>
            {decision.allowed && !schedule.allowed && (
              <p className="helper">{schedule.reason}</p>
            )}
            <p className="exercise-prescription">{decision.dose}</p>
            {content.missingDemos.length > 0 && (
              <p className="helper">
                Demo verification needed: {content.missingDemos.join(", ")}.
                This exposure remains locked.
              </p>
            )}
            <PrimaryButton
              disabled={
                !assessment ||
                !decision.allowed ||
                !schedule.allowed ||
                content.missingDemos.length > 0
              }
              onClick={() => onStart(domain.id)}
            >
              Open {decision.level} exposure
            </PrimaryButton>
            <details>
              <summary>Full ladder & requirements</summary>
              <ol className="ladder-list">
                {domain.levels.map((level) => (
                  <li
                    key={level.id}
                    className={level.id === decision.level ? "current" : ""}
                  >
                    <strong>{level.id}</strong>
                    <span>{level.dose}</span>
                    <small>
                      {history.some(
                        (s) =>
                          s.exposureLevel === level.id &&
                          s.status === "TOLERATED",
                      )
                        ? "Tolerated exposure recorded"
                        : level.id === decision.level
                          ? "Current decision"
                          : "Criteria and prior exposure required"}
                    </small>
                  </li>
                ))}
              </ol>
              <p>
                {domain.id === "running"
                  ? CLINICAL_COPY.runningNote
                  : CLINICAL_COPY.targetNote}
              </p>
              <small>
                Rule {decision.ruleId} · v{decision.rulesetVersion}
              </small>
            </details>
            {history.length > 0 && (
              <details>
                <summary>{history.length} recorded exposures</summary>
                <History sessions={history} />
              </details>
            )}
          </Card>
        );
      })}
      <Card>
        <h2>Strength progression</h2>
        <p>
          Small load increases are proposed only after completed targets, good
          quality and next-morning tolerance.
        </p>
        {Object.values(CATALOG)
          .filter((ex) => sessions.some((s) => s.exerciseLog?.[ex.id]))
          .map((ex) => {
            const latest = [...sessions]
              .filter((s) => s.exerciseLog?.[ex.id])
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
            const decision = strengthDecision(
              latest.plannedItems?.find((e) => e.id === ex.id) || ex,
              latest.exerciseLog[ex.id].sets,
              latest.status,
              readiness,
            );
            return (
              <details key={ex.id}>
                <summary>
                  {ex.name} ·{" "}
                  {decision.action === "HOLD"
                    ? "Hold"
                    : "Small increase eligible"}
                </summary>
                <p>{decision.reason}</p>
                <small>{decision.ruleId}</small>
              </details>
            );
          })}
      </Card>
      <Card>
        <details>
          <summary>Advanced metrics & evidence</summary>
          <dl className="metrics-grid">
            {Object.entries(targets).map(([key, value]) => (
              <div key={key}>
                <dt>{key.replace(/([A-Z])/g, " $1")}</dt>
                <dd>{value === null ? "Not measured" : `${value}%`}</dd>
              </div>
            ))}
          </dl>
          <p>{CLINICAL_COPY.targetNote}</p>
          <p>
            Compare strength loads only with matched setup, repetitions, range
            and effort. Heel-rise repetitions, height and work are separate
            measures.
          </p>
          <a
            href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11379499/"
            target="_blank"
            rel="noreferrer"
          >
            Rehabilitation and return-to-sport source ↗
          </a>
        </details>
      </Card>
    </>
  );
}

export function ExposureScreen({
  domain,
  assessment,
  checkpoints,
  sessions,
  readiness,
  onSave,
  onBack,
}: {
  domain: string;
  assessment: Assessment;
  checkpoints: Values;
  sessions: Session[];
  readiness: string;
  onSave: (
    v: Values,
    decision: ReturnType<typeof exposureDecision>,
  ) => Promise<void>;
  onBack: () => void;
}) {
  const decision = exposureDecision(
      domain,
      assessment.values,
      checkpoints,
      sessions,
      readiness,
    ),
    content = exposureContent(domain, decision.level),
    cap = courtCap(decision.level, sessions);
  const reentry = exposureReentry(
    domain,
    sessions,
    dayKey(),
    assessment.completedAt,
  );
  const needsDose = content.needsIndividualDose || reentry.reduction > 0;
  const [values, setValues] = useState<Values>({}),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const queue = useRef(Promise.resolve()),
    [draftReady, setDraftReady] = useState(false);
  const draftId = `exposure-draft-${domain}-${dayKey()}`;
  useEffect(() => {
    let active = true;
    get("settings", draftId)
      .then((record) => {
        if (active) {
          const draft = record as
            { level?: string; values?: Values } | undefined;
          if (draft?.level === decision.level) setValues(draft.values || {});
          setDraftReady(true);
        }
      })
      .catch((e) => setError(String(e)));
    return () => {
      active = false;
    };
  }, [draftId, decision.level]);
  function change(id: string, value: string | string[]) {
    const next = { ...values, [id]: value };
    setValues(next);
    queue.current = queue.current
      .catch(() => {})
      .then(async () => {
        await put("settings", {
          id: draftId,
          level: decision.level,
          values: next,
        });
      })
      .catch((e) => {
        setError(String(e));
        throw e;
      });
    void queue.current.catch(() => {});
  }
  const fields = [
    { id: "minutes", label: "Actual minutes", type: "number", min: 0 },
    {
      id: "sessionRPE",
      label: "Session RPE (0–10)",
      type: "number",
      min: 0,
      max: 10,
    },
    { id: "intensity", label: "Actual intensity / pace", type: "text" },
    ...(domain === "jumping"
      ? [
          {
            id: "contacts",
            label: "Total landing contacts (both sides)",
            type: "number",
            min: 0,
          },
        ]
      : []),
    ...(["speed", "cod"].includes(domain)
      ? [
          {
            id: "distance",
            label: "Total distance (metres)",
            type: "number",
            min: 0,
          },
        ]
      : []),
    {
      id: "movementQuality",
      label: "Movement quality",
      type: "select",
      options: [
        ["good", "Controlled / good"],
        ["reduced", "Reduced / deteriorated"],
      ],
    },
    {
      id: "immediateAchillesResponse",
      label: "Immediate Achilles response",
      type: "select",
      options: [
        ["good", "At usual baseline"],
        ["mild", "Mild increase"],
        ["worse", "Worse than expected"],
      ],
    },
    {
      id: "notes",
      label: "Repetitions, rest, surface, symptoms and notes",
      type: "text",
    },
  ];
  async function save() {
    const errors = validateExposureLog(
      domain,
      decision.level,
      values,
      sessions,
    );
    if (needsDose && !String(values.individualDose || "").trim())
      errors.push(
        "Record the individualized dose agreed with your clinician/performance professional.",
      );
    if (errors.length) {
      setError(errors.join(" "));
      return;
    }
    setBusy(true);
    try {
      await queue.current;
      await onSave(values, decision);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  if (!draftReady)
    return (
      <Card>
        <h2>Opening saved exposure…</h2>
        {error && <p role="alert">{error}</p>}
        <button className="text-button" onClick={onBack}>
          Back to Progress
        </button>
      </Card>
    );
  return (
    <>
      <button
        className="text-button page-back"
        onClick={async () => {
          try {
            await queue.current;
            onBack();
          } catch (e) {
            setError(String(e));
          }
        }}
      >
        ← Progress
      </button>
      <div className="screen-heading">
        <h1>
          {decision.level} ·{" "}
          {PROGRESSION_DOMAINS.find((d) => d.id === domain)?.title}
        </h1>
        <p>
          {decision.level === "B8" ? CLINICAL_COPY.candidate : decision.title}
        </p>
      </div>
      <Card>
        <h2>Planned exposure</h2>
        {reentry.reduction > 0 && (
          <p className="notice">
            Reduced re-entry: approximately {reentry.reduction * 100}% less work
            after {reentry.days} missed days. Record your reviewed reduced dose
            below. The ladder dose is shown for reference; this session cannot
            advance the ladder.
          </p>
        )}
        <p className="exercise-prescription">{decision.dose}</p>
        {cap && (
          <p className="notice">
            Today’s court cap: {cap} minutes. Record actual time honestly if you
            exceed it; exceeding the cap will block advancement.
          </p>
        )}
        <p>{content.warmup}</p>
        <p>{content.note}</p>
        {content.demos
          .filter((d: { videoUrl: string }) => d.videoUrl)
          .map(
            (d: {
              name: string;
              videoUrl: string;
              videoSource: string;
              note?: string;
            }) => (
              <p key={d.name}>
                <a href={d.videoUrl} target="_blank" rel="noreferrer">
                  Short Demo · {d.name} ↗
                </a>
                <small className="block">{d.videoSource}</small>
                {d.note && <p className="muted">{d.note}</p>}
              </p>
            ),
          )}
        <details>
          <summary>Why this dose?</summary>
          <p>{decision.reason}</p>
          <small>
            {decision.ruleId} · Rules {decision.rulesetVersion}
          </small>
        </details>
      </Card>
      <Card>
        <h2>Log this exposure</h2>
        {needsDose && (
          <DataField
            field={{
              id: "individualDose",
              label:
                "Agreed dose: bouts/reps, minutes, intensity and rest; reviewer/date",
              type: "text",
            }}
            values={values}
            onChange={change}
          />
        )}{" "}
        {fields.map((f) => (
          <DataField key={f.id} field={f} values={values} onChange={change} />
        ))}
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <PrimaryButton
          disabled={
            busy ||
            !draftReady ||
            !decision.allowed ||
            content.missingDemos.length > 0
          }
          onClick={save}
        >
          {busy ? "Saving…" : "Save exposure"}
        </PrimaryButton>
        <p className="helper">
          Saved as pending until the next-morning response.
        </p>
      </Card>
    </>
  );
}

export function ResponseScreen({
  session,
  onSave,
  onBack,
}: {
  session: Session;
  onSave: (v: Values) => Promise<void>;
  onBack: () => void;
}) {
  const [values, setValues] = useState<Values>({}),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <>
      <button className="text-button page-back" onClick={onBack}>
        ← Today
      </button>
      <div className="screen-heading">
        <h1>Next-morning response</h1>
        <p>
          {session.workoutTitle || session.workoutId} · {session.date}
        </p>
      </div>
      <Card>
        <p>
          Compare with your usual baseline. This response determines tolerance
          of this specific session.
        </p>
        {[
          {
            id: "change",
            label: "Pain, stiffness, swelling or soreness change",
            type: "select",
            options: [
              ["baseline", "Back to usual baseline"],
              ["meaningful", "Meaningful increase"],
              ["substantial", "Large deterioration"],
              ["medical", "Concerning acute symptoms"],
            ],
          },
          {
            id: "functionChange",
            label: "Walking or daily function worse?",
            type: "select",
            options: [
              ["no", "No"],
              ["yes", "Yes"],
            ],
          },
          {
            id: "repeatedWorsening",
            label: "Repeated worsening over multiple sessions?",
            type: "select",
            options: [
              ["no", "No"],
              ["yes", "Yes"],
            ],
          },
          {
            id: "redFlags",
            label: "Any red flags?",
            type: "checks",
            options: [
              ["sharp-pain", "Sharp pain"],
              ["new-bruising", "New bruising"],
              ["major-swelling", "Major swelling"],
              ["sudden-weakness", "Sudden weakness"],
              ["new-limp", "New limp"],
            ],
          },
          { id: "notes", label: "Notes", type: "text" },
        ].map((f) => (
          <DataField
            key={f.id}
            field={f}
            values={values}
            onChange={(id, v) => setValues({ ...values, [id]: v })}
          />
        ))}
        {error && <p role="alert">{error}</p>}
        <PrimaryButton
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onSave(values);
            } catch (e) {
              setError(String(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Save next-morning response"}
        </PrimaryButton>
      </Card>
    </>
  );
}

export function MoreScreen({
  profile,
  onExport,
  onReload,
  initialSection = "",
}: {
  profile?: Profile;
  onExport: () => void;
  onReload: () => Promise<void>;
  initialSection?: string;
}) {
  const [section, setSection] = useState(initialSection),
    [search, setSearch] = useState(""),
    [message, setMessage] = useState(""),
    [backup, setBackup] = useState<ReturnType<typeof migrateBackup>>(),
    [busy, setBusy] = useState(false),
    [audit, setAudit] = useState<Record<string, unknown>[]>([]);
  const [values, setValues] = useState<Values>({
    availableDays: profile?.availableDays || ["1", "3", "5"],
    equipment: profile?.equipment || EQUIPMENT,
  });
  async function settings() {
    setBusy(true);
    try {
      await put("profile", { ...profile, id: "athlete", ...values });
      await onReload();
      setMessage("Preferences saved on this device.");
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="screen-heading">
        <h1>More</h1>
        <p>Your plan, your data, your device.</p>
      </div>
      <Card>
        <div className="menu-list">
          {[
            ["profile", "Profile & schedule"],
            ["library", "Exercise library"],
            ["evidence", "Evidence & rules"],
            ["backup", "Backup & restore"],
            ["about", "About & install"],
          ].map(([key, label]) => (
            <button
              key={key}
              aria-expanded={section === key}
              onClick={() => {
                setSection(section === key ? "" : key);
                setMessage("");
              }}
            >
              {label}
              <span>›</span>
            </button>
          ))}
        </div>
      </Card>
      {section === "profile" && (
        <Card>
          <h2>Profile & schedule</h2>
          <p>
            Basketball is the primary goal. Surgery and clinical details are
            recorded in Tests.
          </p>
          <DataField
            field={{
              id: "availableDays",
              label: "Training days",
              type: "checks",
              options: [
                ["1", "Monday"],
                ["2", "Tuesday"],
                ["3", "Wednesday"],
                ["4", "Thursday"],
                ["5", "Friday"],
                ["6", "Saturday"],
                ["0", "Sunday"],
              ],
            }}
            values={values}
            onChange={(id, v) => setValues({ ...values, [id]: v })}
          />
          <DataField
            field={{
              id: "equipment",
              label: "Available owned equipment",
              type: "checks",
              options: EQUIPMENT.map((e) => [e, e.replaceAll("-", " ")]),
            }}
            values={values}
            onChange={(id, v) => setValues({ ...values, [id]: v })}
          />
          <p className="helper">
            Only whitelisted equipment can appear. Unavailable exercises are
            omitted and explained.
          </p>
          <PrimaryButton disabled={busy} onClick={settings}>
            Save preferences
          </PrimaryButton>
        </Card>
      )}
      {section === "library" && (
        <>
          <Card>
            <label>
              Find an exercise
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Calf, strength, balance…"
              />
            </label>
          </Card>
          {Object.values(CATALOG)
            .filter((ex) =>
              `${ex.name} ${ex.tags?.join(" ")}`
                .toLowerCase()
                .includes(search.toLowerCase()),
            )
            .map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex}>
                <p className="helper">
                  Equipment: {ex.equipment.join(", ") || "Bodyweight"} ·
                  Achilles load: {ex.loadTier}
                </p>
                {!validDemo(ex) && (
                  <p className="notice">Locked: {ex.lockedReason}</p>
                )}
                <details>
                  <summary>Demo & source metadata</summary>
                  <p>
                    {ex.videoSource || "Pending verification"} ·{" "}
                    {ex.videoType || "Unverified"}
                  </p>
                  <p>Verification: {ex.videoVerifiedAt || "Pending"}</p>
                  <p>{ex.videoVerification}</p>
                  <p>
                    Evidence: {ex.evidenceType} · {ex.evidenceStrength}
                  </p>
                </details>
              </ExerciseCard>
            ))}
        </>
      )}
      {section === "evidence" && (
        <>
          <Card>
            <h2>How decisions work</h2>
            <p>
              Safety → next-day response → capacity prerequisites → daily
              readiness → session modification → progression.
            </p>
            <p>{CLINICAL_COPY.targetNote}</p>
            <button
              className="text-button"
              onClick={async () => {
                try {
                  setAudit(
                    (await getAll("decisions")) as Record<string, unknown>[],
                  );
                } catch (e) {
                  setMessage(String(e));
                }
              }}
            >
              Show my decision history
            </button>
            {audit
              .slice()
              .reverse()
              .map((row) => (
                <details key={String(row.id)}>
                  <summary>
                    {String(row.ruleId || "Historical decision")} ·{" "}
                    {String(row.createdAt || row.date || "")}
                  </summary>
                  <pre>{JSON.stringify(row, null, 2)}</pre>
                </details>
              ))}
          </Card>
          {EVIDENCE.map((source) => (
            <Card key={source.id}>
              <h2>{source.title}</h2>
              <p>{source.summary}</p>
              <p className="helper">
                {source.strength} · {source.type}
              </p>
              {source.url && (
                <a href={source.url} target="_blank" rel="noreferrer">
                  Read source ↗
                </a>
              )}
            </Card>
          ))}
        </>
      )}
      {section === "backup" && (
        <Card>
          <h2>Backup & restore</h2>
          <p>
            Export regularly. Clearing browser/site data removes this device’s
            records. V1 has no account or cloud sync.
          </p>
          <PrimaryButton onClick={onExport}>Export JSON backup</PrimaryButton>
          <label className="form-field">
            Choose a backup to validate
            <input
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                setMessage("");
                setBackup(undefined);
                try {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 25000000)
                    throw new Error("Backup exceeds 25 MB.");
                  setBackup(migrateBackup(JSON.parse(await file.text())));
                } catch (error) {
                  setMessage(String(error));
                }
              }}
            />
          </label>
          {backup && (
            <>
              <p>
                Validated schema {backup.schemaVersion}:{" "}
                {STORE_NAMES.map((s) => `${backup[s].length} ${s}`).join(", ")}.
              </p>
              <p>
                Restore merges records by ID. Matching IDs are replaced; other
                local records remain. Export first if you want to retain a
                separate copy.
              </p>
              <PrimaryButton
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await restoreBackup(backup);
                    await onReload();
                    setBackup(undefined);
                    setMessage("Backup restored successfully.");
                  } catch (e) {
                    setMessage(String(e));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Restore validated backup
              </PrimaryButton>
            </>
          )}
        </Card>
      )}
      {section === "about" && (
        <Card>
          <h2>Achilles Return</h2>
          <p>
            App {VERSIONS.appVersion} · Clinical plan {VERSIONS.rulesetVersion}
          </p>
          <p>
            Install from your browser’s app menu. On iPhone, use Safari → Share
            → Add to Home Screen. Load the app online once to prepare its
            offline cache.
          </p>
          <p>
            Core screens and saved records work offline. External demonstration
            videos and research links need internet access.
          </p>
          <p>
            Designed around your approved criteria-based plan. Candidate status
            does not provide medical clearance.
          </p>
        </Card>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </>
  );
}
