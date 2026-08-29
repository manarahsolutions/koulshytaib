"use client";

import { ORDER_STATUS_ADMIN_LABELS } from "@/features/orders/order-transitions";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { OrderStatus } from "@/types/order";

const FILTERS: Array<{ value: OrderStatus | "all"; label: string }> = [
  { value: "all", label: "الكل" },
  { value: "received", label: ORDER_STATUS_ADMIN_LABELS.received },
  { value: "confirmed", label: ORDER_STATUS_ADMIN_LABELS.confirmed },
  { value: "preparing", label: ORDER_STATUS_ADMIN_LABELS.preparing },
  {
    value: "out_for_delivery",
    label: ORDER_STATUS_ADMIN_LABELS.out_for_delivery,
  },
  { value: "delivered", label: ORDER_STATUS_ADMIN_LABELS.delivered },
  { value: "cancelled", label: ORDER_STATUS_ADMIN_LABELS.cancelled },
];

export type OrderFiltersProps = {
  query: string;
  status: OrderStatus | "all";
  onQueryChange: (value: string) => void;
  onStatusChange: (value: OrderStatus | "all") => void;
  onClear: () => void;
  showClear: boolean;
};

export function OrderFilters({
  query,
  status,
  onQueryChange,
  onStatusChange,
  onClear,
  showClear,
}: OrderFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="admin-order-search">
          بحث في الطلبات
        </label>
        <Input
          id="admin-order-search"
          type="search"
          placeholder="بحث برقم الطلب أو اسم العميل"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="sm:max-w-sm"
        />
        {showClear ? (
          <button
            type="button"
            onClick={onClear}
            className="h-11 rounded-md px-3 text-sm font-medium text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            مسح الفلتر
          </button>
        ) : null}
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="تصفية حسب الحالة"
      >
        {FILTERS.map((filter) => {
          const active = status === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              aria-pressed={active}
              onClick={() => onStatusChange(filter.value)}
              className={cn(
                "inline-flex h-11 items-center rounded-md border px-3 text-sm font-medium",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                active
                  ? "border-brand-navy bg-brand-navy text-on-primary"
                  : "border-border bg-surface-elevated text-text hover:bg-surface-warm",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
