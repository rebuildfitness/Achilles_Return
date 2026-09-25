// Synthetic examples only. Does not open IndexedDB or inspect personal data.
import { writeFile, mkdir } from "node:fs/promises";
import { legacy } from "../tests/fixtures/v2/records.mjs";
import {
  adaptSession,
  adaptMovement,
  adaptRecovery,
} from "../src/domain/v2/adapters.ts";
const examples = Object.fromEntries(
  Object.entries(legacy).map(([name, v1]) => {
    const adapter =
      name === "recovery"
        ? adaptRecovery
        : ["movement", "routine"].includes(name)
          ? adaptMovement
          : adaptSession;
    return [name, { v1, v2: adapter(v1) }];
  }),
);
await mkdir(new URL("../artifacts/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../artifacts/v2-phase1-adapter-examples.json", import.meta.url),
  JSON.stringify(
    {
      notice:
        "Synthetic records only. JSON omits undefined properties; in-memory exact recovery is tested separately.",
      examples,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Wrote ${Object.keys(examples).length} before/after legacy examples.`,
);
