import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Prose, Section } from "@/components/ui/layout";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { getBio } from "@/lib/bio";
import { getProfile } from "@/lib/content";
import { imagesByRole } from "@/lib/images";
import { ogImage, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Biography of ${site.name} — ${site.role}. Research interests, languages and values.`,
  openGraph: {
    title: `About · ${site.name}`,
    description: `Biography of ${site.name} — ${site.role}. Research interests, languages and values.`,
    url: `${site.url}/about`,
    images: [ogImage],
  },
};

export default function AboutPage() {
  const profile = getProfile();
  const shortBio = getBio("short");
  const longBio = getBio("long");
  const photos = imagesByRole("about");

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.displayName,
    alternateName: profile.formalName,
    jobTitle: "Vice Chancellor/President",
    worksFor: { "@type": "CollegeOrUniversity", name: "James Hope University" },
    description: profile.positioningLine,
    knowsLanguage: profile.languages,
    url: `${site.url}/about`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <Section className="pt-10 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Heading level={1} size={1} eyebrow="About">
              {profile.displayName}
            </Heading>
            <Prose className="mt-8">
              {shortBio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </Prose>
            {longBio.length > 0 ? (
              <details className="border-line mt-8 rounded-card border bg-surface p-6">
                <summary className="cursor-pointer text-lg font-semibold">Read the full biography</summary>
                <Prose className="mt-6">
                  {longBio.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </Prose>
              </details>
            ) : null}
          </div>

          <div className="space-y-8">
            <div>
              <Heading level={2} size={4}>
                Research interests
              </Heading>
              <ul className="mt-4 flex flex-wrap gap-2">
                {profile.researchInterests.map((interest) => (
                  <li key={interest}>
                    <Badge tone="neutral">{interest}</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Heading level={2} size={4}>
                Languages
              </Heading>
              <p className="text-ink-muted mt-2">{profile.languages.join(", ")}</p>
            </div>
            <div>
              <Heading level={2} size={4}>
                Values
              </Heading>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                {profile.values.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {photos.length > 0 ? (
        <Section tone="surface" aria-labelledby="photos">
          <Heading id="photos" level={2} size={2} className="mb-10">
            In pictures
          </Heading>
          <div className="grid gap-6 sm:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-paper overflow-hidden rounded-card shadow-card">
                <ResponsiveImage
                  image={photo}
                  sizes="(min-width: 640px) 30vw, 90vw"
                  className="aspect-[3/4]"
                  imgClassName="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
