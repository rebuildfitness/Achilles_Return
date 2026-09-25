import { writeFile } from "node:fs/promises";
import {
  EXERCISE_LIBRARY,
  equipmentLabel,
} from "../src/data/exerciseLibrary.js";
const lines = [
  "# Home-gym exercise library",
  "",
  "User-requested reference expansion, September 11, 2026. Canonical data: src/data/exerciseLibrary.js. Regenerate this inventory with node scripts/export-exercise-library.mjs.",
  "",
  `${EXERCISE_LIBRARY.length} exercises. The frozen clinical rules remain unchanged; see TRAINING_FLEXIBILITY_UPDATE.md for user-selected workout alternatives and seated core programming. Equipment-specific attachments and setup requirements are listed below. The user confirmed the Major Fitness B52 rack and safeties. No standalone leg press, medicine ball or slam ball is assumed.`,
  "",
  "The user confirmed cable equipment and ankle cuffs and corrected the requested hamstring curl to seated unilateral. Its Evolve Flagstaff video was visually checked at 1:40; the link starts there (full tutorial 2:47). Other new links are exercise-specific provider pages checked through their published catalogs; individual playback and duration are not universally verified. All videos are external and need internet access. Source demonstration is technique guidance, not Achilles clearance.",
  "",
  "Remaining coverage gaps: exact short demos for the inflatable Trideer cushion and AXV vibration plate. Foam-pad and BOSU videos are not substitutes. No vibration dose or unsupported therapeutic claims have been added.",
  "",
  "| Exercise | Muscle group | Equipment | Setup | Demo provider |",
  "| --- | --- | --- | --- | --- |",
  ...EXERCISE_LIBRARY.map(
    (ex) =>
      `| ${ex.name} | ${ex.muscle} | ${ex.equipment.map(equipmentLabel).join(", ") || "Bodyweight"} | ${ex.setup.replaceAll("|", "/")} | [${ex.videoSource}](${ex.videoUrl}) |`,
  ),
  "",
  "Validation: unit tests check inventory integrity, equipment whitelist, filter combinations and separation from prescribed workouts. Browser QA checks unilateral demo navigation, combined filters, empty state, pagination and mobile width. Existing clinical/storage/PWA tests remain required.",
];
await writeFile(
  new URL("../docs/EQUIPMENT_EXERCISE_LIBRARY.md", import.meta.url),
  lines.join("\n"),
);

