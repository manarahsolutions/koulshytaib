/**
 * Authorization helpers — server-side only.
 * UI hiding is never sufficient security.
 */

import "server-only";
import {
  dbFindAdminById,
} from "@/features/admin-auth/db-admin-repository";
import {
  payloadToSession,
  readSessionPayload,
} from "@/features/admin-auth/session";
import {
  AuthError,
  type AdminRole,
  type AdminSession,
  type AdminUser,
} from "@/features/admin-auth/types";
import { isDatabaseConfigured } from "@/lib/db/prisma";

export type AuthenticatedAdmin = AdminSession & {
  user: AdminUser;
};

/**
 * Returns current admin if session is valid and account is active.
 * Does not throw — use requireAdmin() for enforcement.
 */
export async function getCurrentAdmin(): Promise<AuthenticatedAdmin | null> {
  if (!isDatabaseConfigured()) return null;

  const payload = await readSessionPayload();
  if (!payload) return null;

  const user = await dbFindAdminById(payload.sub);
  if (!user || !user.isActive) return null;

  // Prefer live DB role/identifier over cookie claims
  return {
    ...payloadToSession({
      ...payload,
      identifier: user.identifier,
      role: user.role,
    }),
    user,
  };
}

export async function requireAdmin(): Promise<AuthenticatedAdmin> {
  if (!isDatabaseConfigured()) {
    throw new AuthError(
      "DATABASE_UNAVAILABLE",
      "قاعدة البيانات غير مهيأة. لا يمكن استخدام لوحة التحكم.",
    );
  }

  const payload = await readSessionPayload();
  if (!payload) {
    throw new AuthError(
      "UNAUTHORIZED",
      "يجب تسجيل الدخول للمتابعة.",
    );
  }

  const user = await dbFindAdminById(payload.sub);
  if (!user) {
    throw new AuthError("UNAUTHORIZED", "يجب تسجيل الدخول للمتابعة.");
  }
  if (!user.isActive) {
    throw new AuthError(
      "ADMIN_INACTIVE",
      "هذا الحساب معطّل. تواصل مع المدير.",
    );
  }

  return {
    adminId: user.id,
    identifier: user.identifier,
    role: user.role,
    user,
  };
}

/**
 * Role gate — pure check against already-authenticated admin.
 * Phase 18: foundation only; most ops accept all roles.
 */
export function requireRole(
  admin: AuthenticatedAdmin | AdminSession,
  allowed: AdminRole[],
): void {
  if (!allowed.includes(admin.role)) {
    throw new AuthError(
      "FORBIDDEN",
      "ما عندك صلاحية لهذا الإجراء.",
    );
  }
}

/** Convenience: require admin then role */
export async function requireAdminRole(
  allowed: AdminRole[],
): Promise<AuthenticatedAdmin> {
  const admin = await requireAdmin();
  requireRole(admin, allowed);
  return admin;
}
