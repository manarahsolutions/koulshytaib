"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createCouponAction,
  setCouponActiveAction,
} from "@/app/actions/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatPriceIQD } from "@/lib/format/price";
import type { CouponRecord } from "@/features/coupons/types";

export type AdminCouponsClientProps = {
  initialCoupons: CouponRecord[];
  loadError?: string | null;
};

export function AdminCouponsClient({
  initialCoupons,
  loadError = null,
}: AdminCouponsClientProps) {
  const router = useRouter();
  const formId = useId();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed_iqd">("percent");
  const [value, setValue] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const parsed = Number(value.trim());
      const max = maxRedemptions.trim()
        ? Number(maxRedemptions.trim())
        : undefined;
      const result = await createCouponAction({
        code,
        type,
        value: parsed,
        maxRedemptions:
          max != null && Number.isFinite(max) && max > 0
            ? Math.trunc(max)
            : undefined,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setCode("");
      setValue("");
      setMaxRedemptions("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (coupon: CouponRecord) => {
    setBusy(true);
    setError(null);
    try {
      const result = await setCouponActiveAction(coupon.id, !coupon.active);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-brand-navy">الكوبونات</h1>
        <p className="typo-caption mt-1 text-text-muted">
          أنشئ كود خصم يُطبَّق بعد عروض المنتجات وقبل رسوم التوصيل.
        </p>
      </header>

      <form
        onSubmit={(e) => void onCreate(e)}
        className="space-y-3 rounded-2xl border border-border-soft bg-surface-elevated p-4"
      >
        <h2 className="text-base font-semibold text-brand-navy">كوبون جديد</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            id={`${formId}-code`}
            placeholder="الكود"
            dir="ltr"
            className="text-start"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
          <Select
            id={`${formId}-type`}
            value={type}
            onChange={(e) =>
              setType(e.target.value as "percent" | "fixed_iqd")
            }
          >
            <option value="percent">نسبة مئوية</option>
            <option value="fixed_iqd">مبلغ ثابت (د.ع)</option>
          </Select>
          <Input
            id={`${formId}-value`}
            type="number"
            inputMode="numeric"
            placeholder={type === "percent" ? "مثلاً 10" : "مثلاً 2000"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
          <Input
            id={`${formId}-max`}
            type="number"
            inputMode="numeric"
            placeholder="حد الاستخدام (اختياري)"
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
          />
        </div>
        <Button type="submit" loading={busy} size="sm">
          إنشاء
        </Button>
      </form>

      {error || loadError ? (
        <p className="text-sm text-danger" role="alert">
          {error ?? loadError}
        </p>
      ) : null}

      {initialCoupons.length === 0 ? (
        <p className="typo-caption text-text-muted">ماكو كوبونات بعد.</p>
      ) : (
        <ul className="divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface-elevated">
          {initialCoupons.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p
                  className="font-semibold tabular-nums text-brand-navy"
                  dir="ltr"
                >
                  {c.code}
                </p>
                <p className="typo-caption text-text-muted">
                  {c.type === "percent"
                    ? `${c.value}%`
                    : formatPriceIQD(c.value)}
                  {" · "}
                  استخدامات: {c.redemptionCount}
                  {c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ""}
                  {" · "}
                  {c.active ? "فعّال" : "معطّل"}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => void toggleActive(c)}
              >
                {c.active ? "تعطيل" : "تفعيل"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
