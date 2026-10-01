/**
 * Admin navigation groups — single source for shell + section titles.
 */

import type { AdminRole } from "@/features/admin-auth/types";

export type AdminNavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
  /** Who can see this item. Defaults to both roles. */
  roles?: readonly AdminRole[];
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "home",
    label: "الرئيسية",
    items: [
      {
        href: "/admin",
        label: "لوحة التحكم",
        match: (p) => p === "/admin",
        roles: ["MANAGER"],
      },
    ],
  },
  {
    id: "orders",
    label: "الطلبات",
    items: [
      {
        href: "/admin/orders",
        label: "كل الطلبات",
        match: (p) => p.startsWith("/admin/orders"),
      },
    ],
  },
  {
    id: "catalog",
    label: "الكتالوج",
    items: [
      {
        href: "/admin/products",
        label: "المنتجات",
        match: (p) =>
          p.startsWith("/admin/products") &&
          !p.startsWith("/admin/products/categories"),
      },
      {
        href: "/admin/products/categories",
        label: "التصنيفات",
        match: (p) => p.startsWith("/admin/products/categories"),
      },
      {
        href: "/admin/offers",
        label: "العروض",
        match: (p) => p.startsWith("/admin/offers"),
        roles: ["MANAGER"],
      },
      {
        href: "/admin/coupons",
        label: "الكوبونات",
        match: (p) => p.startsWith("/admin/coupons"),
        roles: ["MANAGER"],
      },
    ],
  },
  {
    id: "customers",
    label: "الزبائن",
    items: [
      {
        href: "/admin/customers",
        label: "قائمة الزبائن",
        match: (p) => p.startsWith("/admin/customers"),
        roles: ["MANAGER"],
      },
      {
        href: "/admin/loyalty",
        label: "الولاء",
        match: (p) => p.startsWith("/admin/loyalty"),
        roles: ["MANAGER"],
      },
    ],
  },
  {
    id: "content",
    label: "المحتوى",
    items: [
      {
        href: "/admin/reels",
        label: "الريلز",
        match: (p) => p.startsWith("/admin/reels"),
        roles: ["MANAGER"],
      },
    ],
  },
  {
    id: "system",
    label: "النظام",
    items: [
      {
        href: "/admin/analytics",
        label: "التحليلات",
        match: (p) => p.startsWith("/admin/analytics"),
        roles: ["MANAGER"],
      },
      {
        href: "/admin/settings",
        label: "الإعدادات",
        match: (p) => p.startsWith("/admin/settings"),
        roles: ["MANAGER"],
      },
    ],
  },
];

export function navItemVisibleToRole(
  item: AdminNavItem,
  role: AdminRole,
): boolean {
  const allowed = item.roles ?? (["MANAGER", "CASHIER"] as const);
  return allowed.includes(role);
}

export function filterAdminNavForRole(role: AdminRole): AdminNavGroup[] {
  return ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => navItemVisibleToRole(item, role)),
  })).filter((group) => group.items.length > 0);
}

export function getAdminSectionLabel(pathname: string): string {
  for (const group of ADMIN_NAV_GROUPS) {
    for (const item of group.items) {
      if (item.match(pathname)) return item.label;
    }
  }
  return "لوحة التحكم";
}
