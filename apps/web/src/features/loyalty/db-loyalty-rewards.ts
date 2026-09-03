/**
 * Loyalty rewards catalog (server-only).
 */

import "server-only";
import type { LoyaltyReward as DbReward } from "@prisma/client";
import { BackendError } from "@/lib/db/errors";
import { interactiveTransactionOptions, prisma } from "@/lib/db/prisma";
import { createOpaqueId } from "@/lib/id";
import type { LoyaltyRewardRecord } from "@/features/loyalty/reward-types";

export type { LoyaltyRewardRecord };

export function mapReward(row: DbReward): LoyaltyRewardRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    pointsCost: row.pointsCost,
    active: row.active,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function dbListLoyaltyRewards(opts?: {
  activeOnly?: boolean;
}): Promise<LoyaltyRewardRecord[]> {
  const rows = await prisma.loyaltyReward.findMany({
    where: opts?.activeOnly ? { active: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapReward);
}

export async function dbCreateLoyaltyReward(input: {
  title: string;
  description?: string;
  pointsCost: number;
  active?: boolean;
}): Promise<LoyaltyRewardRecord> {
  const title = input.title.trim();
  if (!title) throw new BackendError("VALIDATION", "اكتب اسم المكافأة");
  const pointsCost = Math.trunc(input.pointsCost);
  if (pointsCost < 1) {
    throw new BackendError("VALIDATION", "تكلفة النقاط لازم تكون أكبر من صفر");
  }
  const max = await prisma.loyaltyReward.aggregate({
    _max: { sortOrder: true },
  });
  const row = await prisma.loyaltyReward.create({
    data: {
      id: createOpaqueId("rwd"),
      title,
      description: input.description?.trim() || null,
      pointsCost,
      active: input.active ?? true,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
    },
  });
  return mapReward(row);
}

export async function dbUpdateLoyaltyReward(
  id: string,
  patch: Partial<{
    title: string;
    description: string | null;
    pointsCost: number;
    active: boolean;
  }>,
): Promise<LoyaltyRewardRecord> {
  const data: Record<string, unknown> = {};
  if (patch.title != null) {
    const title = patch.title.trim();
    if (!title) throw new BackendError("VALIDATION", "اكتب اسم المكافأة");
    data.title = title;
  }
  if (patch.description !== undefined) {
    data.description = patch.description?.trim() || null;
  }
  if (patch.pointsCost != null) {
    const pointsCost = Math.trunc(patch.pointsCost);
    if (pointsCost < 1) {
      throw new BackendError("VALIDATION", "تكلفة النقاط لازم تكون أكبر من صفر");
    }
    data.pointsCost = pointsCost;
  }
  if (patch.active != null) data.active = patch.active;
  const row = await prisma.loyaltyReward.update({ where: { id }, data });
  return mapReward(row);
}

export async function dbDeleteLoyaltyReward(id: string): Promise<void> {
  await prisma.loyaltyReward.delete({ where: { id } });
}

export async function dbRedeemLoyaltyReward(input: {
  customerId: string;
  rewardId: string;
}): Promise<{ balance: number; rewardTitle: string; pointsCost: number }> {
  return prisma.$transaction(async (tx) => {
    const reward = await tx.loyaltyReward.findUnique({
      where: { id: input.rewardId },
    });
    if (!reward || !reward.active) {
      throw new BackendError("VALIDATION", "المكافأة غير متاحة");
    }
    const account = await tx.loyaltyAccount.findUnique({
      where: { customerId: input.customerId },
    });
    if (!account) {
      throw new BackendError("VALIDATION", "ما عندك حساب ولاء بعد");
    }
    if (account.pointsBalance < reward.pointsCost) {
      throw new BackendError("VALIDATION", "رصيد النقاط غير كافٍ");
    }
    const nextBalance = account.pointsBalance - reward.pointsCost;
    await tx.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        pointsBalance: nextBalance,
        lifetimeRedeemed: account.lifetimeRedeemed + reward.pointsCost,
      },
    });
    await tx.loyaltyTransaction.create({
      data: {
        id: createOpaqueId("lyt"),
        loyaltyAccountId: account.id,
        customerId: input.customerId,
        type: "redeem",
        points: reward.pointsCost,
        reason: `استبدال: ${reward.title}`,
        sourceType: "reward",
        sourceId: reward.id,
      },
    });
    return {
      balance: nextBalance,
      rewardTitle: reward.title,
      pointsCost: reward.pointsCost,
    };
  }, interactiveTransactionOptions);
}
