"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  databaseStatusAction,
  updateOrderStatusAction,
} from "@/app/actions/backend";
import {
  getNextForwardStatus,
  PRIMARY_STATUS_ACTION_LABEL,
} from "@/features/orders/order-transitions";
import { updateOrderStatus } from "@/features/orders/order-service";
import { saveOrder } from "@/features/orders/order-registry";
import type { Order, OrderStatus } from "@/types/order";

export type OrderStatusActionsProps = {
  order: Order;
  onError?: (message: string) => void;
  onUpdated?: (order: Order) => void;
};

export function OrderStatusActions({
  order,
  onError,
  onUpdated,
}: OrderStatusActionsProps) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);

  const next = getNextForwardStatus(order.status);
  const primaryLabel = next
    ? PRIMARY_STATUS_ACTION_LABEL[order.status]
    : undefined;
  const canCancel =
    order.status !== "delivered" && order.status !== "cancelled";

  const run = async (status: OrderStatus) => {
    setBusy(true);
    try {
      const dbStatus = await databaseStatusAction();
      if (dbStatus.configured) {
        const result = await updateOrderStatusAction(order.id, status);
        if (!result.ok) {
          onError?.(result.message);
          return;
        }
        saveOrder(result.data);
        onUpdated?.(result.data);
      } else {
        const result = updateOrderStatus(order.id, status);
        if (!result.ok) {
          onError?.(result.message);
          return;
        }
        onUpdated?.(result.order);
      }
      setConfirmCancel(false);
    } finally {
      setBusy(false);
    }
  };

  if (!primaryLabel && !canCancel) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {next && primaryLabel ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            loading={busy}
            onClick={() => void run(next)}
            className="min-h-11"
          >
            {primaryLabel}
          </Button>
        ) : null}

        {canCancel && !confirmCancel ? (
          <Button
            type="button"
            variant="destructive"
            size="md"
            disabled={busy}
            onClick={() => setConfirmCancel(true)}
            className="min-h-11"
          >
            إلغاء الطلب
          </Button>
        ) : null}
      </div>

      {confirmCancel ? (
        <div
          className="rounded-lg border border-danger/30 bg-danger-subtle p-4"
          role="alertdialog"
          aria-labelledby="cancel-order-title"
          aria-describedby="cancel-order-desc"
        >
          <p id="cancel-order-title" className="font-semibold text-danger">
            هل تريد إلغاء هذا الطلب؟
          </p>
          <p id="cancel-order-desc" className="mt-1 text-sm text-text-muted">
            ما يصير التراجع بعد الإلغاء من هالواجهة.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              size="md"
              loading={busy}
              onClick={() => void run("cancelled")}
              className="min-h-11"
            >
              تأكيد الإلغاء
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={busy}
              onClick={() => setConfirmCancel(false)}
              className="min-h-11"
            >
              رجوع
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
