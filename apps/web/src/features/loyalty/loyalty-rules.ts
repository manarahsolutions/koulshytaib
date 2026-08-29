/**
 * Pure loyalty rules — earning eligibility, point math, redemption checks.
 *
 * Earning eligibility (Phase 10 default, aligned with Phase 9 spend rule):
 * only `delivered` orders may earn points.
 * received / confirmed / preparing / out_for_delivery / cancelled → not eligible.
 */

import type { LoyaltyConfig } from "@/features/loyalty/types";
import type { Order, OrderStatus } from "@/types/order";

const EARN_ELIGIBLE_STATUSES: ReadonlySet<OrderStatus> = new Set([
  "delivered",
]);

export function isOrderEligibleForEarning(order: Order): boolean {
  return EARN_ELIGIBLE_STATUSES.has(order.status);
}

/**
 * Integer points from eligible order total × configured rate.
 * Returns 0 when loyalty/earning disabled or rate is 0.
 * Never invents a commercial rate — uses config only.
 */
export function calculateEarnedPoints(
  order: Order,
  config: LoyaltyConfig,
): number {
  if (!config.enabled || !config.earning.enabled) return 0;
  if (!isOrderEligibleForEarning(order)) return 0;

  const rate = Math.max(0, Math.trunc(config.earning.pointsPerCurrencyUnit));
  if (rate <= 0) return 0;

  const totalIqd = Math.max(0, Math.trunc(order.pricing.total));
  return totalIqd * rate;
}

export type RedeemValidation =
  | { ok: true }
  | {
      ok: false;
      code:
        | "LOYALTY_DISABLED"
        | "REDEMPTION_DISABLED"
        | "INVALID_POINTS"
        | "INSUFFICIENT_POINTS";
    };

export function validateRedeemPoints(input: {
  config: LoyaltyConfig;
  balance: number;
  points: number;
}): RedeemValidation {
  const { config, balance, points } = input;

  if (!config.enabled) {
    return { ok: false, code: "LOYALTY_DISABLED" };
  }
  if (!config.redemption.enabled) {
    return { ok: false, code: "REDEMPTION_DISABLED" };
  }
  if (!Number.isInteger(points) || points <= 0) {
    return { ok: false, code: "INVALID_POINTS" };
  }
  if (points < config.redemption.minimumPoints) {
    return { ok: false, code: "INVALID_POINTS" };
  }
  if (points > balance) {
    return { ok: false, code: "INSUFFICIENT_POINTS" };
  }
  return { ok: true };
}

/** Signed delta applied to balance for a single transaction. */
export function transactionBalanceDelta(type: string, points: number): number {
  if (type === "earn") return Math.abs(points);
  if (type === "redeem") return -Math.abs(points);
  return points; // adjust: signed
}
