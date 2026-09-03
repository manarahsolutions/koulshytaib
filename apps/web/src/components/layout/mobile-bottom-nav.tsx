"use client";

import { Gift, Home, Percent, ShoppingBag, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  selectCartUnitCount,
  useCartStore,
} from "@/features/cart/cart-store";
import { useCartUiStore } from "@/features/cart/cart-ui-store";
import { useCartHydrated } from "@/features/cart/use-cart-hydrated";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";
import { CUSTOMER_MOBILE_NAV, isNavActive } from "./nav-config";

const ICONS = {
  home: Home,
  menu: UtensilsCrossed,
  offers: Percent,
  rewards: Gift,
  cart: ShoppingBag,
} as const;

/** Corner ornament from assets/2nd pattern — decorative only. */
const NAV_PATTERN_SRC = "/brand/pattern-nav.webp";

export function MobileBottomNav() {
  const pathname = usePathname();
  const hydrated = useCartHydrated();
  const unitCount = useCartStore(selectCartUnitCount);
  const openSheet = useCartUiStore((s) => s.openSheet);
  const count = hydrated ? unitCount : 0;

  return (
    <nav
      aria-label="التنقل السفلي"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 lg:hidden",
        "pointer-events-none pb-[max(0.5rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div className="pointer-events-auto mx-auto max-w-lg px-3">
        <div
          className={cn(
            "relative overflow-hidden rounded-full border border-border-soft",
            "bg-surface-elevated/95 shadow-md backdrop-blur-sm",
          )}
        >
          <div
            className="pointer-events-none absolute inset-y-0 end-0 w-[42%] max-w-[9.5rem]"
            aria-hidden
          >
            <Image
              src={NAV_PATTERN_SRC}
              alt=""
              fill
              className="object-contain object-left-bottom opacity-45 scale-x-[-1]"
              sizes="160px"
            />
          </div>

          <ul
            className="relative z-10 flex h-[var(--bottom-nav-height)] items-stretch justify-between px-2"
            role="list"
          >
            {CUSTOMER_MOBILE_NAV.map((item) => {
              const active = isNavActive(pathname, item.href);
              const Icon = ICONS[item.id];
              const showCartBadge = item.id === "cart" && count > 0;
              const isCart = item.id === "cart";

              const className = cn(
                "relative flex min-h-11 min-w-14 flex-col items-center justify-center gap-0.5 rounded-full px-2",
                "transition-[colors,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                active
                  ? "text-brand-navy motion-safe:scale-[1.02]"
                  : "text-text-muted hover:text-text",
              );

              const inner = (
                <>
                  <span
                    className={cn(
                      "relative flex size-8 items-center justify-center rounded-full",
                      active && "bg-brand-navy/8",
                    )}
                  >
                    <Icon
                      className="size-5"
                      strokeWidth={
                        active ? ICON_STROKE.active : ICON_STROKE.default
                      }
                      aria-hidden
                    />
                    {showCartBadge ? (
                      <span
                        className="absolute -top-1 end-[-0.25rem] flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-0.5 text-[0.625rem] font-semibold text-on-primary"
                        aria-hidden
                      >
                        {count > 99 ? "99+" : count}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "text-[0.6875rem] leading-none",
                      active ? "font-semibold" : "font-medium",
                    )}
                  >
                    {item.label}
                  </span>
                </>
              );

              return (
                <li key={item.id} className="flex flex-1 justify-center">
                  {isCart ? (
                    <button
                      type="button"
                      onClick={openSheet}
                      aria-label={
                        showCartBadge
                          ? `${item.label}، ${count} قطع`
                          : item.label
                      }
                      className={className}
                    >
                      {inner}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      aria-label={item.label}
                      className={className}
                    >
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
