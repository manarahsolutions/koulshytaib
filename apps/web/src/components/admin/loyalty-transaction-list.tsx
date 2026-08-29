"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import {
  getLoyaltySourceLabel,
  getLoyaltyTxnTypeLabel,
  getRelatedOrderId,
  getTransactionDisplayPoints,
  type LoyaltyTxnFilter,
} from "@/features/loyalty/selectors";
import { formatOrderRef } from "@/features/admin/format";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { formatPointsSigned } from "@/lib/format/points";
import type { LoyaltyTransaction } from "@/features/loyalty/types";

const FILTERS: Array<{ value: LoyaltyTxnFilter; label: string }> = [
  { value: "all", label: "الكل" },
  { value: "earn", label: "اكتساب" },
  { value: "redeem", label: "استبدال" },
  { value: "adjust", label: "تعديل" },
];

export type LoyaltyTxnFiltersProps = {
  filter: LoyaltyTxnFilter;
  onChange: (value: LoyaltyTxnFilter) => void;
};

export function LoyaltyTxnFilters({ filter, onChange }: LoyaltyTxnFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="تصفية الحركات">
      {FILTERS.map((item) => {
        const active = filter === item.value;
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex h-11 items-center rounded-md border px-3 text-sm font-medium",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              active
                ? "border-brand-navy bg-brand-navy text-on-primary"
                : "border-border bg-surface-elevated text-text hover:bg-surface-warm",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export type LoyaltyTransactionListProps = {
  transactions: LoyaltyTransaction[];
};

export function LoyaltyTransactionTable({
  transactions,
}: LoyaltyTransactionListProps) {
  return (
    <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <caption className="sr-only">سجل النقاط</caption>
        <thead className="bg-surface-warm text-start">
          <tr>
            <th scope="col" className="px-3 py-3 font-semibold">
              النوع
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              النقاط
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              المصدر
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              السبب
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              الوقت
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => {
            const orderId = getRelatedOrderId(txn);
            const source = getLoyaltySourceLabel(txn);
            return (
              <tr key={txn.id} className="border-t border-border-soft">
                <td className="px-3 py-3 font-medium">
                  {getLoyaltyTxnTypeLabel(txn.type)}
                </td>
                <td
                  className={cn(
                    "px-3 py-3 tabular-nums font-semibold",
                    getTransactionDisplayPoints(txn) < 0
                      ? "text-danger"
                      : getTransactionDisplayPoints(txn) > 0
                        ? "text-success"
                        : "text-text",
                  )}
                >
                  {formatPointsSigned(getTransactionDisplayPoints(txn))}
                </td>
                <td className="px-3 py-3 text-text-muted">
                  {source ?? "—"}
                  {orderId ? (
                    <>
                      {" · "}
                      <Link
                        href={`/admin/orders/${orderId}`}
                        className="text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                      >
                        الطلب المرتبط ({formatOrderRef(orderId)})
                      </Link>
                    </>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-text-muted">{txn.reason || "—"}</td>
                <td className="px-3 py-3 text-text-muted">
                  {formatIraqDateTime(txn.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function LoyaltyTransactionCards({
  transactions,
}: LoyaltyTransactionListProps) {
  return (
    <ul className="space-y-3 md:hidden">
      {transactions.map((txn) => {
        const orderId = getRelatedOrderId(txn);
        const display = getTransactionDisplayPoints(txn);
        return (
          <li
            key={txn.id}
            className="rounded-lg border border-border bg-surface-elevated p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-brand-navy">
                {getLoyaltyTxnTypeLabel(txn.type)}
              </p>
              <p
                className={cn(
                  "tabular-nums text-sm font-semibold",
                  display < 0 ? "text-danger" : "text-success",
                )}
              >
                {formatPointsSigned(display)}
              </p>
            </div>
            <p className="typo-caption mt-2 text-text-muted">
              {getLoyaltySourceLabel(txn) ?? "—"} ·{" "}
              {formatIraqDateTime(txn.createdAt)}
            </p>
            {txn.reason ? (
              <p className="mt-1 text-sm text-text">{txn.reason}</p>
            ) : null}
            {orderId ? (
              <Link
                href={`/admin/orders/${orderId}`}
                className="mt-2 inline-flex h-11 items-center text-sm font-medium text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              >
                الطلب المرتبط ({formatOrderRef(orderId)})
              </Link>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
