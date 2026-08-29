/**
 * Compatibility facade — Homepage reads shared OfferRepository.
 */

import {
  getCustomerOffers,
  getFeaturedOffer,
  getSecondaryOffers,
} from "@/features/offers/selectors";
import { listOffers } from "@/features/offers/offer-repository";
import type { Offer } from "@/features/offers/types";

export function getHomeOffers(): Offer[] {
  return getCustomerOffers().map((v) => v.offer);
}

/** Eager snapshot for server components (seed at request/build). */
export const MOCK_OFFERS: Offer[] = listOffers();

export {
  getCustomerOffers,
  getFeaturedOffer,
  getSecondaryOffers,
  listOffers,
};
