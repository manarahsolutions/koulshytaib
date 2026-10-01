"use client";

import { useId, useState } from "react";
import { setLoyaltyConfigAction } from "@/app/actions/backend";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  getLoyaltyConfig,
  setLoyaltyConfig,
} from "@/features/loyalty/loyalty-service";
import type { LoyaltyConfig } from "@/features/loyalty/types";

export function LoyaltySettingsForm({
  onSaved,
}: {
  onSaved?: (config: LoyaltyConfig) => void;
}) {
  const formId = useId();
  const current = getLoyaltyConfig();
  const [enabled, setEnabled] = useState(current.enabled);
  const [earningEnabled, setEarningEnabled] = useState(current.earning.enabled);
  const [earnRate, setEarnRate] = useState(
    String(current.earning.pointsPerCurrencyUnit),
  );
  const [redemptionEnabled, setRedemptionEnabled] = useState(
    current.redemption.enabled,
  );
  const [minPoints, setMinPoints] = useState(
    String(current.redemption.minimumPoints),
  );
  const [redeemRate, setRedeemRate] = useState(
    String(current.redemption.pointsPerCurrencyUnit),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const save = async () => {
    setBusy(true);
    setError(null);
    setOk(false);
    const earnN = Number(earnRate);
    const minN = Number(minPoints);
    const redeemN = Number(redeemRate);
    if (!Number.isInteger(earnN) || earnN < 0) {
      setError("معدل الاكتساب لازم يكون عدداً صحيحاً ≥ 0");
      setBusy(false);
      return;
    }
    if (!Number.isInteger(minN) || minN < 0) {
      setError("الحد الأدنى للاستبدال لازم يكون عدداً صحيحاً ≥ 0");
      setBusy(false);
      return;
    }
    if (!Number.isInteger(redeemN) || redeemN < 0) {
      setError("معدل الاستبدال لازم يكون عدداً صحيحاً ≥ 0");
      setBusy(false);
      return;
    }

    try {
      const result = await setLoyaltyConfigAction({
        enabled,
        earning: {
          enabled: enabled && earningEnabled,
          pointsPerCurrencyUnit: earnN,
        },
        redemption: {
          enabled: enabled && redemptionEnabled,
          minimumPoints: minN,
          pointsPerCurrencyUnit: redeemN,
        },
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setLoyaltyConfig(result.data);
      setOk(true);
      onSaved?.(result.data);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Checkbox
          id={`${formId}-enabled`}
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          label="تفعيل نظام الولاء"
          description="المفتاح الرئيسي — بدونه ما يصير كسب ولا استبدال ولا تعديل"
        />
        <Checkbox
          id={`${formId}-earn`}
          checked={earningEnabled}
          disabled={!enabled}
          onChange={(e) => setEarningEnabled(e.target.checked)}
          label="اكتساب تلقائي عند التسليم"
          description="يُحسب عند تحويل الطلب إلى «مكتمل / delivered»"
        />
        <Checkbox
          id={`${formId}-redeem`}
          checked={redemptionEnabled}
          disabled={!enabled}
          onChange={(e) => setRedemptionEnabled(e.target.checked)}
          label="السماح بخصم النقاط من لوحة الولاء"
          description="الطاقم يخصم يدوياً بعد الاتفاق مع الزبون عبر واتساب"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor={`${formId}-earn-rate`} className="typo-label text-text">
            نقاط لكل دينار (اكتساب)
          </label>
          <Input
            id={`${formId}-earn-rate`}
            inputMode="numeric"
            dir="ltr"
            className="text-start"
            value={earnRate}
            disabled={!enabled || busy}
            onChange={(e) => setEarnRate(e.target.value)}
          />
          <p className="typo-caption text-text-subtle">
            مثال: طلب 10,000 د.ع × المعدل = النقاط. خلّيه 0 إذا تبي التعديل اليدوي فقط.
          </p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${formId}-min`} className="typo-label text-text">
            أقل نقاط للاستبدال
          </label>
          <Input
            id={`${formId}-min`}
            inputMode="numeric"
            dir="ltr"
            className="text-start"
            value={minPoints}
            disabled={!enabled || busy}
            onChange={(e) => setMinPoints(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor={`${formId}-redeem-rate`}
            className="typo-label text-text"
          >
            نقاط لكل دينار (مرجع استبدال)
          </label>
          <Input
            id={`${formId}-redeem-rate`}
            inputMode="numeric"
            dir="ltr"
            className="text-start"
            value={redeemRate}
            disabled={!enabled || busy}
            onChange={(e) => setRedeemRate(e.target.value)}
          />
          <p className="typo-caption text-text-subtle">
            مرجع للطاقم عند اقتراح خصم — مو خصم تلقائي بالسلة حالياً.
          </p>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p className="text-sm text-success" role="status">
          تم حفظ إعدادات الولاء
        </p>
      ) : null}

      <Button type="submit" size="md" loading={busy} disabled={busy}>
        حفظ الإعدادات
      </Button>
    </form>
  );
}
