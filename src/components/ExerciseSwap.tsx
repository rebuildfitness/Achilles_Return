import { useEffect, useState } from "react";
import { EQUIPMENT } from "../data/catalog.js";
import { EXERCISE_LIBRARY, equipmentLabel } from "../data/exerciseLibrary.js";
import { easierOptions, swapOptions } from "../rules/trainingFlexibility.js";
import type { Exercise } from "../types";

export type SwapAction = (exercise: Exercise, id: string | null, reason: string, scope: string, unavailable: string[]) => Promise<void>;
export function ExerciseSwap({ exercise, equipment = EQUIPMENT, unavailable, workoutIds, onSwap }: {
  exercise: Exercise; equipment?: string[]; unavailable: string[]; workoutIds: string[]; onSwap: SwapAction;
}) {
  const [reason, setReason] = useState("equipment"), [scope, setScope] = useState("session");
  const [missing, setMissing] = useState(unavailable), [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => setMissing(unavailable), [unavailable]);
  const options = swapOptions(exercise, equipment.filter(id => !missing.includes(id)))
    .filter((ex: any) => ex.id !== exercise.id && !workoutIds.includes(ex.id) && (reason !== "difficulty" || easierOptions(exercise).includes(ex.id)));
  const [query, setQuery] = useState(""), [showUnavailable, setShowUnavailable] = useState(false);
  const library = EXERCISE_LIBRARY.filter(ex => (showUnavailable || options.some((option: any) => option.id === ex.id)) && `${ex.name} ${ex.muscle}`.toLowerCase().includes(query.toLowerCase())).slice(0, 40);
  const candidate = options.find((ex: any) => ex.id === selected);
  async function apply(id: string | null, restore = false) {
    if (busy) return;
    setBusy(true); setError("");
    try { await onSwap(exercise, id, restore ? "equipment" : reason, id && !restore ? scope : "session", restore ? missing.filter(id => !exercise.equipment?.includes(id)) : missing); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save this change. Please try again."); }
    finally { setBusy(false); }
  }
  return <details className="exercise-swap">
    <summary>Swap exercise</summary>
    <p className="helper">Keep recorded sets and carry over remaining set slots. Each variation has its own weight history; warm up and choose a fresh load.</p>
    <label>Reason for change<select aria-label="Reason for change" value={reason} onChange={e => { setReason(e.target.value); setSelected(""); }}>
      <option value="equipment">Equipment unavailable</option><option value="difficulty">Not strong enough yet</option>
      <option value="discomfort">Discomfort or injury</option><option value="progression">Ready for another variation</option>
    </select></label>
    {reason === "discomfort" && <p className="notice">Stop the painful movement. A swap does not clear an injury or override your check-in. Skip if the alternative also causes symptoms.</p>}
    <details><summary>Equipment unavailable today ({missing.length})</summary>
      <p className="helper">Applies to this session when you save a swap or skip. Your owned-equipment profile stays the same.</p>
      <div className="equipment-checks">{equipment.map(id => <label key={id}><input type="checkbox" checked={missing.includes(id)} onChange={e => { setMissing(e.target.checked ? [...missing, id] : missing.filter(x => x !== id)); setSelected(""); }} />{equipmentLabel(id)}</label>)}</div>
    </details>
    <details className="swap-library"><summary>Browse exercise library</summary>
      <label>Search library<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Exercise or muscle group" /></label>
      <label><input type="checkbox" checked={showUnavailable} onChange={e => setShowUnavailable(e.target.checked)} /> Show entries unavailable for this swap</label>
      <p className="helper">Available replacements preserve this exercise's reviewed purpose and use your available equipment. Reference exercises are not automatically cleared for your workout.</p>
      {!library.length && <p>No matching available replacements. Change your search or show unavailable entries to see why.</p>}
      {library.map(ex => {
        const available = options.some((option: any) => option.id === ex.id);
        const why = available ? "Available replacement" : ex.id === exercise.id ? "Current exercise" : workoutIds.includes(ex.id) ? "Already in this workout" : ex.referenceOnly ? "Reference only; not cleared for workout swaps" : ex.equipment.some((id: string) => !equipment.includes(id) || missing.includes(id)) ? "Required equipment unavailable" : reason === "difficulty" && !easierOptions(exercise).includes(ex.id) ? "Not a reviewed easier replacement" : "Not a reviewed replacement for this exercise's task and dose";
        return <div className="swap-library-entry" key={ex.id}><strong>{ex.name}</strong><p className="helper">{why}</p>{available && <button className="text-button" onClick={() => setSelected(ex.id)}>{selected === ex.id ? "Selected" : "Select"} {ex.name}</button>}{ex.videoUrl && <a href={ex.videoUrl} target="_blank" rel="noreferrer">View reference</a>}</div>;
      })}
      {library.length === 40 && <p className="helper">Showing up to 40 matches. Narrow your search to find more.</p>}
    </details>
    {options.length ? <>
      <label>Alternative exercise<select aria-label="Alternative exercise" value={candidate ? selected : ""} onChange={e => setSelected(e.target.value)}><option value="">Choose an alternative</option>{options.map((ex: any) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}</select></label>
      {candidate && <p className="helper">{candidate.setup || candidate.cue} <a href={candidate.videoUrl} target="_blank" rel="noreferrer">Preview demo</a></p>}
      <label>Apply change to<select aria-label="Apply change to" value={scope} onChange={e => setScope(e.target.value)}><option value="session">This session only</option><option value="future">This and future sessions</option></select></label>
      <button className="secondary-button" disabled={busy || !candidate} onClick={() => apply(selected)}>Use this alternative</button>
    </> : <p className="helper">No reviewed {reason === "difficulty" ? "easier " : ""}alternative is available with this equipment and workout. Keep the prescribed movement within its existing guidance, or record a skip. Rehab substitutes must preserve the intended task.</p>}
    {exercise.skipReason ? <button className="text-button" disabled={busy} onClick={() => apply(exercise.id, true)}>Restore exercise and its equipment</button> : <button className="text-button" disabled={busy} onClick={() => apply(null)}>Skip remaining sets today</button>}
    <p className="helper">A skip records the selected reason and leaves unfinished sets uncompleted.</p>
    {error && <p role="alert" className="error-message">{error}</p>}
  </details>;
}
