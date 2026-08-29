"use client";

import { useState } from "react";
import { Divider } from "@/components/ui/divider";
import { Price } from "@/components/ui/price";
import { countOrderUnits } from "@/features/orders/order-store";
import { formatPriceIQD } from "@/lib/format/price";
import { cn } from "@/lib/utils/cn";
import type { Order } from "@/types/order";

export type OrderSummaryCardProps = {
  order: Order;
  /** Show line items behind a disclosure */
  collapsibleDetails?: boolean;
  className?: string;
};

export function OrderSummaryCard({
  order,
  collapsibleDetails = true,
  className,
}: OrderSummaryCardProps) {
  const [open, setOpen] = useState(false);
  const units = countOrderUnits(order);

  return (
    <div
      className={cn(
        "rounded-3xl border border-border-soft bg-surface-elevated p-4 shadow-xs sm:p-5",
        className,
      )}
    >
      <h2 className="text-base font-semibold text-brand-navy">ملخص بسيط</h2>

      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">المنتجات</dt>
          <dd className="tabular-nums text-text">{units} قطعة</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">التوصيل إلى</dt>
          <dd className="text-end text-text">
            {order.delivery.area}، {order.delivery.governorate}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">المجموع الفرعي</dt>
          <dd className="tabular-nums text-text">
            {formatPriceIQD(order.pricing.subtotal)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">التوصيل</dt>
          <dd className="tabular-nums text-text">
            {formatPriceIQD(order.pricing.deliveryFee)}
          </dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-border-soft pt-3 text-base font-bold">
          <dt className="text-text">الإجمالي</dt>
          <dd>
            <Price amount={order.pricing.total} size="md" />
          </dd>
        </div>
      </dl>

      {collapsibleDetails ? (
        <>
          <Divider className="my-4" />
          <button
            type="button"
            className="typo-caption font-medium text-brand-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "إخفاء تفاصيل الطلب" : "عرض تفاصيل الطلب"}
          </button>
          {open ? (
            <ul className="mt-3 space-y-2 text-sm">
              {order.items.map((line) => (
                <li
                  key={line.productId}
                  className="flex items-start justify-between gap-3"
                >
                  <span className="min-w-0 text-text">
                    {line.name}
                    <span className="text-text-muted"> × {line.quantity}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-text">
                    {formatPriceIQD(line.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
