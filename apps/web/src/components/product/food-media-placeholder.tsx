import { Film } from "lucide-react";
import { BrandPattern } from "@/components/brand/brand-pattern";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";

export type FoodMediaPlaceholderProps = {
  className?: string;
  label?: string;
  tone?: "cream" | "navy";
  /** Shifts framing copy/chrome toward kitchen media vs product photo */
  intent?: "product" | "reel" | "hero";
};

/**
 * Editorial media stand-in when a photo/thumbnail is not set yet.
 */
export function FoodMediaPlaceholder({
  className,
  label,
  tone = "cream",
  intent = "product",
}: FoodMediaPlaceholderProps) {
  const resolvedLabel =
    label ??
    (intent === "reel"
      ? "لقطة من المطبخ"
      : intent === "hero"
        ? "صورة الطبق المميز"
        : "صورة الطبق");

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        tone === "cream" ? "bg-surface-warm" : "bg-brand-navy",
        className,
      )}
      role="img"
      aria-label={resolvedLabel}
    >
      {tone === "cream" ? (
        <BrandPattern
          name="floral"
          opacity={0.07}
          className="absolute inset-0"
          hideIfMissing={false}
        />
      ) : null}

      <div
        className={cn(
          "absolute inset-3 border",
          tone === "cream" ? "border-border" : "border-on-dark/25",
        )}
        aria-hidden
      />
      <div
        className="absolute inset-y-10 start-3 w-0.5 bg-brand-primary/40"
        aria-hidden
      />

      <DecorativeMotif
        variant="floral-corner"
        density="subtle"
        tone={tone === "cream" ? "navy" : "muted"}
        className={cn(
          "absolute start-4 bottom-4 size-7 opacity-40",
          tone === "navy" && "text-on-dark/40",
        )}
      />

      {intent === "reel" ? (
        <>
          <DecorativeMotif
            variant="strip"
            density="subtle"
            tone="navy"
            className="absolute inset-x-0 top-0 opacity-40"
          />
          <Film
            className={cn(
              "absolute end-3 top-3 size-4",
              tone === "cream" ? "text-text-subtle" : "text-on-dark/50",
            )}
            strokeWidth={ICON_STROKE.default}
            aria-hidden
          />
        </>
      ) : null}

      <span
        className={cn(
          "typo-caption relative z-10 max-w-[11rem] rounded-sm px-3 py-1.5 text-center",
          tone === "cream"
            ? "bg-surface-warm/80 text-text-subtle"
            : "bg-brand-navy/50 text-on-dark/70",
        )}
      >
        {resolvedLabel}
      </span>
    </div>
  );
}
