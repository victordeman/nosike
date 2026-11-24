import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Profile, Publication } from "../src/lib/schemas.ts";
import { buildExplorerItems, type ThemeMapFile } from "../src/lib/scholarship-core.ts";

/** Build-time search index (SPEC Phase 4): slim publication docs, lazy-fetched by the explorer. */
const root = process.cwd();
const pubs = JSON.parse(readFileSync(join(root, "content", "publications.json"), "utf8")) as Publication[];
const profile = JSON.parse(readFileSync(join(root, "content", "profile.json"), "utf8")) as Profile;
const themeMap = JSON.parse(readFileSync(join(root, "content", "themes.json"), "utf8")) as ThemeMapFile;

const items = buildExplorerItems(pubs, profile, themeMap).map((i) => ({
  id: i.id,
  title: i.title,
  authors: i.authors,
  year: i.year,
  kind: i.kind,
  kindLabel: i.kindLabel,
  venue: i.venue,
  themes: i.themes,
}));

const out = join(root, "public", "search-index.json");
writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), items }));
console.log(`search index: ${items.length} publications -> public/search-index.json`);
