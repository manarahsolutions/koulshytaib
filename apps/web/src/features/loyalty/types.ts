/**
 * Loyalty engine types — disabled by default until business-approved rates exist.
 * No customer UI in Phase 10.
 */

/** Typed origin for a points movement (preferred over free-text alone). */
export type LoyaltyTransactionSource =
  | { type: "order"; id: string }
  | { type: "reward"; id: string }
  | { type: "manual"; id?: string };

export type LoyaltyConfig = {
  /** Master switch — false means no earn / redeem / adjust via public engine APIs */
  enabled: boolean;
  earning: {
    enabled: boolean;
    /**
     * Integer points per 1 IQD of eligible order total.
     * Keep at `0` until business approves a real rate — do not invent economics.
     */
    pointsPerCurrencyUnit: number;
  };
  redemption: {
    enabled: boolean;
    /** Minimum points required for a single redeem call (0 = no minimum while disabled) */
    minimumPoints: number;
    /**
     * Placeholder currency conversion for future checkout discounts.
     * Unused while redemption is disabled — do not invent rates.
     */
    pointsPerCurrencyUnit: number;
  };
};

export type LoyaltyAccount = {
  customerId: string;
  /** Cached derived balance — transactions are the source of truth */
  pointsBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  createdAt: string;
  updatedAt: string;
};

export type LoyaltyTransactionType = "earn" | "redeem" | "adjust";

/**
 * Transaction convention:
 * - `earn`: `points` is a positive magnitude → adds to balance
 * - `redeem`: `points` is a positive magnitude → subtracts from balance
 * - `adjust`: `points` is signed → positive adds, negative subtracts
 */
export type LoyaltyTransaction = {
  id: string;
  customerId: string;
  type: LoyaltyTransactionType;
  points: number;
  reason: string;
  createdAt: string;
  /** Preferred structured reference */
  source?: LoyaltyTransactionSource;
  /**
   * @deprecated Prefer `source: { type: "order", id }`.
   * Kept for backward compatibility with Phase 9 payloads.
   */
  relatedOrderId?: string;
};

export type LoyaltyReward = {
  id: string;
  name: string;
  description?: string;
  pointsCost: number;
  enabled: boolean;
};

export type LoyaltyErrorCode =
  | "LOYALTY_DISABLED"
  | "EARNING_DISABLED"
  | "REDEMPTION_DISABLED"
  | "INSUFFICIENT_POINTS"
  | "INVALID_POINTS"
  | "ORDER_NOT_ELIGIBLE"
  | "ALREADY_AWARDED"
  | "REWARD_NOT_FOUND"
  | "REWARD_DISABLED"
  | "NOT_IMPLEMENTED";

export class LoyaltyError extends Error {
  readonly code: LoyaltyErrorCode;

  constructor(code: LoyaltyErrorCode, message?: string) {
    super(message ?? code);
    this.name = "LoyaltyError";
    this.code = code;
  }
}

export type AwardPointsResult =
  | { status: "awarded"; transaction: LoyaltyTransaction; points: number }
  | { status: "already_awarded"; transaction: LoyaltyTransaction }
  | { status: "skipped"; reason: LoyaltyErrorCode };

export type RedeemRewardResult =
  | { status: "not_implemented" }
  | { status: "rejected"; code: LoyaltyErrorCode };

/** Default: fully disabled — safe until business-approved rates exist. */
export const DEFAULT_LOYALTY_CONFIG: LoyaltyConfig = {
  enabled: false,
  earning: {
    enabled: false,
    pointsPerCurrencyUnit: 0,
  },
  redemption: {
    enabled: false,
    minimumPoints: 0,
    pointsPerCurrencyUnit: 0,
  },
};
