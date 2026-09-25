import { nextGuidedSet } from '../data/guidedWorkout.js';
import { RehabProgression } from "../components/RehabProgression";
import { PlannedExposure } from "../components/PlannedExposure";
import { TimedActivity } from "../components/TimedActivity";
import { ExercisePath } from "../components/ExercisePath";
import { loadConvention, previousExerciseSession } from "../data/workflowClarity.js";
import { displayDate } from "../data/displayDates.js";
import { WorkoutTimer } from "../components/WorkoutTimer";
import { carryFeedback, confirmFeedback, feedbackFields, timerKey } from "../data/workoutExperience.js";
import { ExerciseSwap, type SwapAction } from "../components/ExerciseSwap";
import { optionalAccessory, sessionEstimate, sessionItemsForDisplay } from "../data/sessionPresentation.js";
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
  exposure,
  onExposure,
  exposureLogger,
  shortSession = false,
  onSessionMode,
  guided = false,
  onGuided,
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
  exposureLogger?: import("react").ReactNode;
  shortSession?: boolean;
  onSessionMode?: (short: boolean) => void;
  guided?: boolean;
  onGuided?: (guided: boolean) => void;
  exposure?: any;
  onExposure?: (domain: string) => void;
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
  const [round, setRound] = useState(0);
  const [blockFilter, setBlockFilter] = useState("");
  const conditioning = workout.sessionFormat === "rehab-conditioning";
  const visibleItems = sessionItemsForDisplay(workout.items, log, shortSession) as typeof workout.items;
  const nextSet = nextGuidedSet(visibleItems, log, conditioning);
  const currentExercise = visibleItems.find(ex=>ex.id===nextSet?.id);
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
        <h1>{conditioning ? "Rehab & Conditioning" : "Full Workout"}</h1>
        {!guided && <p>{workout.title}</p>}
        {!guided && <p className="helper">{sessionEstimate(visibleItems)}{exposure ? "; add the prescribed running / sport block below." : ""}</p>}
        <details className="workout-options"><summary>Session options</summary>
        <label><input type="checkbox" checked={guided} onChange={e=>onGuided?.(e.target.checked)}/> Guide me through each set</label>
        <label><input type="checkbox" checked={shortSession} onChange={e => {onSessionMode?.(e.target.checked);setBlockFilter("");setRound(0);}} /> {conditioning ? "Essential rehab session" : "Shorter session: hide optional accessories"}</label>
        <p className="helper">Full: {sessionEstimate(workout.items)}. {conditioning ? "Essential" : "Shorter"}: {sessionEstimate(sessionItemsForDisplay(workout.items, log, true))}. If there are no optional accessories, both options contain the same work.</p><p className="helper">Core rehab and primary strength remain at their prescribed doses. Hidden exercises stay uncompleted in your original plan; completed sets are never removed. Restore the full list at any time.</p></details>
      </div>
      {conditioning && !guided && <section className="detail-section" aria-label="Rehab session choice">
        <div className="section-heading"><h2>{shortSession ? "Essential session" : "Full session"}</h2><button className="text-button" onClick={()=>{onSessionMode?.(!shortSession);setBlockFilter("");setRound(0);}}>{shortSession ? "Choose Full" : "Choose Essential"}</button></div>
        <p className="helper">{shortSession ? "Core work with the same sets, reps and rest. Supplementary exercises are omitted unless already started." : "Core work plus supplementary calf, toe-walking and movement practice."}</p>
        <details><summary>What is supplementary?</summary><ul>{workout.items.filter(optionalAccessory).map(ex=><li key={ex.id}>{ex.name} · {ex.block}</li>)}</ul><p className="helper">Started exercises stay visible. Omitted exercises stay uncompleted and cannot earn progression.</p></details>
      </section>}
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
      {conditioning && !guided && <section className="detail-section" aria-label="Rehab session blocks">
        <h2>Your session blocks</h2>
        <RehabProgression rows={workout.blockProgression}/>
        <p>Follow this order: warm-up → strength and Achilles circuits A/B → balance and control C → conditioning. Complete Circuits A and B for three rounds and Circuit C for two. One set of each exercise makes a round. Readiness may reduce sets. Preserve the displayed recovery, and finish with the selected conditioning block.</p>
        <label>Session block<select aria-label="Session block" value={blockFilter} onChange={e=>{setBlockFilter(e.target.value);setRound(0);}}><option value="">{shortSession ? "All essential blocks" : "Full session"}</option>{[...new Set(visibleItems.map(ex=>ex.block).filter(Boolean))].map(block=><option key={block} value={block}>{block}</option>)}</select></label>
        <label>Round view<select aria-label="Round view" value={round} onChange={e=>setRound(Number(e.target.value))}><option value={0}>All sets</option>{Array.from({length: Math.max(0,...visibleItems.filter(ex=>!blockFilter || ex.block===blockFilter).map(ex=>ex.sets))},(_,i)=><option key={i} value={i+1}>Round {i+1}</option>)}</select></label>
        <p className="helper">Round view changes the display only. It never completes, adds or removes prescribed work. All selected blocks remain available above.</p>
        {exposure && onExposure && !exposureLogger && <><p className="notice">This progression exposure replaces the bike block. Complete it through its own logger before saving the rehab workout. Follow its prescribed warm-up and recovery.</p><PlannedExposure exposure={exposure} onStart={onExposure}/></>}
        {workout.conditioningReplaced && !exposure && <p className="notice">Progression work is already recorded today; no additional conditioning finisher is prescribed.</p>}
        {!exposure && !workout.conditioningReplaced && <p className="helper">No impact session is assigned here today. Use the listed conditioning block; Tests shows requirements for progression activities. Floor backward jogging and carioca are not treadmill substitutions.</p>}
      </section>}
      {guided && <section aria-label="Guided workout">
        <div className="section-heading"><h2>Next set</h2><button className="text-button" onClick={()=>onGuided?.(false)}>View full session</button></div>
        <p role="status">{currentExercise && nextSet ? currentExercise.name+" · "+(conditioning ? "Round " : "Set ")+(nextSet.index+1)+" of "+currentExercise.sets : "No uncompleted, unskipped exercise sets remain."}</p>
        {nextSet?.block && <p className="eyebrow">{nextSet.block}</p>}
        <p className="helper">Complete the set to continue, then rest as prescribed. Use Swap exercise to swap or skip remaining sets.</p>
        {!nextSet && <p>{exposureLogger ? "Continue with the prescribed running / sport block below." : "Review your recorded work, then finish when ready."}</p>}
      </section>}
      {visibleItems.filter(ex=> guided ? ex.id===nextSet?.id : !conditioning || ((!blockFilter || ex.block===blockFilter) && (!round || ex.sets>=round))).map((exercise) => {
        const previousSession = previousExerciseSession(sessions, exercise.id, date);
        const previous = previousSession?.exerciseLog[exercise.id];
        return (
          <ExerciseCard key={exercise.id} exercise={exercise} online={online}>
            {conditioning && exercise.block && <p className="eyebrow">{exercise.block}</p>}
            {conditioning && exercise.unit === "seconds" && <TimedActivity storageKey={`work-${date}-${workout.id}-${exercise.id}`} seconds={Number(String(exercise.reps).match(/\d+/)?.[0]) || 30} name={exercise.name} />}
            {onSwap && <ExerciseSwap exercise={exercise} equipment={equipment} unavailable={unavailable} workoutIds={workout.items.map(ex => ex.id)} onSwap={onSwap} />}
            {exercise.sets === 0 && <p className="helper">All planned sets were already completed. This change adds no extra sets today.</p>}
            {exercise.skipReason || exercise.equipment?.some(id => unavailable.includes(id)) ? <>
              <p className="notice">{exercise.skipReason ? "Remaining sets skipped: " + exercise.skipReason : "Equipment marked unavailable today. Swap or skip the remaining sets."}</p>
              <RecordedSets exercise={exercise} log={log} onChange={onChange} />
            </> : <>
            <p className="helper workout-comparison">Today: {exercise.sets} × {exercise.reps}. Last recorded: {previousSession ? `${displayDate(previousSession.date)} · ${previousSession.status === "TOLERATED" ? "response tolerated" : previousSession.status === "PENDING_NEXT_DAY_RESPONSE" ? "response pending" : "response needs review"}` : "No earlier session"}.<br />{exercise.id === "library-stationary-cycling" ? "Record actual seconds; leave weight blank. Bike resistance is not pounds." : loadConvention(exercise)}</p>
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
            {Array.from({ length: exercise.sets }, (_, index) => index).filter(index => guided ? index === nextSet?.index : !conditioning || !round || index === round-1).map(index => (
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
                      seconds: exercise.restSec ?? 60,
                      at: Date.now(),
                    });
                  onChange(exercise.id, index, value);
                }}
              />
            ))}
            <p className="helper">First-set RPE, quality and symptoms automatically fill blank feedback on remaining sets of this exercise. Edit any differences; confirm carried feedback once after the exercise.</p><details className="feedback-carry"><summary>First-set feedback shortcut</summary><button className="text-button" disabled={!feedbackFields.some(field => (log[exercise.id]?.sets[0] as any)?.[field])} onClick={() => onFeedback(exercise.id, carryFeedback(log[exercise.id]?.sets || [], exercise.sets))}>Use first-set feedback for remaining sets</button><p className="helper">Copies RPE, quality and symptoms into blank fields. Change any set as needed.</p></details>
            {log[exercise.id]?.sets.some(set => set?.complete && set.inheritedFields?.length && !set.feedbackConfirmed) && <button className="secondary-button" onClick={() => onFeedback(exercise.id, confirmFeedback(log[exercise.id].sets))}>Confirm carried feedback for completed sets</button>}
            </>}
            <p className="eyebrow">{optionalAccessory(exercise) ? conditioning ? "SUPPLEMENTARY" : "OPTIONAL ACCESSORY" : conditioning ? "ESSENTIAL" : "SESSION PRIORITY"}</p>
            <ExercisePath blockProgression={workout.blockProgression} key={exercise.id} exercise={exercise} sessions={sessions} readiness={readiness} equipment={equipment || []} date={date} progressionAllowed={!!workout.progressionAllowed} unavailable={unavailable} workoutIds={workout.items.map(e=>e.id)} onSwap={onSwap} />
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
      {guided && visibleItems.filter(ex=>ex.id!==nextSet?.id && log[ex.id]?.sets.some(set=>set?.complete && set.inheritedFields?.length && !set.feedbackConfirmed)).map(ex=><section className="detail-section" key={ex.id}><h3>{ex.name}: review carried feedback</h3><p className="helper">Confirm only if the copied feedback matches the completed sets. Use the full session to correct differences.</p><button className="secondary-button" onClick={()=>onFeedback(ex.id,confirmFeedback(log[ex.id].sets))}>Confirm carried feedback for {ex.name}</button></section>)}
      {exposureLogger && (!guided || !nextSet) && <section aria-label="Running and sport block" className="detail-section"><h2>Running / sport block</h2><p>Follow the prescribed dose and record it here. This block has its own tolerance record; it does not add another conditioning finisher.</p>{exposureLogger}</section>}
      {sessions.filter(s=>s.date===date && s.domain).map(s=><section key={s.id} className="detail-section"><h2>Running / sport work saved</h2><p>{s.workoutTitle} · {s.minutes || '—'} minutes. Next-morning response still determines tolerance.</p></section>)}
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
  review,
  busy,
  onBack,
  onSave,
}: {
  review?: import("react").ReactNode;
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
      {review}
      <p className="helper">After saving, copy your AI coaching report immediately. Tomorrow’s response can be added later.</p>
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
