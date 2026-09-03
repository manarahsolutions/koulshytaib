/**
 * Restaurant / delivery settings stored in AppConfig.settingsJson
 */

import "server-only";
import { prisma } from "@/lib/db/prisma";
import { DELIVERY_FEE_IQD } from "@/features/checkout/pricing";
import type { RestaurantSettings } from "@/features/settings/types";

export type { RestaurantSettings };

export const DEFAULT_SETTINGS: RestaurantSettings = {
  displayName: "كلشي طيب",
  kitchenPhone: "",
  kitchenWhatsappE164: "",
  hoursText: "يومياً 11:00 ص – 11:00 م",
  deliveryFeeIqd: DELIVERY_FEE_IQD,
};

export async function dbGetRestaurantSettings(): Promise<RestaurantSettings> {
  const row = await prisma.appConfig.findUnique({ where: { id: "default" } });
  if (!row?.settingsJson || typeof row.settingsJson !== "object") {
    return { ...DEFAULT_SETTINGS };
  }
  const raw = row.settingsJson as Partial<RestaurantSettings>;
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    deliveryFeeIqd:
      typeof raw.deliveryFeeIqd === "number" && raw.deliveryFeeIqd >= 0
        ? Math.trunc(raw.deliveryFeeIqd)
        : DEFAULT_SETTINGS.deliveryFeeIqd,
  };
}

export async function dbUpsertRestaurantSettings(
  patch: Partial<RestaurantSettings>,
): Promise<RestaurantSettings> {
  const current = await dbGetRestaurantSettings();
  const next: RestaurantSettings = {
    ...current,
    ...patch,
    deliveryFeeIqd:
      patch.deliveryFeeIqd != null
        ? Math.max(0, Math.trunc(patch.deliveryFeeIqd))
        : current.deliveryFeeIqd,
  };

  const existing = await prisma.appConfig.findUnique({
    where: { id: "default" },
  });
  if (!existing) {
    await prisma.appConfig.create({
      data: {
        id: "default",
        loyaltyJson: {},
        settingsJson: next,
      },
    });
  } else {
    await prisma.appConfig.update({
      where: { id: "default" },
      data: { settingsJson: next },
    });
  }
  return next;
}
