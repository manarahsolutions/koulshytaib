"use client";

import { LayoutGrid, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BrandPattern } from "@/components/brand/brand-pattern";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { HorizontalScroller } from "@/components/layout/horizontal-scroller";
import { PageContainer } from "@/components/layout/page-container";
import { ProductCard } from "@/components/product/product-card";
import { Input } from "@/components/ui/input";
import { getCategoryIcon } from "@/features/products/category-icons";
import {
  useCustomerMenuProducts,
  useVisibleCategories,
} from "@/features/products/use-catalog";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";

export function MenuPageClient() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const [query, setQuery] = useState("");
  /** Manual chip override; null = follow URL */
  const [categoryOverride, setCategoryOverride] = useState<string | null>(null);
  const categories = useVisibleCategories();

  const categoryId = useMemo(() => {
    if (categoryOverride != null) return categoryOverride;
    if (
      categoryFromUrl &&
      categories.some((c) => c.id === categoryFromUrl)
    ) {
      return categoryFromUrl;
    }
    return "all";
  }, [categoryOverride, categoryFromUrl, categories]);

  const filtered = useCustomerMenuProducts({ query, categoryId });

  const selectCategory = (id: string) => {
    setCategoryOverride(id);
  };

  const sectionTitle =
    categoryId === "all"
      ? "كل المنيو"
      : (categories.find((c) => c.id === categoryId)?.name ?? "المنيو");

  return (
    <div>
      <PageContainer width="wide" paddedY={false} className="pt-4 sm:pt-6">
        <div
          className={cn(
            "relative min-h-[11.5rem] overflow-hidden rounded-3xl bg-surface-warm sm:min-h-[13rem]",
            "px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6",
          )}
        >
          <BrandPattern
            name="header"
            opacity={0.95}
            className="absolute inset-0"
            hideIfMissing={false}
          />
          {/* Soft veil only under copy/search so pattern stays visible */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-linear-to-t from-surface-warm/90 via-surface-warm/35 to-transparent"
            aria-hidden
          />

          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight text-brand-navy sm:text-[1.85rem]">
              المنيو
            </h1>
            <p className="typo-body-s mt-2 max-w-lg text-text-muted">
              تصفّح المنيو، اختَر الأكل، وأضفه للسلة — توصيل لباب البيت فقط.
            </p>

            <div className="relative mt-5 max-w-xl">
              <Search
                className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-text-subtle"
                strokeWidth={ICON_STROKE.default}
                aria-hidden
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="دور على أكلة..."
                aria-label="بحث في المنيو"
                className="rounded-2xl border-border-soft bg-surface-elevated ps-10 pe-10 shadow-sm"
                autoComplete="off"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute end-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-text-muted hover:bg-surface-warm hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                  aria-label="مسح البحث"
                >
                  <X
                    className="size-4"
                    strokeWidth={ICON_STROKE.default}
                    aria-hidden
                  />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </PageContainer>

      <div
        className={cn(
          "sticky top-[var(--header-height)] z-20 mt-4 border-b border-border-soft",
          "bg-background/95 backdrop-blur-sm",
        )}
      >
        <PageContainer width="wide" paddedY={false} className="!px-0 py-2.5">
          <HorizontalScroller
            aria-label="تصنيفات المنيو"
            className="gap-2 ps-4 sm:ps-6 lg:ps-8"
          >
            <button
              type="button"
              onClick={() => selectCategory("all")}
              aria-pressed={categoryId === "all"}
              className={cn(
                "inline-flex h-10 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-sm font-medium",
                "transition-colors duration-[var(--duration-fast)]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                categoryId === "all"
                  ? "bg-brand-navy text-on-dark shadow-xs"
                  : "bg-surface-elevated text-text shadow-xs hover:bg-surface-warm",
              )}
            >
              <LayoutGrid
                className="size-4"
                strokeWidth={
                  categoryId === "all" ? ICON_STROKE.active : ICON_STROKE.default
                }
                aria-hidden
              />
              الكل
            </button>
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.id, category.name);
              const active = categoryId === category.id;
              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => selectCategory(category.id)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-10 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-sm font-medium",
                    "transition-colors duration-[var(--duration-fast)]",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                    active
                      ? "bg-brand-navy text-on-dark shadow-xs"
                      : "bg-surface-elevated text-text shadow-xs hover:bg-surface-warm",
                  )}
                >
                  <Icon
                    className="size-4"
                    strokeWidth={
                      active ? ICON_STROKE.active : ICON_STROKE.default
                    }
                    aria-hidden
                  />
                  {category.name}
                </button>
              );
            })}
          </HorizontalScroller>
        </PageContainer>
      </div>

      <PageContainer width="wide" className="pb-4 pt-5">
        <div className="mb-4 flex items-center gap-2">
          <DecorativeMotif
            variant="floral-corner"
            tone="navy"
            className="size-5 shrink-0 opacity-80"
          />
          <h2 className="text-base font-semibold text-brand-navy">
            {sectionTitle}
          </h2>
          <p className="typo-caption text-text-muted" aria-live="polite">
            {filtered.length === 0
              ? "ماكو نتائج"
              : `${filtered.length} أكلة`}
          </p>
        </div>

        {filtered.length === 0 ? (
          <p className="typo-body-s text-text-muted">
            جرّب كلمة ثانية أو صفّي من التصنيفات.
          </p>
        ) : (
          <ul className="mx-auto flex max-w-2xl flex-col gap-3 lg:max-w-3xl">
            {filtered.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} layout="list" />
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </div>
  );
}
