import { BASELINE_SECTIONS, validateSection } from "./baseline.js";
const original = (id) => {
  const section = BASELINE_SECTIONS.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown baseline section: ${id}`);
  return section;
};
const pick = (id, keys) => ({
  ...original(id),
  fields: original(id).fields.filter((f) => keys.includes(f.id)),
});
export const SIMPLE_SAFETY = original("safety");
export const SIMPLE_FUNCTION = {
  ...original("function"),
  title: "Everyday movement",
  fields: [
    ...pick("function", ["noDailyPain", "noRehabPain", "function_5"]).fields,
    ...pick("confidence", [
      "psychReady",
      "confidence_run",
      "confidence_basketball",
    ]).fields,
  ],
};
export const SIMPLE_TESTS = [
  original("bilateral"),
  pick("heelrise", [
    "heel_uninvolved_reps",
    "heel_repaired_reps",
    "heelQuality",
    "heelStop",
  ]),
  pick("balance", [
    "balance_uninvolved_seconds",
    "balance_repaired_seconds",
    "goodBalance",
  ]),
];
export const SIMPLE_SCHEDULE = pick("schedule", ["availableDays"]);
export function validateSimpleBaseline(values) {
  const required = [SIMPLE_SAFETY, SIMPLE_FUNCTION, SIMPLE_SCHEDULE];
  // Optional detail values still receive their original numeric validation.
  return [
    ...new Set([
      ...required.flatMap((s) => validateSection(s, values)),
      ...BASELINE_SECTIONS.flatMap((s) =>
        validateSection(
          { ...s, fields: s.fields.map((f) => ({ ...f, required: false })) },
          values,
        ),
      ),
    ]),
  ];
}
