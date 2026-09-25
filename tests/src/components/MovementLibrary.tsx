import { useState } from "react";
import { Card } from "./ui";
import { MOVEMENT_EXERCISES } from "../data/movementRoutines.js";
import { MovementDemo } from "./MovementDemo";
import { ExerciseIllustration } from "./ExerciseIllustration";
export function MovementLibrary({
  category,
  onMovement,
  equipment = [],
}: {
  category: string;
  onMovement?: () => void;
  equipment?: string[];
}) {
  const [body, setBody] = useState(""),
    [selectedEquipment, setSelectedEquipment] = useState(""),
    [position, setPosition] = useState(""),
    [owned, setOwned] = useState(false);
  const candidates = MOVEMENT_EXERCISES.filter((e) =>
    category === "All"
      ? true
      : category === "Achilles"
        ? e.lowerLegDemand
        : category === "Mobility"
          ? e.category === "mobility"
          : category === "Core"
            ? e.category === "core_stability"
            : e.category === "balance_movement_control",
  );
  const rows = candidates
    .filter(
      (e) =>
        (!body || e.bodyArea === body) &&
        (!position || e.position === position) &&
        (!selectedEquipment || (selectedEquipment === "bodyweight" ? !e.equipment.length : e.equipment.includes(selectedEquipment))) &&
        (!owned || e.equipment.every((id) => equipment.includes(id))),
    )
    .sort(
      (a, b) =>
        Number(b.equipment.every((id) => equipment.includes(id))) -
        Number(a.equipment.every((id) => equipment.includes(id))),
    );
  return (
    <>
      <Card>
        <h2>{category} movements</h2>
        <p>
          Routine movements from your approved handoff. Category membership does
          not grant exercise clearance.
        </p>
        <label>
          Body area
          <select value={body} onChange={(e) => setBody(e.target.value)}>
            <option value="">All areas</option>
            {[...new Set(candidates.map((e) => e.bodyArea))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Position
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="">All positions</option>
            {[...new Set(candidates.map((e) => e.position))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Movement equipment
          <select value={selectedEquipment} onChange={e=>setSelectedEquipment(e.target.value)}>
            <option value="">All equipment</option>
            <option value="bodyweight">Bodyweight / stable support</option>
            {[...new Set(candidates.flatMap(e=>e.equipment))].map(id=><option key={id} value={id}>{id.replaceAll("-", " ")}</option>)}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={owned}
            onChange={(e) => setOwned(e.target.checked)}
          />{" "}
          Only my selected equipment
        </label>
        <p role="status">{rows.length} movements found</p>
        {onMovement && (
          <button className="secondary-button" onClick={onMovement}>
            Build or log a session
          </button>
        )}
      </Card>
      {rows.map((ex) => (
        <Card key={ex.id}>
          <ExerciseIllustration exerciseId={ex.id} name={ex.name}>
          <h3>{ex.name}</h3>
          <p>
            {ex.bodyArea} · {ex.position}
          </p>
          <p>{ex.defaultDose}</p>
          <MovementDemo exerciseId={ex.id} />
          <small>
            Plan/restriction guided · no automatic progression credit
          </small>
          </ExerciseIllustration>
        </Card>
      ))}
    </>
  );
}
