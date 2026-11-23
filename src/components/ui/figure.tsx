import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/cn";

export function Figure({ caption, className, alt, ...image }: ImageProps & { caption?: string }) {
  return (
    <figure className={cn("space-y-3", className)}>
      <Image alt={alt} className="rounded-card h-auto w-full object-cover" {...image} />
      {caption ? <figcaption className="text-ink-muted text-sm">{caption}</figcaption> : null}
    </figure>
  );
}
