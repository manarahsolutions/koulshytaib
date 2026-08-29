/**
 * Frontend order / checkout shapes.
 * Ready for a future backend — session handoff only until then.
 */

import type { CartItem } from "@/features/cart/cart-store";

/** Extensible payment keys — only `cash` is offered in checkout today. */
export type PaymentMethodId = "cash" | "electronic" | "wallet";

export type CheckoutCustomer = {
  name: string;
  /** Normalized local Iraqi mobile, e.g. 07XXXXXXXXX — never display raw in UI */
  phone: string;
};

export type DeliveryAddress = {
  governorate: string;
  area: string;
  address: string;
  landmark?: string;
  notes?: string;
};

export type CheckoutData = {
  customer: CheckoutCustomer;
  delivery: DeliveryAddress;
  paymentMethod: PaymentMethodId;
};

export type OrderPricing = {
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export type OrderLineSnapshot = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  notes?: string;
};

/**
 * Customer-facing lifecycle statuses.
 * Initial guest checkout status: `received`.
 */
export type OrderStatus =
  | "received"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderStatusEvent = {
  status: OrderStatus;
  /** ISO timestamp — may be client-generated mock until backend exists */
  timestamp: string;
  note?: string;
};

/**
 * Future backend Order skeleton (not stored in a database yet).
 *
 * Order
 * ├── id
 * ├── customerId
 * ├── customerSnapshot (checkout-time name/phone)
 * ├── items
 * ├── delivery
 * ├── payment
 * ├── pricing
 * ├── status
 * ├── statusHistory
 * └── timestamps
 */
export type Order = {
  /** Opaque client id — do not surface as a customer-facing order number */
  id: string;
  /** FK to CRM Customer.id */
  customerId: string;
  /**
   * Checkout-time snapshot for display/fulfillment.
   * Canonical identity lives on Customer via customerId.
   */
  customer: CheckoutCustomer;
  items: OrderLineSnapshot[];
  delivery: DeliveryAddress;
  payment: { method: PaymentMethodId };
  pricing: OrderPricing;
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  createdAt: string;
  updatedAt?: string;
};

export type CartSnapshotItem = CartItem;
