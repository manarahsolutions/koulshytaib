/**
 * Extended analytics with date ranges (server-only).
 */

import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { AnalyticsSnapshot } from "@/features/analytics/types";

export type AnalyticsRangePreset = "day" | "week" | "month" | "custom";

export type AnalyticsRangeInput = {
  preset?: AnalyticsRangePreset;
  from?: string;
  to?: string;
};

export type ExtendedAnalytics = AnalyticsSnapshot & {
  range: { from: string; to: string };
  daily: Array<{ day: string; orders: number; revenueIqd: number }>;
  newCustomers: number;
  returningCustomers: number;
  aov: number | null;
  couponOrders: number;
  couponDiscountTotal: number;
  peakHours: Array<{ hour: number; count: number }>;
  peakWeekdays: Array<{ weekday: number; label: string; count: number }>;
};

const WEEKDAY_AR = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

function resolveRange(input: AnalyticsRangeInput): { from: Date; to: Date } {
  const to = input.to ? new Date(input.to) : new Date();
  to.setHours(23, 59, 59, 999);
  let from: Date;
  if (input.preset === "custom" && input.from) {
    from = new Date(input.from);
  } else if (input.preset === "day") {
    from = new Date(to);
    from.setHours(0, 0, 0, 0);
  } else if (input.preset === "month") {
    from = new Date(to);
    from.setDate(from.getDate() - 29);
    from.setHours(0, 0, 0, 0);
  } else {
    // week default
    from = new Date(to);
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);
  }
  return { from, to };
}

function dayKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Baghdad",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export async function dbGetExtendedAnalytics(
  input: AnalyticsRangeInput = {},
): Promise<ExtendedAnalytics> {
  const { from, to } = resolveRange(input);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  const nonCancelled = orders.filter((o) => o.status !== "cancelled");
  const cancelledCount = orders.length - nonCancelled.length;
  const revenueIqd = nonCancelled.reduce((s, o) => s + o.total, 0);

  const byStatusMap = new Map<string, number>();
  for (const o of orders) {
    byStatusMap.set(o.status, (byStatusMap.get(o.status) ?? 0) + 1);
  }

  const productMap = new Map<
    string,
    { name: string; quantity: number; revenueIqd: number }
  >();
  for (const o of nonCancelled) {
    for (const item of o.items) {
      const cur = productMap.get(item.name) ?? {
        name: item.name,
        quantity: 0,
        revenueIqd: 0,
      };
      cur.quantity += item.quantity;
      cur.revenueIqd += item.lineTotal;
      productMap.set(item.name, cur);
    }
  }

  const dailyMap = new Map<string, { orders: number; revenueIqd: number }>();
  for (const o of orders) {
    const key = dayKey(o.createdAt);
    const cur = dailyMap.get(key) ?? { orders: 0, revenueIqd: 0 };
    cur.orders += 1;
    if (o.status !== "cancelled") cur.revenueIqd += o.total;
    dailyMap.set(key, cur);
  }

  const customerFirst = await prisma.order.groupBy({
    by: ["customerId"],
    _min: { createdAt: true },
  });
  const firstMap = new Map(
    customerFirst.map((r) => [r.customerId, r._min.createdAt]),
  );
  const customersInRange = new Set(orders.map((o) => o.customerId));
  let newCustomers = 0;
  let returningCustomers = 0;
  for (const id of customersInRange) {
    const first = firstMap.get(id);
    if (first && first >= from && first <= to) newCustomers += 1;
    else returningCustomers += 1;
  }

  const hourMap = new Map<number, number>();
  const weekdayMap = new Map<number, number>();
  for (const o of orders) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Baghdad",
      hour: "numeric",
      hour12: false,
      weekday: "short",
    }).formatToParts(o.createdAt);
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
    const wd = o.createdAt.getDay();
    weekdayMap.set(wd, (weekdayMap.get(wd) ?? 0) + 1);
  }

  const couponOrders = nonCancelled.filter((o) => (o.couponDiscount ?? 0) > 0);
  const couponDiscountTotal = couponOrders.reduce(
    (s, o) => s + (o.couponDiscount ?? 0),
    0,
  );

  return {
    range: { from: from.toISOString(), to: to.toISOString() },
    orderCount: nonCancelled.length,
    cancelledCount,
    revenueIqd,
    byStatus: [...byStatusMap.entries()].map(([status, count]) => ({
      status,
      count,
    })),
    topProducts: [...productMap.values()]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10),
    daily: [...dailyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, v]) => ({ day, ...v })),
    newCustomers,
    returningCustomers,
    aov:
      nonCancelled.length === 0
        ? null
        : Math.round(revenueIqd / nonCancelled.length),
    couponOrders: couponOrders.length,
    couponDiscountTotal,
    peakHours: [...hourMap.entries()]
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    peakWeekdays: [...weekdayMap.entries()]
      .map(([weekday, count]) => ({
        weekday,
        label: WEEKDAY_AR[weekday] ?? String(weekday),
        count,
      }))
      .sort((a, b) => b.count - a.count),
  };
}

export type LeadRow = {
  customerId: string;
  name: string;
  phone: string;
  orderCount: number;
  lastOrderAt: string | null;
  spendIqd: number;
};

export type LeadsFilter = {
  kind?: "all" | "inactive" | "vip" | "new_week";
  inactiveDays?: number;
  vipMinSpend?: number;
};

export async function dbListLeads(
  filter: LeadsFilter = {},
): Promise<LeadRow[]> {
  const customers = await prisma.customer.findMany({
    include: {
      orders: {
        where: { status: { not: "cancelled" } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const inactiveDays = filter.inactiveDays ?? 30;
  const vipMin = filter.vipMinSpend ?? 50_000;

  const rows: LeadRow[] = customers.map((c) => {
    const spend = c.orders.reduce((s, o) => s + o.total, 0);
    const last = c.orders[0]?.createdAt ?? null;
    return {
      customerId: c.id,
      name: c.name ?? "",
      phone: c.phone,
      orderCount: c.orders.length,
      lastOrderAt: last?.toISOString() ?? null,
      spendIqd: spend,
    };
  });

  const kind = filter.kind ?? "all";
  return rows.filter((r) => {
    if (kind === "vip") return r.spendIqd >= vipMin;
    if (kind === "new_week") {
      // customer created this week — approximate via first order or skip
      return (
        r.orderCount > 0 &&
        r.lastOrderAt != null &&
        new Date(r.lastOrderAt).getTime() >= weekAgo &&
        r.orderCount <= 2
      );
    }
    if (kind === "inactive") {
      if (!r.lastOrderAt) return true;
      const age =
        (now - new Date(r.lastOrderAt).getTime()) / (24 * 60 * 60 * 1000);
      return age >= inactiveDays;
    }
    return true;
  });
}
