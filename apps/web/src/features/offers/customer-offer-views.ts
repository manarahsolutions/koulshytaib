/**
 * Customer-facing offer views from explicit data, so server pages can build
 * them from Postgres rows and client hooks from the in-memory cache alike.
 */

import { resolveOfferPricing } from "@/features/offers/pricing";
import type { Offer } from "@/features/offers/types";
import type { Category, Product } from "@/types/catalog";
import type { CustomerOfferView } from "@/features/offers/selectors";

function offerCtaHref(productIds: string[]): string {
  if (productIds.length === 1) return `/product/${productIds[0]}`;
  return "/menu";
}

/** Eligible = visible + active + ≥1 visible, available product in a visible category. */
export function buildCustomerOfferViews(
  offers: Offer[],
  products: Product[],
  categories: Category[],
): CustomerOfferView[] {
  const productById = new Map(products.map((p) => [p.id, p]));
  const visibleCategoryIds = new Set(
    categories.filter((c) => c.visible !== false).map((c) => c.id),
  );

  const views: CustomerOfferView[] = [];
  for (const offer of offers) {
    if (!offer.visible || !offer.active) continue;
    const orderable = offer.productIds
      .map((id) => productById.get(id))
      .filter(
        (p): p is Product =>
          Boolean(
            p &&
              p.visible !== false &&
              p.available !== false &&
              visibleCategoryIds.has(p.categoryId),
          ),
      );
    const primary = orderable[0];
    if (!primary) continue;
    const pricing = resolveOfferPricing(offer, primary.price);
    if (!pricing) continue;
    views.push({
      offer,
      pricing,
      products: orderable,
      href: offerCtaHref(orderable.map((p) => p.id)),
      discountLabel: pricing.discountLabel,
      price: pricing.offerPrice,
      oldPrice: pricing.originalPrice,
    });
  }
  return views;
}

/** Featured view (or the first eligible) + the rest, in list order. */
export function splitFeaturedOffer(views: CustomerOfferView[]): {
  featured: CustomerOfferView | null;
  secondary: CustomerOfferView[];
} {
  const featured = views.find((v) => v.offer.featured) ?? views[0] ?? null;
  return {
    featured,
    secondary: featured
      ? views.filter((v) => v.offer.id !== featured.offer.id)
      : [],
  };
}
