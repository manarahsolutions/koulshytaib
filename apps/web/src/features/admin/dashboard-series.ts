/**
 * Pure last-N-days series for admin dashboard charts.
 */

import { isSameIraqDay } from "@/lib/datetime/iraq-day";
import type { Order } from "@/types/order";
import { getDeliveredAt } from "@/features/admin/dashboard-metrics";

export type DayBucket = {
  /** YYYY-MM-DD in Iraq calendar approximation via local ISO date of noon UTC+3 */
  key: string;
  label: string;
  orderCount: number;
  revenueIqd: number;
};

function iraqDayKey(iso: string): string {
  const d = new Date(iso);
  // Format as Asia/Baghdad calendar day via en-CA for ISO-like key
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Baghdad",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function iraqDayLabel(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return key;
  const date = new Date(Date.UTC(y, m - 1, d, 9));
  return new Intl.DateTimeFormat("ar-IQ", {
    timeZone: "Asia/Baghdad",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

/** Last `days` Iraq calendar days including today, oldest first. */
export function buildLastDaysSeries(
  orders: Order[],
  days = 7,
  now: Date = new Date(),
): DayBucket[] {
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const probe = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    keys.push(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Baghdad",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(probe),
    );
  }

  const map = new Map<string, DayBucket>();
  for (const key of keys) {
    map.set(key, {
      key,
      label: iraqDayLabel(key),
      orderCount: 0,
      revenueIqd: 0,
    });
  }

  for (const order of orders) {
    const createdKey = iraqDayKey(order.createdAt);
    const bucket = map.get(createdKey);
    if (bucket) bucket.orderCount += 1;

    const deliveredAt = getDeliveredAt(order);
    if (deliveredAt && order.status === "delivered") {
      const deliveredKey = iraqDayKey(deliveredAt);
      const revBucket = map.get(deliveredKey);
      if (revBucket) revBucket.revenueIqd += order.pricing.total;
    }
  }

  return keys.map((k) => map.get(k)!);
}

export function getAttentionOrders(orders: Order[]): Order[] {
  return orders
    .filter((o) => o.status === "received" || o.status === "confirmed")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** @deprecated unused helper kept for clarity */
export function sameIraqDayProbe(iso: string, now: Date): boolean {
  return isSameIraqDay(iso, now);
}
