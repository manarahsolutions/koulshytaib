/**
 * Pure offer pricing helpers — integer IQD only.
 */

import type { Offer, OfferType } from "@/features/offers/types";

/** Round to nearest IQD (integer). .5 rounds away from zero (typical half-up for positives). */
export function roundIqd(amount: number): number {
  return Math.round(amount);
}

export function calculatePercentageOfferPrice(
  catalogPrice: number,
  discountPercent: number,
): number {
  if (!Number.isInteger(catalogPrice) || catalogPrice <= 0) {
    throw new Error("INVALID_CATALOG_PRICE");
  }
  if (
    !Number.isInteger(discountPercent) ||
    discountPercent <= 0 ||
    discountPercent > 100
  ) {
    throw new Error("INVALID_PERCENT");
  }
  return roundIqd(catalogPrice * (1 - discountPercent / 100));
}

export function calculateSaving(
  originalPrice: number,
  offerPrice: number,
): number {
  return Math.max(0, originalPrice - offerPrice);
}

export type ResolvedOfferPricing = {
  offerPrice: number;
  originalPrice: number;
  saving: number;
  discountLabel: string;
};

/**
 * Resolve customer-facing prices for an offer + a primary catalog price.
 * - fixed_price: uses configured offerPrice (and originalPrice or catalog)
 * - percentage: derives from current catalog price
 */
export function resolveOfferPricing(
  offer: Pick<
    Offer,
    "type" | "discountPercent" | "offerPrice" | "originalPrice" | "badge"
  >,
  catalogPrice: number,
): ResolvedOfferPricing | null {
  if (offer.type === "fixed_price") {
    const offerPrice = offer.offerPrice;
    if (offerPrice == null || !Number.isInteger(offerPrice) || offerPrice <= 0) {
      return null;
    }
    const originalPrice =
      offer.originalPrice && offer.originalPrice > offerPrice
        ? offer.originalPrice
        : catalogPrice > offerPrice
          ? catalogPrice
          : offerPrice;
    const saving = calculateSaving(originalPrice, offerPrice);
    return {
      offerPrice,
      originalPrice,
      saving,
      discountLabel:
        offer.badge?.trim() ||
        (saving > 0 ? `وفّر ${saving.toLocaleString("en-IQ")} د.ع` : "عرض"),
    };
  }

  const percent = offer.discountPercent;
  if (percent == null) return null;
  try {
    const offerPrice = calculatePercentageOfferPrice(catalogPrice, percent);
    const saving = calculateSaving(catalogPrice, offerPrice);
    return {
      offerPrice,
      originalPrice: catalogPrice,
      saving,
      discountLabel: offer.badge?.trim() || `خصم ${percent}%`,
    };
  } catch {
    return null;
  }
}

export function offerTypeLabel(type: OfferType): string {
  return type === "fixed_price" ? "سعر ثابت" : "نسبة مئوية";
}
