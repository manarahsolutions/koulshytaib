/**
 * Coupon persistence (server-only).
 */

import "server-only";
import type { Coupon as DbCoupon, CouponType as DbCouponType } from "@prisma/client";
import { BackendError } from "@/lib/db/errors";
import { prisma } from "@/lib/db/prisma";
import { createOpaqueId } from "@/lib/id";
import { calcCouponDiscount } from "@/features/checkout/coupon-math";
import type {
  CouponRecord,
  CouponTypeId,
  ValidateCouponResult,
} from "@/features/coupons/types";

export type { CouponRecord, ValidateCouponResult } from "@/features/coupons/types";

export function mapCoupon(row: DbCoupon): CouponRecord {
  return {
    id: row.id,
    code: row.code,
    type: row.type as CouponTypeId,
    value: row.value,
    active: row.active,
    expiresAt: row.expiresAt?.toISOString(),
    maxRedemptions: row.maxRedemptions ?? undefined,
    redemptionCount: row.redemptionCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function dbListCoupons(): Promise<CouponRecord[]> {
  const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(mapCoupon);
}

export async function dbCreateCoupon(input: {
  code: string;
  type: "percent" | "fixed_iqd";
  value: number;
  maxRedemptions?: number;
  expiresAt?: string;
}): Promise<CouponRecord> {
  const code = input.code.trim().toUpperCase();
  if (!code || code.length < 3) {
    throw new BackendError("VALIDATION", "كود الكوبون قصير جداً");
  }
  if (input.type === "percent" && (input.value < 1 || input.value > 100)) {
    throw new BackendError("VALIDATION", "النسبة لازم بين 1 و 100");
  }
  if (input.type === "fixed_iqd" && input.value < 1) {
    throw new BackendError("VALIDATION", "مبلغ الخصم لازم يكون أكبر من صفر");
  }

  try {
    const row = await prisma.coupon.create({
      data: {
        id: createOpaqueId("cpn"),
        code,
        type: input.type as DbCouponType,
        value: Math.trunc(input.value),
        maxRedemptions: input.maxRedemptions ?? null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      },
    });
    return mapCoupon(row);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new BackendError("CONFLICT", "هذا الكود مستخدم مسبقاً");
    }
    throw error;
  }
}

export async function dbSetCouponActive(
  id: string,
  active: boolean,
): Promise<CouponRecord> {
  const row = await prisma.coupon.update({
    where: { id },
    data: { active },
  });
  return mapCoupon(row);
}

export async function dbValidateCouponForSubtotal(
  codeRaw: string,
  subtotal: number,
): Promise<ValidateCouponResult> {
  const code = codeRaw.trim().toUpperCase();
  if (!code) throw new BackendError("VALIDATION", "اكتب كود الخصم");

  const row = await prisma.coupon.findUnique({ where: { code } });
  if (!row || !row.active) {
    throw new BackendError("VALIDATION", "كود الخصم غير صالح");
  }
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    throw new BackendError("VALIDATION", "انتهت صلاحية هذا الكود");
  }
  if (
    row.maxRedemptions != null &&
    row.redemptionCount >= row.maxRedemptions
  ) {
    throw new BackendError("VALIDATION", "تم استهلاك هذا الكود بالكامل");
  }

  const discount = calcCouponDiscount({
    type: row.type as "percent" | "fixed_iqd",
    value: row.value,
    subtotal,
  });
  if (discount <= 0) {
    throw new BackendError("VALIDATION", "الكود ما يطبّق خصماً على هذا المجموع");
  }

  return {
    code: row.code,
    discount,
    type: row.type as "percent" | "fixed_iqd",
    value: row.value,
  };
}
