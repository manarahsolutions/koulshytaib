"use client";

import { useState } from "react";
import { setLoyaltyConfigAction } from "@/app/actions/backend";
import { Button } from "@/components/ui/button";
import {
  getLoyaltyConfig,
  setLoyaltyConfig,
} from "@/features/loyalty/loyalty-service";

export function LoyaltyEnableToggle({
  enabled,
  onChanged,
}: {
  enabled: boolean;
  onChanged?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    setBusy(true);
    setError(null);
    try {
      const current = getLoyaltyConfig();
      const nextEnabled = !enabled;
      const result = await setLoyaltyConfigAction({
        enabled: nextEnabled,
        earning: {
          enabled: nextEnabled,
          pointsPerCurrencyUnit: current.earning.pointsPerCurrencyUnit,
        },
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setLoyaltyConfig(result.data);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={busy}
        onClick={() => void toggle()}
      >
        {enabled ? "إيقاف النظام" : "تفعيل النظام"}
      </Button>
      {error ? (
        <span className="text-xs text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
