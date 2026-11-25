import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Guarantees csp-hashes.json exists before `next build` compiles proxy.ts,
 * which statically imports it. Real hashes are written by build-csp-hashes.ts
 * after the first build pass; this only seeds an empty manifest for fresh clones.
 */
const target = join(process.cwd(), "csp-hashes.json");
if (!existsSync(target)) {
  writeFileSync(target, JSON.stringify({ routes: {}, fallback: [] }, null, 2) + "\n");
  console.log("csp-hashes.json: seeded empty manifest (run the full build to populate)");
}
