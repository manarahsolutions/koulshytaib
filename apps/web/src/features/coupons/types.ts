/**
 * Shared coupon shapes (safe for client + server).
 */

export type CouponTypeId = "percent" | "fixed_iqd";

export type CouponRecord = {
  id: string;
  code: string;
  type: CouponTypeId;
  value: number;
  active: boolean;
  expiresAt?: string;
  maxRedemptions?: number;
  redemptionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ValidateCouponResult = {
  code: string;
  discount: number;
  type: CouponTypeId;
  value: number;
};
