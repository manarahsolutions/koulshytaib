"use client";

import { useEffect, useState } from "react";
import { fetchOrderNotificationsAction } from "@/app/actions/backend";
import {
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_STATUS_LABELS,
  NOTIFICATION_TYPE_LABELS,
  type NotificationRecord,
} from "@/features/notifications/types";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { cn } from "@/lib/utils/cn";

export function AdminOrderNotifications({
  orderId,
  refreshKey,
}: {
  orderId: string;
  /** Bump when order status changes so the log reloads */
  refreshKey?: string;
}) {
  const [items, setItems] = useState<NotificationRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await fetchOrderNotificationsAction(orderId);
      if (cancelled) return;
      if (!result.ok) {
        setError(result.message);
        setItems([]);
        return;
      }
      setError(null);
      setItems(result.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, refreshKey]);

  return (
    <section className="rounded-lg border border-border bg-surface-elevated p-4 lg:col-span-2">
      <h2 className="text-base font-semibold text-brand-navy">
        سجل الإشعارات
      </h2>
      <p className="mt-1 text-xs text-text-muted">
        نيات الإرسال للزبون — حالياً عبر مزود تجريبي (بدون رسائل حقيقية)
      </p>

      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {items === null ? (
        <p className="mt-3 text-sm text-text-muted">جارٍ التحميل…</p>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-text-muted">ماكو إشعارات لهذا الطلب بعد.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border-soft">
          {items.map((n) => (
            <li key={n.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text">
                    {NOTIFICATION_TYPE_LABELS[n.type]}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {NOTIFICATION_CHANNEL_LABELS[n.channel]}
                    <span className="mx-1" aria-hidden>
                      ·
                    </span>
                    {n.title}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold",
                    n.status === "SENT" &&
                      "border-success/30 bg-success-subtle text-success",
                    n.status === "FAILED" &&
                      "border-danger/30 bg-danger-subtle text-danger",
                    n.status === "PENDING" &&
                      "border-border bg-surface-warm text-text-muted",
                    n.status === "SENDING" &&
                      "border-warning/40 bg-warning-subtle text-warning-text",
                  )}
                >
                  {NOTIFICATION_STATUS_LABELS[n.status]}
                </span>
              </div>
              <p className="mt-2 text-sm text-text-muted">{n.body}</p>
              <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-subtle">
                <div>
                  <dt className="sr-only">أُنشئ</dt>
                  <dd>أُنشئ {formatIraqDateTime(n.createdAt)}</dd>
                </div>
                {n.sentAt ? (
                  <div>
                    <dt className="sr-only">أُرسل</dt>
                    <dd>أُرسل {formatIraqDateTime(n.sentAt)}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="sr-only">محاولات</dt>
                  <dd>محاولات {n.attempts}</dd>
                </div>
                {n.lastError ? (
                  <div className="basis-full text-danger">
                    <dt className="sr-only">خطأ</dt>
                    <dd>{n.lastError}</dd>
                  </div>
                ) : null}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
