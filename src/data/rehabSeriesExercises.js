// Exercise-specific pages checked 2026-09-17. Demonstrations are not clearance.
const prehab = "https://library.theprehabguys.com/vimeo-video/";
const make = (id, name, url, equipment, cue, unit="reps") => ({
 id, name, equipment, cue, setup:cue, unit, sets:2, reps:unit==="seconds"?"30 sec":"8 / side",
 rpe:"Controlled; stop before technique deteriorates", restSec:45, loadTier:"moderate", impactTier:0,
 muscle:"Rehab & movement", tags:["rehab"], purpose:"Controlled movement practice within the selected rehabilitation circuit.",
 evidence:"User-requested therapy circuit; exercise demonstration supports technique, not postoperative clearance or this exact dose.",
 evidenceType:"Product programming / exercise demonstration", evidenceSourceIds:["rehab-guidance","product-v1"],
 videoUrl:url, videoSource:url.includes("prehab")?"[P]rehab":"Physitrack", videoType:"exercise_specific_page",
 videoVerifiedAt:"2026-09-17", verifiedAt:"2026-09-17", videoVerification:"Exercise-specific page and written movement checked; playback availability may vary.",
 verification:"Exercise-specific page and written movement checked; playback availability may vary.",
 libraryOnly:true, review:"Use the selected circuit dose and current readiness; this reference does not unlock progression."
});
export const REHAB_SERIES_EXERCISES = [
 make("rehab-heel-toe-rocker","Heel-to-toe rocks",prehab+"heel-to-toe-rocker/",[],"Stand near stable support. Slowly lift heels, return to flat feet, then lift toes. Stay within your reviewed ankle range; do not rock from the hips."),
 make("rehab-bodyweight-squat","Bodyweight mini squat","https://ca.physitrack.com/home-exercise-video/mini-squat-without-support",[],"Use a comfortable shallow range, heels down and knees following toes. Do not force depth."),
 make("rehab-toe-walk","Tip-toe walk",prehab+"toe-walking/",[],"Use a clear, level floor near support. Take short controlled steps with consistent heel height. Stop when height or control falls.","seconds"),
 make("rehab-bench-single-squat","Modified single-leg squat to bench","https://na.physitrack.com/home-exercise-video/modified-single-leg-squat-from-a-seat",["adjustable-bench"],"Use a secured bench at a height you can control. Sit and stand on the working leg without dropping onto the bench. Use the bridge alternative if unable to control it."),
 make("rehab-wall-calf","Wall squat with heel raises","https://uk.physitrack.com/home-exercise-video/calf-raise-in-wall-squat",[],"Keep your back against a wall and use your reviewed squat depth. Raise and lower heels under control without bouncing. Use seated calf raises when this combination is too demanding."),
 make("rehab-balance-reach","Single-leg balance with forward/backward reach",prehab+"single-leg-reach-sagittal/",[],"On a level floor near support, reach the free foot forward and backward within a controlled range. Keep the stance heel down and pelvis level.","seconds"),
 make("rehab-multidirectional-reach","Single-leg side and diagonal reach",prehab+"single-leg-reach-frontal-2/",[],"Reach the free foot to the side and behind, returning to center each time. Keep the stance heel down. Record repetitions per direction, per leg."),
 make("rehab-lateral-step","Lateral step-up",prehab+"lateral-step-up/",["adjustable-bench"],"Use only a stable, sufficiently low step surface. Step sideways up and lower slowly, knee aligned over the foot. If your bench is too high, use the floor squat alternative."),
 make("rehab-bosu-squat","BOSU squat — flat side up",prehab+"squat-bosu-ball-2/",["bosu-ball"],"Use only the orientation permitted by your equipment manufacturer and your reviewed setup, beside fixed support. This demo uses flat side up. Otherwise choose a stable-floor squat."),
];
export const REHAB_MOVEMENTS = Object.fromEntries(REHAB_SERIES_EXERCISES.map(e=>[e.id,e]));
