/**
 * Admin dashboard / orders selectors (pure over order lists).
 *
 * KPI rules (Phase 11):
 * - Orders today: createdAt in Iraq calendar day
 * - Completed revenue today: status delivered AND delivered event today (Iraq)
 * - Active: not delivered and not cancelled
 * - Avg completed AOV today: mean of delivered-today totals, or null → UI shows "—"
 */

import { isSameIraqDay } from "@/lib/datetime/iraq-day";
import type { Order, OrderStatus } from "@/types/order";

const ACTIVE_STATUSES: ReadonlySet<OrderStatus> = new Set([
  "received",
  "confirmed",
  "preparing",
  "out_for_delivery",
]);

export function isActiveOrder(order: Order): boolean {
  return ACTIVE_STATUSES.has(order.status);
}

export function getDeliveredAt(order: Order): string | null {
  if (order.status !== "delivered") return null;
  for (let i = order.statusHistory.length - 1; i >= 0; i -= 1) {
    const event = order.statusHistory[i];
    if (event?.status === "delivered") return event.timestamp;
  }
  return order.updatedAt ?? order.createdAt;
}

export function getTodayOrders(
  orders: Order[],
  now: Date = new Date(),
): Order[] {
  return orders.filter((o) => isSameIraqDay(o.createdAt, now));
}

export function getActiveOrders(orders: Order[]): Order[] {
  return orders
    .filter(isActiveOrder)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTodayDeliveredOrders(
  orders: Order[],
  now: Date = new Date(),
): Order[] {
  return orders.filter((o) => {
    const deliveredAt = getDeliveredAt(o);
    return deliveredAt ? isSameIraqDay(deliveredAt, now) : false;
  });
}

export function getTodayDeliveredRevenue(
  orders: Order[],
  now: Date = new Date(),
): number {
  return getTodayDeliveredOrders(orders, now).reduce(
    (sum, o) => sum + o.pricing.total,
    0,
  );
}

/**
 * Average completed order value for deliveries that happened today (Iraq).
 * Returns `null` when there are no completed deliveries — UI should show "—".
 */
export function getTodayAverageOrderValue(
  orders: Order[],
  now: Date = new Date(),
): number | null {
  const delivered = getTodayDeliveredOrders(orders, now);
  if (delivered.length === 0) return null;
  const total = delivered.reduce((sum, o) => sum + o.pricing.total, 0);
  return total / delivered.length;
}

export function getOrderCountsByStatus(
  orders: Order[],
): Record<OrderStatus, number> {
  const counts: Record<OrderStatus, number> = {
    received: 0,
    confirmed: 0,
    preparing: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const order of orders) {
    counts[order.status] += 1;
  }
  return counts;
}

export function sortOrdersNewestFirst(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function filterOrders(input: {
  orders: Order[];
  query?: string;
  status?: OrderStatus | "all";
}): Order[] {
  const q = input.query?.trim().toLowerCase() ?? "";
  const status = input.status ?? "all";

  return sortOrdersNewestFirst(input.orders).filter((order) => {
    if (status !== "all" && order.status !== status) return false;
    if (!q) return true;
    if (order.id.toLowerCase().includes(q)) return true;
    if (order.customer.name.toLowerCase().includes(q)) return true;
    return false;
  });
}

export function countOrderItems(order: Order): number {
  return order.items.reduce((sum, line) => sum + line.quantity, 0);
}
