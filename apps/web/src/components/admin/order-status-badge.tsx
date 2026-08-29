import { getAdminStatusLabel } from "@/features/orders/order-transitions";
import { cn } from "@/lib/utils/cn";
import type { OrderStatus } from "@/types/order";

const statusTone: Record<
  OrderStatus,
  { className: string; icon: string }
> = {
  received: {
    className: "bg-surface-warm text-text border-border",
    icon: "○",
  },
  confirmed: {
    className: "bg-brand-primary/12 text-brand-primary border-brand-primary/25",
    icon: "●",
  },
  preparing: {
    className: "bg-warning-subtle text-warning-text border-warning/40",
    icon: "◐",
  },
  out_for_delivery: {
    className: "bg-brand-navy/10 text-brand-navy border-brand-navy/25",
    icon: "➔",
  },
  delivered: {
    className: "bg-success-subtle text-success border-success/25",
    icon: "✓",
  },
  cancelled: {
    className: "bg-danger-subtle text-danger border-danger/25",
    icon: "✕",
  },
};

export type OrderStatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

/** Status chip with text + symbol (not color-only). */
export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const tone = statusTone[status];
  const label = getAdminStatusLabel(status);

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold",
        tone.className,
        className,
      )}
    >
      <span aria-hidden className="tabular-nums">
        {tone.icon}
      </span>
      <span>{label}</span>
    </span>
  );
}
