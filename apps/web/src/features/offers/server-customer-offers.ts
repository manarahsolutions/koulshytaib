/**
 * Customer offer views for server pages — Postgres when configured,
 * otherwise the in-memory seed catalog.
 */

import "server-only";
import {
  buildCustomerOfferViews,
  splitFeaturedOffer,
} from "@/features/offers/customer-offer-views";
import { dbListOffers } from "@/features/offers/db-offer-repository";
import { getCustomerOffers } from "@/features/offers/selectors";
import {
  dbListCategories,
  dbListProducts,
} from "@/features/products/db-catalog-repository";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import type { CustomerOfferView } from "@/features/offers/selectors";
import type { Category, Product } from "@/types/catalog";

export async function loadCustomerOffers(catalog?: {
  categories: Category[];
  products: Product[];
}): Promise<{
  all: CustomerOfferView[];
  featured: CustomerOfferView | null;
  secondary: CustomerOfferView[];
}> {
  let all: CustomerOfferView[];
  if (isDatabaseConfigured()) {
    try {
      const [offers, categories, products] = await Promise.all([
        dbListOffers(),
        catalog ? catalog.categories : dbListCategories(),
        catalog ? catalog.products : dbListProducts(),
      ]);
      all = buildCustomerOfferViews(offers, products, categories);
    } catch {
      // Never fall back to seed offers here: they would advertise demo deals.
      all = [];
    }
  } else {
    all = getCustomerOffers();
  }
  return { all, ...splitFeaturedOffer(all) };
}
