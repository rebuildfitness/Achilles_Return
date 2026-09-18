import { CATALOG } from "../data/catalog.js";
import { REHAB_MOVEMENTS } from "../data/rehabSeriesExercises.js";
import { baselineResult } from "./baseline.js";

// Product arrangement of existing approved doses; never an impact clearance rule.
export const CONDITIONING_VERSION = "2.0.0";
export const CONDITIONING_BIKE_ID = "library-stationary-cycling";
export function rehabConditioningTemplate(values, calf, soleus) {
  const block = (ex, title, extra = {}) => ({ ...structuredClone(ex), block: title, ...extra });
  return {
    id: "strength-B", title: "Achilles Rehab & Conditioning", phase: baselineResult(values).phase,
    sessionFormat: "rehab-conditioning", templateVersion: CONDITIONING_VERSION,
    ruleId: "template.rehab-conditioning.v1", rulesetVersion: "1.1.0",
    items: [
      block({...REHAB_MOVEMENTS["rehab-bodyweight-squat"], id:"rehab-warmup-squat", illustrationId:"rehab-bodyweight-squat"}, "Warm-up", {sets:1,reps:"10",rpe:"Easy",restSec:0}),
      block(REHAB_MOVEMENTS["rehab-heel-toe-rocker"], "Warm-up", {sets:1,reps:"15",rpe:"Easy",restSec:0}),
      block({...CATALOG.step,id:"rehab-warmup-step",illustrationId:CATALOG.step.id}, "Warm-up", {sets:1,reps:"10 / side",rpe:"Easy; bodyweight",restSec:0}),
      block({...CATALOG.bilateral,id:"rehab-warmup-calf",illustrationId:CATALOG.bilateral.id}, "Warm-up", {sets:1,reps:"15",rpe:"Easy; bodyweight",restSec:0}),
      block({...CATALOG.bilateral,id:"rehab-bilateral-strength",illustrationId:CATALOG.bilateral.id}, "Circuit A · Strength & control", {sets:3,reps:"10–12",cue:"Floor level, stable support and controlled heel height. Add only an already established tolerated load; no automatic new load for this expanded session."}),
      block(CATALOG.step, "Circuit A · Strength & control", {sets:3,reps:"10 / side"}),
      block(CATALOG.bridge, "Circuit A · Strength & control", {sets:3,reps:"8–12",name:"Bridge — single-leg squat alternative",requestedMovement:"Modified pistol squat to bench",selectionReason:"Bridge is the starting alternative. A single-leg bench squat is available in Swap exercise after individual setup and capacity review."}),
      ...(values.function_5==="normal" ? [block(REHAB_MOVEMENTS["rehab-toe-walk"], "Circuit A · Strength & control", {sets:3,reps:"30 sec",loadTier:"high"})] : []),
      block(calf, "Circuit B · Achilles & movement", {sets:3,reps:"6–12"}),
      block(soleus, "Circuit B · Achilles & movement", {sets:3,requestedMovement:"Wall squat with heel raises",selectionReason:"Seated calf raises are the starting bent-knee alternative. Use Swap exercise for the reviewed wall variation; do not add both."}),
      block(CATALOG.hamstring, "Circuit B · Achilles & movement", {sets:3,reps:"10–15",requestedMovement:"Backward jog",selectionReason:"Hamstring strength stays in this circuit. Reviewed backward jogging is available within D5 planned movement, replacing a bout in that exposure rather than adding impact here."}),
      block(CATALOG.pallof, "Circuit B · Achilles & movement", {sets:3,reps:"10 / side",requestedMovement:"Crossover jog / carioca",selectionReason:"Trunk control fills this slot. Crossover work belongs to the existing change-of-direction exposure and its recorded criteria."}),
      ...(values.goodBalance==="yes" ? [block(REHAB_MOVEMENTS["rehab-balance-reach"], "Circuit B · Achilles & movement", {sets:3,reps:"30 sec / side"})] : []),
      block(REHAB_MOVEMENTS["rehab-bodyweight-squat"], "Circuit C · Balance & control", {sets:2,reps:"12",requestedMovement:"Half-BOSU squat",selectionReason:"Floor squats progress to supported BOSU squats after qualifying squat work and tolerated foam-pad balance, with recorded good balance and available equipment. Use only the reviewed device orientation and setup."}),
      block(CATALOG.balance, "Circuit C · Balance & control", {sets:2}),
      ...(values.goodBalance==="yes" ? [block(REHAB_MOVEMENTS["rehab-multidirectional-reach"], "Circuit C · Balance & control", {sets:2,reps:"5 / direction / side"})] : []),
      block(REHAB_MOVEMENTS["rehab-lateral-step"], "Circuit C · Balance & control", {sets:2,reps:"8 / side"}),
      ...(values.function_5==="normal" ? [block({...REHAB_MOVEMENTS["rehab-toe-walk"],id:"rehab-toe-walk-c",illustrationId:"rehab-toe-walk"}, "Circuit C · Balance & control", {sets:2,reps:"30 sec",loadTier:"high"})] : []),
      {
        id: CONDITIONING_BIKE_ID, name: "Stationary cycling", equipment: ["exercise-bike"],
        block: "Finisher · Conditioning", sets: 1, reps: "600 sec", unit: "seconds", rpe: "Comfortable, controlled", restSec: 0,
        loadTier: "low", impactTier: 0, tags: ["conditioning"],
        cue: "Ten minutes at a comfortable, tolerated effort. Record actual seconds and leave weight blank; bike resistance is not pounds. This is not a maximal finisher.",
        purpose: "Low-impact cardiovascular conditioning alongside the rehabilitation session.",
        evidence: "Existing approved easy-bike conditioning; 10 minutes is within the documented 10–25 minute option.",
        evidenceSourceIds: ["rehab-guidance"], evidenceType: "Approved app template / product arrangement",
        videoUrl: "https://www.youtube.com/watch?v=PFOfcsAOmVc", videoSource: "South Tees Hospitals NHS",
        videoType: "short", videoVerifiedAt: "2026-09-11",
        videoVerification: "Existing stationary-cycling demonstration from the exercise library.",
      },
    ],
    notes: [
      "Warm-up, three circuits and a conditioning finish replace the old B template; do not perform both sessions. A and C keep their strength work.",
      "Begin with 2 minutes comfortable walking and 2 minutes at your already tolerated incline (or 4 minutes easy cycling if walking is unavailable). These are logged warm-up activities when equipment is available.",
      "Circuits A and B: three rounds. Circuit C: two rounds. Complete one set of each listed exercise per round. Take the displayed rest or longer; the therapy example's 30–45 seconds is not a requirement to rush calf loading.",
      "This is an expanded session, not a guaranteed 40-minute workout. Use the live duration estimate, record only work done and skip remaining sets when quality or symptoms deteriorate.",
      "Requested therapy movements and the selected alternatives are explained on each relevant card. Do the selected movement, not both alternatives.",
      "Tip-toe walking requires recorded normal tiptoe function; dynamic reaches require recorded good single-leg balance. Neither establishes impact clearance.",
      "Running and crossover work use the separately prescribed exposure dose and logger. A scheduled or recorded exposure replaces the conditioning finisher; do not add the sample jog intervals on top.",
      "Use a suitable low stable step; a tall exercise bench is not automatically suitable for stepping. Choose a floor alternative if needed.",
    ],
  };
}
export function coordinateConditioning(day, sessions = []) {
  if (day.workout?.sessionFormat !== "rehab-conditioning") return day;
  const exposureRecorded = sessions.some(s => s.date === day.date && s.domain);
  const replaceBike = !!day.exposure || exposureRecorded;
  return { ...day, workout: { ...day.workout,
    conditioningReplaced: replaceBike,
    blockProgression: day.workout.blockProgression?.map(row => row.originId === CONDITIONING_BIKE_ID && replaceBike ? {...row,action:"REPLACED",reason:"Scheduled or recorded progression exposure replaces bike conditioning; no additional finisher."} : row),
    items: replaceBike ? day.workout.items.filter(ex => ex.id !== CONDITIONING_BIKE_ID) : day.workout.items,
    notes: [...day.workout.notes, ...(replaceBike ? [exposureRecorded ? "A progression exposure is already recorded today. No additional bike finisher is prescribed." : "Your scheduled progression exposure replaces the bike block. Use its own warm-up, dose, rest and cooldown."] : [])],
  }};
}
