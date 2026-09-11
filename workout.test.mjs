import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWorkout, resumeAfterMissedSessions } from '../src/rules/workout.js';
import { READINESS } from '../src/rules/readiness.js';

test('green uses full planned workout', () => {
  const w = buildWorkout({ level: READINESS.GREEN });
  assert.equal(w.items.length, 6);
  assert.equal(w.title, 'Achilles + Lower Body Strength');
});

test('yellow 1 reduces volume but keeps structure', () => {
  const green = buildWorkout({ level: READINESS.GREEN });
  const yellow = buildWorkout({ level: READINESS.YELLOW_1 });
  assert.equal(yellow.items.length, green.items.length);
  assert.ok(yellow.items.find(x => x.id === 'single-leg-calf-raise').sets < green.items.find(x => x.id === 'single-leg-calf-raise').sets);
});

test('yellow 2 removes high-load Achilles exercise', () => {
  const w = buildWorkout({ level: READINESS.YELLOW_2 });
  assert.equal(w.items.some(x => x.loadTier === 'high'), false);
});

test('red blocks Achilles workout generation', () => {
  const w = buildWorkout({ level: READINESS.RED });
  assert.equal(w.stopped, true);
  assert.equal(w.items.length, 0);
});

test('one missed session does not create punishment', () => {
  assert.deepEqual(resumeAfterMissedSessions(2, READINESS.GREEN), { action:'RESUME', reduction:0 });
});

test('longer interruption calls for retesting and re-entry', () => {
  assert.equal(resumeAfterMissedSessions(14, READINESS.GREEN).action, 'RETEST_AND_REENTER');
});

test('all generated exercises use only whitelisted home-gym equipment', async () => {
  const { OWNED_EQUIPMENT } = await import('../src/data/exercises.js');
  const owned = new Set(OWNED_EQUIPMENT);
  for (const level of [READINESS.GREEN, READINESS.YELLOW_1, READINESS.YELLOW_2, READINESS.YELLOW_3]) {
    const w = buildWorkout({ level });
    for (const exercise of w.items) {
      assert.ok((exercise.equipment || []).every(item => owned.has(item)), `${exercise.name} requires unavailable equipment`);
    }
  }
});

test('leg press is not present in the workout library', async () => {
  const { exercises } = await import('../src/data/exercises.js');
  assert.equal(Object.values(exercises).some(x => /leg press/i.test(x.name)), false);
  assert.equal(buildWorkout({ level: READINESS.GREEN }).items.some(x => /leg press/i.test(x.name)), false);
});


test('all exercises in the green strength workout have visible demonstration URLs', () => {
  const w = buildWorkout({ level: READINESS.GREEN });
  for (const exercise of w.items) {
    assert.ok(exercise.videoUrl, `${exercise.name} is missing a demonstration URL`);
  }
});

test('weighted wagon is whitelisted and available as a sled substitute', async () => {
  const { OWNED_EQUIPMENT, exercises } = await import('../src/data/exercises.js');
  assert.ok(OWNED_EQUIPMENT.includes('weighted-wagon'));
  assert.deepEqual(exercises.wagonBackwardDrag.equipment, ['weighted-wagon']);
  assert.ok(exercises.wagonBackwardDrag.videoUrl);
});

test('calf exercises use distinct exercise-specific demo videos', async () => {
  const { exercises } = await import('../src/data/exercises.js');
  assert.notEqual(exercises.seatedCalf.videoUrl, exercises.singleCalf.videoUrl);
  assert.equal(exercises.seatedCalf.videoSource, 'NHS inform');
  assert.equal(exercises.singleCalf.videoSource, 'Revival Performance Physical Therapy');
  assert.equal(exercises.seatedCalf.videoUrl, 'https://www.youtube.com/watch?v=RsdE7Ehwhvc');
  assert.equal(exercises.singleCalf.videoUrl, 'https://www.youtube.com/watch?v=blPyPFXR-WU');
});
