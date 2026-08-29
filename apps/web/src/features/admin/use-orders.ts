"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getOrderById,
  getOrdersSnapshot,
  subscribeOrders,
} from "@/features/orders/order-registry";
import type { Order } from "@/types/order";

const EMPTY: Order[] = [];

export function useOrders(): Order[] {
  return useSyncExternalStore(subscribeOrders, getOrdersSnapshot, () => EMPTY);
}

export function useOrder(orderId: string): Order | null {
  const getSnapshot = useCallback(() => getOrderById(orderId), [orderId]);
  return useSyncExternalStore(subscribeOrders, getSnapshot, () => null);
}
