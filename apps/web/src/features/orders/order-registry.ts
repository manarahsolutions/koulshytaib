/**
 * In-memory order registry.
 * Admin mutations update this Map only — not persisted across reloads.
 */

import type { Order } from "@/types/order";

const ordersById = new Map<string, Order>();
const listeners = new Set<() => void>();

/** Stable snapshot for useSyncExternalStore */
let snapshot: Order[] = [];

function rebuildSnapshot(): void {
  snapshot = Array.from(ordersById.values());
}

function emit(): void {
  rebuildSnapshot();
  listeners.forEach((listener) => listener());
}

export function subscribeOrders(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getOrdersSnapshot(): Order[] {
  return snapshot;
}

export function registerOrder(order: Order): void {
  ordersById.set(order.id, order);
  emit();
}

/** Replace an existing order (status mutations, etc.). */
export function saveOrder(order: Order): void {
  ordersById.set(order.id, order);
  emit();
}

export function getOrderById(id: string): Order | null {
  return ordersById.get(id) ?? null;
}

export function listOrders(): Order[] {
  return Array.from(ordersById.values());
}

export function listOrdersByCustomerId(customerId: string): Order[] {
  return listOrders().filter((order) => order.customerId === customerId);
}

export function clearOrderRegistryForTests(): void {
  ordersById.clear();
  emit();
}

/** Replace registry from DB hydrate (Admin client cache). */
export function replaceOrdersFromServer(orders: Order[]): void {
  ordersById.clear();
  for (const order of orders) {
    ordersById.set(order.id, order);
  }
  emit();
}
