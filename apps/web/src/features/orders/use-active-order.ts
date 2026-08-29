"use client";

import { useSyncExternalStore } from "react";
import {
  readActiveOrder,
  subscribeActiveOrder,
} from "@/features/orders/order-store";
import type { Order } from "@/types/order";

/** Active guest order from sessionStorage (null on server / when missing). */
export function useActiveOrder(): Order | null {
  return useSyncExternalStore(
    subscribeActiveOrder,
    () => readActiveOrder(),
    () => null,
  );
}
