/**
 * Reel persistence (server-only).
 */

import "server-only";
import type { Reel as DbReel } from "@prisma/client";
import { BackendError } from "@/lib/db/errors";
import { prisma } from "@/lib/db/prisma";
import { createOpaqueId } from "@/lib/id";
import {
  normalizeInstagramReelUrl,
} from "@/features/reels/instagram-url";
import { storeReelThumbnail } from "@/features/reels/instagram-thumbnail";
import type { Reel } from "@/types/marketing";

export type ReelRecord = {
  id: string;
  title: string;
  instagramUrl: string;
  thumbnailUrl?: string;
  productId?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export function mapReel(row: DbReel): ReelRecord {
  return {
    id: row.id,
    title: row.title,
    instagramUrl: row.instagramUrl,
    thumbnailUrl: row.thumbnailUrl ?? undefined,
    productId: row.productId ?? undefined,
    active: row.active,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toMarketingReel(row: ReelRecord): Reel {
  return {
    id: row.id,
    title: row.title,
    thumbnail: row.thumbnailUrl,
    instagramUrl: row.instagramUrl,
    productId: row.productId,
    label: "لقطة من المطبخ",
  };
}

export async function dbListReels(opts?: {
  activeOnly?: boolean;
}): Promise<ReelRecord[]> {
  const rows = await prisma.reel.findMany({
    where: opts?.activeOnly ? { active: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapReel);
}

export async function dbCreateReel(input: {
  title: string;
  instagramUrl: string;
  thumbnailUrl?: string;
  productId?: string;
  active?: boolean;
}): Promise<ReelRecord> {
  const url = normalizeInstagramReelUrl(input.instagramUrl);
  if (!url) {
    throw new BackendError("VALIDATION", "رابط إنستغرام الريل غير صالح");
  }
  const title = input.title.trim();
  if (!title) throw new BackendError("VALIDATION", "اكتب عنوان الريل");

  const max = await prisma.reel.aggregate({ _max: { sortOrder: true } });
  const thumbnailUrl =
    input.thumbnailUrl?.trim() ||
    (await storeReelThumbnail(url)) ||
    null;
  const row = await prisma.reel.create({
    data: {
      id: createOpaqueId("reel"),
      title,
      instagramUrl: url,
      thumbnailUrl,
      productId: input.productId?.trim() || null,
      active: input.active ?? true,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
    },
  });
  return mapReel(row);
}

/** Fill missing thumbnails for existing reels (best-effort). */
export async function dbEnsureReelThumbnails(
  ids?: string[],
): Promise<number> {
  const rows = await prisma.reel.findMany({
    where: {
      thumbnailUrl: null,
      ...(ids?.length ? { id: { in: ids } } : {}),
    },
    select: { id: true, instagramUrl: true },
  });
  let updated = 0;
  for (const row of rows) {
    const thumb = await storeReelThumbnail(row.instagramUrl);
    if (!thumb) continue;
    await prisma.reel.update({
      where: { id: row.id },
      data: { thumbnailUrl: thumb },
    });
    updated += 1;
  }
  return updated;
}

export async function dbUpdateReel(
  id: string,
  patch: Partial<{
    title: string;
    instagramUrl: string;
    thumbnailUrl: string | null;
    productId: string | null;
    active: boolean;
  }>,
): Promise<ReelRecord> {
  const data: Record<string, unknown> = {};
  if (patch.title != null) {
    const title = patch.title.trim();
    if (!title) throw new BackendError("VALIDATION", "اكتب عنوان الريل");
    data.title = title;
  }
  if (patch.instagramUrl != null) {
    const url = normalizeInstagramReelUrl(patch.instagramUrl);
    if (!url) {
      throw new BackendError("VALIDATION", "رابط إنستغرام الريل غير صالح");
    }
    data.instagramUrl = url;
  }
  if (patch.thumbnailUrl !== undefined) {
    data.thumbnailUrl = patch.thumbnailUrl?.trim() || null;
  }
  if (patch.productId !== undefined) {
    data.productId = patch.productId?.trim() || null;
  }
  if (patch.active != null) data.active = patch.active;

  const row = await prisma.reel.update({ where: { id }, data });
  return mapReel(row);
}

export async function dbDeleteReel(id: string): Promise<void> {
  await prisma.reel.delete({ where: { id } });
}

export async function dbSetReelActive(
  id: string,
  active: boolean,
): Promise<ReelRecord> {
  return dbUpdateReel(id, { active });
}

export async function dbMoveReel(
  id: string,
  direction: "up" | "down",
): Promise<ReelRecord[]> {
  const rows = await prisma.reel.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  const idx = rows.findIndex((r) => r.id === id);
  if (idx < 0) throw new BackendError("NOT_FOUND", "ما لكينا هذا الريل");
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= rows.length) return rows.map(mapReel);

  const a = rows[idx]!;
  const b = rows[swapWith]!;
  await prisma.$transaction([
    prisma.reel.update({
      where: { id: a.id },
      data: { sortOrder: b.sortOrder },
    }),
    prisma.reel.update({
      where: { id: b.id },
      data: { sortOrder: a.sortOrder },
    }),
  ]);
  return dbListReels();
}

/** Rewrite sortOrder for all reels (1-based display order). */
export async function dbReorderReels(
  orderedIds: string[],
): Promise<ReelRecord[]> {
  if (!orderedIds.length) {
    throw new BackendError("VALIDATION", "قائمة الترتيب فارغة");
  }
  const rows = await prisma.reel.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  const currentIds = new Set(rows.map((r) => r.id));
  if (
    orderedIds.length !== rows.length ||
    orderedIds.some((id) => !currentIds.has(id))
  ) {
    throw new BackendError(
      "VALIDATION",
      "ترتيب الريلز غير مكتمل — حدّث الصفحة وحاول مرة ثانية",
    );
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.reel.update({
        where: { id },
        data: { sortOrder: index + 1 },
      }),
    ),
  );

  return dbListReels();
}
