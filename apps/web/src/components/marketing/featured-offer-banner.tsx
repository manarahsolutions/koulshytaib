import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";
import type { CustomerOfferView } from "@/features/offers/selectors";

/** Mirrored assets/3rd — green floral panel on the right */
const OFFER_BG_SRC = "/images/offers/todays-offer-bg.webp";

export type FeaturedOfferBannerProps = {
  view: CustomerOfferView;
  className?: string;
};

/**
 * Featured “عرض اليوم” banner — cream art from assets/3rd + centered story CTA.
 */
export function FeaturedOfferBanner({
  view,
  className,
}: FeaturedOfferBannerProps) {
  const { href } = view;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-3xl bg-surface-warm shadow-sm",
        "aspect-[5/4] min-h-[15rem] sm:aspect-auto sm:min-h-[20rem]",
        className,
      )}
    >
      <Image
        src={OFFER_BG_SRC}
        alt=""
        fill
        className="object-cover object-right sm:object-[85%_center] lg:object-right"
        sizes="(max-width:1024px) 100vw, 960px"
        priority={false}
      />

      <div
        className={cn(
          "relative z-10 flex h-full min-h-[15rem] flex-col items-center justify-center gap-4",
          "px-5 py-8 text-center sm:min-h-[20rem] sm:px-10 sm:py-10",
        )}
      >
        <p className="typo-label text-text-muted">عرض اليوم</p>

        <h3
          className={cn(
            "text-balance font-bold tracking-tight text-brand-navy",
            "text-[1.65rem] leading-[1.3] sm:text-[2rem] sm:leading-[1.25]",
          )}
        >
          من{" "}
          <span className="text-brand-primary">مطبخ</span>{" "}
          البيت
        </h3>

        <div
          className="mx-auto flex w-full max-w-[12rem] items-center gap-3"
          aria-hidden
        >
          <span className="h-px flex-1 bg-border-strong/40" />
          <DecorativeMotif
            variant="floral-corner"
            density="subtle"
            tone="navy"
            className="size-4 shrink-0 text-brand-primary opacity-85"
          />
          <span className="h-px flex-1 bg-border-strong/40" />
        </div>

        <div className="mx-auto max-w-md space-y-1">
          <p className="typo-body-s text-pretty text-text-muted sm:text-base">
            نطبخ مثل ما نطبخ لعائلتنا.
          </p>
          <p className="typo-body-s text-pretty text-text-muted sm:text-base">
            مكونات طبيعية، وصفات نكهتها تذكرنا بالبيت.
          </p>
        </div>

        <Link
          href={href}
          className={cn(
            "mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-primary px-6 text-sm font-semibold text-on-primary sm:h-12 sm:px-7 sm:text-base",
            "shadow-sm transition-[colors,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
            "hover:bg-brand-primary-hover motion-safe:hover:-translate-y-px",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
          )}
        >
          استكشف المنيو
          <ArrowLeft
            className="size-4"
            strokeWidth={ICON_STROKE.emphasis}
            aria-hidden
          />
        </Link>
      </div>
    </article>
  );
}
