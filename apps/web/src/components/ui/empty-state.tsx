import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
      role="status"
    >
      {icon ? (
        <div
          className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-surface-warm text-brand-primary [&_svg]:size-7"
          aria-hidden
        >
          {icon}
        </div>
      ) : null}
      <h2 className="typo-heading-s text-text">{title}</h2>
      {description ? (
        <p className="typo-body-s mt-2 max-w-sm text-text-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
