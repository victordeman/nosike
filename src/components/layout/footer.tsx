import { footerNav, site } from "@/lib/site";
import { ButtonLink, Container, Link } from "@/components/ui";

export function Footer() {
  return (
    <footer className="border-line bg-surface border-t">
      <Container className="grid gap-12 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <p className="font-serif text-xl font-semibold">{site.name}</p>
          <p className="text-ink-muted max-w-xs text-sm">{site.role}</p>
          <ButtonLink href="/contact">Get in touch</ButtonLink>
        </div>
        {footerNav.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <h2 className="text-gold font-sans text-sm font-semibold tracking-[0.14em] uppercase">{group.heading}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-ink-muted hover:text-ink no-underline hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <Container className="border-line text-ink-muted border-t py-6 text-sm">
        <p>© {site.name}. All rights reserved.</p>
      </Container>
    </footer>
  );
}
