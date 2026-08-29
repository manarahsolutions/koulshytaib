import { CheckCircle2, Eye, EyeOff, PauseCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function OfferActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold",
        active
          ? "border-success/25 bg-success-subtle text-success"
          : "border-border bg-surface-warm text-text-muted",
      )}
    >
      {active ? (
        <CheckCircle2 className="size-3.5" aria-hidden />
      ) : (
        <PauseCircle className="size-3.5" aria-hidden />
      )}
      <span>{active ? "فعال" : "متوقف"}</span>
    </span>
  );
}

export function OfferVisibilityBadge({ visible }: { visible: boolean }) {
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

export function OfferFeaturedBadge({ featured }: { featured: boolean }) {
  if (!featured) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-warning/40 bg-warning-subtle px-2 py-1 text-xs font-semibold text-warning-text">
      <Star className="size-3.5" aria-hidden />
      <span>مميز</span>
    </span>
  );
}
