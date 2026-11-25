import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { GalleryBrowser, type GalleryPhoto } from "@/components/gallery/gallery-browser";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/layout";
import { getImages } from "@/lib/content";
import { imageSrc } from "@/lib/images";
import { ogImageFor, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gallery",
  description: `Photographs of ${site.name} in academic, civic and public engagements.`,
  openGraph: {
    title: `Gallery · ${site.name}`,
    description: `Photographs of ${site.name} in academic, civic and public engagements.`,
    url: `${site.url}/gallery`,
    images: [ogImageFor("gallery", "Gallery")],
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  portraits: "Portraits",
  academic: "Academic life",
  engagements: "Public engagements",
};
const CATEGORY_ORDER = ["portraits", "academic", "engagements"];

export default function GalleryPage() {
  const photos: GalleryPhoto[] = getImages()
    .filter((i) => i.galleryCategory)
    .sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.galleryCategory!) - CATEGORY_ORDER.indexOf(b.galleryCategory!) ||
        a.id.localeCompare(b.id),
    )
    .map((i) => ({
      id: i.id,
      src: imageSrc(i, Math.max(...i.widths), "jpg"),
      alt: i.alt,
      category: i.galleryCategory!,
      categoryLabel: CATEGORY_LABELS[i.galleryCategory!] ?? i.galleryCategory!,
      width: i.width,
      height: i.height,
    }));

  return (
    <>
      <Breadcrumbs items={[{ name: "Gallery" }]} />
      <Section className="pt-10 sm:pt-16" aria-labelledby="gallery">
        <Heading id="gallery" level={1} size={2} eyebrow="Gallery">
          In pictures
        </Heading>
        <p className="text-ink-muted mt-4 max-w-prose">
          A curated selection from academic life, public engagements and portraits. Select any photograph to view it
          larger; use the arrow keys to browse and Escape to close.
        </p>
        <div className="mt-10">
          <GalleryBrowser photos={photos} />
        </div>
      </Section>
    </>
  );
}
