import test from 'node:test';
import assert from 'node:assert/strict';
import { baselineValues } from './fixtures.mjs';
import { baselineResult } from '../src/rules/baseline.js';
import { gate, checkpointAvailability } from '../src/rules/progression.js';
import { weeklyPlan } from '../src/rules/planner.js';
const week = values => weeklyPlan({availableDays:['1','3','5']}, {values,completedAt:'2026-09-01'}, [], new Date(2026,8,11));
test('Restrictions cannot be bypassed through stationary basketball or capacity reviews', () => {
  for (const field of ['clearance','noRestrictions']) for (const value of ['no','unsure',undefined]) {
    const values = {...baselineValues(), [field]:value};
    const checks = {stationarySkills:'yes',stationarySkills_evidence:'reviewed',stationarySkills_date:'2026-09-11'};
    for (const domain of ['running','jumping','speed','cod','basketball','soccer']) assert.equal(gate(domain,values,checks).allowed,false);
    assert.equal(checkpointAvailability('stationarySkills',values),false);
    assert.notEqual(baselineResult(values).phase,'Safety Hold');
  }
});
test('Explicit restrictions prevent generic strength prescription without labelling it an acute red flag', () => {
  for (const field of ['clearance','noRestrictions']) {
    const values = {...baselineValues(), [field]:'no'};
    assert.ok(week(values).every(d=>!d.workout && d.title==='Review exercise restrictions'));
  }
});
test('Imperfect running capacity still permits strength, while red flags stop it', () => {
  const values = {...baselineValues(), heel_repaired_reps:'4',psychReady:'no'};
  assert.equal(baselineResult(values).canRun,false);
  assert.equal(week(values).filter(d=>d.workout).length,3);
  assert.ok(week({...values,redFlags:['sharp-pain']}).every(d=>!d.workout && d.title==='Safety Hold'));
});
