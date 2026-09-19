import rehabOptions from '../../spec/rehab-session-options-v1.json' with {type:'json'};
export const REHAB_SESSION_OPTIONS_VERSION = rehabOptions.version;
// Product time estimates, not prescribed duration or clinical progression rules.
export function optionalAccessory(exercise) {
  if (exercise.block && exercise.block !== 'Warm-up' && rehabOptions.supplementaryOriginIds.includes(exercise.originalId || exercise.id)) return true;
  return !!exercise.strengthModule && !['db-bench', 'supported-db-row'].includes(exercise.originalId || exercise.id);
}
export function sessionEstimate(items) {
  const explicitWarmup = items.some(ex=>ex.block === "Warm-up");
  const seconds = items.reduce((total, ex) => {
    const reps = Math.max(...(String(ex.reps).match(/\d+/g) || ['10']).map(Number));
    const work = ex.unit === 'seconds' ? reps * (/side/.test(ex.reps) ? 2 : 1) : ex.unit === 'yards' ? 45 : Math.min(reps, 30) * 5 * (/side/.test(ex.reps) ? 2 : 1);
    return total + Number(ex.sets) * work + Math.max(0, Number(ex.sets)-1) * (Number(ex.restSec) || (ex.restSec === 0 ? 0 : 60)) + (explicitWarmup ? 20 : 90);
  }, explicitWarmup ? 0 : 480);
  const midpoint = Math.ceil(seconds/60/5)*5;
  return `${Math.max(5,midpoint-10)}–${midpoint+10} min estimate, including warm-up and rest`;
}

export function sessionItemsForDisplay(items, log = {}, short = false) {
 return items.filter(ex => !short || !optionalAccessory(ex) || log[ex.id]?.sets?.some(set => set && Object.values(set).some(Boolean)));
}
export function sessionReview(items, log = {}, sessions = [], date = '') {
 return [...new Map(items.map(ex => [ex.id, ex])).values()].map(ex => {
  const done = (log[ex.id]?.sets || []).filter(s => s?.complete);
  const previous = sessions.filter(s => s.date < date && s.exerciseLog?.[ex.id]?.sets?.some(set => set?.complete))
   .sort((a,b) => b.date.localeCompare(a.date) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')))[0];
  const prior = previous?.exerciseLog[ex.id].sets.filter(s => s?.complete) || [];
  const describe = sets => sets.map(s => `${s.load == null || s.load === '' ? 'Load not recorded' : s.load+' lb'} × ${s.reps || '—'} ${ex.unit === 'seconds' ? 'sec' : ex.unit === 'yards' ? 'yards' : 'reps'}`).join('; ');
  return {id:ex.id, name:ex.name, completed:done.length, planned:ex.sets, remaining:Math.max(0,ex.sets-done.length),
   status:ex.skipReason ? 'Remaining work skipped' : !done.length ? 'Not performed' : done.length < ex.sets ? 'Partially completed' : 'Completed',
   current:describe(done), previous:describe(prior), previousDate:previous?.date || null};
 });
}
