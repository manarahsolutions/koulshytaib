/**
 * Checkout pricing helpers (frontend-only).
 *
 * DELIVERY_FEE_IQD is a **development mock**, not a production-confirmed rate.
 * Replace with backend / admin configuration later.
 */

export {
  calcCheckoutTotalsWithCoupon,
  calcCouponDiscount,
} from "@/features/checkout/coupon-math";

/** Mock delivery fee in IQD — change freely until backend owns pricing. */
export const DELIVERY_FEE_IQD = 3000;

export type CheckoutTotals = {
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export function calcCheckoutTotals(
  subtotal: number,
  deliveryFee: number = DELIVERY_FEE_IQD,
): CheckoutTotals {
  const safeSubtotal = Math.max(0, subtotal);
  const safeFee = Math.max(0, deliveryFee);
  return {
    subtotal: safeSubtotal,
    deliveryFee: safeFee,
    total: safeSubtotal + safeFee,
  };
}
