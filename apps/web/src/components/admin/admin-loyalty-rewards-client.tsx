"use client";

import { useId, useState, type FormEvent } from "react";
import {
  createLoyaltyRewardAction,
  deleteLoyaltyRewardAction,
  listLoyaltyRewardsAction,
  updateLoyaltyRewardAction,
} from "@/app/actions/backend";
import { AdminPanel } from "@/components/admin/ui/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LoyaltyRewardRecord } from "@/features/loyalty/reward-types";
import { formatPoints } from "@/lib/format/points";

export function AdminLoyaltyRewardsClient({
  initial,
  canDelete,
}: {
  initial: LoyaltyRewardRecord[];
  canDelete: boolean;
}) {
  const formId = useId();
  const [rewards, setRewards] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointsCost, setPointsCost] = useState("100");

  const refresh = async () => {
    const result = await listLoyaltyRewardsAction();
    if (result.ok) setRewards(result.data);
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await createLoyaltyRewardAction({
        title,
        description: description || undefined,
        pointsCost: Number(pointsCost),
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setTitle("");
      setDescription("");
      setPointsCost("100");
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <AdminPanel>
        <form onSubmit={(e) => void onCreate(e)} className="space-y-3">
          <h2 className="text-base font-semibold text-brand-navy">
            مكافآت الاستبدال
          </h2>
          <p className="text-sm text-text-muted">
            كتالوج يظهر للزبون في صفحة المكافآت عند الاستبدال بالنقاط.
          </p>
          <Input
            id={`${formId}-title`}
            placeholder="اسم المكافأة"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            id={`${formId}-desc`}
            placeholder="وصف مختصر (اختياري)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            id={`${formId}-cost`}
            placeholder="تكلفة النقاط"
            type="number"
            min={1}
            value={pointsCost}
            onChange={(e) => setPointsCost(e.target.value)}
            dir="ltr"
            required
          />
          <Button type="submit" size="sm" loading={busy}>
            إضافة مكافأة
          </Button>
        </form>
        {error ? (
          <p className="mt-2 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </AdminPanel>

      {rewards.length === 0 ? (
        <p className="text-sm text-text-muted">ماكو مكافآت بعد.</p>
      ) : (
        <ul className="space-y-3">
          {rewards.map((r) => (
            <li key={r.id}>
              <AdminPanel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-brand-navy">{r.title}</p>
                  {r.description ? (
                    <p className="text-sm text-text-muted">{r.description}</p>
                  ) : null}
                  <p className="mt-1 text-sm text-text-muted">
                    {formatPoints(r.pointsCost)} نقطة ·{" "}
                    {r.active ? "مفعّلة" : "متوقفة"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      void (async () => {
                        setError(null);
                        const result = await updateLoyaltyRewardAction(r.id, {
                          active: !r.active,
                        });
                        if (!result.ok) setError(result.message);
                        else await refresh();
                      })();
                    }}
                  >
                    {r.active ? "إيقاف" : "تفعيل"}
                  </Button>
                  {canDelete ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        void (async () => {
                          if (!window.confirm("حذف هذه المكافأة؟")) return;
                          setError(null);
                          const result = await deleteLoyaltyRewardAction(r.id);
                          if (!result.ok) setError(result.message);
                          else await refresh();
                        })();
                      }}
                    >
                      حذف
                    </Button>
                  ) : null}
                </div>
              </AdminPanel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
