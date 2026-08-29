/**
 * Admin session cookie API — server-only.
 */

import "server-only";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SEC,
  createSessionToken,
  getSessionSecret,
  verifySessionToken,
  type SessionTokenPayload,
} from "@/features/admin-auth/session-token";
import { AuthError, type AdminSession } from "@/features/admin-auth/types";

function cookieSecure(): boolean {
  return process.env.NODE_ENV === "production";
}

export async function readSessionPayload(): Promise<SessionTokenPayload | null> {
  const secret = getSessionSecret();
  if (!secret) return null;
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token, secret);
}

export async function setAdminSessionCookie(input: {
  adminId: string;
  identifier: string;
  role: SessionTokenPayload["role"];
}): Promise<void> {
  const secret = getSessionSecret();
  if (!secret) {
    throw new AuthError(
      "AUTH_MISCONFIGURED",
      "تعذر تهيئة الجلسة. راجع إعدادات الخادم.",
      "ADMIN_SESSION_SECRET missing",
    );
  }
  const token = await createSessionToken(input, secret);
  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function payloadToSession(
  payload: SessionTokenPayload,
): AdminSession {
  return {
    adminId: payload.sub,
    identifier: payload.identifier,
    role: payload.role,
  };
}
