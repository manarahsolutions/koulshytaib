"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, MessageCircle, Package } from "lucide-react";
import Link from "next/link";
import { getKitchenOrderWhatsAppLinkAction } from "@/app/actions/backend";
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
  const [kitchenUrl, setKitchenUrl] = useState<string | null | undefined>(
    undefined,
  );
  const [kitchenError, setKitchenError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!order) return;
    let cancelled = false;
    void (async () => {
      const result = await getKitchenOrderWhatsAppLinkAction(order);
      if (cancelled) return;
      if (!result.ok) {
        setKitchenError(result.message);
        setKitchenUrl(null);
        return;
      }
      setKitchenError(null);
      setKitchenUrl(result.data.url);
    })();
    return () => {
      cancelled = true;
    };
  }, [order]);

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

  const openKitchenWhatsApp = () => {
    if (!kitchenUrl) return;
    setOpening(true);
    window.open(kitchenUrl, "_blank", "noopener,noreferrer");
    setOpening(false);
  };

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
            تم استلام طلبك
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            شكراً لاختيارك كلشي طيب
            {order.customer.name ? `، ${order.customer.name}` : ""}.
          </p>
          <p className="mt-1 text-sm text-text-muted">
            ثبّت الطلب على واتساب المطبخ حتى يوصلهم فوراً.
          </p>
        </div>
      </div>

      {kitchenUrl ? (
        <section
          className="mt-8 rounded-3xl border border-brand-green/25 bg-success-subtle/40 p-4 sm:p-5"
          aria-labelledby="kitchen-wa-heading"
        >
          <h2
            id="kitchen-wa-heading"
            className="text-lg font-bold text-brand-navy"
          >
            تثبيت الطلب على واتساب
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            اضغط الزر، تأكد من الرسالة، ثم اضغط إرسال في واتساب حتى يستلم المطبخ
            تفاصيل طلبك.
          </p>
          <button
            type="button"
            onClick={openKitchenWhatsApp}
            disabled={opening}
            className={cn(
              "mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-green px-5 text-sm font-semibold text-on-green",
              "hover:opacity-95",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              "disabled:opacity-60",
            )}
          >
            <MessageCircle
              className="size-5 shrink-0"
              strokeWidth={ICON_STROKE.emphasis}
              aria-hidden
            />
            ثبّت الطلب على واتساب
          </button>
        </section>
      ) : kitchenUrl === null ? (
        <p className="mt-6 rounded-2xl border border-border-soft bg-surface-warm px-4 py-3 text-sm text-text-muted">
          {kitchenError
            ? kitchenError
            : "تواصل مع المطعم عبر الهاتف إذا احتجت تأكيد إضافي — رقم واتساب المطبخ غير مُعدّ حالياً."}
        </p>
      ) : (
        <p className="mt-6 text-sm text-text-muted">جارٍ تجهيز رابط واتساب…</p>
      )}

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
