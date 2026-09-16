import { useEffect, useState } from 'react';
import { getAll } from '../db.js';
import { MEASUREMENTS } from '../data/measurements.js';
import { measurementDraftPatch } from '../data/measurementReview.js';
import { dayKey } from '../data/provisionalWeek.js';
import { displayDate } from '../data/displayDates.js';
import type { Values } from '../types';
export function AssessmentMeasurementReview({ values, onApply }: { values: Values; onApply: (patch: Values) => void }) {
 const [rows,setRows]=useState<any[]>([]),[selected,setSelected]=useState(''),[confirmed,setConfirmed]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{getAll('settings').then(all=>setRows(all.filter((r:any)=>r.measurementRecordVersion===1).sort((a:any,b:any)=>b.date.localeCompare(a.date)))).catch(()=>setMessage('Saved measurements could not be loaded.'));},[]);
 const row=rows.find(r=>r.id===selected);
 return <details className="measurement-review"><summary>Review saved individual measurements ({rows.length})</summary>
 <p>Copying fills a draft only. Safety, symptoms, technique and the other assessment questions still need your answers. The plan changes only after you save a completed assessment.</p>
 <p>Assessment measurement date: {displayDate(String(values.assessmentDate || ''))}. Change this in Date &amp; personal details if needed.</p>
 <label>Saved result<select aria-label="Saved result" value={selected} onChange={e=>{setSelected(e.target.value);setConfirmed(false);setMessage('');}}><option value="">Choose a result</option>{rows.map(r=><option key={r.id} value={r.id}>{displayDate(r.date)} · {MEASUREMENTS.find(m=>m.id===r.metric)?.name} · {r.side} · {r.value}</option>)}</select></label>
 {row && <><p>{row.value} {MEASUREMENTS.find(m=>m.id===row.metric)?.unit} · {row.side}<br />Setup: {row.setup}<br />Notes: {row.notes || 'None'}</p>
 {['heel-reps','balance'].includes(row.metric) ? <><label><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} /> I confirm the date, side and setup match this assessment. Replace this side’s draft value with this result.</label><button type="button" className="secondary-button" disabled={!confirmed || row.date!==values.assessmentDate} onClick={()=>{try {onApply(measurementDraftPatch(row,String(values.assessmentDate),dayKey(),confirmed));setMessage('Copied to this draft. Review test quality before completing the assessment.');setConfirmed(false);}catch(e){setMessage(String(e));}}}>Copy result to assessment draft</button>{row.date!==values.assessmentDate && <p>Dates differ. Keep this as a separate observation or review the assessment date.</p>}</> : <p>This result needs additional setup details. Use Add other measurements or the detailed assessment to enter it; it is not copied automatically.</p>}</>}
 <p role="status">{message}</p></details>;
}
