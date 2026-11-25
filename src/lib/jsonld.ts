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

  if (pub.kind === "book" || pub.kind === "monograph") {
    return {
      "@context": "https://schema.org",
      "@type": "Book",
      name: pub.title,
      author: person(profile),
      ...datePublished,
      ...(pub.publisher ? { publisher: org(pub.publisher) } : {}),
      ...(pub.isbn ? { isbn: pub.isbn } : {}),
      ...(pub.kind === "book" && pub.role === "editor" ? { editor: person(profile) } : {}),
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: pub.title,
    author: person(profile),
    ...datePublished,
    ...(pub.venue ? { isPartOf: { "@type": "Periodical", name: pub.venue } } : {}),
    ...(pub.publisher ? { publisher: org(pub.publisher) } : {}),
    ...(pub.isbn ? { isbn: pub.isbn } : {}),
    ...(pub.issn ? { issn: pub.issn } : {}),
  };
}
