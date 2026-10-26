/**
 * Offer selectors — Customer eligibility + Admin lists.
 */

import {
  resolveOfferPricing,
  type ResolvedOfferPricing,
} from "@/features/offers/pricing";
import {
  getOfferById,
  listOffers,
} from "@/features/offers/offer-repository";
import {
  buildCustomerOfferViews,
  splitFeaturedOffer,
} from "@/features/offers/customer-offer-views";
import type { Offer } from "@/features/offers/types";
import { listCategories } from "@/features/products/category-repository";
import {
  getProductById,
  listProducts,
} from "@/features/products/product-repository";
import {
  isProductAvailable,
  isProductPubliclyBrowsable,
  normalizeArabicSearch,
} from "@/features/products/selectors";
import type { Product } from "@/types/catalog";

export type CustomerOfferView = {
  offer: Offer;
  pricing: ResolvedOfferPricing;
  /** Valid public + available products for this offer */
  products: Product[];
  href: string;
  discountLabel: string;
  price: number;
  oldPrice: number;
};

function resolveLinkedProducts(offer: Offer): {
  existing: Product[];
  missingIds: string[];
  orderable: Product[];
} {
  const existing: Product[] = [];
  const missingIds: string[] = [];
  for (const id of offer.productIds) {
    const product = getProductById(id);
    if (!product) missingIds.push(id);
    else existing.push(product);
  }
  const orderable = existing.filter(
    (p) => isProductPubliclyBrowsable(p) && isProductAvailable(p),
  );
  return { existing, missingIds, orderable };
}

export function getOfferCtaHref(productIds: string[]): string {
  if (productIds.length === 1) return `/product/${productIds[0]}`;
  return "/menu";
}

/** Customer-facing eligibility: visible + active + ≥1 orderable product. */
export function isCustomerEligibleOffer(offer: Offer): boolean {
  if (!offer.visible || !offer.active) return false;
  const { orderable } = resolveLinkedProducts(offer);
  if (orderable.length === 0) return false;

  const primary = orderable[0]!;
  const pricing = resolveOfferPricing(offer, primary.price);
  return pricing != null;
}

export function toCustomerOfferView(offer: Offer): CustomerOfferView | null {
  if (!isCustomerEligibleOffer(offer)) return null;
  const { orderable } = resolveLinkedProducts(offer);
  const primary = orderable[0]!;
  const pricing = resolveOfferPricing(offer, primary.price);
  if (!pricing) return null;

  return {
    offer,
    pricing,
    products: orderable,
    href: getOfferCtaHref(orderable.map((p) => p.id)),
    discountLabel: pricing.discountLabel,
    price: pricing.offerPrice,
    oldPrice: pricing.originalPrice,
  };
}

export function getVisibleOffers(): Offer[] {
  return listOffers().filter((o) => o.visible);
}

export function getActiveOffers(): Offer[] {
  return listOffers().filter((o) => o.active);
}

export function getCustomerOffers(): CustomerOfferView[] {
  return buildCustomerOfferViews(
    listOffers(),
    listProducts(),
    listCategories(),
  );
}

export function getFeaturedOffer(): CustomerOfferView | null {
  return splitFeaturedOffer(getCustomerOffers()).featured;
}

export function getSecondaryOffers(): CustomerOfferView[] {
  return splitFeaturedOffer(getCustomerOffers()).secondary;
}

export function getOffersByProduct(productId: string): Offer[] {
  return listOffers().filter((o) => o.productIds.includes(productId));
}

export type OfferListFilter =
  | "all"
  | "active"
  | "inactive"
  | "visible"
  | "hidden"
  | "featured"
  | "fixed_price"
  | "percentage";

export function filterAdminOffers(input: {
  offers?: Offer[];
  query?: string;
  status?: OfferListFilter;
}): Offer[] {
  const offers = input.offers ?? listOffers();
  const q = normalizeArabicSearch(input.query ?? "");
  const status = input.status ?? "all";

  return offers.filter((offer) => {
    if (status === "active" && !offer.active) return false;
    if (status === "inactive" && offer.active) return false;
    if (status === "visible" && !offer.visible) return false;
    if (status === "hidden" && offer.visible) return false;
    if (status === "featured" && !offer.featured) return false;
    if (status === "fixed_price" && offer.type !== "fixed_price") return false;
    if (status === "percentage" && offer.type !== "percentage") return false;

    if (!q) return true;
    const haystack = normalizeArabicSearch(
      `${offer.title} ${offer.description ?? ""} ${offer.badge ?? ""}`,
    );
    return haystack.includes(q);
  });
}

export function searchOffers(query: string): Offer[] {
  return filterAdminOffers({ query });
}

export function getOfferProductWarnings(offer: Offer): string[] {
  const { missingIds, existing } = resolveLinkedProducts(offer);
  const warnings: string[] = [];
  if (offer.productIds.length === 0) {
    warnings.push("العرض غير مربوط بأي منتج — ما يظهر للزبون لحد ما تختار منتج");
  }
  if (missingIds.length > 0) {
    warnings.push("يوجد منتج مرتبط غير موجود");
  }
  const hidden = existing.filter((p) => !isProductPubliclyBrowsable(p));
  if (hidden.length > 0 && hidden.length === existing.length) {
    warnings.push("كل المنتجات المرتبطة مخفية عن الزبون");
  }
  const unavailable = existing.filter((p) => !isProductAvailable(p));
  if (unavailable.length === existing.length && existing.length > 0) {
    warnings.push("كل المنتجات المرتبطة غير متوفرة للطلب");
  }
  return warnings;
}

export function getOfferProductNames(offer: Offer): string[] {
  return offer.productIds.map((id) => getProductById(id)?.name ?? "—");
}

export { getOfferById, resolveLinkedProducts };
