"use client";

import { useId, useState, type FormEvent } from "react";
import {
  lookupLoyaltyForRedeemAction,
  redeemLoyaltyRewardAction,
} from "@/app/actions/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LoyaltyRewardRecord } from "@/features/loyalty/reward-types";
import { formatPoints } from "@/lib/format/points";

type LookupData = {
  customer: { id: string; name?: string; phone: string };
  balance: number;
  rewards: LoyaltyRewardRecord[];
  loyaltyEnabled: boolean;
};

export function RewardsPageClient() {
  const formId = useId();
  const [phone, setPhone] = useState("");
  const [data, setData] = useState<LookupData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const lookup = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOkMsg(null);
    try {
      const result = await lookupLoyaltyForRedeemAction(phone);
      if (!result.ok) {
        setData(null);
        setError(result.message);
        return;
      }
      setData(result.data);
    } finally {
      setBusy(false);
    }
  };

  const redeem = async (rewardId: string) => {
    setRedeemingId(rewardId);
    setError(null);
    setOkMsg(null);
    try {
      const result = await redeemLoyaltyRewardAction({ phone, rewardId });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setOkMsg(
        `تم استبدال «${result.data.rewardTitle}» — خصم ${formatPoints(result.data.pointsCost)} نقطة`,
      );
      const refreshed = await lookupLoyaltyForRedeemAction(phone);
      if (refreshed.ok) setData(refreshed.data);
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-brand-navy">استبدال النقاط</h1>
        <p className="mt-1 text-sm text-text-muted">
          أدخل رقم هاتفك المستخدم بالطلبات لتشوف رصيدك والمكافآت المتاحة.
        </p>
      </header>

      <form onSubmit={(e) => void lookup(e)} className="space-y-3">
        <label htmlFor={`${formId}-phone`} className="text-sm font-medium">
          رقم الهاتف
        </label>
        <Input
          id={`${formId}-phone`}
          placeholder="07XXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          dir="ltr"
          required
        />
        <Button type="submit" loading={busy} className="w-full">
          عرض الرصيد والمكافآت
        </Button>
      </form>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {okMsg ? (
        <p className="text-sm text-success" role="status">
          {okMsg}
        </p>
      ) : null}

      {data ? (
        <section className="space-y-4">
          <div className="rounded-lg border border-border bg-surface-elevated p-4">
            <p className="text-sm text-text-muted">
              {data.customer.name?.trim() || "زبون"}
            </p>
            <p className="mt-1 text-xl font-bold text-brand-navy">
              {formatPoints(data.balance)} نقطة
            </p>
            {!data.loyaltyEnabled ? (
              <p className="mt-2 text-sm text-text-muted">
                نظام الولاء غير مفعّل حالياً.
              </p>
            ) : null}
          </div>

          <ul className="space-y-3">
            {data.rewards.length === 0 ? (
              <li className="text-sm text-text-muted">ماكو مكافآت متاحة حالياً.</li>
            ) : (
              data.rewards.map((r) => {
                const canAfford = data.balance >= r.pointsCost;
                return (
                  <li
                    key={r.id}
                    className="rounded-lg border border-border bg-surface-elevated p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-brand-navy">{r.title}</p>
                        {r.description ? (
                          <p className="mt-0.5 text-sm text-text-muted">
                            {r.description}
                          </p>
                        ) : null}
                        <p className="mt-1 text-sm text-text-muted">
                          {formatPoints(r.pointsCost)} نقطة
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        disabled={
                          !data.loyaltyEnabled ||
                          !canAfford ||
                          redeemingId === r.id
                        }
                        loading={redeemingId === r.id}
                        onClick={() => void redeem(r.id)}
                      >
                        استبدال
                      </Button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
