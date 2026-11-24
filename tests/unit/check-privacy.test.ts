import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const dir = mkdtempSync(join(tmpdir(), "privacy-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

function run(file: string, content: string): number {
  writeFileSync(join(dir, file), content);
  try {
    execFileSync("node", ["scripts/check-privacy.ts", dir], { stdio: "pipe" });
    return 0;
  } catch (e) {
    return (e as { status: number }).status;
  } finally {
    rmSync(join(dir, file));
  }
}

// Fixtures are assembled at runtime so this file does not trip the check itself.
const j = (...parts: string[]) => parts.join("");

describe("check-privacy", () => {
  it("passes clean content", () => expect(run("ok.html", "<p>Prof. Austin N. Nosike</p>")).toBe(0));
  it("flags Gmail addresses", () => expect(run("a.html", j("someone@", "gmail.com"))).toBe(1));
  it("flags international Nigerian numbers", () => expect(run("b.html", j("+", "234 800 000 0000"))).toBe(1));
  it("flags local mobile numbers", () => expect(run("c.html", j("0803", " 000 0000"))).toBe(1));
  it("flags birth-date labels", () => expect(run("d.html", j("Date of ", "Birth: x"))).toBe(1));
  it("flags raw documents", () => expect(run("e.docx", "x")).toBe(1));
});
