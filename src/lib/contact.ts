import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ContactFormInput } from "./contact-schema";

export type Enquiry = ContactFormInput & { receivedAt: string };

/** Minimum time (ms) a human needs to fill the form; faster submits are treated as spam. */
export const MIN_FILL_MS = 2000;

export function tooFast(startedAt: number, now = Date.now()): boolean {
  return now - startedAt < MIN_FILL_MS;
}

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

/** Fixed-window per-IP limiter. In-memory stop-gap; swap for Upstash when configured (SPEC §Tech). */
export function rateLimitOk(key: string, now = Date.now(), max = MAX_PER_WINDOW): boolean {
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

/** Test hook: reset limiter state between unit tests. */
export function resetRateLimit(): void {
  hits.clear();
}

function enquiryText(e: Enquiry): string {
  return [
    "New enquiry via the website",
    "",
    `Name: ${e.name}`,
    `Email: ${e.email}`,
    `Organisation: ${e.organisation || "—"}`,
    `Enquiry type: ${e.enquiryType}`,
    `Consent to be contacted: yes`,
    `Received: ${e.receivedAt}`,
    "",
    "Message:",
    e.message,
  ].join("\n");
}

async function sendViaResend(e: Enquiry): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL,
      to: [process.env.CONTACT_TO_EMAIL],
      reply_to: e.email,
      subject: `Website enquiry (${e.enquiryType}): ${e.name}`,
      text: enquiryText(e),
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}`);
}

function sendViaMock(e: Enquiry): void {
  const file = process.env.CONTACT_MOCK_FILE ?? join("tmp", "contact-submissions.jsonl");
  mkdirSync(dirname(file), { recursive: true });
  appendFileSync(file, `${JSON.stringify(e)}\n`);
}

/**
 * Transport selection: explicit mock (tests) → Resend (when env is complete)
 * → log-only fallback so the form works in development before env vars exist.
 */
export async function deliverEnquiry(e: Enquiry): Promise<{ mode: "mock" | "resend" | "log" }> {
  if (process.env.CONTACT_TRANSPORT === "mock") {
    sendViaMock(e);
    return { mode: "mock" };
  }
  if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL && process.env.CONTACT_FROM_EMAIL) {
    await sendViaResend(e);
    return { mode: "resend" };
  }
  if (process.env.NODE_ENV === "production") {
    // Never silently discard a real enquiry: fail loudly so the sender sees an error.
    throw new Error("Contact transport is not configured (RESEND_API_KEY/CONTACT_TO_EMAIL/CONTACT_FROM_EMAIL)");
  }
  console.info(`[contact] no transport configured; enquiry (${e.enquiryType}) from ${e.name} <${e.email}>`);
  return { mode: "log" };
}
