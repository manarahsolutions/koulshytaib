import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { BrandLogo } from "./brand-logo";
import { CartButton } from "./cart-button";
import { DesktopNav } from "./desktop-nav";

export function CustomerHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-border-soft",
        "bg-background/90 backdrop-blur-md",
        "pt-[env(safe-area-inset-top)]",
        className,
      )}
    >
      <div className="mx-auto flex h-[var(--header-height)] max-w-[var(--container-max)] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <BrandLogo compact className="min-w-0 shrink-0" />

        <DesktopNav className="hidden flex-1 justify-center lg:flex" />

        <div className="ms-auto flex shrink-0 items-center gap-1 sm:gap-2 lg:ms-0">
          <Link
            href="/menu"
            className={cn(
              "hidden h-11 items-center rounded-2xl bg-brand-primary px-4 text-sm font-semibold text-on-primary",
              "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
              "hover:bg-brand-primary-hover",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              "md:inline-flex",
            )}
          >
            اطلب الآن
          </Link>
          <CartButton showTotal />
        </div>
      </div>
    </header>
  );
}
