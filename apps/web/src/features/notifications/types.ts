/**
 * Notification domain types (Phase 20).
 * Outbound intents only — providers deliver later.
 */

export type NotificationChannel = "WHATSAPP" | "SMS";

export type NotificationType =
  | "ORDER_RECEIVED"
  | "ORDER_CONFIRMED"
  | "ORDER_PREPARING"
  | "ORDER_OUT_FOR_DELIVERY"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED";

export type NotificationDeliveryStatus =
  | "PENDING"
  | "SENDING"
  | "SENT"
  | "FAILED";

export type NotificationRecord = {
  id: string;
  customerId?: string;
  orderId?: string;
  channel: NotificationChannel;
  type: NotificationType;
  status: NotificationDeliveryStatus;
  title: string;
  body: string;
  idempotencyKey: string;
  attempts: number;
  lastError?: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  failedAt?: string;
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  ORDER_RECEIVED: "استلام الطلب",
  ORDER_CONFIRMED: "تأكيد الطلب",
  ORDER_PREPARING: "بدء التحضير",
  ORDER_OUT_FOR_DELIVERY: "خرج للتوصيل",
  ORDER_DELIVERED: "تم التوصيل",
  ORDER_CANCELLED: "إلغاء الطلب",
};

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> =
  {
    WHATSAPP: "واتساب",
    SMS: "رسالة نصية",
  };

export const NOTIFICATION_STATUS_LABELS: Record<
  NotificationDeliveryStatus,
  string
> = {
  PENDING: "بانتظار الإرسال",
  SENDING: "جارٍ الإرسال",
  SENT: "تم الإرسال",
  FAILED: "فشل",
};
