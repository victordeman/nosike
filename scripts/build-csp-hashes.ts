/**
 * Postbuild step: computes CSP script hashes from the prerendered HTML so
 * src/proxy.ts can serve a strict, static-friendly CSP (no 'unsafe-inline')
 * while pages remain statically generated.
 *
 * Two layouts are supported:
 * - .next/output/functions/…*.prerender-fallback.html — Vercel remote
 *   builds, where Vercel's onBuildComplete hook moves prerendered HTML out
 *   of .next/server/app before this script runs.
 * - .next/server/app/…*.html — plain local `next build`.
 *
 * Output: csp-hashes.json (gitignored, regenerated on every build).
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = "csp-hashes.json";

const VERCEL_DIR = ".next/output/functions";
const APP_DIR = ".next/server/app";

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
  });
}

function pickRoot(): { dir: string; strip: string } | null {
  const vercelFiles = walk(VERCEL_DIR);
  if (vercelFiles.length > 0) return { dir: VERCEL_DIR, strip: ".prerender-fallback.html" };
  const appFiles = walk(APP_DIR);
  if (appFiles.length > 0) return { dir: APP_DIR, strip: ".html" };
  return null;
}

function routeOf(file: string, dir: string, strip: string): string {
  let rel = relative(dir, file);
  if (rel.endsWith(strip)) rel = rel.slice(0, -strip.length);
  else if (rel.endsWith(".html")) rel = rel.slice(0, -".html".length);
  if (rel === "index") return "/";
  return `/${rel}`;
}

/** Inline executable scripts only: no src, no non-JS type (e.g. ld+json). */
function inlineScripts(html: string): string[] {
  const out: string[] = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const type = /type\s*=\s*"([^"]+)"/.exec(attrs)?.[1];
    if (/\bsrc\s*=/.test(attrs)) continue;
    if (type && type !== "text/javascript" && type !== "module" && type !== "importmap") continue;
    out.push(m[2]);
  }
  return out;
}

function hashesFor(html: string): string[] {
  return [...new Set(inlineScripts(html).map((s) => createHash("sha256").update(s).digest("base64")))];
}

const root = pickRoot();
if (!root) {
  console.error(
    `build-csp-hashes: no prerendered HTML found in ${VERCEL_DIR} or ${APP_DIR}. ` +
      "Refusing to write an empty manifest (that would break hydration via CSP)."
  );
  process.exit(1);
}

const routes: Record<string, string[]> = {};
const fallback = new Set<string>();

for (const file of walk(root.dir)) {
  const route = routeOf(file, root.dir, root.strip);
  const hashes = hashesFor(readFileSync(file, "utf8"));
  routes[route] = hashes;
  if (route === "/_not-found" || route === "/_global-error") {
    hashes.forEach((h) => fallback.add(h));
  }
}

// Vercel serves the error pages as static files (.next/output/static/404.html,
// 500.html) outside the functions dir. Requests to unknown paths hit the
// fallback policy, so those scripts must be allowed there too.
for (const file of walk(".next/output/static")) {
  if (!file.endsWith(".html")) continue;
  hashesFor(readFileSync(file, "utf8")).forEach((h) => fallback.add(h));
}

writeFileSync(OUT, JSON.stringify({ routes, fallback: [...fallback] }, null, 2) + "\n");
const total = Object.values(routes).reduce((n, h) => n + h.length, 0);
console.log(`csp-hashes.json: ${Object.keys(routes).length} routes, ${total} hashes (from ${root.dir})`);
