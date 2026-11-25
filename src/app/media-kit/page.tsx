import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CopyButton } from "@/components/media-kit/copy-button";
import { Heading } from "@/components/ui/heading";
import { Prose, Section } from "@/components/ui/layout";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { getBio } from "@/lib/bio";
import { getProfile } from "@/lib/content";
import { imageById, imageSrc } from "@/lib/images";
import { ogImageFor, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Media kit",
  description: `Biographies, headshots, key facts and name forms for media coverage of ${site.name}.`,
  openGraph: {
    title: `Media kit · ${site.name}`,
    description: `Biographies, headshots, key facts and name forms for media coverage of ${site.name}.`,
    url: `${site.url}/media-kit`,
    images: [ogImageFor("media-kit", "Media kit")],
  },
};

const HEADSHOTS = [
  { id: "portrait-suit-charcoal", note: "Formal portrait" },
  { id: "portrait-kaftan-white-b", note: "Portrait in white kaftan" },
  { id: "portrait-tunic-maroon-thoughtful", note: "Portrait in maroon tunic" },
  { id: "portrait-traditional-cap-mustard-a", note: "Portrait in traditional cap" },
];

const NAME_FORMS = [
  { form: "Prof. Austin N. Nosike", use: "Default on this site" },
  { form: "Nosike Austin Njiribeako", use: "As on the CV" },
  { form: "Prof. Nosike Austin", use: "Used by ASCON" },
  { form: "Austin N. Nosike", use: "Used in publications" },
  { form: "Nosike, A. N.", use: "Author form in citations" },
];

export default function MediaKitPage() {
  const profile = getProfile();
  const shortBio = getBio("short").join("\n\n");
  const longBio = getBio("long").join("\n\n");
  const facts = [
    profile.role,
    ...profile.currentRoles.filter((r) => /African Academy|Journal Editors/.test(r)),
    ...(profile.keyFacts ?? []),
    `Languages: ${profile.languages.join(", ")}`,
  ];

  return (
    <>
      <Breadcrumbs items={[{ name: "Media kit" }]} />
      <Section className="pt-10 sm:pt-16" aria-labelledby="media-kit">
        <Heading id="media-kit" level={1} size={2} eyebrow="Media kit">
          Media kit
        </Heading>
        <Prose className="mt-4 max-w-2xl">
          <p>
            Everything here may be used in media coverage. For interviews, images at full resolution or fact checks, use
            the contact form. The public CV is available as a{" "}
            <a
              href="/cv/Nosike-CV-public.pdf"
              className="text-accent hover:text-accent-strong font-medium underline underline-offset-2"
            >
              downloadable PDF
            </a>
            .
          </p>
        </Prose>
      </Section>

      <Section tone="surface" aria-labelledby="introduce">
        <Heading id="introduce" level={2} size={3}>
          How to introduce him
        </Heading>
        <Prose className="mt-4 max-w-2xl">
          <p className="text-lg">{profile.positioningLine}.</p>
        </Prose>
        <div className="mt-6 max-w-2xl">
          <h3 className="text-sm font-semibold tracking-wide uppercase">Name forms</h3>
          <ul className="mt-3 space-y-2">
            {NAME_FORMS.map((n) => (
              <li key={n.form} className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-medium">{n.form}</span>
                <span className="text-ink-muted text-sm">{n.use}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section aria-labelledby="key-facts">
        <Heading id="key-facts" level={2} size={3}>
          Key facts
        </Heading>
        <dl className="mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact} className="border-line border-l-2 pl-4">
              <dd className="text-ink">{fact}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section tone="surface" aria-labelledby="bios">
        <Heading id="bios" level={2} size={3}>
          Biographies
        </Heading>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="font-semibold">Short bio</h3>
              <CopyButton text={shortBio} label="Copy short bio" />
            </div>
            <Prose>
              {getBio("short").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Prose>
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="font-semibold">Long bio</h3>
              <CopyButton text={longBio} label="Copy long bio" />
            </div>
            <Prose>
              {getBio("long").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Prose>
          </div>
        </div>
      </Section>

      <Section aria-labelledby="headshots">
        <Heading id="headshots" level={2} size={3}>
          Headshots
        </Heading>
        <p className="text-ink-muted mt-4 max-w-2xl text-sm">
          Approved portraits from the gallery. Downloads are the highest-resolution approved files; for print
          resolution, request the original via the contact form.
        </p>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HEADSHOTS.map(({ id, note }) => {
            const image = imageById(id);
            if (!image) return null;
            return (
              <li key={id} className="border-line rounded-card border p-3">
                <ResponsiveImage
                  image={image}
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                  className="bg-surface-muted block w-full overflow-hidden rounded-md"
                />
                <p className="text-ink-muted mt-2 text-sm">{note}</p>
                <a
                  href={imageSrc(image, 480, "jpg")}
                  download={`${id}-480.jpg`}
                  className="text-accent hover:text-accent-strong mt-1 inline-block text-sm font-medium underline underline-offset-2"
                >
                  Download JPEG
                </a>
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
