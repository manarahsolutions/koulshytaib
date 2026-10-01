"use client";

import { ExternalLink, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { toInstagramEmbedUrl } from "@/features/reels/instagram-url";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";

export type ReelPlayerDialogProps = {
  open: boolean;
  title: string;
  instagramUrl: string;
  onClose: () => void;
};

/**
 * In-page Instagram Reel player via official embed iframe.
 */
export function ReelPlayerDialog({
  open,
  title,
  instagramUrl,
  onClose,
}: ReelPlayerDialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const embedUrl = toInstagramEmbedUrl(instagramUrl);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !embedUrl) return null;

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-brand-navy/55 backdrop-blur-[2px]"
        aria-label="إغلاق الفيديو"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "absolute inset-x-3 top-[6dvh] mx-auto flex max-h-[88dvh] w-full max-w-md flex-col",
          "overflow-hidden rounded-3xl border border-border-soft bg-background shadow-lg",
          "motion-safe:animate-[motion-fade-up_var(--duration-normal)_var(--ease-standard)]",
          "sm:inset-x-auto sm:start-1/2 sm:-translate-x-1/2",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border-soft px-4 py-3">
          <h2
            id={titleId}
            className="truncate text-base font-semibold text-brand-navy"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-text-muted hover:bg-surface-warm hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            aria-label="إغلاق"
          >
            <X
              className="size-5"
              strokeWidth={ICON_STROKE.default}
              aria-hidden
            />
          </button>
        </div>

        <div className="relative aspect-[9/16] max-h-[min(70dvh,36rem)] w-full bg-brand-navy">
          <iframe
            title={`ريل: ${title}`}
            src={embedUrl}
            className="absolute inset-0 size-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>

        <div className="flex items-center justify-center border-t border-border-soft px-4 py-3">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-brand-navy",
              "hover:bg-surface-warm",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
            )}
          >
            فتح في إنستغرام
            <ExternalLink
              className="size-3.5"
              strokeWidth={ICON_STROKE.default}
              aria-hidden
            />
          </a>
        </div>
      </div>
    </div>
  );
}
