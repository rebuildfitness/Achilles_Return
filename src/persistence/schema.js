import { decodeBackup } from "./v2BackupCodec.js";
import { V2_STORES, validateV2 } from "./v2Validation.js";
import { validateMeasurement } from "../data/measurements.js";
import { validateMovement } from "../data/movement.js";
export const VERSIONS = Object.freeze({
  appVersion: "1.13.0",
  databaseVersion: 3,
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
export const ALL_STORE_NAMES = [...STORE_NAMES, ...V2_STORES];
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
  if (oldVersion < 3)
    for (const name of V2_STORES) {
      const store = db.createObjectStore(name, { keyPath: "id" });
      if (name === "v2WorkoutSessions") {
        store.createIndex("lifecycle", "lifecycle");
        store.createIndex("date", "date.value");
        store.createIndex("legacyKey", "legacyKey", { unique: true });
      }
      if (name === "v2PlannedWorkouts") store.createIndex("date", "date");
      if (name === "v2Observations")
        store.createIndex("sessionId", "sessionId");
    }
}
// Pure validation/migration: preserve all original records and historical versions.
export function migrateBackup(input) {
  input = decodeBackup(input);
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Invalid backup.");
  const version = input.schemaVersion ?? input.version;
  if (![1, 2, 3].includes(version))
    throw new Error("Unsupported backup schema version.");
  for (const name of STORE_NAMES) {
    const required =
      version >= 2 ||
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
        if (row.measurementRecordVersion !== 1)
          throw new Error("Unsupported measurement version.");
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
  for (const store of V2_STORES) {
    if (version < 3 && input[store] !== undefined)
      throw new Error("V2 stores require backup schema 3");
    if (version === 3) {
      if (!Array.isArray(input[store]))
        throw new Error(`Missing backup store: ${store}`);
      input[store].forEach((row) => validateV2(store, row));
      if (
        new Set(input[store].map((row) => row.id)).size !== input[store].length
      )
        throw new Error("Duplicate V2 record IDs");
    }
  }
  return {
    ...input,
    schemaVersion: version === 3 ? 3 : 2,
    ...Object.fromEntries(
      (version === 3 ? ALL_STORE_NAMES : STORE_NAMES).map((name) => [
        name,
        input[name] || [],
      ]),
    ),
  };
}
