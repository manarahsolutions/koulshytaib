"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Gift, MessageCircle, UserRound } from "lucide-react";
import { CustomerTypeBadge } from "@/components/admin/customer-type-badge";
import { LoyaltyAdjustmentForm } from "@/components/admin/loyalty-adjustment-form";
import { LoyaltyRedeemForm } from "@/components/admin/loyalty-redeem-form";
import {
  LoyaltyTransactionCards,
  LoyaltyTransactionTable,
  LoyaltyTxnFilters,
} from "@/components/admin/loyalty-transaction-list";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
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
import {
  buildWaMeUrl,
  iraqiLocalToE164,
} from "@/features/notifications/whatsapp-deeplink";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { formatPoints } from "@/lib/format/points";

function buildLoyaltyWhatsAppText(input: {
  name: string;
  balance: number | null;
  earningEnabled: boolean;
  earnRate: number;
}): string {
  const name = input.name.trim() || "زبوننا الكريم";
  const lines = [
    `مرحبا ${name} 👋`,
    "تحية من كلشي طيب",
    "",
  ];
  if (input.balance != null) {
    lines.push(`رصيد نقاطك الحالي: ${formatPoints(input.balance)} نقطة`);
  } else {
    lines.push("حساب الولاء يُفعَّل مع طلباتك عندنا.");
  }
  if (input.earningEnabled && input.earnRate > 0) {
    lines.push(
      `تكسب نقاطاً على الطلبات المكتملة (معدل: ${input.earnRate} نقطة لكل دينار).`,
    );
  }
  lines.push("", "إذا تحب تستفيد من نقاطك، راسلنا هنا ونرتبلك خصم أو هدية.");
  return lines.join("\n");
}

export function AdminLoyaltyCustomerDetailClient() {
  const params = useParams<{ id: string }>();
  const customerId =
    typeof params.id === "string" ? params.id : params.id?.[0] ?? "";
  const revision = useLoyaltyRevision();
  const [txnFilter, setTxnFilter] = useState<LoyaltyTxnFilter>("all");
  const [, setTick] = useState(0);
  const [waError, setWaError] = useState<string | null>(null);

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

  const openWhatsApp = () => {
    setWaError(null);
    const e164 = iraqiLocalToE164(customer.phone);
    if (!e164) {
      setWaError("رقم الهاتف غير صالح لواتساب");
      return;
    }
    const text = buildLoyaltyWhatsAppText({
      name: customer.name ?? "",
      balance,
      earningEnabled: config.enabled && config.earning.enabled,
      earnRate: config.earning.pointsPerCurrencyUnit,
    });
    window.open(buildWaMeUrl(e164, text), "_blank", "noopener,noreferrer");
  };

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
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 gap-2"
          onClick={openWhatsApp}
          startIcon={<MessageCircle className="size-4" aria-hidden />}
        >
          واتساب الزبون
        </Button>
      </div>
      {waError ? (
        <p className="text-sm text-danger" role="alert">
          {waError}
        </p>
      ) : null}

      {!account ? (
        <EmptyState
          icon={<Gift />}
          title="لا يوجد حساب ولاء"
          description="الحساب ينشأ تلقائياً مع طلبات الزبون. تقدر تراسله واتساب من الزر أعلاه."
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

          <div className="rounded-lg border border-border-soft bg-surface-warm px-3 py-2 text-sm text-text-muted">
            <p>
              {config.enabled
                ? "النظام مفعّل."
                : "النظام غير مفعّل — فعّله من صفحة الولاء."}{" "}
              {config.earning.enabled && config.earning.pointsPerCurrencyUnit > 0
                ? `الاكتساب التلقائي: ${config.earning.pointsPerCurrencyUnit} نقطة/دينار عند التسليم.`
                : "الاكتساب التلقائي متوقف أو المعدل صفر."}{" "}
              {config.redemption.enabled
                ? "خصم النقاط مسموح من النموذج أدناه."
                : "خصم النقاط مقفول حتى تفعّله بالإعدادات."}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <LoyaltyRedeemForm
              customerId={customer.id}
              balance={balance ?? 0}
              onSuccess={() => setTick((n) => n + 1)}
            />
            <LoyaltyAdjustmentForm
              customerId={customer.id}
              onSuccess={() => setTick((n) => n + 1)}
            />
          </div>

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
