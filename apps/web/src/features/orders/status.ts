import type { OrderStatus } from "@/types/order";

/** Pipeline order for the timeline (cancelled is terminal / separate). */
export const ORDER_STATUS_PIPELINE: Exclude<OrderStatus, "cancelled">[] = [
  "received",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "استلمنا طلبك",
  confirmed: "تم تأكيد الطلب",
  preparing: "قيد التحضير",
  out_for_delivery: "بالطريق إليك",
  delivered: "تم التوصيل",
  cancelled: "تم إلغاء الطلب",
};

/** Short supporting copy for timeline rows. */
export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  received: "طلبك وصلنا ونراجعه",
  confirmed: "المطعم أكد طلبك",
  preparing: "المطبخ يجهّز طلبك",
  out_for_delivery: "الطلب في الطريق إليك",
  delivered: "وصل الطلب — بالعافية",
  cancelled: "تم إلغاء هذا الطلب",
};

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status];
}

export function getOrderStatusDescription(status: OrderStatus): string {
  return ORDER_STATUS_DESCRIPTIONS[status];
}

export function pipelineIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  return ORDER_STATUS_PIPELINE.indexOf(status);
}
