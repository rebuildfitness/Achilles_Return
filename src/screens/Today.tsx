import { PlannedExposure } from "../components/PlannedExposure";
import { DailyBrand } from "../components/DailyBrand";
import { sessionEstimate } from "../data/sessionPresentation.js";
import { Card, Icon, PrimaryButton } from "../components/ui";
import { readinessLabel } from "../rules/readiness.js";
import type { Assessment, Readiness, Session, Workout } from "../types";
import { baselineResult } from "../rules/baseline.js";
import { dayKey } from "../data/provisionalWeek.js";

export function Today({
  conditioningEnabled = false,
  conditioningFrom,
  onEnableConditioning,
  onViewRehab,
  exposure,
  onExposure,
  hasDraft = false,
  onRecovery,
  completed,
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
  conditioningEnabled?: boolean;
  conditioningFrom?: string;
  onEnableConditioning?: () => void;
  onViewRehab?: () => void;
  exposure?: any;
  onExposure: (domain: string) => void;
  hasDraft?: boolean;
  onRecovery: (type?: string) => void;
  completed: boolean;
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
  const recovery = workout.items.length === 0;
  const red = readiness?.level === "RED";
  const result = assessment ? baselineResult(assessment.values) : null;
  const pending = sessions.filter(
    (s) => s.status === "PENDING_NEXT_DAY_RESPONSE",
  );
  const responseDue = pending.find(s => s.date < dayKey());
  const nextAction = red
    ? { label: "Review check-in", run: onCheckIn }
    : !assessment ? { label: "Start Baseline", run: onTests }
    : responseDue ? { label: "Record next-morning response", run: () => onResponse(responseDue) }
    : !readiness ? { label: "Check In", run: onCheckIn }
    : completed || recovery ? { label: "Log recovery", run: () => onRecovery() }
    : canOpenWorkout ? { label: hasDraft ? "Resume Workout" : "Open Workout", run: onWorkout }
    : { label: "Review Tests", run: onTests };
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
      <Card className={`today-action ${red ? 'tone-stop' : responseDue ? 'tone-pending' : readiness?.level === 'GREEN' ? 'tone-ready' : readiness ? 'tone-pending' : ''}`}>
        <div className="eyebrow">TODAY’S STATUS</div>
        <h2>{red ? readinessLabel(readiness!.level) : !assessment ? 'Establish your starting point' : responseDue ? 'Next-morning review due' : readiness ? readinessLabel(readiness.level) : 'How is your Achilles today?'}</h2>
        <p>{!assessment && !red ? 'Complete your starting assessment to build your personal plan. Unmeasured tests can stay blank.' : readiness ? readiness.reason : 'A quick check-in helps guide today’s loading.'}</p>
        {!!pending.length && <p className="response-context">Previous training: {pending.length} {pending.length === 1 ? 'session awaits' : 'sessions await'} a next-morning response before progression.</p>}
        <PrimaryButton onClick={nextAction.run}>{nextAction.label} <span aria-hidden="true">→</span></PrimaryButton>
        {responseDue && nextAction.label !== "Record next-morning response" && <button className="text-button" onClick={()=>onResponse(responseDue)}>Record next-morning response</button>}
        {readiness && <button className="text-button update-checkin" onClick={onCheckIn}>Update check-in</button>}
        {!readiness && nextAction.run !== onCheckIn && <button className="text-button" onClick={onCheckIn}>Check In</button>}
        {pending.filter(s=>s.date < dayKey()).length > 1 && <details><summary>Other outstanding responses</summary>{pending.filter(s=>s.date < dayKey() && s.id !== responseDue?.id).map(s=><button className="text-button" key={s.id} onClick={()=>onResponse(s)}>Record response · {new Date(s.date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})}</button>)}</details>}
      </Card>
      {red ? (
        <Card>
          <h2>No Achilles workout today</h2>
          <p>{readiness.action}</p>
        </Card>
      ) : (
        <>
          <div className="section-heading">
            <h2>Today’s session</h2>
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
                <h3>{completed ? "Workout saved" : workout.title}</h3>
                <p>{workout.phase}</p>
              </div>
            </div>
            {!recovery && !completed && <p className="helper">{sessionEstimate(workout.items)}</p>}
            <div className="workout-meta">
              <span className="pill">
                {assessment ? "Criteria-based plan" : "Baseline first"}
              </span>
              <span>
                {completed
                  ? "Saved"
                  : recovery
                    ? "Recovery & mobility"
                    : `${workout.items.length} exercises`}
              </span>
            </div>

            {responseDue && assessment && readiness && canOpenWorkout && !completed && !recovery && <button className="text-button" onClick={onWorkout}>{hasDraft ? "Resume Workout" : "Open Workout"}</button>}
            {responseDue && assessment && readiness && (completed || recovery) && <button className="text-button" onClick={() => onRecovery()}>Log recovery</button>}
            <details className="workout-preview" hidden={!workout.items.length || completed}><summary>View exercise list</summary>
              {!completed &&
                workout.items.map((ex) => (
                  <div className="preview-row" key={ex.id}>
                    <span className="exercise-bullet" />
                    <span>{ex.name}</span>
                    <span className="prescription">
                      {ex.sets} × {ex.reps}
                    </span>
                  </div>
                ))}
            </details>

            {!readiness && !recovery && !completed && (
              <p className="helper">
                Complete your check-in to open the workout.
              </p>
            )}
            <p className="helper">{workoutNote}</p>
            <PlannedExposure exposure={exposure} onStart={onExposure} />
          </Card>
        </>
      )}
      <Card className="rehab-access">
        <div className="eyebrow">ACHILLES REHAB</div>
        <h2>Your dedicated rehab workout</h2>
        {onViewRehab && <button className="primary-button" onClick={onViewRehab}>View dedicated rehab workout</button>}
        <p>See the complete Achilles Rehab &amp; Conditioning workout, demos and illustrations any day.</p>
        {conditioningEnabled ? <p className="notice">Dedicated Achilles Rehab &amp; Conditioning replaces your B session{conditioningFrom ? ` from ${conditioningFrom}` : ""}. View Plan for its next scheduled day.</p> : onEnableConditioning && <><p>Use a dedicated calf-strength, leg-control, balance and conditioning session in place of Strength B. A and C retain strength training.</p><button className="secondary-button" onClick={onEnableConditioning}>Use dedicated rehab schedule</button><p className="helper">Starts tomorrow; today's workout and saved history stay intact. This does not unlock impact exercises.</p></>}

        <p>Your prescribed calf and lower-body rehabilitation is included in the full workout alongside strength training.</p>
        {!completed && !red && workout.items.length > 0 && <p className="helper">Today's calf and balance work: {workout.items.filter(ex => /calf|balance|knee-to-wall/.test(ex.originalId || ex.id)).map(ex => ex.name).join(", ") || "See the prescribed exercise list."}</p>}
        {completed && <p className="helper">Your workout is saved. Avoid repeating its rehab sets as extra work.</p>}
        {canOpenWorkout && !completed && !red && <button className="text-button" onClick={onWorkout}>View prescribed rehab in workout</button>}
        <p className="helper">{red ? "Follow your safety guidance; activity logging is for recording what you already did." : "For additional support, browse existing mobility, balance and core routines with demos and activity logging. Availability follows your current readiness."}</p>
        <button className="secondary-button" onClick={() => onRecovery()}>Browse rehab support activities</button>
      </Card>
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
      <section className="movement-support supporting-section">
        <div className="section-heading">
          <h2>Movement support</h2>
          <button className="text-button" onClick={() => onRecovery()}>
            View all →
          </button>
        </div>
        <p>
          {red
            ? "Record past activity. Follow your safety guidance."
            : "Optional support work. Choose what fits today."}
        </p>
        <div className="movement-chips">
          {(red
            ? [["other", "Log activity"]]
            : recovery
              ? [
                  ["walk", "Walk"],
                  ["cycle", "Cycle"],
                  ["mobility", "Mobility"],
                  ["core_stability", "Core"],
                ]
              : [
                  ["mobility", "Mobility"],
                  ["core_stability", "Core"],
                  ["balance_movement_control", "Balance"],
                  ["walk", "Walk"],
                ]
          ).map(([id, label]) => (
            <button key={id} onClick={() => onRecovery(id)}>
              {label}
            </button>
          ))}
        </div>
      </section>
      <DailyBrand />
      <p className="local-note">
        <Icon name="lock" size={13} /> Your progress stays on this device.
      </p>
    </>
  );
}
