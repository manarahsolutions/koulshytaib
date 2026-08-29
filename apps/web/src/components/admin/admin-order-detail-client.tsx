"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Package } from "lucide-react";
import { AdminOrderNotifications } from "@/components/admin/admin-order-notifications";
import { AdminStatusTimeline } from "@/components/admin/admin-status-timeline";
import { OrderStatusActions } from "@/components/admin/order-status-actions";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Divider } from "@/components/ui/divider";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import {
  formatOrderRef,
  getPaymentLabel,
} from "@/features/admin/format";
import { useOrder } from "@/features/admin/use-orders";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { formatPriceIQD } from "@/lib/format/price";

export function AdminOrderDetailClient() {
  const params = useParams<{ id: string }>();
  const orderId =
    typeof params.id === "string" ? params.id : params.id?.[0] ?? "";
  const order = useOrder(orderId);
  const [error, setError] = useState<string | null>(null);

  if (!order) {
    return (
      <EmptyState
        icon={<Package />}
        title="ما لكينا هذا الطلب"
        description="تأكد من رقم الطلب أو حدّث الصفحة بعد تحميل البيانات من الخادم."
        action={
          <Link
            href="/admin/orders"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-primary px-5 text-sm font-semibold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            رجوع للطلبات
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="typo-caption text-text-muted">
            <Link
              href="/admin/orders"
              className="text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              الطلبات
            </Link>
            <span className="mx-1" aria-hidden>
              /
            </span>
            تفاصيل
          </p>
          <h1 className="mt-1 text-2xl font-bold text-brand-navy">
            طلب {formatOrderRef(order.id)}
          </h1>
          <p className="typo-caption mt-1 text-text-subtle">
            أُنشئ {formatIraqDateTime(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {error ? (
        <p
          className="rounded-lg border border-danger/30 bg-danger-subtle px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <OrderStatusActions order={order} onError={setError} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface-elevated p-4">
          <h2 className="text-base font-semibold text-brand-navy">العميل</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">الاسم</dt>
              <dd>{order.customer.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">الهاتف</dt>
              <dd dir="ltr">{order.customer.phone}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-border bg-surface-elevated p-4">
          <h2 className="text-base font-semibold text-brand-navy">الدفع</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">الطريقة</dt>
              <dd>{getPaymentLabel(order.payment.method)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">المبلغ</dt>
              <dd>
                <Price amount={order.pricing.total} size="sm" />
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-border bg-surface-elevated p-4 lg:col-span-2">
          <h2 className="text-base font-semibold text-brand-navy">العناصر</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {order.items.map((line) => (
              <li
                key={`${line.productId}-${line.name}`}
                className="flex flex-wrap items-start justify-between gap-2 border-b border-border-soft pb-2 last:border-0 last:pb-0"
              >
                <span>
                  {line.name}
                  <span className="text-text-muted"> × {line.quantity}</span>
                  <span className="mt-0.5 block typo-caption text-text-subtle">
                    {formatPriceIQD(line.unitPrice)} للقطعة
                  </span>
                </span>
                <span className="tabular-nums font-medium">
                  {formatPriceIQD(line.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
          <Divider className="my-3" />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">المجموع الفرعي</dt>
              <dd className="tabular-nums">
                {formatPriceIQD(order.pricing.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">التوصيل</dt>
              <dd className="tabular-nums">
                {formatPriceIQD(order.pricing.deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 text-base font-bold">
              <dt>الإجمالي</dt>
              <dd>
                <Price amount={order.pricing.total} size="md" />
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-border bg-surface-elevated p-4">
          <h2 className="text-base font-semibold text-brand-navy">التوصيل</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="typo-caption text-text-subtle">المحافظة</dt>
              <dd>{order.delivery.governorate}</dd>
            </div>
            <div>
              <dt className="typo-caption text-text-subtle">المنطقة</dt>
              <dd>{order.delivery.area}</dd>
            </div>
            <div>
              <dt className="typo-caption text-text-subtle">العنوان</dt>
              <dd>{order.delivery.address}</dd>
            </div>
            {order.delivery.landmark ? (
              <div>
                <dt className="typo-caption text-text-subtle">نقطة دالة</dt>
                <dd>{order.delivery.landmark}</dd>
              </div>
            ) : null}
            {order.delivery.notes ? (
              <div>
                <dt className="typo-caption text-text-subtle">ملاحظات</dt>
                <dd>{order.delivery.notes}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="rounded-lg border border-border bg-surface-elevated p-4">
          <h2 className="text-base font-semibold text-brand-navy">الحالة</h2>
          <p className="mt-2 text-sm text-text-muted">
            الحالية:{" "}
            <span className="font-semibold text-text">
              <OrderStatusBadge status={order.status} />
            </span>
          </p>
          <div className="mt-4">
            <AdminStatusTimeline events={order.statusHistory} />
          </div>
        </section>

        <AdminOrderNotifications
          key={`${order.id}:${order.status}:${order.updatedAt ?? ""}`}
          orderId={order.id}
          refreshKey={`${order.status}:${order.updatedAt ?? order.createdAt}`}
        />
      </div>
    </div>
  );
}
