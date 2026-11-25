import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact-schema";
import { MIN_FILL_MS, rateLimitOk, resetRateLimit, tooFast } from "@/lib/contact";

const valid = {
  name: "Ada Example",
  email: "ada@example.org",
  organisation: "Example University",
  enquiryType: "Speaking" as const,
  message: "We would like to invite Prof. Nosike to speak at our conference.",
  consent: true,
  website: "",
  startedAt: Date.now() - MIN_FILL_MS - 1,
};

describe("contactSchema", () => {
  it("accepts a complete enquiry", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a bad email", () => {
    expect(contactSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects missing consent", () => {
    expect(contactSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });

  it("rejects an unknown enquiry type", () => {
    expect(contactSchema.safeParse({ ...valid, enquiryType: "Spam" }).success).toBe(false);
  });

  it("rejects a too-short message", () => {
    expect(contactSchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
  });

  it("allows an empty organisation", () => {
    expect(contactSchema.safeParse({ ...valid, organisation: "" }).success).toBe(true);
  });
});

describe("tooFast", () => {
  it("flags submits faster than the minimum fill time", () => {
    const now = 100_000;
    expect(tooFast(now - MIN_FILL_MS + 1, now)).toBe(true);
    expect(tooFast(now - MIN_FILL_MS - 1, now)).toBe(false);
  });
});

describe("rateLimitOk", () => {
  it("allows 5 submissions per window per IP, then blocks", () => {
    resetRateLimit();
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) expect(rateLimitOk("1.2.3.4", now)).toBe(true);
    expect(rateLimitOk("1.2.3.4", now)).toBe(false);
  });

  it("tracks IPs independently and resets after the window", () => {
    resetRateLimit();
    const now = 2_000_000;
    for (let i = 0; i < 5; i++) rateLimitOk("1.2.3.4", now);
    expect(rateLimitOk("5.6.7.8", now)).toBe(true);
    expect(rateLimitOk("1.2.3.4", now + 10 * 60 * 1000 + 1)).toBe(true);
  });
});
