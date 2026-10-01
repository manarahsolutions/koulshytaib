"use client";

import { Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getPublicCheckoutSettingsAction } from "@/app/actions/backend";
import { Button } from "@/components/ui/button";
import {
  formatOrderRef,
  getPaymentLabel,
} from "@/features/admin/format";
import { getAdminStatusLabel } from "@/features/orders/order-transitions";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { formatPriceIQD } from "@/lib/format/price";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";
import type { Order } from "@/types/order";

export type AdminOrderInvoiceProps = {
  order: Order;
  className?: string;
};

/**
 * Order invoice / details — on-screen preview + browser print.
 */
export function AdminOrderInvoice({ order, className }: AdminOrderInvoiceProps) {
  const printRef = useRef<HTMLElement>(null);
  const [restaurantName, setRestaurantName] = useState("كلشي طيب");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await getPublicCheckoutSettingsAction();
      if (cancelled || !result.ok) return;
      const name = result.data.displayName?.trim();
      if (name) setRestaurantName(name);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const print = () => {
    document.body.classList.add("printing-order-invoice");
    const cleanup = () => {
      document.body.classList.remove("printing-order-invoice");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    // Fallback if afterprint never fires (some mobile browsers).
    window.setTimeout(cleanup, 1000);
  };

  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-surface-elevated p-4",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-base font-semibold text-brand-navy">
            فاتورة وتفاصيل الطلب
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            اطبع الفاتورة للمطبخ أو للزبون — تشمل العناصر والعنوان والمبالغ.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={print}
          className="min-h-11 gap-2"
          startIcon={
            <Printer
              className="size-4"
              strokeWidth={ICON_STROKE.default}
              aria-hidden
            />
          }
        >
          طباعة الفاتورة
        </Button>
      </div>

      <article
        ref={printRef}
        id="order-invoice-print"
        dir="rtl"
        className={cn(
          "mt-4 rounded-xl border border-border-soft bg-background p-4 text-text sm:p-5",
          "print:mt-0 print:rounded-none print:border-0 print:p-0 print:shadow-none",
        )}
      >
        <header className="border-b border-border-soft pb-4 text-center">
          <p className="text-xl font-bold text-brand-navy">{restaurantName}</p>
          <p className="mt-1 text-sm font-semibold text-text">فاتورة طلب</p>
          <p className="mt-2 text-sm text-text-muted">
            رقم الطلب:{" "}
            <span className="font-semibold tabular-nums text-text" dir="ltr">
              {formatOrderRef(order.id)}
            </span>
          </p>
          <p className="typo-caption mt-1 text-text-subtle">
            التاريخ: {formatIraqDateTime(order.createdAt)}
          </p>
        </header>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-brand-navy">الزبون</h3>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">الاسم</dt>
                <dd className="font-medium">{order.customer.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">الهاتف</dt>
                <dd className="font-medium tabular-nums" dir="ltr">
                  {order.customer.phone}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-brand-navy">الدفع والحالة</h3>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">طريقة الدفع</dt>
                <dd className="font-medium">
                  {getPaymentLabel(order.payment.method)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">حالة الطلب</dt>
                <dd className="font-medium">
                  {getAdminStatusLabel(order.status)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-brand-navy">عنوان التوصيل</h3>
          <p className="mt-2 text-sm leading-relaxed">
            {order.delivery.governorate} · {order.delivery.area}
            <br />
            {order.delivery.address}
            {order.delivery.landmark ? (
              <>
                <br />
                نقطة دالة: {order.delivery.landmark}
              </>
            ) : null}
            {order.delivery.notes ? (
              <>
                <br />
                ملاحظات: {order.delivery.notes}
              </>
            ) : null}
          </p>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-brand-navy">تفاصيل الطلب</h3>
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="py-2 text-start font-medium">الصنف</th>
                <th className="px-2 py-2 text-center font-medium">الكمية</th>
                <th className="py-2 text-end font-medium">السعر</th>
                <th className="py-2 text-end font-medium">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((line) => (
                <tr
                  key={`${line.productId}-${line.name}-${line.notes ?? ""}`}
                  className="border-b border-border-soft align-top"
                >
                  <td className="py-2 pe-2">
                    <span className="font-medium">{line.name}</span>
                    {line.options?.length ? (
                      <span className="mt-0.5 block text-xs text-text-muted">
                        {line.options
                          .map((o) => `${o.groupName}: ${o.optionName}`)
                          .join(" · ")}
                      </span>
                    ) : null}
                    {line.notes ? (
                      <span className="mt-0.5 block text-xs text-text-muted">
                        {line.notes}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-2 py-2 text-center tabular-nums">
                    {line.quantity}
                  </td>
                  <td className="py-2 text-end tabular-nums">
                    {formatPriceIQD(line.unitPrice)}
                  </td>
                  <td className="py-2 text-end font-medium tabular-nums">
                    {formatPriceIQD(line.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-4 space-y-1.5 border-t border-border-soft pt-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-text-muted">المجموع الفرعي</dt>
            <dd className="tabular-nums">
              {formatPriceIQD(order.pricing.subtotal)}
            </dd>
          </div>
          {order.pricing.couponDiscount && order.pricing.couponDiscount > 0 ? (
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">
                خصم الكوبون
                {order.pricing.couponCode
                  ? ` (${order.pricing.couponCode})`
                  : ""}
              </dt>
              <dd className="tabular-nums text-success">
                −{formatPriceIQD(order.pricing.couponDiscount)}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-3">
            <dt className="text-text-muted">التوصيل</dt>
            <dd className="tabular-nums">
              {formatPriceIQD(order.pricing.deliveryFee)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-2 text-base font-bold">
            <dt>الإجمالي</dt>
            <dd className="tabular-nums">
              {formatPriceIQD(order.pricing.total)}
            </dd>
          </div>
        </dl>

        <footer className="mt-6 border-t border-border-soft pt-3 text-center text-xs text-text-subtle">
          شكراً لطلبك من {restaurantName}
        </footer>
      </article>
    </section>
  );
}
