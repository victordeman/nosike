import { describe, expect, it } from "vitest";
import { apaCitation, getExplorerItems, getThemeMap, themesFor, THEME_OTHER } from "@/lib/scholarship";
import { getProfile, getPublications } from "@/lib/content";

const map = getThemeMap();

describe("themesFor", () => {
  it("tags gender titles with gender & development", () => {
    expect(themesFor({ title: "Gender, Education and Development: The Equity Question" }, map)).toContain("gender-development");
  });

  it("tags ICT titles with ict", () => {
    expect(themesFor({ title: "Information and Communication Technology (ICT) and the Globalized Society" }, map)).toContain("ict");
  });

  it("returns 'other' for unmatched titles", () => {
    expect(themesFor({ title: "Religion and Politics in Nigeria" }, map)).toEqual([THEME_OTHER]);
  });

  it("allows multiple themes", () => {
    const themes = themesFor({ title: "Gender, Resources and Sustainable Development in Rural Nigeria" }, map);
    expect(themes).toContain("gender-development");
    expect(themes.length).toBeGreaterThan(1);
  });
});

describe("apaCitation", () => {
  const profile = getProfile();
  const byId = (id: string) => getPublications().find((p) => p.id === id)!;

  it("formats a journal article with issue and pages", () => {
    const citation = apaCitation(byId("pub-013"), profile);
    expect(citation).toContain("Nosike, A. N. (2020)");
    expect(citation).toContain("*Metropolitan Journal of Business and Economics*");
  });

  it("formats a book with publisher and place", () => {
    const citation = apaCitation(byId("pub-002"), profile);
    expect(citation).toContain("*Adjustment and Development in Nigeria*.");
    expect(citation).toContain("J. Charlot & Fyne Ltd, Port Harcourt");
  });

  it("uses n.d. for missing years", () => {
    expect(apaCitation(byId("pub-017"), profile)).toContain("(n.d.)");
  });
});

describe("getExplorerItems", () => {
  it("covers every publication exactly once", () => {
    const items = getExplorerItems();
    expect(items).toHaveLength(getPublications().length);
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it("assigns a decade bucket to every item", () => {
    for (const item of getExplorerItems()) {
      expect(item.decade).toMatch(/^(19|20)\d0s$|^undated$/);
    }
  });
});
