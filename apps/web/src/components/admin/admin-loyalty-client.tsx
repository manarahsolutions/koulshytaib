"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { LoyaltyCustomerSearch } from "@/components/admin/loyalty-customer-search";
import {
  LoyaltyCustomerCards,
  LoyaltyCustomerTable,
} from "@/components/admin/loyalty-customer-list";
import { LoyaltyEnableToggle } from "@/components/admin/loyalty-enable-toggle";
import { StatCard } from "@/components/admin/stat-card";
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
      <header>
        <h1 className="text-2xl font-bold text-brand-navy">الولاء</h1>
        <p className="mt-1 text-sm text-text-muted">
          إدارة نقاط الولاء وحركة أرصدة الزبائن
        </p>
      </header>

      <section
        className="rounded-lg border border-border bg-surface-elevated p-4"
        aria-labelledby="loyalty-status-heading"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2
            id="loyalty-status-heading"
            className="text-base font-semibold text-brand-navy"
          >
            حالة النظام
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
          <LoyaltyEnableToggle
            enabled={config.enabled}
            onChanged={() => setUiTick((t) => t + 1)}
          />
        </div>
        {!config.enabled ? (
          <p className="mt-2 text-sm text-text-muted" role="status">
            نظام الولاء غير مفعّل حالياً، لذلك لا يمكن كسب أو استبدال النقاط.
          </p>
        ) : null}

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="typo-caption text-text-subtle">اكتساب النقاط</dt>
            <dd>
              {config.earning.enabled ? "مفعّل" : "غير مفعّل"}
              <span className="mt-0.5 block text-text-muted">
                النقاط لكل دينار: {config.earning.pointsPerCurrencyUnit}
              </span>
            </dd>
          </div>
          <div>
            <dt className="typo-caption text-text-subtle">استبدال النقاط</dt>
            <dd>
              {config.redemption.enabled ? "مفعّل" : "غير متاح حالياً"}
              <span className="mt-0.5 block text-text-muted">
                الحد الأدنى: {config.redemption.minimumPoints} · معدل التحويل:{" "}
                {config.redemption.pointsPerCurrencyUnit}
              </span>
            </dd>
          </div>
          <div>
            <dt className="typo-caption text-text-subtle">اكتساب تلقائي</dt>
            <dd className="text-text-muted">
              {config.earning.enabled
                ? "حسب إعدادات الكسب"
                : "اكتساب النقاط غير مفعّل حالياً"}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-label="مؤشرات الولاء">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="عدد حسابات الولاء"
            value={String(overview.accountCount)}
          />
          <StatCard
            label="إجمالي أرصدة النقاط"
            value={formatPoints(overview.totalBalance)}
          />
          <StatCard
            label="إجمالي النقاط المكتسبة"
            value={formatPoints(overview.totalEarned)}
          />
          <StatCard
            label="إجمالي النقاط المستبدلة"
            value={formatPoints(overview.totalRedeemed)}
          />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="loyalty-customers-heading">
        <h2
          id="loyalty-customers-heading"
          className="text-lg font-semibold text-brand-navy"
        >
          زبائن الولاء
        </h2>

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
            description="بعد إنشاء زبائن من الطلبات، تظهر هنا."
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
        ) : overview.accountCount === 0 ? (
          <>
            <p className="text-sm text-text-muted" role="status">
              ماكو حسابات ولاء حالياً — الزبائن أدناه بدون حساب ولاء بعد.
            </p>
            <LoyaltyCustomerTable items={items} />
            <LoyaltyCustomerCards items={items} />
          </>
        ) : (
          <>
            <LoyaltyCustomerTable items={items} />
            <LoyaltyCustomerCards items={items} />
          </>
        )}
      </section>
    </div>
  );
}
