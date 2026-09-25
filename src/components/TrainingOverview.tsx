import { History } from "../screens/History";
import { displayDate } from "../data/displayDates.js";
import { formatDuration } from "../data/workoutExperience.js";
import {
  movementRecords,
  movementTitle,
  movementAmount,
} from "../data/movement.js";
import { useEffect, useState } from "react";
import { Card } from "./ui";
import { getAll } from "../db.js";
import { dayKey } from "../data/provisionalWeek.js";
import { exerciseHistory, recordedExercises } from "../data/trainingHistory.js";
import type { Session } from "../types";

export function TrainingOverview({
  sessions,
  onView,
}: {
  sessions: Session[];
  onView: (view: string) => void;
}) {
  const [recovery, setRecovery] = useState<any[]>([]);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getAll("settings")
      .then((rows) => {
        if (active)
          setRecovery(
            movementRecords(rows).filter((r) => r.status === "saved"),
          );
      })
      .catch(() => {
        if (active) setError("Recovery history could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, []);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 27);
  const recent = sessions.filter(
    (s) => s.date >= dayKey(cutoff) && s.date <= dayKey(),
  );
  return (
    <>
      <Card>
        <div className="eyebrow">LAST 28 DAYS</div>
        <h2>Your training, together</h2>
        <div className="training-stats">
          <div><button className="stat-link" onClick={()=>onView("strength")} aria-label="View strength trends">
            <strong>{recent.filter((s) => !s.domain).length}</strong>
            <span>Strength sessions</span></button>
          </div>
          <div>
            <strong>{recent.filter((s) => !!s.domain).length}</strong>
            <span>Sport exposures</span>
          </div>
          <div>
            <strong>
              {
                recovery.filter(
                  (r) => r.date >= dayKey(cutoff) && r.date <= dayKey(),
                ).length
              }
            </strong>
            <span>Movement activities</span>
          </div>
        </div>
        {error && <p role="alert">{error}</p>}
        <p>
          Saved sessions count as training. Next-morning response determines
          tolerance.
        </p>
      </Card>
      <Card>
        <h2>Your training history</h2>
        {!sessions.length && !recovery.length && (
          <p>Your first saved session or recovery activity will appear here.</p>
        )}
        {[
          ...sessions.map((s) => ({
            id: s.id,
            date: s.date,
            title: s.workoutTitle || s.workoutId,
            detail: s.status.replaceAll("_", " ").toLowerCase(),
          })),
          ...recovery.map((r) => ({
            id: r.id,
            date: r.date,
            title: movementTitle(r),
            detail: movementAmount(r),
          })),
        ]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, historyLimit)
          .map((r) => (
            <div className="activity-row" key={r.id}>
              <time dateTime={r.date}>{displayDate(r.date)}</time>
              {sessions.find(s => s.id === r.id) ? <History sessions={[sessions.find(s => s.id === r.id)!]} allSessions={sessions} /> : <><strong>{r.title}</strong><small>{r.detail}</small></>}
            </div>
          ))}
        {sessions.length + recovery.length > historyLimit && <button className="text-button" onClick={() => setHistoryLimit(historyLimit + 20)}>Show earlier activity</button>}
      </Card>
    </>
  );
}

export function StrengthHistory({ sessions }: { sessions: Session[] }) {
  const exercises = recordedExercises(sessions);
  const [selected, setSelected] = useState(exercises[0]?.id || "");
  const points = exerciseHistory(sessions, selected);
  const max = Math.max(1, ...points.map((p) => p.load));
  const x = (i: number) =>
    36 + (points.length === 1 ? 140 : (i * 280) / (points.length - 1));
  const y = (v: number) => 150 - (v / max) * 120;
  return (
    <Card>
      <h2>Strength history</h2>
      <p>
        Heaviest completed set per session. Compare repetitions and setup before
        increasing load.
      </p>
      {!exercises.length ? (
        <p>Log your first workout to begin your strength history.</p>
      ) : (
        <>
          <label htmlFor="strength-trend">Exercise</label>
          <select
            id="strength-trend"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {exercises.map((ex) => (
              <option value={ex.id} key={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
          {!points.length ? (
            <p>No completed sets with a recorded load for this exercise.</p>
          ) : (
            <>
              <div className="metric-summary"><div><span>Latest recorded load</span><strong>{points.at(-1)!.load} lb</strong><small>{displayDate(points.at(-1)!.date)}</small></div>{points.length>1 && <div><span>Observed load change</span><strong>{(points.at(-1)!.load-points.at(-2)!.load).toFixed(1)} lb</strong><small>Check reps and setup before comparing.</small></div>}</div>
              <svg
                className="assessment-chart"
                viewBox="0 0 350 180"
                role="img"
                aria-label="Recorded load trend in pounds; values listed below"
              >
                <text x="6" y="20">
                  lb
                </text>
                <path
                  d="M 36 25 V 150 H 325"
                  fill="none"
                  stroke="var(--line200)"
                />
                <polyline
                  points={points
                    .map((p, i) => `${x(i)},${y(p.load)}`)
                    .join(" ")}
                  fill="none"
                  stroke="var(--blue600)"
                  strokeWidth="3"
                />
                {points.map((p, i) => (
                  <circle
                    key={p.id}
                    cx={x(i)}
                    cy={y(p.load)}
                    r="4"
                    fill="var(--blue600)"
                  />
                ))}
              </svg>
              <details>
                <summary>Recorded sets ({points.length})</summary>
                {points.map((p) => (
                  <div className="activity-row" key={p.id}>
                    <time>{p.date}</time>
                    <strong>
                      {p.load} lb × {p.reps || "—"}
                    </strong>
                    <small>{p.status.replaceAll("_", " ").toLowerCase()}</small>
                  </div>
                ))}
              </details>
            </>
          )}
        </>
      )}
    </Card>
  );
}
