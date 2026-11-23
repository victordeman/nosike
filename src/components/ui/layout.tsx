import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("max-w-page mx-auto w-full px-5 sm:px-8", className)} {...props} />;
}

type SectionProps = ComponentPropsWithoutRef<"section"> & { tone?: "paper" | "surface" | "muted" };

export function Section({ tone = "paper", className, children, ...props }: SectionProps) {
  const tones = { paper: "bg-paper", surface: "bg-surface", muted: "bg-surface-muted" };
  return (
    <section className={cn("py-16 sm:py-24", tones[tone], className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}

export function Prose({
  as: Tag = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "text-ink [&_a]:text-accent max-w-prose space-y-5 [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h3]:mt-8 [&_h3]:text-xl [&_li]:ml-5 [&_ul]:list-disc",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
