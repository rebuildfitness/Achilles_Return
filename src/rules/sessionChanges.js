import { swapExercise } from './trainingFlexibility.js';

export const emptySessionChanges = (date) => ({ id: `workout-changes-${date}`, date, choices: {}, retained: [], unavailable: [], events: [] });
export const hasEntries = entry => entry?.sets?.some(set => set && Object.values(set).some(Boolean));

// Apply dated choices to the currently permitted plan; never carry a snapshot past a safety gate.
export function applySessionChanges(workout, changes, log, equipment, readiness) {
  if (readiness === 'RED') return { ...workout, items: [], retained: [] };
  const items = workout.items.map(ex => {
    const choice = changes.choices?.[ex.originalId || ex.id];
    if (!choice) return ex;
    let selected = ex;
    try { if (choice.id !== ex.id) selected = swapExercise(ex, choice.id, equipment, readiness, choice.reason); }
    catch { return { ...ex, adjustment: 'Previous alternative is unavailable under the current plan. Review Swap exercise.' }; }
    return { ...selected, sets: Math.min(selected.sets, choice.sets ?? selected.sets), ...(choice.skipped ? { skipReason: choice.reason } : {}) };
  });
  const activeIds = new Set(items.map(ex => ex.id));
  const retained = (changes.retained || []).filter(ex => !activeIds.has(ex.id) && hasEntries(log[ex.id]));
  return { ...workout, items, retained };
}

export function recordSessionChange(changes, exercise, replacement, reason, scope, unavailable, log, at) {
  const next = structuredClone(changes);
  const origin = exercise.originalId || exercise.id;
  const completed = (log[exercise.id]?.sets || []).filter(s => s?.complete).length;
  const targetCompleted = (log[replacement?.id]?.sets || []).filter(s => s?.complete).length;
  const sets = !replacement || replacement.id === exercise.id ? exercise.sets : Math.min(replacement.sets, targetCompleted + Math.max(0, exercise.sets - completed));
  next.choices[origin] = { id: replacement?.id || exercise.id, reason, skipped: !replacement, scope, sets };
  if (hasEntries(log[exercise.id]) && !next.retained.some(ex => ex.id === exercise.id)) next.retained.push(exercise);
  next.unavailable = [...new Set(unavailable)];
  next.events.push({ fromId: exercise.id, fromName: exercise.name, toId: replacement?.id || null, toName: replacement?.name || null, reason, scope, at });
  return next;
}

// Historical entries can outlive a smaller replacement dose; never truncate them on finish.
export const sessionItems = (workout, log) => [...workout.items, ...(workout.retained || [])].map(ex => ({ ...ex, sets: Math.max(ex.sets, log[ex.id]?.sets.length || 0) }));
