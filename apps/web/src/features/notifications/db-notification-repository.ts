/**
 * Notification persistence (server-only).
 */

import "server-only";
import type {
  Notification as DbNotification,
  NotificationChannel as DbChannel,
  NotificationDeliveryStatus as DbStatus,
  NotificationType as DbType,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { createOpaqueId } from "@/lib/id";
import type {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationRecord,
  NotificationType,
} from "@/features/notifications/types";

export function mapNotification(row: DbNotification): NotificationRecord {
  return {
    id: row.id,
    customerId: row.customerId ?? undefined,
    orderId: row.orderId ?? undefined,
    channel: row.channel as NotificationChannel,
    type: row.type as NotificationType,
    status: row.status as NotificationDeliveryStatus,
    title: row.title,
    body: row.body,
    idempotencyKey: row.idempotencyKey,
    attempts: row.attempts,
    lastError: row.lastError ?? undefined,
    provider: row.provider,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    sentAt: row.sentAt?.toISOString(),
    failedAt: row.failedAt?.toISOString(),
  };
}

export async function dbListNotificationsForOrder(
  orderId: string,
): Promise<NotificationRecord[]> {
  const rows = await prisma.notification.findMany({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapNotification);
}

export type CreateNotificationInput = {
  customerId?: string;
  orderId?: string;
  channel: NotificationChannel;
  type: NotificationType;
  title: string;
  body: string;
  idempotencyKey: string;
  provider?: string;
};

/**
 * Idempotent create: returns existing row if key already present.
 */
export async function dbCreateNotificationIdempotent(
  input: CreateNotificationInput,
): Promise<{ record: NotificationRecord; created: boolean }> {
  const existing = await prisma.notification.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });
  if (existing) {
    return { record: mapNotification(existing), created: false };
  }

  try {
    const row = await prisma.notification.create({
      data: {
        id: createOpaqueId("ntf"),
        customerId: input.customerId ?? null,
        orderId: input.orderId ?? null,
        channel: input.channel as DbChannel,
        type: input.type as DbType,
        status: "PENDING",
        title: input.title,
        body: input.body,
        idempotencyKey: input.idempotencyKey,
        provider: input.provider ?? "mock",
      },
    });
    return { record: mapNotification(row), created: true };
  } catch (error) {
    // Race: unique violation → return existing
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      const again = await prisma.notification.findUniqueOrThrow({
        where: { idempotencyKey: input.idempotencyKey },
      });
      return { record: mapNotification(again), created: false };
    }
    throw error;
  }
}

export async function dbMarkNotificationSending(
  id: string,
): Promise<NotificationRecord> {
  const row = await prisma.notification.update({
    where: { id },
    data: {
      status: "SENDING" as DbStatus,
      attempts: { increment: 1 },
      lastError: null,
    },
  });
  return mapNotification(row);
}

export async function dbMarkNotificationSent(
  id: string,
): Promise<NotificationRecord> {
  const row = await prisma.notification.update({
    where: { id },
    data: {
      status: "SENT" as DbStatus,
      sentAt: new Date(),
      failedAt: null,
      lastError: null,
    },
  });
  return mapNotification(row);
}

export async function dbMarkNotificationFailed(
  id: string,
  errorMessage: string,
): Promise<NotificationRecord> {
  const safe = errorMessage.replace(/\b07\d{9}\b/g, "[phone]").slice(0, 280);
  const row = await prisma.notification.update({
    where: { id },
    data: {
      status: "FAILED" as DbStatus,
      failedAt: new Date(),
      lastError: safe,
    },
  });
  return mapNotification(row);
}
