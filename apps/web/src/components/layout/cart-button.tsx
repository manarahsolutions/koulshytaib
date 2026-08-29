"use client";

import { ShoppingBag } from "lucide-react";
import {
  selectCartSubtotal,
  selectCartUnitCount,
  useCartStore,
} from "@/features/cart/cart-store";
import { useCartUiStore } from "@/features/cart/cart-ui-store";
import { useCartHydrated } from "@/features/cart/use-cart-hydrated";
import { formatPriceIQD } from "@/lib/format/price";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";

export type CartButtonProps = {
  className?: string;
  showTotal?: boolean;
};

/**
 * Opens cart sheet on mobile; on lg+ navigates via sheet still useful —
 * also links desktop users: sheet is mobile-only so lg uses /cart.
 */
export function CartButton({ className, showTotal = false }: CartButtonProps) {
  const hydrated = useCartHydrated();
  const unitCount = useCartStore(selectCartUnitCount);
  const subtotal = useCartStore(selectCartSubtotal);
  const openSheet = useCartUiStore((s) => s.openSheet);

  const count = hydrated ? unitCount : 0;
  const total = hydrated ? subtotal : 0;
  const hasItems = count > 0;
  const label = hasItems ? `السلة، ${count} قطعة` : "السلة فارغة";

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className={cn(
          "relative inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-2xl px-2.5 lg:hidden",
          "text-text transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
          "hover:bg-surface-warm",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
          className,
        )}
        aria-label={label}
      >
        <ShoppingBag
          className="size-5 shrink-0"
          strokeWidth={ICON_STROKE.default}
          aria-hidden
        />
        {hasItems ? (
          <span
            className={cn(
              "absolute -top-0.5 end-0 flex h-5 min-w-5 items-center justify-center rounded-full",
              "bg-brand-primary px-1 text-[0.6875rem] font-semibold text-on-primary",
            )}
            aria-hidden
          >
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>

      <a
        href="/cart"
        className={cn(
          "relative hidden h-11 min-w-11 items-center justify-center gap-2 rounded-2xl px-2.5 lg:inline-flex",
          "text-text transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
          "hover:bg-surface-warm",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
          className,
        )}
        aria-label={label}
      >
        <ShoppingBag
          className="size-5 shrink-0"
          strokeWidth={ICON_STROKE.default}
          aria-hidden
        />
        {showTotal && hasItems ? (
          <span className="typo-label hidden tabular-nums sm:inline">
            {formatPriceIQD(total)}
          </span>
        ) : null}
        {hasItems ? (
          <span
            className={cn(
              "absolute -top-0.5 end-0 flex h-5 min-w-5 items-center justify-center rounded-full",
              "bg-brand-primary px-1 text-[0.6875rem] font-semibold text-on-primary",
            )}
            aria-hidden
          >
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </a>
    </>
  );
}
