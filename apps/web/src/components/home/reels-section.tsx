import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { HorizontalScroller } from "@/components/layout/horizontal-scroller";
import { PageContainer } from "@/components/layout/page-container";
import { ReelCard } from "@/components/marketing/reel-card";
import { cn } from "@/lib/utils/cn";
import type { Reel } from "@/types/marketing";

export type ReelsSectionProps = {
  reels: Reel[];
  className?: string;
};

/**
 * Kitchen reels rail — real Instagram clips from Admin.
 */
export function ReelsSection({ reels, className }: ReelsSectionProps) {
  if (reels.length === 0) return null;

  return (
    <section aria-labelledby="home-reels-heading" className={cn(className)}>
      <PageContainer width="wide" paddedY={false} className="pt-7 sm:pt-9">
        <DecorativeMotif
          variant="floral-border"
          tone="navy"
          className="mb-5 max-w-sm opacity-90"
        />

        <div className="mb-5">
          <h2
            id="home-reels-heading"
            className="text-xl font-semibold tracking-tight text-brand-navy sm:text-[1.35rem]"
          >
            من مطبخنا
          </h2>
          <p className="typo-caption mt-1 text-text-muted">
            لقطات قصيرة من التحضير والطبخ — اضغط للمشاهدة داخل الموقع
          </p>
        </div>
      </PageContainer>

      <PageContainer width="wide" paddedY={false} className="!px-0 pb-1">
        <HorizontalScroller
          aria-label="لقطات من مطبخنا"
          className="gap-3 ps-4 sm:gap-3.5 sm:ps-6 lg:ps-8"
        >
          {reels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </HorizontalScroller>
      </PageContainer>
    </section>
  );
}
