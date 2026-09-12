import { ExerciseCard, PrimaryButton, SetRow } from "../components/ui";
import { Choice } from "./CheckIn";
import { ExerciseGuidance } from "../components/ExerciseGuidance";
import type { FormEvent } from "react";
import type { Session, SetLog, Workout, WorkoutLog } from "../types";
export function WorkoutScreen({
  workout,
  log,
  sessions,
  online,
  onChange,
  onBack,
  onFinish,
  onSwap,
  equipment,
  readiness = "GREEN",
}: {
  workout: Workout;
  log: WorkoutLog;
  sessions: Session[];
  online: boolean;
  onChange: (id: string, index: number, value: SetLog) => void;
  onBack: () => void;
  onFinish: () => void;
  onSwap?: (
    exercise: import("../types").Exercise,
    id: string,
    reason: string,
  ) => Promise<void>;
  equipment?: string[];
  readiness?: string;
}) {
  const hasSets = Object.values(log).some((item) =>
    item.sets.some((set) => set?.complete),
  );
  return (
    <>
      <button className="text-button page-back" onClick={onBack}>
        ← Today
      </button>
      <div className="screen-heading">
        <h1>Full Workout</h1>
        <p>{workout.title}</p>
      </div>
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
      {workout.items.map((exercise) => {
        const previous = [...sessions]
          .filter(
            (s) => s.status === "TOLERATED" && s.exerciseLog?.[exercise.id],
          )
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
          ?.exerciseLog[exercise.id];
        return (
          <ExerciseCard key={exercise.id} exercise={exercise} online={online}>
            <ExerciseGuidance
              exercise={exercise}
              sessions={sessions}
              readiness={readiness}
              equipment={equipment}
              onSwap={onSwap}
            />
            <div className="set-row set-header" aria-hidden="true">
              <span>SET</span>
              <span>PREVIOUS</span>
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
                previous={previous?.sets[index]}
                value={log[exercise.id]?.sets[index] || {}}
                onChange={(value) => onChange(exercise.id, index, value)}
              />
            ))}
          </ExerciseCard>
        );
      })}
      <PrimaryButton disabled={!hasSets} onClick={onFinish}>
        Finish Workout
      </PrimaryButton>
      <p className="helper">
        {hasSets
          ? "Set entries save automatically on this device."
          : "Mark a set complete before finishing."}
      </p>
    </>
  );
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
