import { useEffect, useState } from "react";
import { readTimeline } from "../persistence/planningHistory.js";
import { progressSummary } from "../domain/v2/progress.js";
import { day, shiftDate } from "../domain/v2/planning.js";
import { readable } from "../domain/v2/timeline.js";
import { benchmarkStatuses } from "../domain/v2/guidance.js";
import { Card } from "../components/ui";
export default function ProgressV2({ navigate }: any) {
  const [data, setData] = useState<any>(null),
    [range, setRange] = useState("28"),
    [view, setView] = useState("Overview"),
    [error, setError] = useState("");
  useEffect(() => {
    readTimeline()
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);
  if (!data)
    return <p role="status">{error || "Loading recorded progress…"}</p>;
  const end = day(),
    start =
      range === "week"
        ? shiftDate(end, -((new Date(end + "T12:00:00").getDay() + 6) % 7))
        : shiftDate(end, 1 - Number(range));
  const result = progressSummary(data, start, end),
    latest = data.assessments
      .filter((a: any) => a.completedAt)
      .sort((a: any, b: any) => a.completedAt.localeCompare(b.completedAt))
      .at(-1);
  const benchmarks = benchmarkStatuses(
    latest?.values || {},
    data.capabilityStates.find((c: any) => c.id === "checkpoints")?.values ||
      {},
  );
  const totals = (m: any) =>
    m.values.length
      ? m.values
          .map((x: any) => `${Math.round(x.amount * 100) / 100} ${x.unit}`)
          .join(" + ")
      : "Not recorded";
  return (
    <section className="final-screen">
      <h1>Progress</h1>
      <p>Recorded training, with missing information kept visible.</p>
      <label>
        Time range
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="week">This week</option>
          <option value="28">Last 4 weeks</option>
          <option value="90">Last 3 months</option>
        </select>
      </label>
      <div className="final-actions">
        {[
          "Overview",
          "Strength",
          "Achilles",
          "Cardio & sport",
          "Symptoms & responses",
          "Benchmarks",
        ].map((v) => (
          <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>
            {v}
          </button>
        ))}
      </div>
      {view === "Overview" && (
        <>
          <Card>
            <h2>{result.frequency} recorded workouts</h2>
            <p>
              {start} to {end}. Partial workouts contribute only performed work.
            </p>
            <p>
              Next-day response recorded for {result.responseCoverage.covered}{" "}
              of {result.responseCoverage.total} workouts. Completion does not
              establish tolerance.
            </p>
            <h3>Weekly frequency</h3>
            {!result.weeks.length ? (
              <p>No completed training recorded in this range.</p>
            ) : (
              result.weeks.map((w: any) => (
                <div className="progress-bar-row" key={w.date}>
                  <span>Week of {w.date}</span>
                  <meter
                    aria-label={`Workouts week of ${w.date}`}
                    min={0}
                    max={Math.max(...result.weeks.map((x: any) => x.count), 1)}
                    value={w.count}
                  />
                  <strong>{w.count}</strong>
                </div>
              ))
            )}
          </Card>
          <Card>
            <h2>Training categories</h2>
            <p>
              One workout may appear in several categories; the total above
              counts it once.
            </p>
            {result.categories.map((c: any) => (
              <p key={c.label}>
                {c.label}: <strong>{c.sessions}</strong> recorded sessions
              </p>
            ))}
          </Card>
        </>
      )}
      {view === "Strength" && (
        <>
          <h2>Exercise performance</h2>
          <p>
            Each exercise, side, setup, unit and load convention remains
            separate. These are recorded points, not a prediction.
          </p>
          {!result.strength.length && (
            <Card>No measured loads recorded in this range.</Card>
          )}
          {result.strength.map((g: any) => (
            <Card key={g.key}>
              <h3>{g.name}</h3>
              <p>
                {g.convention || "Load convention unknown"} ·{" "}
                {g.unit || "Unit unknown"} · {g.side || "Side unknown"}
              </p>
              <details>
                <summary>Setup</summary>
                {g.setup || "Not recorded"}
              </details>
              <div className="final-table">
                <table>
                  <caption>Recorded load and reps</caption>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Load</th>
                      <th>Reps</th>
                      <th>RPE</th>
                      <th>Load × reps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.points.map((p: any, i: number) => (
                      <tr key={p.setId + ":" + i}>
                        <td>{p.date || "Unknown"}</td>
                        <td>
                          {p.load} {g.unit}
                        </td>
                        <td>{p.reps ?? "Unknown"}</td>
                        <td>{p.rpe ?? "Unknown"}</td>
                        <td>{p.volume ?? "Not comparable"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </>
      )}
      {view === "Achilles" && (
        <>
          <h2>Achilles development</h2>
          <Card>
            <h3>Recorded calf and soleus work</h3>
            <p>
              {result.calf.calf} calf sets/bouts · {result.calf.soleus}{" "}
              soleus-focused sets/bouts
            </p>
            <p>
              {result.calf.bilateral} bilateral · {result.calf.unilateral}{" "}
              left/right sets. Side recorded for {result.calf.sideKnown} of{" "}
              {result.calf.calf} sets/bouts.
            </p>
          </Card>
          <p>
            Based on preserved exercise tags and categories, not name matching.
            Missing classifications are not filled in.
          </p>
          {result.categories
            .filter((c: any) =>
              [
                "Achilles Rehab",
                "Balance / Proprioception",
                "Running",
                "Jumping & Landing",
                "Plyometrics",
                "Acceleration",
                "Sprinting",
                "Deceleration",
                "Change of Direction / Agility",
                "Basketball Conditioning",
                "Basketball Skill Exposure",
              ].includes(c.label),
            )
            .map((c: any) => (
              <Card key={c.label}>
                <h3>{c.label}</h3>
                <p>
                  {c.sessions} sessions · {c.sets} classified performed
                  sets/bouts
                </p>
                {!c.sessions && (
                  <p>
                    No exposure in this category has been recorded recently.
                    This does not establish that none occurred.
                  </p>
                )}
              </Card>
            ))}
          <button onClick={() => navigate("Learn")}>Open Rehab Guide</button>
        </>
      )}
      {view === "Cardio & sport" && (
        <>
          <h2>Cardio and sport exposure</h2>
          {result.categories
            .filter(
              (c: any) =>
                ![
                  "Strength",
                  "Hypertrophy",
                  "Core",
                  "Flexibility",
                  "Achilles Rehab",
                ].includes(c.label),
            )
            .map((c: any) => (
              <Card key={c.label}>
                <h3>{c.label}</h3>
                <p>{c.sessions} recorded sessions</p>
                <p>
                  Duration: {totals(c.duration)} · Distance:{" "}
                  {totals(c.distance)}
                </p>
                <p>
                  Distance recorded for {c.distanceSessions} of {c.sessions}{" "}
                  sessions; {c.distance.covered} of {c.distance.total}{" "}
                  classified sets/bouts. Contacts: {totals(c.contacts)} (
                  {c.contacts.covered} of {c.contacts.total} rows).
                </p>
              </Card>
            ))}
          <details>
            <summary>
              Original exposure records (including earlier aggregate records)
            </summary>
            {result.exposures
              .filter((e: any) => !e.source.startsWith("workout context"))
              .map((e: any) => (
                <p key={e.id}>
                  {e.date} · {e.domain}: {readable(e.actual)} ·{" "}
                  {readable(e.raw)}
                </p>
              ))}
          </details>
        </>
      )}
      {view === "Symptoms & responses" && (
        <>
          <h2>Symptoms and tendon response</h2>
          <p>
            Raw entries are listed in time order. Missing entries are not zero;
            sparse observations do not establish a trend.
          </p>
          {!result.symptoms.length && (
            <Card>No observations recorded in this range.</Card>
          )}
          {result.symptoms
            .sort((a: any, b: any) => a.date.localeCompare(b.date))
            .map((o: any) => (
              <Card key={o.id}>
                <h3>{o.date}</h3>
                <p>Raw observation: {readable(o.raw)}</p>
                <details>
                  <summary>Separate interpretation</summary>
                  {readable(o.interpretation)}
                </details>
              </Card>
            ))}
        </>
      )}
      {view === "Benchmarks" && (
        <>
          <h2>Recorded benchmark status</h2>
          <p>
            Measurements and rule interpretations are separate. Exercise
            completion does not pass a benchmark.
          </p>
          {benchmarks.map((b: any) => (
            <p key={b.id}>
              {b.label}: <strong>{b.status.replaceAll("-", " ")}</strong>
            </p>
          ))}
          <details>
            <summary>Original assessment answers</summary>
            {readable(latest?.values)}
          </details>
          <button onClick={() => navigate("Assessments")}>
            Record assessment
          </button>
        </>
      )}
      <div className="final-actions">
        <button onClick={() => navigate("History")}>Review history</button>
        <button onClick={() => navigate("Guidance")}>Guidance history</button>
      </div>
    </section>
  );
}
