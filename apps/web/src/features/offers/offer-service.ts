/**
 * Offer service — Admin mutations over OfferRepository.
 */

import {
  createOffer as repoCreateOffer,
  getOfferById,
  listOffers,
  moveOffer as repoMoveOffer,
  removeOfferFromCache,
  reorderOffers as repoReorderOffers,
  updateOffer as repoUpdateOffer,
} from "@/features/offers/offer-repository";
import type {
  CreateOfferInput,
  Offer,
  UpdateOfferInput,
} from "@/features/offers/types";

export type OfferResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

const MESSAGES: Record<string, string> = {
  INVALID_OFFER_TITLE: "اكتب عنوان العرض",
  OFFER_REQUIRES_PRODUCT: "اختار منتج واحد على الأقل",
  FIXED_PRICE_SINGLE_PRODUCT:
    "العرض بسعر ثابت يلزم منتج واحد فقط — استخدم نسبة مئوية لأكثر من منتج",
  INVALID_OFFER_PRICE: "سعر العرض لازم يكون رقم صحيح أكبر من صفر",
  INVALID_ORIGINAL_PRICE: "السعر الأصلي غير صالح",
  OFFER_PRICE_TOO_HIGH: "سعر العرض ما يصير أعلى من سعر المنتج",
  INVALID_PERCENT: "النسبة لازم تكون بين 1 و 100",
  PRODUCT_NOT_FOUND: "يوجد منتج مرتبط غير موجود",
  OFFER_NOT_FOUND: "ما لكينا هذا العرض",
};

function fail(code: string): OfferResult<never> {
  return {
    ok: false,
    code,
    message: MESSAGES[code] ?? "صار خطأ، حاول مرة ثانية.",
  };
}

function wrap<T>(fn: () => T): OfferResult<T> {
  try {
    return { ok: true, data: fn() };
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    return fail(code);
  }
}

export function createOffer(input: CreateOfferInput): OfferResult<Offer> {
  return wrap(() => repoCreateOffer(input));
}

export function updateOffer(
  id: string,
  input: UpdateOfferInput,
): OfferResult<Offer> {
  return wrap(() => repoUpdateOffer(id, input));
}

export function setOfferVisibility(
  id: string,
  visible: boolean,
): OfferResult<Offer> {
  return updateOffer(id, { visible });
}

export function setOfferActive(
  id: string,
  active: boolean,
): OfferResult<Offer> {
  return updateOffer(id, { active });
}

export function setOfferFeatured(
  id: string,
  featured: boolean,
): OfferResult<Offer> {
  return updateOffer(id, { featured });
}

export function moveOffer(
  id: string,
  direction: "up" | "down",
): OfferResult<Offer> {
  return wrap(() => repoMoveOffer(id, direction));
}

export function reorderOffers(orderedIds: string[]): OfferResult<Offer[]> {
  return wrap(() => repoReorderOffers(orderedIds));
}

export function deleteOffer(id: string): OfferResult<{ id: string }> {
  return wrap(() => {
    if (!getOfferById(id)) throw new Error("OFFER_NOT_FOUND");
    removeOfferFromCache(id);
    return { id };
  });
}

export { getOfferById, listOffers };
