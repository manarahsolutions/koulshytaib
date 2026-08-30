/**
 * WhatsApp click-to-chat (wa.me) helpers — no Business API required.
 * Pure / isomorphic: safe to import from Server Actions and tests.
 */

import { normalizeIraqiPhone } from "@/lib/format/phone";
import { formatPriceIQD } from "@/lib/format/price";
import {
  buildOrderStatusMessage,
  formatOrderRefForMessage,
  notificationTypeForOrderStatus,
} from "@/features/notifications/templates";
import type { NotificationType } from "@/features/notifications/types";
import type { Order, OrderStatus } from "@/types/order";

export const WHATSAPP_DEEPLINK_PROVIDER = "whatsapp_deeplink";

/** Digits-only E.164 without leading +. */
export function sanitizeE164Digits(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

/** `07XXXXXXXXX` → `9647XXXXXXXXX` */
export function iraqiLocalToE164(local07: string): string | null {
  const normalized = normalizeIraqiPhone(local07);
  if (!normalized) return null;
  return `964${normalized.slice(1)}`;
}

export function buildWaMeUrl(e164Digits: string, text: string): string {
  const phone = sanitizeE164Digits(e164Digits);
  if (!phone) {
    throw new Error("invalid_whatsapp_e164");
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function getKitchenWhatsAppE164FromEnv(
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  const raw = env.KITCHEN_WHATSAPP_E164?.trim();
  if (!raw) return null;
  return sanitizeE164Digits(raw);
}

export function buildKitchenOrderMessage(order: Order): string {
  const ref = formatOrderRefForMessage(order.id);
  const lines = order.items.map(
    (item) =>
      `• ${item.name} × ${item.quantity} — ${formatPriceIQD(item.lineTotal)}` +
      (item.notes ? ` (${item.notes})` : ""),
  );

  const addressParts = [
    order.delivery.governorate,
    order.delivery.area,
    order.delivery.address,
  ];
  if (order.delivery.landmark?.trim()) {
    addressParts.push(`قرب: ${order.delivery.landmark.trim()}`);
  }

  const payment =
    order.payment.method === "cash"
      ? "نقد عند الاستلام"
      : order.payment.method;

  const parts = [
    `طلب جديد من كلشي طيب ${ref}`,
    "",
    `الاسم: ${order.customer.name}`,
    `الهاتف: ${order.customer.phone}`,
    `العنوان: ${addressParts.join(" — ")}`,
  ];

  if (order.delivery.notes?.trim()) {
    parts.push(`ملاحظات التوصيل: ${order.delivery.notes.trim()}`);
  }

  parts.push("", "الأصناف:", ...lines, "");
  parts.push(`المجموع الفرعي: ${formatPriceIQD(order.pricing.subtotal)}`);
  parts.push(`التوصيل: ${formatPriceIQD(order.pricing.deliveryFee)}`);
  parts.push(`الإجمالي: ${formatPriceIQD(order.pricing.total)}`);
  parts.push(`الدفع: ${payment}`);
  parts.push("", "— أُرسل من تطبيق كلشي طيب");

  return parts.join("\n");
}

export function buildCustomerStatusWhatsAppText(input: {
  orderId: string;
  status: OrderStatus;
  customerName?: string;
}): { type: NotificationType; title: string; body: string; text: string } | null {
  const type = notificationTypeForOrderStatus(input.status);
  if (!type) return null;
  const { title, body } = buildOrderStatusMessage({
    type,
    orderId: input.orderId,
    customerName: input.customerName,
  });
  return { type, title, body, text: `${title}\n${body}` };
}

export function deeplinkIdempotencyKey(input: {
  orderId: string;
  type: NotificationType;
  audience: "kitchen" | "customer";
}): string {
  return `${input.orderId}:${input.type}:WHATSAPP:deeplink_${input.audience}`;
}
