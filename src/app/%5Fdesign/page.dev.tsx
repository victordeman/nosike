import type { Metadata } from "next";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  Container,
  Heading,
  Link,
  Prose,
  Section,
  Stat,
  StatList,
  Tag,
  Timeline,
} from "@/components/ui";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

const swatches = [
  "paper",
  "surface",
  "surface-muted",
  "ink",
  "ink-muted",
  "line",
  "accent",
  "accent-strong",
  "gold",
  "gold-soft",
];

/** Development-only component gallery: `.dev.tsx` is only a page extension under `next dev`. */
export default function DesignPage() {
  return (
    <>
      <Container className="py-16">
        <Heading level={1} eyebrow="Development only">
          Design system
        </Heading>
      </Container>
      <Section tone="surface" aria-labelledby="colour">
        <Heading id="colour">Colour</Heading>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {swatches.map((s) => (
            <li key={s} className="space-y-2 text-sm">
              <span className="rounded-card border-line block h-16 border" style={{ background: `var(--${s})` }} />
              <code>--{s}</code>
            </li>
          ))}
        </ul>
      </Section>
      <Section aria-labelledby="type">
        <Heading id="type">Typography</Heading>
        <div className="mt-8 space-y-6">
          <Heading level={3} size="display">
            Display heading
          </Heading>
          <Heading level={3} size={1}>
            Heading 1
          </Heading>
          <Heading level={3} size={2}>
            Heading 2
          </Heading>
          <Heading level={3}>Heading 3</Heading>
          <Prose>
            <p>
              Body copy is set at 17px with a generous line height and a measure of about seventy characters.{" "}
              <Link href="/">Internal link</Link> and <Link href="https://example.org">external link</Link>.
            </p>
          </Prose>
        </div>
      </Section>
      <Section tone="muted" aria-labelledby="components">
        <Heading id="components">Components</Heading>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <Card>
            <Heading level={3}>Card</Heading>
            <p className="text-ink-muted mt-3">Cards group related content.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>Editor</Badge>
              <Badge tone="gold">2013</Badge>
              <Badge tone="neutral">Book</Badge>
              <Tag>Economics</Tag>
              <Tag pressed>Entrepreneurship</Tag>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <ButtonLink href="/" variant="ghost">
                Ghost link
              </ButtonLink>
            </div>
          </Card>
          <Card>
            <StatList>
              <Stat value="30+" label="Years in higher education" />
              <Stat value="12" label="PhD supervisions completed" />
            </StatList>
          </Card>
          <Card className="lg:col-span-2">
            <Timeline
              label="Example timeline"
              items={[
                { id: "a", period: "2025–present", title: "Example role", meta: "Institution" },
                {
                  id: "b",
                  period: "2016–2024",
                  title: "Earlier role",
                  meta: "Institution",
                  body: "Short description.",
                },
              ]}
            />
          </Card>
        </div>
      </Section>
    </>
  );
}
