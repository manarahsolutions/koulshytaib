/**
 * PostgreSQL-backed offer persistence (server-only).
 */

import "server-only";
import { BackendError } from "@/lib/db/errors";
import { mapOffer } from "@/lib/db/mappers";
import { interactiveTransactionOptions, prisma } from "@/lib/db/prisma";
import { createOpaqueId } from "@/lib/id";
import type {
  CreateOfferInput,
  Offer,
  UpdateOfferInput,
} from "@/features/offers/types";

async function assertPricing(input: {
  type: Offer["type"];
  productIds: string[];
  discountPercent?: number;
  offerPrice?: number;
  originalPrice?: number;
}): Promise<void> {
  const productIds = [...new Set(input.productIds.map((id) => id.trim()).filter(Boolean))];
  if (productIds.length === 0) {
    throw new BackendError("VALIDATION", "اختار منتج واحد على الأقل");
  }

  const found = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true },
  });
  if (found.length !== productIds.length) {
    throw new BackendError("NOT_FOUND", "يوجد منتج مرتبط غير موجود");
  }

  if (input.type === "fixed_price") {
    if (productIds.length !== 1) {
      throw new BackendError(
        "VALIDATION",
        "العرض بسعر ثابت يلزم منتج واحد فقط — استخدم نسبة مئوية لأكثر من منتج",
      );
    }
    const offerPrice = input.offerPrice;
    if (
      offerPrice == null ||
      !Number.isInteger(offerPrice) ||
      offerPrice <= 0
    ) {
      throw new BackendError(
        "VALIDATION",
        "سعر العرض لازم يكون رقم صحيح أكبر من صفر",
      );
    }
    const product = found[0]!;
    const baseline =
      input.originalPrice != null && Number.isInteger(input.originalPrice)
        ? input.originalPrice
        : product.price;
    if (baseline <= 0 || offerPrice > baseline) {
      throw new BackendError(
        "VALIDATION",
        "سعر العرض ما يصير أعلى من سعر المنتج",
      );
    }
  } else {
    const percent = input.discountPercent;
    if (
      percent == null ||
      !Number.isInteger(percent) ||
      percent <= 0 ||
      percent > 100
    ) {
      throw new BackendError("VALIDATION", "النسبة لازم تكون بين 1 و 100");
    }
  }
}

async function demoteOtherFeatured(exceptId: string): Promise<void> {
  await prisma.offer.updateMany({
    where: { featured: true, NOT: { id: exceptId } },
    data: { featured: false },
  });
}

function includeProducts() {
  return { products: { select: { productId: true } } } as const;
}

export async function dbListOffers(): Promise<Offer[]> {
  const rows = await prisma.offer.findMany({
    include: includeProducts(),
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { title: "asc" }],
  });
  return rows.map(mapOffer);
}

export async function dbGetOfferById(id: string): Promise<Offer | undefined> {
  const row = await prisma.offer.findUnique({
    where: { id },
    include: includeProducts(),
  });
  return row ? mapOffer(row) : undefined;
}

export async function dbCreateOffer(input: CreateOfferInput): Promise<Offer> {
  const title = input.title.trim();
  if (!title) throw new BackendError("VALIDATION", "اكتب عنوان العرض");

  const productIds = [...new Set(input.productIds.map((p) => p.trim()))];
  await assertPricing({
    type: input.type,
    productIds,
    discountPercent: input.discountPercent,
    offerPrice: input.offerPrice,
    originalPrice: input.originalPrice,
  });

  const max = await prisma.offer.aggregate({ _max: { sortOrder: true } });
  const id = createOpaqueId("offer");
  const featured = input.featured ?? false;

  const row = await prisma.$transaction(async (tx) => {
    if (featured) {
      await tx.offer.updateMany({
        where: { featured: true },
        data: { featured: false },
      });
    }
    return tx.offer.create({
      data: {
        id,
        title,
        description: input.description?.trim() || null,
        type: input.type,
        discountPercent:
          input.type === "percentage" ? input.discountPercent ?? null : null,
        offerPrice:
          input.type === "fixed_price" ? input.offerPrice ?? null : null,
        originalPrice:
          input.type === "fixed_price" ? input.originalPrice ?? null : null,
        visible: input.visible ?? true,
        active: input.active ?? true,
        featured,
        badge: input.badge?.trim() || null,
        imageSrc: input.imageSrc?.trim() || null,
        ctaLabel: input.ctaLabel?.trim() || "اطلب العرض",
        surface: input.surface ?? "cream",
        expiresLabel: input.expiresLabel?.trim() || null,
        sortOrder: input.sortOrder ?? (max._max.sortOrder ?? 0) + 1,
        products: {
          create: productIds.map((productId) => ({ productId })),
        },
      },
      include: includeProducts(),
    });
  }, interactiveTransactionOptions);

  return mapOffer(row);
}

