import { cn } from "@/lib/utils/cn";
import type { CustomerClassification } from "@/features/customers/types";
import { getCustomerTypeLabel } from "@/features/customers/selectors";

export type CustomerTypeBadgeProps = {
  classification: CustomerClassification;
  className?: string;
};

export function CustomerTypeBadge({
  classification,
  className,
}: CustomerTypeBadgeProps) {
  const label = getCustomerTypeLabel(classification);
  const returning = classification === "returning";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold",
        returning
          ? "border-brand-primary/25 bg-brand-primary/12 text-brand-primary"
          : "border-border bg-surface-warm text-text-muted",
        className,
      )}
    >
      <span aria-hidden>{returning ? "●" : "○"}</span>
      <span>{label}</span>
    </span>
  );
}
