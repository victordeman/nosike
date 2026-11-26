#!/usr/bin/env node
/**
 * Optimises the supplied photos into public/images: AVIF + WebP + JPEG at 480/960/1600,
 * EXIF/GPS stripped, renamed per SPEC Appendix B, and writes content/images.json.
 * Appendix B crop notes are applied as fractional crop boxes before resizing.
 *
 *   node scripts/optimise-images.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "_sources/photos");
const OUT = join(ROOT, "public/images");
const MANIFEST_OUT = join(ROOT, "content/images.json");

const WIDTHS = [480, 960, 1600] as const;

interface Crop {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Spec {
  source: string;
  target: string;
  alt: string;
  role: "hero" | "regalia" | "gallery" | "about" | "talks" | "excluded";
  focalX?: number;
  focalY?: number;
  crop?: Crop;
  galleryCategory?: "portraits" | "academic" | "engagements";
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
    galleryCategory: "portraits",
    alt: "Prof. Austin Nosike in a charcoal suit and blue patterned tie",
    role: "hero",
    focalX: 0.5,
    focalY: 0.35,
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.10.03 (1).jpeg",
    target: "regalia-full-a",
    galleryCategory: "academic",
    alt: "Prof. Austin Nosike in full doctoral regalia with cap, standing",
    role: "regalia",
  },
  {
    source: "unnamed-logo.jpg",
    target: "brand-portrait",
    alt: "Prof. Austin Nosike in full doctoral regalia with cap, standing",
    role: "regalia",
    focalX: 0.5,
    focalY: 0.2,
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
    galleryCategory: "portraits",
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
    galleryCategory: "academic",
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
  // Appendix B #10: "crop the frame out" — framed official portrait on the right edge.
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.08.jpeg",
    target: "portrait-tunic-black-cap-a",
    galleryCategory: "portraits",
    alt: "Prof. Austin Nosike in a black tunic with embroidered cap",
    role: "about",
    crop: { left: 0, top: 0, width: 0.7, height: 1 },
  },
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.09 (1).jpeg",
    target: "portrait-tunic-maroon-a",
    galleryCategory: "portraits",
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
    galleryCategory: "portraits",
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
    galleryCategory: "portraits",
    alt: "Prof. Austin Nosike in a white kaftan",
    role: "hero",
    focalX: 0.5,
    focalY: 0.3,
  },
  // Appendix B #20: "crop to remove frames" — top row of framed portraits above the speaker.
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.10 (3).jpeg",
    target: "speaking-desk",
    galleryCategory: "engagements",
    alt: "Prof. Austin Nosike in a white kaftan speaking at a desk",
    role: "talks",
    crop: { left: 0.05, top: 0.33, width: 0.85, height: 0.67 },
  },
  // Appendix B #21: tiny framed portraits far background — crop right edge.
  {
    source: "WhatsApp Image 2026-11-18 at 21.12.10.jpeg",
    target: "portrait-tunic-tan",
    alt: "Prof. Austin Nosike in a tan tunic, seated",
    role: "gallery",
    crop: { left: 0, top: 0, width: 0.8, height: 1 },
  },
  // Appendix B S2/S3: "crop tight, frames out".
  {
    source: "S2-supplied-21.12.10.jpeg",
    target: "talk-session-a",
    galleryCategory: "engagements",
    alt: "Prof. Austin Nosike in a white kaftan at a conference table",
    role: "talks",
    crop: { left: 0.12, top: 0.25, width: 0.7, height: 0.75 },
  },
  {
    source: "S3-supplied-21.12.11.jpeg",
    target: "talk-session-b",
    alt: "Prof. Austin Nosike in a white kaftan at a conference with the Nigerian flag",
    role: "talks",
    crop: { left: 0.1, top: 0.31, width: 0.8, height: 0.69 },
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
    // Bake EXIF orientation first so crop fractions apply to the displayed image.
    const oriented = await sharp(input).rotate().toBuffer();
    const meta = await sharp(oriented).metadata();
    let srcW = meta.width ?? 0;
    let srcH = meta.height ?? 0;
    if (!srcW || !srcH) throw new Error(`Cannot read ${spec.source}`);
    let pipeline = sharp(oriented);
    if (spec.crop) {
      const c = spec.crop;
      pipeline = pipeline.extract({
        left: Math.round(c.left * srcW),
        top: Math.round(c.top * srcH),
        width: Math.round(c.width * srcW),
        height: Math.round(c.height * srcH),
      });
      srcW = Math.round(c.width * srcW);
      srcH = Math.round(c.height * srcH);
    }
    const widths = WIDTHS.filter((w) => w <= srcW);
    for (const w of widths) {
      const base = pipeline.clone().resize({ width: w });
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
    }
    manifest.push({
      id: spec.target,
      file: spec.target,
      widths: [...widths],
      width: srcW,
      height: srcH,
      focalX: spec.focalX ?? 0.5,
      focalY: spec.focalY ?? 0.4,
      alt: spec.alt,
      role: spec.role,
      sourceFile: spec.source,
      ...(spec.galleryCategory ? { galleryCategory: spec.galleryCategory } : {}),
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
