import { Check, Circle, CircleDot, X } from "lucide-react";
import {
  getOrderStatusDescription,
  getOrderStatusLabel,
  ORDER_STATUS_PIPELINE,
  pipelineIndex,
} from "@/features/orders/status";
import { cn } from "@/lib/utils/cn";
import type { OrderStatus, OrderStatusEvent } from "@/types/order";

export type OrderStatusTimelineProps = {
  currentStatus: OrderStatus;
  statusHistory?: OrderStatusEvent[];
  className?: string;
};

type StepState = "complete" | "current" | "upcoming" | "cancelled";

function stepState(
  step: OrderStatus,
  current: OrderStatus,
): StepState {
  if (current === "cancelled") {
    if (step === "cancelled") return "cancelled";
    return "upcoming";
  }

  const currentIdx = pipelineIndex(current);
  const stepIdx = pipelineIndex(step);
  if (stepIdx < 0) return "upcoming";
  if (stepIdx < currentIdx) return "complete";
  if (stepIdx === currentIdx) return "current";
  return "upcoming";
}

function historyNote(
  status: OrderStatus,
  history: OrderStatusEvent[] | undefined,
): string | undefined {
  const match = [...(history ?? [])]
    .reverse()
    .find((event) => event.status === status);
  return match?.note;
}

/**
 * Vertical order lifecycle timeline — icons + typography, not color alone.
 */
export function OrderStatusTimeline({
  currentStatus,
  statusHistory,
  className,
}: OrderStatusTimelineProps) {
  const steps: OrderStatus[] =
    currentStatus === "cancelled"
      ? ["cancelled"]
      : ORDER_STATUS_PIPELINE;

  return (
    <ol
      className={cn("relative space-y-0", className)}
      aria-label="مراحل الطلب"
    >
      {steps.map((status, index) => {
        const state = stepState(status, currentStatus);
        const isLast = index === steps.length - 1;
        const label = getOrderStatusLabel(status);
        const description =
          state === "current"
            ? "حالياً"
            : historyNote(status, statusHistory) ??
              getOrderStatusDescription(status);

        return (
          <li
            key={status}
            className="relative flex gap-3 pb-5 last:pb-0"
            aria-current={state === "current" ? "step" : undefined}
          >
            {!isLast ? (
              <span
                className={cn(
                  "absolute start-[0.6875rem] top-6 bottom-0 w-px",
                  state === "complete"
                    ? "bg-brand-green/50"
                    : "bg-border",
                )}
                aria-hidden
              />
            ) : null}

            <span
              className={cn(
                "relative z-[1] mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                state === "complete" &&
                  "border-brand-green bg-brand-green text-on-primary",
                state === "current" &&
                  "border-brand-primary bg-surface-elevated text-brand-primary",
                state === "upcoming" &&
                  "border-border bg-surface-elevated text-text-subtle",
                state === "cancelled" &&
                  "border-danger bg-danger text-on-primary",
              )}
              aria-hidden
            >
              {state === "complete" ? (
                <Check className="size-3.5 stroke-[2.5]" />
              ) : state === "current" ? (
                <CircleDot className="size-3.5" />
              ) : state === "cancelled" ? (
                <X className="size-3.5 stroke-[2.5]" />
              ) : (
                <Circle className="size-3" />
              )}
            </span>

            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  "text-sm",
                  state === "current" && "font-bold text-brand-navy",
                  state === "complete" && "font-semibold text-text",
                  state === "upcoming" && "font-medium text-text-muted",
                  state === "cancelled" && "font-bold text-danger",
                )}
              >
                {label}
                <span className="sr-only">
                  {state === "complete"
                    ? " — مكتمل"
                    : state === "current"
                      ? " — الحالة الحالية"
                      : state === "cancelled"
                        ? " — ملغى"
                        : " — لم يبدأ بعد"}
                </span>
              </p>
              <p
                className={cn(
                  "typo-caption mt-0.5",
                  state === "current" ? "text-brand-primary" : "text-text-subtle",
                )}
              >
                {description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
