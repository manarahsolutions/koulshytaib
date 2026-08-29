/**
 * CRM selectors / view-model builders — pure over domain data.
 * Components should consume these instead of re-implementing rules.
 */

import { computeCustomerMetrics } from "@/features/customers/customer-metrics";
import { customerRepository } from "@/features/customers/customer-repository";
import type {
  Customer,
  CustomerClassification,
  CustomerMetrics,
} from "@/features/customers/types";
import { normalizeIraqiPhone } from "@/lib/format/phone";
import {
  listOrders,
  listOrdersByCustomerId,
} from "@/features/orders/order-registry";
import type { Order } from "@/types/order";

export type CustomerTypeLabel = "جديد" | "عائد";

export type CustomerListItem = {
  customer: Customer;
  metrics: CustomerMetrics;
  typeLabel: CustomerTypeLabel;
  /** Sort key: latest activity (prefer last order, else createdAt) */
  activityAt: string;
};

export function getCustomers(): Customer[] {
  return customerRepository.list();
}

export function getCustomerType(
  metrics: CustomerMetrics,
): CustomerClassification {
  return metrics.classification;
}

export function getCustomerTypeLabel(
  classification: CustomerClassification,
): CustomerTypeLabel {
  return classification === "returning" ? "عائد" : "جديد";
}

export function getCustomerOrders(customerId: string): Order[] {
  return [...listOrdersByCustomerId(customerId)].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function getCustomerMetrics(customerId: string): CustomerMetrics {
  return computeCustomerMetrics(listOrdersByCustomerId(customerId));
}

/** Latest delivered order for this customer, or null. */
export function getCustomerLastDeliveredOrder(
  customerId: string,
): Order | null {
  const delivered = getCustomerOrders(customerId).filter(
    (o) => o.status === "delivered",
  );
  return delivered[0] ?? null;
}

/** Latest order of any status. */
export function getCustomerLastOrder(customerId: string): Order | null {
  return getCustomerOrders(customerId)[0] ?? null;
}

export function buildCustomerListItem(customer: Customer): CustomerListItem {
  const metrics = computeCustomerMetrics(listOrdersByCustomerId(customer.id));
  const activityAt =
    metrics.lastOrderAt ?? metrics.lastDeliveredAt ?? customer.createdAt;
  return {
    customer,
    metrics,
    typeLabel: getCustomerTypeLabel(metrics.classification),
    activityAt,
  };
}

export function buildCustomerListItems(
  customers: Customer[] = getCustomers(),
): CustomerListItem[] {
  return customers.map(buildCustomerListItem);
}

export type CustomerListFilter = "all" | "new" | "returning";

export function filterCustomerListItems(
  items: CustomerListItem[],
  filter: CustomerListFilter,
): CustomerListItem[] {
  if (filter === "all") return items;
  if (filter === "new") {
    return items.filter((i) => i.metrics.classification === "new");
  }
  return items.filter((i) => i.metrics.classification === "returning");
}

/**
 * Search by name or normalized phone (uses shared phone helper).
 */
export function searchCustomerListItems(
  items: CustomerListItem[],
  query: string,
): CustomerListItem[] {
  const q = query.trim();
  if (!q) return items;

  const asPhone = normalizeIraqiPhone(q);
  const digits = q.replace(/\D/g, "");
  const lower = q.toLowerCase();

  return items.filter(({ customer }) => {
    if (asPhone && customer.phone === asPhone) return true;
    if (digits.length >= 3 && customer.phone.includes(digits)) return true;
    if (customer.name?.toLowerCase().includes(lower)) return true;
    return false;
  });
}

/** Most recently active first; fallback customer.createdAt. */
export function sortCustomerListItems(
  items: CustomerListItem[],
): CustomerListItem[] {
  return [...items].sort((a, b) => {
    const byActivity = b.activityAt.localeCompare(a.activityAt);
    if (byActivity !== 0) return byActivity;
    return b.customer.createdAt.localeCompare(a.customer.createdAt);
  });
}

export function queryCustomerListItems(input: {
  query?: string;
  filter?: CustomerListFilter;
  customers?: Customer[];
}): CustomerListItem[] {
  const items = buildCustomerListItems(input.customers ?? getCustomers());
  const filtered = filterCustomerListItems(items, input.filter ?? "all");
  const searched = searchCustomerListItems(filtered, input.query ?? "");
  return sortCustomerListItems(searched);
}

export function getCustomerStatusLabel(
  status: Customer["status"],
): string {
  return status === "active" ? "نشط" : "غير نشط";
}

/** All orders in registry (for revision subscription helpers). */
export function getAllOrdersCount(): number {
  return listOrders().length;
}
