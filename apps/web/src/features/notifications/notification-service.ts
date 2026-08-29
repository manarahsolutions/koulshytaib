/**
 * Notification service — enqueue intents + dispatch via providers.
 * Does not embed WhatsApp/SMS SDKs. Mock never contacts real numbers.
 */

import "server-only";
import {
  dbCreateNotificationIdempotent,
  dbListNotificationsForOrder,
  dbMarkNotificationFailed,
  dbMarkNotificationSending,
  dbMarkNotificationSent,
  mapNotification,
} from "@/features/notifications/db-notification-repository";
import { getNotificationProvider } from "@/features/notifications/providers";
import {
  buildIdempotencyKey,
  buildOrderStatusMessage,
  notificationTypeForOrderStatus,
} from "@/features/notifications/templates";
import type {
  NotificationChannel,
  NotificationRecord,
} from "@/features/notifications/types";
import { prisma } from "@/lib/db/prisma";
import type { OrderStatus } from "@/types/order";

const DEFAULT_CHANNEL: NotificationChannel = "WHATSAPP";

function resolveDefaultChannel(): NotificationChannel {
  const raw = process.env.NOTIFICATION_DEFAULT_CHANNEL?.trim().toUpperCase();
  if (raw === "SMS") return "SMS";
  return DEFAULT_CHANNEL;
}

export type EnqueueOrderStatusNotificationInput = {
  orderId: string;
  customerId: string;
  status: OrderStatus;
  customerName?: string;
  /** Looked up by provider later — Mock does not use it to send */
  destinationPhone?: string;
  channel?: NotificationChannel;
};

/**
 * Create idempotent notification for an order status, then attempt delivery.
 * Safe to call twice for the same order+status+channel.
 */
export async function enqueueAndDispatchOrderStatusNotification(
  input: EnqueueOrderStatusNotificationInput,
): Promise<NotificationRecord | null> {
  const type = notificationTypeForOrderStatus(input.status);
  if (!type) return null;

  const channel = input.channel ?? resolveDefaultChannel();
  const { title, body } = buildOrderStatusMessage({
    type,
    orderId: input.orderId,
    customerName: input.customerName,
  });
  const idempotencyKey = buildIdempotencyKey({
    orderId: input.orderId,
    type,
    channel,
  });

  const provider = getNotificationProvider(channel);
  const { record, created } = await dbCreateNotificationIdempotent({
    customerId: input.customerId,
    orderId: input.orderId,
    channel,
    type,
    title,
    body,
    idempotencyKey,
    provider: provider.id,
  });

  if (!created) {
    if (record.status === "SENT" || record.status === "SENDING") {
      return record;
    }
    if (record.status === "PENDING" || record.status === "FAILED") {
      return dispatchNotification(record, input.destinationPhone);
    }
    return record;
  }

  return dispatchNotification(record, input.destinationPhone);
}

async function dispatchNotification(
  record: NotificationRecord,
  destinationPhone?: string,
): Promise<NotificationRecord> {
  if (record.status === "SENT") return record;

  const sending = await dbMarkNotificationSending(record.id);
  const provider = getNotificationProvider(sending.channel);

  try {
    const result = await provider.send({
      notification: sending,
      destinationPhone,
    });
    if (!result.ok) {
      return dbMarkNotificationFailed(sending.id, result.error);
    }
    return dbMarkNotificationSent(sending.id);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "provider_error";
    return dbMarkNotificationFailed(sending.id, message);
  }
}

/**
 * Retry foundation for FAILED / PENDING notifications.
 */
export async function retryNotification(
  id: string,
  destinationPhone?: string,
): Promise<NotificationRecord | null> {
  const row = await prisma.notification.findUnique({ where: { id } });
  if (!row) return null;
  if (row.status === "SENT") return mapNotification(row);

  const pending = await prisma.notification.update({
    where: { id },
    data: { status: "PENDING", lastError: null },
  });
  return dispatchNotification(mapNotification(pending), destinationPhone);
}

export { dbListNotificationsForOrder };
