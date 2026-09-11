import { Card, Icon, PrimaryButton, StatusCard } from "../components/ui";
import { readinessLabel } from "../rules/readiness.js";
import type { Assessment, Readiness, Session, Workout } from "../types";
import { baselineResult } from "../rules/baseline.js";
import { dayKey } from "../data/provisionalWeek.js";

export function Today({
  readiness,
  workout,
  sessions,
  onCheckIn,
  onWorkout,
  onPlan,
  onTests,
  assessment,
  canOpenWorkout,
  workoutNote,
  onResponse,
}: {
  readiness: Readiness | null;
  workout: Workout;
  sessions: Session[];
  onCheckIn: () => void;
  onWorkout: () => void;
  onPlan: () => void;
  onTests: () => void;
  assessment?: Assessment;
  canOpenWorkout: boolean;
  workoutNote: string;
  onResponse: (session: Session) => void;
}) {
  const red = readiness?.level === "RED";
  const result = assessment ? baselineResult(assessment.values) : null;
  const pending = sessions.filter(
    (s) => s.status === "PENDING_NEXT_DAY_RESPONSE",
  );
  return (
    <>
      <div className="screen-heading">
        <h1>Today</h1>
        <p>
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
      {readiness ? (
        <>
          <StatusCard
            tone={
              red ? "stop" : readiness.level === "GREEN" ? "ready" : "modified"
            }
            title={readinessLabel(readiness.level)}
          >
            {readiness.reason}
          </StatusCard>
          <button className="text-button update-checkin" onClick={onCheckIn}>
            Update check-in
          </button>
        </>
      ) : (
        <Card className="checkin-card">
          <div className="eyebrow">DAILY CHECK-IN</div>
          <h2>How is your Achilles today?</h2>
          <p>A quick check-in helps guide today’s loading.</p>
          <PrimaryButton onClick={onCheckIn}>
            Check In <span aria-hidden="true">→</span>
          </PrimaryButton>
        </Card>
      )}
      {pending.length > 0 && (
        <Card className="pending-card">
          <Icon name="clock" />
          <div>
            <h3>Next-morning response</h3>
            <p>
              {pending.length} saved{" "}
              {pending.length === 1 ? "session needs" : "sessions need"} a
              next-morning response before progression.
            </p>
            {pending
              .filter((s) => s.date < dayKey())
              .map((s) => (
                <button
                  className="text-button"
                  key={s.id}
                  onClick={() => onResponse(s)}
                >
                  Record response · {s.date}
                </button>
              ))}
          </div>
        </Card>
      )}
      {red ? (
        <Card>
          <h2>No Achilles workout today</h2>
          <p>{readiness.action}</p>
        </Card>
      ) : (
        <>
          <div className="section-heading">
            <h2>Today’s Workout</h2>
            <button className="text-button" onClick={onPlan}>
              View Plan <Icon name="arrow" size={15} />
            </button>
          </div>
          <Card className="today-workout">
            <div className="workout-title-row">
              <span className="workout-icon">
                <Icon name="strength" size={30} />
              </span>
              <div>
                <h3>{workout.title}</h3>
                <p>{workout.phase}</p>
              </div>
            </div>
            <div className="workout-meta">
              <span className="pill">
                {assessment ? "Criteria-based plan" : "Baseline first"}
              </span>
              <span>{workout.items.length} exercises</span>
            </div>
            <div className="workout-preview">
              {workout.items.map((ex) => (
                <div className="preview-row" key={ex.id}>
                  <span className="exercise-bullet" />
                  <span>{ex.name}</span>
                  <span className="prescription">
                    {ex.sets} × {ex.reps}
                  </span>
                </div>
              ))}
            </div>
            <PrimaryButton
              onClick={assessment ? onWorkout : onTests}
              disabled={!!assessment && !canOpenWorkout}
            >
              {assessment ? "Open Workout" : "Start Baseline"}{" "}
              <span aria-hidden="true">→</span>
            </PrimaryButton>
            {!readiness && (
              <p className="helper">
                Complete your check-in to open the workout.
              </p>
            )}
            <p className="helper">{workoutNote}</p>
          </Card>
        </>
      )}
      <Card className="milestone-card">
        <div className="eyebrow">NEXT MILESTONE</div>
        <h3>
          {result
            ? `${result.criteria.filter((c) => c.passed).length} / 7 running entry criteria`
            : "Establish your baseline"}
        </h3>
        <p>
          {result
            ? result.limiters[0] ||
              "Build controlled exposure and next-morning tolerance."
            : "Calf strength, heel-rise capacity and balance will guide your starting focus."}
        </p>
        <button className="text-button" onClick={onTests}>
          View Tests <Icon name="arrow" size={15} />
        </button>
      </Card>
      <p className="local-note">
        <Icon name="lock" size={13} /> Your progress stays on this device.
      </p>
    </>
  );
}
