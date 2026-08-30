/**
 * Pure coupon discount math — after offer-priced subtotal, before delivery fee.
 */

export type CouponDiscountInput = {
  type: "percent" | "fixed_iqd";
  value: number;
  subtotal: number;
};

export function calcCouponDiscount(input: CouponDiscountInput): number {
  const subtotal = Math.max(0, Math.trunc(input.subtotal));
  if (subtotal <= 0) return 0;
  if (input.type === "percent") {
    const pct = Math.min(100, Math.max(0, Math.trunc(input.value)));
    return Math.min(subtotal, Math.round((subtotal * pct) / 100));
  }
  return Math.min(subtotal, Math.max(0, Math.trunc(input.value)));
}

export function calcCheckoutTotalsWithCoupon(input: {
  subtotal: number;
  deliveryFee: number;
  couponDiscount?: number;
}): {
  subtotal: number;
  deliveryFee: number;
  couponDiscount: number;
  total: number;
} {
  const subtotal = Math.max(0, input.subtotal);
  const deliveryFee = Math.max(0, input.deliveryFee);
  const couponDiscount = Math.max(
    0,
    Math.min(subtotal, Math.floor(input.couponDiscount ?? 0)),
  );
  return {
    subtotal,
    deliveryFee,
    couponDiscount,
    total: subtotal - couponDiscount + deliveryFee,
  };
}
