import { getImages } from "./content";
import type { ImageRecord } from "./schemas";

export type { ImageRecord };

/**
 * Helpers for the pre-optimised images in public/images (AVIF + WebP + JPEG fallback,
 * width-suffixed files recorded in content/images.json by scripts/optimise-images.ts).
 */

const BASE = "/images";

export function imageSrc(image: ImageRecord, width: number, format: "avif" | "webp" | "jpg" = "jpg"): string {
  return `${BASE}/${image.file}-${width}.${format}`;
}

/** srcset strings for the <picture> sources; widths already capped at source size by the pipeline. */
export function imageSrcSet(image: ImageRecord, format: "avif" | "webp" | "jpg"): string {
  return image.widths.map((w: number) => `${imageSrc(image, w, format)} ${w}w`).join(", ");
}

export function imagesByRole(role: ImageRecord["role"]): ImageRecord[] {
  return getImages().filter((i) => i.role === role);
}

export function imageById(id: string): ImageRecord | undefined {
  return getImages().find((i) => i.id === id);
}
