import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, disabled, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-11 w-full rounded-2xl border bg-surface-elevated px-3 text-base text-text",
        "placeholder:text-text-subtle",
        "transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        "disabled:cursor-not-allowed disabled:bg-surface-warm disabled:text-text-disabled",
        invalid
          ? "border-danger focus-visible:outline-danger"
          : "border-border hover:border-border-strong",
        className,
      )}
      {...props}
    />
  );
});
