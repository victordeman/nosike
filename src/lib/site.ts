export const site = {
  name: "Prof. Austin N. Nosike",
  role: "Vice Chancellor/President, James Hope University",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
};

export type NavItem = { href: string; label: string };

export const primaryNav: NavItem[] = [
  { href: "/about", label: "About" },
  { href: "/leadership", label: "Leadership" },
  { href: "/scholarship", label: "Scholarship" },
  { href: "/policy", label: "Policy" },
  { href: "/mentorship", label: "Mentorship" },
  { href: "/talks", label: "Talks" },
];

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Profile",
    items: [
      { href: "/about", label: "About" },
      { href: "/leadership", label: "Leadership" },
      { href: "/education", label: "Education" },
      { href: "/honours", label: "Honours" },
    ],
  },
  {
    heading: "Work",
    items: [
      { href: "/scholarship", label: "Scholarship" },
      { href: "/scholarship/proceedings", label: "Proceedings" },
      { href: "/events", label: "Events" },
      { href: "/policy", label: "Policy & consultancy" },
      { href: "/mentorship", label: "Mentorship" },
    ],
  },
  {
    heading: "Media",
    items: [
      { href: "/talks", label: "Talks" },
      { href: "/gallery", label: "Gallery" },
      { href: "/media-kit", label: "Media kit" },
      { href: "/contact", label: "Contact" },
    ],
  },
];
