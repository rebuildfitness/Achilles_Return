export const READINESS = Object.freeze({
  GREEN: 'GREEN',
  YELLOW_1: 'YELLOW_1',
  YELLOW_2: 'YELLOW_2',
  YELLOW_3: 'YELLOW_3',
  RED: 'RED'
});

const redSymptoms = new Set(['sharp-pain','new-bruising','major-swelling','sudden-weakness','new-limp','other-concerning']);

export function classifyReadiness(checkIn) {
  const unusual = checkIn.unusualSymptoms || [];
  if (unusual.some(x => redSymptoms.has(x))) {
    return decision(READINESS.RED, 'A concerning symptom was reported.', 'Stop Achilles loading and seek appropriate medical evaluation.');
  }

  if (checkIn.pain === 'significant') {
    return decision(READINESS.YELLOW_3, 'Pain is substantially above a normal training response.', 'No impact loading today; use only tolerated low-load work.');
  }

  const severeTendonResponse = checkIn.pain === 'moderate' || checkIn.stiffness === 'much-more' || checkIn.swelling === 'a-lot' || checkIn.previousResponse === 'poor';
  if (severeTendonResponse) {
    return decision(READINESS.YELLOW_2, 'Your Achilles is showing a meaningful increase in symptoms.', 'Reduce Achilles loading and remove impact/high-rate work.');
  }

  const mildChange = checkIn.pain === 'mild' || checkIn.stiffness === 'slightly-more' || checkIn.swelling === 'a-little' || checkIn.previousResponse === 'somewhat-sore' || checkIn.recovery === 'poor';
  if (mildChange) {
    return decision(READINESS.YELLOW_1, 'Your Achilles or recovery is slightly below baseline.', 'Keep the session but reduce Achilles volume and do not progress loads.');
  }

  return decision(READINESS.GREEN, 'Your Achilles response looks stable today.', 'Complete the planned session.');
}

function decision(level, reason, action) {
  return { level, reason, action };
}

export function readinessLabel(level) {
  return {
    GREEN: 'Ready to Train',
    YELLOW_1: 'Workout Adjusted',
    YELLOW_2: 'Workout Adjusted',
    YELLOW_3: 'Recovery Focus Today',
    RED: 'Stop Achilles Loading'
  }[level] || 'Check-In Needed';
}
