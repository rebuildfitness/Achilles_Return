import { CATALOG } from "../../data/catalog.js";
import { EXERCISE_LIBRARY } from "../../data/exerciseLibrary.js";
import { EQUIPMENT_REFERENCE_EXERCISES } from "../../data/equipmentContext.js";
import {
  MOVEMENT_EXERCISES,
  MOVEMENT_ROUTINES,
} from "../../data/movementRoutines.js";
import illustrations from "../../../public/assets/exercises/manifests/exercise-illustrations.json" with { type: "json" };
import { adaptDefinition, adaptSession, copyIntent } from "./adapters.ts";
import { strengthTemplate } from "../../rules/planner.js";
import { sessionItemsForDisplay } from "../../data/sessionPresentation.js";
import { emptyIntent, occurrence, known } from "./composition.js";
import {GUIDE_PHASES,guideDefinitions} from './rehabGuide.js';
const art = new Map(illustrations.map((x) => [x.exerciseId, x]));
// Merge by canonical identity, retaining catalog evidence and library demo metadata.
const sources = new Map();
for (const row of [
  ...EXERCISE_LIBRARY,
  ...EQUIPMENT_REFERENCE_EXERCISES,
  ...MOVEMENT_EXERCISES,
  ...Object.values(CATALOG),
])
  sources.set(row.id, { ...sources.get(row.id), ...row });
export function projectDefinition(row) {
  const d = adaptDefinition(row, art.get(row.illustrationId || row.id));
  d.categories =
    row.categories || (row.category ? [row.category] : row.tags || []);
  d.bodyRegions =
    row.bodyRegions ||
    (row.bodyArea ? [row.bodyArea] : row.muscle ? [row.muscle] : []);
  d.achillesPurpose = row.achillesPurpose
    ? known(row.achillesPurpose)
    : d.achillesPurpose;
  // Existing logging fields establish metrics, never a new clinical classification.
  const fields = (row.loggingFields || []).map((f) => f.key);
  if (fields.length)
    d.supportedMetrics = [
      "reps",
      "load",
      "duration",
      "distance",
      "rest",
      "steps",
      "contacts",
    ].filter((k) => fields.includes(k));
  return d;
}
const catalogDefinitions = [...sources.values()].map(projectDefinition);
export const DEFINITIONS = [...catalogDefinitions,...GUIDE_PHASES.filter(p=>p.domain).flatMap(p=>guideDefinitions(p,catalogDefinitions))];
export function starterTemplates() {
  // No user readiness input or eligibility filtering. These are the existing base
  // templates projected as editable examples, not individually selected workouts.
  const structures = ["A", "B", "C"].map((k) =>
    strengthTemplate(k, {}, "hybrid"),
  );
  structures.push(strengthTemplate("B", {}, "conditioning"));
  const result = structures.flatMap((w) =>
    [false, true].map((short) => {
      const items = sessionItemsForDisplay(w.items, {}, short);
      const t = copyIntent(
        adaptSession({
          id: "starter-" + w.id + "-" + w.title + "-" + short,
          plannedItems: items,
        }),
        "curated-" + w.title + "-" + short,
        w.title + (short ? " · Essential" : " · Full"),
      );
      t.source = "curated";
      if (w.sessionFormat === "rehab-conditioning")
        t.curatedProgram = {
          sessionFormat: w.sessionFormat,
          templateVersion: w.templateVersion,
        };
      t.notes = w.notes.join("\n");
      t.groups = [];
      t.occurrences.forEach((o, i) => {
        const row = items[i];
        // Existing warm-up variants explicitly supply their canonical illustration identity.
        const canonical = sources.get(row.illustrationId || row.id);
        o.definitionSnapshot = projectDefinition(canonical || row);
        o.exerciseDefinitionId = o.definitionSnapshot.id;
        if (row.block?.startsWith("Circuit")) {
          let g = t.groups.find((g) => g.name === row.block);
          if (!g) {
            g = {
              id: `${t.id}:${row.block}`,
              name: row.block,
              kind: "circuit",
              rounds: Number(row.sets),
            };
            t.groups.push(g);
          }
          o.groupId = g.id;
        }
      });
      return t;
    }),
  );
  for (const r of MOVEMENT_ROUTINES) {
    const t = emptyIntent(r.name);
    t.id = `curated-movement-${r.routineId}`;
    t.source = "curated";
    t.occurrences = r.steps.map((step, order) => ({
      ...occurrence(
        projectDefinition(
          sources.get(step.exerciseId) || {
            id: step.exerciseId,
            name: step.name,
            equipment: step.equipment,
          },
        ),
      ),
      order,
      targetDescription: known(step.defaultDose),
    }));
    result.push(t);
  }
  return result;
}
