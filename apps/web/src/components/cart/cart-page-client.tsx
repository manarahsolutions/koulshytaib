"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { CartLineRow } from "@/components/cart/cart-line-row";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import {
  selectCartSubtotal,
  useCartStore,
} from "@/features/cart/cart-store";
import {
  calcCheckoutTotals,
  DELIVERY_FEE_IQD,
} from "@/features/checkout/pricing";
import { getProductById } from "@/features/products/product-repository";
import { isProductAvailable } from "@/features/products/selectors";
import { useCatalogRevision } from "@/features/products/use-catalog";
import { formatPriceIQD } from "@/lib/format/price";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";

export function CartPageClient() {
  useCatalogRevision();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectCartSubtotal);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totals = calcCheckoutTotals(subtotal, DELIVERY_FEE_IQD);

  if (items.length === 0) {
    return (
      <PageContainer width="narrow" className="py-10">
        <EmptyState
          icon={<ShoppingBag strokeWidth={ICON_STROKE.default} />}
          title="السلة فاضية"
          description="بعد ما اخترت شنو تحب، راح تلقاه هنا."
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

  return (
    <div className="pb-28 lg:pb-10">
      <PageContainer width="wide" paddedY={false} className="pt-6 sm:pt-8">
        <DecorativeMotif
          variant="floral-divider"
          tone="navy"
          className="mb-5 max-w-xs opacity-80"
        />
        <h1 className="text-2xl font-bold tracking-tight text-brand-navy">
          سلة الطلبات
        </h1>
        <p className="typo-caption mt-1 text-text-muted">
          راجع الطلب قبل الإكمال — توصيل لباب البيت فقط
        </p>

        <ul className="mt-6 max-w-2xl space-y-3">
          {items.map((item) => {
            const product = getProductById(item.productId);
            const available = product ? isProductAvailable(product) : false;
            return (
              <CartLineRow
                key={item.productId}
                productId={item.productId}
                quantity={item.quantity}
                notes={item.notes}
                product={product}
                available={available}
                onQuantityChange={(next) =>
                  setQuantity(item.productId, next)
                }
                onRemove={() => removeItem(item.productId)}
              />
            );
          })}
        </ul>
      </PageContainer>

      <div
        className={cn(
          "fixed inset-x-0 z-30 border-t border-border-soft bg-surface-elevated/95 backdrop-blur-sm",
          "bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] lg:bottom-0",
          "lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:backdrop-blur-none",
        )}
      >
        <PageContainer
          width="wide"
          paddedY={false}
          className="max-w-2xl space-y-3 py-4 lg:rounded-3xl lg:border lg:border-border-soft lg:bg-surface-elevated lg:px-6 lg:py-5 lg:shadow-xs"
        >
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-3 text-text-muted">
              <dt>المجموع الفرعي</dt>
              <dd className="tabular-nums text-text">
                {formatPriceIQD(totals.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 text-text-muted">
              <dt>أجور التوصيل</dt>
              <dd className="tabular-nums text-text">
                {formatPriceIQD(totals.deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 pt-1 text-base font-bold text-brand-navy">
              <dt>المبلغ الكلي</dt>
              <dd className="tabular-nums text-brand-primary">
                {formatPriceIQD(totals.total)}
              </dd>
            </div>
          </dl>
          <Link
            href="/checkout"
            className={cn(
              "flex h-12 w-full items-center justify-center rounded-2xl bg-brand-primary text-sm font-semibold text-on-primary",
              "hover:bg-brand-primary-hover",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
            )}
          >
            إكمال الطلب
          </Link>
        </PageContainer>
      </div>
    </div>
  );
}
