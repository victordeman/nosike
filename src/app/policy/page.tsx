import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Prose, Section } from "@/components/ui/layout";
import { getPolicy } from "@/lib/content";
import type { PolicyRole } from "@/lib/schemas";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Policy & consultancy",
  description: `Policy advisory and consultancy roles held by ${site.name}.`,
  openGraph: {
    title: `Policy & consultancy · ${site.name}`,
    description: `Policy advisory and consultancy roles held by ${site.name}.`,
    url: `${site.url}/policy`,
  },
};

/** Explicit, reviewable grouping of the policy records (SPEC Phase 5 task 1). */
const GROUPS: { heading: string; intro?: string; ids: string[] }[] = [
  {
    heading: "Federal government & ASCON",
    ids: ["pol-ascon-advisor", "pol-ascon-ceo-programme", "pol-ascon-exam", "pol-nsg-strategy"],
  },
  { heading: "African Union Commission", ids: ["pol-au-commission"] },
  { heading: "UNECA & pan-African water initiatives", ids: ["pol-uneca"] },
  {
    heading: "Higher-education regulators",
    ids: ["pol-nche-namibia", "pol-hec-rwanda", "pol-nche-uganda", "pol-kenyan-university-commission", "pol-nuc-nigeria"],
  },
  { heading: "Imo State", ids: ["pol-imo-committee"] },
  {
    heading: "Civic & professional service",
    ids: [
      "pol-niger-delta-project",
      "pol-cajetan-trust",
      "pol-cecd-chairman",
      "pol-yfc-trustee",
      "pol-water-network",
      "pol-ndhr-secretary",
    ],
  },
];

function RoleCard({ role }: { role: PolicyRole }) {
  return (
    <Card className="h-full">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold">{role.role}</p>
        {role.status === "pending" ? <Badge tone="neutral">Pending confirmation</Badge> : null}
      </div>
      <p className="text-ink-muted mt-1 text-sm">{role.organisation}</p>
      {role.period ? <p className="text-gold mt-1 text-sm font-medium">{role.period}</p> : null}
      {role.detail ? <p className="text-ink-muted mt-2 text-sm">{role.detail}</p> : null}
    </Card>
  );
}

export default function PolicyPage() {
  const policy = getPolicy();
  const byId = new Map(policy.map((p) => [p.id, p]));

  return (
    <>
      <Section className="pt-10 sm:pt-16" aria-labelledby="policy">
        <Heading id="policy" level={1} size={2} eyebrow="Policy">
          Policy & consultancy
        </Heading>
        <Prose className="mt-4 max-w-prose">
          <p>
            Three decades of translating economic research into public policy and institutional practice — from
            national regulators and the African Union to community-level civic work.
          </p>
        </Prose>
      </Section>

      <Section tone="surface" aria-label="Policy roles by institution">
        <div className="space-y-14">
          {GROUPS.map((group) => {
            const roles = group.ids.map((id) => byId.get(id)).filter((r): r is PolicyRole => Boolean(r));
            if (roles.length === 0) return null;
            return (
              <section key={group.heading} aria-labelledby={`policy-${group.heading}`}>
                <Heading level={2} size={3} id={`policy-${group.heading}`} className="mb-6">
                  {group.heading}
                </Heading>
                <ul className="grid gap-4 md:grid-cols-2">
                  {roles.map((role) => (
                    <li key={role.id}>
                      <RoleCard role={role} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </Section>

      <Section aria-labelledby="policy-context">
        <Heading id="policy-context" level={2} size={3}>
          From the newsroom to the policy table
        </Heading>
        <Prose className="mt-4 max-w-prose">
          <p>
            Before academia, Prof. Nosike worked as a journalist — features writer at the Daily Star in Enugu, staff
            writer at The Statesman in Owerri and senior staff writer at News Flash — and later as a management
            consultant and publisher. That grounding gives him a practical feel for how research reaches the public
            and for the craft of turning evidence into clear, actionable policy.
          </p>
        </Prose>
      </Section>
    </>
  );
}
