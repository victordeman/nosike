import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// Statically imported so the hashes are bundled into the server output — a runtime
// file read is not traced by Vercel's NFT packaging and would silently vanish.
import manifest from "../csp-hashes.json";

type Manifest = { routes: Record<string, string[]>; fallback: string[] };

const hashesManifest = manifest as Manifest;
const isDev = process.env.NODE_ENV === "development";

const BASE_DIRECTIVES = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
];

function cspFor(pathname: string): string {
  if (isDev) {
    return [...BASE_DIRECTIVES, "script-src 'self' 'unsafe-inline' 'unsafe-eval'", "connect-src 'self' ws:"].join("; ");
  }
  const hashes = hashesManifest.routes[pathname] ?? hashesManifest.fallback;
  const scriptSrc = ["'self'", ...hashes.map((h) => `'sha256-${h}'`)].join(" ");
  return [...BASE_DIRECTIVES, `script-src ${scriptSrc}`, "connect-src 'self'", "upgrade-insecure-requests"].join("; ");
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", cspFor(request.nextUrl.pathname));
  return response;
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico|cv|og).*)",
};
