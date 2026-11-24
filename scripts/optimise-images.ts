#!/usr/bin/env node
/**
 * Optimises the supplied photos into public/images: AVIF + WebP + JPEG at 480/960/1600,
 * EXIF/GPS stripped, renamed per SPEC Appendix B, and writes content/images.json.
 *
 *   node scripts/optimise-images.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "_sources/photos");
const OUT = join(ROOT, "public/images");
const MANIFEST_OUT = join(ROOT, "content/images.json");

const WIDTHS = [480, 960, 1600] as const;

interface Spec {
  source: string;
  target: string;
  alt: string;
  role: "hero" | "regalia" | "gallery" | "about" | "talks" | "excluded";
  focalX?: number;
  focalY?: number;
  skip?: boolean;
}

// SPEC.md Appendix B — source names as they appear in _sources/photos (sorted order).
const SPECS: Spec[] = [
  {
    source: "WhatsApp Image 2026-11-18 at 21.09.05 (1).jpeg",
    target: "portrait-suit-navy",
    alt: "Prof. Austin Nosike in a navy suit and yellow striped tie",
    role: "gallery",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.09.05 (2).jpeg",
    target: "portrait-blazer-burgundy",
    alt: "Prof. Austin Nosike in a burgundy blazer and striped tie",
    role: "gallery",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.09.05.jpeg",
    target: "portrait-suit-charcoal",
    alt: "Prof. Austin Nosike in a charcoal suit and blue patterned tie",
    role: "hero",
    focalX: 0.5,
    focalY: 0.35,
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.10.03 (1).jpeg",
    target: "regalia-full-a",
    alt: "Prof. Austin Nosike in full doctoral regalia with cap, standing",
    role: "regalia",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.10.03.jpeg",
    target: "portrait-blazer-mustard",
    alt: "Prof. Austin Nosike in a mustard blazer",
    role: "gallery",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.10.04 (1).jpeg",
    target: "portrait-traditional-cap-mustard-a",
    alt: "Prof. Austin Nosike in a mustard shirt and patterned cap",
    role: "about",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.10.04 (2).jpeg",
    target: "portrait-traditional-cap-mustard-b",
    alt: "Prof. Austin Nosike in a mustard shirt and patterned cap, closer view",
    role: "gallery",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.10.04.jpeg",
    target: "regalia-full-b",
    alt: "Prof. Austin Nosike in full doctoral regalia with cap, standing",
    role: "regalia",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.07.jpeg",
    target: "portrait-tunic-dark",
    alt: "Prof. Austin Nosike in a dark tunic against a curtain backdrop",
    role: "gallery",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.08 (1).jpeg",
    target: "portrait-tunic-blue-a",
    alt: "Prof. Austin Nosike in a royal-blue tunic",
    role: "gallery",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.08.jpeg",
    target: "portrait-tunic-black-cap-a",
    alt: "Prof. Austin Nosike in a black tunic with embroidered cap",
    role: "about",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.09 (1).jpeg",
    target: "portrait-tunic-maroon-a",
    alt: "Prof. Austin Nosike in a maroon tunic",
    role: "gallery",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.09 (2).jpeg",
    target: "portrait-tunic-maroon-b",
    alt: "Prof. Austin Nosike in a maroon tunic",
    role: "gallery",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.09 (4).jpeg",
    target: "portrait-tunic-maroon-thoughtful",
    alt: "Prof. Austin Nosike in a maroon tunic, hand at chin",
    role: "about",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.09 (5).jpeg",
    target: "portrait-tunic-black-cap-b",
    alt: "Prof. Austin Nosike in a black tunic and cap",
    role: "gallery",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.09.jpeg",
    target: "portrait-tunic-navy",
    alt: "Prof. Austin Nosike in a navy tunic by a window",
    role: "gallery",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.10 (1).jpeg",
    target: "portrait-kaftan-white-a",
    alt: "Prof. Austin Nosike in a white kaftan",
    role: "gallery",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.10 (2).jpeg",
    target: "portrait-kaftan-white-b",
    alt: "Prof. Austin Nosike in a white kaftan",
    role: "hero",
    focalX: 0.5,
    focalY: 0.3,
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.10 (3).jpeg",
    target: "speaking-desk",
    alt: "Prof. Austin Nosike in a white kaftan speaking at a desk",
    role: "talks",
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.10.jpeg",
    target: "portrait-tunic-tan",
    alt: "Prof. Austin Nosike in a tan tunic, seated",
    role: "gallery",
  },
  {
    source: "S2-supplied-21.12.10.jpeg",
    target: "talk-session-a",
    alt: "Prof. Austin Nosike in a white kaftan at a conference table",
    role: "talks",
  },
  {
    source: "S3-supplied-21.12.11.jpeg",
    target: "talk-session-b",
    alt: "Prof. Austin Nosike in a white kaftan at a conference with the Nigerian flag",
    role: "talks",
  },
  // Excluded sources (Appendix B): awkward crop, official portraits behind, low angle.
  { source: "WhatsApp Image 2026-11-18 at 21.12.09 (3).jpeg", target: "", alt: "", role: "excluded", skip: true },
  { source: "WhatsApp Image 2026-11-18 at 21.12.09 (6).jpeg", target: "", alt: "", role: "excluded", skip: true },
  { source: "S1-supplied-21.09.05.jpeg", target: "", alt: "", role: "excluded", skip: true },
];

async function main() {
  mkdirSync(OUT, { recursive: true });
  const manifest: Array<Record<string, unknown>> = [];
  for (const spec of SPECS) {
    if (spec.skip) continue;
    const input = join(SRC, spec.source);
    const image = sharp(input).rotate(); // auto-orient from EXIF before stripping
    const meta = await image.metadata();
    const srcW = meta.width ?? 0;
    const srcH = meta.height ?? 0;
    if (!srcW || !srcH) throw new Error(`Cannot read ${spec.source}`);
    const widths = WIDTHS.filter((w) => w <= srcW);
    const focalX = spec.focalX ?? 0.5;
    const focalY = spec.focalY ?? 0.5;
    for (const w of widths) {
      const h = Math.round((srcH / srcW) * w);
      const base = sharp(input).rotate().resize({ width: w });
      await base
        .clone()
        .avif({ quality: 55 })
        .toFile(join(OUT, `${spec.target}-${w}.avif`));
      await base
        .clone()
        .webp({ quality: 78 })
        .toFile(join(OUT, `${spec.target}-${w}.webp`));
      await base
        .clone()
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(join(OUT, `${spec.target}-${w}.jpg`));
      void h;
    }
    manifest.push({
      id: spec.target,
      file: `${spec.target}.jpg`,
      width: srcW,
      height: srcH,
      focalX,
      focalY,
      alt: spec.alt,
      role: spec.role,
      sourceFile: spec.source,
    });
    console.log(`optimised ${spec.target} (${srcW}x${srcH}, widths ${widths.join("/")})`);
  }
  writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote ${manifest.length} image records to content/images.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
