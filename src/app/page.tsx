import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Container, Section } from "@/components/ui/layout";
import { Stat, StatList } from "@/components/ui/stat";
import { WorldMap } from "@/components/map/world-map";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { getCountries, getProfile, getTalks, verifiedCountries } from "@/lib/content";
import { imageById } from "@/lib/images";
import { ogImage, site } from "@/lib/site";

export const metadata: Metadata = {
  description: `${site.role}. Economist and global management scholar — university leadership, scholarship and public policy.`,
  openGraph: {
    title: site.name,
    description: `${site.role}. Economist and global management scholar — university leadership, scholarship and public policy.`,
    url: site.url,
    images: [ogImage],
  },
};

const HIGHLIGHTS = [
  {
    title: "Leadership",
    href: "/leadership",
    body: "An executive record across universities in Africa, Europe and the Americas — from lecturer to Vice Chancellor/President.",
  },
  {
    title: "Scholarship",
    href: "/scholarship",
    body: "More than 150 books, chapters, articles and papers, and five edited international conference proceedings.",
  },
  {
    title: "Policy",
    href: "/policy",
    body: "Advisory and consultancy roles with the African Union, UN Economic Commission for Africa, ASCON and national higher-education bodies.",
  },
];

export default function HomePage() {
  const profile = getProfile();
  const hero = imageById("regalia-full-a");
  const latestTalk = getTalks().find((t) => t.status === "verified");
  const countryCount = verifiedCountries(getCountries()).length;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.displayName,
    alternateName: profile.formalName,
    jobTitle: "Vice Chancellor/President",
    worksFor: { "@type": "CollegeOrUniversity", name: "James Hope University" },
    description: profile.positioningLine,
    knowsLanguage: profile.languages,
    url: site.url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      {/* Hero */}
      <Section className="pt-10 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="font-semibold whitespace-nowrap text-[clamp(1.6rem,1rem+2.5vw,3rem)] leading-[1.05]">
              {profile.displayName}
            </h1>
            <p className="text-ink-muted mt-6 max-w-prose text-lg">{profile.positioningLine}.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/scholarship">Explore his work</ButtonLink>
              <ButtonLink href="/media-kit" variant="secondary">
                Download CV
              </ButtonLink>
            </div>
          </div>
          {hero ? (
            <div className="order-first lg:order-none">
              <div className="bg-surface overflow-hidden rounded-card shadow-card">
                <ResponsiveImage
                  image={hero}
                  priority
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="aspect-[3/4]"
                  imgClassName="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>
      </Section>

      {/* Key facts — only figures approved in SPEC Appendix A.2 */}
      <Section tone="surface" aria-labelledby="key-facts">
        <Heading id="key-facts" level={2} size={3} className="mb-8">
          Key facts
        </Heading>
        <StatList>
          <Stat value="30+ years" label="In higher education" />
          <Stat value="150+" label="Publications (career claim)" />
          <Stat value="12" label="PhD candidates supervised to completion" />
          <Stat value="38" label="Master's candidates supervised to completion" />
        </StatList>
      </Section>

      {/* Highlight cards */}
      <Section aria-labelledby="highlights">
        <Heading id="highlights" level={2} size={2} className="mb-10">
          Four decades of work
        </Heading>
        <div className="grid gap-6 md:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <Card key={h.href} className="flex flex-col">
              <Heading level={3} size={4}>
                {h.title}
              </Heading>
              <p className="text-ink-muted mt-3 flex-1">{h.body}</p>
              <ButtonLink href={h.href} variant="ghost" className="mt-5 self-start px-0">
                {`Explore ${h.title.toLowerCase()}`}
              </ButtonLink>
            </Card>
          ))}
        </div>
      </Section>

      {/* Global map teaser */}
      <Section tone="surface" aria-labelledby="footprint">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Heading id="footprint" level={2} size={2}>
              A global footprint
            </Heading>
            <p className="text-ink-muted mt-4 max-w-prose">
              Academic appointments, study and consultancy across Africa, Europe, the Americas and Asia — {countryCount}{" "}
              confirmed countries on record.
            </p>
            <ButtonLink href="/leadership#footprint" variant="secondary" className="mt-6">
              View the full map
            </ButtonLink>
          </div>
          <WorldMap headingLevel="h3" />
        </div>
      </Section>

      {/* Latest talk */}
      {latestTalk ? (
        <Section aria-labelledby="latest-talk">
          <div className="max-w-page mx-auto">
            <Card>
              <Badge tone="gold">Latest talk</Badge>
              <Heading level={2} size={3} className="mt-4">
                {latestTalk.title}
              </Heading>
              <p className="text-ink-muted mt-3">
                {latestTalk.date} · {latestTalk.venue}
              </p>
            </Card>
          </div>
        </Section>
      ) : null}

      {/* Contact CTA */}
      <Section tone="muted" aria-labelledby="contact-cta">
        <Container className="text-center">
          <Heading id="contact-cta" level={2} size={2}>
            Speaking, media and collaboration
          </Heading>
          <p className="text-ink-muted mx-auto mt-4 max-w-prose">
            For invitations, media enquiries and institutional partnerships, get in touch through the contact page.
          </p>
          <ButtonLink href="/contact" className="mt-8">
            Get in touch
          </ButtonLink>
        </Container>
      </Section>
    </>
  );
}
