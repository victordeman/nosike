import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Prose, Section } from "@/components/ui/layout";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { getTalks } from "@/lib/content";
import { imageById } from "@/lib/images";
import { ogImageFor, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Talks & lectures",
  description: `Selected talks and lectures by ${site.name}.`,
  openGraph: {
    title: `Talks & lectures · ${site.name}`,
    description: `Selected talks and lectures by ${site.name}.`,
    url: `${site.url}/talks`,
    images: [ogImageFor("talks", "Talks & lectures")],
  },
};

export default function TalksPage() {
  const talks = getTalks();
  const featured = talks.find((t) => t.id === "talk-ascon-performance-dashboards");
  const others = talks.filter((t) => t.id !== featured?.id);
  const speakingImage = imageById("speaking-desk");

  return (
    <>
      <Breadcrumbs items={[{ name: "Talks" }]} />
      <Section className="pt-10 sm:pt-16" aria-labelledby="talks">
        <Heading id="talks" level={1} size={2} eyebrow="Talks">
          Talks & lectures
        </Heading>

        {featured ? (
          <article className="border-line rounded-card bg-surface mt-10 border p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">Featured talk</Badge>
              <Badge tone="neutral">{featured.date}</Badge>
            </div>
            <h2 className="mt-4 text-2xl font-semibold">{featured.title}</h2>
            <p className="text-ink-muted mt-2 text-sm">{featured.venue}</p>
            {featured.abstract ? (
              <Prose className="mt-4 max-w-prose">
                <p>{featured.abstract}</p>
              </Prose>
            ) : null}
            {speakingImage ? (
              <ResponsiveImage
                image={speakingImage}
                sizes="(min-width: 768px) 60vw, 100vw"
                className="rounded-card mt-6 overflow-hidden"
              />
            ) : null}
          </article>
        ) : null}

        {others.length > 0 ? (
          <div className="mt-12">
            <Heading level={2} size={3} className="mb-6">
              Further lectures
            </Heading>
            <ul className="grid gap-4 md:grid-cols-2">
              {others.map((talk) => (
                <li key={talk.id}>
                  <Card className="h-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">Guest lecture</p>
                      {talk.status === "pending" ? <Badge tone="neutral">Pending confirmation</Badge> : null}
                    </div>
                    <p className="text-ink-muted mt-2 text-sm">
                      {talk.date} · {talk.venue}
                    </p>
                    <p className="text-ink-muted mt-2 text-sm">Topic to be confirmed by the client.</p>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="border-line rounded-card bg-surface-muted mt-12 border p-6">
          <Heading level={2} size={4}>
            Invite him to speak
          </Heading>
          <p className="text-ink-muted mt-2 max-w-prose text-sm">
            Prof. Nosike speaks on higher education leadership, performance management, economics and public policy.
            Speaking topics are confirmed with the client; use the contact page to send an invitation.
          </p>
          <ButtonLink href="/contact" variant="primary" className="mt-4">
            Get in touch
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
