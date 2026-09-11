import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyReadiness, READINESS } from '../src/rules/readiness.js';

const base = { pain:'none', stiffness:'normal', swelling:'normal', previousResponse:'good', recovery:'good', unusualSymptoms:[] };

test('stable symptoms produce GREEN', () => {
  assert.equal(classifyReadiness(base).level, READINESS.GREEN);
});

test('slight next-day change produces YELLOW_1', () => {
  assert.equal(classifyReadiness({ ...base, stiffness:'slightly-more' }).level, READINESS.YELLOW_1);
});

test('meaningful swelling produces YELLOW_2', () => {
  assert.equal(classifyReadiness({ ...base, swelling:'a-lot' }).level, READINESS.YELLOW_2);
});

test('significant pain without red flag produces conservative YELLOW_3', () => {
  assert.equal(classifyReadiness({ ...base, pain:'significant' }).level, READINESS.YELLOW_3);
});

test('sharp pain overrides otherwise good readiness', () => {
  assert.equal(classifyReadiness({ ...base, unusualSymptoms:['sharp-pain'] }).level, READINESS.RED);
});

test('sudden weakness is RED', () => {
  assert.equal(classifyReadiness({ ...base, unusualSymptoms:['sudden-weakness'] }).level, READINESS.RED);
});
