import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentPropsWithoutRef<"article">) {
  return (
    <article
      className={cn("rounded-card border-line bg-surface shadow-card border p-6 sm:p-8", className)}
      {...props}
    />
  );
}
