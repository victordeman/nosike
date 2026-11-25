import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { Heading } from "@/components/ui/heading";
import { Prose, Section } from "@/components/ui/layout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name} — speaking invitations, research collaboration, media and institutional enquiries.`,
  openGraph: {
    title: `Contact · ${site.name}`,
    description: `Get in touch with ${site.name} — speaking invitations, research collaboration, media and institutional enquiries.`,
    url: `${site.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <Section className="pt-10 sm:pt-16" aria-labelledby="contact">
      <Heading id="contact" level={1} size={2} eyebrow="Contact">
        Get in touch
      </Heading>
      <Prose className="mt-4 max-w-2xl">
        <p>
          For speaking invitations, research collaboration, media requests or institutional and advisory
          enquiries, use the form below. Your details are used only to respond to your message and are never
          published.
        </p>
      </Prose>
      <div className="mt-8 max-w-2xl">
        <ContactForm />
      </div>
    </Section>
  );
}
