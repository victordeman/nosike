import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Publication } from "./schemas";
import { getProfile, getPublications } from "./content";
import {
  buildExplorerItems,
  type ExplorerItem,
  type ThemeMapFile,
} from "./scholarship-core";

export * from "./scholarship-core";

export function getThemeMap(): ThemeMapFile {
  const raw = readFileSync(join(process.cwd(), "content", "themes.json"), "utf8");
  return JSON.parse(raw) as ThemeMapFile;
}

export function getExplorerItems(): ExplorerItem[] {
  return buildExplorerItems(getPublications(), getProfile(), getThemeMap());
}

export function getBooks(): Publication[] {
  return getPublications().filter((p) => p.kind === "book");
}
