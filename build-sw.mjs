import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const root = new URL("../dist/", import.meta.url);
async function list(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? list(join(directory, entry.name), `${prefix}${entry.name}/`)
        : [`${prefix}${entry.name}`],
    ),
  );
  return files.flat().filter((file) => file !== "sw.js");
}
const files = (await list(fileURLToPath(root))).sort();
const hash = createHash("sha256");
for (const file of files) hash.update(await readFile(new URL(file, root)));
const template = await readFile(new URL("../sw.js", import.meta.url), "utf8");
hash.update(template);
await writeFile(
  new URL("sw.js", root),
  template
    .replace("__BUILD_ID__", hash.digest("hex").slice(0, 12))
    .replace(
      "__CORE_ASSETS__",
      JSON.stringify(["./", ...files.map((file) => `./${file}`)]),
    ),
);
console.log(`Service worker precaches ${files.length} production files.`);
