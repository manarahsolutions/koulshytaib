import { getAdminStatusLabel } from "@/features/orders/order-transitions";
import { formatIraqDateTime } from "@/lib/datetime/iraq-day";
import { cn } from "@/lib/utils/cn";
import type { OrderStatusEvent } from "@/types/order";

export type AdminStatusTimelineProps = {
  events: OrderStatusEvent[];
  className?: string;
};

/** Compact ops timeline — history only (not customer pipeline chrome). */
export function AdminStatusTimeline({
  events,
  className,
}: AdminStatusTimelineProps) {
  const chronological = [...events].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp),
  );

  return (
    <ol className={cn("space-y-3", className)} aria-label="سجل الحالات">
      {chronological.map((event, index) => {
        const isLatest = index === chronological.length - 1;
        return (
          <li
            key={`${event.status}-${event.timestamp}`}
            className="flex gap-3"
            aria-current={isLatest ? "step" : undefined}
          >
            <span
              className={cn(
                "mt-1 size-2.5 shrink-0 rounded-full",
                isLatest ? "bg-brand-primary" : "bg-border-strong",
              )}
              aria-hidden
            />
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm",
                  isLatest
                    ? "font-bold text-brand-navy"
                    : "font-medium text-text",
                )}
              >
                {getAdminStatusLabel(event.status)}
              </p>
              <p className="typo-caption text-text-muted">
                {formatIraqDateTime(event.timestamp)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
