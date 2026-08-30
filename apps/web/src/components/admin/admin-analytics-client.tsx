"use client";

import { formatPriceIQD } from "@/lib/format/price";
import type { AnalyticsSnapshot } from "@/features/analytics/types";

const STATUS_AR: Record<string, string> = {
  received: "مستلم",
  confirmed: "مؤكد",
  preparing: "قيد التحضير",
  out_for_delivery: "بالطريق",
  delivered: "مكتمل",
  cancelled: "ملغى",
};

export type AdminAnalyticsClientProps = {
  data: AnalyticsSnapshot;
};

export function AdminAnalyticsClient({ data }: AdminAnalyticsClientProps) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-brand-navy">التحليلات</h1>
        <p className="typo-caption mt-1 text-text-muted">
          نظرة سريعة من الطلبات — بدون لوحة تحليلات منفصلة.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="طلبات (غير ملغاة)" value={String(data.orderCount)} />
        <Stat label="ملغاة" value={String(data.cancelledCount)} />
        <Stat label="إجمالي المبيعات" value={formatPriceIQD(data.revenueIqd)} />
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold text-brand-navy">
          الطلبات حسب الحالة
        </h2>
        <ul className="divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface-elevated">
          {data.byStatus.map((row) => (
            <li
              key={row.status}
              className="flex justify-between gap-3 px-4 py-2.5 text-sm"
            >
              <span>{STATUS_AR[row.status] ?? row.status}</span>
              <span className="tabular-nums font-semibold">{row.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-brand-navy">
          أكثر المنتجات طلباً
        </h2>
        {data.topProducts.length === 0 ? (
          <p className="typo-caption text-text-muted">ماكو مبيعات بعد.</p>
        ) : (
          <ul className="divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface-elevated">
            {data.topProducts.map((p) => (
              <li
                key={p.name}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5 text-sm"
              >
                <span className="font-medium">{p.name}</span>
                <span className="typo-caption text-text-muted">
                  ×{p.quantity} · {formatPriceIQD(p.revenueIqd)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
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
