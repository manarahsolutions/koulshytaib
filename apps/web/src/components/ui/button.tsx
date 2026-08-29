import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Optional leading icon (not auto-flipped). */
  startIcon?: ReactNode;
  /** Optional trailing icon (not auto-flipped). */
  endIcon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-primary text-on-primary hover:bg-brand-primary-hover active:bg-brand-primary-active shadow-xs",
  secondary:
    "bg-brand-secondary text-on-secondary hover:bg-brand-secondary-hover active:brightness-95 shadow-xs",
  ghost:
    "bg-transparent text-text hover:bg-surface-warm active:bg-border-soft",
  outline:
    "bg-surface-elevated text-text border border-border hover:border-border-strong hover:bg-surface-warm active:bg-surface-warm",
  destructive:
    "bg-danger text-on-primary hover:bg-danger-hover active:brightness-95 shadow-xs",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-3 text-sm rounded-md",
  md: "h-11 gap-2 px-4 text-base rounded-lg",
  lg: "h-12 gap-2 px-5 text-lg rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  startIcon,
  endIcon,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-[background-color,border-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      {...props}
    >
      {loading ? (
        <Loader2
          className="size-4 shrink-0 animate-spin"
          aria-hidden
        />
      ) : (
        startIcon
      )}
      {children ? <span className="min-w-0 truncate">{children}</span> : null}
      {!loading ? endIcon : null}
    </button>
  );
}
