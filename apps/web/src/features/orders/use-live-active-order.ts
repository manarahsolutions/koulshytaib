"use client";

import { useCallback, useEffect, useState } from "react";
import {
  databaseStatusAction,
  trackGuestOrderAction,
} from "@/app/actions/backend";
import { saveActiveOrder } from "@/features/orders/order-store";
import { useActiveOrder } from "@/features/orders/use-active-order";
import type { Order } from "@/types/order";

const POLL_MS = 8_000;

function isTerminal(status: Order["status"]): boolean {
  return status === "delivered" || status === "cancelled";
}

export type LiveActiveOrderResult = {
  order: Order | null;
  liveTracking: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: (opts?: { silent?: boolean }) => Promise<void>;
};

/**
 * Keeps the guest active-order snapshot in sync with kitchen status updates.
 */
export function useLiveActiveOrder(): LiveActiveOrderResult {
  const order = useActiveOrder();
  const [liveTracking, setLiveTracking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!order?.id || !order.customer.phone) return;
      if (opts?.silent && isTerminal(order.status)) return;

      if (!opts?.silent) {
        setRefreshing(true);
        setError(null);
      }

      try {
        const status = await databaseStatusAction();
        if (!status.configured) {
          setLiveTracking(false);
          return;
        }

        const result = await trackGuestOrderAction({
          orderId: order.id,
          phone: order.customer.phone,
        });
        if (!result.ok) {
          if (!opts?.silent) setError(result.message);
          return;
        }
        setLiveTracking(true);
        saveActiveOrder(result.data);
      } catch {
        if (!opts?.silent) {
          setError("ما قدرنا نحدّث حالة الطلب، حاول مرة ثانية.");
        }
      } finally {
        if (!opts?.silent) setRefreshing(false);
      }
    },
    [order?.id, order?.customer.phone, order?.status],
  );

  useEffect(() => {
    if (!order?.id || isTerminal(order.status)) return;

    const kickoff = window.setTimeout(() => {
      void refresh({ silent: true });
    }, 0);
    const timer = window.setInterval(() => {
      void refresh({ silent: true });
    }, POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refresh({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [order?.id, order?.status, refresh]);

  return { order, liveTracking, refreshing, error, refresh };
}
