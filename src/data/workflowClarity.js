// Display helpers only: no prescription or clinical decisions.
export function previousExerciseSession(sessions, id, date) {
  return [...sessions].filter(s => s.date < date && s.exerciseLog?.[id]?.sets?.some(set => set?.complete))
    .sort((a,b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))[0];
}
export function loadConvention(exercise) {
  const equipment = exercise.equipment || [];
  if (equipment.includes('landmine-station')) return 'Weight = added plates at the free end; note bar/setup. Not equivalent to barbell load.';
  if (equipment.includes('cable-station')) return 'Weight = stack setting; keep machine and pulley setup consistent.';
  if (equipment.includes('smith-machine')) return 'Weight = added plates; note effective bar resistance if known.';
  if (equipment.includes('belt-squat')) return 'Weight = added plates on the Mammoth.';
  if (equipment.includes('olympic-barbell') || equipment.includes('barbell')) return 'Weight = bar plus plates (your Olympic bar is 45 lb).';
  if (equipment.includes('dumbbells')) return /seated-calf|triceps/.test(exercise.id) ? 'Weight = total dumbbell load used for this movement.' : 'Weight = each dumbbell, not both combined.';
  return 'Record external load only; note assistance or resistance.';
}
