import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FoodMediaPlaceholder } from "@/components/product/food-media-placeholder";
import { Badge } from "@/components/ui/badge";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";
import type { Reel } from "@/types/marketing";

export type ReelCardProps = {
  reel: Reel;
  className?: string;
};

/**
 * Social-style reel card — portrait unit, no fake engagement metrics.
 */
export function ReelCard({ reel, className }: ReelCardProps) {
  const hasThumb = Boolean(reel.thumbnail);
  const productHref = reel.productId
    ? `/product/${reel.productId}`
    : null;
  const igHref = reel.instagramUrl?.trim() || null;
  const mediaHref = igHref ?? productHref;

  return (
    <article
      className={cn(
        "group relative flex w-[min(72vw,11.5rem)] shrink-0 snap-start flex-col overflow-hidden sm:w-[12.5rem] lg:w-[13rem]",
        "rounded-2xl bg-surface-elevated shadow-xs",
        "motion-lift hover:shadow-sm",
        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-warm">
        {mediaHref ? (
          <a
            href={mediaHref}
            target={igHref ? "_blank" : undefined}
            rel={igHref ? "noreferrer" : undefined}
            className="absolute inset-0 z-[1]"
            aria-label={igHref ? `فتح ريل ${reel.title}` : reel.title}
          />
        ) : null}
        {hasThumb && reel.thumbnail ? (
          <Image
            src={reel.thumbnail}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:640px) 72vw, 208px"
          />
        ) : (
          <FoodMediaPlaceholder
            className="min-h-full"
            intent="reel"
            label={reel.label ?? "لقطة من المطبخ"}
            tone="cream"
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-brand-navy/70 via-brand-navy/15 to-transparent"
          aria-hidden
        />

        <span
          className={cn(
            "absolute left-1/2 top-[42%] flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center",
            "rounded-full border border-on-dark/35 bg-brand-navy/60 text-on-dark",
            "transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
            "motion-safe:group-hover:scale-105",
          )}
          aria-hidden
        >
          <Play
            className="ms-0.5 size-4 fill-current"
            strokeWidth={ICON_STROKE.default}
          />
        </span>

        {reel.duration ? (
          <Badge
            variant="neutral"
            label={`المدة ${reel.duration}`}
            className="absolute end-2 top-2 rounded-md border-0 bg-brand-navy/85 px-1.5 py-0.5 text-[0.65rem] text-on-dark"
          >
            {reel.duration}
          </Badge>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 space-y-2 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-on-dark">
            {reel.title}
          </h3>

          {productHref ? (
            <Link
              href={productHref}
              className={cn(
                "inline-flex h-11 min-h-11 items-center rounded-md bg-surface-elevated px-3 text-xs font-medium text-text",
                "transition-colors duration-[var(--duration-fast)]",
                "hover:bg-surface",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              )}
            >
              شوف الطبخة
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
