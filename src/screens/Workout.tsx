import { ExercisePath } from "../components/ExercisePath";
import { loadConvention, previousExerciseSession } from "../data/workflowClarity.js";
import { displayDate } from "../data/displayDates.js";
import { WorkoutTimer } from "../components/WorkoutTimer";
import { carryFeedback, confirmFeedback, feedbackFields, timerKey } from "../data/workoutExperience.js";
import { ExerciseSwap, type SwapAction } from "../components/ExerciseSwap";
import { optionalAccessory, sessionEstimate } from "../data/sessionPresentation.js";
import { useState } from "react";
import { RestTimer } from "../components/RestTimer";
import { dayKey } from "../data/provisionalWeek.js";
import { ExerciseCard, PrimaryButton, SetRow } from "../components/ui";
import { Choice } from "./CheckIn";
import { ExerciseGuidance } from "../components/ExerciseGuidance";
import type { FormEvent } from "react";
import type { Session, SetLog, Workout, WorkoutLog } from "../types";
export function WorkoutScreen({
  workout,
  date,
  onFeedback,
  log,
  sessions,
  online,
  onChange,
  onBack,
  onFinish,
  onSwap,
  equipment,
  unavailable = [],
  readiness = "GREEN",
}: {
  workout: Workout;
  date: string;
  onFeedback: (id: string, sets: SetLog[]) => void;
  log: WorkoutLog;
  sessions: Session[];
  online: boolean;
  onChange: (id: string, index: number, value: SetLog) => void;
  onBack: () => void;
  onFinish: () => void;
  onSwap?: SwapAction;
  unavailable?: string[];
  equipment?: string[];
  readiness?: string;
}) {
  const [rest, setRest] = useState<{ seconds: number; at: number } | null>(
    null,
  );
  const [shortSession, setShortSession] = useState(false);
  const visibleItems = workout.items.filter(ex => !shortSession || !optionalAccessory(ex) || log[ex.id]?.sets.some(s => s && Object.values(s).some(Boolean)));
  const retainedCompleted = (workout.retained || []).reduce((n, ex) => n + (log[ex.id]?.sets.filter(set => set?.complete).length || 0), 0);
  const total = visibleItems.reduce((n, ex) => n + Math.max(ex.sets, log[ex.id]?.sets.length || 0), 0) + retainedCompleted;
  const completed = [...workout.items, ...(workout.retained || [])].reduce(
    (n, ex) =>
      n +
      (log[ex.id]?.sets.filter((s) => s?.complete).length ||
        0),
    0,
  );
  const hasSets = Object.values(log).some((item) =>
    item.sets.some((set) => set?.complete),
  );
  return (
    <div className="workout-screen">
      <button className="text-button page-back" onClick={onBack}>
        ← Today
      </button>
      <div className="screen-heading">
        <h1>Full Workout</h1>
        <p>{workout.title}</p>
        <p className="helper">{sessionEstimate(visibleItems)}</p>
        <details className="workout-options"><summary>Session options</summary>
        <label><input type="checkbox" checked={shortSession} onChange={e => setShortSession(e.target.checked)} /> Shorter session: hide optional accessories</label>
        <p className="helper">Rehab and primary strength remain. Hidden exercises stay uncompleted in your original plan; completed sets are never removed. Restore the full list at any time.</p></details>
      </div>
      <div className="session-dashboard">
        <WorkoutTimer key={timerKey(date,workout.id)} storageKey={timerKey(date,workout.id)} />
        <div className="section-heading">
          <strong>Session progress</strong>
          <span>
            {completed} / {total} sets
          </span>
        </div>
        <progress
          aria-label="Completed workout sets"
          value={completed}
          max={Math.max(1, total)}
        />
        <RestTimer
          storageKey={`rest-${dayKey()}-${workout.id}`}
          signal={rest}
        />
      </div>
      {visibleItems.map((exercise) => {
        const previousSession = previousExerciseSession(sessions, exercise.id, date);
        const previous = previousSession?.exerciseLog[exercise.id];
        return (
          <ExerciseCard key={exercise.id} exercise={exercise} online={online}>
            {onSwap && <ExerciseSwap exercise={exercise} equipment={equipment} unavailable={unavailable} workoutIds={workout.items.map(ex => ex.id)} onSwap={onSwap} />}
            {exercise.sets === 0 && <p className="helper">All planned sets were already completed. This change adds no extra sets today.</p>}
            {exercise.skipReason || exercise.equipment?.some(id => unavailable.includes(id)) ? <>
              <p className="notice">{exercise.skipReason ? "Remaining sets skipped: " + exercise.skipReason : "Equipment marked unavailable today. Swap or skip the remaining sets."}</p>
              <RecordedSets exercise={exercise} log={log} onChange={onChange} />
            </> : <>
            <p className="helper workout-comparison">Today: {exercise.sets} × {exercise.reps}. Last recorded: {previousSession ? `${displayDate(previousSession.date)} · ${previousSession.status === "TOLERATED" ? "response tolerated" : previousSession.status === "PENDING_NEXT_DAY_RESPONSE" ? "response pending" : "response needs review"}` : "No earlier session"}.<br />{loadConvention(exercise)}</p>
            {exercise.progressionTarget && <p className="notice">{exercise.progressionTarget.text}</p>}
            <div className="set-row set-header" aria-hidden="true">
              <span>SET</span>
              <span>LAST</span>
              <span>WEIGHT</span>
              <span>
                {exercise.unit === "yards"
                  ? "YARDS"
                  : exercise.unit === "seconds"
                    ? "SEC"
                    : "REPS"}
              </span>
              <span>✓</span>
            </div>
            {Array.from({ length: exercise.sets }, (_, index) => (
              <SetRow
                key={index}
                exercise={exercise}
                index={index}
                previous={previous?.sets[index]?.complete ? previous.sets[index] : undefined}
                value={log[exercise.id]?.sets[index] || {}}
                onChange={(value) => {
                  if (
                    value.complete &&
                    !log[exercise.id]?.sets[index]?.complete
                  )
                    setRest({
                      seconds: Number(exercise.restSec) || 60,
                      at: Date.now(),
                    });
                  onChange(exercise.id, index, value);
                }}
              />
            ))}
            <details className="feedback-carry"><summary>First-set feedback shortcut</summary><button className="text-button" disabled={!feedbackFields.some(field => (log[exercise.id]?.sets[0] as any)?.[field])} onClick={() => onFeedback(exercise.id, carryFeedback(log[exercise.id]?.sets || [], exercise.sets))}>Use first-set feedback for remaining sets</button><p className="helper">Copies RPE, quality and symptoms into blank fields. Change any set as needed.</p></details>
            {log[exercise.id]?.sets.some(set => set?.complete && set.inheritedFields?.length && !set.feedbackConfirmed) && <button className="secondary-button" onClick={() => onFeedback(exercise.id, confirmFeedback(log[exercise.id].sets))}>Confirm carried feedback for completed sets</button>}
            </>}
            <p className="eyebrow">{optionalAccessory(exercise) ? "OPTIONAL ACCESSORY" : "SESSION PRIORITY"}</p>
            <ExercisePath key={exercise.id} exercise={exercise} sessions={sessions} readiness={readiness} equipment={equipment || []} date={date} progressionAllowed={!!workout.progressionAllowed} unavailable={unavailable} workoutIds={workout.items.map(e=>e.id)} onSwap={onSwap} />
            <ExerciseGuidance
              exercise={exercise}
              sessions={sessions}
              readiness={readiness}
              equipment={equipment}
            />
            {(log[exercise.id]?.sets.length || 0) > exercise.sets && <details><summary>Earlier entries outside the remaining dose</summary><RecordedSets exercise={exercise} log={log} onChange={onChange} start={exercise.sets} /></details>}
          </ExerciseCard>
        );
      })}
      <details className="detail-section">
        <summary>Session guidance</summary>
        <p className="notice">
          {workout.phase} · Keep quality and symptoms in view. Your next-morning
          response determines tolerance.
        </p>
        {workout.notes?.map((note) => (
          <p className="helper" key={note}>
            {note}
          </p>
        ))}
        {workout.omitted?.map((ex) => (
          <p className="helper" key={ex.id}>
            {ex.name} omitted: {ex.reason}
          </p>
        ))}
      </details>
      {!!workout.retained?.length && <section className="detail-section"><h2>Recorded before a swap</h2><p className="helper">These entries stay with their original exercise and are included when you save.</p>{workout.retained.map(ex => <div key={ex.id}><h3>{ex.name}</h3><RecordedSets exercise={ex} log={log} onChange={onChange} /></div>)}</section>}
      <PrimaryButton disabled={!hasSets} onClick={onFinish}>
        Finish Workout
      </PrimaryButton>
      <p className="helper">
        {hasSets
          ? "Set entries save automatically on this device."
          : "Mark a set complete before finishing."}
      </p>
    </div>
  );
}
function RecordedSets({ exercise, log, onChange, start = 0 }: { exercise: import("../types").Exercise; log: WorkoutLog; start?: number; onChange: (id: string, index: number, value: SetLog) => void }) {
  return <>{log[exercise.id]?.sets.map((set, i) => i >= start && set && Object.values(set).some(Boolean) ? <div key={i}>
    <p>Set {i + 1}: {set.load || "0"} lb × {set.reps || "—"} · {set.complete ? "Completed" : "Uncompleted"}</p>
    <details><summary>Correct recorded set {i + 1}</summary><p className="helper">Correct an entry made before the change. Restore the exercise to perform remaining sets.</p><SetRow completionLocked exercise={exercise} index={i} value={set} onChange={value => onChange(exercise.id, i, { ...value, complete: set.complete })} /></details>
  </div> : null)}</>;
}
export function FinishScreen({
  busy,
  onBack,
  onSave,
}: {
  busy: boolean;
  onBack: () => void;
  onSave: (details: {
    overallDifficulty: string;
    immediateAchillesResponse: string;
    notes: string;
  }) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({
      overallDifficulty: String(data.get("difficulty")),
      immediateAchillesResponse: String(data.get("achilles")),
      notes: String(data.get("notes") || ""),
    });
  }
  return (
    <>
      <button className="text-button page-back" onClick={onBack}>
        ← Workout
      </button>
      <div className="screen-heading">
        <h1>How did it go?</h1>
        <p>Tomorrow’s response confirms how you tolerated today’s loading.</p>
      </div>
      <form onSubmit={submit}>
        <Choice
          name="difficulty"
          title="Overall difficulty?"
          options={[
            ["easy", "Easy"],
            ["right", "About right"],
            ["hard", "Hard"],
            ["too-hard", "Too hard"],
          ]}
        />
        <Choice
          name="achilles"
          title="How does your Achilles feel now?"
          options={[
            ["good", "Good"],
            ["mild", "Mild symptoms"],
            ["worse", "Worse than expected"],
          ]}
        />
        <div className="question">
          <label>
            Notes (optional)
            <textarea name="notes" rows={3} />
          </label>
        </div>
        <PrimaryButton disabled={busy} type="submit">
          {busy ? "Saving…" : "Save Workout"}
        </PrimaryButton>
      </form>
    </>
  );
}
