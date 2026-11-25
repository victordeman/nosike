/**
 * Postbuild step: computes CSP script hashes from the prerendered HTML in
 * .next/server/app so src/proxy.ts can serve a strict, static-friendly CSP
 * (no 'unsafe-inline') while pages remain statically generated.
 * Output: csp-hashes.json (gitignored, regenerated on every build).
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const APP_DIR = ".next/server/app";
const OUT = "csp-hashes.json";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
  });
}

function routeOf(file: string): string {
  const rel = relative(APP_DIR, file).replace(/\.html$/, "");
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

const routes: Record<string, string[]> = {};
const fallback = new Set<string>();

for (const file of walk(APP_DIR)) {
  const route = routeOf(file);
  const hashes = hashesFor(readFileSync(file, "utf8"));
  routes[route] = hashes;
  if (route === "/_not-found" || route === "/_global-error") {
    hashes.forEach((h) => fallback.add(h));
  }
}

writeFileSync(OUT, JSON.stringify({ routes, fallback: [...fallback] }, null, 2) + "\n");
const total = Object.values(routes).reduce((n, h) => n + h.length, 0);
console.log(`csp-hashes.json: ${Object.keys(routes).length} routes, ${total} hashes`);
