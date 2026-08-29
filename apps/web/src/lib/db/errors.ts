/**
 * Safe service/DB error codes for UI — never expose SQL/Prisma internals.
 */

export type BackendErrorCode =
  | "DATABASE_UNAVAILABLE"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "INVALID_TRANSITION"
  | "UNKNOWN";

export class BackendError extends Error {
  readonly code: BackendErrorCode;
  readonly userMessage: string;

  constructor(
    code: BackendErrorCode,
    userMessage: string,
    technical?: string,
  ) {
    super(technical ?? userMessage);
    this.name = "BackendError";
    this.code = code;
    this.userMessage = userMessage;
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof BackendError) return error.userMessage;
  return "صار خطأ، حاول مرة ثانية.";
}

/** Log without phones / secrets */
export function logServerError(context: string, error: unknown): void {
  const message =
    error instanceof Error ? error.message : "unknown_error";
  // Never log phone numbers or DATABASE_URL
  console.error(`[backend:${context}]`, message.replace(/\b07\d{9}\b/g, "[phone]"));
}
