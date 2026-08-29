/**
 * PostgreSQL-backed customer + activity persistence (server-only).
 */

import "server-only";
import { BackendError } from "@/lib/db/errors";
import { mapCustomer } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import { createOpaqueId } from "@/lib/id";
import { normalizeIraqiPhone } from "@/lib/format/phone";
import type {
  CreateCustomerInput,
  Customer,
  CustomerActivity,
  CustomerActivityType,
  UpdateCustomerInput,
} from "@/features/customers/types";

export async function dbFindCustomerByPhone(
  phone: string,
): Promise<Customer | null> {
  const normalized = normalizeIraqiPhone(phone);
  if (!normalized) return null;
  const row = await prisma.customer.findUnique({
    where: { phone: normalized },
  });
  return row ? mapCustomer(row) : null;
}

export async function dbFindCustomerById(
  id: string,
): Promise<Customer | null> {
  const row = await prisma.customer.findUnique({ where: { id } });
  return row ? mapCustomer(row) : null;
}

export async function dbListCustomers(): Promise<Customer[]> {
  const rows = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapCustomer);
}

export async function dbCreateCustomer(
  input: CreateCustomerInput,
): Promise<Customer> {
  const phone = normalizeIraqiPhone(input.phone);
  if (!phone) {
    throw new BackendError("VALIDATION", "رقم الهاتف غير صالح");
  }
  const existing = await prisma.customer.findUnique({ where: { phone } });
  if (existing) {
    throw new BackendError("CONFLICT", "الزبون موجود مسبقاً");
  }

  const row = await prisma.customer.create({
    data: {
      id: createOpaqueId("cust"),
      phone,
      name: input.name?.trim() || null,
      status: "active",
    },
  });
  return mapCustomer(row);
}

export async function dbUpdateCustomer(
  id: string,
  input: UpdateCustomerInput,
): Promise<Customer> {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    throw new BackendError("NOT_FOUND", "ما لكينا هذا الزبون");
  }
  const row = await prisma.customer.update({
    where: { id },
    data: {
      name:
        input.name !== undefined ? input.name.trim() || null : existing.name,
      status: input.status ?? existing.status,
    },
  });
  return mapCustomer(row);
}

export async function dbSearchCustomers(query: string): Promise<Customer[]> {
  const q = query.trim();
  if (!q) return dbListCustomers();
  const rows = await prisma.customer.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapCustomer);
}

export async function dbRecordActivity(input: {
  customerId: string;
  type: CustomerActivityType;
  relatedId?: string;
  note?: string;
}): Promise<CustomerActivity> {
  const row = await prisma.customerActivity.create({
    data: {
      id: createOpaqueId("act"),
      customerId: input.customerId,
      type: input.type,
      relatedId: input.relatedId,
      note: input.note,
    },
  });
  return {
    id: row.id,
    customerId: row.customerId,
    type: row.type,
    relatedId: row.relatedId ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function dbListCustomerActivities(
  customerId: string,
): Promise<CustomerActivity[]> {
  const rows = await prisma.customerActivity.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    customerId: row.customerId,
    type: row.type,
    relatedId: row.relatedId ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.createdAt.toISOString(),
  }));
}
