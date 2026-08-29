import { Eye, EyeOff, PackageCheck, PackageX } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold",
        available
          ? "border-success/25 bg-success-subtle text-success"
          : "border-border bg-surface-warm text-text-muted",
      )}
    >
      {available ? (
        <PackageCheck className="size-3.5" aria-hidden />
      ) : (
        <PackageX className="size-3.5" aria-hidden />
      )}
      <span>{available ? "متوفر" : "غير متوفر"}</span>
    </span>
  );
}

export function VisibilityBadge({ visible }: { visible: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold",
        visible
          ? "border-brand-navy/25 bg-brand-navy/10 text-brand-navy"
          : "border-border bg-surface-warm text-text-muted",
      )}
    >
      {visible ? (
        <Eye className="size-3.5" aria-hidden />
      ) : (
        <EyeOff className="size-3.5" aria-hidden />
      )}
      <span>{visible ? "ظاهر" : "مخفي"}</span>
    </span>
  );
}
