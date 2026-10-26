/**
 * In-memory offer repository — shared Customer + Admin source.
 */

import { SEED_OFFERS } from "@/features/offers/seed-offers";
import type {
  CreateOfferInput,
  Offer,
  UpdateOfferInput,
} from "@/features/offers/types";
import { getProductById } from "@/features/products/product-repository";
import { createOpaqueId } from "@/lib/id";

const byId = new Map<string, Offer>();
const listeners = new Set<() => void>();
let snapshot: Offer[] = [];
let seeded = false;

function sortOffers(a: Offer, b: Offer): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "ar");
}

function rebuild(): void {
  snapshot = Array.from(byId.values()).sort(sortOffers);
}

function emit(): void {
  rebuild();
  listeners.forEach((l) => l());
}

export function ensureOffersSeeded(): void {
  if (seeded) return;
  for (const offer of SEED_OFFERS) {
    byId.set(offer.id, { ...offer, productIds: [...offer.productIds] });
  }
  seeded = true;
  rebuild();
}

/** Replace in-memory offers from DB hydrate (client cache). */
export function replaceOffersFromServer(offers: Offer[]): void {
  byId.clear();
  for (const offer of offers) {
    byId.set(offer.id, { ...offer, productIds: [...offer.productIds] });
  }
  seeded = true;
  emit();
}

/** Upsert one offer into the client cache after a DB mutation. */
export function upsertOfferInCache(offer: Offer): void {
  byId.set(offer.id, { ...offer, productIds: [...offer.productIds] });
  seeded = true;
  emit();
}

/** Drop one offer from the client cache (after a DB delete, or in-memory). */
export function removeOfferFromCache(id: string): void {
  ensureOffersSeeded();
  if (byId.delete(id)) emit();
}

