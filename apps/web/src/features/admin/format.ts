import { PAYMENT_LABELS } from "@/features/orders/order-store";
import type { PaymentMethodId } from "@/types/order";

export function getPaymentLabel(method: PaymentMethodId | string): string {
  return (
    PAYMENT_LABELS[method as PaymentMethodId] ?? String(method)
  );
}

/** Short opaque id for dense admin tables — full id remains the route key. */
export function formatOrderRef(orderId: string): string {
  if (orderId.startsWith("demo-order-")) {
    return orderId.replace("demo-order-", "").slice(0, 12);
  }
  return orderId.slice(0, 8);
}
