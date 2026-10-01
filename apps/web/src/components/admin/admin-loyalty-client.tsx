"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { LoyaltyCustomerSearch } from "@/components/admin/loyalty-customer-search";
import {
  LoyaltyCustomerCards,
  LoyaltyCustomerTable,
} from "@/components/admin/loyalty-customer-list";
import { LoyaltySettingsForm } from "@/components/admin/loyalty-settings-form";
import { StatCard } from "@/components/admin/stat-card";
import {
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/ui/admin-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getLoyaltyConfig } from "@/features/loyalty/loyalty-service";
import { getLoyaltyOverviewMetrics } from "@/features/loyalty/selectors";
import {
  useLoyaltyCustomerList,
  useLoyaltyRevision,
} from "@/features/loyalty/use-admin-loyalty";
import { formatPoints } from "@/lib/format/points";
import { useCustomers } from "@/features/customers/use-crm-customers";

export function AdminLoyaltyClient() {
  const [query, setQuery] = useState("");
  const [uiTick, setUiTick] = useState(0);
  const revision = useLoyaltyRevision();
  const customers = useCustomers();
  const items = useLoyaltyCustomerList(query);
  void revision;
  void uiTick;
  const config = getLoyaltyConfig();
  const overview = getLoyaltyOverviewMetrics();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="الولاء"
        description="نظام نقاط للزبائن الدائمين — واضح للطاقم: اكتساب عند التسليم، تواصل واتساب، وخصم يدوي بعد الاتفاق."
      />

      <AdminPanel>
        <h2 className="text-base font-semibold text-brand-navy">
          كيف يشتغل النظام؟
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pe-5 text-sm leading-relaxed text-text-muted">
          <li>
            <span className="font-medium text-text">فعّل الولاء</span> واضبط
            معدل الاكتساب (نقاط لكل دينار من إجمالي الطلب المكتمل).
          </li>
          <li>
            عند تحويل الطلب إلى{" "}
            <span className="font-medium text-text">مكتمل (delivered)</span>{" "}
            تُضاف النقاط تلقائياً إذا كان الاكتساب مفعّلاً والمعدل أكبر من صفر.
          </li>
          <li>
            من ملف الزبون في الولاء: شوف الرصيد،{" "}
            <span className="font-medium text-text">راسله واتساب</span>، واقترح
            خصم/مكافأة، ثم{" "}
            <span className="font-medium text-text">خصم النقاط</span> أو عدّل
            الرصيد يدوياً مع سبب واضح.
          </li>
          <li>
            الزبون{" "}
            <span className="font-medium text-text">ما يستبدل لوحده</span> من
            الموقع حالياً — كل الاستبدال عبر الطاقم.
          </li>
        </ol>
      </AdminPanel>

      <AdminPanel>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-brand-navy">
            الإعدادات
          </h2>
          <span
            className={
              config.enabled
                ? "rounded-md border border-success/25 bg-success-subtle px-2 py-1 text-xs font-semibold text-success"
                : "rounded-md border border-border bg-surface-warm px-2 py-1 text-xs font-semibold text-text-muted"
            }
          >
            {config.enabled ? "مفعّل" : "غير مفعّل"}
          </span>
        </div>
        <LoyaltySettingsForm onSaved={() => setUiTick((t) => t + 1)} />
      </AdminPanel>

      <section aria-label="مؤشرات الولاء">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="حسابات الولاء"
            value={String(overview.accountCount)}
          />
          <StatCard
            label="إجمالي الأرصدة"
            value={formatPoints(overview.totalBalance)}
          />
          <StatCard
            label="مكتسبة (عمر الحسابات)"
            value={formatPoints(overview.totalEarned)}
          />
          <StatCard
            label="مستبدلة"
            value={formatPoints(overview.totalRedeemed)}
          />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="loyalty-customers-heading">
        <div>
          <h2
            id="loyalty-customers-heading"
            className="text-lg font-semibold text-brand-navy"
          >
            زبائن الولاء
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            ابحث بالاسم أو الهاتف، افتح الملف للتعديل أو واتساب أو خصم النقاط.
          </p>
        </div>

        <LoyaltyCustomerSearch
          query={query}
          onQueryChange={setQuery}
          onClear={() => setQuery("")}
          showClear={query.trim().length > 0}
        />

        {customers.length === 0 ? (
          <EmptyState
            icon={<Users />}
            title="ماكو زبائن حالياً"
            description="بعد أول طلبات، يظهر الزبائن هنا مع حساب ولاء."
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Users />}
            title="ماكو زبائن مطابقين"
            description="جرّب مسح البحث."
            action={
              <button
                type="button"
                onClick={() => setQuery("")}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-primary px-5 text-sm font-semibold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              >
                مسح البحث
              </button>
            }
          />
        ) : (
          <>
            {overview.accountCount === 0 ? (
              <p className="text-sm text-text-muted" role="status">
                ماكو حسابات ولاء بعد — الحساب ينشأ مع طلب الزبون.
              </p>
            ) : null}
            <LoyaltyCustomerTable items={items} />
            <LoyaltyCustomerCards items={items} />
          </>
        )}
      </section>
    </div>
  );
}
