import NextLink from "next/link";
import { footerNav, primaryNav, site } from "@/lib/site";
import { ButtonLink, Container } from "@/components/ui";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

const allItems = [{ href: "/", label: "Home" }, ...footerNav.flatMap((g) => g.items)];

export function Header() {
  return (
    <header className="border-line bg-paper/90 supports-[backdrop-filter]:bg-paper/75 sticky top-0 z-40 border-b backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <NextLink href="/" className="text-ink font-serif text-lg font-semibold whitespace-nowrap">
          {site.name}
        </NextLink>
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          <NavLinks items={primaryNav} />
          <ButtonLink href="/contact" variant="secondary" className="ml-2 hidden lg:inline-flex">
            Contact
          </ButtonLink>
        </nav>
        <div className="flex items-center gap-1 lg:-mr-2">
          <ThemeToggle />
          <MobileNav items={allItems} />
        </div>
      </Container>
    </header>
  );
}
