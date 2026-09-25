import { useEffect, useRef, useState } from "react";
import { Card } from "../components/ui";
import { ExercisePicker, DemoLinks } from "../components/v2/ExercisePicker";
import { IllustratedExercise } from "../components/v2/IllustratedExercise";
import { MetricsEditor, SetEditor, Tempo } from "../components/v2/TargetEditor";
import { CustomForm } from "../components/v2/CustomExerciseForm";
import { DEFINITIONS } from "../domain/v2/compositionContent.js";
import {
  clone,
  display,
  known,
  blank,
  visibleTargetFields,
} from "../domain/v2/composition.js";
import {
  sessionCommand,
  sessionSummary,
  terminal,
  recordedSet,
  recordedOccurrence,
  executionOrder,
  restSeconds,
} from "../domain/v2/execution.js";
import {
  sessionWriter,
  readRecovery,
} from "../persistence/sessionExecution.js";
import { readV2, listV2, saveV2 } from "../persistence/v2Repository.js";
import "./WorkoutExecution.css";
import { GuidancePanel } from "../components/v2/GuidancePanel";
const duration = (s: number) =>
  `${Math.floor(s / 3600) ? Math.floor(s / 3600) + ":" : ""}${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
function metricText(m: any) {
  return (
    Object.entries(m || {})
      .map(([k, v]: [string, any]) =>
        v?.amount?.state === "known"
          ? `${k}: ${v.amount.value} ${display(v.unit)}`
          : v?.state === "known"
            ? `${k}: ${typeof v.value === "string" ? v.value : JSON.stringify(v.value)}`
            : "",
      )
      .filter(Boolean)
      .join(" · ") || "Not specified"
  );
}
function ActualEditor({
  value,
  fields,
  onChange,
}: {
  value: any;
  fields: string[];
  onChange: (v: any) => void;
}) {
  return (
    <>
      <MetricsEditor target={value} fields={fields} onChange={onChange} />
      <details>
        <summary>Rest, side, tempo, effort & feedback</summary>
        <MetricsEditor
          target={value}
          fields={["rest", "rpe"]}
          onChange={onChange}
        />
        <label>
          Actual side
          <select
            aria-label="Actual side"
            value={display(value.side)}
            onChange={(e) =>
              onChange({
                ...value,
                side: e.target.value ? known(e.target.value) : blank(),
              })
            }
          >
            <option value="">Not recorded</option>
            {["bilateral", "left", "right"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        {fields.includes("reps") && (
          <Tempo
            value={value.tempo}
            onChange={(v) => onChange({ ...value, tempo: v })}
          />
        )}
        {["quality", "symptoms"].map((key) => (
          <label key={key}>
            {key === "quality" ? "Movement quality" : "Symptoms"}
            <input
              aria-label={key === "quality" ? "Movement quality" : "Symptoms"}
              value={display(value[key])}
              onChange={(e) =>
                onChange({ ...value, [key]: known(e.target.value) })
              }
            />
          </label>
        ))}
      </details>
      <label>
        Actual notes
        <input
          aria-label="Actual notes"
          value={display(value.notes)}
          onChange={(e) => onChange({ ...value, notes: known(e.target.value) })}
        />
      </label>
    </>
  );
}
export default function WorkoutExecution({
  initial,
  onBack,
}: {
  initial: any;
  onBack: () => void;
}) {
  const [session, setSession] = useState<any>(clone(initial)),
    [status, setStatus] = useState("Saved on this device"),
    [error, setError] = useState(""),
    [picker, setPicker] = useState<string | null>(null),
    [custom, setCustom] = useState<any[]>([]),
    [customOpen, setCustomOpen] = useState(false),
    [review, setReview] = useState(false),
    [busy, setBusy] = useState(false),
    [now, setNow] = useState(new Date().toISOString()),
    [recovery, setRecovery] = useState<any>(readRecovery(initial.id));
  const live = useRef<any>(clone(initial)),
    writer = useRef<any>(null),
    mounted = useRef(true);
  function init(s: any) {
    live.current = clone(s);
    setSession(clone(s));
    writer.current = sessionWriter(s, (message: string) => {
      if (!mounted.current) return;
      setStatus(message);
      if (message.startsWith("Not saved")) setError(message);
    });
  }
  useEffect(() => {
    mounted.current = true;
    init(initial);
    listV2("v2ExerciseDefinitions")
      .then((v: any) => setCustom(v.filter((d: any) => !d.archived)))
      .catch((e) => setError(String(e)));
    const timer = setInterval(() => setNow(new Date().toISOString()), 1000);
    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (writer.current?.pending || error) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [error]);
  function edit(c: any) {
    if (busy || error || recovery) return;
    try {
      const at = new Date().toISOString();
      const next = sessionCommand(live.current, c, at);
      live.current = next;
      setSession(next);
      writer.current.dispatch(c, at, next);
    } catch (e) {
      setError(String(e));
    }
  }
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  const summary = sessionSummary(session, now),
    finished = terminal(session),
    blocked = busy || !!error || !!recovery;
  const downloadRecovery = () => {
    const data = recovery || writer.current.recovery();
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `session-${session.id}-pending-edits.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div
      className="workout-builder workout-execution"
      data-session={session.id}
    >
      <button
        className="text-button page-back"
        disabled={busy}
        onClick={() =>
          action(async () => {
            await writer.current.flush();
            onBack();
          })
        }
      >
        ← Workout Builder
      </button>
      <header className="screen-heading">
        <p className="builder-eyebrow">
          {finished ? "SESSION HISTORY" : "YOUR WORKOUT"}
        </p>
        <h1>{display(session.name) || "Workout"}</h1>
        <p>
          {finished ? session.lifecycle : "Active workout"} ·{" "}
          <span aria-label="Session elapsed time">
            {duration(summary.elapsedSeconds)}
          </span>
        </p>
      </header>
      <p role="status">{status}</p>
      {writer.current && (
        <GuidancePanel
          subjectId={session.id}
          trigger={`${review}:${session.lifecycle}`}
          changeToken={JSON.stringify(session)}
          getSubject={() => writer.current.flush()}
          lock={setBusy}
          onApplied={(saved: any) => init(saved)}
          onModify={() =>
            document
              .querySelector("[data-occurrence]")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        />
      )}
      {(error || recovery) && (
        <Card>
          <h2>Review unsaved edits</h2>
          <p role="alert">
            {error ||
              "Pending edits were recovered. Review or retry them before continuing."}
          </p>
          <p>The latest saved session will not be overwritten automatically.</p>
          <button onClick={downloadRecovery}>Download pending edits</button>
          <button
            onClick={() =>
              action(async () => {
                if (recovery) {
                  if (recovery.baseRevision !== writer.current.current.revision)
                    throw Error(
                      "A newer revision exists. Load the saved session; pending edits remain available for download.",
                    );
                  for (const entry of recovery.commands)
                    await writer.current.dispatch(
                      entry.command,
                      entry.at,
                      entry.snapshot,
                    );
                } else await writer.current.retry();
                const saved = await writer.current.flush();
                setError("");
                setRecovery(null);
                live.current = saved;
                setSession(saved);
              })
            }
          >
            Retry pending edits
          </button>
          <button
            onClick={() =>
              action(async () => {
                downloadRecovery();
                const latest = await readV2("v2WorkoutSessions", session.id);
                init(latest);
                setError("");
                setRecovery(null);
                setStatus(
                  "Loaded latest saved session. Prior pending edits remain in the recovery journal until your next save.",
                );
              })
            }
          >
            Load saved session
          </button>
        </Card>
      )}
      {session.execution.restTimer && !finished && (
        <Card>
          <p role="timer">Rest · {duration(restSeconds(session, now))}</p>
          <p>
            Set{" "}
            {session.occurrences
              .flatMap((o: any) => o.sets)
              .findIndex(
                (s: any) => s.id === session.execution.restTimer.setId,
              ) + 1}
            . Rest does not complete a set.
          </p>
          <button
            disabled={blocked}
            onClick={() => edit({ type: "rest-dismiss" })}
          >
            Dismiss rest
          </button>
        </Card>
      )}
      <Card>
        <p>
          {summary.completedSets} completed sets · {summary.completedBouts}{" "}
          completed interval bouts · {summary.addedExercises} added exercises
        </p>
        <label>
          Session notes
          <textarea
            aria-label="Session notes"
            disabled={finished || blocked}
            value={session.execution.notes}
            onChange={(e) => edit({ type: "notes", notes: e.target.value })}
          />
        </label>
        <p className="helper">
          Targets are separate from actual performance. Next-day response:
          unknown unless separately recorded.
        </p>
      </Card>
      {!finished && (
        <div className="builder-actions">
          <button
            disabled={blocked}
            className="primary-button"
            onClick={() => setPicker("add")}
          >
            Add exercise
          </button>
          <button disabled={blocked} onClick={() => setCustomOpen(true)}>
            Create custom exercise
          </button>
          <button disabled={blocked} onClick={() => setReview(true)}>
            Finish workout
          </button>
        </div>
      )}
      {!!session.occurrences.length && (
        <Card>
          <h2>Full workout overview</h2>
          <ol className="execution-overview">
            {session.occurrences.map((o: any) => (
              <li key={o.id}>
                <button
                  className="text-button"
                  onClick={() =>
                    document
                      .querySelector('[data-occurrence="' + o.id + '"]')
                      ?.scrollIntoView({ block: "start" })
                  }
                >
                  {display(o.definitionSnapshot.name)}
                </button>
                <span>
                  {
                    o.sets.filter((s: any) => s.disposition === "completed")
                      .length
                  }
                  /{o.sets.length} sets ·{" "}
                  {display(o.targetDescription) ||
                    metricText(o.sets[0]?.target)}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      )}
      {session.execution.groups.map((g: any) => (
        <Card key={g.id}>
          <h2>
            {g.name} · {g.kind}
          </h2>
          <p>
            {g.rounds} planned rounds. One set per exercise per round; extra
            sets remain additional work.
          </p>
          {executionOrder(session, g.id).map((round: any) => (
            <div className="execution-round" key={round.round}>
              <h3>Round {round.round}</h3>
              <ol>
                {round.steps.map((step: any) => (
                  <li key={step.setId}>
                    <a
                      href={`#v2-set-${step.setId}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document
                          .getElementById(`v2-set-${step.setId}`)
                          ?.scrollIntoView({ block: "center" });
                      }}
                    >
                      {display(step.name)}
                    </a>{" "}
                    · {step.disposition}
                  </li>
                ))}
              </ol>
              {!finished && (
                <button
                  disabled={blocked}
                  onClick={() =>
                    edit({
                      type: "skip-round",
                      groupId: g.id,
                      round: round.round,
                    })
                  }
                >
                  Skip round {round.round}
                </button>
              )}
            </div>
          ))}
          {!finished && (
            <button
              disabled={blocked}
              onClick={() => edit({ type: "stop-group", groupId: g.id })}
            >
              Stop remaining group work
            </button>
          )}
        </Card>
      ))}
      {session.occurrences.map((o: any, i: number) => {
        const fields = visibleTargetFields(o),
          name = display(o.definitionSnapshot.name);
        return (
          <section
            className="card builder-exercise"
            key={o.id}
            data-occurrence={o.id}
            aria-label={`${i + 1}. ${name}`}
          >
            <IllustratedExercise definition={o.definitionSnapshot}>
            <h2>
              {i + 1}. {name}
            </h2>
            <p>
              {o.disposition}
              {o.addedDuringSession ? " · Added during session" : ""}
              {o.groupId
                ? ` · ${session.execution.groups.find((g: any) => g.id === o.groupId)?.name}`
                : ""}
            </p>
            {o.replacesOccurrenceId && (
              <p>
                Replacement for an earlier exercise. Previous work remains below
                its original name.
              </p>
            )}
            {o.replacedByOccurrenceId && (
              <p>Replaced for remaining work. Recorded sets are preserved.</p>
            )}
            <DemoLinks definition={o.definitionSnapshot} />
            </IllustratedExercise>
            {display(o.targetDescription) && (
              <p>Original target: {display(o.targetDescription)}</p>
            )}
            {!finished && (
              <div className="builder-actions">
                <button
                  disabled={blocked || !!o.replacedByOccurrenceId}
                  onClick={() => setPicker(o.id)}
                >
                  Replace remaining work
                </button>
                <button
                  disabled={blocked}
                  onClick={() => edit({ type: "duplicate", id: o.id })}
                >
                  Duplicate exercise
                </button>
                <button
                  disabled={blocked || recordedOccurrence(o)}
                  onClick={() => edit({ type: "remove", id: o.id })}
                >
                  Remove unperformed exercise
                </button>
                <button
                  disabled={blocked}
                  onClick={() => edit({ type: "skip-exercise", id: o.id })}
                >
                  Skip remaining exercise
                </button>
                <button
                  aria-label={`Move ${name} up`}
                  disabled={
                    blocked ||
                    !i ||
                    recordedOccurrence(o) ||
                    recordedOccurrence(session.occurrences[i - 1])
                  }
                  onClick={() => edit({ type: "move", id: o.id, delta: -1 })}
                >
                  ↑ Up
                </button>
                <button
                  aria-label={`Move ${name} down`}
                  disabled={
                    blocked ||
                    i === session.occurrences.length - 1 ||
                    recordedOccurrence(o) ||
                    recordedOccurrence(session.occurrences[i + 1])
                  }
                  onClick={() => edit({ type: "move", id: o.id, delta: 1 })}
                >
                  ↓ Down
                </button>
              </div>
            )}
            <label>
              Exercise session notes
              <input
                aria-label="Exercise session notes"
                disabled={finished || blocked}
                value={display(o.notes)}
                onChange={(e) =>
                  edit({
                    type: "exercise-notes",
                    id: o.id,
                    notes: e.target.value,
                  })
                }
              />
            </label>
            {o.sets.map((s: any, j: number) => (
              <fieldset
                id={`v2-set-${s.id}`}
                className={`builder-set execution-set ${s.disposition === "completed" ? "is-complete" : ""}`}
                key={s.id}
                data-set={s.id}
              >
                <legend>
                  Set {j + 1}
                  {s.groupRound
                    ? ` · Round ${s.groupRound}`
                    : o.groupId
                      ? " · Additional work"
                      : ""}{" "}
                  · {display(s.type) || "Unspecified"} · {s.disposition}
                </legend>
                <p className="execution-target">
                  <strong>Target:</strong> {metricText(s.target)}
                </p>
                {!finished && !recordedSet(s) && (
                  <details>
                    <summary>Edit upcoming target</summary>
                    <SetEditor
                      canMove={false}
                      set={s}
                      index={j}
                      count={o.sets.length}
                      fields={fields}
                      interval={false}
                      onPatch={(patch) =>
                        edit({ type: "target", id: o.id, setId: s.id, patch })
                      }
                      onMove={() => {}}
                      onRemove={() =>
                        edit({ type: "remove-set", id: o.id, setId: s.id })
                      }
                    />
                  </details>
                )}
                {s.intervals.length > 0 ? (
                  <>
                    <p>
                      {s.repeatCount || 1} planned repeats ·{" "}
                      {s.stoppedEarly
                        ? "Stopped early; remaining planned bouts are unperformed."
                        : "Work and recovery recorded separately."}
                    </p>
                    {s.intervals.map((b: any, k: number) => (
                      <fieldset
                        className="execution-bout"
                        key={b.id}
                        data-bout={b.id}
                      >
                        <legend>
                          Repeat {b.repeat} · {b.kind} · {b.disposition}
                        </legend>
                        <p>Target: {metricText(b.target)}</p>
                        {finished ? (
                          <p>Actual: {metricText(b.actual)}</p>
                        ) : (
                          <fieldset disabled={blocked}>
                            <ActualEditor
                              value={b.actual}
                              fields={["duration", "distance"]}
                              onChange={(actual) =>
                                edit({
                                  type: "actual",
                                  id: o.id,
                                  setId: s.id,
                                  boutId: b.id,
                                  actual,
                                })
                              }
                            />
                            <div className="builder-actions">
                              <button
                                onClick={() =>
                                  edit({
                                    type: "complete",
                                    id: o.id,
                                    setId: s.id,
                                    boutId: b.id,
                                  })
                                }
                              >
                                Complete bout
                              </button>
                              <button
                                onClick={() =>
                                  edit({
                                    type: "skip",
                                    id: o.id,
                                    setId: s.id,
                                    boutId: b.id,
                                  })
                                }
                              >
                                Skip bout
                              </button>
                            </div>
                            {b.disposition === "planned" && (
                              <details>
                                <summary>Edit upcoming bout target</summary>
                                <MetricsEditor
                                  target={b.target}
                                  fields={["duration", "distance"]}
                                  onChange={(target) =>
                                    edit({
                                      type: "bout-target",
                                      id: o.id,
                                      setId: s.id,
                                      boutId: b.id,
                                      target,
                                    })
                                  }
                                />
                              </details>
                            )}
                          </fieldset>
                        )}
                      </fieldset>
                    ))}
                    {!finished && (
                      <button
                        disabled={blocked}
                        onClick={() =>
                          edit({
                            type: "stop-intervals",
                            id: o.id,
                            setId: s.id,
                          })
                        }
                      >
                        Stop intervals early
                      </button>
                    )}
                  </>
                ) : finished ? (
                  <p>
                    <strong>Actual:</strong> {metricText(s.actual)} · Set type:{" "}
                    {display(s.actualType) || "Not recorded"}
                  </p>
                ) : (
                  <fieldset disabled={blocked}>
                    <legend>Actual performance</legend>
                    <ActualEditor
                      value={s.actual}
                      fields={[
                        ...new Set([
                          ...fields,
                          ...Object.keys(s.actual).filter((k) =>
                            [
                              "reps",
                              "load",
                              "duration",
                              "distance",
                              "steps",
                              "contacts",
                            ].includes(k),
                          ),
                        ]),
                      ]}
                      onChange={(actual) =>
                        edit({ type: "actual", id: o.id, setId: s.id, actual })
                      }
                    />
                    <label>
                      Actual set type
                      <select
                        aria-label="Actual set type"
                        value={display(s.actualType)}
                        onChange={(e) =>
                          edit({
                            type: "actual-type",
                            id: o.id,
                            setId: s.id,
                            value: e.target.value
                              ? known(e.target.value)
                              : blank(),
                          })
                        }
                      >
                        <option value="">Not recorded</option>
                        {["warm-up", "working", "rehab"].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </label>
                  </fieldset>
                )}
                {!finished && (
                  <div className="builder-actions">
                    <button
                      disabled={blocked}
                      className="primary-button"
                      onClick={() =>
                        edit({ type: "complete", id: o.id, setId: s.id })
                      }
                    >
                      {s.disposition === "completed"
                        ? "Completed"
                        : "Complete set"}
                    </button>
                    <button
                      disabled={blocked}
                      onClick={() =>
                        edit({ type: "skip", id: o.id, setId: s.id })
                      }
                    >
                      Skip set
                    </button>
                    <button
                      disabled={blocked || recordedSet(s)}
                      onClick={() =>
                        edit({ type: "remove-set", id: o.id, setId: s.id })
                      }
                    >
                      Remove unperformed set
                    </button>
                    <button
                      disabled={blocked}
                      onClick={() => {
                        const input = prompt(
                          "Rest timer in seconds",
                          String(
                            s.target.rest?.amount?.value *
                              (display(s.target.rest?.unit) === "minutes"
                                ? 60
                                : 1) || 60,
                          ),
                        );
                        if (input === null) return;
                        const seconds = Number(input);
                        if (Number.isFinite(seconds))
                          edit({
                            type: "rest-start",
                            id: o.id,
                            setId: s.id,
                            seconds,
                          });
                      }}
                    >
                      Start rest
                    </button>
                  </div>
                )}
              </fieldset>
            ))}
            {!finished && (
              <button
                disabled={blocked || !!o.replacedByOccurrenceId}
                onClick={() => edit({ type: "add-set", id: o.id })}
              >
                Add set
              </button>
            )}
          </section>
        );
      })}
      {(review || finished) && (
        <section className="card execution-review" aria-label="Session review">
          <button
            onClick={() =>
              document
                .querySelector(".v2-guidance")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            View workout guidance
          </button>
          <h2>{finished ? "Saved session" : "Review before finishing"}</h2>
          <p>
            {summary.completedExercises} completed exercises ·{" "}
            {summary.skippedExercises} skipped exercises ·{" "}
            {summary.addedExercises} added exercises
          </p>
          <p>
            {summary.completedSets} completed sets · {summary.skippedSets}{" "}
            skipped sets · {summary.unfinishedSets} unfinished sets
          </p>
          <p>Duration: {duration(summary.elapsedSeconds)}</p>
          <p>Notes: {session.execution.notes || "None recorded"}</p>
          <p>Next-day response remains separate from workout completion.</p>
          <details>
            <summary>Recorded effort and symptoms</summary>
            {session.occurrences.map((o: any) => (
              <div key={o.id}>
                {o.sets
                  .filter(
                    (s: any) =>
                      s.actual.symptoms || s.actual.quality || s.actual.rpe,
                  )
                  .map((s: any) => (
                    <p key={s.id}>
                      {display(o.definitionSnapshot.name)} · Set {s.order + 1}:{" "}
                      {metricText({
                        ...(s.actual.rpe ? { rpe: s.actual.rpe } : {}),
                        ...(s.actual.symptoms
                          ? { symptoms: s.actual.symptoms }
                          : {}),
                        ...(s.actual.quality
                          ? { quality: s.actual.quality }
                          : {}),
                      })}
                    </p>
                  ))}
              </div>
            ))}
          </details>
          {!finished && (
            <>
              <p>
                Unperformed targets remain in history. Saving does not imply
                clinical clearance.
              </p>
              <div className="builder-actions">
                {summary.completedSets > 0 &&
                  summary.unfinishedSets === 0 &&
                  summary.skippedSets === 0 && (
                    <button
                      disabled={blocked}
                      onClick={() =>
                        action(async () => {
                          await writer.current.dispatch({
                            type: "finish",
                            lifecycle: "completed",
                          });
                          const s = await writer.current.flush();
                          live.current = s;
                          setSession(s);
                        })
                      }
                    >
                      Save completed workout
                    </button>
                  )}
                {summary.performedSets > 0 ? (
                  <button
                    disabled={blocked}
                    onClick={() =>
                      action(async () => {
                        await writer.current.dispatch({
                          type: "finish",
                          lifecycle: "partial",
                        });
                        const s = await writer.current.flush();
                        live.current = s;
                        setSession(s);
                      })
                    }
                  >
                    Save partial workout
                  </button>
                ) : (
                  <button
                    disabled={blocked}
                    onClick={() =>
                      action(async () => {
                        await writer.current.dispatch({
                          type: "finish",
                          lifecycle: "abandoned",
                        });
                        const s = await writer.current.flush();
                        live.current = s;
                        setSession(s);
                      })
                    }
                  >
                    Abandon zero-work workout
                  </button>
                )}
                <button onClick={() => setReview(false)}>Keep training</button>
              </div>
            </>
          )}
        </section>
      )}
      {!finished && !review && (
        <button
          disabled={blocked}
          className="primary-button"
          onClick={() => {
            setReview(true);
            setTimeout(
              () =>
                document
                  .querySelector(".execution-review")
                  ?.scrollIntoView({ block: "center" }),
              0,
            );
          }}
        >
          Finish workout
        </button>
      )}
      {picker && (
        <ExercisePicker
          definitions={[...DEFINITIONS, ...custom]}
          onClose={() => setPicker(null)}
          onSelect={(definition) => {
            if (
              picker !== "add" &&
              !confirm(
                "Replace remaining work? Recorded sets stay with the original exercise; new targets start blank.",
              )
            )
              return;
            edit({
              type: picker === "add" ? "add" : "replace",
              id: picker,
              definition,
            });
            setPicker(null);
          }}
        />
      )}
      {customOpen && (
        <CustomForm
          onCancel={() => setCustomOpen(false)}
          onSave={async (d) => {
            await saveV2("v2ExerciseDefinitions", d, null);
            setCustom([...custom, d]);
            edit({ type: "add", definition: d });
            setCustomOpen(false);
          }}
        />
      )}
    </div>
  );
}
