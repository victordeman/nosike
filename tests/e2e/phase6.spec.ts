import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type APIRequestContext } from "@playwright/test";

const MOCK_FILE = join(process.cwd(), "tmp", "e2e-contact.jsonl");

function mockDeliveries(): string {
  return existsSync(MOCK_FILE) ? readFileSync(MOCK_FILE, "utf8") : "";
}

const baseEnquiry = {
  name: "Test Sender",
  email: "sender@example.org",
  organisation: "",
  enquiryType: "Media",
  message: "This is a test enquiry long enough to pass validation.",
  consent: true,
  website: "",
  startedAt: Date.now() - 5000,
};

test.describe("contact API", () => {
  test("accepts a valid enquiry and records it via the mock transport", async ({ request }) => {
    const marker = `marker-${Date.now()}`;
    const res = await request.post("/api/contact", {
      data: { ...baseEnquiry, name: marker, email: `${marker}@example.org` },
    });
    expect(res.status()).toBe(200);
    await expect
      .poll(() => mockDeliveries().includes(marker), { timeout: 5000 })
      .toBe(true);
  });

  test("rejects honeypot submissions", async ({ request }) => {
    const marker = `honeypot-${Date.now()}`;
    const res = await request.post("/api/contact", {
      data: { ...baseEnquiry, name: marker, website: "https://spam.example" },
    });
    expect(res.status()).toBe(400);
    expect(mockDeliveries()).not.toContain(marker);
  });

  test("rejects too-fast submissions", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: { ...baseEnquiry, startedAt: Date.now() },
    });
    expect(res.status()).toBe(400);
  });

  test("rejects invalid payloads with field errors", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: { ...baseEnquiry, email: "not-an-email" },
    });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { fields?: Record<string, string> };
    expect(body.fields?.email).toBeTruthy();
  });
});

test("contact page form submits successfully and shows the success state", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Get in touch");
  // No email address is published anywhere on the page.
  await expect(page.locator("main")).not.toContainText(/@[a-z0-9.-]+\.[a-z]{2,}/i);

  const marker = `ui-${Date.now()}`;
  await page.getByLabel("Name", { exact: true }).fill(marker);
  await page.getByLabel("Email", { exact: true }).fill(`${marker}@example.org`);
  await page.getByRole("radio", { name: "Media" }).check();
  await page
    .getByLabel("Message")
    .fill("Hello, this is a browser test of the contact form. Please ignore.");
  await page.getByLabel(/I agree to be contacted/).check();
  // The form enforces a minimum fill time server-side; wait it out like a human would.
  await page.waitForTimeout(2100);
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByRole("status")).toContainText("Message sent");
  await expect
    .poll(() => mockDeliveries().includes(marker), { timeout: 5000 })
    .toBe(true);
});

test("contact form shows field errors for invalid input", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Please enter your name.")).toBeVisible();
  await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
});

test("media kit shows bios, name forms and headshot downloads", async ({ page }) => {
  await page.goto("/media-kit");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Media kit");
  await expect(page.getByRole("link", { name: "downloadable PDF" })).toHaveAttribute(
    "href",
    "/cv/Nosike-CV-public.pdf",
  );
  await expect(page.getByText("How to introduce him")).toBeVisible();
  await expect(page.getByText("Nosike, A. N.")).toBeVisible();
  await expect(page.getByText("Won 15 research grants")).toBeVisible();
  await expect(page.getByText(/18 candidates to professorial rank/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy short bio" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy long bio" })).toBeVisible();
  const download = page.getByRole("link", { name: "Download JPEG" }).first();
  await expect(download).toHaveAttribute("href", /\/images\/portrait-[a-z-]+-480\.jpg/);
});

test("public CV PDF is served", async ({ request }: { request: APIRequestContext }) => {
  const res = await request.get("/cv/Nosike-CV-public.pdf");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/pdf");
});
