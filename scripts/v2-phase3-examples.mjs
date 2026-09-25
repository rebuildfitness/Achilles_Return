// Illustrative synthetic intent, not clinical prescriptions or personal records.
import { writeFile, mkdir } from "node:fs/promises";
import { DEFINITIONS } from "../src/domain/v2/compositionContent.js";
import {
  emptyIntent,
  newDraft,
  compose,
  customDefinition,
  targetNumber,
  copyTemplate,
  fromTemplate,
  known,
  uid,
} from "../src/domain/v2/composition.js";
import { validateV2 } from "../src/persistence/v2Validation.js";
const calf = DEFINITIONS.find((d) => d.id === "bilateral-calf"),
  press = DEFINITIONS.find((d) => d.id === "db-bench");
let mixed = compose(
  compose(emptyIntent("Synthetic strength + rehab"), {
    type: "add",
    definition: press,
  }),
  { type: "add", definition: calf },
);
mixed.notes = "Synthetic composition example. Targets are not recommendations.";
mixed.occurrences[0].sets[0].target = {
  reps: targetNumber("5", "count"),
  load: targetNumber("20", "lb"),
  loadConvention: known("per-hand"),
};
mixed.occurrences[1].sets[0].type = known("rehab");
mixed.occurrences[1].sets[0].target = {
  reps: targetNumber("8", "count"),
  side: known("bilateral"),
};
const custom = customDefinition({
  name: "Synthetic bike intervals",
  trackingType: "intervals",
  categories: ["Cardiovascular Training"],
  equipment: ["exercise-bike"],
  notes: "User-created fixture, unreviewed",
  demoUrl: "https://example.invalid/demo",
});
let cardio = compose(emptyIntent("Synthetic cardio intervals"), {
  type: "add",
  definition: custom,
});
cardio.occurrences[0].sets[0].repeatCount = 6;
cardio.occurrences[0].sets[0].intervals = [
  {
    id: uid(),
    order: 0,
    kind: "work",
    target: { duration: targetNumber("60", "seconds") },
  },
  {
    id: uid(),
    order: 1,
    kind: "recovery",
    target: { duration: targetNumber("120", "seconds") },
  },
];
const repeated = compose(
  compose(emptyIntent("Synthetic repeated calf movement"), {
    type: "add",
    definition: calf,
  }),
  { type: "add", definition: calf },
);
repeated.occurrences[0].sets[0].type = known("working");
repeated.occurrences[1].sets[0].type = known("rehab");
const template = {
  ...copyTemplate(mixed, "Synthetic user template"),
  recordVersion: 1,
  archived: false,
};
const independent = fromTemplate(template, "2026-09-20");
independent.snapshot.name = "Independent workout";
independent.snapshot.occurrences[0].sets[0].target.load = targetNumber(
  "15",
  "lb",
);
const examples = {
  notice: "Synthetic fixtures only; no exercise dose recommendation",
  blank: newDraft(emptyIntent("Blank workout"), "2026-09-20"),
  mixed: newDraft(mixed, "2026-09-20"),
  cardio: newDraft(cardio, "2026-09-20"),
  repeated: newDraft(repeated, "2026-09-20"),
  custom,
  template,
  independent,
};
for (const key of ["blank", "mixed", "cardio", "repeated", "independent"])
  validateV2("v2PlannedWorkouts", examples[key]);
validateV2("v2ExerciseDefinitions", custom);
validateV2("v2WorkoutTemplates", template);
await mkdir("artifacts/v2-phase3", { recursive: true });
await writeFile(
  "artifacts/v2-phase3/composition-examples.json",
  JSON.stringify(examples, null, 2),
);
console.log("Wrote seven validated synthetic composition examples.");
