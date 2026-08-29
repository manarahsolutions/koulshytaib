/**
 * Active guest-order handoff (sessionStorage only).
 *
 * Future: replace these functions with API calls
 * (`GET /orders/:id`, `POST /orders`, …) without changing page UI contracts.
 *
 * CRM identity resolution runs through customer-service (in-memory mock).
 */

import { resolveCustomer, recordActivity } from "@/features/customers/customer-service";
import { registerOrder } from "@/features/orders/order-registry";
import { createOpaqueId } from "@/lib/id";
import { normalizeIraqiPhone } from "@/lib/format/phone";
import type {
  CheckoutCustomer,
  DeliveryAddress,
  Order,
  OrderLineSnapshot,
  OrderPricing,
  PaymentMethodId,
} from "@/types/order";

const STORAGE_KEY = "koulshy-taib-active-order";

const listeners = new Set<() => void>();

/** Stable snapshot cache — required for useSyncExternalStore. */
let cachedRaw: string | null | undefined;
let cachedOrder: Order | null = null;

function emit(): void {
  listeners.forEach((listener) => listener());
}

function invalidateCache(): void {
  cachedRaw = undefined;
  cachedOrder = null;
}

export function subscribeActiveOrder(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function saveActiveOrder(order: Order): void {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(order);
    sessionStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedOrder = order;
    emit();
  } catch {
    // Quota / private mode — readers treat as missing.
  }
}

export function readActiveOrder(): Order | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedOrder;
    cachedRaw = raw;
    if (!raw) {
      cachedOrder = null;
      return null;
    }
    const parsed = JSON.parse(raw) as Order;
    if (!parsed?.id || !parsed?.status || !Array.isArray(parsed.items)) {
      cachedOrder = null;
      return null;
    }
    cachedOrder = parsed;
    return cachedOrder;
  } catch {
    cachedRaw = undefined;
    cachedOrder = null;
    return null;
  }
}

export function clearActiveOrder(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    invalidateCache();
    emit();
  } catch {
    // ignore
  }
}

export function getActiveOrderById(id: string): Order | null {
  const order = readActiveOrder();
  if (!order || order.id !== id) return null;
  return order;
}

export type PlaceGuestOrderInput = {
  customer: CheckoutCustomer;
  delivery: DeliveryAddress;
  paymentMethod: PaymentMethodId;
  items: OrderLineSnapshot[];
  pricing: OrderPricing;
};

/**
 * Guest checkout → customer resolution → order snapshot.
 *
 * Flow:
 * normalize phone → resolve customer (find or create) → create order
 * with customerId + checkout snapshot → register in CRM memory →
 * sessionStorage handoff for confirmation UI.
 *
 * Does **not** send anything to a restaurant backend.
 * Initial status is always `received` — no automatic progression.
 * Existing customer names are never overwritten here.
 */
export function placeGuestOrder(input: PlaceGuestOrderInput): Order {
  const phone = normalizeIraqiPhone(input.customer.phone);
  if (!phone) {
    throw new Error("Invalid Iraqi phone");
  }

  const { customer } = resolveCustomer({
    phone,
    name: input.customer.name,
  });

  const createdAt = new Date().toISOString();
  const order: Order = {
    id: createOpaqueId("ord"),
    customerId: customer.id,
    customer: {
      name: input.customer.name.trim(),
      phone,
    },
    items: input.items,
    delivery: input.delivery,
    payment: { method: input.paymentMethod },
    pricing: input.pricing,
    status: "received",
    statusHistory: [
      {
        status: "received",
        timestamp: createdAt,
        note: "طلب ضيف — معاينة واجهة فقط",
      },
    ],
    createdAt,
  };

  registerOrder(order);
  recordActivity({
    customerId: customer.id,
    type: "order_created",
    relatedId: order.id,
  });
  saveActiveOrder(order);
  return order;
}

export const PAYMENT_LABELS: Record<PaymentMethodId, string> = {
  cash: "الدفع عند الاستلام",
  electronic: "دفع إلكتروني",
  wallet: "محفظة",
};

export function countOrderUnits(order: Order): number {
  return order.items.reduce((sum, line) => sum + line.quantity, 0);
}
