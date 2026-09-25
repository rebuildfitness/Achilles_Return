import { CATALOG } from "./catalog.js";

// Reuse the workout catalog so assessment demonstrations cannot drift.
export const BASELINE_DEMOS = {
  mobility: [CATALOG.mobility],
  balance: [CATALOG.balance],
  bilateral: [CATALOG.bilateral],
  heelrise: [CATALOG.single],
  soleus: [CATALOG.seated],
  straight: [CATALOG.single],
  strength: [CATALOG.belt, CATALOG.rdl, CATALOG.step, CATALOG.bridge],
};

const yesNo = [
  ["yes", "Yes"],
  ["no", "No"],
  ["unsure", "Not sure"],
];
const severity = [
  ["none", "None"],
  ["mild", "Mild"],
  ["moderate", "Moderate"],
  ["significant", "Significant"],
];
const functionOptions = [
  ["no", "Not yet"],
  ["symptoms", "Yes, with symptoms"],
  ["normal", "Yes, normally"],
];
const number = (id, label, max = undefined, required = false) => ({
  id,
  label,
  type: "number",
  min: 0,
  max,
  required,
});
const choice = (id, label, options = yesNo, required = true) => ({
  id,
  label,
  type: "select",
  options,
  required,
});
const text = (id, label, required = false) => ({
  id,
  label,
  type: "text",
  required,
});
const sideMetrics = (prefix, labels) =>
  ["uninvolved", "repaired"].flatMap((side) =>
    labels.map(([key, label, max]) =>
      number(
        `${prefix}_${side}_${key}`,
        `${side === "repaired" ? "Repaired" : "Uninvolved"} side · ${label}`,
        max,
      ),
    ),
  );
