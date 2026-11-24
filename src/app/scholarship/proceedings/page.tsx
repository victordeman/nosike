import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/layout";
import { getProceedings } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Proceedings",
  description: `Edited conference proceedings volumes by ${site.name}.`,
  openGraph: {
    title: `Proceedings · ${site.name}`,
    description: `Edited conference proceedings volumes by ${site.name}.`,
    url: `${site.url}/scholarship/proceedings`,
  },
};

export default function ProceedingsPage() {
  const volumes = getProceedings();

  return (
    <Section className="pt-10 sm:pt-16" aria-labelledby="proceedings">
      <Heading id="proceedings" level={1} size={2} eyebrow="Scholarship">
        Edited proceedings
      </Heading>
      <p className="text-ink-muted mt-4 max-w-prose">
        Five international conference proceedings volumes edited or led by Prof. Nosike. ISBNs are shown only where
        confirmed; downloads are enabled once the client approves hosting.
      </p>
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {volumes.map((vol) => (
          <Card key={vol.code} className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">{vol.code}</Badge>
              {vol.status === "pending" ? <Badge tone="neutral">Pending confirmation</Badge> : null}
            </div>
            <h2 className="mt-3 text-xl font-semibold">{vol.fullTitle ?? vol.title}</h2>
            <dl className="text-ink-muted mt-4 space-y-1 text-sm">
              <div>
                <dt className="sr-only">Dates</dt>
                <dd>{vol.dates}</dd>
              </div>
              <div>
                <dt className="sr-only">Venue</dt>
                <dd>{vol.venue}</dd>
              </div>
              <div>
                <dt className="sr-only">Publisher</dt>
                <dd>{vol.publisher}</dd>
              </div>
              <div>
                <dt className="sr-only">Pages</dt>
                <dd>{vol.pages} pages</dd>
              </div>
              <div>
                <dt className="sr-only">Role</dt>
                <dd>{vol.role}</dd>
              </div>
              {vol.identifiers.length > 0 ? (
                <div>
                  <dt className="sr-only">Identifiers</dt>
                  <dd>{vol.identifiers.join(" · ")}</dd>
                </div>
              ) : null}
            </dl>
            {vol.papers.length > 0 ? (
              <div className="mt-4">
                <h3 className="text-sm font-semibold">His papers in this volume</h3>
                <ul className="mt-2 space-y-2">
                  {vol.papers.map((paper) => (
                    <li key={paper.title} className="text-ink-muted text-sm">
                      {paper.title}
                      {paper.coAuthors.length > 0 ? ` (with ${paper.coAuthors.join(", ")})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="mt-6 flex-1" />
            {vol.proceedingsPdfUrl ? (
              <ButtonLink href={vol.proceedingsPdfUrl} variant="secondary" className="self-start">
                Download PDF
              </ButtonLink>
            ) : null}
          </Card>
        ))}
      </div>
    </Section>
  );
}
