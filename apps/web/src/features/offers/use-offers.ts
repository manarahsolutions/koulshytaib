"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getOffersSnapshot,
  subscribeOffers,
} from "@/features/offers/offer-repository";
import {
  filterAdminOffers,
  getCustomerOffers,
  getFeaturedOffer,
  getSecondaryOffers,
  type OfferListFilter,
} from "@/features/offers/selectors";
import type { Offer } from "@/features/offers/types";
import {
  getProductsSnapshot,
  subscribeProducts,
} from "@/features/products/product-repository";

const EMPTY: Offer[] = [];

function subscribeOffersAndProducts(onChange: () => void): () => void {
  const a = subscribeOffers(onChange);
  const b = subscribeProducts(onChange);
  return () => {
    a();
    b();
  };
}

function getRevision(): string {
  const offers = getOffersSnapshot();
  const products = getProductsSnapshot();
  return [
    offers.map((o) => `${o.id}:${o.updatedAt}:${o.featured}`).join("|"),
    products.map((p) => `${p.id}:${p.updatedAt}:${p.available}:${p.visible}`).join("|"),
  ].join("::");
}

export function useOffersRevision(): string {
  return useSyncExternalStore(
    subscribeOffersAndProducts,
    getRevision,
    () => "0",
  );
}

export function useOffers(): Offer[] {
  return useSyncExternalStore(subscribeOffers, getOffersSnapshot, () => EMPTY);
}

export function useAdminOfferList(input: {
  query: string;
  status: OfferListFilter;
}): Offer[] {
  const revision = useOffersRevision();
  return useMemo(
    () => filterAdminOffers({ query: input.query, status: input.status }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.query, input.status, revision],
  );
}

export function useCustomerOfferViews() {
  const revision = useOffersRevision();
  return useMemo(
    () => ({
      featured: getFeaturedOffer(),
      secondary: getSecondaryOffers(),
      all: getCustomerOffers(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revision],
  );
}
