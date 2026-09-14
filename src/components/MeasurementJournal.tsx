import { useEffect, useState } from 'react';
import { Card, PrimaryButton } from './ui';
import { getAll, put } from '../db.js';
import { dayKey } from '../data/provisionalWeek.js';
import { MEASUREMENTS, validateMeasurement } from '../data/measurements.js';

export function MeasurementJournal({ editable = false }: { editable?: boolean }) {
  const [rows, setRows] = useState<any[]>([]);
  const [metric, setMetric] = useState('heel-reps');
  const [side, setSide] = useState('repaired');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const reload = async () => setRows((await getAll('settings')).filter((r: any) => r.measurementRecordVersion === 1));
  useEffect(() => { void reload().catch(() => setMessage('Measurements could not be loaded.')); }, []);
  const definition = MEASUREMENTS.find(m => m.id === metric)!;
  const points = rows.filter(r => r.metric === metric && r.side === side).sort((a,b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
  const max = Math.max(1, ...points.map(p => Number(p.value)));
  return <Card>
    <h2>Individual measurements</h2>
    <p>Record one result without repeating your baseline. Use the same setup for comparisons.</p>
    <p className="helper">These dated observations do not update clearance or replace monthly assessments. Record only tests appropriate to your current restrictions; review Tests before performing a new test.</p>
    <label className="form-field">Measurement<select value={metric} onChange={e => setMetric(e.target.value)}>{MEASUREMENTS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
    <label className="form-field">Side<select value={side} onChange={e => setSide(e.target.value)}><option value="repaired">Repaired</option><option value="uninvolved">Uninvolved</option></select></label>
    {editable && <form onSubmit={async e => {
      e.preventDefault(); const form = e.currentTarget; const data = new FormData(form); setBusy(true);
      try { const record = validateMeasurement({ id: `measurement-${crypto.randomUUID()}`, measurementRecordVersion: 1, metric, side, date: String(data.get('date')), value: String(data.get('value')), setup: String(data.get('setup')), notes: String(data.get('notes') || ''), createdAt: new Date().toISOString() }, dayKey()); await put('settings', record); await reload(); form.reset(); setMessage('Measurement saved on this device.'); }
      catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save.'); }
      finally { setBusy(false); }
    }}>
      <label className="form-field">Measured on<input name="date" type="date" defaultValue={dayKey()} max={dayKey()} required /></label>
      <label className="form-field">Result ({definition.unit})<input name="value" type="number" step="any" min="0" max={definition.max} required /></label>
      <label className="form-field">Setup, assistance and repetitions<input name="setup" placeholder="Flat floor, fingertip balance; same shoes" required maxLength={300} /></label>
      <label className="form-field">Symptoms or quality notes<textarea name="notes" maxLength={1000} /></label>
      <PrimaryButton type="submit" disabled={busy}>Save measurement</PrimaryButton>
    </form>}
    {message && <p role="status">{message}</p>}
    {!points.length ? <p>Not measured yet.</p> : <>
      <svg viewBox="0 0 320 150" role="img" aria-label={`${definition.name}, ${side} side. Values listed below.`} style={{width:'100%'}}>
        <line x1="20" y1="130" x2="300" y2="130" stroke="currentColor" />
        {points.map((p,i) => <circle key={p.id} cx={points.length === 1 ? 160 : 20 + i * 280 / (points.length-1)} cy={125-Number(p.value)/max*100} r="5" fill="#3165FC" />)}
      </svg>
      <p className="helper">Separate observations; compare setup and repetitions before interpreting a change.</p>
      <details><summary>{points.length} recorded results</summary>{[...points].reverse().map(p => <div className="activity-row" key={p.id}><time>{p.date}</time><strong>{p.value} {definition.unit}</strong><small>{p.setup} {p.notes}</small></div>)}</details>
    </>}
  </Card>;
}
