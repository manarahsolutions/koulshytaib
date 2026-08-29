"use server";

import { redirect } from "next/navigation";
import { signInAdmin, signOutAdmin } from "@/features/admin-auth/admin-auth-service";
import { getCurrentAdmin } from "@/features/admin-auth/authorization";
import { AuthError } from "@/features/admin-auth/types";
import { logServerError } from "@/lib/db/errors";

export type AuthActionResult =
  | { ok: true }
  | { ok: false; message: string };

export async function getAdminSessionAction() {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: true as const, data: null };
  return {
    ok: true as const,
    data: {
      identifier: admin.identifier,
      role: admin.role,
    },
  };
}

export async function loginAdminAction(input: {
  identifier: string;
  password: string;
}): Promise<AuthActionResult> {
  try {
    await signInAdmin(input);
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (
        error.code !== "INVALID_CREDENTIALS" &&
        error.code !== "ADMIN_INACTIVE"
      ) {
        logServerError("loginAdmin", error);
      }
      return { ok: false, message: error.userMessage };
    }
    logServerError("loginAdmin", error);
    return {
      ok: false,
      message: "تعذر تسجيل الدخول. تحقق من بياناتك وحاول مرة أخرى.",
    };
  }
}

export async function logoutAdminAction(): Promise<void> {
  await signOutAdmin();
  redirect("/admin/login");
}
