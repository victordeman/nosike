import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** Public indexable routes. `/api/*` and the PDF assets are excluded. */
const routes: { path: string; priority: number; changeFrequency: "monthly" | "yearly" }[] = [
  { path: "", priority: 1, changeFrequency: "monthly" },
  { path: "/about", priority: 0.9, changeFrequency: "yearly" },
  { path: "/leadership", priority: 0.8, changeFrequency: "yearly" },
  { path: "/education", priority: 0.8, changeFrequency: "yearly" },
  { path: "/scholarship", priority: 0.9, changeFrequency: "monthly" },
  { path: "/scholarship/proceedings", priority: 0.7, changeFrequency: "yearly" },
  { path: "/events", priority: 0.6, changeFrequency: "monthly" },
  { path: "/policy", priority: 0.7, changeFrequency: "yearly" },
  { path: "/mentorship", priority: 0.6, changeFrequency: "yearly" },
  { path: "/honours", priority: 0.6, changeFrequency: "yearly" },
  { path: "/talks", priority: 0.7, changeFrequency: "yearly" },
  { path: "/gallery", priority: 0.5, changeFrequency: "yearly" },
  { path: "/media-kit", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${site.url}${path}`,
    changeFrequency,
    priority,
  }));
}
