/**
 * Read-only analytics aggregates from Order / OrderItem.
 */

import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { AnalyticsSnapshot } from "@/features/analytics/types";

export type { AnalyticsSnapshot } from "@/features/analytics/types";

export async function dbGetAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  const [byStatus, revenueAgg, cancelledCount, top] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: { status: { not: "cancelled" } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.order.count({ where: { status: "cancelled" } }),
    prisma.orderItem.groupBy({
      by: ["name"],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 8,
    }),
  ]);

  return {
    orderCount: revenueAgg._count._all,
    cancelledCount,
    revenueIqd: revenueAgg._sum.total ?? 0,
    byStatus: byStatus.map((r) => ({
      status: r.status,
      count: r._count._all,
    })),
    topProducts: top.map((r) => ({
      name: r.name,
      quantity: r._sum.quantity ?? 0,
      revenueIqd: r._sum.lineTotal ?? 0,
    })),
  };
}
