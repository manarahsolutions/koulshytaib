"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Gift, UserRound } from "lucide-react";
import { CustomerTypeBadge } from "@/components/admin/customer-type-badge";
import { LoyaltyAdjustmentForm } from "@/components/admin/loyalty-adjustment-form";
import {
  LoyaltyTransactionCards,
  LoyaltyTransactionTable,
  LoyaltyTxnFilters,
} from "@/components/admin/loyalty-transaction-list";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCustomerById } from "@/features/customers/customer-service";
import {
  buildCustomerListItem,
  getCustomerType,
} from "@/features/customers/selectors";
import {
  filterLoyaltyTransactions,
  type LoyaltyTxnFilter,
} from "@/features/loyalty/selectors";
import {
  getLoyaltyAccount,
  getLoyaltyBalance,
  getLifetimeEarned,
  getLifetimeRedeemed,
  getLoyaltyConfig,
  getLoyaltyTransactions,
} from "@/features/loyalty/loyalty-service";
import { useLoyaltyRevision } from "@/features/loyalty/use-admin-loyalty";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { formatPoints } from "@/lib/format/points";

export function AdminLoyaltyCustomerDetailClient() {
  const params = useParams<{ id: string }>();
  const customerId =
    typeof params.id === "string" ? params.id : params.id?.[0] ?? "";
  const revision = useLoyaltyRevision();
  const [txnFilter, setTxnFilter] = useState<LoyaltyTxnFilter>("all");
  const [, setTick] = useState(0);

  const customer = useMemo(
    () => (customerId ? getCustomerById(customerId) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customerId, revision],
  );

  const account = useMemo(
    () => (customerId ? getLoyaltyAccount(customerId) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customerId, revision],
  );

  const config = getLoyaltyConfig();

  const transactions = useMemo(() => {
    if (!customerId || !account) return [];
    return getLoyaltyTransactions(customerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, account, revision]);

  const filtered = useMemo(
    () => filterLoyaltyTransactions(transactions, txnFilter),
    [transactions, txnFilter],
  );

  if (!customer) {
    return (
      <EmptyState
        icon={<UserRound />}
        title="ما لكينا هذا الزبون"
        description="ربما انمسحت بيانات الذاكرة بعد إعادة التحميل."
        action={
          <Link
            href="/admin/loyalty"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-primary px-5 text-sm font-semibold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            رجوع للولاء
          </Link>
        }
      />
    );
  }

  const classification = getCustomerType(
    buildCustomerListItem(customer).metrics,
  );
  const balance = account ? getLoyaltyBalance(customer.id) : null;
  const earned = account ? getLifetimeEarned(customer.id) : null;
  const redeemed = account ? getLifetimeRedeemed(customer.id) : null;
  const latest = transactions[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="typo-caption text-text-muted">
            <Link
              href="/admin/loyalty"
              className="text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              الولاء
            </Link>
            <span className="mx-1" aria-hidden>
              /
            </span>
            الزبون
          </p>
          <h1 className="mt-1 text-2xl font-bold text-brand-navy">
            {customer.name?.trim() || "بدون اسم"}
          </h1>
          <p className="mt-1 text-sm text-text-muted" dir="ltr">
            {customer.phone}
          </p>
        </div>
        <CustomerTypeBadge classification={classification} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/admin/customers/${customer.id}`}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-surface-elevated px-4 text-sm font-medium text-text hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          عرض ملف الزبون
        </Link>
      </div>

      {!account ? (
        <EmptyState
          icon={<Gift />}
          title="لا يوجد حساب ولاء"
          description="ما اننشأ حساب ولاء لهذا الزبون بعد."
        />
      ) : (
        <>
          <section aria-label="رصيد الولاء">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="الرصيد الحالي"
                value={formatPoints(balance ?? 0)}
              />
              <StatCard
                label="إجمالي المكتسب"
                value={formatPoints(earned ?? 0)}
              />
              <StatCard
                label="إجمالي المستبدل"
                value={formatPoints(redeemed ?? 0)}
              />
              <StatCard
                label="آخر حركة"
                value={
                  latest ? formatIraqDateTime(latest.createdAt) : "—"
                }
              />
            </div>
          </section>

          <p className="rounded-md border border-border bg-surface-warm px-3 py-2 text-sm text-text-muted" role="status">
            {config.redemption.enabled
              ? "استبدال النقاط مفعّل في الإعدادات."
              : "استبدال النقاط غير متاح حالياً."}{" "}
            {config.earning.enabled
              ? ""
              : "اكتساب النقاط غير مفعّل حالياً."}
          </p>

          <LoyaltyAdjustmentForm
            customerId={customer.id}
            onSuccess={() => setTick((n) => n + 1)}
          />

          <section className="space-y-3" aria-labelledby="loyalty-history-heading">
            <h2
              id="loyalty-history-heading"
              className="text-lg font-semibold text-brand-navy"
            >
              سجل النقاط
            </h2>
            <LoyaltyTxnFilters filter={txnFilter} onChange={setTxnFilter} />
            {transactions.length === 0 ? (
              <EmptyState title="ماكو حركات نقاط حالياً" />
            ) : filtered.length === 0 ? (
              <EmptyState title="ماكو حركات مطابقة لهذا الفلتر" />
            ) : (
              <>
                <LoyaltyTransactionTable transactions={filtered} />
                <LoyaltyTransactionCards transactions={filtered} />
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
