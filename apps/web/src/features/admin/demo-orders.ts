/**
 * Development demo orders + customers for Admin — clearly fake phones/names.
 * Seeded into shared in-memory registries when empty.
 * Not production data. Lost on full process reload.
 */

import { seedCustomerRecord } from "@/features/customers/customer-repository";
import { registerOrder, listOrders } from "@/features/orders/order-registry";
import type { Order, OrderStatus } from "@/types/order";

let seeded = false;

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function buildOrder(input: {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  status: OrderStatus;
  createdAt: string;
  history: OrderStatus[];
}): Order {
  const items = [
    {
      productId: "mock-dolma",
      name: "دولمة بيتنا",
      unitPrice: 12000,
      quantity: 2,
      lineTotal: 24000,
    },
    {
      productId: "mock-kebbeh",
      name: "كبة مقلية",
      unitPrice: 8000,
      quantity: 1,
      lineTotal: 8000,
    },
  ];
  const subtotal = 32000;
  const deliveryFee = 3000;
  const statusHistory = input.history.map((status, index) => ({
    status,
    timestamp: new Date(
      new Date(input.createdAt).getTime() + index * 15 * 60 * 1000,
    ).toISOString(),
    note: index === 0 ? "demo-seed" : `demo:${status}`,
  }));

  return {
    id: input.id,
    customerId: input.customerId,
    customer: { name: input.name, phone: input.phone },
    items,
    delivery: {
      governorate: "بغداد",
      area: "المنصور",
      address: "شارع تجريبي — بيانات وهمية للتطوير",
      landmark: "قرب مول تجريبي",
      notes: "اتصال قبل الوصول",
    },
    payment: { method: "cash" },
    pricing: { subtotal, deliveryFee, total: subtotal + deliveryFee },
    status: input.status,
    statusHistory,
    createdAt: input.createdAt,
    updatedAt: statusHistory[statusHistory.length - 1]?.timestamp,
  };
}

type DemoRow = {
  customerId: string;
  name: string;
  phone: string;
  orderId: string;
  status: OrderStatus;
  createdHoursAgo: number;
  history: OrderStatus[];
};

const DEMO_ROWS: DemoRow[] = [
  {
    customerId: "demo-cust-1",
    name: "Demo Customer A",
    phone: "07000000001",
    orderId: "demo-order-received-001",
    status: "received",
    createdHoursAgo: 1,
    history: ["received"],
  },
  {
    customerId: "demo-cust-2",
    name: "Demo Customer B",
    phone: "07000000002",
    orderId: "demo-order-preparing-002",
    status: "preparing",
    createdHoursAgo: 3,
    history: ["received", "confirmed", "preparing"],
  },
  {
    customerId: "demo-cust-3",
    name: "Demo Customer C",
    phone: "07000000003",
    orderId: "demo-order-delivery-003",
    status: "out_for_delivery",
    createdHoursAgo: 5,
    history: ["received", "confirmed", "preparing", "out_for_delivery"],
  },
  {
    customerId: "demo-cust-4",
    name: "Demo Customer D",
    phone: "07000000004",
    orderId: "demo-order-delivered-004",
    status: "delivered",
    createdHoursAgo: 8,
    history: [
      "received",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
    ],
  },
];

/**
 * Idempotent seed for empty order registry (Admin development).
 * Also seeds matching Customer records (fixed opaque ids).
 */
export function ensureAdminDemoOrders(): void {
  if (seeded) return;
  if (listOrders().length > 0) {
    seeded = true;
    return;
  }

  for (const row of DEMO_ROWS) {
    const createdAt = hoursAgo(row.createdHoursAgo);
    seedCustomerRecord({
      id: row.customerId,
      phone: row.phone,
      name: row.name,
      status: "active",
      createdAt,
      updatedAt: createdAt,
    });
    registerOrder(
      buildOrder({
        id: row.orderId,
        customerId: row.customerId,
        name: row.name,
        phone: row.phone,
        status: row.status,
        createdAt,
        history: row.history,
      }),
    );
  }
  seeded = true;
}
