"use client";

import { Input } from "@/components/ui/input";

export type LoyaltyCustomerSearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onClear: () => void;
  showClear: boolean;
};

export function LoyaltyCustomerSearch({
  query,
  onQueryChange,
  onClear,
  showClear,
}: LoyaltyCustomerSearchProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="sr-only" htmlFor="admin-loyalty-search">
        بحث زبائن الولاء
      </label>
      <Input
        id="admin-loyalty-search"
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
  );
}
