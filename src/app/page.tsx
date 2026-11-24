import { ButtonLink, Container, Heading } from "@/components/ui";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <Container className="py-20 sm:py-32">
      <Heading level={1} size="display" eyebrow={site.role}>
        {site.name}
      </Heading>
      <p className="text-ink-muted mt-6 max-w-prose text-lg">
        University leader, scholar and policy adviser. The full site is being prepared.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/contact">Get in touch</ButtonLink>
      </div>
    </Container>
  );
}
