"use client";

import { Package } from "lucide-react";
import Link from "next/link";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { OrderSummaryCard } from "@/components/orders/order-summary-card";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { getOrderStatusLabel } from "@/features/orders/status";
import { useActiveOrder } from "@/features/orders/use-active-order";
import { cn } from "@/lib/utils/cn";

export function OrderTrackClient() {
  const order = useActiveOrder();

  if (!order) {
    return (
      <PageContainer width="narrow" className="py-10">
        <EmptyState
          icon={<Package />}
          title="ما قدرنا نعرض حالة الطلب حالياً."
          description="ماكو طلب نشط بهالجلسة. رجّع للمنيو أو أكمل طلب جديد من السلة."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/menu"
                className={cn(
                  "inline-flex h-11 items-center justify-center rounded-2xl bg-brand-primary px-5 text-sm font-semibold text-on-primary",
                  "hover:bg-brand-primary-hover",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                )}
              >
                تصفح المنيو
              </Link>
              <Link
                href="/"
                className={cn(
                  "inline-flex h-11 items-center justify-center rounded-2xl border border-border-soft bg-surface-elevated px-5 text-sm font-medium text-text",
                  "hover:bg-surface-warm",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                )}
              >
                رجوع
              </Link>
            </div>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer width="narrow" className="py-10">
      <DecorativeMotif
        variant="divider"
        tone="navy"
        density="subtle"
        className="mb-5 max-w-xs"
      />

      <h1 className="text-2xl font-bold tracking-tight text-brand-navy">
        متابعة الطلب
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        الحالة الحالية:{" "}
        <span className="font-semibold text-brand-navy">
          {getOrderStatusLabel(order.status)}
        </span>
      </p>
      <p className="typo-caption mt-2 text-text-subtle">
        التتبع هنا واجهة فقط — ماكو تحديثات حقيقية من المطعم بعد.
      </p>

      <section
        className="mt-8 rounded-3xl border border-border-soft bg-surface-elevated p-4 shadow-xs sm:p-5"
        aria-labelledby="track-timeline-heading"
      >
        <h2
          id="track-timeline-heading"
          className="text-base font-semibold text-brand-navy"
        >
          مسار الطلب
        </h2>
        <div className="mt-5">
          <OrderStatusTimeline
            currentStatus={order.status}
            statusHistory={order.statusHistory}
          />
        </div>
      </section>

      <div className="mt-6">
        <OrderSummaryCard order={order} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/menu"
          className={cn(
            "inline-flex h-11 items-center justify-center rounded-2xl bg-brand-primary px-5 text-sm font-semibold text-on-primary",
            "hover:bg-brand-primary-hover",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
          )}
        >
          رجوع للمنيو
        </Link>
        <Link
          href="/orders/success"
          className={cn(
            "inline-flex h-11 items-center justify-center rounded-2xl border border-border-soft bg-surface-elevated px-5 text-sm font-medium text-text",
            "hover:bg-surface-warm",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
          )}
        >
          صفحة التأكيد
        </Link>
      </div>
    </PageContainer>
  );
}
