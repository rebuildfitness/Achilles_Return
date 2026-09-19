import { validateMeasurement } from "../data/measurements.js";
import { validateMovement } from "../data/movement.js";
export const VERSIONS = Object.freeze({
  appVersion: "1.12.0",
  databaseVersion: 2,
  rulesetVersion: "1.1.0",
  exerciseLibraryVersion: "1.2.0",
  evidenceCatalogVersion: "1.0.0",
});
export const STORE_NAMES = [
  "profile",
  "checkins",
  "sessions",
  "assessments",
  "capabilityStates",
  "decisions",
  "settings",
];
export function migrateDatabase(db, oldVersion) {
  const steps = [
    ["profile", "checkins", "sessions", "assessments"],
    ["capabilityStates", "decisions", "settings"],
  ];
  steps.forEach((stores, index) => {
    if (oldVersion < index + 1)
      for (const name of stores)
        if (!db.objectStoreNames.contains(name))
          db.createObjectStore(name, { keyPath: "id" });
  });
}
// Pure validation/migration: preserve all original records and historical versions.
export function migrateBackup(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Invalid backup.");
  const version = input.schemaVersion ?? input.version;
  if (![1, 2].includes(version))
    throw new Error("Unsupported backup schema version.");
  for (const name of STORE_NAMES) {
    const required =
      version === 2 ||
      ["profile", "checkins", "sessions", "assessments"].includes(name);
    if (required && !Array.isArray(input[name]))
      throw new Error(`Missing backup store: ${name}`);
    if (
      input[name] !== undefined &&
      (!Array.isArray(input[name]) ||
        input[name].some((row) => !row || typeof row.id !== "string"))
    )
      throw new Error(`Invalid records in ${name}`);
    const rows = input[name] || [];
    if (new Set(rows.map((row) => row.id)).size !== rows.length)
      throw new Error(`Duplicate record IDs in ${name}`);
    for (const row of rows) {
      if (row.measurementRecordVersion !== undefined) {
        if (row.measurementRecordVersion !== 1) throw new Error("Unsupported measurement version.");
        validateMeasurement(row, "9999-12-31");
      }
      if (row.movementRecordSchemaVersion !== undefined) validateMovement(row);
      if (
        row.values !== undefined &&
        (!row.values ||
          typeof row.values !== "object" ||
          Array.isArray(row.values))
      )
        throw new Error(`Invalid measurements in ${name}`);
      if (
        row.date !== undefined &&
        (typeof row.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(row.date))
      )
        throw new Error(`Invalid date in ${name}`);
      if (
        row.createdAt !== undefined &&
        (typeof row.createdAt !== "string" ||
          !Number.isFinite(Date.parse(row.createdAt)))
      )
        throw new Error(`Invalid timestamp in ${name}`);
      if (
        name === "profile" &&
        row.equipment !== undefined &&
        !Array.isArray(row.equipment)
      )
        throw new Error("Invalid equipment list");
      if (
        name === "sessions" &&
        row.exerciseLog !== undefined &&
        (!row.exerciseLog ||
          typeof row.exerciseLog !== "object" ||
          Array.isArray(row.exerciseLog) ||
          Object.values(row.exerciseLog).some(
            (entry) => !entry || !Array.isArray(entry.sets),
          ))
      )
        throw new Error("Invalid set log");
    }
  }
  return {
    ...input,
    schemaVersion: 2,
    ...Object.fromEntries(STORE_NAMES.map((name) => [name, input[name] || []])),
  };
}
