"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { CustomerListFilter } from "@/features/customers/selectors";

const FILTERS: Array<{ value: CustomerListFilter; label: string }> = [
  { value: "all", label: "الكل" },
  { value: "new", label: "زبائن جدد" },
  { value: "returning", label: "زبائن عائدين" },
];

export type CustomerFiltersProps = {
  query: string;
  filter: CustomerListFilter;
  onQueryChange: (value: string) => void;
  onFilterChange: (value: CustomerListFilter) => void;
  onClear: () => void;
  showClear: boolean;
};

export function CustomerFilters({
  query,
  filter,
  onQueryChange,
  onFilterChange,
  onClear,
  showClear,
}: CustomerFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="admin-customer-search">
          بحث في الزبائن
        </label>
        <Input
          id="admin-customer-search"
          type="search"
          placeholder="بحث بالاسم أو رقم الهاتف"
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
            مسح البحث
          </button>
        ) : null}
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="تصفية الزبائن"
      >
        {FILTERS.map((item) => {
          const active = filter === item.value;
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={active}
              onClick={() => onFilterChange(item.value)}
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
