"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { StatCard } from "@/components/admin/stat-card";
import {
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/ui/admin-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  countOrderItems,
  getActiveOrders,
  getTodayAverageOrderValue,
  getTodayDeliveredRevenue,
  getTodayOrders,
} from "@/features/admin/dashboard-metrics";
import {
  buildLastDaysSeries,
  getAttentionOrders,
} from "@/features/admin/dashboard-series";
import {
  formatOrderRef,
  getPaymentLabel,
} from "@/features/admin/format";
import { useOrders } from "@/features/admin/use-orders";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { formatPriceIQD } from "@/lib/format/price";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";

export function AdminDashboardClient() {
  const orders = useOrders();
  const todayOrders = getTodayOrders(orders);
  const revenue = getTodayDeliveredRevenue(orders);
  const active = getActiveOrders(orders);
  const aov = getTodayAverageOrderValue(orders);
  const series = buildLastDaysSeries(orders, 7);
  const attention = getAttentionOrders(orders);
  const maxOrders = Math.max(1, ...series.map((d) => d.orderCount));
  const maxRevenue = Math.max(1, ...series.map((d) => d.revenueIqd));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="لوحة التحكم"
        description="نظرة حية على الطلبات والإيراد من قاعدة البيانات."
      />

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

      <section
        aria-labelledby="trends-heading"
        className="grid gap-4 lg:grid-cols-2"
      >
        <AdminPanel>
          <h2
            id="trends-heading"
            className="text-base font-semibold text-brand-navy"
          >
            الطلبات — آخر 7 أيام
          </h2>
          <ul className="mt-4 flex h-36 items-end gap-1.5" aria-hidden>
            {series.map((d) => (
              <li
                key={d.key}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
                title={`${d.label}: ${d.orderCount}`}
              >
                <span
                  className="w-full rounded-t-md bg-brand-primary/85"
                  style={{
                    height: `${Math.max(4, (d.orderCount / maxOrders) * 100)}%`,
                  }}
                />
                <span className="truncate text-[0.65rem] text-text-subtle">
                  {d.label.split(" ")[0]}
                </span>
              </li>
            ))}
          </ul>
          <p className="sr-only">
            {series
              .map((d) => `${d.label}: ${d.orderCount} طلب`)
              .join("، ")}
          </p>
        </AdminPanel>

        <AdminPanel>
          <h2 className="text-base font-semibold text-brand-navy">
            إيراد المكتمل — آخر 7 أيام
          </h2>
          <ul className="mt-4 flex h-36 items-end gap-1.5" aria-hidden>
            {series.map((d) => (
              <li
                key={`rev-${d.key}`}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
                title={`${d.label}: ${formatPriceIQD(d.revenueIqd)}`}
              >
                <span
                  className="w-full rounded-t-md bg-brand-navy/80"
                  style={{
                    height: `${Math.max(4, (d.revenueIqd / maxRevenue) * 100)}%`,
                  }}
                />
                <span className="truncate text-[0.65rem] text-text-subtle">
                  {d.label.split(" ")[0]}
                </span>
              </li>
            ))}
          </ul>
        </AdminPanel>
      </section>

      <section aria-labelledby="attention-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="attention-heading"
            className="text-lg font-semibold text-brand-navy"
          >
            يحتاج انتباه
          </h2>
          <span className="typo-caption text-text-muted">
            طلبات مستلمة أو مؤكدة بانتظار التحضير
          </span>
        </div>
        {attention.length === 0 ? (
          <AdminPanel>
            <p className="text-sm text-text-muted">ماكو طلبات معلّقة حالياً.</p>
          </AdminPanel>
        ) : (
          <ul className="space-y-2">
            {attention.slice(0, 8).map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border-soft bg-surface-elevated px-4 py-3 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-navy">
                      {formatOrderRef(order.id)} · {order.customer.name}
                    </p>
                    <p className="typo-caption text-text-muted">
                      {formatIraqDateTime(order.createdAt)}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
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
            icon={<ClipboardList strokeWidth={ICON_STROKE.default} />}
            title="ماكو طلبات حالياً"
            description="الطلبات النشطة تظهر هنا بعد الاستلام من الضيوف."
          />
        ) : (
          <ul className="space-y-3">
            {active.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="block rounded-2xl border border-border-soft bg-surface-elevated p-4 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-navy">
                        {formatOrderRef(order.id)}
                      </p>
                      <p className="mt-1 text-sm text-text">
                        {order.customer.name}
                      </p>
                      <p
                        className="typo-caption mt-0.5 text-text-muted"
                        dir="ltr"
                      >
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
