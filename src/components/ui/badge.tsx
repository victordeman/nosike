import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Status/metadata label, e.g. "Editor" or "2013". */
export function Badge({ tone = "accent", children }: { tone?: "accent" | "gold" | "neutral"; children: ReactNode }) {
  const tones = {
    accent: "bg-accent text-accent-contrast",
    gold: "border border-gold text-gold",
    neutral: "bg-surface-muted text-ink-muted",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}

/** Topic tag; renders as a toggle button when `onClick`-style props are wired by a client parent via `pressed`. */
export function Tag({ pressed, children, className }: { pressed?: boolean; children: ReactNode; className?: string }) {
  return (
    <span
      data-pressed={pressed || undefined}
      className={cn(
        "border-line text-ink-muted data-[pressed]:border-accent data-[pressed]:bg-accent data-[pressed]:text-accent-contrast inline-flex items-center rounded-md border px-2.5 py-1 text-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}
