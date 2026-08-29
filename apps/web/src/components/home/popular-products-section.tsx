"use client";

import Link from "next/link";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { HorizontalScroller } from "@/components/layout/horizontal-scroller";
import { PageContainer } from "@/components/layout/page-container";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/catalog";

export type PopularProductsSectionProps = {
  products: Product[];
  className?: string;
};

/**
 * Deterministic seed “popular” slice — not real popularity metrics.
 */
export function PopularProductsSection({
  products,
  className,
}: PopularProductsSectionProps) {
  if (products.length === 0) return null;

  return (
    <section
      aria-labelledby="home-popular-heading"
      className={cn("relative", className)}
    >
      <DecorativeMotif
        variant="floral-side"
        density="subtle"
        tone="navy"
        className="end-0 hidden opacity-80 lg:block"
      />
      <PageContainer width="wide" paddedY={false} className="pt-8 sm:pt-10">
        <DecorativeMotif variant="floral-divider" tone="navy" className="mb-6" />

        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2
              id="home-popular-heading"
              className="text-xl font-semibold tracking-tight text-brand-navy sm:text-[1.35rem]"
            >
              الأكثر طلباً من أهلنا
            </h2>
            <p className="typo-caption mt-1 text-text-muted">
              اختيار تجريبي من المنيو — مو إحصائيات حقيقية
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex h-11 shrink-0 items-center typo-label text-brand-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            شوف الكل
          </Link>
        </div>
      </PageContainer>

      <PageContainer width="wide" paddedY={false} className="!px-0 md:hidden">
        <HorizontalScroller
          aria-label="الأكثر طلباً من أهلنا"
          className="ps-4 sm:ps-6"
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              layout="rail"
            />
          ))}
        </HorizontalScroller>
      </PageContainer>

      <PageContainer
        width="wide"
        paddedY={false}
        className="hidden pb-4 md:block"
      >
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} layout="grid" />
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
