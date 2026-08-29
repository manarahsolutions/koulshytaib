"use client";

import Link from "next/link";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { StatCard } from "@/components/admin/stat-card";
import {
  countOrderItems,
  getActiveOrders,
  getTodayAverageOrderValue,
  getTodayDeliveredRevenue,
  getTodayOrders,
} from "@/features/admin/dashboard-metrics";
import {
  formatOrderRef,
  getPaymentLabel,
} from "@/features/admin/format";
import { useOrders } from "@/features/admin/use-orders";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { formatPriceIQD } from "@/lib/format/price";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList } from "lucide-react";

export function AdminDashboardClient() {
  const orders = useOrders();
  const todayOrders = getTodayOrders(orders);
  const revenue = getTodayDeliveredRevenue(orders);
  const active = getActiveOrders(orders);
  const aov = getTodayAverageOrderValue(orders);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-brand-navy">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-text-muted">
          نظرة سريعة على طلبات التوصيل — بيانات التطوير في الذاكرة فقط.
        </p>
      </header>

      <section aria-label="مؤشرات اليوم">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="طلبات اليوم"
            value={String(todayOrders.length)}
            hint="حسب وقت الإنشاء (توقيت العراق)"
          />
          <StatCard
            label="إيرادات المكتمل اليوم"
            value={formatPriceIQD(revenue)}
            hint="delivered فقط — بدون الملغى"
          />
          <StatCard
            label="طلبات قيد التنفيذ"
            value={String(active.length)}
            hint="غير مسلّم وغير ملغى"
          />
          <StatCard
            label="متوسط قيمة المكتمل"
            value={aov === null ? "—" : formatPriceIQD(Math.round(aov))}
            hint="متوسط delivered اليوم"
          />
        </div>
      </section>

      <section aria-labelledby="active-orders-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="active-orders-heading"
            className="text-lg font-semibold text-brand-navy"
          >
            الطلبات الحالية
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            كل الطلبات
          </Link>
        </div>

        {active.length === 0 ? (
          <EmptyState
            icon={<ClipboardList />}
            title="ماكو طلبات حالياً"
            description="الطلبات النشطة تظهر هنا بعد الاستلام من الضيوف."
          />
        ) : (
          <ul className="space-y-3">
            {active.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="block rounded-lg border border-border bg-surface-elevated p-4 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-navy">
                        {formatOrderRef(order.id)}
                      </p>
                      <p className="mt-1 text-sm text-text">
                        {order.customer.name}
                      </p>
                      <p className="typo-caption mt-0.5 text-text-muted" dir="ltr">
                        {order.customer.phone}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="typo-caption text-text-subtle">العناصر</dt>
                      <dd className="tabular-nums">
                        {countOrderItems(order)}
                      </dd>
                    </div>
                    <div>
                      <dt className="typo-caption text-text-subtle">الإجمالي</dt>
                      <dd className="tabular-nums">
                        {formatPriceIQD(order.pricing.total)}
                      </dd>
                    </div>
                    <div>
                      <dt className="typo-caption text-text-subtle">الدفع</dt>
                      <dd>{getPaymentLabel(order.payment.method)}</dd>
                    </div>
                    <div>
                      <dt className="typo-caption text-text-subtle">الوقت</dt>
                      <dd>{formatIraqDateTime(order.createdAt)}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
