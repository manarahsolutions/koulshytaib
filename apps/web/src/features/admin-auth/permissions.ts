/**
 * Admin RBAC matrix (plan decision 1b).
 * STAFF ≈ MANAGER for operations; OWNER for settings / admins / sensitive delete.
 */

import type { AdminRole } from "@/features/admin-auth/types";

export const OPERATE_ROLES: AdminRole[] = ["OWNER", "MANAGER", "STAFF"];
export const OWNER_ONLY: AdminRole[] = ["OWNER"];

export function canOperate(role: AdminRole): boolean {
  return OPERATE_ROLES.includes(role);
}

export function canManageSettings(role: AdminRole): boolean {
  return role === "OWNER";
}

export function canManageAdmins(role: AdminRole): boolean {
  return role === "OWNER";
}

export function canDeleteSensitive(role: AdminRole): boolean {
  return role === "OWNER";
}
