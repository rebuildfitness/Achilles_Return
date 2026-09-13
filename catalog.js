import { exercises as legacy } from "./exercises.js";
import plan from "../../spec/rehab-plan-v1.json" with { type: "json" };
export const EQUIPMENT = plan.equipmentWhitelist;
export const VIDEO_TYPES = [
  "short",
  "exercise_specific_page",
  "governing_body_clip",
];
const nhs = "Royal United Hospitals Bath NHS";
const nhsHub =
  "https://www.ruh.nhs.uk/patients/services/physiotherapy/OP_outpatient_service.asp";
const demo = (
  url,
  source = nhs,
  sourcePage = nhsHub,
  type = "exercise_specific_page",
) => ({
  videoUrl: url,
  videoSource: source,
  videoSourcePage: sourcePage,
  videoType: type,
  videoVerifiedAt: "2026-09-11",
  videoVerification:
    "Source catalog / exercise-specific page checked; external playback availability may vary.",
});
const yt = (id) => `https://www.youtube.com/watch?v=${id}`;
const base = (id, name, equipment, sets, reps, extra = {}) => ({
  id,
  name,
  equipment,
  sets,
  reps,
  videoUrl: "",
  videoSource: "",
  videoSourcePage: "",
  videoType: "",
  videoVerifiedAt: "",
  videoVerification: "",
  lockedReason: "",
  tags: [],
  rpe: "7–8",
  restSec: 90,
  cue: "Use controlled range and stop if symptoms or technique deteriorate.",
  purpose: "Restore capacity through the approved progression.",
  evidence: "See the frozen Master Plan and source details.",
  evidenceStrength: "Strong/supportive",
  evidenceType: "Achilles repair expert consensus",
  evidenceSourceIds: ["rehab-guidance"],
  phaseAvailability: ["Foundational Strength", "Running Readiness", "Running"],
  loadTier: "moderate",
  impactTier: 0,
  unit: "reps",
  regressionIds: [],
  progressionIds: [],
  contraindicationFlags: ["red-flags"],
  ...extra,
});
export const CATALOG = {
  bilateral: base(
    "bilateral-calf",
    "Bilateral Standing Calf Raise",
    [],
    3,
    "10–15",
    { ...demo(yt("wfytUSMszPw")), tags: ["calf"], progressionIds: ["single"] },
  ),
  seated: base(
    "seated-calf",
    "Loaded Seated Calf Raise",
    ["adjustable-bench", "dumbbells"],
    4,
    "8–12",
    {
      ...demo(yt("pwk6BHBArcA")),
      tags: ["soleus"],
      cue: "Knee near 90°, stable setup, controlled heel height; choose the load established in assessment.",
    },
  ),
  single: base("single-calf", "Single-Leg Calf Raise", [], 3, "6–12", {
    ...demo(yt("d8Mns_DeHUw")),
    tags: ["calf"],
    loadTier: "high",
    regressionIds: ["bilateral"],
  }),
  belt: base("belt-squat", "Belt Squat", ["belt-squat"], 3, "6–10", {
    ...demo(
      legacy.beltSquat.videoUrl,
      "Flow High Performance",
      "docs/VIDEO_CATALOG.md",
      "short",
    ),
    tags: ["strength"],
    loadTier: "low",
    cue: legacy.beltSquat.cue,
  }),
  rdl: base(
    "dumbbell-romanian-deadlift",
    "Dumbbell Romanian Deadlift",
    ["dumbbells"],
    3,
    "8–10",
    {
      ...demo(
        "https://www.nasm.org/resource-center/exercise-library/dumbbell-romanian-deadlift",
        "NASM",
        "https://www.nasm.org/resource-center/exercise-library/dumbbell-romanian-deadlift",
      ),
      tags: ["strength"],
      loadTier: "low",
      cue: legacy.rdl.cue,
    },
  ),
  step: base("bench-step-up", "Step-Up", ["adjustable-bench"], 3, "8 / side", {
    ...demo(yt("oEqanebIQKs")),
    tags: ["strength"],
    cue: legacy.stepUp.cue,
  }),
  bridge: base("bridge", "Bridge / Hip Thrust", [], 3, "8–12", {
    ...demo(yt("3kQfcIUXI28")),
    tags: ["strength"],
    loadTier: "low",
  }),
  pallof: base(
    "cable-pallof-press",
    "Cable Pallof Press",
    ["cable-station"],
    2,
    "10 / side",
    {
      ...demo(yt("f3R99GoYvCs"), "NASM", "docs/VIDEO_CATALOG.md", "short"),
      tags: ["trunk"],
      loadTier: "minimal",
      rpe: "6–7",
      restSec: 45,
      cue: legacy.pallof.cue,
    },
  ),
  balance: base("single-balance", "Single-Leg Balance", [], 2, "30–60 sec", {
    ...demo(yt("9g_s19nirCg")),
    tags: ["balance"],
    loadTier: "minimal",
    rpe: "Controlled",
    unit: "seconds",
  }),
  wagon: base(
    "weighted-wagon-backward-drag",
    "Weighted Wagon Backward Drag",
    ["weighted-wagon"],
    4,
    "15–25 yd",
    {
      ...demo(
        yt("YyaNNPy-FNQ"),
        "Resilient Performance PT",
        "docs/VIDEO_CATALOG.md",
        "short",
      ),
      tags: ["conditioning"],
      rpe: "5–7",
      unit: "yards",
      cue: "Smooth short backward steps. Wagon pounds are not equivalent to sled resistance.",
    },
  ),
  // Unverified items are visible in the library but never selected into active sessions.
  hamstring: base(
    "band-hamstring",
    "Prone Band Hamstring Curl",
    ["rehab-bands"],
    3,
    "10–15",
    {
      tags: ["strength"],
      loadTier: "low",
      ...demo(
        "https://library.theprehabguys.com/vimeo-video/prone-hamstring-curl-band/",
        "[P]rehab",
        "https://library.theprehabguys.com/vimeo-video/prone-hamstring-curl-band/",
      ),
    },
  ),
  pullup: base("pull-up", "Pull-Up", ["pull-up-bar"], 3, "8–12", {
    tags: ["upper"],
    loadTier: "minimal",
    ...demo(
      "https://www.nasm.org/resource-center/exercise-library/pull-up",
      "NASM",
      "https://www.nasm.org/resource-center/exercise-library/pull-up",
    ),
  }),
  press: base(
    "db-bench",
    "Incline Dumbbell Press",
    ["adjustable-bench", "dumbbells"],
    3,
    "6–10",
    {
      tags: ["upper"],
      loadTier: "minimal",
      ...demo(
        "https://www.nasm.org/resource-center/exercise-library/two-arm-incline-dumbbell-chest-press",
        "NASM",
        "https://www.nasm.org/resource-center/exercise-library/two-arm-incline-dumbbell-chest-press",
      ),
    },
  ),
  mobility: base("knee-to-wall", "Knee-to-Wall Mobility", [], 2, "8–10", {
    ...demo(
      "https://library.theprehabguys.com/vimeo-video/knee-to-wall-ankle-dorsiflexion-assessment/",
      "[P]rehab",
      "https://library.theprehabguys.com/vimeo-video/knee-to-wall-ankle-dorsiflexion-assessment/",
    ),
    tags: ["mobility"],
    loadTier: "minimal",
    rpe: "Gentle",
    cue: "Keep your heel down. Mobility is a functional measure, not range to force.",
  }),
};
export function validDemo(ex) {
  return (
    !!ex.videoUrl &&
    /^https:\/\//.test(ex.videoUrl) &&
    !!ex.videoSource &&
    !!ex.videoVerifiedAt &&
    VIDEO_TYPES.includes(ex.videoType) &&
    !ex.lockedReason
  );
}
export function ownedExercise(ex, equipment = EQUIPMENT) {
  return (ex.equipment || []).every((item) => equipment.includes(item));
}
export function activeExercise(ex, equipment = EQUIPMENT) {
  return validDemo(ex) && ownedExercise(ex, equipment);
}
export const PROGRESSION_DOMAINS = [
  {
    id: "running",
    title: "Running",
    prefix: "R",
    levels: plan.runningLadder.map((l) => ({
      id: l.id,
      title: l.work,
      dose: [l.work, l.recovery, l.intensity].filter(Boolean).join(" · "),
    })),
    evidence: "running-consensus",
  },
  {
    id: "jumping",
    title: "Jumping & Plyometrics",
    prefix: "J",
    levels: plan.jumpLadder.map((l) => ({
      id: l.id,
      title: l.items[0],
      dose: l.items.join(" · "),
    })),
    evidence: "rehab-guidance",
  },
  {
    id: "speed",
    title: "Speed & Sprinting",
    prefix: "S",
    levels: plan.sprintLadder.map((l) => ({
      id: l.id,
      title: l.intensity || l.dose,
      dose: [l.dose, l.intensity].filter(Boolean).join(" · "),
    })),
    evidence: "rehab-guidance",
  },
  {
    id: "cod",
    title: "Deceleration & Change of Direction",
    prefix: "D",
    levels: plan.codLadder.map((l, index) => ({
      id: l.split(" ")[0],
      title: l.slice(3),
      dose: [
        "4–6 × jog 10 m → controlled stop",
        "Run 10–15 m → controlled stop; progressively shorter braking zone",
        "3 × 4 / side · planned 45° cuts",
        "3 × 4 / side · planned 90° cuts",
        "4–6 bouts · lateral shuffle, crossover and closeout",
        "4–6 bouts · reactive visual/cone call cuts",
        "Basketball-specific reactive movement; individualized dose",
      ][index],
    })),
    evidence: "rehab-guidance",
  },
  {
    id: "basketball",
    title: "Basketball Return",
    prefix: "B",
    levels: plan.basketballLadder.map((l) => ({
      id: l.split(" ")[0],
      title: l.slice(3),
      dose: l,
    })),
    evidence: "rts-review",
  },
  {
    id: "soccer",
    title: "Soccer",
    prefix: "SC",
    levels: plan.soccerLadder.map((l, index) => ({
      id: l.split(" ")[0],
      title: l.slice(4),
      dose:
        index === 0
          ? "10–15 min · ball touches and passing"
          : index === 1
            ? "10–20 min · receiving and walking dribble"
            : l,
    })),
    evidence: "rehab-guidance",
  },
];
