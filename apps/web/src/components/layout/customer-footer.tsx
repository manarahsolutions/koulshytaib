import Link from "next/link";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import {
  CUSTOMER_PRIMARY_NAV,
  isNavActive,
} from "@/components/layout/nav-config";
import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils/cn";

export type CustomerFooterProps = {
  pathname?: string;
  className?: string;
};

/**
 * Minimal guest footer — real nav only; no fake phone/address/social.
 */
export function CustomerFooter({
  pathname = "/",
  className,
}: CustomerFooterProps) {
  return (
    <footer
      className={cn(
        "mt-auto border-t border-border-soft bg-surface",
        "pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] lg:pb-0",
        className,
      )}
    >
      <PageContainer width="wide" paddedY={false} className="py-8 sm:py-10">
        <DecorativeMotif
          variant="border"
          tone="navy"
          className="mb-5 max-w-xs opacity-70"
        />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <p className="text-base font-bold text-brand-navy">كلشي طيب</p>
            <p className="typo-caption max-w-xs text-text-muted">
              أكل بيتي — توصيل لباب البيت فقط
            </p>
          </div>

          <nav aria-label="روابط التذييل">
            <ul className="flex flex-wrap gap-1 sm:justify-end">
              {CUSTOMER_PRIMARY_NAV.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex h-11 items-center rounded-md px-3 text-sm font-medium",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                        active
                          ? "text-brand-primary"
                          : "text-text-muted hover:text-text",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <p className="typo-caption mt-6 text-text-subtle">
          تجربة ضيف — بدون تسجيل دخول
        </p>
      </PageContainer>
    </footer>
  );
}
