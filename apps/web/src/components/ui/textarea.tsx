import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { className, invalid, disabled, rows = 4, ...props },
    ref,
  ) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          "w-full resize-y rounded-2xl border bg-surface-elevated px-3 py-2.5 text-base text-text leading-[var(--leading-body)]",
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
  },
);
