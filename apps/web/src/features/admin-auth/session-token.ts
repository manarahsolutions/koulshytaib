/**
 * Signed session token helpers (HMAC-SHA256).
 * Usable from Node and Edge (proxy). No password data in payload.
 */

export type SessionTokenPayload = {
  sub: string;
  identifier: string;
  role: "MANAGER" | "CASHIER";
  iat: number;
  exp: number;
};

const enc = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < u8.length; i += 1) {
    binary += String.fromCharCode(u8[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded =
    value.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return toBase64Url(signature);
}

async function hmacVerify(
  secret: string,
  data: string,
  signature: string,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const sigBytes = fromBase64Url(signature);
  const sigCopy = new Uint8Array(sigBytes);
  return crypto.subtle.verify("HMAC", key, sigCopy, enc.encode(data));
}

export function getSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  return secret && secret.length >= 16 ? secret : null;
}

/** Default Admin session lifetime: 12 hours */
export const ADMIN_SESSION_MAX_AGE_SEC = 60 * 60 * 12;

export async function createSessionToken(
  input: {
    adminId: string;
    identifier: string;
    role: SessionTokenPayload["role"];
    maxAgeSec?: number;
  },
  secret: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionTokenPayload = {
    sub: input.adminId,
    identifier: input.identifier,
    role: input.role,
    iat: now,
    exp: now + (input.maxAgeSec ?? ADMIN_SESSION_MAX_AGE_SEC),
  };
  const body = toBase64Url(enc.encode(JSON.stringify(payload)));
  const sig = await hmacSign(secret, body);
  return `${body}.${sig}`;
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<SessionTokenPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;

  const ok = await hmacVerify(secret, body, sig);
  if (!ok) return null;

  try {
    const json = new TextDecoder().decode(fromBase64Url(body));
    const payload = JSON.parse(json) as SessionTokenPayload;
    if (
      typeof payload.sub !== "string" ||
      typeof payload.identifier !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!["MANAGER", "CASHIER"].includes(payload.role)) return null;
    return payload;
  } catch {
    return null;
  }
}

export const ADMIN_SESSION_COOKIE = "kt_admin_session";
