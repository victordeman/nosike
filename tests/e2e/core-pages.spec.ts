import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/", heading: "Prof. Austin N. Nosike" },
  { path: "/about", heading: "Prof. Austin N. Nosike" },
  { path: "/leadership", heading: "Career timeline" },
  { path: "/education", heading: "Degrees & training" },
];

test("all core routes render with a level-1 heading", async ({ page }) => {
  for (const { path, heading } of PAGES) {
    await page.goto(path);
    await expect(page.locator("h1").first()).toContainText(heading);
  }
});

test("every image has alt text", async ({ page }) => {
  for (const { path } of PAGES) {
    await page.goto(path);
    const images = page.locator("main img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveAttribute("alt", /.+/);
    }
  }
});

test("career timeline filters work by keyboard", async ({ page }) => {
  await page.goto("/leadership");
  const all = page.getByRole("button", { name: "All roles" });
  await all.focus();
  await expect(all).toBeFocused();
  const academic = page.getByRole("button", { name: "Academic", exact: true });
  await academic.press("Enter");
  await expect(academic).toHaveAttribute("aria-pressed", "true");
  const timeline = page.getByRole("list", { name: "Career timeline" });
  await expect(timeline.getByRole("listitem")).not.toHaveCount(0);
  await page.getByRole("button", { name: "Visiting & concurrent" }).press("Enter");
  await expect(timeline.getByRole("listitem").first()).toContainText("Visiting");
  await page.getByRole("button", { name: "All roles" }).press("Enter");
  await expect(timeline.getByRole("listitem").first()).toContainText("Vice Chancellor/President");
});

test("map has an accessible text alternative", async ({ page }) => {
  await page.goto("/leadership#footprint");
  const map = page.getByRole("img", { name: /Map of countries/ });
  await expect(map).toBeVisible();
  await expect(page.getByText(/Nigeria/).first()).toBeAttached();
});
