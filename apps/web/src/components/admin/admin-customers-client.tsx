"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Users } from "lucide-react";
import { AdminLeadsClient } from "@/components/admin/admin-leads-client";
import { CustomerFilters } from "@/components/admin/customer-filters";
import { CustomerCards, CustomerTable } from "@/components/admin/customer-list";
import { EmptyState } from "@/components/ui/empty-state";
import type { LeadRow } from "@/features/analytics/db-analytics-extended";
import type { CustomerListFilter } from "@/features/customers/selectors";
import {
  useCrmRevision,
  useCustomerListItems,
  useCustomers,
} from "@/features/customers/use-crm-customers";
import { cn } from "@/lib/utils/cn";

export type CustomersTab = "list" | "leads";

export type AdminCustomersClientProps = {
  initialLeads?: LeadRow[];
  initialTab?: CustomersTab;
};

function parseTab(value: string | null | undefined): CustomersTab {
  return value === "leads" ? "leads" : "list";
}

export function AdminCustomersClient({
  initialLeads = [],
  initialTab = "list",
}: AdminCustomersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab") ?? initialTab);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CustomerListFilter>("all");
  const customers = useCustomers();
  useCrmRevision();
  const items = useCustomerListItems({ query, filter });

  const hasFilters = query.trim().length > 0 || filter !== "all";
  const clear = () => {
    setQuery("");
    setFilter("all");
  };

  const setTab = (next: CustomersTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "list") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(qs ? `/admin/customers?${qs}` : "/admin/customers", {
      scroll: false,
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-brand-navy">الزبائن</h1>
        <p className="mt-1 text-sm text-text-muted">
          قائمة الزبائن والمتابعة التسويقية في مكان واحد
        </p>
      </header>

      <div
        className="flex flex-wrap gap-2 border-b border-border-soft pb-3"
        role="tablist"
        aria-label="أقسام الزبائن"
      >
        {(
          [
            ["list", "قائمة الزبائن"],
            ["leads", "المتابعة"],
          ] as const
        ).map(([id, label]) => {
          const selected = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(id)}
              className={cn(
                "min-h-10 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                selected
                  ? "bg-brand-navy text-on-dark"
                  : "bg-surface-warm text-text-muted hover:text-text",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {tab === "leads" ? (
        <AdminLeadsClient initial={initialLeads} embedded />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
