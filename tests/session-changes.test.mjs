import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG, EQUIPMENT } from '../src/data/catalog.js';
import { swapExercise, swapOptions, loadGuidance } from '../src/rules/trainingFlexibility.js';
import { emptySessionChanges, recordSessionChange, applySessionChanges, sessionItems } from '../src/rules/sessionChanges.js';
import { validateWorkoutLog } from '../src/rules/response.js';
import { weeklyPlan } from '../src/rules/planner.js';
import { baselineValues } from './fixtures.mjs';
const pull = CATALOG.pullup;
const replacement = () => swapExercise(pull, 'library-lat-pulldown', EQUIPMENT, 'GREEN', 'difficulty');
const log = { [pull.id]: { sets: [{ load: '0', reps: '3', complete: true }, { reps: '2' }] } };
const change = (state, ex, next, reason = 'difficulty') => recordSessionChange(state, ex, next, reason, 'session', [], log, '2026-09-14T12:00:00Z');

test('Every prescribed exercise resolves a reviewed option list; unavailable equipment is excluded', () => {
  for (const ex of Object.values(CATALOG)) {
    assert.ok(swapOptions(ex, EQUIPMENT).some(option => option.id === ex.id), ex.id);
    assert.ok(swapOptions(ex, []).every(option => !option.equipment.length), ex.id);
  }
  assert.ok(!swapOptions(pull, EQUIPMENT.filter(id => id !== 'cable-station')).some(ex => ex.id === 'library-lat-pulldown'));
});
test('Pull-up regression keeps its own history, media and prescribed dose', () => {
  const ex = replacement();
  assert.equal(ex.originalId, pull.id);
  assert.equal(ex.name, 'Lat pulldown');
  assert.equal(ex.sets, pull.sets);
  assert.match(ex.videoUrl, /lat-pull-down/);
  assert.match(loadGuidance(ex, [{ date:'2026-09-13', createdAt:'2026-09-13', status:'TOLERATED', exerciseLog:log }]).starting, /No established tolerated load/);
});
test('Swapping after entries retains completed and partial sets without copying them to the new movement', () => {
  const original = structuredClone(log);
  const state = change(emptySessionChanges('2026-09-14'), pull, replacement());
  const projected = applySessionChanges({items:[pull]}, JSON.parse(JSON.stringify(state)), log, EQUIPMENT, 'GREEN');
  assert.equal(projected.items[0].id, 'library-lat-pulldown');
  assert.equal(projected.items[0].sets, pull.sets - 1);
  assert.deepEqual(projected.retained, [pull]);
  assert.deepEqual(log, original);
  assert.equal(log['library-lat-pulldown'], undefined);
  assert.equal(validateWorkoutLog({items:[...projected.items,...projected.retained]},log),null);
});
test('Skipping and restoring retain history; swaps back never duplicate exercise IDs', () => {
  let state = change(emptySessionChanges('2026-09-14'), pull, null, 'equipment');
  let projected = applySessionChanges({items:[pull]}, state, log, EQUIPMENT, 'GREEN');
  assert.equal(projected.items[0].skipReason, 'equipment');
  assert.deepEqual(projected.retained, []);
  state = change(state, projected.items[0], pull, 'equipment');
  projected = applySessionChanges({items:[pull]}, state, log, EQUIPMENT, 'GREEN');
  assert.equal(projected.items[0].skipReason, undefined);
  state = change(state, pull, replacement());
  state = change(state, replacement(), pull, 'equipment');
  projected = applySessionChanges({items:[pull]}, state, log, EQUIPMENT, 'GREEN');
  assert.deepEqual(projected.retained, []);
  assert.equal(projected.items[0].id, pull.id);
  assert.equal(state.events.length, 4);
});
test('Session choices never bypass red flags or manufacture an unreviewed rehab substitute', () => {
  const state = change(emptySessionChanges('2026-09-14'), pull, replacement());
  assert.deepEqual(applySessionChanges({items:[pull]}, state, log, EQUIPMENT, 'RED').items, []);
  assert.throws(() => swapExercise(CATALOG.single, 'library-lat-pulldown', EQUIPMENT, 'GREEN', 'equipment'));
  assert.throws(() => swapExercise(CATALOG.press, 'library-smith-incline-bench-press', EQUIPMENT, 'YELLOW_3', 'equipment'));
  const bilateral = swapExercise(CATALOG.single, 'bilateral-calf', EQUIPMENT, 'GREEN', 'difficulty');
  assert.equal(bilateral.reps, CATALOG.bilateral.reps);
  assert.ok(bilateral.sets <= CATALOG.single.sets);
});
test('Future preference takes effect only on its effective date and receives the usual readiness rules', () => {
  const profile = { availableDays:['1','3','5'],equipment:EQUIPMENT,exerciseChoices:{'db-bench':{id:'library-smith-incline-bench-press',reason:'equipment',effectiveFrom:'2026-09-15'}} };
  const assessment = {values:baselineValues(),completedAt:'2026-09-13'};
  const week=weeklyPlan(profile,assessment,[],new Date('2026-09-14T12:00:00'),'GREEN');
  assert.ok(week.find(d=>d.date==='2026-09-14').workout.items.some(ex=>ex.id==='db-bench'));
  assert.ok(week.find(d=>d.date==='2026-09-16').workout.items.some(ex=>ex.id==='library-smith-incline-bench-press'));
});

test('Finishing a reduced dose retains and validates earlier slots beyond the remaining prescription', () => {
 const historic = {'pull-up':{sets:[{reps:'3',complete:true},{reps:'2'},{reps:'1',complete:true}]}};
 const items = sessionItems({items:[{...pull,sets:1}]},historic);
 assert.equal(items[0].sets,3);
 assert.equal(validateWorkoutLog({items},historic),null);
 historic['pull-up'].sets[2].reps='bad';
 assert.notEqual(validateWorkoutLog({items},historic),null);
});
