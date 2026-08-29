/**
 * PostgreSQL-backed order persistence (server-only).
 * Order line snapshots are immutable historical data.
 */

import "server-only";
import { BackendError } from "@/lib/db/errors";
import { mapOrder } from "@/lib/db/mappers";
import { interactiveTransactionOptions, prisma } from "@/lib/db/prisma";
import { createOpaqueId } from "@/lib/id";
import { canTransitionOrderStatus } from "@/features/orders/order-transitions";
import type { Order, OrderStatus } from "@/types/order";
import type { PaymentMethod } from "@prisma/client";

const orderInclude = {
  items: true,
  statusHistory: true,
} as const;

export async function dbListOrders(): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapOrder);
}

export async function dbGetOrderById(id: string): Promise<Order | null> {
  const row = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });
  return row ? mapOrder(row) : null;
}

export async function dbListOrdersByCustomerId(
  customerId: string,
): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    where: { customerId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapOrder);
}

export type DbPlaceOrderInput = {
  customerId: string;
  snapshotName: string;
  snapshotPhone: string;
  delivery: {
    governorate: string;
    area: string;
    address: string;
    landmark?: string;
    notes?: string;
  };
  paymentMethod: PaymentMethod;
  items: Array<{
    productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    notes?: string;
  }>;
  pricing: {
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
};

/** Atomic: order + items + initial status history */
export async function dbCreateOrder(input: DbPlaceOrderInput): Promise<Order> {
  const id = createOpaqueId("ord");
  const row = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        id,
        customerId: input.customerId,
        status: "received",
        snapshotName: input.snapshotName,
        snapshotPhone: input.snapshotPhone,
        governorate: input.delivery.governorate,
        area: input.delivery.area,
        address: input.delivery.address,
        landmark: input.delivery.landmark ?? null,
        notes: input.delivery.notes ?? null,
        paymentMethod: input.paymentMethod,
        subtotal: input.pricing.subtotal,
        deliveryFee: input.pricing.deliveryFee,
        total: input.pricing.total,
        items: {
          create: input.items.map((item) => ({
            id: createOpaqueId("oi"),
            productId: item.productId || null,
            name: item.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
            notes: item.notes ?? null,
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
      include: orderInclude,
    });
    return order;
  }, interactiveTransactionOptions);
  return mapOrder(row);
}

/** Atomic: status update + history append with transition validation */
export async function dbUpdateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
  note?: string,
): Promise<Order> {
  const current = await prisma.order.findUnique({ where: { id: orderId } });
  if (!current) {
    throw new BackendError("NOT_FOUND", "ما لكينا هذا الطلب");
  }
  if (!canTransitionOrderStatus(current.status, nextStatus)) {
    throw new BackendError("INVALID_TRANSITION", "ما يصير تغيير الحالة بهالشكل");
  }

  const row = await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
    });
    await tx.orderStatusHistory.create({
      data: {
        id: createOpaqueId("osh"),
        orderId,
        status: nextStatus,
        note: note ?? `admin:${current.status}→${nextStatus}`,
      },
    });
    return tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: orderInclude,
    });
  }, interactiveTransactionOptions);

  return mapOrder(row);
}
