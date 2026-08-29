"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  adjustPoints,
  getLoyaltyConfig,
} from "@/features/loyalty/loyalty-service";
import { mapLoyaltyErrorMessage } from "@/features/loyalty/selectors";
import { LoyaltyError } from "@/features/loyalty/types";
import { fieldDescribedBy } from "@/components/checkout/field";

export type LoyaltyAdjustmentFormProps = {
  customerId: string;
  onSuccess: () => void;
};

export function LoyaltyAdjustmentForm({
  customerId,
  onSuccess,
}: LoyaltyAdjustmentFormProps) {
  const formId = useId();
  const amountId = `${formId}-amount`;
  const reasonId = `${formId}-reason`;
  const config = getLoyaltyConfig();
  const disabled = !config.enabled;

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    amount?: string;
    reason?: string;
  }>({});

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSuccess(false);
    setError(null);

    if (disabled) {
      setError(mapLoyaltyErrorMessage("LOYALTY_DISABLED"));
      return;
    }

    const parsed = Number(amount.trim());
    const nextFieldErrors: { amount?: string; reason?: string } = {};
    if (!Number.isInteger(parsed) || parsed === 0) {
      nextFieldErrors.amount = "اكتب عدداً صحيحاً غير صفر";
    }
    if (!reason.trim()) {
      nextFieldErrors.reason = "اكتب سبب التعديل";
    }
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    setBusy(true);
    try {
      adjustPoints(customerId, parsed, reason.trim());
      setAmount("");
      setReason("");
      setSuccess(true);
      onSuccess();
    } catch (err) {
      if (err instanceof LoyaltyError) {
        setError(mapLoyaltyErrorMessage(err.code));
      } else {
        setError(mapLoyaltyErrorMessage("UNKNOWN"));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="space-y-4 rounded-lg border border-border bg-surface-elevated p-4"
      onSubmit={onSubmit}
      noValidate
    >
      <div>
        <h3 className="text-base font-semibold text-brand-navy">تعديل الرصيد</h3>
        <p className="typo-caption mt-1 text-text-muted">
          تعديل يدوي (ليس اكتساباً تلقائياً). السبب يُحفظ مع الحركة.
        </p>
      </div>

      {disabled ? (
        <p
          className="rounded-md border border-border bg-surface-warm px-3 py-2 text-sm text-text-muted"
          role="status"
        >
          نظام الولاء غير مفعّل حالياً، لذلك لا يمكن تعديل الرصيد.
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor={amountId} className="typo-label text-text">
          النقاط <span className="text-brand-primary">*</span>
        </label>
        <Input
          id={amountId}
          name="points"
          inputMode="numeric"
          placeholder="مثلاً: 50 أو -20"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={disabled || busy}
          invalid={Boolean(fieldErrors.amount)}
          aria-required
          aria-describedby={fieldDescribedBy(amountId, fieldErrors.amount)}
          dir="ltr"
          className="text-start"
        />
        {fieldErrors.amount ? (
          <p id={`${amountId}-error`} className="typo-caption text-danger" role="alert">
            {fieldErrors.amount}
          </p>
        ) : (
          <p className="typo-caption text-text-subtle">
            موجب يزيد الرصيد · سالب ينقصه
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={reasonId} className="typo-label text-text">
          السبب <span className="text-brand-primary">*</span>
        </label>
        <Textarea
          id={reasonId}
          name="reason"
          rows={3}
          placeholder="سبب التعديل للسجل"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={disabled || busy}
          invalid={Boolean(fieldErrors.reason)}
          aria-required
          aria-describedby={fieldDescribedBy(reasonId, fieldErrors.reason)}
        />
        {fieldErrors.reason ? (
          <p id={`${reasonId}-error`} className="typo-caption text-danger" role="alert">
            {fieldErrors.reason}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-success" role="status">
          تم تعديل رصيد النقاط
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        loading={busy}
        disabled={disabled}
        className="min-h-11"
      >
        حفظ التعديل
      </Button>
    </form>
  );
}
