import { evaluateGuidance } from "../domain/v2/guidance.js";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  readTimeline,
  createPlan,
  changePlan,
  repeatPlan,
  startPlanned,
  correctHistory,
  recordResponse,
  materializeLegacy,
} from "../persistence/planningHistory.js";
import { readV2 } from "../persistence/v2Repository.js";
import { day, shiftDate } from "../domain/v2/planning.js";
import {
  unified,
  calendarEvents,
  exerciseRows,
  exposureRows,
  actualRows,
  readable,
  val,
  reportSession,
  sessionLabel,
} from "../domain/v2/timeline.js";
import {
  emptyIntent,
  copyCompleted,
  uid,
  known,
  blank,
} from "../domain/v2/composition.js";
import { starterTemplates } from "../domain/v2/compositionContent.js";
import { GuidancePanel } from "../components/v2/GuidancePanel";
import { MetricsEditor, Tempo } from "../components/v2/TargetEditor";
import "./TrainingRecords.css";
const Builder = lazy(() => import("./WorkoutBuilder"));
const Execution = lazy(() => import("./WorkoutExecution"));
const labels = [
  "Weekly Plan",
  "Calendar",
  "History",
  "Exercise history",
  "Exposure history",
  "Symptoms",
];
const download = (name: string, text: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([text], { type: "text/markdown;charset=utf-8" }),
  );
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
export default function TrainingRecords({
  onBack,
  initialView = "Weekly Plan",
  initialRecord = null,
}: {
  onBack: () => void;
  initialView?: string;
  initialRecord?: any;
}) {
  const [data, setData] = useState<any>(null),
    [view, setView] = useState(initialView),
    [date, setDate] = useState(day()),
    [selected, setSelected] = useState<any>(initialRecord ? {kind:initialRecord.planning?'plan':'session',record:initialRecord} : null),
    [builder, setBuilder] = useState<any>(null),
    [execution, setExecution] = useState<any>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const [source, setSource] = useState("blank"),
    [name, setName] = useState("My workout"),
    [repeat, setRepeat] = useState(false),
    [end, setEnd] = useState(shiftDate(day(), 28)),
    [weekdays, setWeekdays] = useState<number[]>([1, 3, 5]),
    [exercise, setExercise] = useState(""),
    [response, setResponse] = useState<any>({
      change: "",
      functionChange: "",
      repeatedWorsening: "",
      notes: "",
    }),
    [correction, setCorrection] = useState<any>(null),
    [reason, setReason] = useState(""),
    [report, setReport] = useState("");
  async function refresh() {
    const d = await readTimeline();
    setData(d);
    return d;
  }
  useEffect(() => {
    refresh().catch((e) => setError(String(e)));
  }, []);
  async function run(fn: () => Promise<any>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  const starters = starterTemplates();
  if (builder)
    return (
      <Suspense fallback={<p>Loading builder…</p>}>
        <Builder
          initialPlan={builder === "blank" ? null : builder}
          onBack={() => {
            setBuilder(null);
            refresh();
          }}
        />
      </Suspense>
    );
  if (execution)
    return (
      <Suspense fallback={<p>Loading workout…</p>}>
        <Execution
          initial={execution}
          onBack={() => {
            setExecution(null);
            refresh();
          }}
        />
      </Suspense>
    );
  if (!data)
    return (
      <section>
        <button onClick={onBack}>Back</button>
        <p role="status">{error || "Loading training records…"}</p>
      </section>
    );
  const sessions = unified(data),
    events = calendarEvents(data),
    plans = data.v2PlannedWorkouts.filter(
      (p: any) => p.planning && !p.planning.archived,
    ),
    templates = [
      ...starters,
      ...data.v2WorkoutTemplates.filter((t: any) => !t.archived),
    ];
  function sourceIntent() {
    if (source === "blank") return emptyIntent(name);
    if (source.startsWith("history:"))
      return copyCompleted(sessions.find((s: any) => s.id === source.slice(8)));
    return templates.find((t: any) => t.id === source);
  }
  const template = templates.find((t: any) => t.id === source);
  async function start(p: any) {
    const s = await startPlanned(p);
    setExecution(s);
  }
  async function mutate(p: any, c: any) {
    const next = await changePlan(p, c);
    setSelected({ kind: "plan", record: next });
    setMessage("Plan saved. Existing sessions are unchanged.");
  }
  function open(e: any) {
    setSelected(e);
    setReport("");
    setCorrection(null);
    setReason("");
    setResponse({
      change: "",
      functionChange: "",
      repeatedWorsening: "",
      notes: "",
    });
  }
  const weekStart = shiftDate(
    date,
    -((new Date(date + "T12:00:00Z").getUTCDay() + 6) % 7),
  );
  function card(e: any) {
    const conflict =
      e.kind === "plan" &&
      evaluateGuidance(
        e.record,
        {
          date: e.date,
          plannedWorkouts: plans.filter(
            (p: any) => p.id !== e.record.id && p.status === "planned",
          ),
        },
        e.date + "T12:00:00Z",
      ).some((g: any) => g.ruleId === "schedule.high-low.planned.v1");
    return (
      <button className="record-event" key={e.id} onClick={() => open(e)}>
        <strong>{e.title}</strong>
        {conflict && <small>Spacing guidance available — open to review</small>}
        <span>
          {e.kind === "plan" ? "Planned" : e.kind} · {e.status}
        </span>
        {e.categories?.length > 0 && <small>{e.categories.join(" · ")}</small>}
      </button>
    );
  }
  function sessionDetail(s: any) {
    return (
      <>
        <h2>{val(s.name) || "Recorded workout"}</h2>
        <p>
          {val(s.date) || "Date unknown"} · {s.lifecycle} · {sessionLabel(s)}
        </p>
        <p>
          {actualRows(s).length} completed sets/bouts with separately recorded
          actuals. Missing values remain unknown.
        </p>
        <div className="record-actions">
          <button
            disabled={busy}
            onClick={() =>
              run(async () => {
                const p = await createPlan(copyCompleted(s), date, undefined, {
                  kind: "session",
                  id: s.id,
                  revision: s.revision,
                });
                setBuilder(p);
              })
            }
          >
            Copy as new intent
          </button>
          <button onClick={() => setReport(reportSession(s, data))}>
            Review coaching report
          </button>
          {s.lifecycle === "in-progress" && s.execution && (
            <button onClick={() => setExecution(s)}>Resume workout</button>
          )}
          {!s.recordVersion && s.legacy?.source === "session" && (
            <button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const native = await materializeLegacy(s.legacy.raw);
                  setSelected({ kind: "session", record: native });
                  setMessage(
                    "Original preserved. Corrections now use a separate audited record.",
                  );
                })
              }
            >
              Prepare audited correction
            </button>
          )}
        </div>
        {s.occurrences.map((o: any) => (
          <article className="record-occurrence" key={o.id}>
            <h3>{readable(o.definitionSnapshot.name)}</h3>
            <p>
              {o.addedDuringSession ? "Added during workout. " : ""}
              {o.replacesOccurrenceId ? "Replacement. " : ""}Setup:{" "}
              {readable(o.definitionSnapshot.setup)}
            </p>
            {o.sets.map((set: any) => (
              <div className="record-set" key={set.id}>
                <strong>
                  Set {set.order + 1} · {set.disposition} ·{" "}
                  {readable(set.actualType || set.type)}
                </strong>
                <p>Target: {readable(set.target)}</p>
                <p>Actual: {readable(set.actual)}</p>
                {set.intervals?.map((b: any) => (
                  <div key={b.id}>
                    <p>
                      {b.kind} · {b.disposition} · Actual: {readable(b.actual)}
                    </p>
                    {s.recordVersion && s.lifecycle !== "in-progress" && (
                      <button
                        onClick={() => {
                          setCorrection({
                            type: "set",
                            occurrenceId: o.id,
                            setId: set.id,
                            boutId: b.id,
                            actual: structuredClone(b.actual),
                            disposition: b.disposition,
                          });
                          setReason("");
                        }}
                      >
                        Correct bout
                      </button>
                    )}
                  </div>
                ))}
                {s.recordVersion && s.lifecycle !== "in-progress" && (
                  <button
                    onClick={() => {
                      setCorrection({
                        type: "set",
                        occurrenceId: o.id,
                        setId: set.id,
                        actual: structuredClone(set.actual),
                        actualType: set.actualType || set.type,
                        disposition: set.disposition,
                      });
                      setReason("");
                    }}
                  >
                    Correct set
                  </button>
                )}
              </div>
            ))}
          </article>
        ))}
        {s.recordVersion && s.lifecycle !== "in-progress" && (
          <div className="record-actions">
            <button
              onClick={() =>
                setCorrection({ type: "date", date: val(s.date) || date })
              }
            >
              Correct activity date
            </button>
            <button
              onClick={() =>
                setCorrection({
                  type: "notes",
                  notes: s.execution?.notes || s.recordNotes || "",
                })
              }
            >
              Correct session notes
            </button>
          </div>
        )}
        {correction && (
          <section className="card" aria-label="Audited correction">
            <h3>Correct a factual logging error</h3>
            <p>
              The prior revision and original values will be retained. Targets
              and templates stay unchanged.
            </p>
            {correction.type === "set" ? (
              <>
                <MetricsEditor
                  target={correction.actual}
                  fields={[
                    "reps",
                    "load",
                    "duration",
                    "distance",
                    "rest",
                    "rpe",
                    "steps",
                    "contacts",
                  ]}
                  onChange={(actual: any) =>
                    setCorrection({ ...correction, actual })
                  }
                />
                {!correction.boutId && (
                  <label>
                    Actual set type
                    <select
                      value={val(correction.actualType) || ""}
                      onChange={(e) =>
                        setCorrection({
                          ...correction,
                          actualType: e.target.value
                            ? known(e.target.value)
                            : blank(),
                        })
                      }
                    >
                      <option value="">Not recorded</option>
                      {["warm-up", "working", "rehab"].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                )}
                <label>
                  Side
                  <select
                    value={val(correction.actual.side) || ""}
                    onChange={(e) =>
                      setCorrection({
                        ...correction,
                        actual: {
                          ...correction.actual,
                          side: e.target.value
                            ? known(e.target.value)
                            : blank(),
                        },
                      })
                    }
                  >
                    <option value="">Not recorded</option>
                    {["bilateral", "left", "right"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <Tempo
                  value={correction.actual.tempo}
                  onChange={(tempo: any) =>
                    setCorrection({
                      ...correction,
                      actual: { ...correction.actual, tempo },
                    })
                  }
                />
                {["notes", "quality", "symptoms"].map((k) => (
                  <label key={k}>
                    {k}
                    <input
                      value={val(correction.actual[k]) || ""}
                      onChange={(e) =>
                        setCorrection({
                          ...correction,
                          actual: {
                            ...correction.actual,
                            [k]: e.target.value
                              ? known(e.target.value)
                              : blank(),
                          },
                        })
                      }
                    />
                  </label>
                ))}
                <label>
                  Set status
                  <select
                    value={correction.disposition}
                    onChange={(e) =>
                      setCorrection({
                        ...correction,
                        disposition: e.target.value,
                      })
                    }
                  >
                    {[
                      "planned",
                      "completed",
                      "partial",
                      "skipped",
                      "unknown",
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : correction.type === "date" ? (
              <label>
                Correct date
                <input
                  type="date"
                  value={correction.date}
                  onChange={(e) =>
                    setCorrection({ ...correction, date: e.target.value })
                  }
                />
              </label>
            ) : (
              <label>
                Correct notes
                <textarea
                  value={correction.notes}
                  onChange={(e) =>
                    setCorrection({ ...correction, notes: e.target.value })
                  }
                />
              </label>
            )}
            <label>
              Correction reason
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <button
              disabled={busy || !reason.trim()}
              onClick={() =>
                run(async () => {
                  const n = await correctHistory(s, { ...correction, reason });
                  setSelected({ kind: "session", record: n });
                  setCorrection(null);
                  setMessage("Correction saved with prior revision preserved.");
                })
              }
            >
              Save audited correction
            </button>
            <button onClick={() => setCorrection(null)}>
              Cancel correction
            </button>
          </section>
        )}
        <details>
          <summary>Correction history ({s.correctionLineage.length})</summary>
          {s.correctionLineage.map((c: any, i: number) => (
            <div key={c.id || i}>
              <p>
                {c.at} · {c.reason} · prior revision {c.previousRevision}
              </p>
              <p>Change: {readable(c.command)}</p>
              <details>
                <summary>Original values</summary>
                <p>
                  {readable(
                    c.previous?.occurrences?.map((o: any) => ({
                      exercise: o.definitionSnapshot.name,
                      sets: o.sets.map((x: any) => x.actual),
                    })),
                  )}
                </p>
              </details>
            </div>
          ))}
        </details>
        <h3>Symptoms and delayed response</h3>
        {s.symptoms?.map((o: any) => (
          <p key={o.id}>Raw observation: {readable(o.observations)}</p>
        ))}
        {s.responses?.map((o: any) => (
          <div key={o.id}>
            <p>Raw delayed response: {readable(o.observations)}</p>
            <p>
              Stored interpretation:{" "}
              {readable(o.interpretation.status || o.interpretation)}
            </p>
          </div>
        ))}
        {data.v2Observations
          .filter((o: any) => o.sessionId === s.id)
          .map((o: any) => (
            <div key={o.id}>
              <p>
                Raw {o.kind} ({o.activityDate || val(o.recordedAt)}):{" "}
                {readable(o.observations)}
              </p>
              <p>Stored interpretation: {readable(o.interpretation)}</p>
            </div>
          ))}
        {s.recordVersion && s.lifecycle !== "in-progress" && (
          <details>
            <summary>Record delayed tendon response</summary>
            <p>
              Workout completion stays unchanged. These are your observations,
              not clearance.
            </p>
            <label>
              Observation date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            {[
              [
                "change",
                "Tendon change",
                ["baseline", "meaningful", "substantial", "medical"],
              ],
              ["functionChange", "Function changed", ["no", "yes"]],
              ["repeatedWorsening", "Repeated worsening", ["no", "yes"]],
            ].map(([key, label, options]: any) => (
              <label key={key}>
                {label}
                <select
                  value={response[key]}
                  onChange={(e) =>
                    setResponse({ ...response, [key]: e.target.value })
                  }
                >
                  <option value="">Not recorded</option>
                  {options.map((o: string) => (
                    <option key={o} value={o}>
                      {o === "baseline"
                        ? "At usual baseline"
                        : o === "medical"
                          ? "Concerning symptoms — seek evaluation"
                          : o}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label>
              Response notes
              <textarea
                value={response.notes}
                onChange={(e) =>
                  setResponse({ ...response, notes: e.target.value })
                }
              />
            </label>
            <button
              disabled={busy || !Object.values(response).some(Boolean)}
              onClick={() =>
                run(async () => {
                  const r = await recordResponse(s, response, date);
                  setMessage(
                    r.warning ||
                      "Response saved. Guidance reevaluated; workout lifecycle unchanged.",
                  );
                })
              }
            >
              Save delayed response
            </button>
          </details>
        )}
        {s.recordVersion && (
          <GuidancePanel
            key={s.id + ":" + s.revision + ":" + data.v2Observations.length}
            subjectId={s.id}
            changeToken={JSON.stringify(s)}
            getSubject={() => readV2("v2WorkoutSessions", s.id)}
            lock={setBusy}
            onApplied={() => {}}
            onModify={() =>
              setMessage(
                "Completed history requires an audited factual correction. Future training can be copied into a new plan.",
              )
            }
          />
        )}
        {report && (
          <section aria-label="Coaching report">
            <h3>Coaching report preview</h3>
            <textarea readOnly value={report} rows={18} />
            <button
              onClick={() => download(`achilles-workout-${s.id}.md`, report)}
            >
              Download coaching report
            </button>
          </section>
        )}
      </>
    );
  }
  return (
    <section className="training-records">
      <button onClick={onBack}>← Back</button>
      <h1>Plan & training records</h1>
      <p>
        Your schedule, recorded work and observations. Guidance advises; you
        decide.
      </p>
      <nav aria-label="Training records views">
        {labels.map((x) => (
          <button
            aria-pressed={view === x && !selected}
            key={x}
            onClick={() => {
              setView(x);
              setSelected(null);
            }}
          >
            {x}
          </button>
        ))}
      </nav>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {busy && <p role="status">Saving…</p>}
      {selected ? (
        <section className="card">
          <button onClick={() => setSelected(null)}>Back to records</button>
          {selected.kind === "plan" ? (
            <>
              <h2>{selected.record.snapshot.name}</h2>
              <p>
                {selected.record.date} · {selected.record.status}
              </p>
              <p>{selected.record.snapshot.categories.join(" · ")}</p>
              <label>
                Move to date
                <input
                  aria-label="Move to date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <div className="record-actions">
                <button
                  disabled={busy}
                  onClick={() =>
                    run(() => mutate(selected.record, { type: "move", date }))
                  }
                >
                  Move workout
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      const p = await createPlan(
                        selected.record.snapshot,
                        date,
                        selected.record.templateRef,
                        {
                          kind: "plan",
                          id: selected.record.id,
                          revision: selected.record.revision,
                        },
                      );
                      setSelected({ kind: "plan", record: p });
                    })
                  }
                >
                  Duplicate planned workout
                </button>
                <button onClick={() => setBuilder(selected.record)}>
                  Edit in Workout Builder
                </button>
                <button
                  disabled={busy || selected.record.status !== "planned"}
                  onClick={() => run(() => start(selected.record))}
                >
                  Start planned workout
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    run(() =>
                      mutate(selected.record, {
                        type:
                          selected.record.status === "skipped"
                            ? "restore"
                            : "skip",
                      }),
                    )
                  }
                >
                  {selected.record.status === "skipped"
                    ? "Restore plan"
                    : "Skip workout"}
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await changePlan(selected.record, { type: "archive" });
                      setSelected(null);
                    })
                  }
                >
                  Archive planned workout
                </button>
              </div>
              <label>
                Replacement template
                <select
                  aria-label="Replacement template"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option value="blank">Blank workout</option>
                  {templates.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                disabled={busy}
                onClick={() =>
                  run(() =>
                    mutate(selected.record, {
                      type: "replace",
                      intent: sourceIntent(),
                    }),
                  )
                }
              >
                Replace planned workout
              </button>
              <p>
                Replacing changes this dated intent only. Started and completed
                sessions retain their snapshots.
              </p>
              <GuidancePanel
                key={selected.record.id + ":" + selected.record.revision}
                subjectId={selected.record.id}
                changeToken={JSON.stringify(selected.record)}
                getSubject={() =>
                  readV2("v2PlannedWorkouts", selected.record.id)
                }
                onApplied={(p: any) => setSelected({ kind: "plan", record: p })}
                onModify={() => setBuilder(selected.record)}
                lock={setBusy}
              />
            </>
          ) : selected.kind === "session" ? (
            sessionDetail(selected.record)
          ) : (
            <>
              <h2>{selected.title}</h2>
              <p>
                Raw record:{" "}
                {readable(
                  selected.record.observations ||
                    selected.record.answers ||
                    selected.record.values ||
                    selected.record,
                )}
              </p>
              {selected.record.interpretation && (
                <p>
                  Derived interpretation:{" "}
                  {readable(selected.record.interpretation)}
                </p>
              )}
            </>
          )}
        </section>
      ) : (
        <>
          <label>
            {view === "Calendar" ? "Selected calendar day" : "Reference date"}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          {view === "Weekly Plan" && (
            <>
              <section className="card">
                <h2>Add to your plan</h2>
                <label>
                  Workout source
                  <select
                    aria-label="Workout source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  >
                    <option value="blank">Blank workout</option>
                    {templates.map((t: any) => (
                      <option value={t.id} key={t.id}>
                        {t.name}
                      </option>
                    ))}
                    {sessions
                      .filter((s: any) =>
                        ["completed", "partial"].includes(s.lifecycle),
                      )
                      .map((s: any) => (
                        <option key={s.id} value={"history:" + s.id}>
                          Copy {val(s.name) || "workout"} — {val(s.date)}
                        </option>
                      ))}
                  </select>
                </label>
                {source === "blank" && (
                  <label>
                    Workout name
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                )}
                <label>
                  <input
                    type="checkbox"
                    checked={repeat}
                    onChange={(e) => setRepeat(e.target.checked)}
                  />
                  Repeat weekly
                </label>
                {repeat && (
                  <>
                    <label>
                      Through date
                      <input
                        type="date"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                      />
                    </label>
                    <fieldset>
                      <legend>Weekly days</legend>
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (label, i) => (
                          <label key={label}>
                            <input
                              type="checkbox"
                              checked={weekdays.includes(i)}
                              onChange={() =>
                                setWeekdays(
                                  weekdays.includes(i)
                                    ? weekdays.filter((x) => x !== i)
                                    : [...weekdays, i],
                                )
                              }
                            />
                            {label}
                          </label>
                        ),
                      )}
                    </fieldset>
                    <p>
                      Creates independent dated copies through this date. No
                      background scheduling or automatic later replacement.
                    </p>
                  </>
                )}
                <button
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      const ref = template
                        ? { id: template.id, revision: template.revision }
                        : undefined;
                      if (repeat) {
                        await repeatPlan(sourceIntent(), {
                          start: date,
                          end,
                          weekdays,
                          seriesId: uid(),
                          templateRef: ref,
                        });
                        setMessage(
                          "Weekly structure saved as independent workouts.",
                        );
                      } else {
                        const p = await createPlan(
                          sourceIntent(),
                          date,
                          ref,
                          source.startsWith("history:")
                            ? { kind: "session", id: source.slice(8) }
                            : undefined,
                        );
                        setSelected({ kind: "plan", record: p });
                      }
                    })
                  }
                >
                  Save to plan
                </button>
                <button onClick={() => setBuilder("blank")}>
                  Build unplanned workout
                </button>
              </section>
              <div className="record-week">
                {Array.from({ length: 7 }, (_, i) =>
                  shiftDate(weekStart, i),
                ).map((d) => (
                  <section className="card" key={d}>
                    <h3>
                      {new Date(d + "T12:00:00").toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </h3>
                    {events
                      .filter(
                        (e: any) =>
                          e.date === d &&
                          (e.kind === "plan" || e.kind === "session"),
                      )
                      .map(card)}
                    {!events.some(
                      (e: any) =>
                        e.date === d &&
                        (e.kind === "plan" || e.kind === "session"),
                    ) && <p>Open day · optional rest or recovery</p>}
                  </section>
                ))}
              </div>
            </>
          )}
          {view === "Calendar" && (
            <>
              <div className="record-actions">
                <button
                  onClick={() => {
                    const d = new Date(date + "T12:00:00Z");
                    d.setUTCMonth(d.getUTCMonth() - 1, 1);
                    setDate(d.toISOString().slice(0, 10));
                  }}
                >
                  Previous month
                </button>
                <h2>
                  {new Date(date + "T12:00:00").toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <button
                  onClick={() => {
                    const d = new Date(date + "T12:00:00Z");
                    d.setUTCMonth(d.getUTCMonth() + 1, 1);
                    setDate(d.toISOString().slice(0, 10));
                  }}
                >
                  Next month
                </button>
              </div>
              <div className="record-calendar">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <small key={d}>{d}</small>
                ))}
                {Array.from(
                  {
                    length: new Date(
                      date.slice(0, 8) + "01T12:00:00Z",
                    ).getUTCDay(),
                  },
                  (_, i) => (
                    <span aria-hidden="true" key={"pad" + i} />
                  ),
                )}
                {Array.from(
                  {
                    length: new Date(
                      Number(date.slice(0, 4)),
                      Number(date.slice(5, 7)),
                      0,
                    ).getDate(),
                  },
                  (_, i) => date.slice(0, 8) + String(i + 1).padStart(2, "0"),
                ).map((d) => (
                  <button
                    aria-label={`Day ${d}`}
                    aria-pressed={d === date}
                    key={d}
                    onClick={() => setDate(d)}
                  >
                    <strong>{Number(d.slice(8))}</strong>
                    <small>
                      {events.filter((e: any) => e.date === d).length} records
                    </small>
                  </button>
                ))}
              </div>
              <h2>{date}</h2>
              {events.filter((e: any) => e.date === date).map(card)}
              {!events.some((e: any) => e.date === date) && (
                <p>No records for this day.</p>
              )}
            </>
          )}
          {view === "History" && (
            <>
              <h2>Recorded workouts and activities</h2>
              {events
                .filter((e: any) => e.kind === "session")
                .reverse()
                .map(card)}
              <h3>Skipped or replaced plans — not performed training</h3>
              {events
                .filter(
                  (e: any) =>
                    e.kind === "plan" && e.record.status !== "planned",
                )
                .map(card)}
            </>
          )}
          {view === "Exercise history" && (
            <>
              <h2>Exercise history</h2>
              <label>
                Exercise filter
                <select
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                >
                  <option value="">All recorded exercises</option>
                  {[
                    ...new Map(
                      sessions.flatMap((s: any) =>
                        s.occurrences.map((o: any) => [
                          o.exerciseDefinitionId,
                          o.definitionSnapshot.name,
                        ]),
                      ) as any,
                    ).entries(),
                  ].map(([id, n]: any) => (
                    <option key={id} value={id}>
                      {readable(n)}
                    </option>
                  ))}
                </select>
              </label>
              <p>
                Loads are shown with their recorded convention and setup. No
                incompatible loads are combined.
              </p>
              {exerciseRows(sessions, exercise).map((r: any) => (
                <article className="card" key={r.id}>
                  <h3>{readable(r.occurrence.definitionSnapshot.name)}</h3>
                  <p>
                    {val(r.session.date)} · {val(r.session.name)} · occurrence{" "}
                    {r.occurrence.order + 1}
                  </p>
                  <p>
                    Setup: {readable(r.occurrence.definitionSnapshot.setup)}
                  </p>
                  {r.rows.map((x: any, i: number) => (
                    <div key={i}>
                      <p>
                        Type: {readable(x.set.actualType || x.set.type)} ·
                        Target: {readable(x.target)}
                      </p>
                      <p>Actual: {readable(x.actual)}</p>
                    </div>
                  ))}
                  {r.occurrence.aggregateActual && (
                    <p>
                      Recorded aggregate:{" "}
                      {readable(r.occurrence.aggregateActual)}
                    </p>
                  )}
                  <button
                    onClick={() => open({ kind: "session", record: r.session })}
                  >
                    Open workout
                  </button>
                </article>
              ))}
            </>
          )}
          {view === "Exposure history" && (
            <>
              <h2>Recorded exposure</h2>
              <p>
                No recorded exposure does not mean no exposure occurred.
                Quantities are not inferred from target doses.
              </p>
              {exposureRows(sessions, data.v2Observations).map((e: any) => (
                <article className="card" key={e.id}>
                  <h3>{e.domain}</h3>
                  <p>
                    {e.date} · {e.source}
                  </p>
                  <p>Actual: {readable(e.actual)}</p>
                  <p>Context: {readable(e.raw)}</p>
                  <button
                    onClick={() =>
                      open({
                        kind: "session",
                        record: sessions.find((s: any) => s.id === e.sessionId),
                      })
                    }
                    disabled={!sessions.some((s: any) => s.id === e.sessionId)}
                  >
                    Open linked workout
                  </button>
                </article>
              ))}
            </>
          )}
          {view === "Symptoms" && (
            <>
              <h2>Raw observations and separate interpretations</h2>
              {events
                .filter((e: any) =>
                  [
                    "symptom",
                    "assessment",
                    "checkpoint",
                    "observation",
                  ].includes(e.kind),
                )
                .reverse()
                .map(card)}
              {sessions
                .filter((s: any) => s.symptoms.length || s.responses.length)
                .map((s: any) => (
                  <article className="card" key={s.id}>
                    <h3>
                      {val(s.date)} · {val(s.name) || "Workout"}
                    </h3>
                    {s.symptoms.map((o: any) => (
                      <p key={o.id}>Raw: {readable(o.observations)}</p>
                    ))}
                    {s.responses.map((o: any) => (
                      <div key={o.id}>
                        <p>Raw delayed response: {readable(o.observations)}</p>
                        <p>Derived/stored: {readable(o.interpretation)}</p>
                      </div>
                    ))}
                    <button
                      onClick={() => open({ kind: "session", record: s })}
                    >
                      Review workout / response
                    </button>
                  </article>
                ))}
            </>
          )}
        </>
      )}
    </section>
  );
}
