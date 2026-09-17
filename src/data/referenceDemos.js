// Demo verification is independent of clinical clearance and scheduling eligibility.
export const REFERENCE_DEMOS = {
  'library-push-up': {url:'https://www.youtube.com/watch?v=73NWJ2rhGFI',provider:'Forward Physical Therapy LLC',seconds:43,note:'Unmodified floor push-up with hand, elbow and trunk positioning.'},
  'library-cable-resisted-march': {url:'https://fitbod.me/exercises/cable-knee-drive',provider:'Fitbod',seconds:14,note:'Bent-knee cable drive using a low-pulley ankle cuff. The demo includes an athletic arm swing; use the reviewed controlled march, not an automatic speed or power progression.'},
  'library-slant-board-squat': {url:'https://www.youtube.com/watch?v=WyEl4FAObD8&t=65s',provider:'Enterprise Fitness',seconds:217,note:'Single-exercise tutorial opens at the squat demonstration (1:05). Video shows dumbbells and a deep squat; neither that load nor depth is prescribed. Use only your reviewed range.'},
  'library-bent-knee-soleus-isometric': {url:'https://www.youtube.com/watch?v=Zwg-7D0s-ts',provider:'Nottingham Physio',seconds:18,note:'Seated bent-knee heel-raise hold at floor level. The demo adds dumbbells; external load and hold duration still require individual review.'},
  'library-chin-up': {url:'https://www.youtube.com/watch?v=1EJ3A3rEtlo',provider:'Muscle & Strength',seconds:33,note:'Underhand chin-up. Use a reviewed way to reach and leave the bar; do not copy a jump or drop.'},
  'library-single-arm-cable-row': {url:'https://www.youtube.com/watch?v=raO8Q08Wems',provider:'Chris and Eric Martinez',seconds:97,note:'Standing single-handle row from a torso-height pulley.'},
  'library-farmer-carry': {url:'https://www.youtube.com/watch?v=0yBREGEACfU',provider:'Annie Miller',seconds:37,note:'Walking carry with one dumbbell in each hand.'},
  'backward-sled-drag': {url:'https://www.youtube.com/watch?v=YyaNNPy-FNQ',provider:'Resilient Performance Physical Therapy',seconds:12,note:'Backward sled drag using a waist-belt attachment. This does not validate a utility-wagon attachment or transfer wagon loads.'},
  'sled-push': {url:'https://www.youtube.com/watch?v=QwscR2BhdEg',provider:'PureGym',seconds:15,note:'Purpose-built sled push using low handles. Handle height, load, speed and surface require separate review; not a utility-wagon demonstration.'},
  'forward-sled-drag': {url:'https://www.youtube.com/watch?v=eOakNqRwNms',provider:'Core Blend Training',seconds:16,note:'Forward walking drag with hand-held straps and a purpose-built sled; not a utility-wagon demonstration.'},
  'library-trap-bar-romanian-deadlift': {url:'https://www.youtube.com/watch?v=wQjCCvft7S4',provider:'Justin Kompf',seconds:22,note:'Trap-bar hip hinge with softly bent knees; demonstrated depth and load are not a prescription.'},
  'library-trap-bar-farmer-carry': {url:'https://www.youtube.com/watch?v=KjfjsmICipg',provider:'Muscle & Strength',seconds:36,note:'Two-handed trap-bar walking carry.'},
  'library-smith-romanian-deadlift': {url:'https://www.zing.coach/exercises/smith-machine-romanian-deadlifts',provider:'Zing Coach',seconds:33,note:'Provider page includes a playing Smith-machine hip-hinge clip.'},
  'library-smith-hip-thrust': {url:'https://www.youtube.com/watch?v=Nbbyv-nngVc',provider:'Kasey — B.S. ExSci, NSCA-CPT, ISSA KBT',seconds:28,note:'Smith hip thrust with upper-back support. Video uses stacked exercise steps; use only a reviewed, stable support setup.'},
  'library-balance-cushion-single-leg-stance': {url:'https://ca.physitrack.com/home-exercise-video/single-leg-balance-on-a-cushion',provider:'Physitrack / PhysioTools',seconds:12,note:'Single-leg balance on a round inflatable cushion, not a foam pad. Equipment ownership does not clear this balance progression.'},
  'library-tibialis-raise': {url:'https://www.youtube.com/watch?v=nQKgHwi8W9E',provider:'PrimeMVMNT',seconds:23,note:'Wall-supported toe lifts with heels planted.'},
  'library-banded-ankle-dorsiflexion': {url:'https://www.youtube.com/watch?v=FPyF1iGw3IY',provider:'Forward Physical Therapy LLC',seconds:37,note:'Long-sitting resisted ankle dorsiflexion; not a band-assisted joint mobilization.'},
  'library-short-foot': {url:'https://www.youtube.com/watch?v=m1lkcg8p-48',provider:'Singapore General Hospital',seconds:45,note:'Arch activation without curling the toes.'},
  'library-toe-yoga': {url:'https://www.youtube.com/watch?v=SbQ2RYxbppE',provider:'Sharp HealthCare',seconds:39,note:'Independent great-toe and lesser-toe lifts. Provider discusses plantar fasciitis; this is a movement demonstration, not postoperative clearance.'},
  'library-two-up-one-down-calf-raise': {url:'https://www.youtube.com/watch?v=DygYn7lnw0E',provider:'Forward Physical Therapy LLC',seconds:16,note:'Supported two-leg rise and single-leg lowering on the floor; no heel drop off a step.'},
  'library-banded-terminal-knee-extension': {url:'https://www.youtube.com/watch?v=fw4C3nGq4LI',provider:'Earlham AWC',seconds:40,note:'Band behind the knee with the anchor in front; controlled knee extension.'},
  'library-cable-hip-adduction': {url:'https://www.youtube.com/watch?v=ub5aKCfAtSU',provider:'BPI Sports',seconds:69,note:'Low-pulley ankle cuff on the near leg; inward hip motion.'},
};

export const RELATED_REFERENCE_VIDEOS = {
  'library-belt-squat-calf-raise': {url:'https://www.youtube.com/watch?v=T39ZOqRZOdY',provider:'Jacob Zemer',seconds:63,note:'Different belt-squat machine and a raised foot surface. This is a movement example, not a verified Mammoth setup. Do not copy the raised surface or heel-drop range without specific clearance.'},
  'library-belt-squat-isometric': {url:'https://www.youtube.com/watch?v=6EwI_37Vhdo',provider:'Mike Guadango / Freak Strength',seconds:15,note:'Different belt-squat machine. Shows a squat hold, not verified Mammoth entry, exit or lever-stop instructions. The video title’s hold duration is not a prescription.'},
};

export function withReferenceDemo(exercise) {
  const related = RELATED_REFERENCE_VIDEOS[exercise.id];
  if (related) return {...exercise, relatedDemo:{...related,checkedAt:'2026-09-17',status:'related-playback-reviewed'}};
  const demo = REFERENCE_DEMOS[exercise.id];
  if (!demo) return exercise;
  return {...exercise, videoUrl:demo.url, videoSource:demo.provider,
    previousSourceReview:{videoSource:exercise.videoSource,verifiedAt:exercise.verifiedAt,verification:exercise.verification},
    verifiedAt:'2026-09-17', demoVerification:{status:'playback-reviewed',checkedAt:'2026-09-17',...demo},
    verification:`Video playback and movement reviewed on 2026-09-17 (${demo.seconds} seconds). ${demo.note} Demonstration only; the app's existing readiness, range and loading rules still apply.`};
}
