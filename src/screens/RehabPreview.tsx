import { Card, ExerciseCard, PrimaryButton } from "../components/ui";
import { sessionEstimate } from "../data/sessionPresentation.js";
import type { Workout } from "../types";
export function RehabPreview({workout, enabled, busy, online, canStart, onStart, onEnable, onBack, onPlan, onTests}: {
 workout?: Workout; enabled:boolean; busy:boolean; online:boolean; canStart:boolean;
 onStart:()=>void; onEnable:()=>void; onBack:()=>void; onPlan:()=>void; onTests:()=>void;
}) {
 return <>
  <button className="text-button page-back" onClick={onBack}>Back to Today</button>
  <div className="screen-heading"><h1>Achilles Rehab &amp; Conditioning</h1><p>Dedicated workout preview</p></div>
  <p className="helper">Preview only; no activity is logged here. Your scheduled workout applies today's readiness and dose adjustments.</p>
  {canStart && <PrimaryButton onClick={onStart}>Open rehab logger</PrimaryButton>}
  {!workout ? <Card><p>Complete your baseline to show your personal exercise selection and prescription.</p><PrimaryButton onClick={onTests}>Open Tests</PrimaryButton></Card> : workout.stopped ? <Card><h2>Loading is on hold today</h2><p>Your current safety guidance overrides the workout. Review your check-in before training.</p></Card> : <>
   <p>{sessionEstimate(workout.items)}</p>
   {[...new Set(workout.items.map(ex=>ex.block))].map(block=><section key={block} className="detail-section"><h2>{block}</h2>{workout.items.filter(ex=>ex.block===block).map(ex=><ExerciseCard key={ex.id} exercise={ex} online={online}/>)}</section>)}
   {!!workout.omitted?.length && <Card><h2>Unavailable with your equipment</h2>{workout.omitted.map(ex=><p key={ex.id}>{ex.name}: {ex.reason}</p>)}</Card>}
   <Card><h2>How the session works</h2>{workout.notes?.map(note=><p key={note}>{note}</p>)}</Card>
  </>}
   <Card>
   <p>Calf strength, leg control, balance and conditioning in one structured session.</p>
   <p className="notice">Preview only. Viewing does not start a workout or add training today. This template preview does not include dated swaps, re-entry reductions or your assigned impact session; the scheduled workout applies those before logging.</p>
   {!enabled && <><PrimaryButton disabled={busy} onClick={onEnable}>Use dedicated rehab schedule</PrimaryButton><p className="helper">Replaces the next B slot from tomorrow onward. Today's workout and completed history stay unchanged.</p></>}
   {enabled && <p>The dedicated schedule is enabled. The rehab workout occupies your B slot; it is not an extra recovery-day session.</p>}
   {canStart ? <PrimaryButton onClick={onStart}>Open scheduled rehab workout</PrimaryButton> : <button className="secondary-button" onClick={onPlan}>Find rehab day in Plan</button>}
   <p className="helper">Starting requires its scheduled day, an unfinished workout, a check-in and the existing readiness checks.</p>
  </Card>
 </>;
}
