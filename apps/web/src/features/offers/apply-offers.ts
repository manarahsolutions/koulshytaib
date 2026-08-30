/**
 * Apply active offers to cart/checkout lines — pure helpers.
 * Best price for the customer wins when multiple offers overlap.
 */

import {
  calculatePercentageOfferPrice,
  resolveOfferPricing,
} from "@/features/offers/pricing";
import type { Offer } from "@/features/offers/types";

export type PricedLineInput = {
  productId: string;
  catalogUnitPrice: number;
  quantity: number;
  name?: string;
};

export type PricedLineResult = {
  productId: string;
  catalogUnitPrice: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  offerId?: string;
  offerTitle?: string;
  savedPerUnit: number;
};

function unitPriceForOffer(
  catalogUnitPrice: number,
  offer: Offer,
): number | null {
  if (offer.type === "fixed_price") {
    const resolved = resolveOfferPricing(offer, catalogUnitPrice);
    return resolved?.offerPrice ?? null;
  }
  if (offer.type === "percentage" && offer.discountPercent != null) {
    try {
      return calculatePercentageOfferPrice(
        catalogUnitPrice,
        offer.discountPercent,
      );
    } catch {
      return null;
    }
  }
  return null;
}

/** Active + visible offers only. */
export function selectApplicableOffers(offers: Offer[]): Offer[] {
  return offers.filter((o) => o.active && o.visible);
}

/**
 * For each line, pick the lowest unit price among applicable offers (or catalog).
 */
export function applyOffersToLines(
  lines: PricedLineInput[],
  offers: Offer[],
): PricedLineResult[] {
  const applicable = selectApplicableOffers(offers);

  return lines.map((line) => {
    const catalog = Math.max(0, Math.trunc(line.catalogUnitPrice));
    const qty = Math.max(1, Math.trunc(line.quantity));
    let bestUnit = catalog;
    let bestOffer: Offer | undefined;

    for (const offer of applicable) {
      if (!offer.productIds.includes(line.productId)) continue;
      const offered = unitPriceForOffer(catalog, offer);
      if (offered == null || offered <= 0) continue;
      if (offered < bestUnit) {
        bestUnit = offered;
        bestOffer = offer;
      }
    }

    return {
      productId: line.productId,
      catalogUnitPrice: catalog,
      unitPrice: bestUnit,
      quantity: qty,
      lineTotal: bestUnit * qty,
      offerId: bestOffer?.id,
      offerTitle: bestOffer?.title,
      savedPerUnit: Math.max(0, catalog - bestUnit),
    };
  });
}

export function sumPricedLines(lines: PricedLineResult[]): number {
  return lines.reduce((sum, l) => sum + l.lineTotal, 0);
}
