import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Bios are plain-prose MDX (no markdown syntax); front matter carries the client-approval line. */
export type BioKind = "short" | "long";

export function getBio(kind: BioKind): string[] {
  const file = kind === "short" ? "bio-short.mdx" : "bio-long.mdx";
  const raw = readFileSync(join(process.cwd(), "content", file), "utf8").replace(/\r\n/g, "\n");
  const body = raw.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}
