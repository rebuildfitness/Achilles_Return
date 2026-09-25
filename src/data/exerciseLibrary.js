import { REHAB_SERIES_EXERCISES } from "./rehabSeriesExercises.js";
import { EQUIPMENT_REFERENCE_EXERCISES } from "./equipmentContext.js";
import { RESEARCH_EXERCISES } from "./researchExercises.js";
import { NEW_EQUIPMENT_EXERCISES } from "./newEquipmentExercises.js";
import { CALF_PATHWAY } from "./calfPathway.js";
import { CATALOG, EQUIPMENT_LABELS } from "./catalog.js";
const M = "https://www.muscleandstrength.com/exercises/";
const P = "https://library.theprehabguys.com/vimeo-video/";
// Reference entries never enter CATALOG or the deterministic workout planner.
const groups = [
  [
    "cable-station",
    "Arms",
    [
      [
        "Straight-bar cable triceps extension",
        "tricep-extension.html",
        "Straight bar; high pulley",
      ],
      [
        "Rope cable triceps extension",
        "rope-tricep-extension.html",
        "Rope; high pulley",
      ],
      ["Cable biceps curl", "cable-curl.html", "Bar; low pulley"],
      [
        "Overhead rope cable triceps extension",
        "standing-low-pulley-overhead-tricep-extension-(rope-extension).html",
        "Rope; low pulley",
      ],
    ],
  ],
  [
    "cable-station",
    "Shoulders",
    [
      ["Cable face pull", "cable-face-pull", "Rope; adjustable high pulley"],
      [
        "Cable reverse fly",
        "standing-cable-flys.html",
        "Two handles and two adjustable pulleys",
      ],
      [
        "Two-arm cable lateral raise",
        "two-arm-cable-lateral-raise.html",
        "Two handles and two low pulleys",
      ],
      [
        "Cable external rotation",
        "cable-external-rotation",
        "Single handle; elbow-height pulley",
      ],
    ],
  ],
  [
    "cable-station",
    "Chest",
    [
      [
        "Standing cable fly",
        "cable-crossovers-(mid-chest).html",
        "Two handles and two adjustable pulleys",
      ],
    ],
  ],
  [
    "cable-station",
    "Back",
    [
      [
        "Straight-arm cable pulldown",
        "straight-arm-lat-pull-down.html",
        "Straight bar; high pulley",
      ],
    ],
  ],
  [
    "cable-station",
    "Core",
    [
      [
        "Kneeling cable crunch",
        "cable-crunch.html",
        "Rope; high pulley; comfortable kneeling position",
      ],
      ["Cable wood chop", "wood-chop.html", "Single handle; adjustable pulley"],
    ],
  ],
  [
    "cable-station",
    "Legs",
    [
      [
        "Standing cable hamstring curl",
        "standing-cable-hamstring-curl.html",
        "Ankle cuff; low pulley; stable hand support",
      ],
      [
        "Cable hip abduction",
        "cable-hip-abduction.html",
        "Ankle cuff; low pulley; stable hand support",
      ],
    ],
  ],
  [
    "dumbbells",
    "Chest",
    [
      [
        "Flat dumbbell bench press",
        "dumbbell-bench-press.html",
        "Stable flat bench",
      ],
      ["Dumbbell fly", "dumbbell-flys.html", "Stable flat bench"],
      [
        "Close-grip dumbbell press",
        "close-grip-dumbbell-press.html",
        "Stable flat bench",
      ],
      [
        "Dumbbell floor press",
        "dumbbell-floor-press.html",
        "Clear floor space; controlled entry and exit",
      ],
      ["Dumbbell pullover", "dumbbell-pullover.html", "Stable bench"],
    ],
  ],
  [
    "dumbbells",
    "Back",
    [
      [
        "Bent-over dumbbell row",
        "bent-over-dumbbell-row.html",
        "Stable stance; controlled hip hinge",
      ],
      [
        "Chest-supported dumbbell row",
        "chest-supported-dumbbell-row",
        "Incline bench",
      ],
      ["Dumbbell shrug", "dumbbell-shrugs.html", "Stable stance"],
    ],
  ],
  [
    "dumbbells",
    "Shoulders",
    [
      [
        "Bent-over dumbbell reverse fly",
        "bent-over-dumbbell-reverse-fly.html",
        "Controlled hip hinge",
      ],
      [
        "Seated dumbbell shoulder press",
        "seated-dumbbell-press.html",
        "Upright bench",
      ],
      [
        "Standing dumbbell shoulder press",
        "standing-dumbbell-press.html",
        "Stable stance",
      ],
      [
        "Seated dumbbell lateral raise",
        "seated-dumbbell-lateral-raise.html",
        "Stable bench",
      ],
    ],
  ],
  [
    "dumbbells",
    "Arms",
    [
      ["Incline dumbbell curl", "incline-dumbbell-curl.html", "Incline bench"],
      ["Standing hammer curl", "standing-hammer-curl.html", "Stable stance"],
      [
        "Lying dumbbell triceps extension",
        "lying-dumbbell-extension.html",
        "Stable flat bench",
      ],
      [
        "Bent-over dumbbell triceps kickback",
        "bent-over-dumbbell-kickback.html",
        "Controlled hip hinge",
      ],
    ],
  ],
  [
    "dumbbells",
    "Legs",
    [
      [
        "Dumbbell goblet squat",
        "dumbbell-goblet-squat",
        "Controlled squat range",
      ],
      ["Dumbbell squat", "dumbbell-squat.html", "Controlled squat range"],
      [
        "Dumbbell reverse lunge",
        "dumbbell-rear-lunge.html",
        "Single-leg control; sufficient clear floor space",
      ],
      [
        "Dumbbell Bulgarian split squat",
        "one-leg-dumbbell-squat-aka-bulgarian-squat.html",
        "Stable bench; advanced single-leg control",
      ],
    ],
  ],
  [
    "smith-machine",
    "Chest",
    [
      [
        "Smith incline bench press",
        "incline-smith-machine-bench-press.html",
        "Compatible incline bench; set Smith safeties",
      ],
    ],
  ],
  [
    "smith-machine",
    "Shoulders",
    [
      [
        "Smith seated shoulder press",
        "smith-machine-shoulder-press.html",
        "Compatible upright bench; set Smith safeties",
      ],
    ],
  ],
  [
    "smith-machine",
    "Back",
    [
      [
        "Smith bent-over row",
        "smith-machine-bent-over-row.html",
        "Set Smith safeties; controlled hip hinge",
      ],
      ["Smith shrug", "smith-machine-shrug.html", "Set Smith safeties"],
    ],
  ],
  [
    "smith-machine",
    "Legs",
    [
      [
        "Smith wide-stance squat",
        "wide-smith-machine-squat.html",
        "Set Smith safeties; use appropriate squat range",
      ],
      [
        "Smith deadlift",
        "smith-machine-deadlift.html",
        "Set Smith safeties; verify comfortable fixed bar path",
      ],
    ],
  ],
  [
    "olympic-barbell",
    "Back",
    [
      [
        "Barbell bent-over row",
        "bent-over-barbell-row.html",
        "Weight plates; controlled setup from floor",
      ],
      [
        "Barbell shrug",
        "barbell-shrug.html",
        "Weight plates; controlled setup from floor",
      ],
    ],
  ],
  [
    "olympic-barbell",
    "Legs",
    [
      [
        "Barbell deadlift",
        "deadlifts.html",
        "Weight plates; appropriate starting height",
      ],
      [
        "Barbell Romanian deadlift",
        "romanian-deadlift",
        "Weight plates; controlled setup from floor",
      ],
      [
        "Barbell hip thrust",
        "barbell-hip-thrust",
        "Stable bench, weight plates and appropriate bar padding",
      ],
      [
        "Barbell glute bridge",
        "barbell-glute-bridge",
        "Weight plates and appropriate bar padding; floor setup",
      ],
    ],
  ],
  [
    "trap-hex-bar",
    "Legs",
    [
      [
        "Trap-bar deadlift",
        "trap-bar-deadlift",
        "Weight plates; appropriate handle height",
      ],
    ],
  ],
  [
    "plyo-ball",
    "Legs",
    [
      [
        "Stability-ball hamstring curl",
        "exercise-ball-hamstring-curl",
        "Ball sized for your height; clear non-slip floor",
      ],
      [
        "Stability-ball wall squat",
        "swiss-ball-wall-squat.html",
        "Clear wall; non-slip floor",
      ],
    ],
  ],
  [
    "plyo-ball",
    "Core",
    [
      [
        "Stability-ball crunch",
        "swiss-ball-crunch.html",
        "Ball sized for your height; non-slip floor",
      ],
      [
        "Stability-ball stir the pot",
        "stir-the-pot-on-exercise-ball",
        "Advanced trunk control; stable floor",
      ],
      [
        "Stability-ball plank",
        "swiss-ball-hover.html",
        "Trunk control; stable floor",
      ],
      [
        "Stability-ball dead bug",
        "exercise-ball-dead-bug",
        "Clear floor space",
      ],
    ],
  ],
  [
    "dip-bars",
    "Chest",
    [
      [
        "Chest dip",
        "chest-dip.html",
        "Stable bars; controlled mount and dismount without jumping",
      ],
    ],
  ],
  [
    "",
    "Core",
    [
      [
        "Lying floor leg raise",
        "lying-floor-leg-raise.html",
        "Clear floor space",
      ],
      ["Superman", "superman", "Clear floor space"],
    ],
  ],
];
const extras = [
  [
    "",
    "Core",
    "Side plank",
    "side-plank/",
    "Clear floor space; controlled positioning",
  ],
  ["", "Core", "Dead bug", "dead-bug/", "Clear floor space"],
  [
    "rehab-bands",
    "Shoulders",
    "Band pull-apart",
    "band-pull-apart/",
    "Suitable band resistance",
  ],
  [
    "rehab-bands",
    "Calf & ankle",
    "Seated band ankle eversion",
    "seated-ankle-eversion-band-2/",
    "Secure band setup",
  ],
  [
    "rehab-bands",
    "Calf & ankle",
    "Seated band ankle inversion",
    "seated-ankle-inversion-band/",
    "Secure band setup",
  ],
  [
    "rehab-bands",
    "Legs",
    "Seated band knee extension",
    "seated-knee-extension-with-band/",
    "Stable seat; secure band setup",
  ],
  [
    "rehab-bands",
    "Legs",
    "Supine band clam",
    "supine-clam-band/",
    "Suitable loop band",
  ],
  [
    "balance-pad",
    "Balance",
    "Single-leg foam-pad balance",
    "single-leg-balance-foam-pad/",
    "Stable hand support nearby; foam pad, not inflatable cushion",
  ],
  [
    "balance-pad",
    "Balance",
    "Foam-pad balance with head turns",
    "single-leg-balance-horizontal-head-turn-foam-pad/",
    "Advanced balance control; stable hand support nearby",
  ],
  [
    "bosu-ball",
    "Core",
    "BOSU tall plank",
    "tall-plank-bosu/",
    "Stable clear floor; match the demonstrated orientation",
  ],
  [
    "bosu-ball",
    "Core",
    "BOSU tall-plank circles",
    "tall-plank-circles-bosu-2/",
    "Advanced trunk control; match the demonstrated orientation",
  ],
];
const make = (name, equipment, muscle, url, setup, source) => ({
  id:
    "library-" +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-$/, ""),
  name,
  equipment: equipment ? [equipment] : [],
  muscle,
  videoUrl: url,
  videoSource: source,
  setup,
  libraryOnly: true,
  review: ["Legs", "Calf & ankle", "Balance"].includes(muscle)
    ? "Match loading and balance demands to your current rehab stage."
    : "Choose a stable setup and a load you can control.",
  verification:
    "Exercise-specific provider page checked. Playback and duration have not been individually confirmed.",
  verifiedAt: "2026-09-11",
});
const additional = groups.flatMap(([equipment, muscle, rows]) =>
  rows.map(([name, slug, setup]) =>
    make(name, equipment, muscle, M + slug, setup, "Muscle & Strength"),
  ),
);
additional.push(
  ...extras.map(([equipment, muscle, name, slug, setup]) =>
    make(name, equipment, muscle, P + slug, setup, "Prehab"),
  ),
);
for (const ex of additional) {
  if (/bench/i.test(ex.setup)) ex.equipment.push("adjustable-bench");
  if (/weight plates/i.test(ex.setup)) ex.equipment.push("weight-plates");
}
const unilateral = make(
  "Seated unilateral cable hamstring curl",
  "cable-station",
  "Legs",
  "https://www.youtube.com/watch?v=LsP3CaDboRA&t=100s",
  "Low pulley, ankle cuff and stable bench. Train one leg at a time; record left and right separately when prescribed.",
  "Evolve Flagstaff",
);
unilateral.equipment.push("adjustable-bench");
unilateral.verification =
  "Unilateral movement visually checked at 1:40. Full exercise tutorial is 2:47; the demo link starts at the movement segment.";
