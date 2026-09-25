import { useEffect, useState } from "react";
import { GUIDE_PHASES, guideDefinitions } from "../domain/v2/rehabGuide.js";
import { DEFINITIONS } from "../domain/v2/compositionContent.js";
import { EVIDENCE } from "../data/evidence.js";
import { readTimeline } from "../persistence/planningHistory.js";
import { benchmarkStatuses } from "../domain/v2/guidance.js";
import { progressSummary } from "../domain/v2/progress.js";
import { readable } from "../domain/v2/timeline.js";
import { day, shiftDate } from "../domain/v2/planning.js";
import { DemoLinks } from "../components/v2/ExercisePicker";
import { IllustratedExercise } from "../components/v2/IllustratedExercise";
import { Card } from "../components/ui";
export default function RehabGuide({ navigate, addExercise }: any) {
  const [phase, setPhase] = useState<any>(null),
    [data, setData] = useState<any>(null),
    [error, setError] = useState("");
  useEffect(() => {
    readTimeline()
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);
  const latest = data?.assessments
    .filter((a: any) => a.completedAt)
    .sort((a: any, b: any) => a.completedAt.localeCompare(b.completedAt))
    .at(-1);
  const benchmarks = benchmarkStatuses(
    latest?.values || {},
    data?.capabilityStates.find((x: any) => x.id === "checkpoints")?.values ||
      {},
  );
  const progress = data
    ? progressSummary(data, shiftDate(day(), -27), day())
    : null;
  return (
    <section className="final-screen">
      <h1>Rehab Guide</h1>
      <p>
        Nine educational phases. Every phase is available to explore; phase
        association is not permission or medical clearance.
      </p>
      {error && <p role="alert">{error}</p>}
      <nav className="final-grid" aria-label="Rehab phases">
        {GUIDE_PHASES.map((p: any, i: number) => (
          <button
            key={p.id}
            aria-current={phase?.id === p.id ? "page" : undefined}
            onClick={() => setPhase(p)}
          >
            {i + 1}. {p.name}
          </button>
        ))}
      </nav>
      {phase && (
        <>
          <Card>
            <h2>{phase.name}</h2>
            <p>{phase.purpose}</p>
            <h3>Physical qualities</h3>
            <p>{phase.qualities.join(" · ")}</p>
            <h3>Suggested focus</h3>
            <p>{phase.focus}</p>
            <h3>Cautions</h3>
            <p>{phase.caution}</p>
          </Card>
          <Card>
            <h2>Your recorded context</h2>
            <p>
              Latest assessment:{" "}
              {latest?.completedAt?.slice(0, 10) || "Not tested"}
            </p>
            {["baseline", "strength", "readiness"].includes(phase.id) ? (
              benchmarks.slice(0, 7).map((b: any) => (
                <p key={b.id}>
                  {b.label}: <strong>{b.status.replaceAll("-", " ")}</strong>
                </p>
              ))
            ) : (
              <details>
                <summary>Recorded benchmark interpretations</summary>
                {benchmarks.slice(7).map((b: any) => (
                  <p key={b.id}>
                    {b.label}: <strong>{b.status.replaceAll("-", " ")}</strong>
                  </p>
                ))}
              </details>
            )}
            <p>
              Next-day responses recorded for{" "}
              {progress?.responseCoverage.covered ?? 0} of{" "}
              {progress?.responseCoverage.total ?? 0} recent workouts.
            </p>
            <p>
              Recent relevant exposure:{" "}
              {progress?.categories.find(
                (c: any) => c.label === (phase.category || "Achilles Rehab"),
              )?.sessions ?? 0}{" "}
              recorded sessions. No record does not mean no activity occurred.
            </p>
            <div className="final-actions">
              <button onClick={() => navigate("Assessments")}>
                View / record assessment
              </button>
              <button onClick={() => navigate("Progress")}>
                View Progress
              </button>
              <button onClick={() => navigate("Exposure history")}>
                Review exposure
              </button>
              <button onClick={() => navigate("Guidance")}>
                View guidance
              </button>
            </div>
          </Card>
          <Card>
            <h2>Exercise options</h2>
            <p>
              Adding an exercise creates editable intent. It does not establish
              readiness.
            </p>
            {guideDefinitions(phase, DEFINITIONS).map((d: any) => (
              <article className="final-exercise" key={d.id}>
                <IllustratedExercise definition={d}>
                <h3>{readable(d.name)}</h3>
                <DemoLinks definition={d} />
                <button onClick={() => addExercise(d)}>Add to workout</button>
                </IllustratedExercise>
              </article>
            ))}
          </Card>
          {phase.ladder && (
            <Card>
              <h2>Preserved example activities</h2>
              <p>
                Examples from the existing Master Plan. These are not assigned
                doses or newly validated thresholds.
              </p>
              {phase.ladder.map((x: any, i: number) => (
                <p key={i}>{readable(x)}</p>
              ))}
            </Card>
          )}
          <Card>
            <h2>Evidence and limitations</h2>
            {phase.sources.map((id: string) => {
              const e = EVIDENCE.find((e: any) => e.id === id);
              return e ? (
                <article key={id}>
                  <h3>
                    <a href={e.url} target="_blank" rel="noreferrer">
                      {e.title}
                    </a>
                  </h3>
                  <p>
                    {e.type} · {e.strength}
                  </p>
                  <p>{e.summary}</p>
                </article>
              ) : (
                <p key={id}>Source {id}: details unavailable.</p>
              );
            })}
            <p>
              Remote demonstrations and source pages require internet access.
            </p>
          </Card>
          <div className="final-actions">
            {GUIDE_PHASES.filter((p: any) => p.id !== phase.id).map(
              (p: any) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPhase(p);
                    window.scrollTo(0, 0);
                  }}
                >
                  {p.name}
                </button>
              ),
            )}
          </div>
        </>
      )}
    </section>
  );
}
