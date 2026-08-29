/**
 * Offer domain — Admin + Customer shared promotions (in-memory).
 * Presentation-only for cart/checkout in Phase 15.
 */

export type OfferType = "fixed_price" | "percentage";

export type OfferSurface = "cream" | "navy";

export type Offer = {
  id: string;
  title: string;
  description?: string;
  /** FK → Product.id — never store product names as the relationship */
  productIds: string[];
  type: OfferType;
  /**
   * Integer percent 1–100 when type === "percentage".
   * Authoritative discount for percentage offers.
   */
  discountPercent?: number;
  /**
   * Explicit IQD offer price when type === "fixed_price".
   * Authoritative for fixed offers (not rewritten when product price changes).
   */
  offerPrice?: number;
  /**
   * Optional baseline IQD for fixed-price display.
   * If omitted, Customer UI may fall back to the product’s current catalog price.
   */
  originalPrice?: number;
  /** Should customers see this offer? */
  visible: boolean;
  /** Is the promotion currently usable / eligible? */
  active: boolean;
  /** Homepage primary prominence (at most one) */
  featured: boolean;
  /** Short chip label, e.g. "خصم 20%" */
  badge?: string;
  imageSrc?: string;
  ctaLabel: string;
  surface?: OfferSurface;
  /**
   * Display-only copy from seed (not a live schedule).
   * No startsAt/endsAt in this phase.
   */
  expiresLabel?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateOfferInput = {
  title: string;
  description?: string;
  productIds: string[];
  type: OfferType;
  discountPercent?: number;
  offerPrice?: number;
  originalPrice?: number;
  visible?: boolean;
  active?: boolean;
  featured?: boolean;
  badge?: string;
  imageSrc?: string;
  ctaLabel?: string;
  surface?: OfferSurface;
  expiresLabel?: string;
  sortOrder?: number;
};

export type UpdateOfferInput = Partial<
  Omit<CreateOfferInput, "type"> & { type: OfferType }
>;

/** @deprecated Use OfferType — kept for old kind references during migration */
export type OfferKind = OfferType | "bundle" | "free_item" | "fixed" | "percentage";
