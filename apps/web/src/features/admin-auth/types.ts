/**
 * Admin authentication domain types (Phase 18).
 * Customer identity is separate — guests never use AdminUser.
 */

export type AdminRole = "OWNER" | "MANAGER" | "STAFF";

export type AdminUser = {
  id: string;
  identifier: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Safe public session view for Admin UI — never includes passwordHash. */
export type AdminSession = {
  adminId: string;
  identifier: string;
  role: AdminRole;
};

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "ADMIN_INACTIVE"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "AUTH_MISCONFIGURED"
  | "DATABASE_UNAVAILABLE";

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly userMessage: string;

  constructor(code: AuthErrorCode, userMessage: string, technical?: string) {
    super(technical ?? userMessage);
    this.name = "AuthError";
    this.code = code;
    this.userMessage = userMessage;
  }
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  OWNER: "مالك",
  MANAGER: "مدير",
  STAFF: "موظف",
};

export const ALL_ADMIN_ROLES: AdminRole[] = ["OWNER", "MANAGER", "STAFF"];
