import Link from "next/link";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils/cn";

/**
 * Closing delivery-only CTA — no invented zones, fees, or ETAs.
 */
export function DeliveryCtaSection({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="home-delivery-heading"
      className={cn("pb-2 sm:pb-4", className)}
    >
      <PageContainer width="wide" paddedY={false} className="pt-8 sm:pt-10">
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-sm",
            "px-5 py-8 sm:px-8 sm:py-10",
          )}
        >
          <DecorativeMotif
            variant="hero"
            density="subtle"
            tone="muted"
            className="text-on-dark/25"
          />
          <DecorativeMotif
            variant="floral-corner"
            density="medium"
            tone="navy"
            className="absolute end-4 top-4 size-8 text-on-dark/35"
          />
          <DecorativeMotif
            variant="floral-side"
            density="subtle"
            tone="muted"
            className="start-0 text-on-dark/20 max-sm:hidden"
          />

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-lg space-y-2">
              <h2
                id="home-delivery-heading"
                className="text-balance text-xl font-semibold tracking-tight text-on-dark sm:text-2xl"
              >
                جوعان؟ خليها علينا
              </h2>
              <p className="typo-body-s text-pretty text-on-dark/75 sm:text-base">
                توصيل داخل الفلوجة فقط — اختَر من المنيو وخلّي الطلب يوصل لباب البيت.
              </p>
            </div>

            <Link
              href="/menu"
              className={cn(
                "inline-flex h-12 min-w-[11rem] shrink-0 items-center justify-center rounded-2xl bg-brand-primary px-6 text-sm font-semibold text-on-primary sm:text-base",
                "shadow-sm transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
                "hover:bg-brand-primary-hover",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              )}
            >
              اطلب من المنيو
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