export function subscribeOffers(onChange: () => void): () => void {
  ensureOffersSeeded();
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getOffersSnapshot(): Offer[] {
  ensureOffersSeeded();
  return snapshot;
}

export function listOffers(): Offer[] {
  ensureOffersSeeded();
  return Array.from(byId.values()).sort(sortOffers);
}

export function getOfferById(id: string): Offer | undefined {
  ensureOffersSeeded();
  return byId.get(id);
}

function assertPricing(input: {
  type: Offer["type"];
  productIds: string[];
  discountPercent?: number;
  offerPrice?: number;
  originalPrice?: number;
}): void {
  const productIds = input.productIds
    .map((id) => id.trim())
    .filter(Boolean);
  if (productIds.length === 0) {
    throw new Error("OFFER_REQUIRES_PRODUCT");
  }

  for (const id of productIds) {
    if (!getProductById(id)) throw new Error("PRODUCT_NOT_FOUND");
  }

  if (input.type === "fixed_price") {
    if (productIds.length !== 1) {
      throw new Error("FIXED_PRICE_SINGLE_PRODUCT");
    }
    const offerPrice = input.offerPrice;
    if (
      offerPrice == null ||
      !Number.isInteger(offerPrice) ||
      offerPrice <= 0
    ) {
      throw new Error("INVALID_OFFER_PRICE");
    }
    const product = getProductById(productIds[0]!)!;
    const baseline =
      input.originalPrice != null && Number.isInteger(input.originalPrice)
        ? input.originalPrice
        : product.price;
    if (baseline <= 0 || !Number.isInteger(baseline)) {
      throw new Error("INVALID_ORIGINAL_PRICE");
    }
    if (offerPrice > baseline) {
      throw new Error("OFFER_PRICE_TOO_HIGH");
    }
  } else {
    const percent = input.discountPercent;
    if (
      percent == null ||
      !Number.isInteger(percent) ||
      percent <= 0 ||
      percent > 100
    ) {
      throw new Error("INVALID_PERCENT");
    }
  }
}

function demoteOtherFeatured(exceptId: string): void {
  for (const [id, offer] of byId) {
    if (id !== exceptId && offer.featured) {
      byId.set(id, {
        ...offer,
        featured: false,
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

export function createOffer(input: CreateOfferInput): Offer {
  ensureOffersSeeded();
  const title = input.title.trim();
  if (!title) throw new Error("INVALID_OFFER_TITLE");

  const productIds = [...new Set(input.productIds.map((id) => id.trim()))];
  assertPricing({
    type: input.type,
    productIds,
    discountPercent: input.discountPercent,
    offerPrice: input.offerPrice,
    originalPrice: input.originalPrice,
  });

  const now = new Date().toISOString();
  const maxOrder = listOffers().reduce(
    (max, o) => Math.max(max, o.sortOrder),
    0,
  );
  const id = createOpaqueId("offer");
  const featured = input.featured ?? false;

  const offer: Offer = {
    id,
    title,
    description: input.description?.trim() || undefined,
    productIds,
    type: input.type,
    discountPercent:
      input.type === "percentage" ? input.discountPercent : undefined,
    offerPrice: input.type === "fixed_price" ? input.offerPrice : undefined,
    originalPrice:
      input.type === "fixed_price" ? input.originalPrice : undefined,
    visible: input.visible ?? true,
    active: input.active ?? true,
    featured,
    badge: input.badge?.trim() || undefined,
    imageSrc: input.imageSrc?.trim() || undefined,
    ctaLabel: input.ctaLabel?.trim() || "اطلب العرض",
    surface: input.surface ?? "cream",
    expiresLabel: input.expiresLabel?.trim() || undefined,
    sortOrder: input.sortOrder ?? maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  if (featured) demoteOtherFeatured(id);
  byId.set(id, offer);
  emit();
  return offer;
}

export function updateOffer(id: string, input: UpdateOfferInput): Offer {
  ensureOffersSeeded();
  const existing = byId.get(id);
  if (!existing) throw new Error("OFFER_NOT_FOUND");

  const title =
    input.title !== undefined ? input.title.trim() : existing.title;
  if (!title) throw new Error("INVALID_OFFER_TITLE");

  const type = input.type ?? existing.type;
  const productIds =
    input.productIds !== undefined
      ? [...new Set(input.productIds.map((p) => p.trim()).filter(Boolean))]
      : existing.productIds;

  const discountPercent =
    input.discountPercent !== undefined
      ? input.discountPercent
      : existing.discountPercent;
  const offerPrice =
    input.offerPrice !== undefined ? input.offerPrice : existing.offerPrice;
  const originalPrice =
    input.originalPrice !== undefined
      ? input.originalPrice
      : existing.originalPrice;

  assertPricing({
    type,
    productIds,
    discountPercent,
    offerPrice,
    originalPrice,
  });

  const featured = input.featured ?? existing.featured;
  if (featured) demoteOtherFeatured(id);

  const next: Offer = {
    ...existing,
    title,
    description:
      input.description !== undefined
        ? input.description.trim() || undefined
        : existing.description,
    productIds,
    type,
    discountPercent: type === "percentage" ? discountPercent : undefined,
    offerPrice: type === "fixed_price" ? offerPrice : undefined,
    originalPrice: type === "fixed_price" ? originalPrice : undefined,
    visible: input.visible ?? existing.visible,
    active: input.active ?? existing.active,
    featured,
    badge:
      input.badge !== undefined
        ? input.badge.trim() || undefined
        : existing.badge,
    imageSrc:
      input.imageSrc !== undefined
        ? input.imageSrc.trim() || undefined
        : existing.imageSrc,
    ctaLabel:
      input.ctaLabel !== undefined
        ? input.ctaLabel.trim() || existing.ctaLabel
        : existing.ctaLabel,
    surface: input.surface ?? existing.surface,
    expiresLabel:
      input.expiresLabel !== undefined
        ? input.expiresLabel.trim() || undefined
        : existing.expiresLabel,
    sortOrder: input.sortOrder ?? existing.sortOrder,
    updatedAt: new Date().toISOString(),
  };

  byId.set(id, next);
  emit();
  return next;
}

export function moveOffer(id: string, direction: "up" | "down"): Offer {
  ensureOffersSeeded();
  const ordered = listOffers();
  const index = ordered.findIndex((o) => o.id === id);
  if (index < 0) throw new Error("OFFER_NOT_FOUND");
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= ordered.length) {
    return ordered[index]!;
  }

  const a = ordered[index]!;
  const b = ordered[swapWith]!;
  const now = new Date().toISOString();
  byId.set(a.id, { ...a, sortOrder: b.sortOrder, updatedAt: now });
  byId.set(b.id, { ...b, sortOrder: a.sortOrder, updatedAt: now });
  emit();
  return getOfferById(id)!;
}

export function reorderOffers(orderedIds: string[]): Offer[] {
  ensureOffersSeeded();
  const current = listOffers();
  const currentIds = new Set(current.map((o) => o.id));
  if (
    orderedIds.length !== current.length ||
    orderedIds.some((id) => !currentIds.has(id))
  ) {
    throw new Error("OFFER_REORDER_INVALID");
  }
  const now = new Date().toISOString();
  orderedIds.forEach((id, index) => {
    const existing = byId.get(id);
    if (!existing) return;
    byId.set(id, { ...existing, sortOrder: index + 1, updatedAt: now });
  });
  emit();
  return listOffers();
}

export const offerRepository = {
  list: listOffers,
  getById: getOfferById,
  create: createOffer,
  update: updateOffer,
  move: moveOffer,
  reorder: reorderOffers,
};
