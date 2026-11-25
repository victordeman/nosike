import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** SPEC Phase 7: axe on every route; zero serious/critical violations. */
const routes = [
  "/",
  "/about",
  "/leadership",
  "/education",
  "/scholarship",
  "/scholarship/proceedings",
  "/events",
  "/policy",
  "/mentorship",
  "/honours",
  "/talks",
  "/gallery",
  "/media-kit",
  "/contact",
];

for (const route of routes) {
  test(`axe: ${route} has no serious or critical violations`, async ({ page }) => {
    await page.goto(route);
    const { violations } = await new AxeBuilder({ page }).analyze();
    const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      blocking.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
      `axe violations on ${route}`,
    ).toEqual([]);
  });
}
