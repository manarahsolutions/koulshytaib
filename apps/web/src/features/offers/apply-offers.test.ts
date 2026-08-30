import { describe, expect, it } from "vitest";
import { applyOffersToLines } from "@/features/offers/apply-offers";
import type { Offer } from "@/features/offers/types";
import {
  calcCheckoutTotalsWithCoupon,
  calcCouponDiscount,
} from "@/features/checkout/coupon-math";

const baseOffer = (partial: Partial<Offer> & Pick<Offer, "id" | "type">): Offer => ({
  title: "عرض",
  productIds: ["p1"],
  visible: true,
  active: true,
  featured: false,
  ctaLabel: "اطلب",
  sortOrder: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...partial,
});

describe("applyOffersToLines", () => {
  it("applies percentage and picks best price", () => {
    const offers: Offer[] = [
      baseOffer({
        id: "o1",
        type: "percentage",
        discountPercent: 10,
        productIds: ["p1"],
      }),
      baseOffer({
        id: "o2",
        type: "fixed_price",
        offerPrice: 7000,
        productIds: ["p1"],
      }),
    ];
    const [line] = applyOffersToLines(
      [{ productId: "p1", catalogUnitPrice: 10000, quantity: 2 }],
      offers,
    );
    expect(line!.unitPrice).toBe(7000);
    expect(line!.lineTotal).toBe(14000);
    expect(line!.offerId).toBe("o2");
  });

  it("ignores inactive or invisible offers", () => {
    const offers: Offer[] = [
      baseOffer({
        id: "o1",
        type: "percentage",
        discountPercent: 50,
        active: false,
      }),
      baseOffer({
        id: "o2",
        type: "percentage",
        discountPercent: 50,
        visible: false,
      }),
    ];
    const [line] = applyOffersToLines(
      [{ productId: "p1", catalogUnitPrice: 10000, quantity: 1 }],
      offers,
    );
    expect(line!.unitPrice).toBe(10000);
    expect(line!.offerId).toBeUndefined();
  });
});

describe("coupon totals", () => {
  it("calculates percent and fixed discounts", () => {
    expect(
      calcCouponDiscount({ type: "percent", value: 10, subtotal: 10000 }),
    ).toBe(1000);
    expect(
      calcCouponDiscount({ type: "fixed_iqd", value: 2500, subtotal: 10000 }),
    ).toBe(2500);
    expect(
      calcCouponDiscount({ type: "fixed_iqd", value: 99999, subtotal: 1000 }),
    ).toBe(1000);
  });

  it("applies coupon before delivery fee", () => {
    const totals = calcCheckoutTotalsWithCoupon({
      subtotal: 10000,
      deliveryFee: 3000,
      couponDiscount: 1000,
    });
    expect(totals.total).toBe(12000);
    expect(totals.couponDiscount).toBe(1000);
  });
});
