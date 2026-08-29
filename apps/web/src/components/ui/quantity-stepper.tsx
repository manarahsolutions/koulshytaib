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
  "aria-label": ariaLabel = "الكمية",
}: QuantityStepperProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl border border-border-soft bg-surface-elevated p-1 shadow-xs",
        disabled && "opacity-50",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <IconButton
        aria-label="إنقاص الكمية"
        size="md"
        variant="ghost"
        disabled={disabled || !canDecrement}
        icon={<Minus />}
        onClick={() => onChange(Math.max(min, value - 1))}
      />
      <span
        className="typo-price min-w-10 text-center text-base tabular-nums text-text"
        aria-live="polite"
      >
        {value}
      </span>
      <IconButton
        aria-label="زيادة الكمية"
        size="md"
        variant="ghost"
        disabled={disabled || !canIncrement}
        icon={<Plus />}
        onClick={() => onChange(Math.min(max, value + 1))}
      />
    </div>
  );
}
