import { useSyncExternalStore } from "react";
import { useCartStore } from "@/features/cart/cart-store";

/** True after zustand persist rehydration on the client. */
export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => useCartStore.persist.onFinishHydration(onStoreChange),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );
}
