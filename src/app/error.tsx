"use client";

import { useEffect } from "react";
import { Button, Container, Heading } from "@/components/ui";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24">
      <Heading level={1}>Something went wrong</Heading>
      <p className="text-ink-muted mt-4 max-w-prose">Please try again. If the problem persists, come back later.</p>
      <Button onClick={() => retry()} className="mt-8">
        Try again
      </Button>
    </Container>
  );
}
