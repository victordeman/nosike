#!/usr/bin/env node
/**
 * Parses the Publications section of the CV docx into content/publications.json.
 * Dev tool: reads the raw CV from _sources/docs (never committed); output contains only
 * titles/venues/years — the privacy check gates it before commit.
 *
 *   node scripts/extract-cv.ts            # writes content/publications.json + prints a report
 *   node scripts/extract-cv.ts --check    # report only, do not write
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DOCX = join(ROOT, "_sources/docs/Prof_Austin_Nosike_Profile.docx");
const TXT = join(ROOT, "_sources/text/Prof_Austin_Nosike_Profile.docx.txt");
const OUT = join(ROOT, "content/publications.json");
const SOURCE = "Prof_Austin_Nosike_Profile.docx › PUBLICATIONS";
const FIXES: Array<[RegExp, string]> = [
  [/lmo State/g, "Imo State"],
  [/\blbadan\b/g, "Ibadan"],
  [/JournaL/g, "Journal"],
  [/Ref1ection/g, "Reflection"],
  // The docx glues "Perspectives on Globalization…" onto the previous ISBN, dropping its capital P.
  [/8482-5erspectives/g, "8482-5\u0000Perspectives"],
];

const PY = `
import json, sys, docx
d = docx.Document(sys.argv[1])
print(json.dumps([[p.text.replace("\\t", " ").strip(), p.style.name if p.style else ""] for p in d.paragraphs]))
`;

interface Para {
  text: string;
  style: string;
}

function readParagraphs(): Para[] {
  try {
    const out = execFileSync("python3", ["-c", PY, DOCX], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    return (JSON.parse(out) as Array<[string, string]>).map(([text, style]) => ({ text, style }));
  } catch {
    return readFileSync(TXT, "utf8")
      .split("\n")
      .map((l) => {
        const m = l.match(/^\[([^\]]+)\]\s?(.*)$/);
        return m ? { style: m[1], text: m[2].trim() } : { style: "", text: l.trim() };
      })
      .filter((p) => p.text);
  }
}

const clean = (s: string) => {
  let t = s.replace(/\s+/g, " ").trim();
  for (const [re, v] of FIXES) t = t.replace(re, v);
  return t;
};

const TITLE_YEAR = /(?:\((?:19|20)\d{2}\)|[\s,]+(?:19|20)\d{2})\.?$/;

// Words that typically begin the venue/publisher part of a citation.
const VENUE_WORD =
  "(?:International|African|Journal|Proceedings?|Press|Publishers?|Monograph|Report|Bulletin|Transactions|Review|Gazette|Annals|Acta|Studies|Letters|Research|Lectures?|Mimeograph|Memorandum|Project|Thesis|Colloquium|Symposium|Congress|Conference|Seminar|Workshop|Association|Institute|Centre|Center|University|Academy|Foundation|Network|Unpublished|Government|Ministry|Department|Office|Mission|Organisation|Organization|Committee|Panel|Trust|Charity|Group|Society|Club|Union|Council|Board|School|College|Polytechnic|Seminary|Cathedral|Mosque|Church|Hospital|Clinic|Bank|Insurance|Company|Corporation|Inc|Ltd|LLC|PLC|Corp|Co|GmbH|SARL|SA|NV|BV|AG|Oy|AB|AS|SpA|Srl|Pty|LLP|LP|LLC|Granada|Sevilla|Oviedo|Istanbul|Port Harcourt|Lagos|Owerri|Kaduna|Umuahia|Nsugbe|Makurdi|Warri|Abuja|Ibadan|Enugu|Onitsha| Aba|Nnewi|Orlu|Okigwe|Aba|Uyo|Calabar|Jos|Ilorin|Bauchi|Maiduguri|Kano|Sokoto|Zaria|Nsukka|Awka|Oyo|Ile-Ife|Benin|Asaba|Delta|Rivers|Cross River|Akwa Ibom|Edo|Ondo|Osun|Ogun|Lagos|Abia|Imo|Anambra|Ebonyi|Enugu|Gombe|Jigawa|Kebbi|Kogi|Kwara|Nasarawa|Niger|Plateau|Sokoto|Taraba|Yobe|Zamfara)";
const VENUE_RE = new RegExp("[.!?]\\s+(?=" + VENUE_WORD + ")", "g");
const VENUE_PHRASE_RE = new RegExp(
  "[.!?]\\s+(?=[A-Z][\\w&'.-]*(?:\\s+[A-Z][\\w&'.-]*){0,4}\\s+(?:International\\s+|African\\s+)?(?:Journal|Proceedings?|Press|Publishers?|Review|Gazette|Bulletin|Transactions|Annals|Acta|Studies|Letters|Research|Monograph|Report|Magazine|Quarterly)\\b)",
  "g",
);
const VENUE_INDICATOR = /\b(?:Vol\.?|No\.?|pp?\.?|ISBN|ISSN|Legal Deposit|ed\.?|eds?\.?|in )\b/i;

function splitTitleVenue(text: string): {
  title: string;
  rest: string;
  editors?: string[];
  chapterPlace?: string;
  chapterPublisher?: string;
} {
  // Book chapters / contributed papers: "Title. In A. Editor (eds) Book Title. Place: Publisher…"
  const eds =
    text.match(/^(.{10,400})\s*[.!?"']\s*In\s+([^()]{0,180}?)\(\s*eds?\s*\)\s*(.+)$/i) ??
    text.match(/^(.{10,400})\s+in\s+([A-Z][\w.,&' -]{0,80}?)\bet al\.?\s*\(\s*eds?\s*\)\s*(.+)$/i) ??
    text.match(/^(.{10,400})\s+in\s+([A-Z][\w.,&' -]{0,80}?)\(\s*eds?\s*\)\s*(.+)$/i);
  let editors: string[] | undefined;
  let chapterPlace: string | undefined;
  let chapterPublisher: string | undefined;
  if (eds) {
    editors = eds[2]
      .trim()
      .replace(/\s+et al\.?$/i, "")
      .split(/\s+and\s+|&|,(?=\s*[A-Z])/)
      .map((s) => s.trim().replace(/[.,\s]+$/, ""))
      .filter((s) => s.length > 2 && !/^(?:eds?|et al\.?)$/i.test(s));
    let rest = eds[3]
      .replace(/\s*(?:ISBN|ISSN|Legal Deposit|pp?\.?\s*[\d\-–]+|https?:\/\/\S*|www\.\S*|http\/\/\S*).*$/i, "")
      .trim();
    // "Book Title. Place: Publisher" — keep the book title as venue and preserve place/publisher.
    const placePub = rest.match(/^(.+)[.!?]\s+([A-Za-z][\w .&'()-]*?):\s*(.+)$/);
    if (placePub) {
      rest = placePub[1].trim();
      chapterPlace = placePub[2].trim();
      chapterPublisher = placePub[3].trim().replace(/,?\s*(?:19|20)\d{2}\.?$/, "");
    }
    return { title: eds[1].trim().replace(/[.,\s]+$/, ""), rest, editors, chapterPlace, chapterPublisher };
  }
  const paper = text.match(/^(.{10,300}?)\s*[.!?]\s*Paper Presented at\s+(.+)$/i);
  if (paper) return { title: paper[1].trim().replace(/[.,\s]+$/, ""), rest: paper[2].trim() };
  VENUE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  let last = -1;
  while ((m = VENUE_RE.exec(text))) {
    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 120);
    if (
      VENUE_INDICATOR.test(after) ||
      /[A-Z][a-z]+ (?:Journal|Press|Publishers?|University|Institute|Centre|Center|College|Polytechnic|Association|Conference|Monograph|Report|Bulletin|Review|Gazette|Annals|Acta|Studies|Letters|Research|Lectures?|Mimeograph|Memorandum|Project|Thesis|Colloquium|Symposium|Congress|Seminar|Workshop)/.test(
        after,
      )
    ) {
      last = m.index;
      break;
    }
  }
  if (last >= 0) return { title: text.slice(0, last + 1), rest: text.slice(last + 1).trim() };
  // Journal names with a capitalised prefix (e.g. "Turkish Online Journal of …").
  VENUE_PHRASE_RE.lastIndex = 0;
  let pm2: RegExpExecArray | null;
  while ((pm2 = VENUE_PHRASE_RE.exec(text))) {
    const after2 = text.slice(pm2.index + pm2[0].length, pm2.index + pm2[0].length + 120);
    if (
      VENUE_INDICATOR.test(after2) ||
      /[A-Z][a-z]+ (?:Journal|Press|Publishers?|University|Institute|Centre|Center|College|Polytechnic|Association|Conference|Monograph|Report|Bulletin|Review|Gazette|Annals|Acta|Studies|Letters|Research)/.test(
        after2,
      )
    ) {
      return { title: text.slice(0, pm2.index + 1), rest: text.slice(pm2.index + 1).trim() };
    }
  }
  // Comma-separated venue with no preceding period (e.g. "Title, Journal Name, Vol…").
  // Titles contain commas too, so only split where a venue name starts right after the comma.
  const VENUE_START =
    /^\s*(?:[A-Z][\w&'.-]*\s+){0,4}(?:International|African|Journal|Proceedings?|Press|Publishers?|Review|Gazette|Bulletin|Transactions|Annals|Acta|Studies|Letters|Research|Monograph|Report|Magazine|Quarterly|Monthly|Weekly|Herald|Times|Post|Tribune|Observer|Chronicle|Standard|Mirror|Sun|Star|Guardian|Voice|Echo|Pilot|Record|Dispatch|Courier|Inquirer|Ledger|Unpublished)\b/;
  const commaRe = /,/g;
  let cm: RegExpExecArray | null;
  while ((cm = commaRe.exec(text))) {
    if (VENUE_START.test(text.slice(cm.index + 1, cm.index + 90))) {
      return { title: text.slice(0, cm.index), rest: text.slice(cm.index + 1).trim() };
    }
  }
  // Book citations: "Title (year). Place: Publisher…"
  const placePub = /[.!?]\s+(?=[A-Z][\w-]*(?:\s+[A-Z][\w-]*){0,3}\s*:\s)/g;
  let pm: RegExpExecArray | null;
  let plast = -1;
  while ((pm = placePub.exec(text))) plast = pm.index;
  if (plast >= 0) return { title: text.slice(0, plast + 1), rest: text.slice(plast + 1).trim() };
  return { title: text, rest: "" };
}

function publicationKind(text: string): string {
  const t = text.toLowerCase();
  if (/\bproceedings?\b/.test(t)) return "conference-paper";
  if (/\bjournal\b/.test(t)) return "journal-article";
  if (/\(eds\)|\(ed\)|\bin\s+[A-Z][a-z.]+\s+[A-Z][a-z]+\s+et\s+al\b/.test(t)) return "book-chapter";
  if (/\bmonograph\b/.test(t)) return "monograph";
  if (/\breport\b|\bbrief\b|\bdigest\b|\bmemo(randum)?\b/.test(t)) return "report";
  if (/\bthesis\b|\bdissertation\b/.test(t)) return "thesis";
  if (/lecture|seminar|colloquium|conference|symposium|congress|presentation|workshop/.test(t)) return "lecture";
  // "Unpublished Thesis/MBA Thesis" is caught above; anything else unpublished (e.g. a project) is not journal research.
  if (/\bunpublished\b/.test(t)) return "unpublished";
  return "journal-article";
}

function parseEntry(raw: string, section: "Books" | "Articles", index: number): Record<string, unknown> | null {
  const text = clean(raw).replace(TITLE_YEAR, "");
  if (text.length < 15) return null;
  const { title: rawTitle, rest, editors, chapterPlace, chapterPublisher } = splitTitleVenue(text);
  const title = rawTitle.replace(/[.,\s]+$/, "").replace(/\s*\((?:19|20)\d{2}[a-z]?\)\.?,?\s*$/, "");
  if (!title || title === rest) return null;
  // The publication year is the last plausible year in the citation; years inside the
  // title (e.g. "1960-1995") are range endpoints, not publication dates.
  const years = [...new Set([...raw.matchAll(/\b(?:19|20)\d{2}\b/g)].map((m) => Number(m[0])))].filter(
    (y) => y >= 1985 && y <= 2026,
  );
  const year = years.length ? Math.max(...years) : null;
  const isbn = text
    .match(/ISBN:?\s*(97[89][\d\- ]{9,}|\d{3}-\d-[\d-]+\d|\d{10})/i)?.[1]
    ?.replace(/\s+/g, "")
    .trim();
  const pages = text.match(/pp\.\s*([\d\-–]+)/)?.[1];
  // The CV files "Education and Development in Imo State" (a commissioned research report) under Books;
  // classify by content so it groups with the other commissioned reports. Flagged in OPEN_ITEMS.md.
  const isBook = section === "Books" && !/commissioned research report/i.test(text);
  const issueMatch = rest.match(/\bVol\.?\s*(\d+)\s*(?:,\s*No\.?\s*(\d+))?\s*(?:\(([^)]*)\))?/i);
  const issue = issueMatch
    ? `Vol. ${issueMatch[1]}${issueMatch[2] ? `, No. ${issueMatch[2]}` : ""}${issueMatch[3] ? ` (${issueMatch[3]})` : ""}`
    : undefined;
  const venue = rest
    .replace(/,?\s*(pp\.?\s*[\d\-–]+).*/i, "")
    .replace(/,?\s*Vol\.?\s*[\d,\sNo.]+.*$/i, "")
    .replace(/[,\s]+(?:19|20)\d{2}\.?$/, "")
    .replace(/\s+/g, " ")
    .trim();
  const place = venue.includes(":") ? venue.split(":")[0].trim() : undefined;
  const publisher = venue.includes(":")
    ? venue
        .split(":")
        .slice(1)
        .join(":")
        .split(/\.\s+(?=(?:Legal Deposit|ISBN|ISSN|http))/i)[0]
        .replace(/\.+$/, "")
        .trim()
    : undefined;
  return {
    id: `pub-${String(index + 1).padStart(3, "0")}`,
    title,
    authors: [],
    year,
    kind: isBook ? "book" : publicationKind(text),
    ...(isBook ? {} : { ...(venue ? { venue } : {}), pages, isbn, issn: text.match(/ISSN[\dX\s.-]+/i)?.[0]?.trim() }),
    ...(editors?.length ? { editors } : {}),
    ...(chapterPlace ? { place: chapterPlace } : {}),
    ...(chapterPublisher ? { publisher: chapterPublisher } : {}),
    ...(issue ? { issue } : {}),
    ...(isBook ? { ...(publisher ? { publisher } : {}), ...(place ? { place } : {}), ...(isbn ? { isbn } : {}) } : {}),
    ...(isBook ? { role: "unknown" } : {}),
    source: SOURCE,
  };
}

