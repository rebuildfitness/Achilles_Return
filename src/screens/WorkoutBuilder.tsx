import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Card } from "../components/ui";
import { ExercisePicker, DemoLinks } from "../components/v2/ExercisePicker";
import { IllustratedExercise } from "../components/v2/IllustratedExercise";
import { SetEditor } from "../components/v2/TargetEditor";
import {
  DEFINITIONS,
  starterTemplates,
} from "../domain/v2/compositionContent.js";
import {
  visibleTargetFields,
  CATEGORY_OPTIONS,
  display,
  newDraft,
  fromTemplate,
  emptyIntent,
  copyTemplate,
  copyCompleted,
  compose,
  customDefinition,
  known,
  clone,
} from "../domain/v2/composition.js";
import { adaptSession } from "../domain/v2/adapters";
import { getAll } from "../db.js";
import {
  listV2,
  saveV2,
  archiveDefinition,
} from "../persistence/v2Repository.js";
import { draftWriter, archiveDraft } from "../persistence/compositionDraft.js";
import "./WorkoutBuilder.css";
import { GuidancePanel } from "../components/v2/GuidancePanel";

import { persistStart } from "../persistence/sessionExecution.js";
const WorkoutExecution = lazy(() => import("./WorkoutExecution"));
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
import {
  CustomForm,
  trackingLabels,
} from "../components/v2/CustomExerciseForm";

