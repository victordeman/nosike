import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/layout";
import { getHonours } from "@/lib/content";
import type { Honour } from "@/lib/schemas";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Honours & awards",
  description: `Awards, fellowships, grants and biographical listings for ${site.name}.`,
  openGraph: {
    title: `Honours & awards · ${site.name}`,
    description: `Awards, fellowships, grants and biographical listings for ${site.name}.`,
    url: `${site.url}/honours`,
  },
};

type HonourGroup = "awards" | "fellowships" | "listings";

/** SPEC Phase 5 task 3 grouping; "Professional fellowships" has no records yet and is omitted. */
function groupOf(h: Honour): HonourGroup {
  if (/listing|who's who|who’s who|dictionary of international biography/i.test(h.title)) return "listings";
  if (/fellowship|grant/i.test(h.title)) return "fellowships";
  return "awards";
}

const GROUP_HEADINGS: { key: HonourGroup; heading: string; intro: string }[] = [
  { key: "awards", heading: "Awards & prizes", intro: "Competitive awards, scholarships and commendations." },
  { key: "fellowships", heading: "Fellowships & grants", intro: "Research fellowships and travel grants." },
  { key: "listings", heading: "Biographical listings", intro: "Published biographical directory listings." },
];

function HonourCard({ honour }: { honour: Honour }) {
  return (
    <Card className="h-full">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold">{honour.title}</p>
        {honour.status === "pending" ? <Badge tone="neutral">Pending confirmation</Badge> : null}
      </div>
      <p className="text-ink-muted mt-1 text-sm">
        {[honour.issuer, honour.year].filter(Boolean).join(" · ")}
      </p>
    </Card>
  );
}

export default function HonoursPage() {
  const honours = getHonours();
  const featured = honours.find((h) => h.id === "hon-unn-alumni-icon-2025");

  return (
    <Section className="pt-10 sm:pt-16" aria-labelledby="honours">
      <Heading id="honours" level={1} size={2} eyebrow="Honours">
        Awards & recognition
      </Heading>
      <p className="text-ink-muted mt-4 max-w-prose">
        Awards, fellowships, grants and biographical listings across a career spanning four decades.
      </p>

      {featured ? (
        <Card className="border-gold mt-10 border-2">
          <Badge tone="gold">Featured</Badge>
          <h2 className="mt-3 text-xl font-semibold">{featured.title}</h2>
          <p className="text-ink-muted mt-1 text-sm">
            {[featured.issuer, featured.year].filter(Boolean).join(" · ")}
          </p>
        </Card>
      ) : null}

      <div className="mt-14 space-y-14">
        {GROUP_HEADINGS.map((group) => {
          const items = honours.filter((h) => groupOf(h) === group.key && h.id !== featured?.id);
          if (items.length === 0) return null;
          return (
            <section key={group.key} aria-labelledby={`honours-${group.key}`}>
              <Heading level={2} size={3} id={`honours-${group.key}`} className="mb-2">
                {group.heading}
              </Heading>
              <p className="text-ink-muted mb-6 text-sm">{group.intro}</p>
              <ul className="grid gap-4 md:grid-cols-2">
                {items.map((h) => (
                  <li key={h.id}>
                    <HonourCard honour={h} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Section>
  );
}
