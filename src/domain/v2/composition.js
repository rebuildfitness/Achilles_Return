// Intent-only commands. Never call a planner, readiness gate or session logger.
import { adaptDefinition, copyIntent, value } from "./adapters.ts";
export const uid = () => crypto.randomUUID();
export const clone = structuredClone;
export const known = (v) => ({ state: "known", value: v });
export const blank = () => ({ state: "blank" });
export const display = (v) => (v?.state === "known" ? String(v.value) : "");
export const TRACKING = {
  "weighted-reps": ["reps", "load"],
  reps: ["reps"],
  time: ["duration"],
  "distance-time": ["distance", "duration"],
  "reps-time": ["reps", "duration"],
  intervals: ["duration", "distance"],
  "free-form": [],
};
export const CATEGORY_OPTIONS = [
  "Achilles Rehab",
  "Strength",
  "Hypertrophy",
  "Cardiovascular Training",
  "Mobility",
  "Flexibility",
  "Balance / Proprioception",
  "Core",
  "Power",
  "Plyometrics",
  "Walking",
  "Running",
  "Sprinting",
  "Acceleration",
  "Deceleration",
  "Change of Direction / Agility",
  "Basketball Conditioning",
  "Basketball Skill Exposure",
  "General Conditioning",
  "Recovery",
];
export function emptyIntent(name = "Untitled workout") {
  return {
    id: uid(),
    recordVersion: 1,
    revision: 1,
    name,
    categories: [],
    occurrences: [],
    source: "user",
    notes: "",
    groups: [],
  };
}
export function freshSet(type = "working") {
  return { id: uid(), order: 0, type: known(type), target: {}, intervals: [] };
}
export function occurrence(definition) {
  return {
    id: uid(),
    exerciseDefinitionId: definition.id,
    order: 0,
    block: blank(),
    definitionSnapshot: clone(definition),
    target: {},
    targetDescription: blank(),
    targetSetCount: known(1),
    sets: [freshSet()],
  };
}
function order(xs) {
  return xs.map((x, order) => ({ ...x, order }));
}
function move(xs, id, delta) {
  const from = xs.findIndex((x) => x.id === id),
    to = from + delta;
  if (from < 0 || to < 0 || to >= xs.length) return xs;
  const [x] = xs.splice(from, 1);
  xs.splice(to, 0, x);
  return order(xs);
}
function renew(o) {
  return {
    ...clone(o),
    id: uid(),
    sets: o.sets.map((s) => ({
      ...clone(s),
      id: uid(),
      intervals: s.intervals.map((b) => ({ ...clone(b), id: uid() })),
    })),
  };
}
export function copyTemplate(source, name = source.name) {
  // Explicit whitelist; extension fields must not bring historical data into intent.
  const t = emptyIntent(name),
    groupIds = new Map((source.groups || []).map((g) => [g.id, uid()]));
  t.categories = clone(source.categories);
  t.notes = source.notes || "";
  if (source.curatedProgram) t.curatedProgram = clone(source.curatedProgram);
  t.groups = (source.groups || []).map((g) => ({
    id: groupIds.get(g.id),
    name: g.name,
    kind: g.kind,
    rounds: g.rounds,
  }));
  t.occurrences = source.occurrences.map((o, i) => {
    const n = renew(o);
    n.order = i;
    if (o.groupId) n.groupId = groupIds.get(o.groupId);
    return n;
  });
  return t;
}
export function copyCompleted(session) {
  const safe = copyIntent(
    session,
    uid(),
    `${display(session.name) || "Previous workout"} — copy`,
  );
  // RPE from historical targets is deliberately not carried into the new intent.
  for (const o of safe.occurrences) {
    delete o.target.rpe;
    for (const s of o.sets) {
      delete s.target.rpe;
      for (const b of s.intervals) delete b.target.rpe;
    }
  }
  safe.occurrences.forEach((o, i) => {
    const src = session.occurrences[i];
    if (src.targetTrackingType !== undefined)
      o.targetTrackingType = src.targetTrackingType;
    if (src.groupId) o.groupId = src.groupId;
    o.sets.forEach((s, j) => {
      if (src.sets[j]?.repeatCount) s.repeatCount = src.sets[j].repeatCount;
      if (session.execution && src.sets[j]?.intervals.length) {
        const first = src.sets[j].intervals.filter((b) => b.repeat === 1);
        s.intervals = first.map((b, order) => ({
          id: uid(),
          order,
          kind: b.kind,
          target: clone(b.target),
        }));
      }
    });
  });
  const original =
    session.originalIntent?.state === "known"
      ? session.originalIntent.value
      : null;
  // Only reusable original-intent notes/groups, never finish notes.
  if (original?.groups) {
    safe.groups = clone(original.groups);
    safe.occurrences.forEach((o, i) => {
      if (
        !o.groupId &&
        original.occurrences?.[i]?.exerciseDefinitionId ===
          o.exerciseDefinitionId &&
        original.occurrences[i].groupId
      )
        o.groupId = original.occurrences[i].groupId;
    });
  }
  safe.notes = typeof original?.notes === "string" ? original.notes : "";
  return copyTemplate(safe);
}
export function newDraft(
  intent = emptyIntent(),
  date = new Date().toLocaleDateString("en-CA"),
) {
  return {
    id: uid(),
    recordVersion: 1,
    revision: 1,
    date,
    status: "planned",
    snapshot: copyTemplate(intent),
    composition: { version: 1, archived: false },
  };
}
export function fromTemplate(template, date) {
  return {
    ...newDraft(template, date),
    templateRef: { id: template.id, revision: template.revision },
  };
}
export function targetNumber(text, unit) {
  if (text === "") return { amount: blank(), unit: known(unit) };
  const n = Number(text);
  if (!Number.isFinite(n) || n < 0)
    throw new Error("Enter a nonnegative number or leave the target blank.");
  return { amount: known(n), unit: known(unit) };
}
export function tempo(parts) {
  if (parts.every((x) => x === "")) return blank();
  if (parts.length !== 4 || !parts.every((x) => /^(\d+(\.\d+)?|X)$/.test(x)))
    throw new Error("Tempo needs four values: seconds or X for explosive.");
  return known(parts.join("-"));
}
export function safeUrl(url) {
  try {
    const u = new URL(url);
    return ["https:", "http:"].includes(u.protocol) ? u.href : "";
  } catch {
    return "";
  }
}
/** @param {{name:string,categories?:string[],equipment?:string[],trackingType?:string,notes?:string,tags?:string[],demoUrl?:string}} input */
export function customDefinition({
  name,
  categories = [],
  equipment = [],
  trackingType = "reps",
  notes = "",
  tags = [],
  demoUrl = "",
}) {
  if (!name.trim()) throw new Error("Name your custom exercise.");
  if (!Object.hasOwn(TRACKING, trackingType))
    throw new Error("Choose a supported tracking type.");
  if (demoUrl && !safeUrl(demoUrl))
    throw new Error("Use an http or https demo URL.");
  return {
    ...adaptDefinition({
      id: uid(),
      name: name.trim(),
      origin: "custom",
      categories,
      equipment,
      trackingType,
      supportedMetrics: TRACKING[trackingType],
      notes,
      tags,
      ...(demoUrl ? { demoUrl: safeUrl(demoUrl) } : {}),
    }),
    recordVersion: 1,
    revision: 1,
    archived: false,
  };
}
export function compose(intent, command) {
  const t = clone(intent),
    { type, id, setId } = command;
  const o = t.occurrences.find((x) => x.id === id),
    s = o?.sets.find((x) => x.id === setId);
  if (type === "add") t.occurrences.push(occurrence(command.definition));
  else if (type === "duplicate") {
    if (!o) throw new Error("Exercise not found");
    t.occurrences.splice(t.occurrences.indexOf(o) + 1, 0, renew(o));
  } else if (type === "replace") {
    if (!o) throw new Error("Exercise not found");
    const n = occurrence(command.definition);
    n.groupId = o.groupId;
    t.occurrences[t.occurrences.indexOf(o)] = n;
  } else if (type === "remove")
    t.occurrences = t.occurrences.filter((x) => x.id !== id);
  else if (type === "move")
    t.occurrences = move(t.occurrences, id, command.delta);
  else if (type === "add-set") o.sets.push(freshSet());
  else if (type === "remove-set") o.sets = o.sets.filter((x) => x.id !== setId);
  else if (type === "move-set") o.sets = move(o.sets, setId, command.delta);
  else if (type === "set") Object.assign(s, command.patch);
  else if (type === "exercise") Object.assign(o, command.patch);
  else if (type === "name") t.name = command.name;
  else if (type === "notes") t.notes = command.notes;
  else if (type === "categories") t.categories = clone(command.categories);
  else if (type === "add-group")
    t.groups = [
      ...(t.groups || []),
      { id: uid(), name: command.name, kind: command.kind, rounds: 1 },
    ];
  else if (type === "group") {
    if (command.groupId) o.groupId = command.groupId;
    else delete o.groupId;
  } else if (type === "edit-group")
    Object.assign(
      t.groups.find((g) => g.id === command.groupId),
      command.patch,
    );
  else if (type === "remove-group") {
    t.groups = t.groups.filter((g) => g.id !== command.groupId);
    t.occurrences.forEach((x) => {
      if (x.groupId === command.groupId) delete x.groupId;
    });
  } else throw new Error("Unknown composition command");
  t.occurrences = order(t.occurrences).map((x) => ({
    ...x,
    sets: order(x.sets),
    targetSetCount: known(x.sets.length),
  }));
  return t;
}
export function filterDefinitions(definitions, search = "", filters = {}) {
  const words = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return definitions.filter(
    (d) =>
      !d.archived &&
      words.every((w) =>
        [
          display(d.name),
          ...d.aliases,
          ...(d.sourceMetadata.tags || []),
          display(d.setup),
        ]
          .join(" ")
          .toLowerCase()
          .includes(w),
      ) &&
      Object.entries(filters).every(
        ([key, query]) => !query || facet(d, key).includes(query),
      ),
  );
}
export const FILTERS = {
  categories: "Category",
  bodyRegions: "Body region",
  equipment: "Equipment",
  achillesPurpose: "Achilles purpose",
  movementPatterns: "Movement pattern",
  phaseAssociations: "Rehab association",
  demandLevel: "Demand level",
  laterality: "Laterality",
  physicalQualities: "Physical quality",
};
export function facet(d, key) {
  const raw = d[key],
    xs = Array.isArray(raw) ? raw : display(raw) ? [display(raw)] : [];
  return xs.length ? xs : ["Unspecified"];
}

// A format change must not conceal a target already entered by the user.
export function visibleTargetFields(o) {
  const format =
    o.targetTrackingType || display(o.definitionSnapshot.trackingType);
  const defaults =
    TRACKING[format] ||
    o.definitionSnapshot.supportedMetrics.filter(
      (m) => !["rpe", "rest"].includes(m),
    );
  const recorded = o.sets.flatMap((s) =>
    ["reps", "load", "duration", "distance", "steps", "contacts"].filter(
      (k) => s.target[k]?.amount.state === "known",
    ),
  );
  return [...new Set([...defaults, ...recorded])];
}
