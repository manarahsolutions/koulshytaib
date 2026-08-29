/**
 * Pure templates + mapping from order status → notification type.
 * Bodies must never include raw phone numbers.
 */

import type { OrderStatus } from "@/types/order";
import type { NotificationType } from "@/features/notifications/types";

export function notificationTypeForOrderStatus(
  status: OrderStatus,
): NotificationType | null {
  switch (status) {
    case "received":
      return "ORDER_RECEIVED";
    case "confirmed":
      return "ORDER_CONFIRMED";
    case "preparing":
      return "ORDER_PREPARING";
    case "out_for_delivery":
      return "ORDER_OUT_FOR_DELIVERY";
    case "delivered":
      return "ORDER_DELIVERED";
    case "cancelled":
      return "ORDER_CANCELLED";
    default:
      return null;
  }
}

/** Opaque short ref for messages — not a sequential public number. */
export function formatOrderRefForMessage(orderId: string): string {
  const clean = orderId.replace(/[^a-zA-Z0-9]/g, "");
  const tail = clean.slice(-6).toUpperCase() || "ORDER";
  return `#${tail}`;
}

export function buildOrderStatusMessage(input: {
  type: NotificationType;
  orderId: string;
  customerName?: string;
}): { title: string; body: string } {
  const ref = formatOrderRefForMessage(input.orderId);
  const greet = input.customerName?.trim()
    ? `مرحباً ${input.customerName.trim()}، `
    : "";

  switch (input.type) {
    case "ORDER_RECEIVED":
      return {
        title: "تم استلام طلبك",
        body: `${greet}استلمنا طلبك ${ref} من كلشي طيب. راح نحدّثك لما يتأكد.`,
      };
    case "ORDER_CONFIRMED":
      return {
        title: "تم تأكيد الطلب",
        body: `${greet}تم تأكيد طلبك ${ref}. المطبخ يجهّز قريباً.`,
      };
    case "ORDER_PREPARING":
      return {
        title: "بدأنا بتحضير طلبك",
        body: `${greet}المطبخ يشتغل على طلبك ${ref} الآن.`,
      };
    case "ORDER_OUT_FOR_DELIVERY":
      return {
        title: "طلبك بالطريق إليك",
        body: `${greet}طلبك ${ref} طالع للتوصيل. بالتوفيق!`,
      };
    case "ORDER_DELIVERED":
      return {
        title: "تم توصيل طلبك",
        body: `${greet}وصل طلبك ${ref}. صحتين وعافية من كلشي طيب.`,
      };
    case "ORDER_CANCELLED":
      return {
        title: "تم إلغاء الطلب",
        body: `${greet}تم إلغاء طلبك ${ref}. إذا تحتاج مساعدة تواصل معنا.`,
      };
  }
}

export function buildIdempotencyKey(input: {
  orderId: string;
  type: NotificationType;
  channel: string;
}): string {
  return `${input.orderId}:${input.type}:${input.channel}`;
}