export default function WorkoutBuilder({ onBack, initialPlan = null }: { onBack: () => void; initialPlan?: any }) {
  const [activeSession, setActiveSession] = useState<any>(null),
    [executionSessions, setExecutionSessions] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]),
    [templates, setTemplates] = useState<any[]>([]),
    [custom, setCustom] = useState<any[]>([]),
    [history, setHistory] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(null),
    [intent, setIntent] = useState<any>(null),
    [sourceTemplate, setSourceTemplate] = useState<any>(null);
  const [status, setStatus] = useState("Loading…"),
    [error, setError] = useState(""),
    [picker, setPicker] = useState<string | null>(null),
    [customOpen, setCustomOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const writer = useRef<any>(null),
    intentRef = useRef<any>(null),
    mounted = useRef(true);
  const starters = useRef<any[]>(starterTemplates());
  async function refresh() {
    const [ds, ts, cs, hs, vs] = await Promise.all([
      listV2("v2PlannedWorkouts"),
      listV2("v2WorkoutTemplates"),
      listV2("v2ExerciseDefinitions"),
      getAll("sessions"),
      listV2("v2WorkoutSessions"),
    ]);
    if (!mounted.current) return;
    setExecutionSessions(vs.filter((s: any) => s.execution));
    setDrafts(ds.filter((d: any) => d.composition && !d.composition.archived));
    setTemplates(ts.filter((t: any) => !t.archived));
    setCustom(cs.filter((c: any) => !c.archived));
    const materialized = new Set(vs.map((s: any) => s.legacyOrigin?.id));
    setHistory([
      ...vs.filter((s: any) => ["completed", "partial"].includes(s.lifecycle)),
      ...hs
        .filter((s: any) => s.finishedAt && !materialized.has(s.id))
        .map((s: any) => adaptSession(s)),
    ]);
  }
  useEffect(() => {
    mounted.current = true;
    refresh()
      .then(() => { if(initialPlan) open(initialPlan); else setStatus("Ready"); })
      .catch((e) => setError(String(e)));
    return () => {
      mounted.current = false;
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
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  function open(d: any, t: any = null) {
    setDraft(d);
    setIntent(clone(d.snapshot));
    intentRef.current = clone(d.snapshot);
    setSourceTemplate(t);
    setNotice("");
    writer.current = draftWriter(d, (message: string, saved: any) => {
      if (!mounted.current) return;
      setStatus(message);
      if (message.includes("recovery draft")) setNotice(message);
      if (message.startsWith("Not saved")) setError(message);
      if (saved) setDraft(saved);
    });
    setStatus("Saved on this device");
  }
  async function start(t: any = null) {
    setStatus("Saving…");
    const d = t ? fromTemplate(t, today()) : newDraft(emptyIntent(), today());
    await saveV2("v2PlannedWorkouts", d, null);
    open(d, t?.source === "user" ? t : null);
  }
  function edit(command: any) {
    if (busy) return;
    try {
      const next = compose(intentRef.current, command);
      intentRef.current = next;
      setIntent(next);
      writer.current.save(next);
    } catch (e) {
      setError(String(e));
    }
  }
  async function leave() {
    if (writer.current) await writer.current.flush();
    setDraft(null);
    setIntent(null);
    writer.current = null;
    await refresh();
  }
  async function saveTemplate() {
    const t = await writer.current.saveTemplate(intentRef.current);
    setSourceTemplate(t);
    setNotice(
      "Saved as a new template. Future draft edits affect this workout only.",
    );
    await refresh();
  }
  if (activeSession)
    return (
      <Suspense fallback={<p>Loading workout…</p>}>
        <WorkoutExecution
          key={activeSession.id}
          initial={activeSession}
          onBack={() => {
            setActiveSession(null);
            refresh().catch((e) => setError(String(e)));
          }}
        />
      </Suspense>
    );
  return (
    <div className="workout-builder">
      <button
        className="text-button page-back"
        disabled={busy}
        onClick={() =>
          action(async () => {
            if (draft) await leave();
            else onBack();
          })
        }
      >
        ← {draft ? "All workout drafts" : "More"}
      </button>
      <div className="screen-heading">
        <p className="builder-eyebrow">YOUR TRAINING · YOUR CHOICES</p>
        <h1>Workout Builder</h1>
        <p>
          Compose your full workout, save a template, or start an independent
          training session.
        </p>
      </div>
      <p role="status" className="builder-save">
        {status}
      </p>
      {notice && <p role="status">{notice}</p>}
      {error && (
        <Card>
          <p role="alert">{error}</p>
          {draft && (
            <button
              onClick={() => {
                setError("");
                writer.current.save(intentRef.current);
              }}
            >
              Retry saving
            </button>
          )}
        </Card>
      )}
      {!draft && (
        <>
          <Card>
            <h2>Make it your own</h2>
            <p>Mix strength, rehab, cardio and movement in one workout.</p>
            <button
              className="primary-button"
              disabled={busy}
              onClick={() => action(() => start())}
            >
              Start blank workout
            </button>
          </Card>
          <Card>
            <h2>Your workouts</h2>
            {!executionSessions.length && <p>No sessions yet.</p>}
            {executionSessions.map((s) => (
              <div className="builder-saved" key={s.id}>
                <span>
                  {display(s.name)} · {display(s.date)} · {s.lifecycle}
                </span>
                <button onClick={() => setActiveSession(s)}>
                  {s.lifecycle === "in-progress"
                    ? "Resume workout"
                    : "View session"}
                </button>
              </div>
            ))}
          </Card>
          <Card>
            <h2>Your workout drafts</h2>
            {!drafts.length && <p>No drafts yet.</p>}
            {drafts.map((d) => (
              <div className="builder-saved" key={d.id}>
                <div>
                  <h3>{d.snapshot.name || "Untitled workout"}</h3>
                  <p>
                    {d.snapshot.occurrences.length} exercises · {d.date}
                  </p>
                </div>
                <button
                  disabled={busy}
                  onClick={() => {
                    const source = templates.find(
                      (t) => t.id === d.templateRef?.id,
                    );
                    open(
                      d,
                      source
                        ? { ...source, revision: d.templateRef.revision }
                        : null,
                    );
                  }}
                >
                  Edit draft
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      const n = newDraft(d.snapshot, today());
                      await saveV2("v2PlannedWorkouts", n, null);
                      open(n);
                    })
                  }
                >
                  Duplicate workout
                </button>
              </div>
            ))}
          </Card>
          <Card>
            <h2>Your templates</h2>
            {!templates.length && (
              <p>Save any workout as a reusable template.</p>
            )}
            {templates.map((t) => (
              <div className="builder-saved" key={t.id}>
                <h3>{t.name}</h3>
                <button disabled={busy} onClick={() => action(() => start(t))}>
                  Create workout / edit
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      const copy = {
                        ...copyTemplate(t, `${t.name} — copy`),
                        recordVersion: 1,
                        archived: false,
                      };
                      await saveV2("v2WorkoutTemplates", copy, null);
                      await refresh();
                    })
                  }
                >
                  Duplicate template
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      if (
                        !confirm(
                          "Archive this template? Existing workouts stay unchanged.",
                        )
                      )
                        return;
                      await saveV2(
                        "v2WorkoutTemplates",
                        { ...t, revision: t.revision + 1, archived: true },
                        t.revision,
                      );
                      await refresh();
                    })
                  }
                >
                  Archive template
                </button>
              </div>
            ))}
          </Card>
          <Card>
            <h2>Editable starters</h2>
            <p>
              Existing program structures, not personalized recommendations. All
              targets can be changed.
            </p>
            <div className="builder-starters">
              {starters.current.map((t) => (
                <button
                  key={t.id}
                  disabled={busy}
                  onClick={() => action(() => start(t))}
                >
                  {t.name}
                  <small>{t.occurrences.length} exercises</small>
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <h2>Copy a completed workout</h2>
            <p>
              Copies targets and structure. Actual performance and responses
              stay in history.
            </p>
            {!history.length && <p>No completed workouts on this device.</p>}
            {history.map((s) => (
              <div className="builder-saved" key={s.id}>
                <span>
                  {display(s.name) || "Workout"} · {display(s.date)}
                </span>
                <button
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      const d = newDraft(copyCompleted(s), today());
                      await saveV2("v2PlannedWorkouts", d, null);
                      open(d);
                    })
                  }
                >
                  Copy as new intent
                </button>
              </div>
            ))}
          </Card>
          <Card>
            <h2>Custom exercises</h2>
            <button onClick={() => setCustomOpen(true)}>
              Create custom exercise
            </button>
            {custom.map((d) => (
              <div className="builder-saved" key={d.id}>
                <span>{display(d.name)} · User-created</span>
                <button
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      if (
                        !confirm(
                          "Archive this custom exercise? Existing workout snapshots stay intact.",
                        )
                      )
                        return;
                      await archiveDefinition(d.id, d.revision);
                      await refresh();
                    })
                  }
                >
                  Archive exercise
                </button>
              </div>
            ))}
          </Card>
        </>
      )}
      {draft && intent && (
        <>
          <GuidancePanel
            subjectId={draft.id}
            changeToken={JSON.stringify(intent)}
            getSubject={() => writer.current.flush()}
            lock={setBusy}
            onApplied={(saved: any) => open(saved, sourceTemplate)}
            onModify={() =>
              document
                .querySelector(".builder-exercise")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          />
          <Card>
            <label>
              Workout name
              <input
                value={intent.name}
                onChange={(e) => edit({ type: "name", name: e.target.value })}
              />
            </label>
            <p>
              {intent.occurrences.length} exercises ·{" "}
              {intent.occurrences.reduce(
                (n: number, o: any) => n + o.sets.length,
                0,
              )}{" "}
              sets · This workout only
            </p>
            {!!intent.groups?.length && (
              <p className="helper">
                At Start: each group round uses one set per exercise. If there
                are fewer sets than rounds, the last target repeats for the
                remaining rounds. Extra sets stay as additional work. Original
                targets remain in the session snapshot.
              </p>
            )}
            <label>
              Workout notes
              <textarea
                aria-label="Workout notes"
                value={intent.notes || ""}
                onChange={(e) => edit({ type: "notes", notes: e.target.value })}
              />
            </label>
            <details>
              <summary>Training categories for guidance</summary>
              <p className="helper">
                Optional context you select. Categories do not establish
                clinical readiness or classify a custom exercise’s demand.
              </p>
              <div className="builder-fields">
                {CATEGORY_OPTIONS.map((category) => (
                  <label key={category}>
                    <input
                      type="checkbox"
                      checked={intent.categories.includes(category)}
                      onChange={(e) =>
                        edit({
                          type: "categories",
                          categories: e.target.checked
                            ? [...intent.categories, category]
                            : intent.categories.filter(
                                (c: string) => c !== category,
                              ),
                        })
                      }
                    />
                    {category}
                  </label>
                ))}
              </div>
            </details>
            <div className="builder-actions">
              <button
                className="primary-button"
                disabled={busy}
                onClick={() => action(saveTemplate)}
              >
                Save as template
              </button>
              <button
                disabled={busy}
                className="primary-button"
                onClick={() =>
                  action(async () => {
                    const saved = await writer.current.flush();
                    const session = await persistStart(saved);
                    setActiveSession(session);
                  })
                }
              >
                Start Workout
              </button>
              {sourceTemplate && (
                <button
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      await writer.current.flush();
                      if (
                        !confirm(
                          `Update reusable template “${sourceTemplate.name}”? Other workouts will not change.`,
                        )
                      )
                        return;
                      const t = await writer.current.saveTemplate(
                        intentRef.current,
                        sourceTemplate,
                      );
                      setSourceTemplate(t);
                      setNotice(
                        "Template updated explicitly. Existing workout snapshots are unchanged.",
                      );
                      await refresh();
                    })
                  }
                >
                  Update Template
                </button>
              )}
              <button
                disabled={busy}
                onClick={() =>
                  action(async () => {
                    if (
                      !confirm(
                        "Discard this draft? It will be archived; templates and workout history stay unchanged.",
                      )
                    )
                      return;
                    const saved = await writer.current.flush();
                    await archiveDraft(saved);
                    await leave();
                  })
                }
              >
                Discard draft
              </button>
            </div>
          </Card>
          <Card>
            <h2>Workout structure</h2>
            <p>
              Sequential unless you assign a group. Group rounds describe the
              sequence; sets below remain editable.
            </p>
            <div className="builder-actions">
              <button
                onClick={() =>
                  edit({
                    type: "add-group",
                    name: `Superset ${(intent.groups || []).length + 1}`,
                    kind: "superset",
                  })
                }
              >
                Add superset
              </button>
              <button
                onClick={() =>
                  edit({
                    type: "add-group",
                    name: `Circuit ${(intent.groups || []).length + 1}`,
                    kind: "circuit",
                  })
                }
              >
                Add circuit
              </button>
            </div>
            {(intent.groups || []).map((g: any) => (
              <div className="builder-group" key={g.id}>
                <label>
                  Group name
                  <input
                    value={g.name}
                    onChange={(e) =>
                      edit({
                        type: "edit-group",
                        groupId: g.id,
                        patch: { name: e.target.value },
                      })
                    }
                  />
                </label>
                <label>
                  Rounds
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={g.rounds}
                    onChange={(e) => {
                      if (e.target.validity.valid && e.target.value)
                        edit({
                          type: "edit-group",
                          groupId: g.id,
                          patch: { rounds: Number(e.target.value) },
                        });
                    }}
                  />
                </label>
                <button
                  onClick={() => edit({ type: "remove-group", groupId: g.id })}
                >
                  Remove group
                </button>
              </div>
            ))}
          </Card>
          <div className="builder-actions">
            <button className="primary-button" onClick={() => setPicker("add")}>
              Add exercise
            </button>
            <button onClick={() => setCustomOpen(true)}>
              Create custom exercise
            </button>
          </div>
          {!intent.occurrences.length && (
            <Card>
              <h2>A fresh start</h2>
              <p>
                Add an exercise from the library or create your own. Your draft
                is already saved.
              </p>
            </Card>
          )}
          {intent.occurrences.map((o: any, i: number) => {
            const d = o.definitionSnapshot,
              format = o.targetTrackingType || display(d.trackingType),
              fields = visibleTargetFields(o);
            return (
              <section
                className="card builder-exercise"
                key={o.id}
                aria-label={`${i + 1}. ${display(d.name)}`}
                data-occurrence={o.id}
              >
                <IllustratedExercise definition={d}>
                <div className="builder-exercise-title">
                  <span className="builder-number">{i + 1}</span>
                  <div>
                    <h2>{display(d.name) || d.id}</h2>
                    <p className="helper">
                      {d.categories.join(" · ")}
                      {d.provenance.origin === "custom"
                        ? " · User-created"
                        : ""}
                    </p>
                  </div>
                </div>
                <DemoLinks definition={d} />
                </IllustratedExercise>
                <div className="builder-actions">
                  <button
                    disabled={!i}
                    aria-label={`Move ${display(d.name)} up`}
                    onClick={() => edit({ type: "move", id: o.id, delta: -1 })}
                  >
                    ↑ Up
                  </button>
                  <button
                    disabled={i === intent.occurrences.length - 1}
                    aria-label={`Move ${display(d.name)} down`}
                    onClick={() => edit({ type: "move", id: o.id, delta: 1 })}
                  >
                    ↓ Down
                  </button>
                  <button onClick={() => setPicker(o.id)}>Replace</button>
                  <button onClick={() => edit({ type: "duplicate", id: o.id })}>
                    Duplicate exercise
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Remove this exercise and its targets from this draft?",
                        )
                      )
                        edit({ type: "remove", id: o.id });
                    }}
                  >
                    Remove exercise
                  </button>
                </div>
                <div className="builder-grid">
                  <label>
                    Target format
                    <select
                      aria-label="Target format"
                      value={format}
                      onChange={(e) =>
                        edit({
                          type: "exercise",
                          id: o.id,
                          patch: { targetTrackingType: e.target.value },
                        })
                      }
                    >
                      <option value="">Source metrics / unspecified</option>
                      {Object.entries(trackingLabels).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Group
                    <select
                      aria-label="Group"
                      value={o.groupId || ""}
                      onChange={(e) =>
                        edit({
                          type: "group",
                          id: o.id,
                          groupId: e.target.value,
                        })
                      }
                    >
                      <option value="">Sequential / ungrouped</option>
                      {(intent.groups || []).map((g: any) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.kind})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {display(o.targetDescription) && (
                  <p className="helper">
                    Starter target: {display(o.targetDescription)}. Edit the
                    individual targets below.
                  </p>
                )}
                <label>
                  Exercise notes
                  <input
                    value={display(o.target.notes)}
                    onChange={(e) =>
                      edit({
                        type: "exercise",
                        id: o.id,
                        patch: {
                          target: { ...o.target, notes: known(e.target.value) },
                        },
                      })
                    }
                  />
                </label>
                {o.sets.map((s: any, j: number) => (
                  <SetEditor
                    key={s.id}
                    set={s}
                    index={j}
                    count={o.sets.length}
                    fields={fields}
                    interval={format === "intervals" || s.intervals.length > 0}
                    onPatch={(patch) =>
                      edit({ type: "set", id: o.id, setId: s.id, patch })
                    }
                    onMove={(delta) =>
                      edit({ type: "move-set", id: o.id, setId: s.id, delta })
                    }
                    onRemove={() =>
                      edit({ type: "remove-set", id: o.id, setId: s.id })
                    }
                  />
                ))}
                <button onClick={() => edit({ type: "add-set", id: o.id })}>
                  Add set
                </button>
                <details>
                  <summary>Setup & source information</summary>
                  <p>{display(d.setup) || "Setup not specified."}</p>
                  <p>{d.sourceMetadata.notes}</p>
                  <p>
                    Rehab association:{" "}
                    {d.phaseAssociations.join(", ") || "Unknown"} · Demand:{" "}
                    {display(d.demandLevel) || "Unknown"}
                  </p>
                  <p>Clinical associations are information, not permission.</p>
                  {d.evidence.map((e: any, n: number) => (
                    <p key={n}>
                      {e.id || "Evidence unspecified"} {e.strength || ""}{" "}
                      {e.type || ""}
                    </p>
                  ))}
                </details>
              </section>
            );
          })}
          {!!intent.occurrences.length && (
            <button className="primary-button" onClick={() => setPicker("add")}>
              Add another exercise
            </button>
          )}
        </>
      )}
      {customOpen && (
        <CustomForm
          onCancel={() => setCustomOpen(false)}
          onSave={async (d) => {
            await saveV2("v2ExerciseDefinitions", d, null);
            await refresh();
            if (draft) edit({ type: "add", definition: d });
            setCustomOpen(false);
            setNotice(
              "Custom exercise saved with unverified media and unknown clinical demand.",
            );
          }}
        />
      )}
      {picker && (
        <ExercisePicker
          definitions={[...DEFINITIONS, ...custom]}
          onClose={() => setPicker(null)}
          onSelect={(definition) => {
            edit({
              type: picker === "add" ? "add" : "replace",
              id: picker,
              definition,
            });
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}
