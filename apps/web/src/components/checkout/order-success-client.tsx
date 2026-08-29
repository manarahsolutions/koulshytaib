"use client";

import { CheckCircle2, Package } from "lucide-react";
import Link from "next/link";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { OrderSummaryCard } from "@/components/orders/order-summary-card";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { getOrderStatusLabel } from "@/features/orders/status";
import { useActiveOrder } from "@/features/orders/use-active-order";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";

export function OrderSuccessClient() {
  const order = useActiveOrder();

  if (!order) {
    return (
      <PageContainer width="narrow" className="py-10">
        <EmptyState
          icon={<Package strokeWidth={ICON_STROKE.default} />}
          title="ماكو طلب نشط حالياً"
          description="إذا طلبت قبل شوية، ممكن تكون الجلسة انتهت. ابدأ من المنيو من جديد."
          action={
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
          }
        />
      </PageContainer>
    );
  }

  const statusLabel = getOrderStatusLabel(order.status);

  return (
    <PageContainer width="narrow" className="py-10">
      <DecorativeMotif
        variant="divider"
        tone="green"
        density="subtle"
        className="mb-5 max-w-xs"
      />

      <div className="flex items-start gap-3">
        <CheckCircle2
          className="mt-0.5 size-8 shrink-0 text-brand-green"
          strokeWidth={ICON_STROKE.emphasis}
          aria-hidden
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-navy">
            تم تجهيز طلبك
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            شكراً لاختيارك كلشي طيب
            {order.customer.name ? `، ${order.customer.name}` : ""}.
          </p>
          <p className="mt-1 text-sm text-text-muted">
            طلبك جاهز للمتابعة.
          </p>
          <p className="typo-caption mt-3 text-text-subtle">
            هذي معاينة واجهة فقط — الطلب ما انحفظ بعد على سيرفر المطعم.
          </p>
        </div>
      </div>

      <section
        className="relative mt-8 rounded-3xl border border-border-soft bg-surface-elevated p-4 shadow-xs sm:p-5"
        aria-labelledby="success-status-heading"
      >
        <DecorativeMotif
          variant="corner"
          tone="navy"
          density="subtle"
          className="pointer-events-none absolute end-2 top-2 size-8"
          aria-hidden
        />
        <p className="typo-label text-text-muted">حالة الطلب</p>
        <h2
          id="success-status-heading"
          className="mt-1 text-lg font-bold text-brand-navy"
        >
          {statusLabel}
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

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/orders/track"
          className={cn(
            "inline-flex h-12 items-center justify-center rounded-2xl bg-brand-primary px-5 text-sm font-semibold text-on-primary",
            "hover:bg-brand-primary-hover",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
          )}
        >
          متابعة الطلب
        </Link>
        <Link
          href="/menu"
          className={cn(
            "inline-flex h-12 items-center justify-center rounded-2xl border border-border-soft bg-surface-elevated px-5 text-sm font-medium text-text",
            "hover:bg-surface-warm",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
          )}
        >
          رجوع للمنيو
        </Link>
      </div>
    </PageContainer>
  );
}
