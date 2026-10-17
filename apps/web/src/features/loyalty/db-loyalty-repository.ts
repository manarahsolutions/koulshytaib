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
import {
  calculateEarnedPoints,
  isOrderEligibleForEarning,
} from "@/features/loyalty/loyalty-rules";
import type { Order } from "@/types/order";

export async function dbGetLoyaltyConfig(): Promise<LoyaltyConfig> {
  const row = await prisma.appConfig.findUnique({ where: { id: "default" } });
  if (!row) return DEFAULT_LOYALTY_CONFIG;
  return normalizeLoyaltyConfig(row.loyaltyJson);
}

/**
 * Stored JSON may predate `earning.iqdPerPoint` (it used a points-per-IQD
 * multiplier). The old value is dropped rather than converted, so earning
 * stays off until a manager sets an explicit IQD-per-point rate.
 */
function normalizeLoyaltyConfig(raw: unknown): LoyaltyConfig {
  const stored = (raw ?? {}) as Partial<LoyaltyConfig>;
  const earning = (stored.earning ?? {}) as Partial<LoyaltyConfig["earning"]>;
  return {
    ...DEFAULT_LOYALTY_CONFIG,
    ...stored,
    earning: {
      enabled: Boolean(earning.enabled),
      iqdPerPoint: Number.isInteger(earning.iqdPerPoint)
        ? Math.max(0, earning.iqdPerPoint as number)
        : 0,
    },
    redemption: {
      ...DEFAULT_LOYALTY_CONFIG.redemption,
      ...stored.redemption,
    },
  };
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

/**
 * Award earn points for a delivered order (idempotent via relatedOrderId + type earn).
 */
export async function dbAwardPointsForDeliveredOrder(
  order: Order,
): Promise<"awarded" | "skipped" | "already_awarded"> {
  const config = await dbGetLoyaltyConfig();
  if (!config.enabled || !config.earning.enabled) return "skipped";
  if (!isOrderEligibleForEarning(order) || !order.customerId) return "skipped";

  const existing = await prisma.loyaltyTransaction.findFirst({
    where: {
      customerId: order.customerId,
      type: "earn",
      relatedOrderId: order.id,
    },
  });
  if (existing) return "already_awarded";

  const points = calculateEarnedPoints(order, config);
  if (points <= 0) return "skipped";

  await dbAppendLoyaltyTransaction({
    customerId: order.customerId,
    type: "earn",
    points,
    reason: "order_delivered",
    source: { type: "order", id: order.id },
    relatedOrderId: order.id,
  });
  return "awarded";
}
