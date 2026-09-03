"use client";

import { useState } from "react";
import { fetchAnalyticsAction } from "@/app/actions/backend";
import {
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/ui/admin-page-header";
import { Button } from "@/components/ui/button";
import { downloadCsv, toCsv } from "@/lib/csv/download-csv";
import { formatPriceIQD } from "@/lib/format/price";
import type { ExtendedAnalytics } from "@/features/analytics/db-analytics-extended";

const STATUS_AR: Record<string, string> = {
  received: "مستلم",
  confirmed: "مؤكد",
  preparing: "قيد التحضير",
  out_for_delivery: "بالطريق",
  delivered: "مكتمل",
  cancelled: "ملغى",
};

export function AdminAnalyticsClient({
  initial,
}: {
  initial: ExtendedAnalytics;
}) {
  const [data, setData] = useState(initial);
  const [preset, setPreset] = useState<"day" | "week" | "month">("week");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async (next: "day" | "week" | "month") => {
    setBusy(true);
    setError(null);
    setPreset(next);
    try {
      const result = await fetchAnalyticsAction({ preset: next });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setData(result.data as ExtendedAnalytics);
    } finally {
      setBusy(false);
    }
  };

  const exportTop = () => {
    downloadCsv(
      "top-products.csv",
      toCsv(
        data.topProducts.map((p) => ({
          name: p.name,
          quantity: p.quantity,
          revenueIqd: p.revenueIqd,
        })),
      ),
    );
  };

  const maxDaily = Math.max(1, ...data.daily.map((d) => d.orders));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="التحليلات"
        description="تقارير من الطلبات حسب الفترة — قابلة للتصدير CSV."
        actions={
          <div className="flex flex-wrap gap-2">
            {(["day", "week", "month"] as const).map((p) => (
              <Button
                key={p}
                type="button"
                size="sm"
                variant={preset === p ? "primary" : "outline"}
                loading={busy && preset === p}
                onClick={() => void reload(p)}
              >
                {p === "day" ? "يوم" : p === "week" ? "أسبوع" : "شهر"}
              </Button>
            ))}
            <Button type="button" size="sm" variant="secondary" onClick={exportTop}>
              تصدير المنتجات CSV
            </Button>
          </div>
        }
      />

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="طلبات (غير ملغاة)" value={String(data.orderCount)} />
        <Stat label="ملغاة" value={String(data.cancelledCount)} />
        <Stat label="الإيراد" value={formatPriceIQD(data.revenueIqd)} />
        <Stat
          label="AOV"
          value={data.aov == null ? "—" : formatPriceIQD(data.aov)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="زبائن جدد" value={String(data.newCustomers)} />
        <Stat label="زبائن عائدون" value={String(data.returningCustomers)} />
        <Stat label="طلبات بكوبون" value={String(data.couponOrders)} />
        <Stat
          label="خصم كوبونات"
          value={formatPriceIQD(data.couponDiscountTotal)}
        />
      </div>

      <AdminPanel>
        <h2 className="text-base font-semibold text-brand-navy">
          الطلبات يومياً
        </h2>
        <ul className="mt-4 flex h-32 items-end gap-1">
          {data.daily.map((d) => (
            <li
              key={d.day}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
              title={`${d.day}: ${d.orders}`}
            >
              <span
                className="w-full rounded-t bg-brand-primary/80"
                style={{
                  height: `${Math.max(4, (d.orders / maxDaily) * 100)}%`,
                }}
              />
            </li>
          ))}
        </ul>
      </AdminPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel>
          <h2 className="mb-3 text-base font-semibold text-brand-navy">
            حسب الحالة
          </h2>
          <ul className="divide-y divide-border-soft">
            {data.byStatus.map((row) => (
              <li
                key={row.status}
                className="flex justify-between py-2 text-sm"
              >
                <span>{STATUS_AR[row.status] ?? row.status}</span>
                <span className="tabular-nums font-semibold">{row.count}</span>
              </li>
            ))}
          </ul>
        </AdminPanel>
        <AdminPanel>
          <h2 className="mb-3 text-base font-semibold text-brand-navy">
            ساعات الذروة
          </h2>
          <ul className="divide-y divide-border-soft">
            {data.peakHours.map((row) => (
              <li
                key={row.hour}
                className="flex justify-between py-2 text-sm"
              >
                <span dir="ltr">{row.hour}:00</span>
                <span className="tabular-nums font-semibold">{row.count}</span>
              </li>
            ))}
          </ul>
        </AdminPanel>
      </div>

      <AdminPanel>
        <h2 className="mb-3 text-base font-semibold text-brand-navy">
          أكثر المنتجات
        </h2>
        <ul className="divide-y divide-border-soft">
          {data.topProducts.map((p) => (
            <li
              key={p.name}
              className="flex flex-wrap justify-between gap-2 py-2 text-sm"
            >
              <span className="font-medium">{p.name}</span>
              <span className="typo-caption text-text-muted">
                ×{p.quantity} · {formatPriceIQD(p.revenueIqd)}
              </span>
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface-elevated px-4 py-3">
      <p className="typo-caption text-text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-brand-navy">
        {value}
      </p>
    </div>
  );
}
