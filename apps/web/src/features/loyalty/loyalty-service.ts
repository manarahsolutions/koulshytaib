/**
 * Loyalty engine service — accounts, earn, redeem, adjust.
 *
 * Order integration boundary:
 *   placeGuestOrder → status received (no points)
 *   … future status → delivered
 *   awardPointsForDeliveredOrder(order) → earn (idempotent)
 *
 * Do not auto-award from placeGuestOrder.
 */

import {
  getLifetimeEarned,
  getLifetimeRedeemed,
  getLoyaltyBalance,
  getLoyaltyTransactions,
  hasEarnTransactionForOrder,
} from "@/features/loyalty/loyalty-metrics";
import {
  loyaltyRepository,
  type LoyaltyRepository,
} from "@/features/loyalty/loyalty-repository";
import {
  calculateEarnedPoints,
  isOrderEligibleForEarning,
  validateRedeemPoints,
} from "@/features/loyalty/loyalty-rules";
import {
  DEFAULT_LOYALTY_CONFIG,
  LoyaltyError,
  type AwardPointsResult,
  type LoyaltyAccount,
  type LoyaltyConfig,
  type LoyaltyReward,
  type LoyaltyTransaction,
  type LoyaltyTransactionSource,
  type LoyaltyTransactionType,
  type RedeemRewardResult,
} from "@/features/loyalty/types";
import { createOpaqueId } from "@/lib/id";
import type { Order } from "@/types/order";

let config: LoyaltyConfig = cloneConfig(DEFAULT_LOYALTY_CONFIG);

/** Catalog shell — empty until business defines rewards. No UI. */
const rewards = new Map<string, LoyaltyReward>();