export async function dbUpdateOffer(
  id: string,
  input: UpdateOfferInput,
): Promise<Offer> {
  const existing = await prisma.offer.findUnique({
    where: { id },
    include: includeProducts(),
  });
  if (!existing) {
    throw new BackendError("NOT_FOUND", "ما لكينا هذا العرض");
  }

  const title =
    input.title !== undefined ? input.title.trim() : existing.title;
  if (!title) throw new BackendError("VALIDATION", "اكتب عنوان العرض");

  const type = input.type ?? existing.type;
  const productIds =
    input.productIds !== undefined
      ? [...new Set(input.productIds.map((p) => p.trim()).filter(Boolean))]
      : existing.products.map((p) => p.productId);

  const discountPercent =
    input.discountPercent !== undefined
      ? input.discountPercent
      : existing.discountPercent ?? undefined;
  const offerPrice =
    input.offerPrice !== undefined
      ? input.offerPrice
      : existing.offerPrice ?? undefined;
  const originalPrice =
    input.originalPrice !== undefined
      ? input.originalPrice
      : existing.originalPrice ?? undefined;

  // Status-only edits (active / visible / featured / order) must work even on
  // an incomplete offer; customers never see an offer without products.
  const touchesContent =
    input.type !== undefined ||
    input.productIds !== undefined ||
    input.discountPercent !== undefined ||
    input.offerPrice !== undefined ||
    input.originalPrice !== undefined;

  if (touchesContent) {
    await assertPricing({
      type,
      productIds,
      discountPercent,
      offerPrice,
      originalPrice,
    });
  }

  const featured = input.featured ?? existing.featured;

  const row = await prisma.$transaction(async (tx) => {
    if (featured) {
      await tx.offer.updateMany({
        where: { featured: true, NOT: { id } },
        data: { featured: false },
      });
    }

    if (input.productIds !== undefined) {
      await tx.offerProduct.deleteMany({ where: { offerId: id } });
      await tx.offerProduct.createMany({
        data: productIds.map((productId) => ({ offerId: id, productId })),
      });
    }

    return tx.offer.update({
      where: { id },
      data: {
        title,
        description:
          input.description !== undefined
            ? input.description.trim() || null
            : existing.description,
        type,
        discountPercent: type === "percentage" ? discountPercent ?? null : null,
        offerPrice: type === "fixed_price" ? offerPrice ?? null : null,
        originalPrice: type === "fixed_price" ? originalPrice ?? null : null,
        visible: input.visible ?? existing.visible,
        active: input.active ?? existing.active,
        featured,
        badge:
          input.badge !== undefined
            ? input.badge.trim() || null
            : existing.badge,
        imageSrc:
          input.imageSrc !== undefined
            ? input.imageSrc.trim() || null
            : existing.imageSrc,
        ctaLabel:
          input.ctaLabel !== undefined
            ? input.ctaLabel.trim() || existing.ctaLabel
            : existing.ctaLabel,
        surface: input.surface ?? existing.surface,
        expiresLabel:
          input.expiresLabel !== undefined
            ? input.expiresLabel.trim() || null
            : existing.expiresLabel,
        sortOrder: input.sortOrder ?? existing.sortOrder,
      },
      include: includeProducts(),
    });
  }, interactiveTransactionOptions);

  return mapOffer(row);
}

/** Permanently remove an offer; its product links cascade. Orders keep their own price snapshots. */
export async function dbDeleteOffer(id: string): Promise<void> {
  const existing = await prisma.offer.findUnique({ where: { id } });
  if (!existing) throw new BackendError("NOT_FOUND", "ما لكينا هذا العرض");
  await prisma.offer.delete({ where: { id } });
}

export async function dbMoveOffer(
  id: string,
  direction: "up" | "down",
): Promise<Offer> {
  const ordered = await dbListOffers();
  const index = ordered.findIndex((o) => o.id === id);
  if (index < 0) throw new BackendError("NOT_FOUND", "ما لكينا هذا العرض");
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= ordered.length) return ordered[index]!;
  const a = ordered[index]!;
  const b = ordered[swapWith]!;
  await prisma.$transaction([
    prisma.offer.update({
      where: { id: a.id },
      data: { sortOrder: b.sortOrder },
    }),
    prisma.offer.update({
      where: { id: b.id },
      data: { sortOrder: a.sortOrder },
    }),
  ]);
  return (await dbGetOfferById(id))!;
}

/** Rewrite sortOrder for all offers (1-based display order). */
export async function dbReorderOffers(orderedIds: string[]): Promise<Offer[]> {
  if (!orderedIds.length) {
    throw new BackendError("VALIDATION", "قائمة الترتيب فارغة");
  }
  const current = await dbListOffers();
  const currentIds = new Set(current.map((o) => o.id));
  if (
    orderedIds.length !== current.length ||
    orderedIds.some((id) => !currentIds.has(id))
  ) {
    throw new BackendError(
      "VALIDATION",
      "ترتيب العروض غير مكتمل — حدّث الصفحة وحاول مرة ثانية",
    );
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.offer.update({
        where: { id },
        data: { sortOrder: index + 1 },
      }),
    ),
  );

  return dbListOffers();
}

export { demoteOtherFeatured };
