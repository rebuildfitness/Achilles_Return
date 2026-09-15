export const feedbackFields = ['rpe', 'quality', 'symptoms'];
export function carryFeedback(sets, count) {
  const next = structuredClone(sets);
  const source = next[0] || {};
  if (!feedbackFields.some(field => source[field] != null && source[field] !== "")) return next;
  for (let i = 1; i < count; i++) {
    const set = next[i] || {};
    if (set.complete) continue;
    const inherited = [];
    for (const field of feedbackFields) if ((set[field] == null || set[field] === '') && source[field] != null && source[field] !== '') {
      set[field] = source[field]; inherited.push(field);
    }
    if (inherited.length) { set.inheritedFields = [...new Set([...(set.inheritedFields || []), ...inherited])]; set.feedbackConfirmed = false; }
    next[i] = set;
  }
  return next;
}
export function editFeedback(previous, value) {
  const next = { ...value };
  next.inheritedFields = (previous?.inheritedFields || []).filter(field => previous[field] === value[field]);
  // A new completion requires confirmation even if the entry was confirmed earlier.
  if (next.inheritedFields.length && previous?.complete !== value.complete) next.feedbackConfirmed = false;
  if (!next.inheritedFields.length) { delete next.inheritedFields; delete next.feedbackConfirmed; }
  return next;
}
export const confirmFeedback = sets => sets.map(set => set?.complete && set.inheritedFields?.length ? { ...set, feedbackConfirmed: true } : set);
export const timerKey = (date, workoutId) => `workout-timer-${date}-${workoutId}`;
export function elapsedMs(timer, now) { return Math.max(0, timer?.accumulatedMs || 0) + (timer?.runningSince != null ? Math.max(0, now - timer.runningSince) : 0); }
export function timerTransition(timer, action, now) {
  const next = { ...timer, accumulatedMs: elapsedMs(timer, now), runningSince: null };
  if (action === 'start') { next.startedAt ||= new Date(now).toISOString(); next.runningSince = now; }
  if (action === 'finish') next.finishedAt = new Date(now).toISOString();
  return next;
}
export function formatDuration(ms) {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 3600).toString().padStart(2,'0')}:${Math.floor(seconds / 60 % 60).toString().padStart(2,'0')}:${(seconds % 60).toString().padStart(2,'0')}`;
}
