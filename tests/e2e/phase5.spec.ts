import { expect, test } from "@playwright/test";

test("policy page groups roles by institution", async ({ page }) => {
  await page.goto("/policy");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Policy & consultancy");
  await expect(page.getByRole("heading", { name: "African Union Commission" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Higher-education regulators" })).toBeVisible();
  await expect(page.getByText(/worked as a journalist/)).toBeVisible();
  // unconfirmed regulator name carries a pending badge
  await expect(page.getByText("Kenyan University Commission (exact name to confirm)")).toBeVisible();
});

test("mentorship page shows approved supervision figures only", async ({ page }) => {
  await page.goto("/mentorship");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Supervision & examination");
  await expect(page.getByText("12", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("38", { exact: true }).first()).toBeVisible();
  // the unconfirmed "18 professorial promotion assessments" claim must not appear as a fact
  await expect(page.getByText(/18 professorial promotion assessments/)).toHaveCount(0);
  await expect(page.getByText("Bindura University of Science Education (BUSE)")).toBeVisible();
});

test("honours page features the 2025 alumni award and groups the rest", async ({ page }) => {
  await page.goto("/honours");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Awards & recognition");
  await expect(page.getByText("University of Nigeria Alumni ICON Award")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Awards & prizes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Biographical listings" })).toBeVisible();
  await expect(page.getByText(/Dictionary of International Biography/)).toBeVisible();
});

test("talks page features the ASCON session without deck figures", async ({ page }) => {
  await page.goto("/talks");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Talks & lectures");
  await expect(page.getByRole("heading", { name: "Performance Dashboards" })).toBeVisible();
  await expect(page.getByText(/Leadership for Policy Execution/)).toHaveCount(0); // theme is in venue text? check
  await expect(page.locator("main").getByRole("link", { name: "Get in touch" })).toBeVisible();
});

test("gallery lightbox opens, navigates and closes with keyboard", async ({ page }) => {
  await page.goto("/gallery");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("In pictures");
  const thumbs = page.getByRole("button", { name: /^Open photo:/ });
  await expect(thumbs).toHaveCount(10);

  await thumbs.first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const caption = dialog.locator("figcaption");
  const firstCaption = await caption.textContent();
  await expect(firstCaption).toBeTruthy();

  await page.keyboard.press("ArrowRight");
  await expect(caption).not.toHaveText(firstCaption ?? "");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(thumbs.first()).toBeFocused();
});
