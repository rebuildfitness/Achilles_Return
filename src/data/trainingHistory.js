// Presentation only. Recorded performance never implies clinical clearance.
export function exerciseHistory(sessions, id) {
  return [...sessions]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .flatMap((session) => {
      const sets = (session.exerciseLog?.[id]?.sets || []).filter(
        (set) =>
          set?.complete &&
          set.load !== "" &&
          set.load != null &&
          Number.isFinite(Number(set.load)) &&
          Number(set.load) >= 0,
      );
      if (!sets.length) return [];
      const best = sets.reduce((a, b) =>
        Number(b.load) > Number(a.load) ? b : a,
      );
      return [
        {
          date: session.date,
          load: Number(best.load),
          reps: best.reps,
          status: session.status,
          id: session.id,
        },
      ];
    });
}

export function recordedExercises(sessions) {
  const items = new Map();
  for (const session of sessions) {
    for (const id of Object.keys(session.exerciseLog || {})) {
      items.set(id, {
        id,
        name: session.plannedItems?.find((ex) => ex.id === id)?.name || id,
      });
    }
  }
  return [...items.values()].sort((a, b) => a.name.localeCompare(b.name));
}
