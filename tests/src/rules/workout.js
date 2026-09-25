import { BASE_WORKOUT, RECOVERY_WORKOUT } from '../data/workouts.js';
import { READINESS } from './readiness.js';

export function buildWorkout(readiness) {
  if (!readiness || readiness.level === READINESS.GREEN) return clone(BASE_WORKOUT);
  if (readiness.level === READINESS.RED) return { id:'red-stop', title:'No Achilles Workout', phase:'Safety Hold', items:[], stopped:true };
  if (readiness.level === READINESS.YELLOW_3) return clone(RECOVERY_WORKOUT);

  const workout = clone(BASE_WORKOUT);
  workout.title = 'Modified Achilles + Lower Body';
  workout.items = workout.items.map(item => {
    if (readiness.level === READINESS.YELLOW_1 && ['moderate','high'].includes(item.loadTier)) {
      return { ...item, sets: Math.max(2, item.sets - 1), adjustment: 'Reduced volume today' };
    }
    if (readiness.level === READINESS.YELLOW_2 && item.loadTier === 'high') {
      return null;
    }
    if (readiness.level === READINESS.YELLOW_2 && item.loadTier === 'moderate') {
      return { ...item, sets: Math.max(2, item.sets - 1), effort: 'Moderate', adjustment: 'Reduced Achilles demand today' };
    }
    return item;
  }).filter(Boolean);
  return workout;
}

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

export function resumeAfterMissedSessions(daysMissed, readinessLevel) {
  if (readinessLevel === READINESS.RED) return { action:'STOP', reduction:1 };
  if (daysMissed <= 3) return { action:'RESUME', reduction:0 };
  if (daysMissed <= 10) return { action:'REDUCED_REENTRY', reduction:0.2 };
  return { action:'RETEST_AND_REENTER', reduction:0.3 };
}
