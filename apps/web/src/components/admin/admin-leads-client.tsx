"use client";

import { useState } from "react";
import { fetchLeadsAction } from "@/app/actions/backend";
import {
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/ui/admin-page-header";
import { Button } from "@/components/ui/button";
import type { LeadRow } from "@/features/analytics/db-analytics-extended";
import { downloadCsv, toCsv } from "@/lib/csv/download-csv";
import { formatPriceIQD } from "@/lib/format/price";

export function AdminLeadsClient({ initial }: { initial: LeadRow[] }) {
  const [rows, setRows] = useState(initial);
  const [kind, setKind] = useState<"all" | "inactive" | "vip" | "new_week">(
    "all",
  );
  const [busy, setBusy] = useState(false);

  const reload = async (next: typeof kind) => {
    setBusy(true);
    setKind(next);
    const result = await fetchLeadsAction({ kind: next });
    if (result.ok) setRows(result.data);
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Leads"
        description="اسم ورقم واتساب وملخص الطلبات — للتصدير والمتابعة التسويقية."
        actions={
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              downloadCsv(
                "leads.csv",
                toCsv(
                  rows.map((r) => ({
                    name: r.name,
                    phone: r.phone,
                    orders: r.orderCount,
                    lastOrderAt: r.lastOrderAt ?? "",
                    spendIqd: r.spendIqd,
                  })),
                ),
              )
            }
          >
            تصدير CSV
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "الكل"],
            ["inactive", "خاملون 30 يوم"],
            ["vip", "VIP"],
            ["new_week", "جدد تقريباً"],
          ] as const
        ).map(([k, label]) => (
          <Button
            key={k}
            type="button"
            size="sm"
            variant={kind === k ? "primary" : "outline"}
            loading={busy && kind === k}
            onClick={() => void reload(k)}
          >
            {label}
          </Button>
        ))}
      </div>

      <AdminPanel padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="border-b border-border-soft text-text-muted">
              <tr>
                <th className="px-4 py-3 text-start font-medium">الاسم</th>
                <th className="px-4 py-3 text-start font-medium">الهاتف</th>
                <th className="px-4 py-3 text-start font-medium">طلبات</th>
                <th className="px-4 py-3 text-start font-medium">آخر طلب</th>
                <th className="px-4 py-3 text-start font-medium">الإنفاق</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.customerId} className="border-b border-border-soft">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 tabular-nums" dir="ltr">
                    {r.phone}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.orderCount}</td>
                  <td className="px-4 py-3 typo-caption text-text-muted">
                    {r.lastOrderAt
                      ? new Date(r.lastOrderAt).toLocaleDateString("ar-IQ")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatPriceIQD(r.spendIqd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <p className="p-4 text-sm text-text-muted">ماكو نتائج لهذا الفلتر.</p>
        ) : null}
      </AdminPanel>
    </div>
  );
}
