/** Validates every file in content/ against its Zod schema; run as part of `npm run build`. */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
  careerSchema,
  conferencesSchema,
  countriesSchema,
  editorialSchema,
  educationSchema,
  honoursSchema,
  imagesSchema,
  membershipsSchema,
  mentorshipSchemaList,
  policySchema,
  proceedingsSchema,
  profileSchema,
  publicationsSchema,
  talksSchema,
  committeesSchema,
} from "../src/lib/schemas.ts";

const DIR = join(process.cwd(), "content");

const FILES: Record<string, { parse: (d: unknown) => unknown }> = {
  "profile.json": profileSchema,
  "career.json": careerSchema as unknown as { parse: (d: unknown) => unknown },
  "education.json": educationSchema,
  "honours.json": honoursSchema,
  "memberships.json": membershipsSchema,
  "editorial.json": editorialSchema,
  "conferences.json": conferencesSchema,
  "policy.json": policySchema,
  "mentorship.json": mentorshipSchemaList,
  "countries.json": countriesSchema,
  "talks.json": talksSchema,
  "committees.json": committeesSchema,
  "themes.json": z.object({
    themes: z.array(z.object({ id: z.string(), label: z.string(), keywords: z.array(z.string()) })),
  }),
  "proceedings.json": proceedingsSchema,
  "publications.json": publicationsSchema,
  "images.json": imagesSchema,
};

let failures = 0;
for (const [file, schema] of Object.entries(FILES)) {
  const path = join(DIR, file);
  try {
    const data: unknown = JSON.parse(readFileSync(path, "utf8"));
    schema.parse(data);
    console.log(`content OK: ${file}`);
  } catch (err) {
    failures++;
    console.error(`content INVALID: ${file}`);
    console.error(err instanceof Error ? err.message : err);
  }
}
const extras = readdirSync(DIR).filter((f) => f.endsWith(".json") && !(f in FILES));
if (extras.length) {
  failures++;
  console.error(`content files without schema: ${extras.join(", ")}`);
}

// Prose biographies: front matter must carry the approval flag, and word limits from SPEC Phase 2 apply.
const BIOS: Array<{ file: string; maxWords: number }> = [
  { file: "bio-short.mdx", maxWords: 120 },
  { file: "bio-long.mdx", maxWords: 600 },
];
for (const { file, maxWords } of BIOS) {
  const path = join(DIR, file);
  try {
    // Normalise line endings so CRLF checkouts (e.g. Windows) validate the same as LF.
    const raw = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fm || !fm[1].split("\n").includes("approval: client approval pending"))
      throw new Error(`missing "approval: client approval pending" front matter`);
    const body = raw.replace(/^---\n[\s\S]*?\n---\n/, "");
    const words = body.trim().split(/\s+/).filter(Boolean).length;
    if (words > maxWords) throw new Error(`${words} words exceeds the ${maxWords}-word limit`);
    console.log(`content OK: ${file} (${words} words)`);
  } catch (err) {
    failures++;
    console.error(`content INVALID: ${file}`);
    console.error(err instanceof Error ? err.message : err);
  }
}
if (failures) process.exit(1);
console.log("All content files validate.");
