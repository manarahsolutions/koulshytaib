import { Clock, Tag } from "lucide-react";
import Link from "next/link";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import type { CustomerOfferView } from "@/features/offers/selectors";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";

export type OfferCardProps = {
  view: CustomerOfferView;
  /** Dominant promotional storytelling card */
  featured?: boolean;
  className?: string;
};

/**
 * Promotional storytelling card — distinct from ProductCard discovery UI.
 * Presentation only: does not apply discounts to cart/checkout.
 */
export function OfferCard({
  view,
  featured = false,
  className,
}: OfferCardProps) {
  const { offer, price, oldPrice, discountLabel, href } = view;
  const isNavy = offer.surface === "navy";

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-3xl shadow-sm motion-lift",
        featured ? "min-h-[16rem] sm:min-h-[17rem]" : "min-h-[12.5rem]",
        isNavy
          ? "bg-brand-navy text-on-dark"
          : "border border-border-soft bg-surface-elevated text-text",
        className,
      )}
    >
      {featured ? (
        <DecorativeMotif
          variant="floral-corner"
          density="medium"
          tone={isNavy ? "muted" : "navy"}
          className={cn(
            "absolute end-4 top-4 z-10 size-8",
            isNavy && "text-on-dark/40",
          )}
        />
      ) : (
        <DecorativeMotif
          variant="card"
          density="subtle"
          tone={isNavy ? "muted" : "navy"}
          className={cn(
            "absolute end-3 top-3 z-10",
            isNavy && "text-on-dark/35",
          )}
        />
      )}

      <DecorativeMotif
        variant={featured ? "floral-border" : "strip"}
        density={featured ? "medium" : "subtle"}
        tone={isNavy ? "muted" : "navy"}
        className={cn(isNavy && "text-on-dark/35")}
      />
      <div
        className={cn(
          "relative z-10 flex flex-1 flex-col gap-3",
          featured ? "p-5 sm:p-7 sm:gap-4" : "p-4 sm:p-5",
        )}
      >
        {featured ? (
          <p
            className={cn(
              "typo-label",
              isNavy ? "text-on-dark/70" : "text-text-muted",
            )}
          >
            عرض اليوم
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {discountLabel ? (
            <Badge
              variant={isNavy ? "neutral" : "brand"}
              label={discountLabel}
              className={cn(
                "rounded-md",
                isNavy && "border-on-dark/25 bg-on-dark/10 text-on-dark",
              )}
            >
              <Tag
                className="size-3"
                strokeWidth={ICON_STROKE.emphasis}
                aria-hidden
              />
              {discountLabel}
            </Badge>
          ) : null}
          {offer.expiresLabel ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs",
                isNavy ? "text-on-dark/70" : "text-text-muted",
              )}
            >
              <Clock
                className="size-3.5 shrink-0"
                strokeWidth={ICON_STROKE.default}
                aria-hidden
              />
              {offer.expiresLabel}
            </span>
          ) : null}
        </div>

        <div className={cn("space-y-1.5", featured && "pe-8 sm:max-w-xl")}>
          <h3
            className={cn(
              "font-semibold tracking-tight",
              featured ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
              isNavy ? "text-on-dark" : "text-text",
            )}
          >
            {offer.title}
          </h3>
          {offer.description ? (
            <p
              className={cn(
                "leading-relaxed",
                featured ? "text-sm sm:text-base" : "text-sm",
                isNavy ? "text-on-dark/75" : "text-text-muted",
              )}
            >
              {offer.description}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "mt-auto flex flex-wrap items-end justify-between gap-3",
            featured ? "pt-3 sm:pt-4" : "pt-2",
          )}
        >
          <Price
            amount={price}
            compareAtAmount={oldPrice > price ? oldPrice : undefined}
            size={featured ? "lg" : "md"}
            className={cn(
              isNavy &&
                "[&_span]:text-on-dark [&_.line-through]:text-on-dark/50 [&_.text-brand-primary]:text-on-dark",
            )}
          />

          <Link
            href={href}
            className={cn(
              "inline-flex items-center justify-center rounded-md font-semibold",
              "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              "bg-brand-primary text-on-primary hover:bg-brand-primary-hover",
              featured
                ? "h-11 min-w-[8.5rem] px-5 text-sm sm:h-12 sm:text-base"
                : "h-10 px-4 text-sm",
            )}
          >
            {offer.ctaLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
