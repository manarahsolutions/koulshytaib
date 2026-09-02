/**
 * Atomic guest checkout against PostgreSQL (Phase 19).
 * Customer resolve/create + loyalty ensure + order + items + history + activity
 * succeed or fail together.
 */

import "server-only";
import type { PaymentMethod } from "@prisma/client";
import { calcCouponDiscount } from "@/features/checkout/coupon-math";
import {
  DELIVERY_AREA,
  DELIVERY_GOVERNORATE,
  isPreciseAddress,
} from "@/features/checkout/delivery-zone";
import { applyOffersToLines } from "@/features/offers/apply-offers";
import { BackendError } from "@/lib/db/errors";
import { mapCustomer, mapOffer, mapOrder } from "@/lib/db/mappers";
import { interactiveTransactionOptions, prisma } from "@/lib/db/prisma";
import { createOpaqueId } from "@/lib/id";
import { normalizeIraqiPhone } from "@/lib/format/phone";
import type { Order } from "@/types/order";
import type { Customer } from "@/features/customers/types";

export type GuestCheckoutLine = {
  productId: string;
  quantity: number;
  notes?: string;
};

export type GuestCheckoutInput = {
  customer: { name: string; phone: string };
  delivery: {
    governorate: string;
    area: string;
    address: string;
    landmark?: string;
    notes?: string;
  };
  paymentMethod: PaymentMethod;
  items: GuestCheckoutLine[];
  deliveryFee: number;
  /** Raw coupon code — validated inside the transaction against post-offer subtotal */
  couponCode?: string;
};

export type GuestCheckoutResult = {
  order: Order;
  customer: Customer;
  customerCreated: boolean;
};

/**
 * Authoritative checkout: validates catalog from DB, ignores client prices.
 */
export async function dbPlaceGuestOrderAtomic(
  input: GuestCheckoutInput,
): Promise<GuestCheckoutResult> {
  const phone = normalizeIraqiPhone(input.customer.phone);
  if (!phone) {
    throw new BackendError("VALIDATION", "رقم الهاتف غير صالح");
  }
  const name = input.customer.name.trim();
  if (!name) {
    throw new BackendError("VALIDATION", "اكتب الاسم");
  }
  if (input.items.length === 0) {
    throw new BackendError("VALIDATION", "السلة فاضية");
  }

  // Fallujah-only — normalize zone server-side (ignore client variants)
  const delivery = {
    ...input.delivery,
    governorate: DELIVERY_GOVERNORATE,
    area: DELIVERY_AREA,
    address: input.delivery.address.trim(),
  };
  if (!isPreciseAddress(delivery.address)) {
    throw new BackendError(
      "VALIDATION",
      "اكتب عنوانك الدقيق داخل الفلوجة",
    );
  }

  return prisma.$transaction(async (tx) => {
    let customerRow = await tx.customer.findUnique({ where: { phone } });
    let customerCreated = false;

    if (!customerRow) {
      customerRow = await tx.customer.create({
        data: {
          id: createOpaqueId("cust"),
          phone,
          name,
          status: "active",
        },
      });
      customerCreated = true;
    }
    // Existing customer: reuse without overwriting name

    const loyalty = await tx.loyaltyAccount.findUnique({
      where: { customerId: customerRow.id },
    });
    if (!loyalty) {
      await tx.loyaltyAccount.create({
        data: {
          id: createOpaqueId("lya"),
          customerId: customerRow.id,
          pointsBalance: 0,
          lifetimeEarned: 0,
          lifetimeRedeemed: 0,
        },
      });
    }

    const catalogLines: Array<{
      productId: string;
      name: string;
      catalogUnitPrice: number;
      quantity: number;
      notes?: string;
    }> = [];

    for (const item of input.items) {
      const qty = Math.max(1, Math.min(99, Math.floor(item.quantity)));
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });
      if (!product || !product.visible) {
        throw new BackendError("VALIDATION", "أحد المنتجات غير متاح حالياً");
      }
      if (!product.available) {
        throw new BackendError(
          "VALIDATION",
          `«${product.name}» غير متوفر حالياً`,
        );
      }
      catalogLines.push({
        productId: product.id,
        name: product.name,
        catalogUnitPrice: product.price,
        quantity: qty,
        notes: item.notes?.trim() || undefined,
      });
    }

    const offerRows = await tx.offer.findMany({
      where: { active: true, visible: true },
      include: { products: true },
    });
    const offers = offerRows.map(mapOffer);
    const priced = applyOffersToLines(
      catalogLines.map((l) => ({
        productId: l.productId,
        catalogUnitPrice: l.catalogUnitPrice,
        quantity: l.quantity,
      })),
      offers,
    );

    const lines = catalogLines.map((l, i) => {
      const p = priced[i]!;
      return {
        productId: l.productId,
        name: l.name,
        unitPrice: p.unitPrice,
        quantity: l.quantity,
        lineTotal: p.lineTotal,
        notes: l.notes,
      };
    });

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const deliveryFee = Math.max(0, Math.floor(input.deliveryFee));

    let couponCode: string | null = null;
    let couponDiscount = 0;
    const rawCoupon = input.couponCode?.trim();
    if (rawCoupon) {
      const code = rawCoupon.toUpperCase();
      const coupon = await tx.coupon.findUnique({ where: { code } });
      if (!coupon || !coupon.active) {
        throw new BackendError("VALIDATION", "كود الخصم غير صالح");
      }
      if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
        throw new BackendError("VALIDATION", "انتهت صلاحية هذا الكود");
      }
      if (
        coupon.maxRedemptions != null &&
        coupon.redemptionCount >= coupon.maxRedemptions
      ) {
        throw new BackendError("VALIDATION", "تم استهلاك هذا الكود بالكامل");
      }
      couponDiscount = calcCouponDiscount({
        type: coupon.type as "percent" | "fixed_iqd",
        value: coupon.value,
        subtotal,
      });
      if (couponDiscount <= 0) {
        throw new BackendError(
          "VALIDATION",
          "الكود ما يطبّق خصماً على هذا المجموع",
        );
      }
      couponCode = coupon.code;
    }

    const total = subtotal - couponDiscount + deliveryFee;
    const orderId = createOpaqueId("ord");

    const orderRow = await tx.order.create({
      data: {
        id: orderId,
        customerId: customerRow.id,
        status: "received",
        snapshotName: name,
        snapshotPhone: phone,
        governorate: delivery.governorate,
        area: delivery.area,
        address: delivery.address,
        landmark: delivery.landmark ?? null,
        notes: delivery.notes ?? null,
        paymentMethod: input.paymentMethod,
        subtotal,
        deliveryFee,
        total,
        couponCode,
        couponDiscount,
        items: {
          create: lines.map((line) => ({
            id: createOpaqueId("oi"),
            productId: line.productId,
            name: line.name,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
            lineTotal: line.lineTotal,
            notes: line.notes ?? null,
          })),
        },
        statusHistory: {
          create: {
            id: createOpaqueId("osh"),
            status: "received",
            note: "طلب ضيف",
          },
        },
      },
      include: {
        items: true,
        statusHistory: true,
      },
    });

    if (couponCode && couponDiscount > 0) {
      await tx.coupon.update({
        where: { code: couponCode },
        data: { redemptionCount: { increment: 1 } },
      });
    }

    await tx.customerActivity.create({
      data: {
        id: createOpaqueId("act"),
        customerId: customerRow.id,
        type: "order_created",
        relatedId: orderId,
      },
    });

    return {
      order: mapOrder(orderRow),
      customer: mapCustomer(customerRow),
      customerCreated,
    };
  }, interactiveTransactionOptions);
}
