/**
 * Derived customer metrics — never treat as stored source of truth.
 *
 * Business rule (Phase 9):
 * - `totalSpend` / `lifetimeValue` / `averageOrderValue` use **delivered** orders only.
 * - Cancelled orders are excluded from spend.
 * - `completedOrders` = delivered count.
 * - Classification `returning` requires ≥1 previous **delivered** order
 *   (a customer record alone does not mean they purchased).
 */

import { getProductById } from "@/features/products/product-repository";
import type {
  CustomerClassification,
  CustomerMetrics,
} from "@/features/customers/types";
import type { Order } from "@/types/order";

function sortByCreatedAsc(a: Order, b: Order): number {
  return a.createdAt.localeCompare(b.createdAt);
}

export function computeCustomerMetrics(orders: Order[]): CustomerMetrics {
  const sorted = [...orders].sort(sortByCreatedAsc);
  const delivered = sorted.filter((o) => o.status === "delivered");
  const cancelled = sorted.filter((o) => o.status === "cancelled");

  const totalSpend = delivered.reduce((sum, o) => sum + o.pricing.total, 0);
  const completedOrders = delivered.length;
  const averageOrderValue =
    completedOrders > 0 ? totalSpend / completedOrders : 0;

  const classification: CustomerClassification =
    completedOrders >= 1 ? "returning" : "new";

  const productCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  for (const order of delivered) {
    for (const line of order.items) {
      productCounts.set(
        line.productId,
        (productCounts.get(line.productId) ?? 0) + line.quantity,
      );
      const categoryId = getProductById(line.productId)?.categoryId;
      if (categoryId) {
        categoryCounts.set(
          categoryId,
          (categoryCounts.get(categoryId) ?? 0) + line.quantity,
        );
      }
    }
  }

  const favoriteProductIds = topKeys(productCounts, 3);
  const favoriteCategoryIds = topKeys(categoryCounts, 3);

  return {
    totalOrders: sorted.length,
    completedOrders,
    cancelledOrders: cancelled.length,
    totalSpend,
    lifetimeValue: totalSpend,
    averageOrderValue,
    firstOrderAt: sorted[0]?.createdAt ?? null,
    /** Latest order of any status (createdAt) */
    lastOrderAt: sorted[sorted.length - 1]?.createdAt ?? null,
    /** Latest delivered order createdAt — metrics “آخر طلب مكتمل” */
    lastDeliveredAt: delivered[delivered.length - 1]?.createdAt ?? null,
    classification,
    favoriteProductIds,
    favoriteCategoryIds,
  };
}

function topKeys(counts: Map<string, number>, limit: number): string[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([id]) => id);
}

/**
 * Whether this customer should be treated as returning **before** attaching
 * a brand-new order (based on prior delivered history only).
 */
export function classificationBeforeOrder(
  priorOrders: Order[],
): CustomerClassification {
  return computeCustomerMetrics(priorOrders).classification;
}
