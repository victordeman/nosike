"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  category: string;
  categoryLabel: string;
  width: number;
  height: number;
};

const FOCUSABLE = 'button, [href], [tabindex]:not([tabindex="-1"])';

export function GalleryBrowser({ photos }: { photos: GalleryPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // Return focus to the thumbnail that opened the lightbox.
  useEffect(() => {
    if (openIndex === null && openerRef.current) {
      openerRef.current.focus();
      openerRef.current = null;
    }
  }, [openIndex]);

  useEffect(() => {
    if (openIndex === null) return;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLButtonElement>("[data-autofocus]")?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenIndex(null);
        return;
      }
      if (e.key === "ArrowLeft") {
        setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
        return;
      }
      if (e.key === "ArrowRight") {
        setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length));
        return;
      }
      if (e.key === "Tab" && dialog) {
        const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => !el.hasAttribute("disabled"),
        );
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && (active === first || !dialog.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [openIndex, photos.length]);

  const categories = [...new Set(photos.map((p) => p.category))];
  const openPhoto = openIndex === null ? null : photos[openIndex];

  return (
    <div>
      {categories.map((category) => (
        <section key={category} aria-labelledby={`gallery-${category}`} className="mb-12 last:mb-0">
          <h2 id={`gallery-${category}`} className="text-gold mb-6 text-sm font-semibold tracking-[0.14em] uppercase">
            {photos.find((p) => p.category === category)?.categoryLabel}
          </h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos
              .map((photo, index) => ({ photo, index }))
              .filter(({ photo }) => photo.category === category)
              .map(({ photo, index }) => (
                <li key={photo.id}>
                  <button
                    type="button"
                    onClick={(e) => {
                      openerRef.current = e.currentTarget;
                      setOpenIndex(index);
                    }}
                    aria-label={`Open photo: ${photo.alt}`}
                    className="border-line hover:border-accent focus-visible:border-accent block w-full overflow-hidden rounded-card border transition-colors focus-visible:outline-none"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="h-auto w-full object-cover"
                    />
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}

      {openPhoto ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={openPhoto.alt}
          className="bg-paper/95 fixed inset-0 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            data-autofocus
            onClick={() => setOpenIndex(null)}
            aria-label="Close photo"
            className="border-line bg-surface text-ink hover:border-accent absolute top-4 right-4 min-h-11 min-w-11 rounded-full border text-lg font-bold"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={() => setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length))}
            aria-label="Previous photo"
            className="border-line bg-surface text-ink hover:border-accent absolute left-2 min-h-11 min-w-11 rounded-full border text-xl font-bold sm:left-6"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length))}
            aria-label="Next photo"
            className="border-line bg-surface text-ink hover:border-accent absolute right-2 min-h-11 min-w-11 rounded-full border text-xl font-bold sm:right-6"
          >
            ›
          </button>
          <figure className="flex max-h-full flex-col items-center gap-4">
            <Image
              src={openPhoto.src}
              alt={openPhoto.alt}
              width={openPhoto.width}
              height={openPhoto.height}
              sizes="90vw"
              className={cn("h-auto max-h-[70vh] w-auto max-w-full rounded-card object-contain")}
            />
            <figcaption className="text-ink-muted max-w-prose text-center text-sm">{openPhoto.alt}</figcaption>
          </figure>
        </div>
      ) : null}
    </div>
  );
}
