/**
 * Atomic guest checkout against PostgreSQL (Phase 19).
 * Customer resolve/create + loyalty ensure + order + items + history + activity
 * succeed or fail together.
 */

import "server-only";
import type { PaymentMethod } from "@prisma/client";
import { BackendError } from "@/lib/db/errors";
import { mapCustomer, mapOrder } from "@/lib/db/mappers";
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

    const lines: Array<{
      productId: string;
      name: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
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
      lines.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: qty,
        lineTotal: product.price * qty,
        notes: item.notes?.trim() || undefined,
      });
    }

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const deliveryFee = Math.max(0, Math.floor(input.deliveryFee));
    const total = subtotal + deliveryFee;
    const orderId = createOpaqueId("ord");

    const orderRow = await tx.order.create({
      data: {
        id: orderId,
        customerId: customerRow.id,
        status: "received",
        snapshotName: name,
        snapshotPhone: phone,
        governorate: input.delivery.governorate,
        area: input.delivery.area,
        address: input.delivery.address,
        landmark: input.delivery.landmark ?? null,
        notes: input.delivery.notes ?? null,
        paymentMethod: input.paymentMethod,
        subtotal,
        deliveryFee,
        total,
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
