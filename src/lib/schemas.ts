import { z } from "zod";

/** Every record must say where it came from; `verified` is set only after the client confirms it. */
const provenance = { source: z.string().min(1), verified: z.boolean().optional() };

const dateRange = z.object({ start: z.string().regex(/^\d{4}$/), end: z.string().regex(/^\d{4}$|present$/) });

export const profileSchema = z.object({
  displayName: z.string(),
  formalName: z.string(),
  authorName: z.string(),
  role: z.string(),
  currentRoles: z.array(z.string()),
  positioningLine: z.string(),
  bioShort: z.string().optional(),
  bioLong: z.string().optional(),
  researchInterests: z.array(z.string()),
  languages: z.array(z.string()),
  values: z.array(z.string()),
  affiliatedInstitution: z.string(),
  ...provenance,
});
export type Profile = z.infer<typeof profileSchema>;

export const careerRoleSchema = z.object({
  id: z.string(),
  institution: z.string(),
  place: z.string(),
  country: z.string(),
  dates: dateRange,
  title: z.string(),
  subRoles: z.array(z.string()),
  kind: z.enum(["academic", "visiting", "pre-academic"]),
  sourceNote: z.string().optional(),
  ...provenance,
});
export const careerSchema = z.array(careerRoleSchema);
export type CareerRole = z.infer<typeof careerRoleSchema>;

export const educationEntrySchema = z.object({
  id: z.string(),
  level: z.enum(["doctoral", "masters", "postgraduate", "foundation", "professional"]),
  qualification: z.string(),
  field: z.string().optional(),
  institution: z.string(),
  place: z.string(),
  dates: z.string().optional(),
  notes: z.array(z.string()),
  ...provenance,
});
export const educationSchema = z.array(educationEntrySchema);
export type EducationEntry = z.infer<typeof educationEntrySchema>;

export const honourSchema = z.object({
  id: z.string(),
  title: z.string(),
  year: z.string().nullable(),
  issuer: z.string().optional(),
  status: z.enum(["approved", "pending", "omit"]),
  ...provenance,
});
export const honoursSchema = z.array(honourSchema);
export type Honour = z.infer<typeof honourSchema>;

export const membershipSchema = z.object({ name: z.string(), body: z.string().optional(), ...provenance });
export const membershipsSchema = z.array(membershipSchema);
export type Membership = z.infer<typeof membershipSchema>;

export const editorialRoleSchema = z.object({
  id: z.string(),
  role: z.enum([
    "editor-in-chief",
    "editor",
    "chair",
    "managing-editor",
    "secretary",
    "consulting-editor",
    "founding-president",
    "member",
  ]),
  journal: z.string(),
  detail: z.string().optional(),
  ...provenance,
});
export const editorialSchema = z.array(editorialRoleSchema);
export type EditorialRole = z.infer<typeof editorialRoleSchema>;

export const conferenceSchema = z.object({
  id: z.string(),
  code: z.string().optional(),
  name: z.string(),
  dates: z.string(),
  venue: z.string(),
  role: z.string(),
  status: z.enum(["verified", "pending"]),
  ...provenance,
});
export const conferencesSchema = z.array(conferenceSchema);
export type Conference = z.infer<typeof conferenceSchema>;

export const policyRoleSchema = z.object({
  id: z.string(),
  organisation: z.string(),
  role: z.string(),
  period: z.string().optional(),
  detail: z.string().optional(),
  status: z.enum(["approved", "pending"]),
  ...provenance,
});
export const policySchema = z.array(policyRoleSchema);
export type PolicyRole = z.infer<typeof policyRoleSchema>;

export const mentorshipSchema = z.object({
  id: z.string(),
  topic: z.string(),
  role: z.string(),
  detail: z.string().optional(),
  status: z.enum(["approved", "pending"]).default("approved"),
  ...provenance,
});
export const mentorshipSchemaList = z.array(mentorshipSchema);
export type Mentorship = z.infer<typeof mentorshipSchema>;

export const countrySchema = z.object({
  name: z.string(),
  code: z.string().length(2),
  roles: z.array(z.enum(["academic-appointment", "study", "events", "consultancy"])),
  ...provenance,
});
export const countriesSchema = z.array(countrySchema);
export type Country = z.infer<typeof countrySchema>;

export const talkSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  venue: z.string(),
  kind: z.enum(["lecture", "conference", "talk", "presentation"]),
  abstract: z.string().optional(),
  status: z.enum(["verified", "pending"]),
  ...provenance,
});
export const talksSchema = z.array(talkSchema);
export type Talk = z.infer<typeof talkSchema>;

export const committeeSchema = z.object({
  name: z.string().min(3),
  ...provenance,
});
export const committeesSchema = z.array(committeeSchema);
export type Committee = z.infer<typeof committeeSchema>;

export const proceedVolumeSchema = z.object({
  code: z.string(),
  title: z.string(),
  fullTitle: z.string().optional(),
  dates: z.string(),
  venue: z.string(),
  publisher: z.string(),
  pages: z.number(),
  role: z.string(),
  identifiers: z.array(z.string()),
  papers: z.array(z.object({ title: z.string(), coAuthors: z.array(z.string()).default([]) })),
  proceedingsPdfUrl: z.string().optional(),
  status: z.enum(["verified", "pending"]),
  ...provenance,
});
export const proceedingsSchema = z.array(proceedVolumeSchema);
export type ProceedVolume = z.infer<typeof proceedVolumeSchema>;

const publicationBase = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  year: z.number().int().min(1900).max(2100).nullable(),
  source: z.string().min(1),
  verified: z.boolean().optional(),
});
export const bookPublicationSchema = publicationBase.extend({
  kind: z.literal("book"),
  publisher: z.string().optional(),
  place: z.string().optional(),
  isbn: z.string().optional(),
  role: z.enum(["author", "editor", "unknown"]).default("unknown"),
});
export const articlePublicationSchema = publicationBase.extend({
  kind: z.enum([
    "journal-article",
    "book-chapter",
    "conference-paper",
    "monograph",
    "report",
    "thesis",
    "lecture",
    "working-paper",
    "unpublished",
  ]),
  venue: z.string().optional(),
  editors: z.array(z.string()).optional(),
  publisher: z.string().optional(),
  place: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  isbn: z.string().optional(),
  issn: z.string().optional(),
});
export const publicationSchema = z.discriminatedUnion("kind", [bookPublicationSchema, articlePublicationSchema]);
export const publicationsSchema = z.array(publicationSchema);
export type BookPublication = z.infer<typeof bookPublicationSchema>;
export type ArticlePublication = z.infer<typeof articlePublicationSchema>;
export type Publication = z.infer<typeof publicationSchema>;

export const imageSchema = z.object({
  id: z.string(),
  file: z.string().regex(/^[\w-]+$/),
  widths: z.array(z.number().int()),
  width: z.number().int(),
  height: z.number().int(),
  focalX: z.number().min(0).max(1),
  focalY: z.number().min(0).max(1),
  alt: z.string().min(10),
  role: z.enum(["hero", "regalia", "gallery", "about", "talks", "excluded"]),
  galleryCategory: z.enum(["portraits", "academic", "engagements"]).optional(),
  sourceFile: z.string(),
});
export const imagesSchema = z.array(imageSchema);
export type ImageRecord = z.infer<typeof imageSchema>;
