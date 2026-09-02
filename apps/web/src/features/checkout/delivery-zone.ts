/**
 * Delivery is Fallujah-only for now.
 * Stored on orders as governorate + area for admin/CRM compatibility.
 */

export const DELIVERY_CITY = "الفلوجة";
export const DELIVERY_GOVERNORATE = "الأنبار";
export const DELIVERY_AREA = DELIVERY_CITY;

/** Minimum characters for a usable precise street address. */
export const MIN_PRECISE_ADDRESS_LENGTH = 12;

export function isAllowedDeliveryZone(input: {
  governorate: string;
  area: string;
}): boolean {
  return (
    input.governorate.trim() === DELIVERY_GOVERNORATE &&
    input.area.trim() === DELIVERY_AREA
  );
}

export function isPreciseAddress(raw: string): boolean {
  return raw.trim().length >= MIN_PRECISE_ADDRESS_LENGTH;
}
