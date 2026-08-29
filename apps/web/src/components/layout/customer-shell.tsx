import type { ReactNode } from "react";
import { CartSheet } from "@/components/cart/cart-sheet";
import { cn } from "@/lib/utils/cn";
import { CartAnnouncer } from "./cart-announcer";
import { CustomerFooterClient } from "./customer-footer-client";
import { CustomerHeader } from "./customer-header";
import { MobileBottomNav } from "./mobile-bottom-nav";

export type CustomerShellProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Guest customer chrome: warm surface, sticky header, footer, mobile bottom nav.
 * No account / login affordances.
 */
export function CustomerShell({ children, className }: CustomerShellProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col bg-background text-text",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--color-brand-navy)_5%,transparent),transparent_50%)]"
        aria-hidden
      />

      <a
        href="#main-content"
        className={cn(
          "sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50",
          "focus:rounded-2xl focus:bg-surface-elevated focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-text",
          "focus:outline-2 focus:outline-offset-2 focus:outline-focus-ring",
        )}
      >
        تخطّي إلى المحتوى
      </a>

      <CartAnnouncer />
      <CustomerHeader />

      <main
        id="main-content"
        className="flex-1 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] lg:pb-4"
      >
        {children}
      </main>

      <CustomerFooterClient />
      <MobileBottomNav />
      <CartSheet />
    </div>
  );
}
