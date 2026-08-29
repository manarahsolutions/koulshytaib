/**
 * Seed offers — adapted from Phase 5 mock offers (same titles/copy).
 * Not live restaurant promotions.
 */

import type { Offer } from "@/features/offers/types";

const SEED_AT = "2026-01-01T00:00:00.000Z";

export const SEED_OFFERS: Offer[] = [
  {
    id: "offer-mock-featured",
    title: "وجبة عائلية من بيتنا",
    description:
      "دولمة ومقبلات تكفي اللمّة — عرض تجريبي للواجهة فقط، بدون تسعير حي.",
    productIds: ["mock-dolma"],
    type: "percentage",
    discountPercent: 20,
    visible: true,
    active: true,
    featured: true,
    badge: "خصم 20%",
    expiresLabel: "ينتهي اليوم (تجريبي)",
    ctaLabel: "اطلب العرض",
    surface: "cream",
    sortOrder: 1,
    createdAt: SEED_AT,
    updatedAt: SEED_AT,
  },
  {
    id: "offer-mock-2",
    title: "تشريب + مشروب",
    description: "باقة غداء بسيطة — الربط بالمنتجات لاحقاً.",
    productIds: ["mock-tashreeb", "mock-laban"],
    type: "percentage",
    discountPercent: 20,
    visible: true,
    active: true,
    featured: false,
    badge: "باقة",
    expiresLabel: "متبقي 3 أيام (تجريبي)",
    ctaLabel: "شوف الباقة",
    surface: "navy",
    sortOrder: 2,
    createdAt: SEED_AT,
    updatedAt: SEED_AT,
  },
  {
    id: "offer-mock-3",
    title: "خصم على المقبلات",
    description: "خصم بمبلغ ثابت — محرك التسعير غير مفعّل بعد.",
    productIds: ["mock-kebbeh"],
    type: "fixed_price",
    offerPrice: 6500,
    originalPrice: 8000,
    visible: true,
    active: true,
    featured: false,
    badge: "خصم 1,500 د.ع",
    expiresLabel: "متبقي يومان (تجريبي)",
    ctaLabel: "شوف العرض",
    surface: "cream",
    sortOrder: 3,
    createdAt: SEED_AT,
    updatedAt: SEED_AT,
  },
];
