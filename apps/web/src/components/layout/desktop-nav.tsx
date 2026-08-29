"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { CUSTOMER_PRIMARY_NAV, isNavActive } from "./nav-config";

export function DesktopNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="التنقل الرئيسي" className={cn(className)}>
      <ul className="flex items-center gap-1">
        {CUSTOMER_PRIMARY_NAV.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-11 items-center rounded-lg px-3.5 text-sm font-medium",
                  "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                  active
                    ? "bg-surface-warm text-brand-primary"
                    : "text-text-muted hover:bg-surface-warm hover:text-text",
                )}
              >
                {item.label}
                {active ? (
                  <span
                    className="absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-brand-primary"
                    aria-hidden
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
