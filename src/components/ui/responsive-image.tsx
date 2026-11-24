import { imageSrc, imageSrcSet, type ImageRecord } from "@/lib/images";
import { cn } from "@/lib/cn";

type Props = {
  image: ImageRecord;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
};

/** Pre-optimised AVIF/WebP/JPEG with width/height reserved up front (no layout shift). */
export function ResponsiveImage({ image, sizes, priority, className, imgClassName }: Props) {
  return (
    <picture className={cn("block", className)}>
      <source type="image/avif" srcSet={imageSrcSet(image, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={imageSrcSet(image, "webp")} sizes={sizes} />
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-optimised static files, srcset handled above */}
      <img
        src={imageSrc(image, image.widths[image.widths.length - 1] ?? 480, "jpg")}
        srcSet={imageSrcSet(image, "jpg")}
        sizes={sizes}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...(priority ? { fetchPriority: "high" as const } : {})}
        className={cn("h-auto w-full", imgClassName)}
      />
    </picture>
  );
}
