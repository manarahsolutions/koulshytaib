import Link from "next/link";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { HorizontalScroller } from "@/components/layout/horizontal-scroller";
import { PageContainer } from "@/components/layout/page-container";
import { getCategoryIcon } from "@/features/products/category-icons";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/types/catalog";

export type CategoryScrollerProps = {
  categories: Category[];
  className?: string;
};

export function CategoryScroller({
  categories,
  className,
}: CategoryScrollerProps) {
  if (categories.length === 0) return null;

  return (
    <section
      aria-labelledby="home-categories-heading"
      className={cn(className)}
    >
      <PageContainer width="wide" paddedY={false}>
        <DecorativeMotif
          variant="floral-divider"
          tone="navy"
          className="mb-5 opacity-90"
        />

        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2
              id="home-categories-heading"
              className="text-xl font-semibold tracking-tight text-brand-navy sm:text-[1.35rem]"
            >
              الأقسام
            </h2>
            <p className="typo-caption mt-1 text-text-muted">
              اختار نوع الأكل اللي يفتح نفسك
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex h-11 shrink-0 items-center typo-label text-brand-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            كل المنيو
          </Link>
        </div>
      </PageContainer>

      <PageContainer width="wide" paddedY={false} className="!px-0">
        <HorizontalScroller
          aria-label="تصنيفات المنيو"
          className="gap-3 ps-4 sm:ps-6 lg:ps-8"
        >
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.id, category.name);
            return (
              <Link
                key={category.id}
                href={category.href}
                className={cn(
                  "flex w-[5.75rem] shrink-0 snap-start flex-col items-center gap-2.5",
                  "rounded-2xl bg-surface-elevated px-2 py-3.5 shadow-xs",
                  "motion-lift hover:shadow-sm",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                )}
              >
                <span
                  className="flex size-12 items-center justify-center rounded-2xl bg-surface-warm text-brand-navy"
                  aria-hidden
                >
                  <Icon className="size-5" strokeWidth={ICON_STROKE.default} />
                </span>
                <span className="typo-caption text-center font-medium leading-snug text-text">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </HorizontalScroller>
      </PageContainer>
    </section>
  );
}
