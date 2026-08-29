/**
 * Local Iraqi mobile validation + normalization.
 * Shared across checkout, CRM, and order services — single source of truth.
 *
 * Accepted inputs (examples):
 * - 07XXXXXXXXX
 * - 7XXXXXXXXX
 * - +9647XXXXXXXXX
 * - 9647XXXXXXXXX
 *
 * Normalized output: 07XXXXXXXXX (11 digits)
 */

const LOCAL_MOBILE = /^07\d{9}$/;

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Normalize to `07XXXXXXXXX`, or `null` if not a valid Iraqi mobile shape.
 */
export function normalizeIraqiPhone(raw: string): string | null {
  let digits = digitsOnly(raw.trim());
  if (!digits) return null;

  if (digits.startsWith("964")) {
    digits = digits.slice(3);
  }

  if (digits.length === 10 && digits.startsWith("7")) {
    digits = `0${digits}`;
  }

  if (!LOCAL_MOBILE.test(digits)) return null;
  return digits;
}

export function isValidIraqiPhone(raw: string): boolean {
  return normalizeIraqiPhone(raw) !== null;
}

/** Soft filter while typing — digits, spaces, +, and common separators. */
export function sanitizePhoneInput(raw: string): string {
  return raw.replace(/[^\d+\s\-()]/g, "");
}
