import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: ReactNode;
  description?: ReactNode;
};

export function Checkbox({
  id,
  className,
  label,
  description,
  disabled,
  ...props
}: CheckboxProps) {
  const inputId = id;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex max-w-full items-start gap-2.5",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        disabled={disabled}
        className={cn(
          "mt-1 size-4 shrink-0 rounded-sm border-border-strong",
          "accent-[var(--color-brand-primary)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
          "disabled:cursor-not-allowed",
        )}
        {...props}
      />
      {(label || description) && (
        <span className="min-w-0">
          {label ? (
            <span className="block text-sm font-medium text-text">{label}</span>
          ) : null}
          {description ? (
            <span className="mt-0.5 block text-xs text-text-muted">
              {description}
            </span>
          ) : null}
        </span>
      )}
    </label>
  );
}
