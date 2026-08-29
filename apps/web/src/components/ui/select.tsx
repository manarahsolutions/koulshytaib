import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, invalid, disabled, children, ...props }, ref) {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-11 w-full appearance-none rounded-lg border bg-surface-elevated px-3 pe-10 text-base text-text",
            "transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
            "disabled:cursor-not-allowed disabled:bg-surface-warm disabled:text-text-disabled",
            invalid
              ? "border-danger focus-visible:outline-danger"
              : "border-border hover:border-border-strong",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
      </div>
    );
  },
);
