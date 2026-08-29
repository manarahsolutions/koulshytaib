/**
 * Customer service — phone-first identity resolution.
 * Components should call this layer, not the repository directly.
 */

import {
  createInMemoryCustomerRepository,
  customerRepository,
} from "@/features/customers/customer-repository";
import { computeCustomerMetrics } from "@/features/customers/customer-metrics";
import type {
  CreateCustomerInput,
  Customer,
  CustomerActivity,
  CustomerRepository,
} from "@/features/customers/types";
import { ensureLoyaltyAccount } from "@/features/loyalty/loyalty-service";
import { createOpaqueId } from "@/lib/id";
import { normalizeIraqiPhone } from "@/lib/format/phone";
import { listOrders, listOrdersByCustomerId } from "@/features/orders/order-registry";

const activities: CustomerActivity[] = [];

export type ResolveCustomerInput = {
  phone: string;
  /** Used only when creating a new customer — never overwrites existing name */
  name?: string;
};

export type ResolveCustomerResult = {
  customer: Customer;
  created: boolean;
};

export function findCustomerByPhone(
  phone: string,
  repo: CustomerRepository = customerRepository,
): Customer | null {
  const normalized = normalizeIraqiPhone(phone);
  if (!normalized) return null;
  return repo.findByPhone(normalized);
}

export function getCustomerById(
  id: string,
  repo: CustomerRepository = customerRepository,
): Customer | null {
  return repo.findById(id);
}

export function createCustomer(
  input: CreateCustomerInput,
  repo: CustomerRepository = customerRepository,
): Customer {
  const customer = repo.create(input);
  ensureLoyaltyAccount(customer.id);
  return customer;
}

/**
 * Resolve guest checkout identity:
 * - normalize phone
 * - reuse existing customer (preserve canonical name)
 * - otherwise create customer + loyalty shell account
 */
export function resolveCustomer(
  input: ResolveCustomerInput,
  repo: CustomerRepository = customerRepository,
): ResolveCustomerResult {
  const phone = normalizeIraqiPhone(input.phone);
  if (!phone) {
    throw new Error("Invalid Iraqi phone");
  }

  const existing = repo.findByPhone(phone);
  if (existing) {
    ensureLoyaltyAccount(existing.id);
    return { customer: existing, created: false };
  }

  const customer = createCustomer(
    { phone, name: input.name?.trim() || undefined },
    repo,
  );
  return { customer, created: true };
}

export function searchCustomers(
  query: string,
  repo: CustomerRepository = customerRepository,
): Customer[] {
  return repo.search(query);
}

export function getCustomerMetricsFor(
  customerId: string,
) {
  return computeCustomerMetrics(listOrdersByCustomerId(customerId));
}

export function recordActivity(
  input: Omit<CustomerActivity, "id" | "createdAt"> & {
    createdAt?: string;
  },
): CustomerActivity {
  const event: CustomerActivity = {
    id: createOpaqueId("act"),
    customerId: input.customerId,
    type: input.type,
    relatedId: input.relatedId,
    note: input.note,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  activities.push(event);
  return event;
}

export function listCustomerActivities(
  customerId: string,
): CustomerActivity[] {
  return activities.filter((a) => a.customerId === customerId);
}

/** Admin-ready CRM selectors (mock in-memory). */
export function getCustomerCount(
  repo: CustomerRepository = customerRepository,
): number {
  return repo.list().length;
}

export function getNewCustomers(
  repo: CustomerRepository = customerRepository,
): Customer[] {
  return repo.list().filter((customer) => {
    const metrics = computeCustomerMetrics(
      listOrdersByCustomerId(customer.id),
    );
    return metrics.classification === "new";
  });
}

export function getReturningCustomers(
  repo: CustomerRepository = customerRepository,
): Customer[] {
  return repo.list().filter((customer) => {
    const metrics = computeCustomerMetrics(
      listOrdersByCustomerId(customer.id),
    );
    return metrics.classification === "returning";
  });
}

/**
 * Revenue from delivered orders only (IQD).
 * Documented Phase 9 rule — cancelled excluded.
 */
export function getTotalRevenue(): number {
  return listOrders()
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.pricing.total, 0);
}

export function getAverageOrderValue(): number {
  const delivered = listOrders().filter((o) => o.status === "delivered");
  if (delivered.length === 0) return 0;
  const total = delivered.reduce((sum, o) => sum + o.pricing.total, 0);
  return total / delivered.length;
}

export function clearCustomerActivitiesForTests(): void {
  activities.length = 0;
}

export { createInMemoryCustomerRepository, customerRepository };
