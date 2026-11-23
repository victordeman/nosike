import NextLink from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type LinkProps = ComponentPropsWithoutRef<typeof NextLink>;

/** Internal links use next/link; external links open in a new tab with an accessible hint. */
export function Link({ href, className, children, ...props }: LinkProps) {
  const classes = cn("text-accent underline decoration-1 underline-offset-4 hover:decoration-2", className);
  const external = typeof href === "string" && /^https?:\/\//.test(href);
  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <NextLink href={href} className={classes} {...props}>
      {children}
    </NextLink>
  );
}
