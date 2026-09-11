// Exact ladder prescriptions remain in the frozen JSON. Demonstration gaps are
// explicit release restrictions, not invitations to substitute a different drill.
import { validDemo } from "./catalog.js";
const nhs = "Royal United Hospitals Bath NHS";
const clip = (name, url, source, type = "exercise_specific_page") => ({
  name,
  videoUrl: url,
  videoSource: source,
  videoType: type,
  videoVerifiedAt: "2026-09-11",
  verification:
    "Approved frozen catalog or official exercise page; playback is external.",
});
const yt = (name, id, source = nhs) =>
  clip(name, `https://www.youtube.com/watch?v=${id}`, source);
const snap = clip(
  "Snap-down / controlled landing",
  "https://library.theprehabguys.com/vimeo-video/snap-down/",
  "[P]rehab",
);
const mini = yt("Bilateral mini hops", "u32-2NDdJWI"),
  jumps = yt("Jumping and landing", "DUPtaxTfHbw"),
  single = yt("Single-leg pogo", "UoFD9sloaR0", "Fitness Pain Free");
const acceleration = yt(
  "Sprint acceleration",
  "DCs3CXP9fjY",
  "John Shepherd, track coach",
);
const braking = yt(
  "Controlled deceleration",
  "Loe0P6YiC7Y",
  "Myokinetix PT & Performance",
);
const closeout = clip(
  "Closeout with defensive slides",
  "https://www.usab.com/videos/2014/12/close-out-with-defensive-slides",
  "USA Basketball",
  "governing_body_clip",
);
const shooting = clip(
  "Stationary shooting",
  "https://www.usab.com/videos/2014/01/fundamentals-of-shooting",
  "USA Basketball",
  "governing_body_clip",
);
const cut45 = clip(
  "Planned diagonal cut / Y drill",
  "https://www.peak-physio.com.au/exercise/y-cut-drill/",
  "Peak Physio",
);
const cut90 = clip(
  "90° change of direction — use only the prescribed angle",
  "https://library.theprehabguys.com/vimeo-video/agility-drill-90-and-180-turns-2/",
  "[P]rehab",
);
const cmj = clip(
  "Countermovement jump",
  "https://ca.physitrack.com/home-exercise-video/countermovement-jump-%2528hands-on-hips%2529---shallow",
  "Physitrack",
);
const lateral = clip(
  "Low lateral line jump and hold",
  "https://us.physitrack.com/home-exercise-video/bunny-jump-and-hold---side-to-side-over-a-line",
  "Physitrack",
);
const running = clip(
  "Treadmill walk / jog technique",
  "https://na.physitrack.com/home-exercise-video/running%252fjogging-on-a-treadmill",
  "Physitrack",
);
const passing = clip(
  "Making and receiving passes",
  "https://inside.fifa.com/talent-development/fifa-training-centre/news/train-like-a-pro-with-the-fifa-training-centre-making-and-receiving-passes",
  "FIFA",
  "governing_body_clip",
);

const wbaPage =
  "https://www.wba.co.uk/albion-foundation/about-us/active-lifestyles/home-skills-videos/";
const sourced = (demo, sourcePage, note) => ({
  ...demo,
  videoSourcePage: sourcePage,
  note,
  verification:
    "Provider page and embedded video identity checked on 2026-09-11; external playback availability may vary.",
});
const receive = sourced(
  yt(
    "Passing and receiving",
    "Mm_1RxZDKYs",
    "The Albion Foundation / West Bromwich Albion",
  ),
  wbaPage + "passing-and-receiving",
  "Use the receiving technique at your prescribed pace.",
);
const dribble = sourced(
  yt(
    "Controlled dribbling",
    "qKYm7XJDGRE",
    "The Albion Foundation / West Bromwich Albion",
  ),
  wbaPage + "dribbling",
  "SC2: walking pace only. SC3: use only your prescribed jogging pace; skip extra challenges.",
);
const turn = sourced(
  yt(
    "Controlled turns with the ball",
    "07qqqHTRLwE",
    "The Albion Foundation / West Bromwich Albion",
  ),
  wbaPage + "turning",
  "Use only the planned turn and speed in your individual prescription.",
);
const instep = sourced(
  yt(
    "Instep shooting technique",
    "tQGzk82eGxs",
    "Sporthood — Nikhil Menon, technical head",
  ),
  "https://www.sporthood.in/blog/how-to-play-football-instep-shooting/",
  "Submaximal shots only at SC3; the video is a technique reference, not a power target.",
);
const diagonal = sourced(
  yt(
    "Single-leg diagonal line hops",
    "uU6XsRX8zO4",
    "Gold Crown Foundation / Children's Hospital sports medicine program",
  ),
  "https://www.goldcrownfoundation.com/at-home-strength-and-power-program/",
  "Use your individual J5 contact dose; do not adopt the source program's weekly schedule.",
);
const reactive = sourced(
  yt("Single-leg hop with perturbations", "BCWtyHuTLJg", "Peak Physio"),
  "https://www.peak-physio.com.au/exercise/single-leg-hop-with-perturbations/",
  "An example of a reactive task; use only if included in your individual J5 prescription with a suitable partner.",
);
const reactiveBall = sourced(
  clip(
    "Reactive dribbling game",
    "https://www.fifatrainingcentre.com/en/practice/elite-sessions/in-possession/mastering-ball-control.php#mod_35_1751615",
    "FIFA Training Centre",
    "governing_body_clip",
  ),
  "https://www.fifatrainingcentre.com/en/practice/elite-sessions/in-possession/mastering-ball-control.php",
  "Part 3 demonstration only. Your prescribed intensity and duration govern the exposure.",
);
const smallSided = sourced(
  clip(
    "Small-sided soccer — 3v3 demonstration",
    "https://www.fifatrainingcentre.com/en/practice/training-perspectives/designing-games-for-development/3v3-funino-developing-game-intelligence-and-decision-making.php",
    "FIFA Training Centre",
    "governing_body_clip",
  ),
  "https://www.fifatrainingcentre.com/en/practice/training-perspectives/designing-games-for-development/3v3-funino-developing-game-intelligence-and-decision-making.php",
  "Watch the game overview. Use only your limited-practice prescription; do not copy high-intensity rounds.",
);

