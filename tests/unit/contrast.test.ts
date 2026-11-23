import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function tokens(selector: string): Record<string, string> {
  const block = css.slice(css.indexOf(`${selector} {`)).split("}")[0];
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const textPairs: Array<[fg: string, bg: string]> = [
  ["ink", "paper"],
  ["ink", "surface"],
  ["ink", "surface-muted"],
  ["ink-muted", "paper"],
  ["ink-muted", "surface"],
  ["ink-muted", "surface-muted"],
  ["accent", "paper"],
  ["accent", "surface"],
  ["accent", "surface-muted"],
  ["accent-contrast", "accent"],
  ["accent-contrast", "accent-strong"],
  ["gold", "paper"],
  ["gold", "surface"],
  ["gold", "surface-muted"],
];

describe.each([":root", '[data-theme="dark"]'])("WCAG AA contrast in %s", (selector) => {
  const t = tokens(selector);
  it.each(textPairs)("%s on %s ≥ 4.5:1", (fg, bg) => {
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });
});
