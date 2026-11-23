"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/site";

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <ul className="hidden items-center gap-1 lg:flex">
      {items.map((item) => {
        const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <NextLink
              href={item.href}
              aria-current={current ? "page" : undefined}
              className="text-ink-muted hover:text-ink aria-[current=page]:text-accent rounded-full px-3 py-2 text-sm font-medium"
            >
              {item.label}
            </NextLink>
          </li>
        );
      })}
    </ul>
  );
}
