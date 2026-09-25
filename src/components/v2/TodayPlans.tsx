import '../../screens/TrainingRecords.css';
import { useEffect, useState } from "react";
import { listV2 } from "../../persistence/v2Repository.js";
import { startPlanned } from "../../persistence/planningHistory.js";
import { day } from "../../domain/v2/planning.js";
export default function TodayPlans({ onOpen, onSession, onBuild }: any) {
  const [plans, setPlans] = useState<any[]>([]),
    [sessions, setSessions] = useState<any[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    Promise.all([listV2("v2PlannedWorkouts"), listV2("v2WorkoutSessions")])
      .then(([p, s]: any) => {
        setPlans(
          p.filter(
            (x: any) => x.planning && !x.planning.archived && x.date === day(),
          ),
        );
        setSessions(s.filter((x: any) => x.date?.value === day()));
      })
      .catch((e) => setError(String(e)));
  }, []);
  return (
    <section className="card v2-today-plans">
      <h2>Your workouts today</h2>
      <p>User-planned training is independent of the suggested V1 plan.</p>
      {plans.map((p) => (
        <div key={p.id}>
          <strong>{p.snapshot.name}</strong>
          <span> · {p.status}</span>
          <button
            disabled={busy || p.status !== "planned"}
            onClick={async () => {
              setBusy(true);
              try {
                onSession(await startPlanned(p));
              } catch (e) {
                setError(String(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            Start {p.snapshot.name}
          </button>
        </div>
      ))}
      {sessions.map((s) => (
        <p key={s.id}>
          {s.name?.value || "Workout"} · {s.lifecycle}
        </p>
      ))}
      {!plans.length && <p>No dated workouts planned today.</p>}
      <button onClick={onBuild}>Build unplanned workout</button>
      <button onClick={onOpen}>Plan, Calendar & History</button>
      <small>
        Open a workout for current guidance. Warnings do not prevent factual
        logging.
      </small>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
