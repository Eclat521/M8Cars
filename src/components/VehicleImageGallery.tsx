"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";

interface Props {
  images: string[];
  alt: string;
}

export default function VehicleImageGallery({ images, alt }: Props) {
  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [thumbOffset, setThumbOffset] = useState(0);

  useEffect(() => {
    if (current < thumbOffset) {
      setThumbOffset(current);
    } else if (current >= thumbOffset + 8) {
      setThumbOffset(current - 7);
    }
  }, [current]);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, prev, next]);

  return (
    <>
      {/* Main image */}
      <div className="relative rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: "4/3" }}>
        <Image
          src={images[current]}
          alt={`${alt} image ${current + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover cursor-zoom-in"
          priority
          loading="eager"
          onClick={() => setLightboxOpen(true)}
        />

        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Counter badge */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Images className="w-3 h-3" />
            {current + 1}/{images.length}
          </div>
        )}
      </div>

      {/* Thumbnail carousel — 8 visible */}
      {images.length > 1 && (
        <div className="flex items-center gap-1 mt-2">
          <button
            onClick={() => setThumbOffset((o) => Math.max(0, o - 8))}
            disabled={thumbOffset === 0}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            aria-label="Previous thumbnails"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-2 flex-1">
            {Array.from({ length: 8 }).map((_, offset) => {
              const i = thumbOffset + offset;
              const src = images[i];
              return src ? (
                <button
                  key={offset}
                  onClick={() => setCurrent(i)}
                  className={`relative flex-1 rounded overflow-hidden border-2 transition-colors ${
                    i === current ? "border-blue-500" : "border-transparent"
                  }`}
                  style={{ aspectRatio: "4/3" }}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image
                    src={src}
                    alt={`${alt} thumbnail ${i + 1}`}
                    fill
                    sizes="10vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </button>
              ) : (
                <div key={offset} className="flex-1" style={{ aspectRatio: "4/3" }} />
              );
            })}
          </div>

          <button
            onClick={() => setThumbOffset((o) => Math.min(images.length - 8, o + 8))}
            disabled={thumbOffset + 8 >= images.length}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            aria-label="Next thumbnails"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              <Image
                src={images[current]}
                alt={`${alt} image ${current + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-3xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full w-10 h-10 flex items-center justify-center"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full w-10 h-10 flex items-center justify-center"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                  {current + 1} / {images.length}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
