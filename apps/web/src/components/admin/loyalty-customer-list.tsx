"use client";

import Link from "next/link";
import { CustomerTypeBadge } from "@/components/admin/customer-type-badge";
import type { LoyaltyCustomerListItem } from "@/features/loyalty/selectors";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { formatPoints } from "@/lib/format/points";
import { cn } from "@/lib/utils/cn";

export type LoyaltyCustomerListProps = {
  items: LoyaltyCustomerListItem[];
};

export function LoyaltyCustomerTable({ items }: LoyaltyCustomerListProps) {
  return (
    <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
      <table className="w-full min-w-[48rem] border-collapse text-sm">
        <caption className="sr-only">زبائن الولاء</caption>
        <thead className="bg-surface-warm text-start">
          <tr>
            <th scope="col" className="px-3 py-3 font-semibold">
              الزبون
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              الهاتف
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              الرصيد
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              المكتسب
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              المستبدل
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              آخر حركة
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.customer.id}
              className="border-t border-border-soft hover:bg-surface-warm/60"
            >
              <td className="px-3 py-3">
                <Link
                  href={`/admin/loyalty/customers/${item.customer.id}`}
                  className="font-semibold text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                >
                  {item.customer.name?.trim() || "بدون اسم"}
                </Link>
              </td>
              <td className="px-3 py-3 tabular-nums" dir="ltr">
                {item.customer.phone}
              </td>
              <td className="px-3 py-3 tabular-nums">
                {item.account && item.balance !== null
                  ? formatPoints(item.balance)
                  : "لا يوجد حساب ولاء"}
              </td>
              <td className="px-3 py-3 tabular-nums">
                {item.lifetimeEarned !== null
                  ? formatPoints(item.lifetimeEarned)
                  : "—"}
              </td>
              <td className="px-3 py-3 tabular-nums">
                {item.lifetimeRedeemed !== null
                  ? formatPoints(item.lifetimeRedeemed)
                  : "—"}
              </td>
              <td className="px-3 py-3 text-text-muted">
                {item.lastActivityAt
                  ? formatIraqDateTime(item.lastActivityAt)
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LoyaltyCustomerCards({ items }: LoyaltyCustomerListProps) {
  return (
    <ul className="space-y-3 md:hidden">
      {items.map((item) => (
        <li key={item.customer.id}>
          <Link
            href={`/admin/loyalty/customers/${item.customer.id}`}
            className={cn(
              "block rounded-lg border border-border bg-surface-elevated p-4",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-brand-navy">
                  {item.customer.name?.trim() || "بدون اسم"}
                </p>
                <p className="typo-caption mt-1 text-text-muted" dir="ltr">
                  {item.customer.phone}
                </p>
              </div>
              <CustomerTypeBadge
                classification={
                  item.typeLabel === "عائد" ? "returning" : "new"
                }
              />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="typo-caption text-text-subtle">الرصيد</dt>
                <dd className="tabular-nums font-semibold">
                  {item.account && item.balance !== null
                    ? formatPoints(item.balance)
                    : "لا يوجد حساب ولاء"}
                </dd>
              </div>
              <div>
                <dt className="typo-caption text-text-subtle">آخر حركة</dt>
                <dd>
                  {item.lastActivityAt
                    ? formatIraqDateTime(item.lastActivityAt)
                    : "—"}
                </dd>
              </div>
            </dl>
          </Link>
        </li>
      ))}
    </ul>
  );
}
