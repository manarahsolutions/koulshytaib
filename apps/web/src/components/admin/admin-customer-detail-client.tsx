"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { UserRound } from "lucide-react";
import { updateCustomerAction } from "@/app/actions/backend";
import { CustomerTypeBadge } from "@/components/admin/customer-type-badge";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { countOrderItems } from "@/features/admin/dashboard-metrics";
import { formatOrderRef } from "@/features/admin/format";
import { upsertCustomerInCache } from "@/features/customers/customer-repository";
import { getCustomerById } from "@/features/customers/customer-service";
import {
  getCustomerLastDeliveredOrder,
  getCustomerLastOrder,
  getCustomerMetrics,
  getCustomerOrders,
  getCustomerStatusLabel,
} from "@/features/customers/selectors";
import type { Customer } from "@/features/customers/types";
import { useCrmRevision } from "@/features/customers/use-crm-customers";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { formatPriceIQD } from "@/lib/format/price";
import { cn } from "@/lib/utils/cn";

function CustomerEditForm({ customer }: { customer: Customer }) {
  const [editName, setEditName] = useState(customer.name ?? "");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">(
    customer.status,
  );
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editOk, setEditOk] = useState<string | null>(null);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setEditBusy(true);
    setEditError(null);
    setEditOk(null);
    try {
      const result = await updateCustomerAction(customer.id, {
        name: editName,
        status: editStatus,
      });
      if (!result.ok) {
        setEditError(result.message);
        return;
      }
      upsertCustomerInCache(result.data);
      setEditName(result.data.name ?? "");
      setEditStatus(result.data.status);
      setEditOk("تم حفظ بيانات الزبون");
    } finally {
      setEditBusy(false);
    }
  };

  return (
    <section
      className="rounded-lg border border-border bg-surface-elevated p-4"
      aria-labelledby="customer-edit-heading"
    >
      <h2
        id="customer-edit-heading"
        className="text-base font-semibold text-brand-navy"
      >
        تعديل البيانات
      </h2>
      <form onSubmit={(e) => void onSave(e)} className="mt-3 space-y-3">
        <div>
          <label htmlFor="cust-edit-name" className="mb-1 block text-sm">
            الاسم
          </label>
          <Input
            id="cust-edit-name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="cust-edit-status" className="mb-1 block text-sm">
            الحالة
          </label>
          <Select
            id="cust-edit-status"
            value={editStatus}
            onChange={(e) =>
              setEditStatus(e.target.value as "active" | "inactive")
            }
          >
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </Select>
        </div>
        {editError ? (
          <p className="text-sm text-danger" role="alert">
            {editError}
          </p>
        ) : null}
        {editOk ? (
          <p className="text-sm text-success" role="status">
            {editOk}
          </p>
        ) : null}
        <Button type="submit" size="sm" loading={editBusy}>
          حفظ
        </Button>
      </form>
    </section>
  );
}

