import { useEffect, useState } from "react";
import { get, put } from "../db.js";
import { elapsedMs, formatDuration, timerTransition } from "../data/workoutExperience.js";
export function WorkoutTimer({ storageKey }: { storageKey: string }) {
  const [timer, setTimer] = useState<any>(), [now, setNow] = useState(Date.now()), [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => { let active = true; get('settings', storageKey).then(value => { if (active) setTimer(value || {id:storageKey, accumulatedMs:0,runningSince:null}); }).catch(() => setError('Could not load the session timer.')); const tick = window.setInterval(() => setNow(Date.now()),1000); return () => {active=false; clearInterval(tick);}; }, [storageKey]);
  async function toggle() { if (!timer || busy) return; setBusy(true); setError(''); try { const time = Date.now(); const next = timerTransition(timer, timer.runningSince != null ? 'pause' : 'start', time); await put('settings',next); setTimer(next); setNow(time); } catch { setError('Could not save the timer. Try again.'); } finally { setBusy(false); } }
  return <div className="workout-timer"><div><strong>Workout time</strong><output aria-label="Workout elapsed time">{formatDuration(elapsedMs(timer,now))}</output></div><button className="text-button" disabled={!timer || busy} onClick={toggle}>{timer?.runningSince != null ? 'Pause workout timer' : timer?.startedAt ? 'Resume workout timer' : 'Start workout timer'}</button><small>Includes rest. Pause for interruptions; keeps time when the screen is locked.</small>{error && <p role="alert">{error}</p>}</div>;
}
