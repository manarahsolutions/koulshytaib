"use client";

import Link from "next/link";
import { CustomerTypeBadge } from "@/components/admin/customer-type-badge";
import type { CustomerListItem } from "@/features/customers/selectors";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { formatPriceIQD } from "@/lib/format/price";
import { cn } from "@/lib/utils/cn";

export type CustomerListProps = {
  items: CustomerListItem[];
};

export function CustomerTable({ items }: CustomerListProps) {
  return (
    <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
      <table className="w-full min-w-[48rem] border-collapse text-sm">
        <caption className="sr-only">قائمة الزبائن</caption>
        <thead className="bg-surface-warm text-start">
          <tr>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              الزبون
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              الهاتف
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              الطلبات المكتملة
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              المصروف
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              متوسط الطلب
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              آخر طلب مكتمل
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              النوع
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ customer, metrics }) => (
            <tr
              key={customer.id}
              className="border-t border-border-soft hover:bg-surface-warm/60"
            >
              <td className="px-3 py-3">
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="font-semibold text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                >
                  {customer.name?.trim() || "بدون اسم"}
                </Link>
              </td>
              <td className="px-3 py-3 tabular-nums text-text" dir="ltr">
                {customer.phone}
              </td>
              <td className="px-3 py-3 tabular-nums text-text">
                {metrics.completedOrders}
              </td>
              <td className="px-3 py-3 tabular-nums text-text">
                {formatPriceIQD(metrics.totalSpend)}
              </td>
              <td className="px-3 py-3 tabular-nums text-text">
                {metrics.completedOrders === 0
                  ? "—"
                  : formatPriceIQD(Math.round(metrics.averageOrderValue))}
              </td>
              <td className="px-3 py-3 text-text-muted">
                {metrics.lastDeliveredAt
                  ? formatIraqDateTime(metrics.lastDeliveredAt)
                  : "—"}
              </td>
              <td className="px-3 py-3">
                <CustomerTypeBadge classification={metrics.classification} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CustomerCards({ items }: CustomerListProps) {
  return (
    <ul className="space-y-3 md:hidden">
      {items.map(({ customer, metrics }) => (
        <li key={customer.id}>
          <Link
            href={`/admin/customers/${customer.id}`}
            className={cn(
              "block rounded-lg border border-border bg-surface-elevated p-4",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-brand-navy">
                  {customer.name?.trim() || "بدون اسم"}
                </p>
                <p className="typo-caption mt-1 text-text-muted" dir="ltr">
                  {customer.phone}
                </p>
              </div>
              <CustomerTypeBadge classification={metrics.classification} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="typo-caption text-text-subtle">مكتملة</dt>
                <dd className="tabular-nums">{metrics.completedOrders}</dd>
              </div>
              <div>
                <dt className="typo-caption text-text-subtle">المصروف</dt>
                <dd className="tabular-nums">
                  {formatPriceIQD(metrics.totalSpend)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="typo-caption text-text-subtle">آخر طلب مكتمل</dt>
                <dd>
                  {metrics.lastDeliveredAt
                    ? formatIraqDateTime(metrics.lastDeliveredAt)
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
