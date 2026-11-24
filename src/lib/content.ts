import { readFileSync } from "node:fs";
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
  type CareerRole,
  type Conference,
  type Country,
  type EducationEntry,
  type Honour,
  type ImageRecord,
  type Membership,
  type Mentorship,
  type PolicyRole,
  type ProceedVolume,
  type Profile,
  type Publication,
  type Talk,
} from "./schemas";

const CONTENT_DIR = join(process.cwd(), "content");

function loadJson<T>(file: string, schema: { parse: (data: unknown) => T }): T {
  const raw = readFileSync(join(CONTENT_DIR, file), "utf8");
  return schema.parse(JSON.parse(raw));
}

export function getProfile(): Profile {
  return loadJson("profile.json", profileSchema);
}
export function getCareer(): CareerRole[] {
  return loadJson("career.json", careerSchema);
}
export function getEducation(): EducationEntry[] {
  return loadJson("education.json", educationSchema);
}
export function getHonours(): Honour[] {
  return loadJson("honours.json", honoursSchema);
}
export function getMemberships(): Membership[] {
  return loadJson("memberships.json", membershipsSchema);
}
export function getEditorial(): ReturnType<typeof editorialSchema.parse> {
  return loadJson("editorial.json", editorialSchema);
}
export function getConferences(): Conference[] {
  return loadJson("conferences.json", conferencesSchema);
}
export function getPolicy(): PolicyRole[] {
  return loadJson("policy.json", policySchema);
}
export function getMentorship(): Mentorship[] {
  return loadJson("mentorship.json", mentorshipSchemaList);
}
export function getCountries(): Country[] {
  return loadJson("countries.json", countriesSchema);
}
export function getTalks(): Talk[] {
  return loadJson("talks.json", talksSchema);
}
export function getProceedings(): ProceedVolume[] {
  return loadJson("proceedings.json", proceedingsSchema);
}
export function getPublications(): Publication[] {
  return loadJson("publications.json", publicationsSchema);
}
export function getImages(): ImageRecord[] {
  return loadJson("images.json", imagesSchema);
}

/** Publications sort by year descending; entries without a year sort last. */
export function sortPublications(pubs: Publication[]): Publication[] {
  return [...pubs].sort((a, b) => {
    if (a.year === null && b.year === null) return a.title.localeCompare(b.title);
    if (a.year === null) return 1;
    if (b.year === null) return -1;
    return b.year - a.year || a.title.localeCompare(b.title);
  });
}

export function filterPublications(
  pubs: Publication[],
  opts: { kind?: Publication["kind"]; decade?: number; query?: string },
): Publication[] {
  const q = opts.query?.trim().toLowerCase();
  return pubs.filter((p) => {
    if (opts.kind && p.kind !== opts.kind) return false;
    if (opts.decade !== undefined && (p.year === null || Math.floor(p.year / 10) * 10 !== opts.decade)) return false;
    const venue = "venue" in p ? (p.venue ?? "") : "";
    const publisher = "publisher" in p ? (p.publisher ?? "") : "";
    if (q && !`${p.title} ${venue} ${publisher}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function groupPublicationsByDecade(pubs: Publication[]): Array<{ decade: number | null; items: Publication[] }> {
  const groups = new Map<number | null, Publication[]>();
  for (const p of sortPublications(pubs)) {
    const decade = p.year === null ? null : Math.floor(p.year / 10) * 10;
    const list = groups.get(decade) ?? [];
    list.push(p);
    groups.set(decade, list);
  }
  return [...groups.entries()]
    .sort((a, b) => (a[0] === null ? 1 : b[0] === null ? -1 : b[0] - a[0]))
    .map(([decade, items]) => ({ decade, items }));
}

/** Career roles sorted newest first; "present" roles lead. */
export function sortCareer(roles: CareerRole[]): CareerRole[] {
  return [...roles].sort((a, b) => {
    const endA = a.dates.end === "present" ? 9999 : Number(a.dates.end);
    const endB = b.dates.end === "present" ? 9999 : Number(b.dates.end);
    return endB - endA || b.dates.start.localeCompare(a.dates.start);
  });
}

export function filterConferences(confs: Conference[], status?: Conference["status"]): Conference[] {
  return status ? confs.filter((c) => c.status === status) : confs;
}

export function sortEducation(entries: EducationEntry[]): EducationEntry[] {
  const levelOrder = { doctoral: 0, masters: 1, postgraduate: 2, foundation: 3, professional: 4 };
  return [...entries].sort((a, b) => levelOrder[a.level] - levelOrder[b.level] || a.id.localeCompare(b.id));
}

export function approvedHonours(honours: Honour[]): Honour[] {
  return honours.filter((h) => h.status === "approved");
}

export function verifiedCountries(countries: Country[]): Country[] {
  return countries.filter((c) => c.verified !== false);
}
