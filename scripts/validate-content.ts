/** Validates every file in content/ against its Zod schema; run as part of `npm run build`. */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
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
if (failures) process.exit(1);
console.log("All content files validate.");
