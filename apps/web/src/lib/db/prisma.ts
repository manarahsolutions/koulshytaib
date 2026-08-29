import { PrismaClient } from "@prisma/client";
import "server-only";

/**
 * Server-only Prisma singleton.
 * Do not import from Client Components.
 *
 * Neon pooled hosts need `pgbouncer=true` for Prisma; interactive transactions
 * also need a longer timeout than the 5s default (multi-round-trip checkout
 * over a remote pooler otherwise closes `tx` mid-callback → P2028).
 */

/** Shared interactive-transaction budgets (Neon pooler + local Postgres). */
export const interactiveTransactionOptions = {
  maxWait: 15_000,
  timeout: 30_000,
} as const;

/**
 * Adapt DATABASE_URL for Prisma without changing credentials.
 * Adds pooler-compat flags when the host is a Neon pooled endpoint.
 */
export function resolveDatabaseUrl(
  raw = process.env.DATABASE_URL,
): string | undefined {
  if (!raw?.trim()) return undefined;
  try {
    const normalized = raw.trim().replace(/^postgresql:/i, "http:");
    const url = new URL(normalized);
    if (url.hostname.includes("-pooler.")) {
      if (!url.searchParams.has("pgbouncer")) {
        url.searchParams.set("pgbouncer", "true");
      }
    }
    return url.toString().replace(/^http:/i, "postgresql:");
  } catch {
    return raw.trim();
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = resolveDatabaseUrl();
  return new PrismaClient({
    datasources: url ? { db: { url } } : undefined,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
    transactionOptions: interactiveTransactionOptions,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
