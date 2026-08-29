"use client";

import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { OrderFilters } from "@/components/admin/order-filters";
import { OrderCards, OrderTable } from "@/components/admin/order-list";
import { EmptyState } from "@/components/ui/empty-state";
import { filterOrders } from "@/features/admin/dashboard-metrics";
import { useOrders } from "@/features/admin/use-orders";
import type { OrderStatus } from "@/types/order";

export function AdminOrdersClient() {
  const orders = useOrders();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");

  const filtered = useMemo(
    () => filterOrders({ orders, query, status }),
    [orders, query, status],
  );

  const hasFilters = query.trim().length > 0 || status !== "all";
  const clear = () => {
    setQuery("");
    setStatus("all");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-brand-navy">الطلبات</h1>
        <p className="mt-1 text-sm text-text-muted">
          إدارة طلبات التوصيل — الأحدث أولاً.
        </p>
      </header>

      <OrderFilters
        query={query}
        status={status}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
        onClear={clear}
        showClear={hasFilters}
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList />}
          title="ماكو طلبات حالياً"
          description="بعد ما يوصل طلب ضيف، يظهر هنا."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList />}
          title="ماكو طلبات مطابقة"
          description="جرّب مسح البحث أو تغيير الفلتر."
          action={
            <button
              type="button"
              onClick={clear}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-primary px-5 text-sm font-semibold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              مسح الفلتر
            </button>
          }
        />
      ) : (
        <>
          <OrderTable orders={filtered} />
          <OrderCards orders={filtered} />
        </>
      )}
    </div>
  );
}
