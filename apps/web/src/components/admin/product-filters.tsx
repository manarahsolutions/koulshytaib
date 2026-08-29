"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ProductListFilter } from "@/features/products/selectors";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/types/catalog";

const STATUS_FILTERS: Array<{ value: ProductListFilter; label: string }> = [
  { value: "all", label: "الكل" },
  { value: "available", label: "متوفر" },
  { value: "unavailable", label: "غير متوفر" },
  { value: "visible", label: "ظاهر" },
  { value: "hidden", label: "مخفي" },
];

export type ProductFiltersProps = {
  query: string;
  status: ProductListFilter;
  categoryId: string;
  categories: Category[];
  onQueryChange: (value: string) => void;
  onStatusChange: (value: ProductListFilter) => void;
  onCategoryChange: (value: string) => void;
  onClear: () => void;
  showClear: boolean;
};

export function ProductFilters({
  query,
  status,
  categoryId,
  categories,
  onQueryChange,
  onStatusChange,
  onCategoryChange,
  onClear,
  showClear,
}: ProductFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="sr-only" htmlFor="admin-product-search">
          بحث في المنتجات
        </label>
        <Input
          id="admin-product-search"
          type="search"
          placeholder="بحث بالاسم أو الوصف"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="lg:max-w-sm"
          autoComplete="off"
        />

        <label className="sr-only" htmlFor="admin-product-category">
          تصفية حسب التصنيف
        </label>
        <Select
          id="admin-product-category"
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="lg:max-w-xs"
          aria-label="تصفية حسب التصنيف"
        >
          <option value="all">كل التصنيفات</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        {showClear ? (
          <button
            type="button"
            onClick={onClear}
            className="h-11 rounded-md px-3 text-sm font-medium text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            مسح الفلاتر
          </button>
        ) : null}
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="تصفية حالة المنتج"
      >
        {STATUS_FILTERS.map((item) => {
          const active = status === item.value;
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={active}
              onClick={() => onStatusChange(item.value)}
              className={cn(
                "inline-flex h-11 items-center rounded-md border px-3 text-sm font-medium",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                active
                  ? "border-brand-navy bg-brand-navy text-on-primary"
                  : "border-border bg-surface-elevated text-text hover:bg-surface-warm",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
