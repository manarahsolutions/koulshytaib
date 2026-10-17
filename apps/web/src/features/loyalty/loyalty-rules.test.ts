import { describe, expect, it } from "vitest";
import {
  calculateEarnedPoints,
  isOrderEligibleForEarning,
  transactionBalanceDelta,
} from "@/features/loyalty/loyalty-rules";
import { DEFAULT_LOYALTY_CONFIG } from "@/features/loyalty/types";
import type { Order } from "@/types/order";

function stubOrder(status: Order["status"], total = 10000): Order {
  return {
    id: "ord_1",
    customerId: "cust_1",
    customer: { name: "أحمد", phone: "07501234567" },
    items: [],
    delivery: {
      governorate: "بغداد",
      area: "المنصور",
      address: "شارع",
    },
    payment: { method: "cash" },
    pricing: { subtotal: total, deliveryFee: 0, total },
    status,
    statusHistory: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("loyalty earning rules", () => {
  it("only delivered orders are eligible", () => {
    expect(isOrderEligibleForEarning(stubOrder("delivered"))).toBe(true);
    expect(isOrderEligibleForEarning(stubOrder("received"))).toBe(false);
    expect(isOrderEligibleForEarning(stubOrder("cancelled"))).toBe(false);
  });

  it("returns 0 when loyalty or rate disabled", () => {
    const order = stubOrder("delivered");
    expect(calculateEarnedPoints(order, DEFAULT_LOYALTY_CONFIG)).toBe(0);
    expect(
      calculateEarnedPoints(order, {
        ...DEFAULT_LOYALTY_CONFIG,
        enabled: true,
        earning: { enabled: true, iqdPerPoint: 0 },
      }),
    ).toBe(0);
  });

  it("earns one point per iqdPerPoint, rounded down", () => {
    const order = stubOrder("delivered", 5000);
    expect(
      calculateEarnedPoints(order, {
        ...DEFAULT_LOYALTY_CONFIG,
        enabled: true,
        earning: { enabled: true, iqdPerPoint: 1000 },
      }),
    ).toBe(5);
  });

  it("maps transaction balance deltas", () => {
    expect(transactionBalanceDelta("earn", 10)).toBe(10);
    expect(transactionBalanceDelta("redeem", 10)).toBe(-10);
    expect(transactionBalanceDelta("adjust", -5)).toBe(-5);
  });
});
