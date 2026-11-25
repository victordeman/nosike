import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/layout";
import { EventsBrowser } from "@/components/events/events-browser";
import { getConferences } from "@/lib/content";
import { ogImageFor, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
  description: `Conferences organised and chaired by ${site.name}.`,
  openGraph: {
    title: `Events · ${site.name}`,
    description: `Conferences organised and chaired by ${site.name}.`,
    url: `${site.url}/events`,
    images: [ogImageFor("events", "Events")],
  },
};

function yearOf(dates: string): number {
  const match = dates.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : 0;
}

export default function EventsPage() {
  const events = getConferences()
    .map((c) => ({ ...c, year: yearOf(c.dates) }))
    .sort((a, b) => b.year - a.year);

  return (
    <>
      <Breadcrumbs items={[{ name: "Events" }]} />
      <Section className="pt-10 sm:pt-16" aria-labelledby="events">
        <Heading id="events" level={1} size={2} eyebrow="Events">
          Conferences organised & chaired
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">
          International conferences convened or chaired across two decades. Entries pending client confirmation are
          marked; dates are shown as printed in the proceedings where available.
        </p>
        <div className="mt-10">
          <EventsBrowser events={events} />
        </div>
      </Section>
    </>
  );
}
