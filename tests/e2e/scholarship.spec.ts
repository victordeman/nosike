import { expect, test } from "@playwright/test";

test("scholarship explorer filters by type and theme", async ({ page }) => {
  await page.goto("/scholarship");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Publications");
  await page.locator("#f-type").selectOption("journal-article");
  await expect(page.getByText(/Showing \d+ of \d+ publications/)).toContainText("Showing 32 of 98 publications");
  await page.locator("#f-theme").selectOption("gender-development");
  const list = page.getByRole("list", { name: "Publications" });
  await expect(list.getByRole("listitem").first()).toContainText(/gender/i);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByText(/Showing \d+ of 98 publications/)).toBeVisible();
});

test("scholarship explorer search and deep links", async ({ page }) => {
  await page.goto("/scholarship?q=gender&type=journal-article");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Publications");
  // deep-linked query is applied after hydration
  await expect(page.locator("#f-q")).toHaveValue("gender");
  await expect(page.locator("#f-type")).toHaveValue("journal-article");
  const list = page.getByRole("list", { name: "Publications" });
  const items = list.getByRole("listitem");
  await expect(items.first()).toBeVisible();
  const count = await items.count();
  expect(count).toBeGreaterThan(0);
  // fuzzy search: known gender papers surface, noise does not
  await expect(list).toContainText("Gender, Education and Development");
  await expect(list).not.toContainText("Effective Leadership in Public and Private Sector");
  // URL stays deep-linkable as filters change
  await page.locator("#f-decade").selectOption("2000s");
  await expect(page).toHaveURL(/decade=2000s/);
});

test("proceedings page lists five volumes with identifiers", async ({ page }) => {
  await page.goto("/scholarship/proceedings");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Edited proceedings");
  await expect(page.getByText("ICASE2013").first()).toBeVisible();
  await expect(page.getByText(/Sustainability as a Strategy/)).toBeVisible();
  // the disputed shared ISBN must not appear
  await expect(page.getByText("978-84-612-8486-3")).toHaveCount(0);
});

test("events page filters by role", async ({ page }) => {
  await page.goto("/events");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Conferences");
  await page.getByRole("button", { name: "Scientific committee" }).press("Enter");
  await expect(page.getByRole("list", { name: "Events timeline" }).getByRole("listitem")).toHaveCount(1);
  await page.getByRole("button", { name: "All roles" }).press("Enter");
  await expect(page.getByRole("list", { name: "Events timeline" }).getByRole("listitem")).toHaveCount(13);
});
