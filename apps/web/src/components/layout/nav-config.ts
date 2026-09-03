export type CustomerNavItem = {
  href: string;
  label: string;
  /** Stable id for keys / testing */
  id: "home" | "menu" | "offers" | "rewards" | "cart";
};

/** Primary destinations for the customer app (guest-only — no profile). */
export const CUSTOMER_PRIMARY_NAV: CustomerNavItem[] = [
  { id: "home", href: "/", label: "الرئيسية" },
  { id: "menu", href: "/menu", label: "المنيو" },
  { id: "offers", href: "/offers", label: "العروض" },
  { id: "rewards", href: "/rewards", label: "المكافآت" },
];

/** Mobile bottom bar includes cart; desktop uses header cart button instead. */
export const CUSTOMER_MOBILE_NAV: CustomerNavItem[] = [
  { id: "home", href: "/", label: "الرئيسية" },
  { id: "menu", href: "/menu", label: "المنيو" },
  { id: "offers", href: "/offers", label: "العروض" },
  { id: "cart", href: "/cart", label: "السلة" },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