const paras = readParagraphs();
const start = paras.findIndex((p) => p.text.trim().toUpperCase() === "PUBLICATIONS");
const end = paras.findIndex((p, i) => i > start && p.text.trim().toUpperCase() === "REFEREES");
if (start < 0 || end < 0) throw new Error("PUBLICATIONS section not found in CV");

// Join continuation paragraphs (venue details on the next line) into the previous entry.
const rawEntries: Array<{ section: "Books" | "Articles"; text: string }> = [];
let section: "Books" | "Articles" | "" = "";
for (const p of paras.slice(start + 1, end)) {
  const t = p.text.trim();
  // Venue/detail continuation lines are "Normal" style in the docx (entries are "List Paragraph").
  const isContinuation = p.style === "Normal";
  if (/^Books$/i.test(t)) {
    section = "Books";
    continue;
  }
  if (/Journal Publications\/Book Chapters/i.test(t)) {
    section = "Articles";
    continue;
  }
  if (!t || !section) continue;
  const prev = rawEntries.at(-1);
  const dangling = prev && /(,|\b(?:and|the|of|in|on|for|to|with|a|an|et|al)\.?|\()$/i.test(prev.text);
  const fragNext = /^[A-Z][a-z]+\.\s+[A-Z][\w-]+(?:-[\w]+)*:/.test(t);
  const venueOnly =
    /^(?:Journal|Proceedings?|African Journal|International Journal|Press|Publishers?|Monograph|Report|Bulletin|Transactions|Review|Gazette|Annals|Acta|Studies|Letters|Research|Lectures?|Mimeograph|Memorandum|Project|Thesis|Colloquium|Symposium|Congress|Conference|Seminar|Workshop)\b/.test(
      t,
    );
  const lower = /^[a-z"'(]/.test(t);
  if (prev && prev.section === section && (isContinuation || venueOnly)) prev.text = `${prev.text} ${t}`;
  else if (prev && prev.section === section && !/[.!?\d]$/.test(prev.text) && (lower || dangling || fragNext))
    prev.text = `${prev.text} ${t}`;
  else rawEntries.push({ section, text: t });
}

// Some CV paragraphs hold two entries ("…1994. Title. Journal Name, Vol…"). Split them.
const MERGE_RE =
  /(?<=[.!?])\s+(?=[A-Z][\w ,&'()-]{5,140}?\.\s+(?:[A-Z][\w&'.-]*\s+){0,3}(?:International\s+|African\s+)?(?:Journal|Proceedings?|Press|Publishers?|Review|Gazette|Bulletin|Transactions|Annals|Acta|Studies|Letters|Research|Monograph|Report)\b)/;
function splitMerged(entry: {
  section: "Books" | "Articles";
  text: string;
}): Array<{ section: "Books" | "Articles"; text: string }> {
  const parts = entry.text
    .split(MERGE_RE)
    .flatMap((x) => x.split("\u0000"))
    .map((x) => x.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts.map((text) => ({ section: entry.section, text })) : [entry];
}
const expanded = rawEntries.flatMap((e) => splitMerged({ section: e.section, text: clean(e.text) }));

const parsed: Record<string, unknown>[] = [];
const skipped: string[] = [];
let idx = 0;
for (const { section: sec, text: entry } of expanded) {
  idx += 1;
  const rec = parseEntry(entry, sec, idx);
  if (rec) parsed.push(rec);
  else skipped.push(entry.slice(0, 80));
}

const seen = new Map<string, number>();
const duplicates: string[] = [];
for (const p of parsed) {
  const key = String(p.title)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .slice(0, 140);
  if (seen.has(key)) duplicates.push(`${p.id} ~ ${seen.get(key)}: ${String(p.title).slice(0, 60)}`);
  else seen.set(key, Number(String(p.id).slice(4)));
}
const noYear = parsed.filter((p) => p.year === null).map((p) => `${p.id} ${String(p.title).slice(0, 70)}`);
const report = {
  parsed: parsed.length,
  books: parsed.filter((p) => p.kind === "book").length,
  skipped,
  noYear,
  duplicates,
  byKind: parsed.reduce<Record<string, number>>(
    (a, p) => ({ ...a, [String(p.kind)]: (a[String(p.kind)] ?? 0) + 1 }),
    {},
  ),
};

if (process.argv.includes("--check")) console.log(JSON.stringify(report, null, 2));
else {
  mkdirSync(join(ROOT, "content"), { recursive: true });
  writeFileSync(OUT, JSON.stringify(parsed, null, 2) + "\n");
  console.log(`Wrote ${parsed.length} publications to content/publications.json\n${JSON.stringify(report, null, 2)}`);
}