export const DRILL_DEMOS = {
  J0: [snap],
  J1: [mini, jumps],
  J2: [mini, cmj, lateral],
  J3: [single, jumps],
  J4: [single, jumps],
  J5: [single, diagonal, reactive],
  D1: [braking],
  D2: [braking],
  D3: [cut45],
  D4: [cut90],
  D5: [closeout],
  D6: [cut45],
  D7: [closeout],
  B1: [shooting],
  B2: [shooting],
  B3: [closeout, cut45],
  B4: [closeout],
  B5: [closeout],
  B6: [closeout],
  B7: [closeout],
  B8: [closeout],
  SC1: [passing],
  SC2: [receive, dribble],
  SC3: [dribble, instep],
  SC4: [turn],
  SC5: [reactiveBall],
  SC6: [smallSided],
};
export function exposureContent(domain, level) {
  const demos =
    domain === "speed"
      ? [acceleration]
      : domain === "running"
        ? [running]
        : DRILL_DEMOS[level] || [];
  const missingDemos = demos.filter((d) => !validDemo(d)).map((d) => d.name);
  return {
    demos,
    missingDemos,
    needsIndividualDose: [
      "J5",
      "S6",
      "D7",
      "D2",
      "B6",
      "B7",
      "SC3",
      "SC4",
      "SC5",
      "SC6",
    ].includes(level),
    warmup:
      domain === "running"
        ? "5–10 min brisk walk and easy movement preparation. Finish with 5 min walking."
        : domain === "speed"
          ? "Warm up fully. Use long rest between repetitions."
          : "Prepare with your established tolerated warm-up. Prioritize movement quality.",
    note:
      domain === "running"
        ? "Keep running easy. Follow this dose; do not also increase speed or terrain difficulty."
        : domain === "basketball"
          ? "Court exposure is limited by the lowest required physical capacity. Stop if symptoms or movement quality deteriorate."
          : "Do not add contacts, speed and complexity together. Stop for deteriorating technique or symptoms.",
  };
}
export function courtCap(level, sessions = []) {
  if (level !== "B8") return null;
  return sessions.some(
    (s) =>
      s.domain === "basketball" &&
      s.exposureLevel === "B8" &&
      s.status === "TOLERATED",
  )
    ? 45
    : 30;
}
export function validateExposureLog(domain, level, values, sessions = []) {
  const errors = [];
  if (!(Number(values.minutes) > 0)) errors.push("Enter actual minutes.");
  if (
    !(Number(values.sessionRPE) >= 0 && Number(values.sessionRPE) <= 10) ||
    values.sessionRPE === ""
  )
    errors.push("Enter session RPE from 0 to 10.");
  if (!values.movementQuality) errors.push("Record movement quality.");
  if (!values.immediateAchillesResponse)
    errors.push("Record the immediate Achilles response.");
  if (domain === "jumping" && !(Number(values.contacts) > 0))
    errors.push("Enter total landing contacts.");
  if (["speed", "cod"].includes(domain) && !(Number(values.distance) > 0))
    errors.push("Enter actual distance in metres.");
  if (["speed", "basketball", "soccer"].includes(domain) && !values.intensity)
    errors.push("Record actual intensity / pace.");
  // Actual over-cap exposure is still recorded honestly, but cannot drive advancement.
  return errors;
}
export function exposureQuality(domain, level, values, sessions = []) {
  const cap = courtCap(level, sessions),
    reason = [];
  if (cap && Number(values.minutes) > cap)
    reason.push("Actual court time exceeded the planned cap.");
  if (values.movementQuality !== "good")
    reason.push("Movement quality was reduced.");
  if (values.immediateAchillesResponse !== "good")
    reason.push("Immediate symptoms increased.");
  const prior = [...sessions]
    .filter((s) => s.domain === domain && s.status === "TOLERATED")
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
    .at(-1);
  if (
    domain === "jumping" &&
    Number(prior?.contacts) > 0 &&
    Number(values.contacts) >= Number(prior.contacts) * 2
  )
    reason.push(
      "Landing contacts doubled or more. Review dose before progressing.",
    );
  return {
    progressionEligible: !reason.length,
    movementQuality: reason.length ? "reduced" : "good",
    reviewReasons: reason,
  };
}
