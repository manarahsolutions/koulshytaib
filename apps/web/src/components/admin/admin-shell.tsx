"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { logoutAdminAction } from "@/app/actions/admin-auth";
import { databaseStatusAction } from "@/app/actions/backend";
import { AdminNavLink } from "@/components/admin/ui/admin-page-header";
import { ensureAdminDemoOrders } from "@/features/admin/demo-orders";
import {
  filterAdminNavForRole,
  getAdminSectionLabel,
} from "@/features/admin/admin-nav";
import {
  ADMIN_ROLE_LABELS,
  type AdminRole,
} from "@/features/admin-auth/types";
import {
  canAccessAdminPath,
  CASHIER_HOME_HREF,
} from "@/features/admin-auth/permissions";
import { cn } from "@/lib/utils/cn";

export type AdminShellProps = {
  children: React.ReactNode;
  admin: {
    identifier: string;
    role: AdminRole;
  };
};

export function AdminShell({ children, admin }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [navPathname, setNavPathname] = useState(pathname);
  const [loggingOut, startLogout] = useTransition();

  if (navPathname !== pathname) {
    setNavPathname(pathname);
    if (navOpen) setNavOpen(false);
  }

  useEffect(() => {
    void (async () => {
      const status = await databaseStatusAction();
      if (!status.configured) {
        ensureAdminDemoOrders();
      }
    })();
  }, []);

  useEffect(() => {
    if (canAccessAdminPath(admin.role, pathname)) return;
    router.replace(CASHIER_HOME_HREF);
  }, [admin.role, pathname, router]);

  const navGroups = useMemo(
    () => filterAdminNavForRole(admin.role),
    [admin.role],
  );

  const closeNav = () => setNavOpen(false);
  const section = getAdminSectionLabel(pathname);
  const pathAllowed = canAccessAdminPath(admin.role, pathname);

  const navBody = (
    <nav aria-label="تنقل لوحة التحكم" className="space-y-5">
      {navGroups.map((group) => (
        <div key={group.id}>
          <p className="mb-1.5 px-3 text-[0.7rem] font-semibold uppercase tracking-wide text-text-subtle">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                <AdminNavLink
                  href={item.href}
                  label={item.label}
                  active={item.match(pathname)}
                  onNavigate={closeNav}
                  nested
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-full bg-surface text-text print:bg-white">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface-elevated focus:px-3 focus:py-2 focus:outline-2 focus:outline-focus-ring print:hidden"
      >
        تخطي إلى المحتوى
      </a>

      <div className="lg:flex lg:min-h-full">
        <aside className="hidden w-60 shrink-0 border-e border-border-soft bg-surface-elevated print:hidden lg:flex lg:flex-col">
          <div className="border-b border-border-soft px-4 py-4">
            <p className="text-sm font-bold text-brand-navy">كلشي طيب</p>
            <p className="typo-caption text-text-muted">لوحة التحكم</p>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-4">{navBody}</div>
          <div className="border-t border-border-soft px-4 py-3">
            <p className="truncate text-sm font-medium text-text">
              {admin.identifier}
            </p>
            <p className="typo-caption text-text-muted">
              {ADMIN_ROLE_LABELS[admin.role]}
            </p>
            <button
              type="button"
              disabled={loggingOut}
              onClick={() => startLogout(() => logoutAdminAction())}
              className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-xl border border-border px-3 text-sm font-medium text-text hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-60"
            >
              {loggingOut ? "جارٍ الخروج…" : "تسجيل الخروج"}
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-border-soft bg-surface-elevated print:hidden lg:border-border">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="min-w-0 lg:hidden">
                <p className="text-sm font-bold text-brand-navy">كلشي طيب</p>
                <p className="typo-caption text-text-muted">{section}</p>
              </div>
              <div className="hidden min-w-0 lg:block">
                <p className="text-sm font-semibold text-brand-navy">
                  {section}
                </p>
              </div>

              <button
                type="button"
                className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl border border-border px-3 text-sm font-medium lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                aria-expanded={navOpen}
                aria-controls="admin-mobile-nav"
                onClick={() => setNavOpen((v) => !v)}
              >
                القائمة
              </button>
            </div>

            {navOpen ? (
              <div
                id="admin-mobile-nav"
                className="border-t border-border-soft px-3 py-4 lg:hidden"
              >
                {navBody}
                <div className="mt-4 space-y-2 border-t border-border-soft pt-3">
                  <p className="px-3 text-sm font-medium text-text">
                    {admin.identifier}
                  </p>
                  <p className="px-3 typo-caption text-text-muted">
                    {ADMIN_ROLE_LABELS[admin.role]}
                  </p>
                  <button
                    type="button"
                    disabled={loggingOut}
                    onClick={() => startLogout(() => logoutAdminAction())}
                    className="mx-3 inline-flex h-11 w-[calc(100%-1.5rem)] items-center justify-center rounded-xl border border-border px-3 text-sm font-medium text-text hover:bg-surface-warm disabled:opacity-60"
                  >
                    {loggingOut ? "جارٍ الخروج…" : "تسجيل الخروج"}
                  </button>
                </div>
              </div>
            ) : null}
          </header>

          <main
            id="admin-main"
            className={cn(
              "px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
              "print:p-0",
            )}
          >
            <div className="mx-auto max-w-6xl print:max-w-none">
              {pathAllowed ? children : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
