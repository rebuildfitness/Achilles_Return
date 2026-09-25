// Sidecar preserves undefined fields/sparse slots through the existing JSON download UI.
// No record keys are reserved for encoding; paths are stored outside the records.
export function encodeBackup(input) {
  const special = [],
    seen = new Set();
  function visit(x, path) {
    if (x === undefined) {
      special.push({ path, type: "undefined" });
      return null;
    }
    if (x === null || typeof x === "string" || typeof x === "boolean") return x;
    if (typeof x === "number") {
      if (!Number.isFinite(x)) throw new Error("Cannot export nonfinite data");
      return x;
    }
    if (x instanceof Date) {
      special.push({ path, type: "date" });
      return x.toISOString();
    }
    if (typeof x !== "object" || seen.has(x))
      throw new Error("Cannot export nonportable/cyclic data");
    seen.add(x);
    let result;
    if (Array.isArray(x))
      result = Array.from({ length: x.length }, (_, i) => {
        if (!Object.hasOwn(x, i)) {
          special.push({ path: [...path, i], type: "hole" });
          return null;
        }
        return visit(x[i], [...path, i]);
      });
    else {
      if (Object.getPrototypeOf(x) !== Object.prototype)
        throw new Error("Cannot export unsupported object");
      result = {};
      for (const [key, v] of Object.entries(x)) {
        if (["__proto__", "constructor", "prototype"].includes(key))
          throw new Error("Unsafe backup key");
        result[key] = visit(v, [...path, key]);
      }
    }
    seen.delete(x);
    return result;
  }
  const payload = visit(input, []);
  payload.serialization = { version: 1, special };
  return payload;
}
export function decodeBackup(input) {
  const result = structuredClone(input);
  if (!result?.serialization) return result;
  if (
    result.serialization.version !== 1 ||
    !Array.isArray(result.serialization.special)
  )
    throw new Error("Unsupported backup encoding");
  const seen = new Set();
  for (const entry of result.serialization.special) {
    if (
      !entry ||
      !Array.isArray(entry.path) ||
      !entry.path.length ||
      !["undefined", "date", "hole"].includes(entry.type)
    )
      throw new Error("Invalid backup encoding");
    const key = JSON.stringify(entry.path);
    if (seen.has(key)) throw new Error("Duplicate backup path");
    seen.add(key);
    let target = result;
    for (const part of entry.path.slice(0, -1)) {
      if (
        !["string", "number"].includes(typeof part) ||
        ["__proto__", "constructor", "prototype", "serialization"].includes(
          part,
        ) ||
        !target ||
        !Object.hasOwn(target, part)
      )
        throw new Error("Invalid backup path");
      target = target[part];
    }
    const last = entry.path.at(-1);
    if (
      !["string", "number"].includes(typeof last) ||
      ["__proto__", "constructor", "prototype", "serialization"].includes(
        last,
      ) ||
      !target ||
      !Object.hasOwn(target, last)
    )
      throw new Error("Invalid backup path");
    if (entry.type === "date") {
      if (
        typeof target[last] !== "string" ||
        !Number.isFinite(Date.parse(target[last]))
      )
        throw new Error("Invalid encoded date");
      target[last] = new Date(target[last]);
    } else {
      if (target[last] !== null) throw new Error("Invalid encoded placeholder");
      if (entry.type === "hole") {
        if (!Array.isArray(target)) throw new Error("Invalid sparse slot");
        delete target[last];
      } else target[last] = undefined;
    }
  }
  delete result.serialization;
  return result;
}
