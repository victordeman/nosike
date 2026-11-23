"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import type { NavItem } from "@/lib/site";

export function MobileNav({ items }: { items: NavItem[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
        }}
        className="text-ink hover:bg-surface-muted inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold lg:hidden"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span className="sr-only sm:not-sr-only">Menu</span>
      </button>
      <dialog
        id="mobile-nav"
        ref={dialog}
        aria-label="Site menu"
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="bg-surface text-ink backdrop:bg-ink/40 m-0 ml-auto h-dvh max-h-none w-[min(22rem,100vw)] max-w-none p-0 lg:hidden"
      >
        <div className="border-line flex items-center justify-between border-b px-5 py-4">
          <span className="font-serif text-lg font-semibold">Menu</span>
          <button
            type="button"
            onClick={close}
            className="hover:bg-surface-muted inline-flex size-11 items-center justify-center rounded-full"
            aria-label="Close menu"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <nav aria-label="Mobile">
          <ul className="space-y-1 p-3">
            {items.map((item) => (
              <li key={item.href}>
                <NextLink
                  href={item.href}
                  onClick={close}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="hover:bg-surface-muted aria-[current=page]:text-accent block rounded-lg px-4 py-3 text-base font-medium"
                >
                  {item.label}
                </NextLink>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </>
  );
}
