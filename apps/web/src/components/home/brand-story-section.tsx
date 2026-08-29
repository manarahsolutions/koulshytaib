import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils/cn";

/**
 * Editorial brand story — emotional positioning, no unsupported claims.
 * Stronger decorative level (editorial / Level 1–2).
 */
export function BrandStorySection({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="home-story-heading"
      className={cn(className)}
    >
      <PageContainer width="wide" paddedY={false} className="pt-8 sm:pt-10">
        <DecorativeMotif variant="floral-divider" tone="navy" className="mb-6" />

        <div
          className={cn(
            "relative overflow-hidden rounded-3xl border border-border-soft bg-surface-warm shadow-xs",
            "px-5 py-8 sm:px-8 sm:py-10 lg:px-10",
          )}
        >
          <DecorativeMotif
            variant="floral-field"
            density="subtle"
            tone="navy"
            className="opacity-70"
          />
          <DecorativeMotif
            variant="floral-side"
            density="medium"
            tone="navy"
            className="end-0 opacity-90 max-sm:opacity-50"
          />
          <DecorativeMotif
            variant="floral-corner"
            density="medium"
            tone="navy"
            className="absolute start-4 top-4 z-10 size-8"
          />
          <DecorativeMotif
            variant="strip"
            density="subtle"
            tone="navy"
            className="absolute inset-x-0 bottom-0 z-10"
          />

          <div className="relative z-10 max-w-xl space-y-3">
            <p className="typo-label flex items-center gap-2 text-brand-primary">
              <span
                className="inline-block h-px w-5 bg-brand-secondary"
                aria-hidden
              />
              طعم مألوف
            </p>
            <h2
              id="home-story-heading"
              className="text-balance text-xl font-semibold tracking-tight text-brand-navy sm:text-2xl"
            >
              طعم البيت يوصل لبابك
            </h2>
            <p className="typo-body-s text-pretty text-text-muted sm:text-base">
              أكل يذكّرك باللمّة — دافئ، مرتّب، ومناسب للبيت. من غير ادعاءات كبيرة،
              بس نية واضحة: طعم البيت أقرب لك.
            </p>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
