import {sessionReview} from '../data/sessionPresentation.js';
import type {Exercise,WorkoutLog,Session} from '../types';
export function SessionReview({items,log,sessions,date,short=false}:{items:Exercise[];log:WorkoutLog;sessions:Session[];date:string;short?:boolean}) {
 const rows=sessionReview(items,log,sessions,date);
 return <section className="detail-section" aria-label="Session review"><h2>Session review</h2>
 <p>{short ? items.some(ex=>ex.block) ? 'Essential' : 'Shorter' : 'Full'} session · {rows.reduce((n,r)=>n+r.completed,0)} completed sets · {rows.filter(r=>r.remaining>0).length} exercises with unfinished work.</p>
 <p className="helper">Unfinished work stays uncompleted. Saving does not mark skipped sets as done.</p>
 <details><summary>Completed, unfinished &amp; previous session</summary>{rows.map(row=><div key={row.id}><h3>{row.name}</h3><p>{row.status} · {row.completed} / {row.planned} sets</p><p className="helper">Today: {row.current || 'No completed sets'}<br/>Previous {row.previousDate || 'session'}: {row.previous || 'No earlier completed sets'}</p></div>)}</details>
 </section>;
}
