import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeVariant =
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  /** Visible text prefix so meaning is not color-only (a11y). */
  label?: string;
  icon?: ReactNode;
};

const variantClasses: Record<BadgeVariant, string> = {
  brand: "bg-brand-primary/12 text-brand-primary border-brand-primary/20",
  success: "bg-success-subtle text-success border-success/25",
  warning: "bg-warning-subtle text-warning-text border-warning/40",
  danger: "bg-danger-subtle text-danger border-danger/25",
  neutral: "bg-surface-warm text-text-muted border-border",
};

const defaultLabels: Record<BadgeVariant, string> = {
  brand: "عرض",
  success: "متاح",
  warning: "تنبيه",
  danger: "مهم",
  neutral: "معلومة",
};

export function Badge({
  variant = "neutral",
  label,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  const accessibleLabel = label ?? defaultLabels[variant];

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {icon ? <span className="shrink-0 [&_svg]:size-3">{icon}</span> : null}
      <span className="sr-only">{accessibleLabel}: </span>
      <span className="truncate">{children}</span>
    </span>
  );
}
