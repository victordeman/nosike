import type { Profile, Publication } from "@/lib/schemas";
import { site } from "@/lib/site";

const person = (profile: Profile) => ({
  "@type": "Person",
  name: profile.displayName,
  alternateName: profile.formalName,
  url: `${site.url}/about`,
});

const org = (name: string) => ({ "@type": "Organization", name });

/** Schema.org JSON-LD for a publication: Book/Monograph for books, ScholarlyArticle otherwise. */
export function publicationJsonLd(pub: Publication, profile: Profile) {
  const datePublished = pub.year ? { datePublished: String(pub.year) } : {};
  // Only claim authorship when the record confirms it; "unknown" stays unattributed.
  const role = "role" in pub ? pub.role : undefined;
  const author = role !== "unknown" && role !== "editor" ? { author: person(profile) } : {};
  const editor = role === "editor" ? { editor: person(profile) } : {};

  if (pub.kind === "book" || pub.kind === "monograph") {
    return {
      "@context": "https://schema.org",
      "@type": "Book",
      name: pub.title,
      ...author,
      ...datePublished,
      ...(pub.publisher ? { publisher: org(pub.publisher) } : {}),
      ...(pub.isbn ? { isbn: pub.isbn } : {}),
      ...editor,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: pub.title,
    ...author,
    ...datePublished,
    ...(pub.venue ? { isPartOf: { "@type": "Periodical", name: pub.venue } } : {}),
    ...(pub.publisher ? { publisher: org(pub.publisher) } : {}),
    ...(pub.isbn ? { isbn: pub.isbn } : {}),
    ...(pub.issn ? { issn: pub.issn } : {}),
    ...editor,
  };
}
