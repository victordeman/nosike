import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/layout";
import { getEducation, getMemberships, sortEducation } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Education",
  description: `Degrees, fellowships and professional memberships of ${site.name}.`,
  openGraph: {
    title: `Education · ${site.name}`,
    description: `Degrees, fellowships and professional memberships of ${site.name}.`,
    url: `${site.url}/education`,
  },
};

const GROUPS: { level: string; title: string; blurb: string }[] = [
  { level: "doctoral", title: "Doctoral", blurb: "PhD qualifications" },
  { level: "masters", title: "Master's", blurb: "Master's degrees" },
  { level: "postgraduate", title: "Postgraduate fellowships & training", blurb: "Postgraduate fellowships and executive training" },
  { level: "foundation", title: "Foundation", blurb: "School and foundational qualifications" },
  { level: "professional", title: "Professional qualifications", blurb: "Professional diplomas" },
];

export default function EducationPage() {
  const entries = sortEducation(getEducation());
  const memberships = getMemberships();

  return (
    <>
      <Section className="pt-10 sm:pt-16" aria-labelledby="education">
        <Heading id="education" level={1} size={2} eyebrow="Education">
          Degrees & training
        </Heading>
        <div className="mt-12 space-y-14">
          {GROUPS.map((group) => {
            const items = entries.filter((e) => e.level === group.level);
            if (items.length === 0) return null;
            return (
              <section key={group.level} aria-labelledby={`edu-${group.level}`}>
                <Heading id={`edu-${group.level}`} level={2} size={3} eyebrow={group.blurb}>
                  {group.title}
                </Heading>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  {items.map((entry) => (
                    <Card key={entry.id}>
                      <p className="text-gold text-sm font-semibold">{entry.dates}</p>
                      <h3 className="mt-1 text-lg font-semibold">{entry.qualification}</h3>
                      <p className="text-ink-muted mt-1 text-sm">
                        {entry.institution}
                        {entry.place ? `, ${entry.place}` : ""}
                      </p>
                      {entry.notes && entry.notes.length > 0 ? (
                        <ul className="text-ink-muted mt-3 list-disc space-y-1 pl-5 text-sm">
                          {entry.notes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      ) : null}
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </Section>

      <Section tone="surface" aria-labelledby="memberships">
        <Heading id="memberships" level={2} size={2}>
          Professional memberships & fellowships
        </Heading>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {memberships.map((m) => (
            <li key={m.name}>
              <Card className="h-full">
                <p className="font-semibold">{m.name}</p>
                {"body" in m && m.body ? <p className="text-ink-muted mt-2 text-sm">{m.body}</p> : null}
              </Card>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
