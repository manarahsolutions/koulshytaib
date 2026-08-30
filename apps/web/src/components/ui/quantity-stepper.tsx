"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { IconButton } from "./icon-button";

export type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  /** Compact control for product cards / dense UI */
  size?: "sm" | "md";
  /** Accessible name for the control group */
  "aria-label"?: string;
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className,
  size = "md",
  "aria-label": ariaLabel = "الكمية",
}: QuantityStepperProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;
  const compact = size === "sm";

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center rounded-2xl border border-border-soft bg-surface-elevated shadow-xs",
        compact ? "gap-0.5 p-0.5" : "gap-1 p-1",
        disabled && "opacity-50",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <IconButton
        aria-label="إنقاص الكمية"
        size={compact ? "sm" : "md"}
        variant="ghost"
        disabled={disabled || !canDecrement}
        icon={<Minus />}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={compact ? "size-8 rounded-xl [&_svg]:size-3.5" : undefined}
      />
      <span
        className={cn(
          "text-center tabular-nums text-text",
          compact
            ? "min-w-6 text-sm font-semibold"
            : "typo-price min-w-10 text-base",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <IconButton
        aria-label="زيادة الكمية"
        size={compact ? "sm" : "md"}
        variant="ghost"
        disabled={disabled || !canIncrement}
        icon={<Plus />}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={compact ? "size-8 rounded-xl [&_svg]:size-3.5" : undefined}
      />
    </div>
  );
}
