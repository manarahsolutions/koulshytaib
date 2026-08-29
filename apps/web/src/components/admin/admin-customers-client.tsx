"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { CustomerFilters } from "@/components/admin/customer-filters";
import { CustomerCards, CustomerTable } from "@/components/admin/customer-list";
import { EmptyState } from "@/components/ui/empty-state";
import type { CustomerListFilter } from "@/features/customers/selectors";
import {
  useCrmRevision,
  useCustomerListItems,
  useCustomers,
} from "@/features/customers/use-crm-customers";

export function AdminCustomersClient() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CustomerListFilter>("all");
  const customers = useCustomers();
  useCrmRevision(); // keep metrics live when orders mutate
  const items = useCustomerListItems({ query, filter });

  const hasFilters = query.trim().length > 0 || filter !== "all";
  const clear = () => {
    setQuery("");
    setFilter("all");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-brand-navy">الزبائن</h1>
        <p className="mt-1 text-sm text-text-muted">
          نظرة سريعة على الزبائن وسجل طلباتهم
        </p>
      </header>

      <CustomerFilters
        query={query}
        filter={filter}
        onQueryChange={setQuery}
        onFilterChange={setFilter}
        onClear={clear}
        showClear={hasFilters}
      />

      {customers.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="ماكو زبائن حالياً"
          description="الزبائن يظهرون بعد أول طلب ضيف أو بيانات التطوير."
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="ماكو زبائن مطابقين"
          description="جرّب مسح البحث أو تغيير الفلتر."
          action={
            <button
              type="button"
              onClick={clear}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-primary px-5 text-sm font-semibold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              مسح البحث
            </button>
          }
        />
      ) : (
        <>
          <CustomerTable items={items} />
          <CustomerCards items={items} />
        </>
      )}
    </div>
  );
}
