/**
 * PostgreSQL AdminUser repository (server-only).
 */

import "server-only";
import type { AdminRole as PrismaAdminRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { createOpaqueId } from "@/lib/id";
import type { AdminRole, AdminUser } from "@/features/admin-auth/types";

function mapAdmin(row: {
  id: string;
  identifier: string;
  role: PrismaAdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AdminUser {
  return {
    id: row.id,
    identifier: row.identifier,
    role: row.role as AdminRole,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function normalizeAdminIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase();
}

export async function dbFindAdminByIdentifier(
  identifier: string,
): Promise<(AdminUser & { passwordHash: string }) | null> {
  const normalized = normalizeAdminIdentifier(identifier);
  if (!normalized) return null;
  const row = await prisma.adminUser.findUnique({
    where: { identifier: normalized },
  });
  if (!row) return null;
  return { ...mapAdmin(row), passwordHash: row.passwordHash };
}

export async function dbFindAdminById(
  id: string,
): Promise<AdminUser | null> {
  const row = await prisma.adminUser.findUnique({ where: { id } });
  return row ? mapAdmin(row) : null;
}

export async function dbCreateAdminUser(input: {
  identifier: string;
  passwordHash: string;
  role: AdminRole;
}): Promise<AdminUser> {
  const identifier = normalizeAdminIdentifier(input.identifier);
  const row = await prisma.adminUser.create({
    data: {
      id: createOpaqueId("adm"),
      identifier,
      passwordHash: input.passwordHash,
      role: input.role,
      isActive: true,
    },
  });
  return mapAdmin(row);
}

export async function dbUpsertAdminUser(input: {
  identifier: string;
  passwordHash: string;
  role: AdminRole;
}): Promise<AdminUser> {
  const identifier = normalizeAdminIdentifier(input.identifier);
  const row = await prisma.adminUser.upsert({
    where: { identifier },
    create: {
      id: createOpaqueId("adm"),
      identifier,
      passwordHash: input.passwordHash,
      role: input.role,
      isActive: true,
    },
    update: {
      passwordHash: input.passwordHash,
      role: input.role,
      isActive: true,
    },
  });
  return mapAdmin(row);
}
