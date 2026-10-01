"use client";

import { Home, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { CartLineRow } from "@/components/cart/cart-line-row";
import {
  selectCartSubtotal,
  useCartStore,
} from "@/features/cart/cart-store";
import { useCartUiStore } from "@/features/cart/cart-ui-store";
import {
  calcCheckoutTotals,
  DELIVERY_FEE_IQD,
} from "@/features/checkout/pricing";
import { getProductById } from "@/features/products/product-repository";
import { configuredUnitPrice } from "@/features/products/product-options";
import { isProductAvailable } from "@/features/products/selectors";
import { useCatalogRevision } from "@/features/products/use-catalog";
import { formatPriceIQD } from "@/lib/format/price";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";

export function CartSheet() {
  useCatalogRevision();
  const open = useCartUiStore((s) => s.sheetOpen);
  const closeSheet = useCartUiStore((s) => s.closeSheet);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectCartSubtotal);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const totals = calcCheckoutTotals(subtotal, DELIVERY_FEE_IQD);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, closeSheet]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-brand-navy/45 backdrop-blur-[2px]"
        aria-label="إغلاق السلة"
        onClick={closeSheet}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col",
          "rounded-t-3xl border border-border-soft bg-background shadow-lg",
          "pb-[env(safe-area-inset-bottom)]",
          "motion-safe:animate-[motion-fade-up_var(--duration-normal)_var(--ease-standard)]",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border-soft px-4 py-3.5">
          <h2 id={titleId} className="text-lg font-bold text-brand-navy">
            سلة الطلبات
          </h2>
          <button
            type="button"
            onClick={closeSheet}
            className="inline-flex size-10 items-center justify-center rounded-xl text-text-muted hover:bg-surface-warm hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={ICON_STROKE.default} aria-hidden />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <p className="font-semibold text-text">السلة فاضية</p>
            <p className="typo-caption text-text-muted">
              بعد ما اخترت شنو تحب، راح تلقاه هنا.
            </p>
            <Link
              href="/menu"
              onClick={closeSheet}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-2xl bg-brand-primary px-5 text-sm font-semibold text-on-primary hover:bg-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              تصفح المنيو
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {items.map((item) => {
                const product = getProductById(item.productId);
                const available = product
                  ? isProductAvailable(product)
                  : false;
                const unitPrice = product
                  ? configuredUnitPrice(
                      product.price,
                      item.selections ?? [],
                    )
                  : 0;
                return (
                  <CartLineRow
                    key={item.lineKey}
                    productId={item.productId}
                    quantity={item.quantity}
                    notes={item.notes}
                    selections={item.selections}
                    unitPrice={unitPrice}
                    product={product}
                    available={available}
                    onQuantityChange={(next) =>
                      setQuantity(item.lineKey, next)
                    }
                    onRemove={() => removeItem(item.lineKey)}
                  />
                );
              })}
            </ul>

            <div className="space-y-3 border-t border-border-soft bg-surface-elevated px-4 py-4">
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
                <div className="flex justify-between gap-3 border-t border-border-soft pt-2 text-base font-bold text-brand-navy">
                  <dt>المبلغ الكلي</dt>
                  <dd className="tabular-nums text-brand-primary">
                    {formatPriceIQD(totals.total)}
                  </dd>
                </div>
              </dl>

              <Link
                href="/checkout"
                onClick={closeSheet}
                className={cn(
                  "flex h-12 w-full items-center justify-center rounded-2xl bg-brand-primary text-sm font-semibold text-on-primary",
                  "hover:bg-brand-primary-hover",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                )}
              >
                إكمال الطلب
              </Link>

              <p className="flex items-center justify-center gap-1.5 text-center text-[0.6875rem] text-brand-green">
                <Home
                  className="size-3.5"
                  strokeWidth={ICON_STROKE.default}
                  aria-hidden
                />
                مطبخنا يستقبل الطلبات الآن
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
