import { useState } from "react";
import { loadGuidance, swapOptions } from "../rules/trainingFlexibility.js";
import { EQUIPMENT } from "../data/catalog.js";
import type { Exercise, Session } from "../types";
export function ExerciseGuidance({
  exercise,
  sessions,
  readiness,
  onSwap,
  equipment = EQUIPMENT,
}: {
  exercise: Exercise;
  sessions: Session[];
  readiness: string;
  equipment?: string[];
  onSwap?: (exercise: Exercise, id: string, reason: string) => Promise<void>;
}) {
  const guide = loadGuidance(exercise, sessions, readiness);
  const [choice, setChoice] = useState("");
  const [reason, setReason] = useState("equipment");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const options = swapOptions(exercise, equipment);
  return (
    <details>
      <summary>Starting weight, cadence & exercise options</summary>
      <p>{guide.starting}</p>
      <p>{guide.cadence}</p>
      <p>{guide.overload}</p>
      <p>{guide.transition}</p>
      {(exercise.originalId || exercise.id) === "db-bench" && (
        <p>
          Progression route: incline dumbbells → Smith incline press →
          Olympic-bar bench press with your B52 rack safeties. Each change needs
          its own warm-up and starting-load assessment.
        </p>
      )}
      {(exercise.originalId || exercise.id) === "belt-squat" && (
        <p>
          Progression route: belt squat → controlled Smith squat → barbell back
          squat with rack safeties. Reaching 225 lb is an equipment limit, not
          proof of back-squat readiness.
        </p>
      )}
      {guide.limit !== null && (
        <p>
          Equipment limit: {guide.limit} lb
          {guide.limit === 50 ? " per dumbbell" : ""}. Band resistance is
          variable; never count band color as extra pounds.
        </p>
      )}
      <p className="helper">
        Smith load means added plates unless you know the effective bar
        resistance; Olympic load includes the 45 lb bar. Cable stacks are
        machine-specific. A new variation starts a separate history.
      </p>
      {options.length > 1 && onSwap && (
        <>
          <label className="form-field">
            Alternative exercise
            <select
              aria-label={"Alternative for " + exercise.name}
              value={choice}
              onChange={(e) => setChoice(e.target.value)}
            >
              <option value="">Choose an alternative</option>
              {options
                .filter((ex: any) => ex.id !== exercise.id)
                .map((ex: any) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="form-field">
            Reason
            <select
              aria-label={"Swap reason for " + exercise.name}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="equipment">Equipment / preference</option>
              <option value="progression">Ready for a new variation</option>
              <option value="discomfort">
                Current movement causes discomfort
              </option>
            </select>
          </label>
          <p className="helper">
            For an injury, stop the provoking movement and follow any new
            restrictions. An alternative is not a diagnosis or clearance.
            Changing an exercise does not remove your calf rehab.
          </p>
          <button
            className="secondary-button"
            disabled={!choice || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onSwap(exercise, choice, reason);
                setChoice("");
              } catch (e) {
                setMessage(String(e instanceof Error ? e.message : e));
              } finally {
                setBusy(false);
              }
            }}
          >
            Use this alternative
          </button>
          <p role="status">{message}</p>
        </>
      )}
    </details>
  );
}
