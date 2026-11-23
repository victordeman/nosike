/**
 * Privacy gate (SPEC §2.1). Fails if tracked files (or a given build directory)
 * contain personal contact data, birth dates, or raw source documents.
 *
 *   node scripts/check-privacy.ts            # scan staged (index) + untracked files
 *   node scripts/check-privacy.ts .next out  # also scan build output directories
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

const ALLOWED_DOCUMENTS = new Set(["public/cv/Nosike-CV-public.pdf"]);
const FORBIDDEN_EXTENSIONS = new Set([".pdf", ".docx", ".pptx", ".zip"]);
// Files that legitimately describe the rules themselves.
const PATTERN_EXEMPT = new Set(["SPEC.md", "scripts/check-privacy.ts"]);
const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".ico", ".woff", ".woff2", ".ttf", ".otf", ".pdf",
]);

const PATTERNS: Array<[string, RegExp]> = [
  ["personal Gmail address", /@gmail\.com/i],
  ["Nigerian phone number (+234)", /\+\s?234/],
  ["Nigerian mobile number", /(?<![\d.])0[789][01]\d[\s-]?\d{3}[\s-]?\d{4}(?!\d)/],
  ["date of birth", /date\s+of\s+birth/i],
  ["marital status", /marital\s+status/i],
];

function git(args: string[]): string[] {
  return execFileSync("git", args, { encoding: "utf8" }).split("\0").filter(Boolean);
}

// Index content is what a commit will contain, so tracked files are read from the index, not the working tree.
const indexed = new Set(git(["ls-files", "--cached", "-z"]));
const read = (file: string) =>
  indexed.has(file)
    ? execFileSync("git", ["show", `:${file}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
    : readFileSync(file, "utf8");

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "cache") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

const violations: string[] = [];
const toPosix = (p: string) => p.split(sep).join("/");
const files = [...indexed, ...git(["ls-files", "--others", "--exclude-standard", "-z"]), ...process.argv.slice(2).flatMap(walk)].map((f) => toPosix(relative(".", f)));

for (const file of new Set(files)) {
  const ext = extname(file).toLowerCase();
  if (FORBIDDEN_EXTENSIONS.has(ext) && !ALLOWED_DOCUMENTS.has(file)) {
    violations.push(`${file}: raw ${ext} document must not be committed or published`);
    continue;
  }
  if (file.startsWith("_sources/")) {
    violations.push(`${file}: client source files must stay out of the repository`);
    continue;
  }
  if (PATTERN_EXEMPT.has(file) || BINARY_EXTENSIONS.has(ext)) continue;
  const text = read(file);
  text.split("\n").forEach((line, i) => {
    for (const [label, re] of PATTERNS) {
      if (re.test(line)) violations.push(`${file}:${i + 1}: ${label}`);
    }
  });
}

if (violations.length) {
  console.error(`Privacy check failed (${violations.length}):\n  ${violations.join("\n  ")}`);
  process.exit(1);
}
console.log(`Privacy check passed (${new Set(files).size} files).`);
