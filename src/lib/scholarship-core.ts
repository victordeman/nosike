import type { Profile, Publication } from "./schemas";

/* Pure helpers shared by the Next.js pages and the build-time search-index script. */

/* ---------- Themes (content/themes.json is the reviewable keyword map) ---------- */

export const THEME_OTHER = "other";

export type ThemeMapFile = { themes: { id: string; label: string; keywords: string[] }[] };

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Word-boundary, case-insensitive keyword match against the publication title. */
export function themesFor(pub: Pick<Publication, "title">, themeMap: ThemeMapFile): string[] {
  const title = pub.title.toLowerCase();
  const hits: string[] = [];
  for (const theme of themeMap.themes) {
    const matched = theme.keywords.some((kw) => new RegExp(`\\b${escapeRegExp(kw.toLowerCase())}\\b`, "i").test(title));
    if (matched) hits.push(theme.id);
  }
  return hits.length > 0 ? hits : [THEME_OTHER];
}

export function themeLabel(themeId: string, themeMap: ThemeMapFile): string {
  return themeMap.themes.find((t) => t.id === themeId)?.label ?? "Other";
}

/* ---------- Explorer items ---------- */

export const KIND_LABELS: Record<string, string> = {
  "journal-article": "Journal article",
  "book-chapter": "Book chapter",
  "conference-paper": "Conference paper",
  monograph: "Monograph",
  report: "Report",
  thesis: "Thesis",
  lecture: "Lecture",
  unpublished: "Unpublished",
};

export type ExplorerItem = {
  id: string;
  title: string;
  authors: string;
  year: number | null;
  decade: string;
  kind: string;
  kindLabel: string;
  venue: string;
  themes: string[];
  citation: string;
};

export function decadeOf(year: number | null): string {
  return year === null ? "undated" : `${Math.floor(year / 10) * 10}s`;
}

function joinParts(parts: Array<string | undefined>): string {
  return parts.filter((p): p is string => Boolean(p && p.trim())).join(". ");
}

/** Best-effort APA-style citation built only from structured fields. */
export function apaCitation(pub: Publication, profile: Profile): string {
  const author = profile.authorName;
  const year = pub.year === null ? "n.d." : String(pub.year);
  const title = pub.title.replace(/[."]+$/, "");

  switch (pub.kind) {
    case "book":
    case "monograph": {
      const publisher = [pub.publisher, pub.place].filter(Boolean).join(", ");
      return joinParts([`${author} (${year}). *${title}*.`, publisher || undefined]);
    }
    case "book-chapter": {
      const container = pub.venue ? `*${pub.venue}*` : "";
      const editors = pub.editors && pub.editors.length > 0 ? ` (${pub.editors.join(", ")} Eds.)` : "";
      const pubPlace = [pub.publisher, pub.place].filter(Boolean).join(", ");
      const pages = pub.pages ? `pp. ${pub.pages}` : "";
      return joinParts([
        `${author} (${year}). ${title}.`,
        container ? `In ${container}${editors}.` : undefined,
        [pages, pubPlace].filter(Boolean).join(". ") || undefined,
      ]);
    }
    case "journal-article": {
      const venue = pub.venue ? `*${pub.venue}*` : "";
      const issue = pub.issue ?? "";
      const pages = pub.pages ? `, ${pub.pages}` : "";
      const detail = [issue, pages.replace(/^,\s*/, "")].filter(Boolean).join(", ");
      return joinParts([`${author} (${year}). ${title}.`, venue ? `${venue}${detail ? `, ${detail}` : ""}.` : undefined]);
    }
    default: {
      const venue = "venue" in pub && pub.venue ? `*${pub.venue}*` : "";
      return joinParts([`${author} (${year}). ${title}.`, venue ? `${venue}.` : undefined]);
    }
  }
}

export function buildExplorerItems(pubs: Publication[], profile: Profile, themeMap: ThemeMapFile): ExplorerItem[] {
  return pubs.map((pub) => ({
    id: pub.id,
    title: pub.title,
    authors: pub.authors.length > 0 ? pub.authors.join(", ") : profile.authorName,
    year: pub.year,
    decade: decadeOf(pub.year),
    kind: pub.kind,
    kindLabel: KIND_LABELS[pub.kind] ?? pub.kind,
    venue: "venue" in pub ? (pub.venue ?? "") : "",
    themes: themesFor(pub, themeMap),
    citation: apaCitation(pub, profile),
  }));
}
