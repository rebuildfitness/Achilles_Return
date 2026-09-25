import { lazy, Suspense, useEffect, useState } from "react";
import { AppHeader, Icon, Card } from "./components/ui";
import { EVIDENCE } from "./data/evidence.js";
import { DailyBrand } from "./components/DailyBrand";
import { readTimeline, startPlanned } from "./persistence/planningHistory.js";
import { unified, val, readable } from "./domain/v2/timeline.js";
import { completedTraining, responseRecorded } from "./domain/v2/progress.js";
import { emptyIntent, newDraft, occurrence } from "./domain/v2/composition.js";
import { saveV2 } from "./persistence/v2Repository.js";
import { day } from "./domain/v2/planning.js";
import { GuidancePanel } from "./components/v2/GuidancePanel";
import "./FinalApp.css";
const Builder = lazy(() => import("./screens/WorkoutBuilder"));
const Execution = lazy(() => import("./screens/WorkoutExecution"));
const Records = lazy(() => import("./screens/TrainingRecords"));
const Progress = lazy(() => import("./screens/ProgressV2"));
const Guide = lazy(() => import("./screens/RehabGuide"));
const Settings = lazy(() => import("./screens/SettingsV2"));
const Assessments = lazy(() => import("./screens/AssessmentsV2"));
const destinations = [
  "Today",
  "Train",
  "Plan",
  "Progress",
  "Explore",
  "Calendar",
  "History",
  "Exercise history",
  "Exposure history",
  "Symptoms",
  "Learn",
  "Settings",
  "Assessments",
  "Guidance",
];
function route() {
  let h='';try{h=decodeURIComponent(location.hash.slice(1))}catch{return 'Today'}
  return destinations.includes(h)
    ? h
    : h === "More"
      ? "Explore"
      : h === "Tests"
        ? "Assessments"
        : "Today";
}
export default function FinalApp() {
  const [tab, setTab] = useState(route),
    [data, setData] = useState<any>(null),
    [screen, setScreen] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [online, setOnline] = useState(navigator.onLine),
    [update, setUpdate] = useState<any>(null),
    [currentDate,setCurrentDate]=useState(day);
  async function refresh() {
    setData(await readTimeline());
  }
  useEffect(() => {
    refresh().catch((e) => setError(String(e)));
    const hash = () => {
      setTab(route());
      setScreen(null);
      refresh().catch((e) => setError(String(e)));
    };
    const net = () => setOnline(navigator.onLine);
    const sw = (e: any) => setUpdate(e.detail);
    const failed=()=>setError('Offline setup could not finish. Reconnect and reload before relying on offline access.');
    const focused=()=>{setCurrentDate(day());refresh().catch(e=>setError(String(e)))};
    const midnight=setInterval(()=>setCurrentDate(day()),30000);
    addEventListener("hashchange", hash);
    addEventListener("online", net);
    addEventListener("offline", net);
    addEventListener("pwa-update", sw);
    addEventListener('pwa-error',failed);addEventListener('focus',focused);
    return () => {
      removeEventListener("hashchange", hash);
      removeEventListener("online", net);
      removeEventListener("offline", net);
      removeEventListener("pwa-update", sw);
      removeEventListener('pwa-error',failed);removeEventListener('focus',focused);clearInterval(midnight);
    };
  }, []);
  function navigate(next: string) {
    setScreen(null);
    setTab(next);
    location.hash = next;
    window.scrollTo(0, 0);
    refresh().catch((e) => setError(String(e)));
  }
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  async function blank(definition?: any) {
    const intent: any = emptyIntent(
      definition ? "Workout with " + readable(definition.name) : "My workout",
    );
    if (definition) intent.occurrences = [occurrence(definition)];
    const draft = newDraft(intent, day());
    await saveV2("v2PlannedWorkouts", draft, null);
    setScreen({ kind: "builder", record: draft });
  }
  const sessions = data ? unified(data) : [],
    active = sessions.filter(
      (s: any) => s.lifecycle === "in-progress" && s.execution,
    ),
    today = currentDate,
    finished = data ? completedTraining(data) : [],
    plans = (data?.v2PlannedWorkouts || []).filter(
      (p: any) =>
        p.planning &&
        !p.planning.archived &&
        p.status === "planned" &&
        p.date === today &&
        !sessions.some((s: any) => s.planRef === p.id),
    ),
    pending = finished.filter(
      (s: any) =>
        val(s.date) < today &&
        !responseRecorded(s, data.v2Observations),
    ),
    subject = active[0] || plans[0];
  const back = () => {
    setScreen(null);
    refresh().catch((e) => setError(String(e)));
  };
  const record = (s: any) =>
    setScreen({ kind: "records", record: s, view: "History" });
  const recordsViews: Record<string, string> = {
    Plan: "Weekly Plan",
    Calendar: "Calendar",
    History: "History",
    "Exercise history": "Exercise history",
    "Exposure history": "Exposure history",
    Symptoms: "Symptoms",
  };
  return (
    <div className="app-shell final-app">
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Skip to content
      </a>
      <AppHeader onProfile={() => navigate("Settings")} />
      <main id="main" className="content" tabIndex={-1}>
        {!online && (
          <p role="status">
            Offline — saved workouts and local tools remain available. Remote
            demos need internet.
          </p>
        )}
        {update && (
          <Card>
            <p>An app update is ready. Save your work before reloading.</p>
            <button
              onClick={() => {
                navigator.serviceWorker.addEventListener(
                  "controllerchange",
                  () => location.reload(),
                  { once: true },
                );
                update.waiting?.postMessage("ACTIVATE_UPDATE");
              }}
            >
              Reload app update
            </button>
          </Card>
        )}
        {error && <p role="alert">{error}</p>}
        <Suspense fallback={<p role="status">Loading…</p>}>
          {screen?.kind === "builder" ? (
            <Builder initialPlan={screen.record} onBack={back} />
          ) : screen?.kind === "execution" ? (
            <Execution initial={screen.record} onBack={back} />
          ) : screen?.kind === "records" ? (
            <Records
              initialView={screen.view}
              initialRecord={screen.record}
              onBack={back}
            />
          ) : recordsViews[tab] ? (
            <Records
              key={tab}
              initialView={recordsViews[tab]}
              onBack={() => navigate("Today")}
            />
          ) : tab === "Progress" ? (
            <Progress navigate={navigate} />
          ) : tab === "Learn" ? (
            <Guide
              navigate={navigate}
              addExercise={(d: any) => action(() => blank(d))}
            />
          ) : tab === "Settings" ? (
            <Settings navigate={navigate} />
          ) : tab === "Assessments" ? (
            <Assessments />
          ) : tab === "Explore" ? (
            <section className="final-screen">
              <h1>Explore</h1>
              <div className="final-grid">
                {[
                  "Calendar",
                  "History",
                  "Learn",
                  "Assessments",
                  "Guidance",
                  "Settings",
                ].map((t) => (
                  <button key={t} onClick={() => navigate(t)}>
                    {t === "Learn" ? "Learn / Rehab Guide" : t}
                  </button>
                ))}
              </div>
            </section>
          ) : tab === "Guidance" ? (
            <section className="final-screen">
              <h1>Guidance history</h1>
              <p>
                Prior findings are historical. Continue Anyway is not medical
                clearance. Open the workout to refresh current guidance.
              </p>
              {!(data?.v2GuidanceEvents || []).length && (
                <Card>No guidance recorded yet.</Card>
              )}
              {(data?.v2GuidanceEvents || [])
                .slice()
                .reverse()
                .map((g: any) => (
                  <Card key={g.id}>
                    <h2>{g.level.replaceAll("_", " ")}</h2>
                    <p>{g.finding || g.explanation}</p>
                    <p>{g.explanation}</p>
                    <details>
                      <summary>Evidence / details</summary>
                      <p>
                        {readable(g.sourceIds)} · Rule {g.ruleId}{" "}
                        {g.ruleVersion} · {g.createdAt || g.at}
                      </p>
                      <p>
                        Evaluated workout revision {g.subjectRevision};
                        historical context.
                      </p>
                      {(g.evidence || []).map((e: any, i: number) => {
                        const source = e.url
                          ? e
                          : EVIDENCE.find((x: any) => x.id === g.sourceIds[i]);
                        return source?.url ? (
                          <p key={i}>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {source.title || source.id}
                            </a>{" "}
                            · {source.summary || source.limitations}
                          </p>
                        ) : null;
                      })}
                    </details>
                    {(data.v2GuidanceDecisions || [])
                      .filter((d: any) => d.guidanceId === g.id)
                      .map((d: any) => (
                        <p key={d.id}>
                          Decision: {d.action} · {d.at}. This is not clearance.
                        </p>
                      ))}
                    <button
                      onClick={() => {
                        const s = sessions.find(
                            (s: any) => s.id === g.subjectId,
                          ),
                          p = data.v2PlannedWorkouts.find(
                            (p: any) => p.id === g.subjectId,
                          );
                        if (s) record(s);
                        else if (p)
                          setScreen({
                            kind: "records",
                            record: p,
                            view: "Weekly Plan",
                          });
                      }}
                    >
                      Open related workout
                    </button>
                  </Card>
                ))}
            </section>
          ) : (
            <section className="final-screen">
              <h1>{tab === "Train" ? "Train" : "Today"}</h1>
              <p>
                {tab === "Train"
                  ? "Build, train and review. Your workout, your decisions."
                  : new Date(today + "T12:00:00").toLocaleDateString(
                      undefined,
                      { weekday: "long", month: "long", day: "numeric" },
                    )}
              </p>
              <div className="final-actions">
                <button
                  className="primary-button"
                  disabled={busy}
                  onClick={() => action(() => blank())}
                >
                  Start Blank Workout
                </button>
                <button onClick={() => setScreen({ kind: "builder" })}>
                  Workout Builder & templates
                </button>
                <button onClick={() => navigate("Calendar")}>
                  View today in Calendar
                </button>
              </div>
              {!data ? (
                <p role="status">Loading workouts…</p>
              ) : (
                <>
                  <Card>
                    <h2>Resume workout</h2>
                    {!active.length && <p>No active workout.</p>}
                    {active.map((s: any) => (
                      <div className="final-row" key={s.id}>
                        <span>
                          {readable(s.name)} · {val(s.date)}
                        </span>
                        <button
                          onClick={() =>
                            setScreen({ kind: "execution", record: s })
                          }
                        >
                          Resume Workout
                        </button>
                      </div>
                    ))}
                  </Card>
                  <Card>
                    <h2>Today's planned workouts</h2>
                    {!plans.length && (
                      <p>
                        No workouts planned today. You can train now or add a
                        plan.
                      </p>
                    )}
                    {plans.map((p: any) => (
                      <div className="final-row" key={p.id}>
                        <h3>{p.snapshot.name}</h3>
                        <button
                          disabled={busy}
                          onClick={() =>
                            action(async () =>
                              setScreen({
                                kind: "execution",
                                record: await startPlanned(p),
                              }),
                            )
                          }
                        >
                          Start Planned Workout
                        </button>
                        <button
                          onClick={() =>
                            setScreen({ kind: "builder", record: p })
                          }
                        >
                          Edit workout
                        </button>
                      </div>
                    ))}
                    <button onClick={() => navigate("Plan")}>Open Plan</button>
                  </Card>
                  {tab === "Today" && pending.length > 0 && (
                    <Card>
                      <h2>Next-day response</h2>
                      <p>
                        {pending.length} workouts await a recorded response.
                        This does not prevent training.
                      </p>
                      {pending.slice(0, 3).map((s: any) => (
                        <div key={s.id}>
                          <p>
                            {readable(s.name)} · {val(s.date)}
                          </p>
                          <button onClick={() => record(s)}>
                            Record Next-Day Response
                          </button>
                        </div>
                      ))}
                    </Card>
                  )}
                  {subject && (
                    <GuidancePanel
                      subjectId={subject.id}
                      changeToken={subject.revision}
                      getSubject={async () => subject}
                      lock={setBusy}
                      onModify={() =>
                        setScreen({
                          kind: subject.execution ? "execution" : "builder",
                          record: subject,
                        })
                      }
                      onApplied={refresh}
                    />
                  )}
                  <Card>
                    <h2>
                      {tab === "Train" ? "Recent workouts" : "Completed today"}
                    </h2>
                    {!finished.filter(
                      (s: any) => tab === "Train" || val(s.date) === today,
                    ).length && (
                      <p>
                        No completed workouts recorded
                        {tab === "Today" ? " today" : ""}.
                      </p>
                    )}
                    {finished
                      .filter(
                        (s: any) => tab === "Train" || val(s.date) === today,
                      )
                      .slice()
                      .reverse()
                      .slice(0, 5)
                      .map((s: any) => (
                        <div className="final-row" key={s.id}>
                          <span>
                            {readable(s.name)} · {val(s.date)} · {s.lifecycle}
                          </span>
                          <button onClick={() => record(s)}>
                            Review workout
                          </button>
                        </div>
                      ))}
                    <button onClick={() => navigate("History")}>
                      Open History
                    </button>
                  </Card>
                  {tab === "Train" && (
                    <Card>
                      <h2>Templates, starters and custom exercises</h2>
                      <p>
                        Use a saved template, an editable starter, or copy
                        previous workout intent. All exercises remain
                        selectable.
                      </p>
                      <button onClick={() => setScreen({ kind: "builder" })}>
                        Browse templates / starters / custom exercises
                      </button>
                    </Card>
                  )}
                  {tab === "Today" && <DailyBrand />}
                </>
              )}
            </section>
          )}
        </Suspense>
      </main>
      <nav className="bottom-nav" aria-label="Main navigation">
        {["Today", "Train", "Plan", "Progress", "Explore"].map((t) => (
          <button
            key={t}
            aria-current={tab === t ? "page" : undefined}
            onClick={() => navigate(t)}
          >
            <Icon
              name={t === "Train" ? "strength" : t === "Explore" ? "More" : t}
            />
            <span>{t}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