additional.unshift(unilateral);
for (const [name, slug, muscle] of [
  ["Barbell bench press", "barbell-bench-press.html", "Chest"],
  ["Barbell back squat", "squat.html", "Legs"],
]) {
  const ex = make(
    name,
    "olympic-barbell",
    muscle,
    M + slug,
    "Use your B52 rack J-hooks and correctly positioned safeties. Check the empty 45 lb bar first; select a lighter alternative if that is too heavy. Record total bar plus plates.",
    "Muscle & Strength",
  );
  ex.equipment.push("smith-machine", "weight-plates");
  if (muscle === "Chest") ex.equipment.push("adjustable-bench");
  additional.push(ex);
}
additional.push(
  make(
    "Stationary cycling",
    "exercise-bike",
    "Conditioning",
    "https://www.youtube.com/watch?v=PFOfcsAOmVc",
    "Adjust the seat and follow the duration and resistance in your Plan.",
    "South Tees Hospitals NHS",
  ),
);
additional.push(
  make(
    "Treadmill walking",
    "incline-treadmill",
    "Conditioning",
    "https://www.youtube.com/watch?v=KALCW06tO5A",
    "Use the safety stop and your prescribed speed and incline. The source also demonstrates later progressions; jogging remains subject to your running criteria.",
    "South Tees Hospitals NHS",
  ),
);
const inferMuscle = (ex) => {
  const text = (ex.name + " " + (ex.tags || []).join(" ")).toLowerCase();
  if (/calf|ankle|heel/.test(text)) return "Calf & ankle";
  if (/balance/.test(text)) return "Balance";
  if (/row|pull.up/.test(text)) return "Back";
  if (/tricep|curl/.test(text) && !/hamstring/.test(text)) return "Arms";
  if (/shoulder|arnold|lateral raise/.test(text)) return "Shoulders";
  if (/pallof|core/.test(text)) return "Core";
  if (/press/.test(text)) return "Chest";
  return "Legs";
};
export const EXERCISE_LIBRARY = [
  ...REHAB_SERIES_EXERCISES,
  ...RESEARCH_EXERCISES,
  ...NEW_EQUIPMENT_EXERCISES,
  { id: "library-lat-pulldown", name: "Lat pulldown", equipment: ["cable-station", "adjustable-bench"], muscle: "Back",
    videoUrl: "https://www.muscleandstrength.com/exercises/lat-pull-down.html", videoSource: "Muscle & Strength",
    setup: "Use the B52 high pulley with a stable bench and the manufacturer-approved thigh restraint. Pull the bar toward the upper chest in front of the head, then return under control. Start with light stack resistance; do not jump to reach the bar.",
    review: "Adjustable-resistance alternative to pull-ups; establish a separate starting load. Confirm the seated setup and restraint are secure.",
    verifiedAt: "2026-09-14", verification: "Exercise-specific provider page checked; external playback may vary.", libraryOnly: true },
  ...CALF_PATHWAY,
  ...additional,
  ...Object.values(CATALOG).map((ex) => ({
    id: ex.id,
    name: ex.name,
    equipment: ex.equipment,
    muscle: inferMuscle(ex),
    videoUrl: ex.videoUrl,
    videoSource: ex.videoSource,
    setup: ex.cue,
    review:
      "Use the dose and readiness guidance shown in your prescribed workout.",
    verification: ex.videoVerification,
    verifiedAt: ex.videoVerifiedAt,
    libraryOnly: false,
  })),
];
export const MUSCLE_GROUPS = [
  ...new Set(EXERCISE_LIBRARY.map((ex) => ex.muscle)),
].sort();
export const equipmentLabel = (id) =>
  EQUIPMENT_LABELS[id] || id.replaceAll("-", " ");
export function filterLibrary({
  search = "",
  equipment = "",
  muscle = "",
} = {}) {
  const words = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return [...EXERCISE_LIBRARY, ...EQUIPMENT_REFERENCE_EXERCISES].filter(
    (ex) =>
      (!equipment ||
        (equipment === "bodyweight"
          ? !ex.equipment.length
          : ex.equipment.includes(equipment))) &&
      (!muscle || ex.muscle === muscle) &&
      words.every((word) =>
        [ex.name, ...(ex.aliases || []), ex.id === "weighted-wagon-backward-drag" ? "backward sled drag personal substitute" : "", ex.muscle, ...ex.equipment.map(equipmentLabel), ex.setup]
          .join(" ")
          .toLowerCase()
          .includes(word),
      ),
  );
}
