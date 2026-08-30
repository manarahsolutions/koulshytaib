"use client";

import { Package, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import {
  databaseStatusAction,
  trackGuestOrderAction,
} from "@/app/actions/backend";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { OrderSummaryCard } from "@/components/orders/order-summary-card";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { formatOrderRef } from "@/features/admin/format";
import { getOrderStatusLabel } from "@/features/orders/status";
import { saveActiveOrder } from "@/features/orders/order-store";
import { useActiveOrder } from "@/features/orders/use-active-order";
import {
  normalizeIraqiPhone,
  sanitizePhoneInput,
} from "@/lib/format/phone";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";
import type { Order } from "@/types/order";

const POLL_MS = 12_000;

function formatUpdatedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ar-IQ", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function isTerminal(status: Order["status"]): boolean {
  return status === "delivered" || status === "cancelled";
}

export function OrderTrackClient() {
  const order = useActiveOrder();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveTracking, setLiveTracking] = useState(false);
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);
  const formId = useId();

  const pullLatest = useCallback(async (opts?: { silent?: boolean }) => {
    if (!order?.id || !order.customer.phone) return;
    if (opts?.silent && isTerminal(order.status)) return;

    if (!opts?.silent) {
      setRefreshing(true);
      setError(null);
    }

    try {
      const status = await databaseStatusAction();
      if (!status.configured) {
        setLiveTracking(false);
        return;
      }

      const result = await trackGuestOrderAction({
        orderId: order.id,
        phone: order.customer.phone,
      });
      if (!result.ok) {
        if (!opts?.silent) setError(result.message);
        return;
      }
      setLiveTracking(true);
      saveActiveOrder(result.data);
    } catch {
      if (!opts?.silent) {
        setError("ما قدرنا نحدّث حالة الطلب، حاول مرة ثانية.");
      }
    } finally {
      if (!opts?.silent) setRefreshing(false);
    }
  }, [order]);

  useEffect(() => {
    if (!order?.id || isTerminal(order.status)) return;

    const kickoff = window.setTimeout(() => {
      void pullLatest({ silent: true });
    }, 0);
    const timer = window.setInterval(() => {
      void pullLatest({ silent: true });
    }, POLL_MS);

    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(timer);
    };
  }, [order?.id, order?.status, pullLatest]);

  const onLookup = async (event: FormEvent) => {
    event.preventDefault();
    const phone = normalizeIraqiPhone(lookupPhone);
    if (!phone) {
      setError("تأكد من رقم الهاتف");
      return;
    }
    setLookupBusy(true);
    setError(null);
    try {
      const status = await databaseStatusAction();
      if (!status.configured) {
        setError("التتبع الحي غير متاح حالياً — أكمل الطلب من نفس الجهاز.");
        return;
      }
      const result = await trackGuestOrderAction({ phone });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setLiveTracking(true);
      saveActiveOrder(result.data);
    } catch {
      setError("صار خطأ، حاول مرة ثانية.");
    } finally {
      setLookupBusy(false);
    }
  };

  if (!order) {
    return (
      <PageContainer width="narrow" className="py-10">
        <EmptyState
          icon={<Package strokeWidth={ICON_STROKE.default} />}
          title="ماكو طلب للمتابعة بهالجلسة"
          description="اكتب رقم الهاتف اللي سجّلتيه بالطلب ونطلّع لك آخر طلب، أو ارجع للمنيو."
          action={
            <div className="mx-auto w-full max-w-sm space-y-4">
              <form
                onSubmit={(e) => void onLookup(e)}
                className="space-y-3 text-start"
              >
                <label
                  htmlFor={`${formId}-phone`}
                  className="block text-sm font-medium text-text"
                >
                  رقم الهاتف
                </label>
                <Input
                  id={`${formId}-phone`}
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  className="text-start"
                  placeholder="07xxxxxxxxx"
                  value={lookupPhone}
                  onChange={(e) =>
                    setLookupPhone(sanitizePhoneInput(e.target.value))
                  }
                />
                {error ? (
                  <p className="text-sm text-danger" role="alert">
                    {error}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  variant="primary"
                  loading={lookupBusy}
                  className="w-full"
                >
                  متابعة الطلب
                </Button>
              </form>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/menu"
                  className={cn(
                    "inline-flex h-11 items-center justify-center rounded-2xl border border-border-soft bg-surface-elevated px-5 text-sm font-medium text-text",
                    "hover:bg-surface-warm",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                  )}
                >
                  تصفح المنيو
                </Link>
              </div>
            </div>
          }
        />
      </PageContainer>
    );
  }

  const terminal = isTerminal(order.status);

  return (
    <PageContainer width="narrow" className="py-10">
      <DecorativeMotif
        variant="divider"
        tone="navy"
        density="subtle"
        className="mb-5 max-w-xs"
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-brand-navy">
            متابعة الطلب
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            طلب{" "}
            <span
              className="font-semibold tabular-nums text-brand-navy"
              dir="ltr"
            >
              {formatOrderRef(order.id)}
            </span>
            {" · "}
            الحالة:{" "}
            <span className="font-semibold text-brand-navy">
              {getOrderStatusLabel(order.status)}
            </span>
          </p>
          <p className="typo-caption mt-1.5 text-text-subtle">
            آخر تحديث: {formatUpdatedAt(order.updatedAt ?? order.createdAt)}
            {liveTracking && !terminal
              ? " · يتحدّث تلقائياً عند تغيّر حالة الطلب من المطعم"
              : null}
          </p>
        </div>

        {!terminal ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={refreshing}
            onClick={() => void pullLatest()}
            startIcon={
              <RefreshCw
                className="size-4"
                strokeWidth={ICON_STROKE.default}
                aria-hidden
              />
            }
          >
            تحديث
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

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
