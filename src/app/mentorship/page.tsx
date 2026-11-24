import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Section, Stat, StatList } from "@/components/ui";
import { getMentorship } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentorship",
  description: `Doctoral and master's supervision and external examining by ${site.name}.`,
  openGraph: {
    title: `Mentorship · ${site.name}`,
    description: `Doctoral and master's supervision and external examining by ${site.name}.`,
    url: `${site.url}/mentorship`,
  },
};

function count(detail: string | undefined, pattern: RegExp): string {
  const match = detail?.match(pattern);
  return match ? match[1] : "—";
}

export default function MentorshipPage() {
  const records = getMentorship().filter((m) => m.status === "approved");
  const byId = new Map(records.map((m) => [m.id, m]));
  const phdDone = byId.get("men-phd-completed");
  const mastersDone = byId.get("men-masters-completed");
  const phdCurrent = byId.get("men-phd-current");
  const mastersCurrent = byId.get("men-masters-current");
  const external = records.filter((m) => m.id.startsWith("men-") && /external/i.test(m.topic));

  return (
    <Section className="pt-10 sm:pt-16" aria-labelledby="mentorship">
      <Heading id="mentorship" level={1} size={2} eyebrow="Mentorship">
        Supervision & examination
      </Heading>
      <p className="text-ink-muted mt-4 max-w-prose">
        Doctoral and master's supervision, and external examining for universities across Africa.
      </p>

      <div className="mt-10">
        <StatList>
          <Stat value={count(phdDone?.detail, /(\d+)/)} label="PhD candidates graduated" />
          <Stat value={count(mastersDone?.detail, /(\d+)/)} label="Master's candidates graduated" />
          <Stat value={count(phdCurrent?.detail, /(\d+)/)} label="PhD candidates current" />
          <Stat value={count(mastersCurrent?.detail, /(\d+)/)} label="Master's candidates current" />
        </StatList>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="supervision">
          <Heading level={2} size={3} id="supervision" className="mb-4">
            Supervision
          </Heading>
          <ul className="space-y-3">
            {[phdDone, mastersDone, phdCurrent, mastersCurrent].map(
              (m) =>
                m && (
                  <li key={m.id} className="border-line flex items-baseline justify-between gap-4 border-b pb-3 text-sm">
                    <span className="text-ink font-medium">{m.topic}</span>
                    <span className="text-ink-muted text-right">{m.role}</span>
                  </li>
                ),
            )}
          </ul>
        </section>

        <section aria-labelledby="external">
          <Heading level={2} size={3} id="external" className="mb-4">
            External roles
          </Heading>
          <ul className="space-y-4">
            {external.map((m) => (
              <li key={m.id}>
                <Card>
                  <p className="text-ink-muted text-xs font-semibold tracking-wide uppercase">{m.topic}</p>
                  <p className="mt-1 font-semibold">{m.role}</p>
                  {m.detail ? <p className="text-ink-muted mt-1 text-sm">{m.detail}</p> : null}
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="text-ink-muted mt-10 text-sm">
        Figures are as stated in the supplied CV and profile. One further CV claim is withheld from this page
        pending client confirmation.
      </p>
    </Section>
  );
}
