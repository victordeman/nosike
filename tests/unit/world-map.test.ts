import { describe, expect, it } from "vitest";
import { getWorldMapData } from "@/lib/world-map";
import { getCountries, verifiedCountries } from "@/lib/content";

describe("world map data", () => {
  it("produces SVG paths for every country in countries.json", () => {
    const data = getWorldMapData();
    expect(data.countries).toHaveLength(getCountries().length);
    for (const c of data.countries) {
      expect(c.path.startsWith("M")).toBe(true);
      expect(c.path.length).toBeGreaterThan(20);
    }
  });

  it("marks exactly the unverified countries as unverified", () => {
    const data = getWorldMapData();
    const unverified = data.countries.filter((c) => !c.verified).map((c) => c.code).sort();
    expect(unverified).toEqual(verifiedCountries(getCountries()).length ? ["GB", "MW", "TZ", "US", "ZW"] : []);
    expect(data.countries.filter((c) => c.verified)).toHaveLength(verifiedCountries(getCountries()).length);
  });

  it("has a non-empty world outline", () => {
    expect(getWorldMapData().worldPath.length).toBeGreaterThan(1000);
  });
});
