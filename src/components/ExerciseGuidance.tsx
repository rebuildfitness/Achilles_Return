import { loadGuidance } from "../rules/trainingFlexibility.js";
import { EQUIPMENT } from "../data/catalog.js";
import { OWNED_LOADS } from "../data/ownedLoads.js";
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
  return (
    <details>
      <summary>Starting weight, cadence & exercise options</summary>
      <p>{guide.starting}</p>
      <p>{guide.cadence}</p>
      <p>{guide.overload}</p>
      <p className="helper">{guide.evidence}</p>
      <p>{guide.transition}</p>
      {(exercise.originalId || exercise.id) === "db-bench" && (
        <p>
          Your preferred equipment route (not a ranking): incline dumbbells → Smith incline press →
          Olympic-bar bench press with your B52 rack safeties. Each change needs
          its own warm-up and starting-load assessment.
        </p>
      )}
      {(exercise.originalId || exercise.id) === "belt-squat" && (
        <p>
          Preferred route: Fringe Sport Mammoth belt squat → controlled Smith
          squat → barbell back squat with B52 rack safeties. At 225 lb, review
          technique and Achilles tolerance before transitioning. There is no
          automatic swap or Smith-to-barbell weight threshold. Establish a
          separate starting load for each variation; loads are not interchangeable.
        </p>
      )}
      {guide.limit !== null && (
        <p>
          {exercise.id === "belt-squat" ? "Available Olympic plates: " : "Equipment limit: "}{guide.limit} lb
          {guide.limit === 50 ? " per dumbbell" : ""}. Band resistance is
          variable; never count band color as extra pounds.
        </p>
      )}
      <p className="helper">
        Mammoth belt-squat load means added plates only; you own {OWNED_LOADS.olympicPlatesLb} lb.
        Smith load means added plates unless you know the effective bar
        resistance; Olympic load includes the 45 lb bar. Cable stacks are
        machine-specific. A new variation starts a separate history.
      </p>

    </details>
  );
}
