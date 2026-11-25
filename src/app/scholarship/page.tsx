import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/layout";
import { PublicationExplorer } from "@/components/scholarship/publication-explorer";
import { getEditorial, getProfile, getPublications } from "@/lib/content";
import { publicationJsonLd } from "@/lib/jsonld";
import { getBooks, getExplorerItems, getThemeMap } from "@/lib/scholarship";
import { ogImageFor, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Scholarship",
  description: `Books, chapters, articles and papers by ${site.name}, with filters and copyable citations.`,
  openGraph: {
    title: `Scholarship · ${site.name}`,
    description: `Books, chapters, articles and papers by ${site.name}, with filters and copyable citations.`,
    url: `${site.url}/scholarship`,
    images: [ogImageFor("scholarship", "Scholarship")],
  },
};

const POSITION_LABELS: Record<string, string> = {
  chair: "Chair",
  "editor-in-chief": "Editor-in-Chief",
  editor: "Editor",
  "managing-editor": "Managing Editor",
  "consulting-editor": "Consulting Editor",
  secretary: "Secretary, Editorial Board",
  member: "Member",
  "founding-president": "Founding President",
};

function positionText(role: string, detail?: string | null): string {
  const label = POSITION_LABELS[role] ?? role;
  if (!detail) return label;
  const d = detail.trim();
  if (d.toLowerCase() === "editorial consultant") return label;
  if (d.toLowerCase().includes(label.toLowerCase())) return d;
  return `${label} · ${d}`;
}

function bookMeta(pub: { year: number | null; publisher?: string; place?: string }): string {
  const head = [pub.publisher, pub.place].filter(Boolean).join(", ");
  return head + (pub.year ? ` · ${pub.year}` : "");
}

export default function ScholarshipPage() {
  const items = getExplorerItems();
  const books = getBooks();
  const rest = items.filter((i) => i.kind !== "book");
  const themeMap = getThemeMap();
  const themeOptions = themeMap.themes.map((t) => ({ id: t.id, label: t.label }));
  themeOptions.push({ id: "other", label: "Other" });
  const editorial = getEditorial();
  const profile = getProfile();
  // Books plus peer-reviewed journal articles get structured data; other kinds stay list-only.
  const publicationJsonLdList = getPublications()
    .filter(
      (p) =>
        p.kind === "book" ||
        p.kind === "monograph" ||
        (p.kind === "journal-article" && p.year !== null && Boolean(p.venue)),
    )
    .map((p) => publicationJsonLd(p, profile));

  return (
    <>
      <JsonLd data={publicationJsonLdList} />
      <Breadcrumbs items={[{ name: "Scholarship" }]} />
      <Section className="pt-10 sm:pt-16" aria-labelledby="scholarship">
        <Heading id="scholarship" level={1} size={2} eyebrow="Scholarship">
          Publications
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">
          {items.length} publications on record — books, chapters, journal articles, conference papers, monographs,
          reports, theses and lectures. Filter, search and copy citations below.
        </p>

        {books.length > 0 ? (
          <div className="mt-12">
            <Heading level={2} size={3} className="mb-6">
              Books
            </Heading>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <Card key={book.id} className="flex flex-col">
                  <Badge tone="gold">Book</Badge>
                  <h3 className="mt-3 text-lg font-semibold">{book.title}</h3>
                  <p className="text-ink-muted mt-2 flex-1 text-sm">
                    {bookMeta({ year: book.year, publisher: book.publisher, place: book.place })}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-14">
          <Heading level={2} size={3} className="mb-6">
            Chapters, articles, papers & more
          </Heading>
          <PublicationExplorer items={rest} themes={themeOptions} />
        </div>
      </Section>

      <Section tone="surface" aria-labelledby="editorial">
        <Heading id="editorial" level={2} size={2}>
          Editorial roles
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">
          Journals edited or chaired, and the founding presidency of the African Association of Journal Editors.
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {editorial.map((role) => (
            <li key={role.id}>
              <Card className="h-full">
                <p className="font-semibold">{role.journal}</p>
                <p className="text-ink-muted mt-1 text-sm">{positionText(role.role, role.detail)}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
