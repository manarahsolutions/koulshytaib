/**
 * Provider abstraction — Phase 20 ships Mock only.
 * Never send to real phone numbers from MockProvider.
 */

import "server-only";
import type {
  NotificationChannel,
  NotificationRecord,
} from "@/features/notifications/types";

export type ProviderSendInput = {
  notification: NotificationRecord;
  /** Destination exists for future providers — Mock must not dial/SMS it */
  destinationPhone?: string;
};

export type ProviderSendResult =
  | { ok: true; providerMessageId?: string }
  | { ok: false; error: string };

export type NotificationProvider = {
  readonly id: string;
  readonly channel: NotificationChannel;
  send: (input: ProviderSendInput) => Promise<ProviderSendResult>;
};

/**
 * Development provider: records intent without contacting any network.
 * Logs only non-sensitive fields (no phone).
 */
export function createMockProvider(
  channel: NotificationChannel,
): NotificationProvider {
  return {
    id: "mock",
    channel,
    async send(input) {
      console.info(
        `[notifications:mock:${channel}]`,
        JSON.stringify({
          id: input.notification.id,
          type: input.notification.type,
          orderId: input.notification.orderId ?? null,
          title: input.notification.title,
        }),
      );
      return { ok: true, providerMessageId: `mock_${input.notification.id}` };
    },
  };
}

export function getNotificationProvider(
  channel: NotificationChannel,
): NotificationProvider {
  // Phase 20: mock only. Future: switch on NOTIFICATION_PROVIDER env.
  const mode = process.env.NOTIFICATION_PROVIDER?.trim().toLowerCase();
  if (mode && mode !== "mock") {
    console.warn(
      `[notifications] Unsupported provider "${mode}" — falling back to mock`,
    );
  }
  return createMockProvider(channel);
}
