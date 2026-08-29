"use client";

import { Input } from "@/components/ui/input";
import type { OfferListFilter } from "@/features/offers/selectors";
import { cn } from "@/lib/utils/cn";

const FILTERS: Array<{ value: OfferListFilter; label: string }> = [
  { value: "all", label: "الكل" },
  { value: "active", label: "فعال" },
  { value: "inactive", label: "غير فعال" },
  { value: "visible", label: "ظاهر" },
  { value: "hidden", label: "مخفي" },
  { value: "featured", label: "مميز" },
  { value: "fixed_price", label: "سعر ثابت" },
  { value: "percentage", label: "نسبة" },
];

export type OfferFiltersProps = {
  query: string;
  status: OfferListFilter;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: OfferListFilter) => void;
  onClear: () => void;
  showClear: boolean;
};

export function OfferFilters({
  query,
  status,
  onQueryChange,
  onStatusChange,
  onClear,
  showClear,
}: OfferFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="admin-offer-search">
          بحث في العروض
        </label>
        <Input
          id="admin-offer-search"
          type="search"
          placeholder="بحث بالعنوان أو الوصف"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="sm:max-w-sm"
          autoComplete="off"
        />
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
        aria-label="تصفية العروض"
      >
        {FILTERS.map((item) => {
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