function refreshAccountCache(
  customerId: string,
  repo: LoyaltyRepository,
): LoyaltyAccount {
  const existing = repo.getAccount(customerId);
  const timestamp = new Date().toISOString();
  const account: LoyaltyAccount = {
    customerId,
    pointsBalance: getLoyaltyBalance(customerId, repo),
    lifetimeEarned: getLifetimeEarned(customerId, repo),
    lifetimeRedeemed: getLifetimeRedeemed(customerId, repo),
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  repo.saveAccount(account);
  return account;
}

export function getLoyaltyConfig(): LoyaltyConfig {
  return cloneConfig(config);
}

/**
 * Mock/admin setter for development only.
 * Does not invent production economics — callers must supply approved values.
 */
export function setLoyaltyConfig(next: Partial<LoyaltyConfig>): LoyaltyConfig {
  config = {
    ...config,
    ...next,
    earning: { ...config.earning, ...next.earning },
    redemption: { ...config.redemption, ...next.redemption },
  };
  return getLoyaltyConfig();
}

export function ensureLoyaltyAccount(
  customerId: string,
  repo: LoyaltyRepository = loyaltyRepository,
): LoyaltyAccount {
  const existing = repo.getAccount(customerId);
  if (existing) return existing;

  const timestamp = new Date().toISOString();
  const account: LoyaltyAccount = {
    customerId,
    pointsBalance: 0,
    lifetimeEarned: 0,
    lifetimeRedeemed: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  repo.saveAccount(account);
  return account;
}

export function getLoyaltyAccount(
  customerId: string,
  repo: LoyaltyRepository = loyaltyRepository,
): LoyaltyAccount | null {
  return repo.getAccount(customerId);
}

export type RecordLoyaltyTxnInput = {
  customerId: string;
  type: LoyaltyTransactionType;
  points: number;
  reason: string;
  source?: LoyaltyTransactionSource;
  /** @deprecated Prefer `source` */
  relatedOrderId?: string;
};

function assertIntegerPoints(points: number, allowNegative: boolean): void {
  if (!Number.isInteger(points)) {
    throw new LoyaltyError("INVALID_POINTS", "Points must be integers");
  }
  if (!allowNegative && points <= 0) {
    throw new LoyaltyError("INVALID_POINTS", "Points must be a positive integer");
  }
  if (allowNegative && points === 0) {
    throw new LoyaltyError("INVALID_POINTS", "Adjustment points cannot be zero");
  }
}

/**
 * Low-level transaction writer. Prefer earn/redeem/adjust helpers.
 * Blocked while master `enabled` is false.
 */
export function recordLoyaltyTransaction(
  input: RecordLoyaltyTxnInput,
  repo: LoyaltyRepository = loyaltyRepository,
): LoyaltyTransaction {
  if (!config.enabled) {
    throw new LoyaltyError("LOYALTY_DISABLED");
  }

  if (input.type === "adjust") {
    assertIntegerPoints(input.points, true);
  } else {
    assertIntegerPoints(input.points, false);
  }

  ensureLoyaltyAccount(input.customerId, repo);

  const relatedOrderId =
    input.relatedOrderId ??
    (input.source?.type === "order" ? input.source.id : undefined);

  const txn: LoyaltyTransaction = {
    id: createOpaqueId("lyt"),
    customerId: input.customerId,
    type: input.type,
    points:
      input.type === "adjust" ? input.points : Math.abs(input.points),
    reason: input.reason,
    source: input.source,
    relatedOrderId,
    createdAt: new Date().toISOString(),
  };

  if (input.type === "redeem" || input.type === "adjust") {
    const nextBalance =
      getLoyaltyBalance(input.customerId, repo) +
      (input.type === "redeem" ? -Math.abs(input.points) : input.points);
    if (nextBalance < 0) {
      throw new LoyaltyError("INSUFFICIENT_POINTS");
    }
  }

  repo.addTransaction(txn);
  refreshAccountCache(input.customerId, repo);
  return txn;
}

export function canRedeemPoints(
  customerId: string,
  points: number,
  repo: LoyaltyRepository = loyaltyRepository,
): boolean {
  const result = validateRedeemPoints({
    config,
    balance: getLoyaltyBalance(customerId, repo),
    points,
  });
  return result.ok;
}

export function redeemPoints(
  customerId: string,
  points: number,
  reason: string,
  repo: LoyaltyRepository = loyaltyRepository,
): LoyaltyTransaction {
  const validation = validateRedeemPoints({
    config,
    balance: getLoyaltyBalance(customerId, repo),
    points,
  });
  if (!validation.ok) {
    throw new LoyaltyError(validation.code);
  }

  return recordLoyaltyTransaction(
    {
      customerId,
      type: "redeem",
      points,
      reason,
      source: { type: "manual" },
    },
    repo,
  );
}

/**
 * Manual correction (future Admin). Signed points.
 * Requires loyalty enabled. Rejects resulting negative balance.
 */
export function adjustPoints(
  customerId: string,
  points: number,
  reason: string,
  repo: LoyaltyRepository = loyaltyRepository,
): LoyaltyTransaction {
  if (!config.enabled) {
    throw new LoyaltyError("LOYALTY_DISABLED");
  }
  assertIntegerPoints(points, true);

  return recordLoyaltyTransaction(
    {
      customerId,
      type: "adjust",
      points,
      reason,
      source: { type: "manual" },
    },
    repo,
  );
}

/**
 * Award points for a delivered order. Idempotent per order id.
 * Call when order reaches `delivered` — not from placeGuestOrder.
 */
export function awardPointsForDeliveredOrder(
  order: Order,
  repo: LoyaltyRepository = loyaltyRepository,
): AwardPointsResult {
  if (!config.enabled) {
    return { status: "skipped", reason: "LOYALTY_DISABLED" };
  }
  if (!config.earning.enabled) {
    return { status: "skipped", reason: "EARNING_DISABLED" };
  }
  if (!isOrderEligibleForEarning(order)) {
    return { status: "skipped", reason: "ORDER_NOT_ELIGIBLE" };
  }
  if (!order.customerId) {
    return { status: "skipped", reason: "ORDER_NOT_ELIGIBLE" };
  }

  if (hasEarnTransactionForOrder(order.id, order.customerId, repo)) {
    const existing = repo
      .listTransactions(order.customerId)
      .find(
        (t) =>
          t.type === "earn" &&
          (t.source?.type === "order"
            ? t.source.id === order.id
            : t.relatedOrderId === order.id),
      );
    if (existing) {
      return { status: "already_awarded", transaction: existing };
    }
    return { status: "skipped", reason: "ALREADY_AWARDED" };
  }

  const points = calculateEarnedPoints(order, config);
  if (points <= 0) {
    return { status: "skipped", reason: "EARNING_DISABLED" };
  }

  const transaction = recordLoyaltyTransaction(
    {
      customerId: order.customerId,
      type: "earn",
      points,
      reason: "order_delivered",
      source: { type: "order", id: order.id },
      relatedOrderId: order.id,
    },
    repo,
  );

  return { status: "awarded", transaction, points };
}

/**
 * Reward catalog redemption — fulfillment not implemented.
 * Does not pretend a checkout discount was applied.
 */
export function redeemReward(
  customerId: string,
  rewardId: string,
): RedeemRewardResult {
  void customerId;
  const reward = rewards.get(rewardId);
  if (!reward) {
    return { status: "rejected", code: "REWARD_NOT_FOUND" };
  }
  if (!reward.enabled) {
    return { status: "rejected", code: "REWARD_DISABLED" };
  }
  return { status: "not_implemented" };
}

export function listLoyaltyRewards(): LoyaltyReward[] {
  return [...rewards.values()];
}

/** Dev/test helper — register a reward definition without enabling fulfillment. */
export function upsertLoyaltyReward(reward: LoyaltyReward): void {
  rewards.set(reward.id, reward);
}

export {
  getLoyaltyBalance,
  getLifetimeEarned,
  getLifetimeRedeemed,
  getLoyaltyTransactions,
  hasEarnTransactionForOrder,
  calculateEarnedPoints,
};

export function clearLoyaltyForTests(
  repo: LoyaltyRepository = loyaltyRepository,
): void {
  repo.clear();
  config = cloneConfig(DEFAULT_LOYALTY_CONFIG);
  rewards.clear();
}

// Re-export repository factory for isolated tests later
export { createInMemoryLoyaltyRepository, loyaltyRepository } from "@/features/loyalty/loyalty-repository";
export { isOrderEligibleForEarning } from "@/features/loyalty/loyalty-rules";
export type { LoyaltyRepository } from "@/features/loyalty/loyalty-repository";

function cloneConfig(value: LoyaltyConfig): LoyaltyConfig {
  return {
    enabled: value.enabled,
    earning: { ...value.earning },
    redemption: { ...value.redemption },
  };
}
