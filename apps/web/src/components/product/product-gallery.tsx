"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

export type ProductGalleryProps = {
  images: string[];
  alt: string;
};

/**
 * Swipeable product photos (scroll-snap) with dots + thumbnails.
 * Fills its positioned parent.
 */
export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const multiple = images.length > 1;

  const onScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    // RTL tracks report negative scrollLeft in most browsers.
    const index = Math.round(Math.abs(track.scrollLeft) / track.clientWidth);
    if (index !== active) setActive(Math.min(index, images.length - 1));
  };

  const goTo = (index: number) => {
    const slide = trackRef.current?.children[index] as HTMLElement | undefined;
    slide?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
    setActive(index);
  };

  return (
    <div className="absolute inset-0">
      <div
        ref={trackRef}
        onScroll={multiple ? onScroll : undefined}
        className={cn(
          "flex size-full",
          multiple &&
            "snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
        aria-roledescription={multiple ? "carousel" : undefined}
        aria-label={multiple ? `صور ${alt}` : undefined}
      >
        {images.map((src, index) => (
          <div
            key={src}
            className="relative size-full shrink-0 snap-start"
            aria-roledescription={multiple ? "slide" : undefined}
            aria-label={
              multiple ? `${index + 1} من ${images.length}` : undefined
            }
          >
            <Image
              src={src}
              alt={multiple ? `${alt} — صورة ${index + 1}` : alt}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 960px"
            />
          </div>
        ))}
      </div>

      {multiple ? (
        <>
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5 sm:hidden">
            {images.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === active
                    ? "w-5 bg-surface-elevated"
                    : "w-2 bg-surface-elevated/60",
                )}
                aria-label={`عرض الصورة ${index + 1}`}
                aria-current={index === active || undefined}
              />
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-3 z-10 hidden justify-center gap-2 sm:flex">
            {images.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  "relative size-14 overflow-hidden rounded-lg border-2 shadow-sm transition",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                  index === active
                    ? "border-surface-elevated"
                    : "border-transparent opacity-75 hover:opacity-100",
                )}
                aria-label={`عرض الصورة ${index + 1}`}
                aria-current={index === active || undefined}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
