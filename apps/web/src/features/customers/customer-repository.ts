/**
 * In-memory customer repository (mock CRM).
 * Not persisted to localStorage / sessionStorage — replace with API later.
 */

import { createOpaqueId } from "@/lib/id";
import { normalizeIraqiPhone } from "@/lib/format/phone";
import type {
  CreateCustomerInput,
  Customer,
  CustomerRepository,
  UpdateCustomerInput,
} from "@/features/customers/types";

function nowIso(): string {
  return new Date().toISOString();
}

const byId = new Map<string, Customer>();
const phoneIndex = new Map<string, string>();
const listeners = new Set<() => void>();
let snapshot: Customer[] = [];

function rebuildSnapshot(): void {
  snapshot = Array.from(byId.values());
}

function emit(): void {
  rebuildSnapshot();
  listeners.forEach((listener) => listener());
}

export function subscribeCustomers(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getCustomersSnapshot(): Customer[] {
  return snapshot;
}

function findByPhone(phone: string): Customer | null {
  const normalized = normalizeIraqiPhone(phone);
  if (!normalized) return null;
  const id = phoneIndex.get(normalized);
  if (!id) return null;
  return byId.get(id) ?? null;
}

function findById(id: string): Customer | null {
  return byId.get(id) ?? null;
}

function create(input: CreateCustomerInput): Customer {
  const phone = normalizeIraqiPhone(input.phone);
  if (!phone) {
    throw new Error("Invalid Iraqi phone for customer create");
  }
  if (phoneIndex.has(phone)) {
    throw new Error("Customer phone must be unique");
  }

  const timestamp = nowIso();
  const customer: Customer = {
    id: createOpaqueId("cust"),
    phone,
    name: input.name?.trim() || undefined,
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  byId.set(customer.id, customer);
  phoneIndex.set(phone, customer.id);
  emit();
  return customer;
}

function update(id: string, input: UpdateCustomerInput): Customer {
  const existing = byId.get(id);
  if (!existing) {
    throw new Error("Customer not found");
  }
  const next: Customer = {
    ...existing,
    name:
      input.name !== undefined ? input.name.trim() || undefined : existing.name,
    status: input.status ?? existing.status,
    updatedAt: nowIso(),
  };
  byId.set(id, next);
  emit();
  return next;
}

function list(): Customer[] {
  return Array.from(byId.values());
}

function search(query: string): Customer[] {
  const q = query.trim().toLowerCase();
  if (!q) return list();

  const asPhone = normalizeIraqiPhone(query);
  const digits = q.replace(/\D/g, "");
  return list().filter((customer) => {
    if (asPhone && customer.phone === asPhone) return true;
    if (digits && customer.phone.includes(digits)) return true;
    if (customer.name?.toLowerCase().includes(q)) return true;
    return false;
  });
}

/** Replace in-memory CRM customers from DB hydrate (client cache). */
export function replaceCustomersFromServer(customers: Customer[]): void {
  byId.clear();
  phoneIndex.clear();
  for (const customer of customers) {
    const phone = normalizeIraqiPhone(customer.phone);
    if (!phone) continue;
    const record: Customer = { ...customer, phone };
    byId.set(record.id, record);
    phoneIndex.set(phone, record.id);
  }
  emit();
}

/** Upsert one customer into the client cache after a DB mutation. */
export function upsertCustomerInCache(customer: Customer): void {
  const phone = normalizeIraqiPhone(customer.phone);
  if (!phone) return;
  const record: Customer = { ...customer, phone };
  byId.set(record.id, record);
  phoneIndex.set(phone, record.id);
  emit();
}

/** Development seed with fixed opaque id — skips if id already present. */
export function seedCustomerRecord(customer: Customer): Customer {
  const phone = normalizeIraqiPhone(customer.phone);
  if (!phone) {
    throw new Error("Invalid Iraqi phone for seed");
  }
  if (byId.has(customer.id)) {
    return byId.get(customer.id)!;
  }
  if (phoneIndex.has(phone) && phoneIndex.get(phone) !== customer.id) {
    throw new Error("Customer phone must be unique");
  }
  const record: Customer = { ...customer, phone };
  byId.set(record.id, record);
  phoneIndex.set(phone, record.id);
  emit();
  return record;
}

export function clearCustomerRepositoryForTests(): void {
  byId.clear();
  phoneIndex.clear();
  emit();
}

/** Process-lifetime mock store — not a browser database. */
export const customerRepository: CustomerRepository = {
  findByPhone,
  findById,
  create,
  update,
  list,
  search,
};

/** @deprecated Prefer singleton customerRepository — kept for tests. */
export function createInMemoryCustomerRepository(): CustomerRepository {
  return customerRepository;
}
