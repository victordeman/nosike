import { ButtonLink, Container, Heading } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-24">
      <Heading level={1} eyebrow="404">
        Page not found
      </Heading>
      <p className="text-ink-muted mt-4 max-w-prose">The page you were looking for does not exist or has moved.</p>
      <ButtonLink href="/" className="mt-8">
        Back to home
      </ButtonLink>
    </Container>
  );
}
