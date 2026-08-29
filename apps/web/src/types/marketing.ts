/**
 * Marketing domain types — reels remain here; offers live in features/offers.
 */

export type Reel = {
  id: string;
  title: string;
  thumbnail?: string;
  mediaUrl?: string;
  /** Display-only duration label, e.g. "0:24" */
  duration?: string;
  /** Omit until a real Instagram URL is provided */
  instagramUrl?: string;
  productId?: string;
  label?: string;
};

export type {
  Offer,
  OfferType,
  OfferSurface,
  CreateOfferInput,
  UpdateOfferInput,
  OfferKind,
} from "@/features/offers/types";
