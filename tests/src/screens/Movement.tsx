import { useEffect, useRef, useState } from "react";
import { Card, PrimaryButton } from "../components/ui";
import {
  MOVEMENT_TYPES,
  movementTitle,
  movementAmount,
  movementResponse,
} from "../data/movement.js";
import {
  loadMovement,
  saveMovementDraft,
  commitMovement,
  undoMovement,
  removeMovement,
} from "../persistence/movement.js";
import {
  MOVEMENT_ROUTINES,
  MOVEMENT_EXERCISES,
  createRoutineInstance,
  routineAvailability,
  actualFromDose,
} from "../data/movementRoutines.js";
import { dayKey } from "../data/provisionalWeek.js";
import type { Assessment, Session } from "../types";
import { MovementDemo } from "../components/MovementDemo";

type Context = {
  readiness?: string;
  assessment?: Assessment;
  equipment?: string[];
};
export function MovementScreen({
  date = dayKey(),
  initialType = "",
  onBack,
  onPlan,
  context = {},
  sessions = [],
}: {
  date?: string;
  initialType?: string;
  onBack: () => void;
  onPlan?: () => void;
  context?: Context;
  sessions?: Session[];
}) {
  const [records, setRecords] = useState<any[]>([]),
    [editor, setEditor] = useState<any>(null),
    [loaded, setLoaded] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [undo, setUndo] = useState(""),
    [choose, setChoose] = useState(false),
    [custom, setCustom] = useState(false);
  const queue = useRef<Promise<unknown>>(Promise.resolve()),
    revisions = useRef<Record<string, number>>({}),
    editRef = useRef<any>(null),
    lock = useRef(false);
  const updateEditor = (r: any) => {
    editRef.current = r;
    setEditor(r);
  };
  async function reload() {
    const all = await loadMovement();
    setRecords(all);
    return all;
  }
  useEffect(() => {
    let active = true;
    loadMovement()
      .then((all) => {
        if (active) {
          setRecords(all);
          setLoaded(true);
          setChoose(!!initialType);
        }
      })
      .catch((e) => {
        if (active) setError(String(e));
      });
    return () => {
      active = false;
    };
  }, [date]);
  const started = useRef(false);
  useEffect(() => {
    if (loaded && initialType && !started.current) {
      started.current = true;
      void begin(initialType);
    }
  }, [loaded]);
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(""), 30000);
    return () => clearTimeout(t);
  }, [undo]);
  async function persist(record: any) {
    const next = await saveMovementDraft({
      ...record,
      revision: revisions.current[record.id] ?? record.revision,
    });
    revisions.current[record.id] = (next as any).revision;
    if (editRef.current?.id === record.id)
      updateEditor({ ...editRef.current, revision: (next as any).revision });
    setError("");
    return next;
  }
  function change(patch: any) {
    const next = { ...editRef.current, ...patch };
    updateEditor(next);
    queue.current = queue.current.catch(() => {}).then(() => persist(next));
    queue.current.catch((e) => setError(String(e.message || e)));
  }
  async function begin(type: string, copy?: any, editing = false) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await queue.current;
      const now = new Date().toISOString();
      const base = {
        id: `movement-${crypto.randomUUID()}`,
        kind: "activity",
        movementRecordSchemaVersion: 1,
        date,
        status: "draft",
        revision: 1,
        activityType: type,
        cycleType: "indoor",
        quantity: {
          steps: null,
          durationMinutes: null,
          distance: null,
          distanceUnit: "mi",
        },
        tags: context.readiness === "GREEN" ? [] : ["unplanned"],
        notes: "",
        createdAt: now,
        updatedAt: now,
      };
      const next = copy
        ? {
            ...copy,
            ...base,
            activityType: copy.activityType,
            quantity: copy.quantity,
            cycleType: copy.cycleType || "indoor",
            name: copy.name,
            notes: editing ? copy.notes : "",
            symptoms: editing ? copy.symptoms : null,
            routineInstance: copy.routineInstance
              ? editing
                ? structuredClone(copy.routineInstance)
                : createRoutineInstance(copy.routineInstance.definitionSnapshot)
              : undefined,
            wasModified: editing ? copy.wasModified : false,
            ...(editing
              ? {
                  editTargetId: copy.id,
                  baseRevision: copy.revision,
                  editReason: "",
                }
              : {}),
          }
        : base;
      updateEditor(next);
      queue.current = persist(next);
      await queue.current;
      setChoose(false);
      setCustom(false);
      setMessage("");
      setUndo("");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  async function backToSummary() {
    setBusy(true);
    try {
      await queue.current;
      await reload();
      updateEditor(null);
      setChoose(false);
      setCustom(false);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  async function save(ids: string[]) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await queue.current;
      const tx = await commitMovement(ids);
      await reload();
      updateEditor(null);
      setChoose(false);
      setUndo(String(tx));
      setMessage("Movement saved on this device.");
    } catch (e) {
      setError(String((e as Error).message || e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const day = records.filter((r) => r.date === date),
    drafts = day.filter((r) => r.status === "draft"),
    saved = day.filter((r) => r.status === "saved");
  const recent = [...records]
    .filter(
      (r) =>
        r.status === "saved" &&
        r.date <= date &&
        ["walk", "cycle"].includes(r.activityType) &&
        r.cycleType !== "outdoor",
    )
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))[0];
  const maySuggest =
    routineAvailability({ steps: [] }, context).allowed &&
    context.readiness === "GREEN";
  function stepChange(index: number, patch: any) {
    const instance = structuredClone(editor.routineInstance);
    instance.exerciseCompletions[index] = {
      ...instance.exerciseCompletions[index],
      ...patch,
    };
    if (
      (patch.actual && !patch.doseConfirmed) ||
      patch.substitutionName ||
      patch.substitutionExerciseId ||
      patch.status === "skipped"
    )
      instance.wasModified = true;
    change({ routineInstance: instance });
  }
  function quantity(key: string, value: string) {
    change({
      quantity: {
        ...editor.quantity,
        [key]: value === "" ? null : Number(value),
      },
    });
  }
  return (
    <>
      <button
        className="text-button page-back"
        disabled={busy}
        onClick={async () => {
          try {
            await queue.current;
            onBack();
          } catch (e) {
            setError(String(e));
          }
        }}
      >
        ← Back
      </button>
      <div className="screen-heading">
        <h1>Movement & Recovery</h1>
        <p>
          Log walking, conditioning, mobility, core, balance, and recovery work.
        </p>
      </div>
      <p className="movement-date">
        {date} · Log what you did—not what you planned.
      </p>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {message && (
        <Card className="movement-feedback">
          <p role="status" aria-live="polite">
            {message}
          </p>
          {undo && (
            <button
              className="text-button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await undoMovement(undo);
                  await reload();
                  setUndo("");
                  setMessage(
                    "Save undone. Other activities and workouts are unchanged.",
                  );
                } catch (e) {
                  setError(String(e));
                } finally {
                  setBusy(false);
                }
              }}
            >
              Undo save
            </button>
          )}
          <button className="text-button" onClick={onBack}>
            Done
          </button>
        </Card>
      )}
      {!loaded && !error && <Card>Opening movement history…</Card>}
      {loaded && !editor && (
        <>
          {onPlan && (
            <Card>
              <h3>Your prescribed Achilles work</h3>
              <p>
                Scheduled work, completed sets and required responses remain in
                Today.
              </p>
              <button className="secondary-button" onClick={onPlan}>
                Continue today’s Achilles plan
              </button>
            </Card>
          )}
          <Card>
            <h2>
              {date === dayKey() ? "Today’s movement" : "Movement on this date"}
            </h2>
            {!saved.length && !drafts.length && (
              <p>No activities recorded yet.</p>
            )}
            {!!saved.length && (
              <h3 className="movement-subheading">Saved today</h3>
            )}
            {saved.map((r) => (
              <div className="movement-summary" key={r.id}>
                <div>
                  <strong>{movementTitle(r)}</strong>
                  <p>{movementAmount(r)}</p>
                  <small>
                    {r.routineInstance?.wasModified || r.wasModified
                      ? "Saved · Modified"
                      : "Saved"}
                    {r.tags?.includes("unplanned") ? " · Unplanned" : ""}
                  </small>
                  {movementResponse(r, sessions).status ===
                    "PENDING_NEXT_DAY_RESPONSE" && (
                    <p>Linked workout response pending — record it on Today.</p>
                  )}
                  {r.legacy && (
                    <small>
                      Earlier recovery record; original detail retained.
                    </small>
                  )}
                </div>
                <button
                  className="text-button"
                  disabled={busy}
                  aria-label={`Edit ${movementTitle(r)}`}
                  onClick={() => begin(r.activityType, r, true)}
                >
                  Edit
                </button>
                <button
                  className="text-button"
                  disabled={busy}
                  aria-label={`Remove saved ${movementTitle(r)}`}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await removeMovement(r);
                      await reload();
                      setMessage(
                        "Activity removed. Its edit history is retained.",
                      );
                      setUndo("");
                    } catch (e) {
                      setError(String(e));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            {!!drafts.length && (
              <h3 className="movement-subheading">
                Drafts · not counted in progress
              </h3>
            )}
            {drafts.map((r) => (
              <div className="movement-summary" key={r.id}>
                <div>
                  <strong>{movementTitle(r)}</strong>
                  <p>{movementAmount(r)}</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => {
                    revisions.current[r.id] = r.revision;
                    updateEditor(r);
                  }}
                >
                  Resume draft
                </button>
                <button
                  className="text-button"
                  disabled={busy}
                  aria-label={`Remove draft ${movementTitle(r)}`}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await removeMovement(r);
                      await reload();
                    } catch (e) {
                      setError(String(e));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              className="secondary-button"
              disabled={busy}
              onClick={() => setChoose(!choose)}
            >
              + Add activity
            </button>
          </Card>
          {recent && maySuggest && !choose && (
            <Card>
              <h3>Repeat last</h3>
              <p>
                {movementTitle(recent)} · {movementAmount(recent)}
              </p>
              <button
                className="text-button"
                disabled={busy}
                onClick={() => begin(recent.activityType, recent)}
              >
                Repeat last activity
              </button>
            </Card>
          )}
          {(choose || (!saved.length && !drafts.length)) && (
            <Card>
              <h2>What supported your movement today?</h2>
              <div className="movement-tiles">
                {Object.entries(MOVEMENT_TYPES).map(([id, label]) => (
                  <button
                    className="secondary-button"
                    key={id}
                    disabled={busy}
                    onClick={() => begin(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Card>
          )}
          {!!drafts.length && (
            <div className="movement-footer">
              <PrimaryButton
                disabled={busy}
                onClick={() => save(drafts.map((r) => r.id))}
              >
                Save {drafts.length}{" "}
                {drafts.length === 1 ? "activity" : "activities"}
              </PrimaryButton>
            </div>
          )}
        </>
      )}
      {editor && (
        <>
          <button
            className="text-button"
            disabled={busy}
            onClick={backToSummary}
          >
            ← Today’s movement
          </button>
          <Card className="movement-editor">
            <div className="section-heading">
              <h2>
                {
                  MOVEMENT_TYPES[
                    editor.activityType as keyof typeof MOVEMENT_TYPES
                  ]
                }
              </h2>
              <span className="pill">Draft</span>
            </div>
            {!["walk", "cycle", "other"].includes(editor.activityType) &&
              !editor.routineInstance && (
                <>
                  <h3>Choose a routine</h3>
                  {MOVEMENT_ROUTINES.filter(
                    (r) => r.category === editor.activityType,
                  ).map((r) => {
                    const availability = routineAvailability(r, context);
                    return (
                      <div className="movement-routine" key={r.routineId}>
                        <strong>{r.name}</strong>
                        <p>
                          {r.estimatedDurationMinutes} min · {r.steps.length}{" "}
                          exercises
                        </p>
                        <small>{availability.reason}</small>
                        <button
                          className="secondary-button"
                          onClick={() =>
                            change({
                              routineInstance: createRoutineInstance(r),
                              tags: availability.allowed ? [] : ["unplanned"],
                            })
                          }
                        >
                          {availability.allowed
                            ? "Open routine"
                            : "Record completed routine as unplanned"}
                        </button>
                      </div>
                    );
                  })}
                  <button
                    className="text-button"
                    onClick={() => setCustom(!custom)}
                  >
                    Build a custom session
                  </button>
                  {custom && (
                    <div>
                      {MOVEMENT_EXERCISES.filter(
                        (e) => e.category === editor.activityType,
                      ).map((e) => (
                        <button
                          key={e.id}
                          className="movement-exercise-pick"
                          onClick={() => {
                            const r = {
                              routineId: "custom",
                              routineVersion: "1.0.0",
                              name: "Custom session",
                              category: editor.activityType,
                              steps: [
                                {
                                  exerciseId: e.id,
                                  name: e.name,
                                  defaultDose: e.defaultDose,
                                  setupCues: e.setup,
                                  substitution: e.substitution,
                                },
                              ],
                              sourceMetadata: { source: "User selected" },
                            };
                            change({
                              routineInstance: createRoutineInstance(r),
                            });
                          }}
                        >
                          {e.name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            {editor.activityType === "walk" && (
              <fieldset>
                <legend>Quick steps</legend>
                <div className="movement-chips">
                  {[2500, 5000, 8000, 10000].map((n) => (
                    <button
                      type="button"
                      key={n}
                      aria-pressed={editor.quantity.steps === n}
                      onClick={() => quantity("steps", String(n))}
                    >
                      {n.toLocaleString()}
                    </button>
                  ))}
                </div>
                <label>
                  Custom steps
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editor.quantity.steps ?? ""}
                    onChange={(e) => quantity("steps", e.target.value)}
                  />
                </label>
              </fieldset>
            )}
            {editor.activityType === "cycle" && (
              <>
                <fieldset>
                  <legend>Cycle type</legend>
                  <div className="movement-chips">
                    {["indoor", "outdoor"].map((type) => (
                      <button
                        key={type}
                        aria-pressed={editor.cycleType === type}
                        onClick={() =>
                          change({
                            cycleType: type,
                            tags:
                              type === "outdoor"
                                ? ["outdoor", "unplanned"]
                                : [],
                          })
                        }
                      >
                        {type === "indoor" ? "Indoor" : "Outdoor"}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Duration</legend>
                  <div className="movement-chips">
                    {[10, 15, 20, 25, 30].map((n) => (
                      <button
                        key={n}
                        aria-pressed={editor.quantity.durationMinutes === n}
                        onClick={() => quantity("durationMinutes", String(n))}
                      >
                        {n} min
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            {editor.routineInstance && (
              <div>
                <h3>{editor.routineInstance.definitionSnapshot.name}</h3>
                <p>
                  {
                    editor.routineInstance.exerciseCompletions.filter(
                      (s: any) => s.status === "completed",
                    ).length
                  }{" "}
                  of {editor.routineInstance.exerciseCompletions.length}{" "}
                  complete · v{editor.routineInstance.routineVersion}
                </p>
                {editor.routineInstance.definitionSnapshot.steps.map(
                  (step: any, i: number) => {
                    const done = editor.routineInstance.exerciseCompletions[i];
                    return (
                      <div className="movement-step" key={done.id}>
                        <button
                          className="movement-step-check"
                          aria-pressed={done.status === "completed"}
                          onClick={() =>
                            stepChange(i, {
                              status:
                                done.status === "completed"
                                  ? "pending"
                                  : "completed",
                              doseConfirmed: done.status !== "completed",
                              actual:
                                done.status === "completed"
                                  ? done.actual
                                  : {
                                      ...actualFromDose(step.defaultDose),
                                      ...Object.fromEntries(
                                        Object.entries(
                                          done.actual || {},
                                        ).filter(([, v]) => v != null),
                                      ),
                                    },
                            })
                          }
                        >
                          <span aria-hidden="true">
                            {done.status === "completed" ? "✓" : "○"}
                          </span>
                          <span>
                            {step.name}
                            <small>
                              {step.defaultDose} · Tap to confirm shown dose
                            </small>
                          </span>
                        </button>
                        <MovementDemo exerciseId={step.exerciseId} />
                        <p>{step.setupCues}</p>
                        <details>
                          <summary>Actual amounts, alternative or skip</summary>
                          <div className="movement-actual">
                            {[
                              "sets",
                              "reps",
                              "repsPerSide",
                              "durationSeconds",
                              "distance",
                              "breaths",
                              "stepsPerSide",
                              "reachesPerDirectionPerSide",
                            ].map((key) => (
                              <label key={key}>
                                {
                                  {
                                    sets: "Sets",
                                    reps: "Reps",
                                    breaths: "Breaths",
                                    stepsPerSide: "Steps per side",
                                    reachesPerDirectionPerSide:
                                      "Reaches per direction / side",
                                    repsPerSide: "Reps per side",
                                    durationSeconds: "Seconds",
                                    distance: "Distance (m)",
                                  }[key]
                                }
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={done.actual?.[key] ?? ""}
                                  onChange={(e) =>
                                    stepChange(i, {
                                      actual: {
                                        ...done.actual,
                                        [key]:
                                          e.target.value === ""
                                            ? null
                                            : Number(e.target.value),
                                      },
                                    })
                                  }
                                />
                              </label>
                            ))}
                          </div>
                          <label>
                            <input
                              type="checkbox"
                              checked={done.status === "skipped"}
                              onChange={(e) =>
                                stepChange(i, {
                                  status: e.target.checked
                                    ? "skipped"
                                    : "pending",
                                })
                              }
                            />{" "}
                            Skipped
                          </label>
                          <label>
                            Skip reason / setup notes
                            <input
                              value={done.notes || ""}
                              onChange={(e) =>
                                stepChange(i, { notes: e.target.value })
                              }
                            />
                          </label>
                          <p>Suggested alternative: {step.substitution}</p>
                          <label>
                            Alternative actually performed
                            <input
                              value={done.substitutionName || ""}
                              onChange={(e) =>
                                stepChange(i, {
                                  substitutionName: e.target.value,
                                })
                              }
                            />
                          </label>
                        </details>
                      </div>
                    );
                  },
                )}
                <details>
                  <summary>Add another exercise</summary>
                  {MOVEMENT_EXERCISES.map((e) => (
                    <button
                      className="movement-exercise-pick"
                      key={e.id}
                      onClick={() => {
                        const instance = structuredClone(
                          editor.routineInstance,
                        );
                        instance.definitionSnapshot.steps.push({
                          exerciseId: e.id,
                          name: e.name,
                          defaultDose: e.defaultDose,
                          setupCues: e.setup,
                          substitution: e.substitution,
                        });
                        instance.exerciseCompletions.push({
                          id: crypto.randomUUID(),
                          exerciseId: e.id,
                          status: "pending",
                          actual: {},
                        });
                        instance.wasModified = true;
                        change({ routineInstance: instance });
                      }}
                    >
                      {e.name}
                    </button>
                  ))}
                </details>
              </div>
            )}
            {!editor.routineInstance &&
              !["walk", "cycle"].includes(editor.activityType) && (
                <label>
                  Activity name
                  <input
                    value={editor.name || ""}
                    onChange={(e) =>
                      change({ name: e.target.value, tags: ["unplanned"] })
                    }
                  />
                </label>
              )}
            <label>
              {editor.activityType === "cycle"
                ? "Cycling duration (minutes)"
                : "Actual duration (minutes, optional)"}
              <input
                type="number"
                min="0"
                step="any"
                value={editor.quantity.durationMinutes ?? ""}
                onChange={(e) => quantity("durationMinutes", e.target.value)}
              />
            </label>
            <details>
              <summary>Distance, effort & symptoms (optional)</summary>
              <label>
                Distance
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={editor.quantity.distance ?? ""}
                  onChange={(e) => quantity("distance", e.target.value)}
                />
              </label>
              <label>
                Distance unit
                <select
                  value={editor.quantity.distanceUnit || "mi"}
                  onChange={(e) =>
                    change({
                      quantity: {
                        ...editor.quantity,
                        distanceUnit: e.target.value,
                      },
                    })
                  }
                >
                  <option value="mi">Miles</option>
                  <option value="km">Kilometers</option>
                </select>
              </label>
              <label>
                Linked prescribed workout (optional)
                <select
                  value={editor.linkedSessionId || ""}
                  onChange={(e) =>
                    change({ linkedSessionId: e.target.value || null })
                  }
                >
                  <option value="">Independent activity</option>
                  {sessions
                    .filter((s) => s.date === date)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.date} · {s.status}
                      </option>
                    ))}
                </select>
              </label>
              <p>
                Linking references the original workout; its sets and
                next-morning response stay there.
              </p>
              <label>
                Effort
                <select
                  value={editor.effort || ""}
                  onChange={(e) => change({ effort: e.target.value })}
                >
                  <option value="">Not recorded</option>
                  {["easy", "moderate", "hard"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              {["painDuring", "painAfter"].map((key) => (
                <label key={key}>
                  {key === "painDuring"
                    ? "Pain during (0–10)"
                    : "Pain immediately after (0–10)"}
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={editor.symptoms?.[key] ?? ""}
                    onChange={(e) =>
                      change({
                        symptoms: {
                          ...editor.symptoms,
                          [key]:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        },
                      })
                    }
                  />
                </label>
              ))}
              <label>
                Surface / incline / notes
                <textarea
                  value={editor.notes || ""}
                  onChange={(e) => change({ notes: e.target.value })}
                />
              </label>
            </details>
            {editor.editTargetId && (
              <label>
                Edit reason (optional)
                <input
                  value={editor.editReason || ""}
                  onChange={(e) => change({ editReason: e.target.value })}
                />
              </label>
            )}
          </Card>
          <div className="movement-footer">
            <button
              className="secondary-button"
              disabled={busy}
              onClick={backToSummary}
            >
              Add to today
            </button>
            <PrimaryButton disabled={busy} onClick={() => save([editor.id])}>
              {busy ? "Saving…" : "Save activity"}
            </PrimaryButton>
          </div>
        </>
      )}
      <details className="detail-section">
        <summary>How logging works</summary>
        <p>
          Factual activity logs do not grant permission, medical clearance or
          progression credit. Your prescribed workout and its next-morning
          response remain in Today. Drafts do not count in Progress. Changes
          save locally; external demos need internet.
        </p>
      </details>
    </>
  );
}
