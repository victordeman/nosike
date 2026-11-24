import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import type {
  CareerRole,
  EducationEntry,
  EditorialRole,
  Honour,
  Mentorship,
  PolicyRole,
  ProceedVolume,
  Profile,
  Publication,
  Talk,
} from "../src/lib/schemas.ts";
import { apaCitation } from "../src/lib/scholarship-core.ts";

/**
 * Public CV PDF (SPEC Phase 6): regenerated with `npm run cv:pdf`.
 * Built only from approved content JSON — never from _sources — and excludes
 * all SPEC §2.1 items (no phone numbers, personal email addresses, birth dates,
 * family details or referee contacts).
 */

const root = process.cwd();
const read = <T>(name: string): T => JSON.parse(readFileSync(join(root, "content", name), "utf8")) as T;

const profile = read<Profile>("profile.json");
const career = read<CareerRole[]>("career.json");
const education = read<EducationEntry[]>("education.json");
const honours = read<Honour[]>("honours.json").filter((h) => h.status === "approved");
const publications = read<Publication[]>("publications.json");
const editorial = read<EditorialRole[]>("editorial.json");
const policy = read<PolicyRole[]>("policy.json").filter((p) => p.status === "approved");
const mentorship = read<Mentorship[]>("mentorship.json").filter((m) => m.status !== "pending");
const talks = read<Talk[]>("talks.json").filter((t) => t.status === "verified");
const proceedings = read<ProceedVolume[]>("proceedings.json").filter((p) => p.status !== "pending");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nosike-eight.vercel.app";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** apaCitation marks italics with *…*; the PDF renders them as <em>. */
const rich = (s: string) => esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");

const KIND_ORDER: Record<string, number> = {
  book: 0,
  monograph: 1,
  "book-chapter": 2,
  "journal-article": 3,
  "conference-paper": 4,
  report: 5,
  thesis: 6,
  lecture: 7,
  unpublished: 8,
};

const KIND_LABEL: Record<string, string> = {
  book: "Book",
  monograph: "Monograph",
  "book-chapter": "Book chapter",
  "journal-article": "Journal article",
  "conference-paper": "Conference paper",
  report: "Report",
  thesis: "Thesis",
  lecture: "Lecture",
  unpublished: "Unpublished",
};

function yearOf(p: Publication): number {
  return p.year ?? -1;
}

const sortedPubs = [...publications].sort(
  (a, b) => (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9) || yearOf(b) - yearOf(a),
);

const careerLines = career
  .filter((c) => c.verified !== false)
  .map((c) => {
    const dates = `${c.dates.start} – ${c.dates.end === "present" ? "present" : c.dates.end}`;
    const subs = c.subRoles?.length ? `<div class="sub">${c.subRoles.map(esc).join("; ")}</div>` : "";
    return `<li><div class="when">${esc(dates)}</div><div><strong>${esc(c.title)}</strong><br/><span class="muted">${esc(c.institution)}${c.place ? `, ${esc(c.place)}` : ""}</span>${subs}</div></li>`;
  })
  .join("\n");

const eduLines = education
  .map(
    (e) =>
      `<li><div class="when">${esc(e.dates ?? "")}</div><div><strong>${esc(e.qualification)}</strong><br/><span class="muted">${esc(e.institution)}${e.place ? `, ${esc(e.place)}` : ""}</span>${
        e.notes?.length ? `<div class="sub">${e.notes.map(esc).join("; ")}</div>` : ""
      }</div></li>`,
  )
  .join("\n");

const honourLines = honours
  .map((h) => `<li><div class="when">${h.year ?? ""}</div><div>${esc(h.title)}${h.issuer ? ` — ${esc(h.issuer)}` : ""}</div></li>`)
  .join("\n");

const pubGroups = new Map<string, Publication[]>();
for (const p of sortedPubs) {
  const label = KIND_LABEL[p.kind] ?? p.kind;
  const arr = pubGroups.get(label) ?? [];
  arr.push(p);
  pubGroups.set(label, arr);
}
const plural = (label: string): string =>
  ({ Thesis: "Theses", Unpublished: "Unpublished work" })[label] ?? `${label}s`;

const pubSections = [...pubGroups.entries()]
  .map(
    ([label, pubs]) =>
      `<h3>${esc(plural(label))}</h3><ol class="pubs">${pubs
        .map((p) => `<li>${rich(apaCitation(p, profile))}</li>`)
        .join("\n")}</ol>`,
  )
  .join("\n");

const editorialLines = editorial
  .map((e) => {
    const role = e.detail ?? e.role.replace(/-/g, " ");
    return `<li><div class="when"></div><div><strong>${esc(e.journal)}</strong><br/><span class="muted">${esc(role)}</span></div></li>`;
  })
  .join("\n");

const policyLines = policy
  .map(
    (p) =>
      `<li><div class="when">${esc(p.period ?? "")}</div><div><strong>${esc(p.role)}</strong><br/><span class="muted">${esc(p.organisation)}${p.detail ? ` — ${esc(p.detail)}` : ""}</span></div></li>`,
  )
  .join("\n");

