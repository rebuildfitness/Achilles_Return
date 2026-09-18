import { CATALOG } from "../data/catalog.js";
import { baselineResult } from "./baseline.js";

// Product arrangement of existing approved doses; never an impact clearance rule.
export const LEGACY_CONDITIONING_VERSION = "1.0.0";
export const CONDITIONING_BIKE_ID = "library-stationary-cycling";
export function legacyRehabConditioningTemplate(values, calf, soleus) {
  const block = (ex, title, extra = {}) => ({ ...structuredClone(ex), block: title, ...extra });
  return {
    id: "strength-B", title: "Achilles Rehab & Conditioning", phase: baselineResult(values).phase,
    sessionFormat: "rehab-conditioning", templateVersion: LEGACY_CONDITIONING_VERSION,
    ruleId: "template.rehab-conditioning.v1", rulesetVersion: "1.1.0",
    items: [
      block(calf, "1. Calf strength", {sets: 3, reps: "6–12"}),
      block(soleus, "1. Calf strength", {sets: 3}),
      block(CATALOG.step, "2. Leg control circuit"),
      block(CATALOG.bridge, "2. Leg control circuit"),
      block(CATALOG.balance, "3. Balance & trunk control"),
      block(CATALOG.pallof, "3. Balance & trunk control"),
      {
        id: CONDITIONING_BIKE_ID, name: "Stationary cycling", equipment: ["exercise-bike"],
        block: "4. Conditioning", sets: 1, reps: "600 sec", unit: "seconds", rpe: "Comfortable, controlled", restSec: 0,
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
      "This replaces Strength B on an existing loading day. It is not an extra workout or a recovery-day circuit.",
      "Warm up gradually using familiar tolerated movement and lighter practice sets. The estimate includes warm-up and transitions; do not rush to meet 40 minutes.",
      "Calf strength: alternate exercises only if comfortable, with the prescribed recovery. Preserve heel height and control; do not use cardio fatigue as the progression target.",
      "Leg-control circuit: complete one set of each exercise per round. Balance and trunk work have their own rounds. Rest longer when technique or symptoms require it.",
      "Floor backward jogging, carioca, BOSU squats, pistol squats and toe walking are not automatically prescribed by this template. Prior therapy experience is context, not a completed gate or an individualized dose.",
      "Any scheduled impact work uses its existing gated logger and dose. Complete and save that exposure before saving this strength session; it replaces bike conditioning, not adds to it.",
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
