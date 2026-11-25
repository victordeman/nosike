import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/layout";
import { site } from "@/lib/site";

export type Crumb = { name: string; href?: string };

/** Visible breadcrumb trail plus BreadcrumbList structured data. The last crumb has no href. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const crumbs = [{ name: "Home", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      ...(crumb.href ? { item: `${site.url}${crumb.href}` } : {}),
    })),
  };

  return (
    <Container className="pt-8">
      <nav aria-label="Breadcrumb">
        <ol className="text-ink-muted flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {crumbs.map((crumb, i) => (
            <li key={crumb.href ?? crumb.name} className="flex items-center gap-x-2">
              {i > 0 ? <span aria-hidden="true">/</span> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-accent transition-colors">
                  {crumb.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink font-medium">
                  {crumb.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={jsonLd} />
    </Container>
  );
}
