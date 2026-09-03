/**
 * Admin navigation groups — single source for shell + section titles.
 */

export type AdminNavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
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
      },
      {
        href: "/admin/coupons",
        label: "الكوبونات",
        match: (p) => p.startsWith("/admin/coupons"),
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
        match: (p) =>
          p.startsWith("/admin/customers") &&
          !p.startsWith("/admin/customers/leads"),
      },
      {
        href: "/admin/loyalty",
        label: "الولاء",
        match: (p) => p.startsWith("/admin/loyalty"),
      },
      {
        href: "/admin/customers/leads",
        label: "Leads",
        match: (p) => p.startsWith("/admin/customers/leads"),
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
      },
      {
        href: "/admin/settings",
        label: "الإعدادات",
        match: (p) => p.startsWith("/admin/settings"),
      },
    ],
  },
];

export function getAdminSectionLabel(pathname: string): string {
  for (const group of ADMIN_NAV_GROUPS) {
    for (const item of group.items) {
      if (item.match(pathname)) return item.label;
    }
  }
  return "لوحة التحكم";
}
