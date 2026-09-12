import { useEffect, useState } from "react";
import { loadMovement } from "../persistence/movement.js";
import {
  movementTotals,
  movementTitle,
  movementAmount,
  MOVEMENT_TYPES,
  movementResponse,
} from "../data/movement.js";
import { Card } from "./ui";
import { dayKey } from "../data/provisionalWeek.js";
export function MovementProgress({
  onOpen,
  sessions = [],
}: {
  onOpen: (date: string) => void;
  sessions?: any[];
}) {
  const [records, setRecords] = useState<any[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    loadMovement()
      .then((rows) => {
        if (active) setRecords(rows);
      })
      .catch((e) => {
        if (active) setError(String(e));
      });
    return () => {
      active = false;
    };
  }, []);
  const from = new Date();
  from.setDate(from.getDate() - ((from.getDay() + 6) % 7));
  const start = dayKey(from);
  const saved = records.filter((r) => r.status === "saved"),
    week = saved.filter((r) => r.date >= start && r.date <= dayKey()),
    totals = movementTotals(week);
  const pending = new Set(saved.filter(r=>movementResponse(r,sessions).status==="PENDING_NEXT_DAY_RESPONSE").map(r=>r.linkedSessionId)).size;
  const history = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(from);
    date.setDate(date.getDate() + i);
    const key = dayKey(date);
    return { date: key, count: week.filter((r) => r.date === key).length };
  });
  const routineCounts = week
    .filter((r) => r.routineInstance)
    .reduce((acc: Record<string, number>, r) => {
      const name = movementTitle(r);
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
  const mostUsed = Object.entries(routineCounts).sort(
    (a: any, b: any) => b[1] - a[1],
  )[0];
  const max = Math.max(1, ...history.map((x) => x.count));
  return (
    <>
      <Card>
        <h2>Movement this week</h2>
        <p>Week of {start} · Saved activities only</p>
        {error && <p role="alert">{error}</p>}
        <div className="training-stats">
          <div>
            <strong>{totals.steps.toLocaleString()}</strong>
            <span>Walking steps</span>
          </div>
          <div>
            <strong>{totals.cycleMinutes}</strong>
            <span>Cycling minutes</span>
          </div>
          <div>
            <strong>{totals.cycleKm.toFixed(1)}</strong>
            <span>Cycling km</span>
          </div>
        </div>
        <div
          className="movement-chart"
          role="img"
          aria-label={history
            .map((x) => `${x.date}: ${x.count} activities`)
            .join(", ")}
        >
          {history.map((x) => (
            <div key={x.date}>
              <span style={{ height: Math.max(2, (x.count / max) * 80) }} />
              <small>{x.date.slice(8)}</small>
            </div>
          ))}
        </div>
        <dl className="movement-counts">
          {Object.entries(MOVEMENT_TYPES)
            .filter(([id]) => !["walk", "cycle", "other"].includes(id))
            .map(([id, label]) => (
              <div key={id}>
                <dt>{label}</dt>
                <dd>{totals.categories[id]}</dd>
              </div>
            ))}
        </dl>
        {mostUsed && (
          <p>
            Most used routine: <strong>{mostUsed[0]}</strong> ·{" "}
            {String(mostUsed[1])} saved sessions
          </p>
        )}
        <p>
          Movement totals do not change baseline measurements or sport criteria.
        </p>
      </Card>
      <Card>
        <h2>Activity history</h2>{pending>0&&<p>{pending} linked workout {pending===1?"response":"responses"} pending. Open Today to record the next-morning response.</p>}
        {!saved.length && (
          <p>Your saved movement will appear here. Drafts are not counted.</p>
        )}
        {saved
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((r) => (
            <div className="movement-summary" key={r.id}>
              <div>
                <time>{r.date}</time>
                <strong>{movementTitle(r)}</strong>
                <p>{movementAmount(r)}</p>
                {r.notes && <small>{r.notes}</small>}
              </div>
              <button className="text-button" onClick={() => onOpen(r.date)}>
                View / edit
              </button>
            </div>
          ))}
      </Card>
    </>
  );
}
