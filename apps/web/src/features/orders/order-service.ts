/**
 * Order mutation service — Admin and future APIs should call this,
 * not mutate order objects inside React components.
 *
 * Mutations are in-memory only (order-registry). Not server-persisted.
 */

import {
  getOrderById,
  saveOrder,
} from "@/features/orders/order-registry";
import { canTransitionOrderStatus } from "@/features/orders/order-transitions";
import type { Order, OrderStatus } from "@/types/order";

export type UpdateOrderStatusResult =
  | { ok: true; order: Order }
  | {
      ok: false;
      code: "NOT_FOUND" | "INVALID_TRANSITION";
      message: string;
    };

export function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
  note?: string,
): UpdateOrderStatusResult {
  const current = getOrderById(orderId);
  if (!current) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "ما لكينا هذا الطلب",
    };
  }

  if (!canTransitionOrderStatus(current.status, nextStatus)) {
    return {
      ok: false,
      code: "INVALID_TRANSITION",
      message: "ما يصير تغيير الحالة بهالشكل",
    };
  }

  const timestamp = new Date().toISOString();
  const updated: Order = {
    ...current,
    status: nextStatus,
    updatedAt: timestamp,
    statusHistory: [
      ...current.statusHistory,
      {
        status: nextStatus,
        timestamp,
        note: note ?? `admin:${current.status}→${nextStatus}`,
      },
    ],
  };

  saveOrder(updated);
  return { ok: true, order: updated };
}
