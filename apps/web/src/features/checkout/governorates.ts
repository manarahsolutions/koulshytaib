/**
 * @deprecated Delivery is Fallujah-only — use delivery-zone.ts.
 * Kept so older imports do not break during transition.
 */
export {
  DELIVERY_GOVERNORATE as IRAQ_GOVERNORATES_SINGLE,
} from "@/features/checkout/delivery-zone";

/** @deprecated Prefer delivery-zone constants. */
export const IRAQ_GOVERNORATES = ["الأنبار"] as const;

export type IraqGovernorate = (typeof IRAQ_GOVERNORATES)[number];