export function AdminCustomerDetailClient() {
  const params = useParams<{ id: string }>();
  const customerId =
    typeof params.id === "string" ? params.id : params.id?.[0] ?? "";
  const revision = useCrmRevision();

  const customer = useMemo(
    () => (customerId ? getCustomerById(customerId) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customerId, revision],
  );

  const metrics = useMemo(
    () => (customerId ? getCustomerMetrics(customerId) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customerId, revision],
  );

  const orders = useMemo(
    () => (customerId ? getCustomerOrders(customerId) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customerId, revision],
  );

  const lastDelivered = customerId
    ? getCustomerLastDeliveredOrder(customerId)
    : null;
  const lastAny = customerId ? getCustomerLastOrder(customerId) : null;

  if (!customer || !metrics) {
    return (
      <EmptyState
        icon={<UserRound />}
        title="ما لكينا هذا الزبون"
        description="ربما انمسحت بيانات الذاكرة بعد إعادة التحميل."
        action={
          <Link
            href="/admin/customers"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-primary px-5 text-sm font-semibold text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            رجوع للزبائن
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="typo-caption text-text-muted">
            <Link
              href="/admin/customers"
              className="text-brand-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              الزبائن
            </Link>
            <span className="mx-1" aria-hidden>
              /
            </span>
            الملف
          </p>
          <h1 className="mt-1 text-2xl font-bold text-brand-navy">
            {customer.name?.trim() || "بدون اسم"}
          </h1>
          <p className="mt-1 text-sm text-text-muted" dir="ltr">
            {customer.phone}
          </p>
        </div>
        <CustomerTypeBadge classification={metrics.classification} />
      </div>

      <CustomerEditForm key={customer.id} customer={customer} />

      <section
        className="rounded-lg border border-border bg-surface-elevated p-4"
        aria-labelledby="customer-summary-heading"
      >
        <h2
          id="customer-summary-heading"
          className="text-base font-semibold text-brand-navy"
        >
          ملخص الزبون
        </h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="typo-caption text-text-subtle">الاسم</dt>
            <dd>{customer.name?.trim() || "—"}</dd>
          </div>
          <div>
            <dt className="typo-caption text-text-subtle">الهاتف</dt>
            <dd dir="ltr">{customer.phone}</dd>
          </div>
          <div>
            <dt className="typo-caption text-text-subtle">الحالة</dt>
            <dd>{getCustomerStatusLabel(customer.status)}</dd>
          </div>
          <div>
            <dt className="typo-caption text-text-subtle">نوع الزبون</dt>
            <dd>
              <CustomerTypeBadge classification={metrics.classification} />
            </dd>
          </div>
          <div>
            <dt className="typo-caption text-text-subtle">تاريخ إنشاء السجل</dt>
            <dd>{formatIraqDateTime(customer.createdAt)}</dd>
          </div>
          <div>
            <dt className="typo-caption text-text-subtle">آخر طلب مكتمل</dt>
            <dd>
              {lastDelivered
                ? formatIraqDateTime(
                    metrics.lastDeliveredAt ?? lastDelivered.createdAt,
                  )
                : "لا توجد طلبات مكتملة"}
            </dd>
          </div>
          {lastAny ? (
            <div className="sm:col-span-2">
              <dt className="typo-caption text-text-subtle">
                آخر طلب (أي حالة)
              </dt>
              <dd className="flex flex-wrap items-center gap-2">
                <span>{formatIraqDateTime(lastAny.createdAt)}</span>
                <OrderStatusBadge status={lastAny.status} />
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section aria-label="مؤشرات الزبون">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="إجمالي الطلبات المكتملة"
            value={String(metrics.completedOrders)}
            hint="delivered فقط"
          />
          <StatCard
            label="إجمالي قيمة الطلبات"
            value={formatPriceIQD(metrics.lifetimeValue)}
            hint="من الطلبات المكتملة"
          />
          <StatCard
            label="متوسط قيمة الطلب"
            value={
              metrics.completedOrders === 0
                ? "—"
                : formatPriceIQD(Math.round(metrics.averageOrderValue))
            }
          />
          <StatCard
            label="آخر طلب مكتمل"
            value={
              metrics.lastDeliveredAt
                ? formatIraqDateTime(metrics.lastDeliveredAt)
                : "لا توجد طلبات مكتملة"
            }
          />
        </div>
      </section>

      <section aria-labelledby="customer-orders-heading" className="space-y-3">
        <h2
          id="customer-orders-heading"
          className="text-lg font-semibold text-brand-navy"
        >
          سجل الطلبات
        </h2>
        <p className="typo-caption text-text-subtle">
          كل الطلبات المرتبطة بهذا الزبون — المقاييس أعلاه تعتمد على المكتمل
          فقط.
        </p>

        {orders.length === 0 ? (
          <EmptyState
            title="ماكو طلبات لهذا الزبون"
            description="بعد ما يطلب، يظهر السجل هنا."
          />
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className={cn(
                    "block rounded-lg border border-border bg-surface-elevated p-4",
                    "hover:border-border-strong",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-brand-navy">
                        {formatOrderRef(order.id)}
                      </p>
                      <p className="typo-caption mt-1 text-text-muted">
                        {formatIraqDateTime(order.createdAt)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="typo-caption text-text-subtle">العناصر</dt>
                      <dd className="tabular-nums">
                        {countOrderItems(order)}
                      </dd>
                    </div>
                    <div>
                      <dt className="typo-caption text-text-subtle">الإجمالي</dt>
                      <dd className="tabular-nums">
                        {formatPriceIQD(order.pricing.total)}
                      </dd>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/customers"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-surface-elevated px-5 text-sm font-medium text-text hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          رجوع للزبائن
        </Link>
        <Link
          href={`/admin/loyalty/customers/${customer.id}`}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-surface-elevated px-5 text-sm font-medium text-text hover:bg-surface-warm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          الولاء
        </Link>
      </div>
    </div>
  );
}