const strength = (prefix) => [
  ...sideMetrics(prefix, [
    ["load", "load (lb)"],
    ["reps", "repetitions"],
    ["rpe", "RPE", 10],
    ["pain", "pain", 10],
  ]),
  choice(
    `${prefix}_quality`,
    "Full controlled range and heel height?",
    yesNo,
    false,
  ),
  text(`${prefix}_setup`, "Setup used (repeat this at retest)"),
];
export const BASELINE_SECTIONS = [
  {
    id: "safety",
    title: "Safety & current status",
    instructions:
      "Start with symptoms. Stop testing if you notice sharp pain, sudden weakness, new bruising, major swelling or a new limp.",
    fields: [
      choice("repairSide", "Repaired side", [
        ["left", "Left"],
        ["right", "Right"],
      ]),
      {
        id: "surgeryDate",
        label: "Surgery date",
        type: "date",
        required: true,
      },
      { id: "ptEndDate", label: "PT end month", type: "month" },
      choice("clearance", "Current clinician clearance for exercise"),
      choice("noRestrictions", "No current clinician restrictions"),
      text("restrictions", "Current restrictions or instructions"),
      choice("complications", "Complications or rerupture since surgery"),
      text("complicationNotes", "Complication details"),
      number("restPain", "Resting pain (0–10)", 10, true),
      number("walkPain", "Walking pain (0–10)", 10, true),
      choice("stiffness", "Morning stiffness", severity),
      number("stiffnessMinutes", "Stiffness duration (minutes)"),
      choice("swelling", "Swelling", severity),
      choice("soreness", "Soreness / tenderness", severity),
      choice("gait", "Walking gait", [
        ["normal", "Normal"],
        ["slight", "Slight limp"],
        ["clear", "Clear limp"],
      ]),
      {
        id: "redFlags",
        label: "Any unusual symptoms?",
        type: "checks",
        options: [
          ["sharp-pain", "Sharp Achilles pain"],
          ["new-bruising", "New bruising"],
          ["major-swelling", "Rapid or major swelling"],
          ["sudden-weakness", "Sudden weakness"],
          ["new-limp", "New limp"],
          ["suspected-tendon-gap", "Suspected tendon gap"],
          [
            "sudden-loss-of-heel-raise",
            "Sudden loss of a previously easy heel raise",
          ],
          ["other-concerning", "Other concerning acute symptoms"],
        ],
      },
    ],
  },
  {
    id: "function",
    title: "Daily function",
    instructions:
      "Describe your current ability. Do not try a new activity just to answer these questions.",
    fields: [
      ...[
        "Walk 10 minutes",
        "Walk 30 minutes",
        "Brisk walk",
        "Stairs up",
        "Stairs down",
        "Walk on tiptoes",
        "Single-leg stand",
        "Bilateral calf raise",
        "Single-leg calf raise",
        "Jog",
        "Jump",
      ].map((label, i) => choice(`function_${i}`, label, functionOptions)),
      choice("noDailyPain", "No pain in daily life"),
      choice("noRehabPain", "No pain during or after rehabilitation"),
    ],
  },
  {
    id: "confidence",
    title: "Confidence & outcomes",
    instructions:
      "Confidence is one domain of readiness. It never overrides symptoms or physical capacity. If a clinician has already administered ATRS, you can record its total here.",
    fields: [
      ...["walk", "run", "jump", "sprint", "cut", "basketball"].map(
        (activity) =>
          number(
            `confidence_${activity}`,
            `Confidence to ${activity} (0–10)`,
            10,
          ),
      ),
      choice("psychReady", "Psychologically ready to begin controlled running"),
      number("atrs", "Previously administered ATRS total (optional)", 100),
      text("atrsDate", "ATRS administration date / source (optional)"),
    ],
  },
  {
    id: "mobility",
    title: "Knee-to-wall mobility",
    dynamic: true,
    instructions:
      "Heel flat, knee over second toe. Move back until the knee just touches the wall. Record two valid trials per side in cm. Use the same shoes/setup each time; do not force range.",
    fields: [
      ...sideMetrics("mobility", [
        ["trial1", "trial 1 (cm)"],
        ["trial2", "trial 2 (cm)"],
        ["pain", "pain", 10],
      ]),
      text("mobilitySetup", "Shoes / setup notes"),
    ],
  },
  {
    id: "balance",
    title: "Single-leg balance",
    dynamic: true,
    instructions:
      "Eyes open, up to 60 seconds per side. Touch support only to prevent a fall and record each touch. Stop for pain or loss of control.",
    fields: [
      ...sideMetrics("balance", [
        ["seconds", "seconds", 60],
        ["touches", "support touches"],
        ["pain", "pain", 10],
        ["confidence", "confidence", 10],
      ]),
      choice(
        "goodBalance",
        "Good single-leg balance demonstrated?",
        yesNo,
        false,
      ),
    ],
  },
  {
    id: "bilateral",
    title: "Bilateral heel-raise screen",
    dynamic: true,
    instructions:
      "10 controlled repetitions: 2 seconds up, 1 second hold, 2 seconds down. If unsafe or clearly poor, skip loaded and unilateral tests.",
    video: "https://www.youtube.com/watch?v=wfytUSMszPw",
    fields: [
      number("bilateralReps", "Actual repetitions completed"),
      choice("bilateralTen", "Completed all 10 repetitions", yesNo, false),
      choice("bilateralSafe", "Safe, controlled performance", yesNo, false),
      choice(
        "bilateralSymmetry",
        "Symmetry",
        [
          ["good", "Good"],
          ["mild", "Mild shift"],
          ["clear", "Clear shift"],
        ],
        false,
      ),
      choice(
        "bilateralHeight",
        "Heel height",
        [
          ["normal", "Normal-looking"],
          ["reduced", "Reduced"],
          ["marked", "Markedly reduced"],
        ],
        false,
      ),
      number("bilateralPain", "Pain (0–10)", 10),
    ],
  },
  {
    id: "heelrise",
    title: "Single-leg heel-rise test",
    dynamic: true,
    requiresBilateral: true,
    instructions:
      "Uninvolved side first, rest, then repaired side. Straight knee; fingertips for balance only; 30 raises/minute. Stop after two missed cadences, height collapse, repeated knee bending, arm assistance, limiting pain or whenever you choose.",
    video: "https://www.youtube.com/watch?v=d8Mns_DeHUw",
    fields: [
      ...sideMetrics("heel", [
        ["reps", "repetitions"],
        ["peak", "peak height (cm)"],
        ["average", "average height (cm)"],
        ["pain", "pain", 10],
        ["rpe", "RPE", 10],
      ]),
      choice(
        "heelQuality",
        "Controlled height, cadence and technique?",
        yesNo,
        false,
      ),
      text("heelStop", "Reason stopped"),
      text("heelSetup", "Test setup / optional video reference"),
    ],
  },
  {
    id: "soleus",
    title: "Bent-knee / soleus capacity",
    dynamic: true,
    requiresBilateral: true,
    instructions:
      "Bench with knee near 90°. Use a reproducible Smith, dumbbell or cable setup. Warm up; choose 8–15 good repetitions and stop with 1–2 reps in reserve. Record both sides when practical.",
    fields: strength("soleus"),
  },
  {
    id: "straight",
    title: "Straight-knee calf capacity",
    dynamic: true,
    requiresBilateral: true,
    instructions:
      "Supported single-leg calf raise using Smith machine or dumbbell. Submaximal 6–12 repetitions, RPE 7–9, consistent range. No maximal testing required.",
    fields: strength("straight"),
  },
  {
    id: "strength",
    title: "General lower-body capacity",
    dynamic: true,
    requiresBilateral: true,
    instructions:
      "Use submaximal loads: belt squat and DB RDL 8–10 reps; step-up 6–10/side at a controlled height. These establish training loads, not sport clearance. Leave tests blank if not performed.",
    fields: [
      ...["belt", "rdl", "step", "bridge"].flatMap((id) => [
        number(`${id}_load`, `${id} · load (lb)`),
        number(`${id}_reps`, `${id} · reps`),
        number(`${id}_rpe`, `${id} · RPE`, 10),
        text(`${id}_quality`, `${id} · quality / symptoms`),
      ]),
    ],
  },
  {
    id: "conditioning",
    title: "Conditioning",
    instructions:
      "Record what you already tolerate. Do not start running during baseline unless all seven running criteria have passed.",
    fields: [
      number("walkMinutes", "Longest comfortable walk (minutes)"),
      number("bikeMinutes", "Current weekly bike minutes"),
      number("treadmillMinutes", "Current weekly incline-walk minutes"),
      choice("recentRunning", "Recent running exposure"),
      number("runMinutes", "Longest continuous easy run (minutes)"),
      choice("runSameDay", "Recent running tolerated the same day?"),
      choice("runNextDay", "Recent running tolerated the next morning?"),
    ],
  },
  {
    id: "basketball",
    title: "Basketball goals",
    instructions:
      "Your goal informs the plan; it does not unlock a higher phase.",
    fields: [
      choice("basketballFrequency", "Preinjury frequency", [
        ["less", "Less than once a week"],
        ["1", "Once a week"],
        ["2", "Twice a week"],
        ["3", "Three or more times a week"],
      ]),
      choice("basketballFormat", "Previous format", [
        ["shooting", "Shooting"],
        ["half", "Half-court pickup"],
        ["full", "Full-court pickup"],
        ["competitive", "League / competitive"],
      ]),
      choice("basketballGoal", "Target", [
        ["shooting", "Recreational shooting"],
        ["half", "Half-court"],
        ["full", "Full-court"],
        ["competitive", "Competitive"],
      ]),
      number("courtDays", "Available court days per week", 7),
      number(
        "contactConfidence",
        "Confidence in reactive/contact play (0–10)",
        10,
      ),
    ],
  },
  {
    id: "schedule",
    title: "Schedule & optional soccer",
    instructions:
      "Choose realistic training days. High Achilles loading will be consolidated rather than added every day. Soccer uses the same capacity and response rules.",
    fields: [
      {
        id: "availableDays",
        label: "Available training days",
        type: "checks",
        required: true,
        options: [
          ["1", "Monday"],
          ["2", "Tuesday"],
          ["3", "Wednesday"],
          ["4", "Thursday"],
          ["5", "Friday"],
          ["6", "Saturday"],
          ["0", "Sunday"],
        ],
      },
      choice("soccerEnabled", "Enable optional soccer track"),
      choice("soccerBall", "Access to a soccer ball?", yesNo, false),
      choice("soccerField", "Field / yard access?", yesNo, false),
      choice(
        "soccerGoal",
        "Soccer goal",
        [
          ["skills", "Basic skills"],
          ["play", "Recreational play"],
        ],
        false,
      ),
    ],
  },
];
export function sectionBlocked(section, values) {
  if (section.dynamic && (values.redFlags || []).length)
    return "Stop dynamic testing and seek appropriate medical evaluation.";
  if (
    section.dynamic &&
    (values.clearance !== "yes" || values.noRestrictions !== "yes")
  )
    return "Review current exercise restrictions with your clinician before physical testing.";
  if (
    section.requiresBilateral &&
    (values.bilateralSafe !== "yes" ||
      values.bilateralTen !== "yes" ||
      values.bilateralHeight === "marked" ||
      values.bilateralSymmetry === "clear")
  )
    return "Skip unilateral / loaded testing until the bilateral screen is safe and controlled.";
  return null;
}
export function validateSection(section, values) {
  const blocked = sectionBlocked(section, values);
  return section.fields
    .filter((field) => {
      const value = values[field.id];
      if (
        field.required &&
        !blocked &&
        (value === undefined ||
          value === "" ||
          (Array.isArray(value) && !value.length))
      )
        return true;
      if (field.type === "number" && value !== undefined && value !== "")
        return (
          !Number.isFinite(Number(value)) ||
          Number(value) < 0 ||
          (field.max !== undefined && Number(value) > field.max)
        );
      return false;
    })
    .map((field) => field.label);
}
