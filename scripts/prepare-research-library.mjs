import fs from 'node:fs';
const draft=JSON.parse(fs.readFileSync('docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json','utf8'));
const overrides={
  6:{setup:'Sit upright on a stable bench with knees bent and forefeet on the floor. Lift the heels within your reviewed range and hold without bouncing. The illustration shows an unloaded bilateral position; external loading and hold duration require individual review.'},
  7:{setup:'Face a secure band anchor at knee height. Loop the band behind the working knee, so it pulls forward. From a small bend, tighten the thigh and straighten the knee without forcing hyperextension; return with control. Use stable hand support as needed.',guide:'https://library.theprehabguys.com/vimeo-video/terminal-knee-extension/',provider:'The Prehab Guys'},
  8:{setup:'Stand side-on to the low pulley. Put the ankle cuff on the leg nearest the pulley and hold stable support. Draw that leg inward toward the standing leg without rotating the pelvis; return with control. Keep the stance foot planted.',guide:'https://www.muscleandstrength.com/exercises/cable-hip-adduction.html',provider:'Muscle & Strength'},
  17:{setup:'Setup review required. Fringe Sport advertises calf raises using a changed handle attachment. The exact compatible attachment, foot surface, hand support and lever clearance have not been verified for your setup. Do not improvise this from a generic belt-squat illustration.',blocked:true},
  18:{setup:'Setup review required. A specific hold position, lever stop and safe entry/exit method must be reviewed before performing a Mammoth belt-squat isometric. No hold depth, duration or load is prescribed by this library entry.',blocked:true},
  22:{guide:'https://www.muscleandstrength.com/exercises/chin-up.html',provider:'Muscle & Strength'},
  23:{setup:'Set a single cable handle at torso height. Stand in a stable stance with softly bent knees, feet planted and trunk still. Pull the handle toward your ribs without twisting; return with control. Review stance tolerance and stack setting separately from seated rows.',guide:'https://www.inbalancefitness.com/fitness-blog/exercise-of-the-week-one-arm-cable-row',provider:'inbalance Fitness'}
};
const rows=draft.candidates.filter(c=>![10,11,12].includes(c.candidateNumber)).map(c=>{
  const o=overrides[c.candidateNumber]||{};
  const demo=c.demos.find(d=>d.pageVerified&&d.exactMovementVerified&&d.access==='public');
  const guideUrl=o.guide||demo?.sourcePage||null;
  return {id:c.proposedId,name:c.name,equipment:c.equipmentIds,muscle:c.candidateNumber<=6?'Calf & ankle':c.candidateNumber===21?'Chest':[22,23].includes(c.candidateNumber)?'Back':[14,24].includes(c.candidateNumber)?'Full body':c.candidateNumber===20?'Balance':'Legs',
    setup:o.setup||[...c.setupSteps,...c.executionCues].join(' '),review:[c.purpose,...c.achillesConsiderations].join(' '),
    libraryOnly:true,referenceOnly:true,automaticScheduling:false,approvedForAutomaticScheduling:false,
    videoUrl:null,videoSource:o.provider||demo?.provider||'',verifiedAt:guideUrl?'2026-09-16':null,
    guideUrl,contentStatus:o.blocked?'setup-review-required':'library-reference',
    verification:guideUrl?'Exercise guide checked; video playback not verified. This link is educational reference, not a verified Short Demo.':'Exact video demo remains under review. The illustration and setup notes do not establish readiness or a prescribed dose.',
    candidateNumber:c.candidateNumber,aliases:c.aliases,loadConvention:c.loadConvention,loggingFields:c.loggingFields,
    educationalDose:null,research:{sourceFile:'docs/research/exercise-followup/NORMALIZED_RESEARCH_DRAFT.json',candidateNumber:c.candidateNumber,originalRecommendation:c.recommendation,claims:c.claims,demos:c.demos,existingMatches:c.existingMatches,prerequisites:c.existingPrerequisiteReferences,unresolvedPrerequisites:c.unresolvedPrerequisites,reviewQuestions:c.reviewQuestions,regressions:c.regressions,progressions:c.progressions},
    illustrationBrief:c.illustrationBrief};
});
fs.writeFileSync('src/data/researchExercises.js','// Reviewed library content only. Never imported by the prescription catalog.\nexport const RESEARCH_EXERCISES = '+JSON.stringify(rows,null,2)+';\n');
fs.writeFileSync('spec/exercise-additions-sources-v1.json',JSON.stringify({version:'1.0.0',sources:draft.sources,originalHandoff:'docs/research/exercise-followup/EXERCISE_ADDITIONS_CANDIDATES.json',note:'Source metadata preserved, including quarantined references. No new clinical claims or automatic programming.'},null,2)+'\n');