const mentorshipLines = mentorship
  .map((m) => `<li><div class="when"></div><div><strong>${esc(m.topic)}</strong><br/><span class="muted">${esc(m.role)}${m.detail ? ` — ${esc(m.detail)}` : ""}</span></div></li>`)
  .join("\n");

const talkLines = talks
  .map((t) => `<li><div class="when">${esc(t.date)}</div><div><strong>${esc(t.title)}</strong><br/><span class="muted">${esc(t.venue)}</span></div></li>`)
  .join("\n");

const proceedingsLines = proceedings
  .map(
    (p) =>
      `<li><div class="when"></div><div><strong>${esc(p.fullTitle ?? p.title)}</strong><br/><span class="muted">${esc(p.dates)} · ${esc(p.venue)} · ${esc(p.publisher)} · ${p.pages} pp${
        p.identifiers.length ? ` · ${p.identifiers.map(esc).join(" · ")}` : ""
      } · ${esc(p.role)}</span></div></li>`,
  )
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Curriculum Vitae — ${esc(profile.displayName)}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #14213d; font-size: 10.5pt; line-height: 1.45; margin: 0; }
  h1 { font-size: 20pt; margin: 0 0 2mm; color: #14213d; }
  h2 { font-size: 12pt; text-transform: uppercase; letter-spacing: 0.08em; color: #1f5135; border-bottom: 1.5px solid #7a5c17; padding-bottom: 1mm; margin: 7mm 0 3mm; }
  h3 { font-size: 10.5pt; color: #14213d; margin: 4mm 0 1.5mm; }
  p { margin: 0 0 2mm; }
  .sub { font-size: 9pt; color: #4a5568; margin-top: 0.5mm; }
  .muted { color: #4a5568; }
  ul, ol { margin: 0 0 2mm; padding-left: 5mm; }
  li { margin-bottom: 1.6mm; }
  .pubs { list-style: none; padding-left: 0; }
  .pubs li { margin-bottom: 1.2mm; padding-left: 4mm; text-indent: -4mm; }
  .contact { color: #4a5568; font-size: 9.5pt; margin-bottom: 4mm; }
  .roles { columns: 2; column-gap: 8mm; }
  .roles li { break-inside: avoid; }
  .entry-list { list-style: none; padding-left: 0; }
  .entry-list li { display: flex; gap: 4mm; margin-bottom: 1.6mm; break-inside: avoid; }
  .entry-list li > div:first-child { flex: 0 0 26mm; color: #7a5c17; font-size: 9pt; }
  .entry-list li > div:last-child { flex: 1; }
  .footer { margin-top: 8mm; padding-top: 2mm; border-top: 1px solid #ddd7ca; color: #4a5568; font-size: 8.5pt; }
</style>
</head>
<body>
  <h1>${esc(profile.displayName)}</h1>
  <p class="contact">${esc(profile.positioningLine)} · Website: ${esc(siteUrl)}</p>

  <h2>Profile</h2>
  <p>${esc(profile.positioningLine)}.</p>
  <p><strong>Research interests:</strong> ${profile.researchInterests.map(esc).join("; ")}.</p>
  <p><strong>Languages:</strong> ${profile.languages.map(esc).join(", ")}.</p>

  <h2>Current roles</h2>
  <ul class="roles">${profile.currentRoles.map((r) => `<li>${esc(r)}</li>`).join("\n")}</ul>

  <h2>Career</h2>
  <ul class="entry-list">
${careerLines}
  </ul>

  <h2>Education</h2>
  <ul class="entry-list">
${eduLines}
  </ul>

  <h2>Honours and awards</h2>
  <ul class="entry-list">
${honourLines}
  </ul>

  <h2>Publications</h2>
${pubSections}

  <h2>Editorial roles</h2>
  <ul class="entry-list">
${editorialLines}
  </ul>

  <h2>Policy and advisory</h2>
  <ul class="entry-list">
${policyLines}
  </ul>

  <h2>Mentorship</h2>
  <p>Completed supervision: 12 PhD and 38 Master’s candidates; current supervision: 4 PhD and 7 Master’s candidates.</p>
  <ul class="entry-list">
${mentorshipLines}
  </ul>

  <h2>Selected talks</h2>
  <ul class="entry-list">
${talkLines}
  </ul>

  <h2>Proceedings edited</h2>
  <ul class="entry-list">
${proceedingsLines}
  </ul>

  <div class="footer">
    Public edition of the curriculum vitae of ${esc(profile.formalName)}. Personal contact details are
    deliberately excluded; enquiries are handled through the website contact form (${esc(siteUrl)}).
  </div>
</body>
</html>`;

const outDir = join(root, "public", "cv");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, "Nosike-CV-public.pdf");

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({ path: outFile, format: "A4", printBackground: true });
} finally {
  await browser.close();
}

mkdirSync(join(root, "tmp"), { recursive: true });
writeFileSync(join(root, "tmp", "Nosike-CV-public.html"), html);
console.log(`Wrote ${outFile}`);
