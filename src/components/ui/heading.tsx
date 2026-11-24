import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const sizes = {
  display: "text-display font-semibold",
  1: "text-4xl sm:text-5xl font-semibold leading-tight",
  2: "text-3xl sm:text-4xl font-semibold leading-tight",
  3: "text-xl sm:text-2xl font-semibold leading-snug",
  4: "text-lg font-semibold",
} as const;

type HeadingProps = {
  level?: 1 | 2 | 3 | 4;
  size?: keyof typeof sizes;
  eyebrow?: ReactNode;
  id?: string;
  className?: string;
  children: ReactNode;
};

export function Heading({ level = 2, size, eyebrow, id, className, children }: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <div className={cn("space-y-3", className)}>
      {eyebrow ? (
        <p className="text-gold font-sans text-sm font-semibold tracking-[0.14em] uppercase">{eyebrow}</p>
      ) : null}
      <Tag id={id} className={sizes[size ?? level]}>
        {children}
      </Tag>
    </div>
  );
}
