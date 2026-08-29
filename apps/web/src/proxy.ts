/**
 * Edge routing gate for /admin/* (UX layer).
 * Real security: requireAdmin() in (app) layout + Server Actions.
 *
 * Next.js 16: proxy.ts replaces deprecated middleware.ts.
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getSessionSecret,
  verifySessionToken,
} from "@/features/admin-auth/session-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const isLogin = pathname === "/admin/login";
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const secret = getSessionSecret();

  let sessionOk = false;
  if (token && secret) {
    const payload = await verifySessionToken(token, secret);
    sessionOk = Boolean(payload);
  }

  if (!isLogin && !sessionOk) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  if (isLogin && sessionOk) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    adminUrl.search = "";
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
