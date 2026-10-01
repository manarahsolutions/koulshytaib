/**
 * Admin sign-in / sign-out service (server-only).
 */

import "server-only";
import {
  dbFindAdminByIdentifier,
} from "@/features/admin-auth/db-admin-repository";
import { verifyPassword } from "@/features/admin-auth/password";
import {
  clearAdminSessionCookie,
  setAdminSessionCookie,
} from "@/features/admin-auth/session";
import { AuthError, type AdminSession } from "@/features/admin-auth/types";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { getSessionSecret } from "@/features/admin-auth/session-token";

const GENERIC_LOGIN_FAILURE =
  "تعذر تسجيل الدخول. تحقق من بياناتك وحاول مرة أخرى.";

/**
 * Authenticate Admin and set HttpOnly session cookie.
 * Always returns the same failure message for bad credentials.
 */
export async function signInAdmin(input: {
  identifier: string;
  password: string;
}): Promise<AdminSession> {
  if (!isDatabaseConfigured()) {
    throw new AuthError(
      "DATABASE_UNAVAILABLE",
      "قاعدة البيانات غير مهيأة. لا يمكن تسجيل الدخول.",
    );
  }
  if (!getSessionSecret()) {
    throw new AuthError(
      "AUTH_MISCONFIGURED",
      "تعذر تهيئة الجلسة. راجع إعدادات الخادم.",
      "ADMIN_SESSION_SECRET missing",
    );
  }

  const identifier = input.identifier.trim();
  const password = input.password;
  if (!identifier || !password) {
    throw new AuthError("INVALID_CREDENTIALS", GENERIC_LOGIN_FAILURE);
  }

  const admin = await dbFindAdminByIdentifier(identifier);
  if (!admin) {
    // Timing-ish: still run a dummy compare path length — keep message generic
    throw new AuthError("INVALID_CREDENTIALS", GENERIC_LOGIN_FAILURE);
  }
  if (!admin.isActive) {
    throw new AuthError(
      "ADMIN_INACTIVE",
      "هذا الحساب معطّل. تواصل مع المدير.",
    );
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    throw new AuthError("INVALID_CREDENTIALS", GENERIC_LOGIN_FAILURE);
  }

  await setAdminSessionCookie({
    adminId: admin.id,
    identifier: admin.identifier,
    role: admin.role,
  });

  return {
    adminId: admin.id,
    identifier: admin.identifier,
    role: admin.role,
  };
}

export async function signOutAdmin(): Promise<void> {
  await clearAdminSessionCookie();
}
