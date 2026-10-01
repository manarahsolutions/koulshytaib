/**
 * Admin RBAC:
 * - MANAGER: full console
 * - CASHIER: orders + products + categories only
 */

import type { AdminRole } from "@/features/admin-auth/types";

export const OPERATE_ROLES: AdminRole[] = ["MANAGER", "CASHIER"];
export const MANAGER_ONLY: AdminRole[] = ["MANAGER"];

/** Default landing for cashiers (no dashboard). */
export const CASHIER_HOME_HREF = "/admin/orders";

export function canOperate(role: AdminRole): boolean {
  return OPERATE_ROLES.includes(role);
}

export function canManageSettings(role: AdminRole): boolean {
  return role === "MANAGER";
}

export function canManageAdmins(role: AdminRole): boolean {
  return role === "MANAGER";
}

export function canDeleteSensitive(role: AdminRole): boolean {
  return role === "MANAGER";
}

/** Full marketing / CRM / system areas — manager only. */
export function canManageBeyondFloor(role: AdminRole): boolean {
  return role === "MANAGER";
}

/**
 * Paths a cashier may open. Managers may open anything under /admin.
 */
export function canAccessAdminPath(role: AdminRole, pathname: string): boolean {
  if (role === "MANAGER") return true;
  if (!pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/admin/login")) return true;
  if (pathname.startsWith("/admin/orders")) return true;
  if (pathname.startsWith("/admin/products")) return true;
  return false;
}
