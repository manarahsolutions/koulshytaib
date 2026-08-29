"use client";

import Link from "next/link";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import {
  formatOrderRef,
  getPaymentLabel,
} from "@/features/admin/format";
import { countOrderItems } from "@/features/admin/dashboard-metrics";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { formatPriceIQD } from "@/lib/format/price";
import { cn } from "@/lib/utils/cn";
import type { Order } from "@/types/order";

export type OrderListProps = {
  orders: Order[];
};

export function OrderTable({ orders }: OrderListProps) {
  return (
    <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
      <table className="w-full min-w-[44rem] border-collapse text-sm">
        <caption className="sr-only">قائمة الطلبات</caption>
        <thead className="bg-surface-warm text-start">
          <tr>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              الطلب
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              العميل
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              العناصر
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              الإجمالي
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              الدفع
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              الحالة
            </th>
            <th scope="col" className="px-3 py-3 font-semibold text-text">
              الوقت
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-t border-border-soft hover:bg-surface-warm/60"
            >
              <td className="px-3 py-3">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-semibold text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                >
                  {formatOrderRef(order.id)}
                </Link>
              </td>
              <td className="px-3 py-3 text-text">{order.customer.name}</td>
              <td className="px-3 py-3 tabular-nums text-text">
                {countOrderItems(order)}
              </td>
              <td className="px-3 py-3 tabular-nums text-text">
                {formatPriceIQD(order.pricing.total)}
              </td>
              <td className="px-3 py-3 text-text-muted">
                {getPaymentLabel(order.payment.method)}
              </td>
              <td className="px-3 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-3 py-3 text-text-muted">
                {formatIraqDateTime(order.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OrderCards({ orders }: OrderListProps) {
  return (
    <ul className="space-y-3 md:hidden">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/admin/orders/${order.id}`}
            className={cn(
              "block rounded-lg border border-border bg-surface-elevated p-4",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-brand-navy">
                  {formatOrderRef(order.id)}
                </p>
                <p className="mt-1 text-sm text-text">{order.customer.name}</p>
                <p className="typo-caption mt-1 text-text-muted" dir="ltr">
                  {order.customer.phone}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="typo-caption text-text-subtle">العناصر</dt>
                <dd className="tabular-nums">{countOrderItems(order)}</dd>
              </div>
              <div>
                <dt className="typo-caption text-text-subtle">الإجمالي</dt>
                <dd className="tabular-nums">
                  {formatPriceIQD(order.pricing.total)}
                </dd>
              </div>
              <div>
                <dt className="typo-caption text-text-subtle">الدفع</dt>
                <dd>{getPaymentLabel(order.payment.method)}</dd>
              </div>
              <div>
                <dt className="typo-caption text-text-subtle">الوقت</dt>
                <dd>{formatIraqDateTime(order.createdAt)}</dd>
              </div>
            </dl>
          </Link>
        </li>
      ))}
    </ul>
  );
}
