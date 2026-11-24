import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/layout";
import { WorldMap } from "@/components/map/world-map";
import { CareerBrowser } from "@/components/leadership/career-browser";
import { getCareer, getCommittees, sortCareer } from "@/lib/content";
import { ogImage, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Leadership",
  description: `Career record of ${site.name}: university executive roles, governance committees and institution-building across Africa, Europe and the Americas.`,
  openGraph: {
    title: `Leadership · ${site.name}`,
    description: `Career record of ${site.name}: university executive roles, governance committees and institution-building across Africa, Europe and the Americas.`,
    url: `${site.url}/leadership`,
    images: [ogImage],
  },
};

const INSTITUTION_BUILDING = ["Development Africa Consortium", "JCF Publishing", "J. Charlot & Fyne Ltd"];

function period(start: string, end: string): string {
  return `${start}–${end === "present" ? "present" : end}`;
}

export default function LeadershipPage() {
  const roles = sortCareer(getCareer());
  const committees = getCommittees();
  const jhu = roles.find((r) => r.id === "career-jhu-2025");
  const partnershipRole = jhu?.subRoles?.find((s) => s.startsWith("Head of Partnership"));
  const buildingRoles = roles.filter((r) => INSTITUTION_BUILDING.includes(r.institution));
  const foundingCards = [
    ...(partnershipRole && jhu
      ? [
          {
            key: "jhu-partnership",
            period: period(jhu.dates.start, jhu.dates.end),
            title: partnershipRole,
            detail: `${jhu.institution}, ${jhu.place}, ${jhu.country}`,
            verified: jhu.verified,
          },
        ]
      : []),
    ...buildingRoles.map((r) => ({
      key: r.id,
      period: period(r.dates.start, r.dates.end),
      title: r.title,
      detail: `${r.institution}, ${r.place}, ${r.country}`,
      verified: r.verified,
    })),
  ];

  return (
    <>
      <Section className="pt-10 sm:pt-16" aria-labelledby="career">
        <Heading id="career" level={1} size={2} eyebrow="Leadership">
          Career timeline
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">
          From lecturer to Vice Chancellor/President — executive and academic leadership across universities in Nigeria,
          Rwanda, Uganda, Zambia, Burundi, the Dominican Republic, Italy, Spain and Hungary, with visiting and
          concurrent appointments in between.
        </p>
        <div className="mt-10">
          <CareerBrowser roles={roles} />
        </div>
      </Section>

      <Section tone="surface" aria-labelledby="committees">
        <Heading id="committees" level={2} size={2}>
          Governance & committees
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">
          University committee service listed in the CV, including quality assurance, senate business, finance,
          accreditation and strategic planning.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {committees.map((c) => (
            <li key={c.name}>
              <Badge tone="neutral">{c.name}</Badge>
            </li>
          ))}
        </ul>
      </Section>

      <Section aria-labelledby="partnerships">
        <Heading id="partnerships" level={2} size={2}>
          Partnerships & institution-building
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">
          Founding and leading organisations in publishing, development research and university partnership work.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {foundingCards.map((role) => (
            <Card key={role.key}>
              <p className="text-gold text-sm font-semibold">
                {role.period}
                {role.verified === false ? (
                  <>
                    {" "}
                    <Badge tone="gold">Pending confirmation</Badge>
                  </>
                ) : null}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{role.title}</h3>
              <p className="text-ink-muted mt-1 text-sm">{role.detail}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="surface" id="footprint" aria-labelledby="footprint-heading">
        <Heading id="footprint-heading" level={2} size={2}>
          Global footprint
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">
          Countries with academic appointments, study or consultancy engagements on record.
        </p>
        <div className="mt-10">
          <WorldMap />
        </div>
      </Section>
    </>
  );
}
