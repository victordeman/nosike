import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/contact-schema";
import { deliverEnquiry, rateLimitOk, tooFast } from "@/lib/contact";

const MAX_BODY_BYTES = 20_000;

/** Reads the body with a hard byte cap, so chunked/streamed requests cannot bypass the limit. */
async function readLimitedBody(request: Request): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const buffer = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(buffer);
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "too-large" }, { status: 413 });
  }

  let body: unknown;
  try {
    const text = await readLimitedBody(request);
    if (text === null) {
      return NextResponse.json({ error: "too-large" }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Honeypot first: silently-shaped rejection before any validation detail leaks.
  const rawWebsite = (body as { website?: unknown })?.website;
  if (typeof rawWebsite === "string" && rawWebsite.trim() !== "") {
    return NextResponse.json({ error: "spam" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json({ error: "validation", fields }, { status: 400 });
  }

  const data = parsed.data;
  if (tooFast(data.startedAt)) {
    return NextResponse.json({ error: "too-fast" }, { status: 400 });
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const maxPerWindow = Number(process.env.CONTACT_RATE_LIMIT_MAX ?? "") || undefined;
  if (!rateLimitOk(ip, Date.now(), maxPerWindow)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  try {
    await deliverEnquiry({ ...data, receivedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[contact] delivery failed", error);
    return NextResponse.json({ error: "send-failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
