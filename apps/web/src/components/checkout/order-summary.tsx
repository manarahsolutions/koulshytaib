import Link from "next/link";
import { Divider } from "@/components/ui/divider";
import { Price } from "@/components/ui/price";
import { DELIVERY_FEE_IQD } from "@/features/checkout/pricing";
import { formatPriceIQD } from "@/lib/format/price";
import { cn } from "@/lib/utils/cn";

export type SummaryLine = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderSummaryProps = {
  lines: SummaryLine[];
  subtotal: number;
  deliveryFee?: number;
  couponDiscount?: number;
  couponCode?: string;
  className?: string;
  /** Sticky on large screens only */
  sticky?: boolean;
};

export function OrderSummary({
  lines,
  subtotal,
  deliveryFee = DELIVERY_FEE_IQD,
  couponDiscount = 0,
  couponCode,
  className,
  sticky = false,
}: OrderSummaryProps) {
  const safeDiscount = Math.max(0, Math.min(subtotal, couponDiscount));
  const total = subtotal - safeDiscount + deliveryFee;

  return (
    <aside
      className={cn(
        "rounded-3xl border border-border-soft bg-surface-elevated p-4 shadow-xs sm:p-5",
        sticky && "lg:sticky lg:top-24",
        className,
      )}
      aria-labelledby="checkout-summary-heading"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="checkout-summary-heading"
          className="text-base font-semibold text-brand-navy"
        >
          ملخص الطلب
        </h2>
        <Link
          href="/cart"
          className="typo-caption font-medium text-brand-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          تعديل السلة
        </Link>
      </div>

      <ul className="mt-4 space-y-3">
        {lines.map((line) => (
          <li
            key={line.productId}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium text-text">{line.name}</p>
              <p className="typo-caption mt-0.5 text-text-muted">
                × {line.quantity}
                <span className="mx-1 text-text-subtle" aria-hidden>
                  ·
                </span>
                <Price amount={line.unitPrice} size="sm" />
              </p>
            </div>
            <p className="shrink-0 font-semibold tabular-nums text-text">
              {formatPriceIQD(line.lineTotal)}
            </p>
          </li>
        ))}
      </ul>

      <Divider className="my-4" />

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">المجموع الفرعي</dt>
          <dd className="tabular-nums text-text">
            {formatPriceIQD(subtotal)}
          </dd>
        </div>
        {safeDiscount > 0 ? (
          <div className="flex justify-between gap-3">
            <dt className="text-text-muted">
              خصم الكوبون
              {couponCode ? (
                <span className="ms-1 font-medium text-brand-primary">
                  ({couponCode})
                </span>
              ) : null}
            </dt>
            <dd className="tabular-nums text-brand-primary">
              −{formatPriceIQD(safeDiscount)}
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">التوصيل</dt>
          <dd className="tabular-nums text-text">
            {formatPriceIQD(deliveryFee)}
          </dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-border-soft pt-3 text-base font-bold">
          <dt className="text-text">الإجمالي</dt>
          <dd className="tabular-nums text-text">{formatPriceIQD(total)}</dd>
        </div>
      </dl>

      <p className="typo-caption mt-3 text-text-subtle">
        رسوم التوصيل تجريبية للتطوير وليست سعراً نهائياً مؤكداً.
      </p>
    </aside>
  );
}
