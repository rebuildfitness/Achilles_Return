// Product time estimates, not prescribed duration or clinical progression rules.
export function optionalAccessory(exercise) {
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
