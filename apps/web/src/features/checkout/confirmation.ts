/**
 * Checkout confirmation handoff — re-exports the orders session store.
 * New code should import from `@/features/orders/order-store` directly.
 */

export {
  clearActiveOrder as clearOrderConfirmation,
  PAYMENT_LABELS,
  placeGuestOrder,
  readActiveOrder as readOrderConfirmation,
} from "@/features/orders/order-store";
