import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type IconButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "destructive";

export type IconButtonSize = "sm" | "md" | "lg";

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  /** Accessible name — required because the control has no visible text. */
  "aria-label": string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  /**
   * When true, mirrors the icon on RTL for directional cues
   * (arrows / chevrons). Do not enable for decorative icons.
   */
  directional?: boolean;
};

const variantClasses: Record<IconButtonVariant, string> = {
  primary:
    "bg-brand-primary text-on-primary hover:bg-brand-primary-hover active:bg-brand-primary-active",
  secondary:
    "bg-brand-secondary text-on-secondary hover:bg-brand-secondary-hover",
  ghost: "bg-transparent text-text hover:bg-surface-warm",
  outline:
    "bg-surface-elevated text-text border border-border hover:border-border-strong hover:bg-surface-warm",
  destructive: "bg-danger text-on-primary hover:bg-danger-hover",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "size-9 rounded-md [&_svg]:size-4",
  md: "size-11 rounded-lg [&_svg]:size-5",
  lg: "size-12 rounded-xl [&_svg]:size-5",
};

export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  loading = false,
  disabled,
  directional = false,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center transition-[background-color,border-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" aria-hidden />
      ) : (
        <span
          className={cn(
            "inline-flex",
            directional && "rtl:-scale-x-100",
          )}
          aria-hidden
        >
          {icon}
        </span>
      )}
    </button>
  );
}
