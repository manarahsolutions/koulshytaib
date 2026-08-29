"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { logoutAdminAction } from "@/app/actions/admin-auth";
import { databaseStatusAction } from "@/app/actions/backend";
import { ensureAdminDemoOrders } from "@/features/admin/demo-orders";
import {
  ADMIN_ROLE_LABELS,
  type AdminRole,
} from "@/features/admin-auth/types";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/admin", label: "لوحة التحكم", match: (p: string) => p === "/admin" },
  {
    href: "/admin/orders",
    label: "الطلبات",
    match: (p: string) => p.startsWith("/admin/orders"),
  },
  {
    href: "/admin/customers",
    label: "الزبائن",
    match: (p: string) => p.startsWith("/admin/customers"),
  },
  {
    href: "/admin/loyalty",
    label: "الولاء",
    match: (p: string) => p.startsWith("/admin/loyalty"),
  },
  {
    href: "/admin/products",
    label: "المنتجات",
    match: (p: string) => p.startsWith("/admin/products"),
  },
  {
    href: "/admin/offers",
    label: "العروض",
    match: (p: string) => p.startsWith("/admin/offers"),
  },
] as const;

export type AdminShellProps = {
  children: React.ReactNode;
  admin: {
    identifier: string;
    role: AdminRole;
  };
};

export function AdminShell({ children, admin }: AdminShellProps) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [loggingOut, startLogout] = useTransition();

  useEffect(() => {
    void (async () => {
      const status = await databaseStatusAction();
      if (!status.configured) {
        ensureAdminDemoOrders();
      }
    })();
  }, []);

  const section =
    NAV.find((item) => item.match(pathname))?.label ?? "لوحة التحكم";

  return (
    <div className="min-h-full bg-surface text-text">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface-elevated focus:px-3 focus:py-2 focus:outline-2 focus:outline-focus-ring"
      >
        تخطي إلى المحتوى
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-surface-elevated">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-sm font-bold text-brand-navy">كلشي طيب</p>
            <p className="typo-caption text-text-muted">
              لوحة التحكم
              <span className="mx-1 text-text-subtle" aria-hidden>
                ·
              </span>
              <span className="text-text">{section}</span>
            </p>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="min-w-0 text-end">
              <p className="truncate text-sm font-medium text-text">
                {admin.identifier}
              </p>
              <p className="typo-caption text-text-muted">
                {ADMIN_ROLE_LABELS[admin.role]}
              </p>
            </div>
            <button
              type="button"
              disabled={loggingOut}
              onClick={() => startLogout(() => logoutAdminAction())}
              className="inline-flex h-11 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-text hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-60"
            >
              {loggingOut ? "جارٍ الخروج…" : "تسجيل الخروج"}
            </button>
          </div>

          <button
            type="button"
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-md border border-border px-3 text-sm font-medium lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            aria-expanded={navOpen}
            aria-controls="admin-nav"
            onClick={() => setNavOpen((v) => !v)}
          >
            القائمة
          </button>

          <nav
            id="admin-nav"
            className={cn(
              "absolute inset-x-0 top-full border-b border-border bg-surface-elevated px-4 py-3 lg:static lg:border-0 lg:bg-transparent lg:p-0",
              navOpen ? "block" : "hidden lg:block",
            )}
            aria-label="تنقل لوحة التحكم"
          >
            <ul className="flex flex-col gap-1 lg:flex-row lg:gap-1">
              {NAV.map((item) => {
                const active = item.match(pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setNavOpen(false)}
                      className={cn(
                        "flex h-11 items-center rounded-md px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                        active
                          ? "bg-brand-navy text-on-primary"
                          : "text-text hover:bg-surface-warm",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-3 space-y-2 border-t border-border pt-3 lg:hidden">
              <p className="text-sm font-medium text-text">{admin.identifier}</p>
              <p className="typo-caption text-text-muted">
                {ADMIN_ROLE_LABELS[admin.role]}
              </p>
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => startLogout(() => logoutAdminAction())}
                className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-text hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-60"
              >
                {loggingOut ? "جارٍ الخروج…" : "تسجيل الخروج"}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main
        id="admin-main"
        className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8"
      >
        {children}
      </main>
    </div>
  );
}
