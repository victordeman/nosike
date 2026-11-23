import NextLink from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-accent text-accent-contrast hover:bg-accent-strong",
  secondary: "border border-ink/20 text-ink hover:border-accent hover:text-accent",
  ghost: "text-ink hover:bg-surface-muted",
};

type Variant = keyof typeof variants;
const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors disabled:opacity-50";

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: Variant }) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentPropsWithoutRef<typeof NextLink> & { variant?: Variant }) {
  return <NextLink className={cn(base, variants[variant], className)} {...props} />;
}
