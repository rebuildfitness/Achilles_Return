import { validateMeasurement } from './measurements.js';
// Only measurements with an unambiguous field match may be copied.
export function measurementDraftPatch(row, assessmentDate, today, confirmed) {
  validateMeasurement(row, today);
  if (!confirmed) throw new Error('Confirm the date, side and test setup first.');
  if (row.date !== assessmentDate) throw new Error('Only results from the assessment measurement date can be copied.');
  const prefix = row.metric === 'heel-reps' ? 'heel' : row.metric === 'balance' ? 'balance' : null;
  if (!prefix) throw new Error('Review this result manually in the detailed test; its setup needs additional fields.');
  return { [`${prefix}_${row.side}_${prefix === 'heel' ? 'reps' : 'seconds'}`]: String(row.value),
    [`journal_${prefix}_${row.side}`]: `${row.id} | ${row.date} | ${row.setup} | ${row.notes || ''}` };
}
