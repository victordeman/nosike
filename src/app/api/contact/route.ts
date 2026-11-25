import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/contact-schema";
import { deliverEnquiry, rateLimitOk, tooFast } from "@/lib/contact";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
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
