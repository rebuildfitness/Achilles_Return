export const MEASUREMENTS = [
  { id: 'heel-reps', name: 'Single-leg heel-rise repetitions', unit: 'reps', max: 200 },
  { id: 'heel-height', name: 'Heel-rise height', unit: 'cm', max: 30 },
  { id: 'balance', name: 'Single-leg balance', unit: 'seconds', max: 60 },
  { id: 'mobility', name: 'Knee-to-wall distance', unit: 'cm', max: 40 },
  { id: 'soleus-load', name: 'Seated calf working load', unit: 'lb', max: 1000 },
  { id: 'standing-load', name: 'Standing calf working load', unit: 'lb', max: 1000 },
];
export function validateMeasurement(row, today) {
  const definition = MEASUREMENTS.find(m => m.id === row.metric);
  if (!definition || !/^\d{4}-\d{2}-\d{2}$/.test(row.date) || row.date > today ||
      !Number.isFinite(Date.parse(row.date)) || new Date(row.date).toISOString().slice(0,10) !== row.date)
    throw new Error('Choose a valid measurement and a date no later than today.');
  if (!['repaired', 'uninvolved'].includes(row.side)) throw new Error('Choose a side.');
  if (row.value === '' || row.value === null || !Number.isFinite(Number(row.value)) || Number(row.value) < 0 || Number(row.value) > definition.max)
    throw new Error(`Enter a value from 0 to ${definition.max} ${definition.unit}. Leave unmeasured tests unrecorded.`);
  if (!String(row.setup || '').trim()) throw new Error('Describe your setup so future results can be compared.');
  return row;
}
