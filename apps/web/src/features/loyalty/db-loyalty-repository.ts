/**
 * PostgreSQL-backed loyalty persistence (server-only).
 * Balance is derived from transactions; account fields are a cache.
 * Loyalty remains disabled by default (enabled: false).
 */

import "server-only";
import type { Prisma } from "@prisma/client";
import { BackendError } from "@/lib/db/errors";
import {
  mapLoyaltyAccount,
  mapLoyaltyTransaction,
} from "@/lib/db/mappers";
import { interactiveTransactionOptions, prisma } from "@/lib/db/prisma";
import { createOpaqueId } from "@/lib/id";
import {
  DEFAULT_LOYALTY_CONFIG,
  type LoyaltyAccount,
  type LoyaltyConfig,
  type LoyaltyTransaction,
  type LoyaltyTransactionSource,
  type LoyaltyTransactionType,
} from "@/features/loyalty/types";

export async function dbGetLoyaltyConfig(): Promise<LoyaltyConfig> {
  const row = await prisma.appConfig.findUnique({ where: { id: "default" } });
  if (!row) return DEFAULT_LOYALTY_CONFIG;
  return row.loyaltyJson as unknown as LoyaltyConfig;
}

export async function dbEnsureLoyaltyAccount(
  customerId: string,
): Promise<LoyaltyAccount> {
  const existing = await prisma.loyaltyAccount.findUnique({
    where: { customerId },
  });
  if (existing) return mapLoyaltyAccount(existing);

  const row = await prisma.loyaltyAccount.create({
    data: {
      id: createOpaqueId("lya"),
      customerId,
      pointsBalance: 0,
      lifetimeEarned: 0,
      lifetimeRedeemed: 0,
    },
  });
  return mapLoyaltyAccount(row);
}

export async function dbGetLoyaltyAccount(
  customerId: string,
): Promise<LoyaltyAccount | null> {
  const row = await prisma.loyaltyAccount.findUnique({
    where: { customerId },
  });
  return row ? mapLoyaltyAccount(row) : null;
}

export async function dbListLoyaltyTransactions(
  customerId: string,
): Promise<LoyaltyTransaction[]> {
  const rows = await prisma.loyaltyTransaction.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapLoyaltyTransaction);
}

export async function dbListLoyaltyAccounts(): Promise<LoyaltyAccount[]> {
  const rows = await prisma.loyaltyAccount.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapLoyaltyAccount);
}

export async function dbListAllLoyaltyTransactions(): Promise<
  LoyaltyTransaction[]
> {
  const rows = await prisma.loyaltyTransaction.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapLoyaltyTransaction);
}

export async function dbFindEarnByOrderId(
  orderId: string,
): Promise<LoyaltyTransaction | null> {
  const row = await prisma.loyaltyTransaction.findFirst({
    where: { type: "earn", relatedOrderId: orderId },
  });
  return row ? mapLoyaltyTransaction(row) : null;
}

function recomputeBalance(txns: { type: LoyaltyTransactionType; points: number }[]) {
  let balance = 0;
  let earned = 0;
  let redeemed = 0;
  for (const t of txns) {
    if (t.type === "earn") {
      balance += t.points;
      earned += t.points;
    } else if (t.type === "redeem") {
      balance -= t.points;
      redeemed += t.points;
    } else {
      balance += t.points;
      if (t.points > 0) earned += t.points;
      if (t.points < 0) redeemed += Math.abs(t.points);
    }
  }
  return { balance, earned, redeemed };
}

export async function dbAppendLoyaltyTransaction(input: {
  customerId: string;
  type: LoyaltyTransactionType;
  points: number;
  reason: string;
  source?: LoyaltyTransactionSource;
  relatedOrderId?: string;
}): Promise<LoyaltyTransaction> {
  await dbEnsureLoyaltyAccount(input.customerId);

  try {
    const row = await prisma.$transaction(async (tx) => {
      const account = await tx.loyaltyAccount.findUniqueOrThrow({
        where: { customerId: input.customerId },
      });

      const created = await tx.loyaltyTransaction.create({
        data: {
          id: createOpaqueId("lyt"),
          loyaltyAccountId: account.id,
          customerId: input.customerId,
          type: input.type,
          points: input.points,
          reason: input.reason,
          sourceType: input.source?.type ?? null,
          sourceId:
            input.source && "id" in input.source
              ? (input.source.id ?? null)
              : null,
          relatedOrderId: input.relatedOrderId ?? null,
        },
      });

      const all = await tx.loyaltyTransaction.findMany({
        where: { customerId: input.customerId },
      });
      const { balance, earned, redeemed } = recomputeBalance(all);
      await tx.loyaltyAccount.update({
        where: { customerId: input.customerId },
        data: {
          pointsBalance: balance,
          lifetimeEarned: earned,
          lifetimeRedeemed: redeemed,
        },
      });

      return created;
    }, interactiveTransactionOptions);

    return mapLoyaltyTransaction(row);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new BackendError("CONFLICT", "تم احتساب نقاط هذا الطلب مسبقاً");
    }
    throw error;
  }
}

/** Seed helper */
export async function dbUpsertLoyaltyConfig(
  config: LoyaltyConfig,
): Promise<void> {
  await prisma.appConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      loyaltyJson: config as unknown as Prisma.InputJsonValue,
    },
    update: {
      loyaltyJson: config as unknown as Prisma.InputJsonValue,
    },
  });
}
