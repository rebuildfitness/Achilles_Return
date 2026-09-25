import plan from "../../../spec/rehab-plan-v1.json" with { type: "json" };
import { exposureContent } from "../../data/exposures.js";
import { adaptDefinition } from "./adapters.ts";
// Nine educational groupings of preserved Master Plan content. No new doses.
export const GUIDE_PHASES = [
  {
    id: "baseline",
    name: "Re-entry / Baseline",
    purpose:
      "Establish a repeatable starting point for symptoms, strength, balance and confidence.",
    qualities: ["Symptoms / tendon status", "Heel-rise capacity", "Balance"],
    ids: ["bilateral-calf", "single-balance", "knee-to-wall"],
    sources: ["rehab-guidance", "heel-work"],
    focus:
      "Record what you can measure consistently. Missing measurements remain unknown.",
    caution:
      "New concerning symptoms warrant medical evaluation. Recording a measurement is not clearance.",
  },
  {
    id: "strength",
    name: "Foundational Strength",
    purpose:
      "Restore calf and soleus force production alongside whole-body strength.",
    qualities: [
      "Plantar-flexor strength",
      "Soleus strength",
      "General strength",
    ],
    ids: ["bilateral-calf", "seated-calf", "single-calf", "belt-squat"],
    sources: ["rehab-guidance", "general-strength"],
    focus: "Review strength, heel-rise quality and next-day response together.",
    caution:
      "Load and range depend on the individual and established restrictions; symmetry alone is not clearance.",
  },
  {
    id: "readiness",
    name: "Running Readiness",
    purpose:
      "Review the recorded capacity and symptom evidence relevant to returning to running.",
    qualities: ["Heel-rise capacity", "Balance", "Confidence"],
    ids: ["single-calf", "single-balance", "seated-calf"],
    sources: ["running-consensus", "heel-work"],
    focus:
      "Review the seven existing consensus benchmarks and supporting strength measures.",
    caution: "The running consensus has not been prospectively validated.",
  },
  {
    id: "running",
    name: "Running",
    domain: "running",
    category: "Running",
    level: "R1",
    purpose: "Build graded running exposure and monitor the tendon response.",
    qualities: ["Running capacity", "Conditioning"],
    ladder: plan.runningLadder,
    sources: ["running-consensus", "rehab-guidance"],
    focus:
      "Review duration, distance and delayed response. Change one loading variable at a time.",
    caution:
      "The stored run ladder is a conservative implementation example, not a validated universal protocol.",
  },
  {
    id: "jumping",
    name: "Jumping & Landing",
    domain: "jumping",
    category: "Jumping & Landing",
    level: "J0",
    purpose:
      "Develop controlled landing and progressively restore jumping capacity.",
    qualities: ["Landing control", "Power"],
    ladder: plan.jumpLadder.slice(0, 3),
    sources: ["rehab-guidance"],
    focus: "Review landing quality, recorded contacts and next-day response.",
    caution:
      "Do not infer readiness from elapsed time or a completed exercise.",
  },
  {
    id: "plyometrics",
    name: "Plyometrics",
    domain: "jumping",
    category: "Plyometrics",
    level: "J3",
    purpose:
      "Restore rapid stretch-shortening-cycle capacity and multidirectional elasticity.",
    qualities: ["Reactive strength", "Elasticity"],
    ladder: plan.jumpLadder.slice(3),
    sources: ["rehab-guidance", "rts-review"],
    focus:
      "Review amplitude, direction, unilateral demand and reactivity as distinct progression variables.",
    caution:
      "Late-stage symmetry targets are supporting information, not guarantees of safe return.",
  },
  {
    id: "speed",
    name: "Acceleration & Sprinting",
    domain: "speed",
    category: "Sprinting",
    level: "S1",
    purpose:
      "Rebuild acceleration and high-speed running quality with recovery between efforts.",
    qualities: ["Acceleration", "Sprinting"],
    ladder: plan.sprintLadder,
    sources: ["rehab-guidance", "rts-review"],
    focus:
      "Keep acceleration and maximal speed exposure distinguishable in your records.",
    caution:
      "Professional assessment is strongly recommended before maximal sprinting when objective testing is limited.",
  },
  {
    id: "cod",
    name: "Deceleration & Change of Direction",
    domain: "cod",
    category: "Change of Direction / Agility",
    level: "D1",
    purpose:
      "Develop controlled braking and planned movement before more reactive tasks.",
    qualities: ["Deceleration", "Change of direction"],
    ladder: plan.codLadder,
    sources: ["rehab-guidance", "rts-review"],
    focus: "Review speed, cutting angle, complexity and response separately.",
    caution:
      "Planned movement precedes reactive work in the preserved guidance; this is advice, not a selection lock.",
  },
  {
    id: "basketball",
    name: "Basketball Re-entry",
    domain: "basketball",
    category: "Basketball Skill Exposure",
    level: "B1",
    purpose:
      "Connect restored physical qualities to graded basketball participation.",
    qualities: ["Basketball skills", "Reactive movement", "Conditioning"],
    ladder: plan.basketballLadder,
    sources: ["rehab-guidance", "rts-review"],
    focus:
      "Distinguish stationary skills, planned court movement and reactive play.",
    caution:
      "Unrestricted participation is not automatically medically cleared. The evidence supports multi-domain review rather than one score.",
  },
];
export function guideDefinitions(phase, definitions) {
  if (!phase.domain) return definitions.filter((d) => phase.ids.includes(d.id));
  return exposureContent(phase.domain, phase.level).demos.map((demo, index) =>
    adaptDefinition({
      ...demo,
      id: `guide-${phase.id}-${phase.level}-${index}`,
      categories: [phase.category],
      domain: phase.domain,
      exposureLevel: phase.level,
      phaseAssociations: [phase.name],
      evidenceSourceIds: phase.sources,
      evidence:
        "Existing exposure demonstration and Master Plan example; no new dose or clearance.",
      trackingType: "free-form",
      purpose: phase.purpose,
    }),
  );
}
