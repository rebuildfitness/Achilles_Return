import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMeasurement } from '../src/data/measurements.js';
import { optionalAccessory, sessionEstimate } from '../src/data/sessionPresentation.js';
import { strengthTemplate } from '../src/rules/planner.js';
import { CALF_PATHWAY } from '../src/data/calfPathway.js';
import { EQUIPMENT } from '../src/data/catalog.js';
const record = { metric:'heel-reps', side:'repaired', date:'2026-09-14', value:'0', setup:'Flat floor, fingertip balance' };
test('Independent measurements preserve real zero and reject missing, invalid or future findings', () => {
  assert.equal(validateMeasurement(record,'2026-09-14').value,'0');
  for (const patch of [{value:''},{value:'Infinity'},{value:-1},{date:'2026-02-30'},{date:'2026-09-15'},{side:'both'},{setup:''}])
    assert.throws(() => validateMeasurement({...record,...patch},'2026-09-14'));
});
test('Shorter presentation retains original rehab and primary strength; does not mutate prescription', () => {
  for (const kind of ['A','B','C']) {
    const workout = strengthTemplate(kind,{},'hybrid');
    const before = JSON.stringify(workout);
    const short = workout.items.filter(ex => !optionalAccessory(ex));
    for (const ex of workout.items.filter(ex => !ex.strengthModule)) assert.ok(short.some(s => s.id === ex.id));
    assert.equal(JSON.stringify(workout),before);
    assert.match(sessionEstimate(short),/min estimate/);
  }
});
test('Calf pathway references use owned equipment and specific provider links without automatic prescription', () => {
  assert.equal(CALF_PATHWAY.length,6);
  assert.equal(new Set(CALF_PATHWAY.map(ex => ex.id)).size,6);
  for (const ex of CALF_PATHWAY) {
    assert.ok(ex.equipment.every(id => EQUIPMENT.includes(id)));
    assert.ok(ex.libraryOnly);
    assert.ok(ex.easier && ex.harder && ex.setup && ex.videoSource);
    assert.ok(ex.videoUrl.startsWith('https://'));
  }
});


test('All 31 daily photos ship as distinct compact WebP assets', async () => {
  const {readFile, readdir} = await import('node:fs/promises');
  const {createHash} = await import('node:crypto');
  const folder = new URL('../public/assets/daily-brand/', import.meta.url);
  const files = (await readdir(folder)).filter(name => name.endsWith('.webp')).sort();
  assert.deepEqual(files, Array.from({length:31},(_,i)=>`day-${String(i+1).padStart(2,'0')}.webp`));
  let total = 0; const hashes = new Set();
  for (const file of files) {const bytes = await readFile(new URL(file,folder));total += bytes.length; assert.equal(bytes.toString('ascii',8,12),'WEBP'); hashes.add(createHash('sha256').update(bytes).digest('hex'));}
  assert.equal(hashes.size,31); assert.ok(total < 1024*1024);
});
