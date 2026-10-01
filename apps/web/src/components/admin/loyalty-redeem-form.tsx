"use client";

import { useId, useState, type FormEvent } from "react";
import {
  fetchCrmBootstrapAction,
  redeemLoyaltyPointsAction,
} from "@/app/actions/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getLoyaltyConfig,
  setLoyaltyConfig,
} from "@/features/loyalty/loyalty-service";
import { replaceLoyaltyFromServer } from "@/features/loyalty/loyalty-repository";
import { replaceCustomersFromServer } from "@/features/customers/customer-repository";
import { formatPoints } from "@/lib/format/points";

export function LoyaltyRedeemForm({
  customerId,
  balance,
  onSuccess,
}: {
  customerId: string;
  balance: number;
  onSuccess: () => void;
}) {
  const formId = useId();
  const config = getLoyaltyConfig();
  const disabled =
    !config.enabled || !config.redemption.enabled || balance <= 0;

  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSuccess(false);
    setError(null);
    if (disabled) {
      setError("الاستبدال غير مفعّل أو الرصيد صفر");
      return;
    }
    const parsed = Number(points.trim());
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError("اكتب عدداً صحيحاً أكبر من صفر");
      return;
    }
    if (parsed < config.redemption.minimumPoints) {
      setError(
        `الحد الأدنى للاستبدال ${formatPoints(config.redemption.minimumPoints)} نقطة`,
      );
      return;
    }
    if (parsed > balance) {
      setError("الرصيد ما يكفي");
      return;
    }
    if (!reason.trim()) {
      setError("اكتب سبب الخصم (مثلاً: خصم على طلب / هدية)");
      return;
    }

    setBusy(true);
    try {
      const result = await redeemLoyaltyPointsAction(
        customerId,
        parsed,
        reason.trim(),
      );
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const crm = await fetchCrmBootstrapAction();
      if (crm.ok) {
        replaceCustomersFromServer(crm.data.customers);
        replaceLoyaltyFromServer({
          accounts: crm.data.accounts,
          transactions: crm.data.transactions,
        });
        setLoyaltyConfig(crm.data.config);
      }
      setPoints("");
      setReason("");
      setSuccess(true);
      onSuccess();
    } catch {
      setError("صار خطأ، حاول مرة ثانية");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="space-y-4 rounded-lg border border-border bg-surface-elevated p-4"
      onSubmit={(e) => void onSubmit(e)}
      noValidate
    >
      <div>
        <h3 className="text-base font-semibold text-brand-navy">
          استبدال / خصم نقاط
        </h3>
        <p className="typo-caption mt-1 text-text-muted">
          بعد الاتفاق مع الزبون (واتساب أو حضوري) خصم النقاط هنا. الرصيد الحالي:{" "}
          {formatPoints(balance)}
        </p>
      </div>

      {disabled ? (
        <p
          className="rounded-md border border-border bg-surface-warm px-3 py-2 text-sm text-text-muted"
          role="status"
        >
          {!config.enabled
            ? "فعّل نظام الولاء أولاً من صفحة الولاء."
            : !config.redemption.enabled
              ? "فعّل «السماح بخصم النقاط» من إعدادات الولاء."
              : "ماكو رصيد للاستبدال."}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor={`${formId}-pts`} className="typo-label text-text">
          عدد النقاط
        </label>
        <Input
          id={`${formId}-pts`}
          inputMode="numeric"
          dir="ltr"
          className="text-start"
          placeholder="مثلاً: 100"
          value={points}
          disabled={disabled || busy}
          onChange={(e) => setPoints(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${formId}-reason`} className="typo-label text-text">
          السبب
        </label>
        <Textarea
          id={`${formId}-reason`}
          rows={2}
          placeholder="خصم مقابل …"
          value={reason}
          disabled={disabled || busy}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-success" role="status">
          تم خصم النقاط
        </p>
      ) : null}
      <Button type="submit" loading={busy} disabled={disabled || busy}>
        خصم النقاط
      </Button>
    </form>
  );
}
