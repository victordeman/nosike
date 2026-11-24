import { describe, expect, it } from "vitest";
import {
  filterPublications,
  getCareer,
  getConferences,
  getCountries,
  getEducation,
  getHonours,
  getPublications,
  groupPublicationsByDecade,
  sortCareer,
  sortEducation,
  sortPublications,
} from "../../src/lib/content";

describe("content loaders validate against schemas", () => {
  it("loads publications with years and nulls", () => {
    const pubs = getPublications();
    expect(pubs.length).toBeGreaterThan(100);
    expect(pubs.some((p) => p.year === null)).toBe(true);
    expect(pubs.every((p) => p.source.length > 0)).toBe(true);
  });
  it("loads career, education, honours, conferences, countries", () => {
    expect(getCareer().length).toBeGreaterThan(20);
    expect(getEducation().length).toBeGreaterThan(10);
    expect(getHonours().length).toBeGreaterThan(10);
    expect(getConferences().length).toBeGreaterThan(10);
    expect(getCountries().length).toBe(22);
  });
});

describe("sortPublications", () => {
  const pubs = getPublications();
  it("sorts by year descending", () => {
    const sorted = sortPublications(pubs);
    const years = sorted.filter((p) => p.year !== null).map((p) => p.year as number);
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });
  it("sorts yearless entries last", () => {
    const sorted = sortPublications(pubs);
    const firstNull = sorted.findIndex((p) => p.year === null);
    expect(firstNull).toBeGreaterThan(0);
    expect(sorted.slice(firstNull).every((p) => p.year === null)).toBe(true);
  });
});

describe("groupPublicationsByDecade", () => {
  it("groups by decade with null last", () => {
    const groups = groupPublicationsByDecade(getPublications());
    const decades = groups.map((g) => g.decade);
    expect(decades.at(-1)).toBeNull();
    const numbered = decades.slice(0, -1) as number[];
    expect(numbered).toEqual([...numbered].sort((a, b) => b - a));
    expect(groups.reduce((n, g) => n + g.items.length, 0)).toBe(getPublications().length);
  });
});

describe("filterPublications", () => {
  const pubs = getPublications();
  it("filters by kind", () => {
    const books = filterPublications(pubs, { kind: "book" });
    expect(books.length).toBe(11);
    expect(books.every((p) => p.kind === "book")).toBe(true);
  });
  it("filters by decade", () => {
    const d2000 = filterPublications(pubs, { decade: 2000 });
    expect(d2000.length).toBeGreaterThan(0);
    expect(d2000.every((p) => p.year !== null && p.year >= 2000 && p.year < 2010)).toBe(true);
  });
  it("filters by query across title and venue", () => {
    const hits = filterPublications(pubs, { query: "niger delta" });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((p) => /niger delta/i.test(p.title + ("venue" in p ? (p.venue ?? "") : "")))).toBe(true);
  });
  it("excludes yearless entries when filtering by decade", () => {
    const d1990 = filterPublications(pubs, { decade: 1990 });
    expect(d1990.every((p) => p.year !== null)).toBe(true);
  });
});

describe("sortCareer / sortEducation", () => {
  it("sorts career newest first with present roles leading", () => {
    const sorted = sortCareer(getCareer());
    expect(sorted[0].dates.end).toBe("present");
    const ends = sorted.map((r) => (r.dates.end === "present" ? 9999 : Number(r.dates.end)));
    expect(ends).toEqual([...ends].sort((a, b) => b - a));
  });
  it("groups education doctoral → professional", () => {
    const sorted = sortEducation(getEducation());
    const order = sorted.map((e) => e.level);
    const rank = { doctoral: 0, masters: 1, postgraduate: 2, foundation: 3, professional: 4 };
    const ranks = order.map((l) => rank[l]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });
});
