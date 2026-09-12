import { useState } from "react";
import { Card } from "./ui";
import { weeklyPlan } from "../rules/planner.js";
import { addDays, rescheduleWorkout } from "../rules/trainingFlexibility.js";
import { dayKey } from "../data/provisionalWeek.js";
import { put } from "../db.js";
import type { Profile, Assessment, Session } from "../types";
export function RescheduleWorkout({
  profile,
  assessment,
  sessions,
  onSaved,
}: {
  profile?: Profile;
  assessment?: Assessment;
  sessions: Session[];
  onSaved: () => Promise<void>;
}) {
  const now = dayKey();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState(now);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const days = Array.from({ length: 5 }, (_, i) =>
    weeklyPlan(
      profile,
      assessment,
      sessions,
      new Date(addDays(now, (i - 1) * 7) + "T12:00:00"),
    ),
  ).flat();
  const available = days.filter(
    (d) =>
      d.workout &&
      d.date <= now &&
      !sessions.some((s) => !s.domain && s.date === d.date),
  );
  return (
    <Card>
      <h2>Move an unfinished workout</h2>
      <p>
        Missed a strength day? Move it forward. Later strength days shift when
        needed to keep a recovery day between them.
      </p>
      <label className="form-field">
        Workout
        <select
          aria-label="Workout to move"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        >
          <option value="">Choose an unfinished workout</option>
          {available.map((d) => (
            <option key={d.date} value={d.date}>
              {d.date} · {d.title}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        Make-up date
        <input
          aria-label="Make-up date"
          type="date"
          min={now}
          max={addDays(now, 7)}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </label>
      <button
        className="secondary-button"
        disabled={!from || busy}
        onClick={async () => {
          setBusy(true);
          setMessage("");
          try {
            if (to > addDays(now, 7))
              throw new Error("Choose a date within the next seven days.");
            const changes = rescheduleWorkout(days, sessions, from, to, now);
            const old = profile?.scheduleMoves || [];
            const scheduleMoves = old.filter(
              (m) => !changes.some((c) => m.from === c.from || m.to === c.from),
            );
            changes.forEach((c) =>
              scheduleMoves.push({
                ...c,
                from: old.find((m) => m.to === c.from)?.from || c.from,
              }),
            );
            await put("profile", { ...profile, id: "athlete", scheduleMoves });
            await onSaved();
            setFrom("");
            setMessage(
              `Workout moved to ${to}. ${changes.length - 1} later workouts shifted. Check in on the training day to open it.`,
            );
          } catch (e) {
            setMessage(String(e instanceof Error ? e.message : e));
          } finally {
            setBusy(false);
          }
        }}
      >
        Move workout
      </button>
      <p role="status">{message}</p>
    </Card>
  );
}
