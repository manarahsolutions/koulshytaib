/**
 * Order status transition rules (pure).
 *
 * Happy path:
 * received → confirmed → preparing → out_for_delivery → delivered
 *
 * Cancel allowed from any non-terminal status.
 * Terminal (delivered / cancelled) cannot transition further.
 */

import type { OrderStatus } from "@/types/order";
import { ORDER_STATUS_PIPELINE } from "@/features/orders/status";

const TERMINAL: ReadonlySet<OrderStatus> = new Set([
  "delivered",
  "cancelled",
]);

/** Forward step after `from`, or null if terminal / last. */
export function getNextForwardStatus(
  from: OrderStatus,
): Exclude<OrderStatus, "cancelled"> | null {
  if (from === "cancelled" || from === "delivered") return null;
  const idx = ORDER_STATUS_PIPELINE.indexOf(from);
  if (idx < 0 || idx >= ORDER_STATUS_PIPELINE.length - 1) return null;
  return ORDER_STATUS_PIPELINE[idx + 1] ?? null;
}

export function canTransitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  if (from === to) return false;
  if (TERMINAL.has(from)) return false;

  if (to === "cancelled") {
    return !TERMINAL.has(from);
  }

  const next = getNextForwardStatus(from);
  return next === to;
}

/** Admin-facing short labels (ops), distinct from customer narrative copy. */
export const ORDER_STATUS_ADMIN_LABELS: Record<OrderStatus, string> = {
  received: "مستلم",
  confirmed: "مؤكد",
  preparing: "قيد التحضير",
  out_for_delivery: "خرج للتوصيل",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

export function getAdminStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_ADMIN_LABELS[status];
}

export const PRIMARY_STATUS_ACTION_LABEL: Partial<
  Record<OrderStatus, string>
> = {
  received: "تأكيد الطلب",
  confirmed: "بدء التحضير",
  preparing: "خرج للتوصيل",
  out_for_delivery: "تم التوصيل",
};
