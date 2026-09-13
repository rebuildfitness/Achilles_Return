import { exercises, usesOnlyOwnedEquipment } from './exercises.js';

function owned(items) {
  return items.filter(usesOnlyOwnedEquipment);
}

export const BASE_WORKOUT = {
  id: 'foundation-strength-a',
  title: 'Achilles + Lower Body Strength',
  phase: 'Re-entry / Baseline',
  items: owned([
    exercises.seatedCalf,
    exercises.singleCalf,
    exercises.beltSquat,
    exercises.rdl,
    exercises.stepUp,
    exercises.pallof
  ])
};

export const RECOVERY_WORKOUT = {
  id: 'recovery-strength',
  title: 'Modified Strength + Recovery',
  phase: 'Re-entry / Baseline',
  items: owned([
    { ...exercises.seatedCalf, sets: 2, effort: 'Moderate' },
    { ...exercises.beltSquat, sets: 2, effort: 'Moderate' },
    { ...exercises.rdl, sets: 2, effort: 'Moderate' },
    exercises.pallof,
    exercises.bike
  ])
};
